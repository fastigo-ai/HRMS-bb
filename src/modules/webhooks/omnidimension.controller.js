import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
import JobApplication from "../recruitment/application.model.js";
import VoiceInterview from "../recruitment/voiceInterview.model.js";
import { evaluateVoiceTranscript } from "../../utils/voiceEvaluation.service.js";
import { sendEmail } from "../../utils/email.js";

/**
 * Webhook listener for Omnidimension events.
 * Handles "call.completed" to fetch transcript, evaluate via Gemini, and auto-route candidate.
 */
export const handleWebhook = catchAsync(async (req, res, next) => {
  const { event, data } = req.body;
  
  // Return early for irrelevant events
  if (event !== "call.completed") {
    return res.status(200).json({ received: true });
  }

  const { call_id, application_id, duration, recording_url, transcript } = data;

  const application = await JobApplication.findById(application_id).populate("job candidate");
  if (!application) {
    console.error(`[Webhook] Application ${application_id} not found.`);
    return res.status(404).json({ message: "Application not found" });
  }

  const interviewRecord = await VoiceInterview.findOne({ callId: call_id });
  if (!interviewRecord) {
    console.error(`[Webhook] VoiceInterview record not found for call ${call_id}`);
  }

  // Update interview record immediately with raw data
  if (interviewRecord) {
    interviewRecord.status = "completed";
    interviewRecord.callDurationSeconds = duration;
    interviewRecord.recordingUrl = recording_url;
    interviewRecord.transcript = transcript;
    interviewRecord.rawOmnidimensionPayload = req.body;
    await interviewRecord.save();
  }

  try {
    // 1. Evaluate Transcript with Gemini
    const evaluation = await evaluateVoiceTranscript(
      application.job.description, 
      application.job.voiceScreening.questions, 
      transcript
    );

    // 2. Determine Pass/Fail based on Auto-Reject Threshold
    const isPass = evaluation.score >= application.job.voiceScreening.autoRejectThreshold;
    const newStage = isPass ? "Screening" : "Rejected";

    // 3. Update Application Stage and Results
    application.aiVoiceScreening = {
      ...application.aiVoiceScreening,
      status: "completed",
      score: evaluation.score,
      recommendation: evaluation.recommendation,
      summary: evaluation.summary,
      transcript: transcript,
      recordingUrl: recording_url,
      callDuration: duration,
      completedAt: new Date()
    };
    
    application.stage = newStage;
    application.stageHistory.push({ stage: newStage, enteredAt: new Date() });
    await application.save();

    // 4. Update Interview Record with Evaluation
    if (interviewRecord) {
      interviewRecord.evaluationResult = evaluation;
      await interviewRecord.save();
    }

    // 5. Automated Email Routing
    if (isPass) {
      await sendEmail({
        email: application.candidate.email,
        subject: `Update on your application: ${application.job.title}`,
        message: `Hi ${application.candidate.firstName},\n\nCongratulations! You have successfully cleared the AI Voice Screening round. Our recruiter will reach out to you shortly.`,
        html: `<p>Hi ${application.candidate.firstName},</p><p>Congratulations! You have successfully cleared the AI Voice Screening round. Our recruiter will reach out to you shortly.</p>`
      });
    } else {
      await sendEmail({
        email: application.candidate.email,
        subject: `Update on your application: ${application.job.title}`,
        message: `Hi ${application.candidate.firstName},\n\nThank you for taking the time to complete the screening. Unfortunately, we will not be proceeding further at this stage.`,
        html: `<p>Hi ${application.candidate.firstName},</p><p>Thank you for taking the time to complete the screening. Unfortunately, we will not be proceeding further at this stage.</p>`
      });
    }

    console.log(`[Webhook] Processed call ${call_id}. Candidate scored ${evaluation.score}. Action: ${newStage}`);
    res.status(200).json({ received: true, action: newStage });

  } catch (error) {
    console.error(`[Webhook] Error evaluating transcript:`, error);
    // Mark as failed so HR knows to review manually
    application.aiVoiceScreening.status = "failed";
    await application.save();
    return next(new AppError("Failed to evaluate transcript", 500));
  }
});
