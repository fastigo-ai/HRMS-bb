import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A lead must have a name!"],
      trim: true,
    },
    company: {
      type: String,
      required: [true, "A lead must have a company!"],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    source: {
      type: String,
      default: "LinkedIn Outbound",
    },
    status: {
      type: String,
      enum: ["Lead", "Contacted", "Qualified", "Meeting Scheduled", "Negotiation", "Closed Won", "Closed Lost"],
      default: "Lead",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    next_followup: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "A lead must be assigned to an employee rep!"],
    },
  },
  {
    timestamps: true,
  }
);

const Lead = mongoose.model("Lead", leadSchema);

export default Lead;
