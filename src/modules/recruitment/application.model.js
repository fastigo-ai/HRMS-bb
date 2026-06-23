import mongoose from "mongoose";

const jobApplicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.ObjectId,
      ref: "Job",
      required: true,
    },
    candidate: {
      type: mongoose.Schema.ObjectId,
      ref: "Candidate",
      required: true,
    },
    stage: {
      type: String,
      default: "Applied",
    },
    source: {
      type: String,
      enum: ["LinkedIn Outbound", "Employee Referral", "Careers Portal", "Agency", "Direct Application", "Other"],
      default: "Careers Portal",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    aiMatchScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    aiMatchReason: {
      type: String,
    },
    aiVoiceScreening: {
      status: {
        type: String,
        enum: ["pending", "in_progress", "completed", "failed"],
        default: "pending"
      },
      callId: String,
      score: Number,
      recommendation: {
        type: String,
        enum: ["SHORTLIST", "REJECT"]
      },
      summary: String,
      transcript: String,
      recordingUrl: String,
      callDuration: Number,
      completedAt: Date
    },
    stageHistory: [
      {
        stage: {
          type: String,
          required: true,
        },
        enteredAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const JobApplication = mongoose.model("JobApplication", jobApplicationSchema);
export default JobApplication;
