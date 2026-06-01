import mongoose from "mongoose";

const overtimeSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Overtime request must belong to an employee!"],
    },
    date: {
      type: Date,
      required: [true, "Overtime date is required!"],
    },
    hours: {
      type: Number,
      required: [true, "Overtime hours are required!"],
      min: [0.5, "Hours must be at least 30 minutes (0.5)!"],
    },
    reason: {
      type: String,
      required: [true, "Overtime reason is required!"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    approvedBy: {
      type: String,
      default: "Pending Review",
    },
  },
  {
    timestamps: true,
  }
);

const Overtime = mongoose.model("Overtime", overtimeSchema);

export default Overtime;
