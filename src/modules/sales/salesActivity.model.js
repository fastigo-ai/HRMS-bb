import mongoose from "mongoose";

const salesActivitySchema = new mongoose.Schema(
  {
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
    },
    leadName: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["call", "email", "proposal", "meeting", "lead_add", "pipeline"],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      default: "N/A",
    },
    outcome: {
      type: String,
      default: "",
    },
    verified: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "An activity must be logged by an active employee rep!"],
    },
  },
  {
    timestamps: true,
  }
);

const SalesActivity = mongoose.model("SalesActivity", salesActivitySchema);

export default SalesActivity;
