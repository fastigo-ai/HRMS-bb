import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Candidate name is required!"],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      required: [true, "Candidate target role is required!"],
      trim: true,
    },
    source: {
      type: String,
      enum: ["LinkedIn Outbound", "Employee Referral", "Careers Portal", "Agency", "Direct Application"],
      default: "LinkedIn Outbound",
    },
    stage: {
      type: String,
      enum: ["Applied", "Screening", "Technical Round", "Manager Round", "Offer Extended", "Hired", "Rejected"],
      default: "Applied",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
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
    hiredAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Candidate = mongoose.model("Candidate", candidateSchema);

export default Candidate;
