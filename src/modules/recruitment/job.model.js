import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },
    department: {
      type: mongoose.Schema.ObjectId,
      ref: "Department",
    },
    employmentType: {
      type: String,
      enum: ["Full-time", "Contract", "Internship", "Part-time"],
      default: "Full-time",
    },
    location: {
      type: String,
      default: "Remote",
    },
    experience: {
      type: String,
      default: "0-2 Years",
    },
    salaryRange: {
      type: String,
      default: "Not Disclosed",
    },
    openings: {
      type: Number,
      default: 1,
    },
    skills: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
    },
    rounds: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        details: {
          type: String,
          default: "",
        },
      }
    ],
    voiceScreening: {
      enabled: { type: Boolean, default: false },
      autoRejectThreshold: { type: Number, default: 70 },
      questions: [
        {
          question: { type: String, required: true },
          weight: { type: Number, default: 1 },
          expectedKeywords: { type: [String], default: [] }
        }
      ]
    },
    status: {
      type: String,
      enum: ["Draft", "Published", "Closed"],
      default: "Draft",
    },
    hiringManager: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    applicationDeadline: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Job = mongoose.model("Job", jobSchema);
export default Job;
