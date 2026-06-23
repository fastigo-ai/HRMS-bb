import mongoose from "mongoose";

const voiceInterviewSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.ObjectId,
      ref: "JobApplication",
      required: true,
    },
    candidate: {
      type: mongoose.Schema.ObjectId,
      ref: "Candidate",
      required: true,
    },
    job: {
      type: mongoose.Schema.ObjectId,
      ref: "Job",
      required: true,
    },
    callId: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "failed"],
      default: "pending",
    },
    transcript: {
      type: String,
    },
    recordingUrl: {
      type: String,
    },
    callDurationSeconds: {
      type: Number,
    },
    evaluationResult: {
      score: Number,
      communicationScore: Number,
      technicalScore: Number,
      strengths: [String],
      weaknesses: [String],
      recommendation: {
        type: String,
        enum: ["SHORTLIST", "REJECT"],
      },
      summary: String,
    },
    rawOmnidimensionPayload: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

const VoiceInterview = mongoose.model("VoiceInterview", voiceInterviewSchema);
export default VoiceInterview;
