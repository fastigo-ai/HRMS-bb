import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.ObjectId,
      ref: "JobApplication",
      required: true,
    },
    interviewer: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String, // e.g. "14:30"
      required: true,
    },
    meetingLink: {
      type: String,
      default: "",
    },
    feedback: {
      communication: { type: Number, min: 1, max: 5 },
      technical: { type: Number, min: 1, max: 5 },
      problemSolving: { type: Number, min: 1, max: 5 },
      notes: { type: String, default: "" },
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    recommendation: {
      type: String,
      enum: ["Hire", "Strong Hire", "Hold", "Reject"],
    },
    status: {
      type: String,
      enum: ["Scheduled", "Completed", "Cancelled"],
      default: "Scheduled",
    },
  },
  {
    timestamps: true,
  }
);

const Interview = mongoose.model("Interview", interviewSchema);
export default Interview;
