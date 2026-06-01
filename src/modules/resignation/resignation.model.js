import mongoose from "mongoose";

const resignationSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Resignation must belong to an employee!"],
      unique: true,
    },
    resignationDate: {
      type: Date,
      default: Date.now,
    },
    lastWorkingDay: {
      type: Date,
      required: [true, "Last working day is required!"],
    },
    reason: {
      type: String,
      required: [true, "Reason for resignation is required!"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Completed"],
      default: "Pending",
    },
    clearanceIT: {
      type: String,
      enum: ["Pending", "Cleared", "Rejected"],
      default: "Pending",
    },
    clearanceFinance: {
      type: String,
      enum: ["Pending", "Cleared", "Rejected"],
      default: "Pending",
    },
    offboardingTasks: [
      {
        taskName: { type: String, required: true },
        completed: { type: Boolean, default: false },
        verifiedByHR: { type: Boolean, default: false },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Resignation = mongoose.model("Resignation", resignationSchema);

export default Resignation;
