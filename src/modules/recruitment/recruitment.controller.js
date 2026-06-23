import Job from "./job.model.js";
import JobApplication from "./application.model.js";
import Interview from "./interview.model.js";
import Candidate from "../candidate/candidate.model.js";
import AppError from "../../utils/AppError.js";
import catchAsync from "../../utils/catchAsync.js";
import { sendEmail } from "../../utils/email.js";

// Jobs CRUD
export const createJob = catchAsync(async (req, res, next) => {
  req.body.createdBy = req.user.id;
  const job = await Job.create(req.body);
  res.status(201).json({ status: "success", data: { job } });
});

export const getJobs = catchAsync(async (req, res, next) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  
  const jobs = await Job.find(filter).populate("department hiringManager").sort("-createdAt");
  
  // Aggregate application counts
  const applicationCounts = await JobApplication.aggregate([
    { $group: { _id: "$job", count: { $sum: 1 } } }
  ]);
  
  const jobsWithCounts = jobs.map(job => {
    const counts = applicationCounts.find(c => c._id.toString() === job._id.toString());
    return { ...job.toObject(), applicationsCount: counts ? counts.count : 0 };
  });

  res.status(200).json({ status: "success", results: jobs.length, data: { jobs: jobsWithCounts } });
});

export const getJob = catchAsync(async (req, res, next) => {
  const job = await Job.findById(req.params.id).populate("department hiringManager");
  if (!job) return next(new AppError("Job not found", 404));
  res.status(200).json({ status: "success", data: { job } });
});

export const updateJob = catchAsync(async (req, res, next) => {
  const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!job) return next(new AppError("Job not found", 404));
  res.status(200).json({ status: "success", data: { job } });
});

// Candidate CRUD
export const createCandidate = catchAsync(async (req, res, next) => {
  if (req.file) req.body.resumeUrl = req.file.path;
  
  // Check if candidate already exists by email
  let candidate = await Candidate.findOne({ email: req.body.email });
  
  if (candidate) {
    // Update existing candidate with latest info
    candidate = await Candidate.findByIdAndUpdate(candidate._id, req.body, { new: true, runValidators: true });
  } else {
    // Create new candidate
    candidate = await Candidate.create(req.body);
  }
  
  res.status(201).json({ status: "success", data: { candidate } });
});

export const getCandidates = catchAsync(async (req, res, next) => {
  const candidates = await Candidate.find().sort("-createdAt");
  res.status(200).json({ status: "success", results: candidates.length, data: { candidates } });
});

export const getCandidate = catchAsync(async (req, res, next) => {
  const candidate = await Candidate.findById(req.params.id);
  if (!candidate) return next(new AppError("Candidate not found", 404));
  res.status(200).json({ status: "success", data: { candidate } });
});

export const updateCandidate = catchAsync(async (req, res, next) => {
  if (req.file) req.body.resumeUrl = req.file.path;
  const candidate = await Candidate.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!candidate) return next(new AppError("Candidate not found", 404));
  res.status(200).json({ status: "success", data: { candidate } });
});

// Job Applications (Pipeline) CRUD
export const createApplication = catchAsync(async (req, res, next) => {
  const { jobId, candidateId, source, notes } = req.body;
  
  let application = await JobApplication.findOne({ job: jobId, candidate: candidateId });
  
  if (application) {
    // If they already applied, reset their application for testing purposes
    application.stage = "Applied";
    application.stageHistory.push({ stage: "Applied" });
    application.aiMatchScore = undefined;
    application.aiMatchReason = undefined;
    application.aiVoiceScreening = undefined;
    await application.save();
  } else {
    application = await JobApplication.create({
      job: jobId,
      candidate: candidateId,
      source,
      notes,
      stage: "Applied",
      stageHistory: [{ stage: "Applied" }]
    });
  }
  
  // Optional: send application received email
  const populatedApp = await JobApplication.findById(application._id).populate("candidate job");
  await sendEmail({
    email: populatedApp.candidate.email,
    subject: `Application Received: ${populatedApp.job.title}`,
    message: `Hi ${populatedApp.candidate.firstName},\n\nWe have received your application for ${populatedApp.job.title}. We will review it shortly.`,
    html: `<p>Hi ${populatedApp.candidate.firstName},</p><p>We have received your application for <strong>${populatedApp.job.title}</strong>. We will review it shortly.</p>`
  });

  res.status(201).json({ status: "success", data: { application } });
});

export const getJobApplications = catchAsync(async (req, res, next) => {
  const filter = {};
  if (req.query.jobId) filter.job = req.query.jobId;
  if (req.query.candidateId) filter.candidate = req.query.candidateId;
  
  const applications = await JobApplication.find(filter).populate("job candidate").sort("-createdAt");
  res.status(200).json({ status: "success", results: applications.length, data: { applications } });
});

export const updateApplicationStage = catchAsync(async (req, res, next) => {
  const { stage } = req.body;
  const application = await JobApplication.findById(req.params.id).populate("candidate job");
  
  if (!application) return next(new AppError("Application not found", 404));
  
  application.stage = stage;
  application.stageHistory.push({ stage, enteredAt: new Date() });
  await application.save();
  
  // Trigger Email Automations based on stage transitions
  if (stage === "Shortlisted") {
    await sendEmail({
      email: application.candidate.email,
      subject: `Update on your application: ${application.job.title}`,
      message: `Hi ${application.candidate.firstName},\n\nCongratulations! You have been shortlisted for the ${application.job.title} role. We will contact you soon for the next steps.`,
      html: `<p>Hi ${application.candidate.firstName},</p><p>Congratulations! You have been shortlisted for the <strong>${application.job.title}</strong> role. We will contact you soon for the next steps.</p>`
    });
  } else if (stage === "Rejected") {
    await sendEmail({
      email: application.candidate.email,
      subject: `Update on your application: ${application.job.title}`,
      message: `Hi ${application.candidate.firstName},\n\nThank you for applying to ${application.job.title}. Unfortunately, we will not be moving forward with your application at this time.`,
      html: `<p>Hi ${application.candidate.firstName},</p><p>Thank you for applying to <strong>${application.job.title}</strong>. Unfortunately, we will not be moving forward with your application at this time.</p>`
    });
    } else if (stage === "Offer Released") {
    await sendEmail({
      email: application.candidate.email,
      subject: `Offer Letter: ${application.job.title}`,
      message: `Hi ${application.candidate.firstName},\n\nWe are thrilled to offer you the position of ${application.job.title}. Please review the attached offer details.`,
      html: `<p>Hi ${application.candidate.firstName},</p><p>We are thrilled to offer you the position of <strong>${application.job.title}</strong>. We look forward to welcoming you to the team!</p>`
    });
  } else {
    // Check if the stage is one of the dynamic custom rounds
    const roundMatch = application.job.rounds?.find(r => r.name === stage);
    if (roundMatch && roundMatch.details) {
      await sendEmail({
        email: application.candidate.email,
        subject: `Next Steps: ${roundMatch.name} for ${application.job.title}`,
        message: `Hi ${application.candidate.firstName},\n\nYou have moved to the next stage: ${roundMatch.name}.\n\nHere are your instructions/details:\n${roundMatch.details}`,
        html: `<p>Hi ${application.candidate.firstName},</p><p>You have moved to the next stage: <strong>${roundMatch.name}</strong>.</p><p>Here are your instructions/details:</p><p style="white-space: pre-wrap;">${roundMatch.details}</p>`
      });
    }
  }

  
  res.status(200).json({ status: "success", data: { application } });
});

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

import { evaluateResume } from "../../utils/ai.service.js";

export const triggerAiMatch = catchAsync(async (req, res, next) => {
  const application = await JobApplication.findById(req.params.id).populate("candidate job");
  if (!application) return next(new AppError("Application not found", 404));

  if (!application.candidate.resumeUrl) {
    return next(new AppError("Candidate has no resume uploaded to analyze", 400));
  }

  try {
    // 1. Fetch PDF from Cloudinary URL
    const pdfResponse = await fetch(application.candidate.resumeUrl);
    if (!pdfResponse.ok) throw new Error("Failed to fetch resume file");
    
    const arrayBuffer = await pdfResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // 2. Parse PDF text
    const pdfData = await pdfParse(buffer);
    const resumeText = pdfData.text;

    // 3. Evaluate with Gemini
    const { job } = application;
    const aiResult = await evaluateResume(
      resumeText,
      job.title,
      job.description,
      job.skills,
      job.experience
    );

    // 4. Update Application
    application.aiMatchScore = aiResult.score;
    application.aiMatchReason = aiResult.reason;
    await application.save();

    // 5. Update Candidate Details with extracted data
    const candidate = application.candidate;
    let candidateUpdated = false;
    if (aiResult.phone && !candidate.phone) {
      candidate.phone = aiResult.phone;
      candidateUpdated = true;
    }
    if (aiResult.skills && aiResult.skills.length > 0 && (!candidate.skills || candidate.skills.length === 0)) {
      candidate.skills = aiResult.skills;
      candidateUpdated = true;
    }
    if (aiResult.experience && Array.isArray(aiResult.experience) && aiResult.experience.length > 0) {
      candidate.experience = aiResult.experience.map(e => `${e.jobTitle || 'Role'} at ${e.companyName || 'Company'}`).join(', ');
      candidateUpdated = true;
    }
    if (candidateUpdated) await candidate.save();

    // 6. Return response
    res.status(200).json({ status: "success", data: { application } });
  } catch (err) {
    console.error("AI Match Error:", err);
    return next(new AppError("Failed to perform AI ATS Matching: " + err.message, 500));
  }
});


// Interviews CRUD
export const scheduleInterview = catchAsync(async (req, res, next) => {
  const interview = await Interview.create(req.body);
  res.status(201).json({ status: "success", data: { interview } });
});

export const getInterviews = catchAsync(async (req, res, next) => {
  const interviews = await Interview.find().populate({
    path: "application",
    populate: { path: "candidate job" }
  }).populate("interviewer").sort("date");
  
  res.status(200).json({ status: "success", results: interviews.length, data: { interviews } });
});

export const submitInterviewFeedback = catchAsync(async (req, res, next) => {
  const interview = await Interview.findByIdAndUpdate(req.params.id, {
    feedback: req.body.feedback,
    rating: req.body.rating,
    recommendation: req.body.recommendation,
    status: "Completed"
  }, { new: true });
  
  if (!interview) return next(new AppError("Interview not found", 404));
  res.status(200).json({ status: "success", data: { interview } });
});

// Analytics Dashboard
export const getAnalytics = catchAsync(async (req, res, next) => {
  const totalJobs = await Job.countDocuments();
  const openPositions = await Job.aggregate([
    { $match: { status: "Published" } },
    { $group: { _id: null, total: { $sum: "$openings" } } }
  ]);
  
  const totalCandidates = await Candidate.countDocuments();
  const totalApplications = await JobApplication.countDocuments();
  
  const applicationsByStage = await JobApplication.aggregate([
    { $group: { _id: "$stage", count: { $sum: 1 } } }
  ]);
  
  const applicationsBySource = await JobApplication.aggregate([
    { $group: { _id: "$source", count: { $sum: 1 } } }
  ]);
  
  res.status(200).json({ 
    status: "success", 
    data: { 
      metrics: {
        totalJobs,
        openPositions: openPositions[0]?.total || 0,
        totalCandidates,
        totalApplications,
        applicationsByStage,
        applicationsBySource
      } 
    } 
  });
});

import { createVoiceInterview } from "../../utils/omnidimension.service.js";
import VoiceInterview from "./voiceInterview.model.js";

export const triggerVoiceScreening = catchAsync(async (req, res, next) => {
  const application = await JobApplication.findById(req.params.id).populate("candidate job");
  if (!application) return next(new AppError("Application not found", 404));

  if (!application.job.voiceScreening?.enabled) {
    return next(new AppError("Voice screening is not enabled for this job", 400));
  }

  // Ensure it's not already running or completed
  if (["in_progress", "completed"].includes(application.aiVoiceScreening?.status)) {
    return next(new AppError(`Voice screening is already ${application.aiVoiceScreening.status}`, 400));
  }

  // Trigger Omnidimension Call
  try {
    const callId = await createVoiceInterview({
      candidateName: application.candidate.firstName + ' ' + application.candidate.lastName,
      candidatePhone: application.candidate.phone,
      jobTitle: application.job.title,
      questions: application.job.voiceScreening.questions,
      applicationId: application._id.toString(),
      candidateExperience: application.candidate.experience || [],
      candidateSkills: application.candidate.skills || [],
      aiMatchScore: application.aiMatchScore
    });

    // Save Call ID and Update Status
    application.aiVoiceScreening = {
      ...application.aiVoiceScreening,
      status: "in_progress",
      callId
    };
    await application.save();

    // Create Interview Record
    await VoiceInterview.create({
      application: application._id,
      candidate: application.candidate._id,
      job: application.job._id,
      callId,
      status: "in_progress"
    });

    res.status(200).json({ status: "success", message: "Voice screening initiated", data: { callId } });
  } catch (error) {
    application.aiVoiceScreening = { ...application.aiVoiceScreening, status: "failed" };
    await application.save();
    return next(new AppError("Failed to initiate voice screening: " + error.message, 500));
  }
});

// Manual Sync for Voice Screening
export const syncVoiceScreening = catchAsync(async (req, res, next) => {
  const application = await JobApplication.findById(req.params.id).populate("candidate job");
  if (!application || !application.aiVoiceScreening?.callId) {
    return next(new AppError("No active voice screening found for this application", 404));
  }

  const { getCallLog } = await import("../../utils/omnidimension.service.js");
  const { evaluateVoiceTranscript } = await import("../../utils/voiceEvaluation.service.js");
  const VoiceInterview = (await import("./voiceInterview.model.js")).default;
  const { sendEmail } = await import("../../utils/email.js");

  const callLog = await getCallLog(application.aiVoiceScreening.callId);

  // Status can be 'in_progress', 'ringing', 'completed', 'failed', etc.
  // Omnidimension typically returns completed call logs with properties like duration, recording_url
  if (callLog.status?.toLowerCase() === "completed" || (callLog.duration !== undefined && callLog.duration > 0)) {
    const interviewRecord = await VoiceInterview.findOne({ callId: application.aiVoiceScreening.callId });
    
    if (interviewRecord) {
      interviewRecord.status = "completed";
      interviewRecord.callDurationSeconds = callLog.duration || 0;
      interviewRecord.recordingUrl = callLog.recording_url || callLog.audio_url || "";
      interviewRecord.transcript = callLog.transcript || "";
      await interviewRecord.save();
    }

    try {
      const evaluation = await evaluateVoiceTranscript(
        application.job.description, 
        application.job.voiceScreening.questions, 
        callLog.transcript || ""
      );

      const isPass = evaluation.score >= application.job.voiceScreening.autoRejectThreshold;
      const newStage = isPass ? "Screening" : "Rejected";

      application.aiVoiceScreening = {
        ...application.aiVoiceScreening,
        status: "completed",
        score: evaluation.score,
        recommendation: evaluation.recommendation,
        summary: evaluation.summary,
        transcript: callLog.transcript || "",
        recordingUrl: callLog.recording_url || callLog.audio_url || "",
        callDuration: callLog.duration || 0,
        completedAt: new Date()
      };
      
      application.stage = newStage;
      application.stageHistory.push({ stage: newStage, enteredAt: new Date() });
      await application.save();

      if (interviewRecord) {
        interviewRecord.evaluationResult = evaluation;
        await interviewRecord.save();
      }

      if (isPass) {
        await sendEmail({
          email: application.candidate.email,
          subject: `Update on your application: ${application.job.title}`,
          message: `Hi ${application.candidate.firstName},\n\nCongratulations! You have successfully cleared the AI Voice Screening round. Our recruiter will reach out to you shortly.`,
        });
      } else {
        await sendEmail({
          email: application.candidate.email,
          subject: `Update on your application: ${application.job.title}`,
          message: `Hi ${application.candidate.firstName},\n\nThank you for taking the time to complete the screening. Unfortunately, we will not be proceeding further at this stage.`,
        });
      }

      return res.status(200).json({ status: "success", data: { application, callStatus: "completed" } });
    } catch (error) {
      console.error("[Sync] Error evaluating transcript:", error);
      return next(new AppError("Failed to evaluate transcript", 500));
    }
  }

  res.status(200).json({ status: "success", data: { application, callStatus: callLog.status } });
});
