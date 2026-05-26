import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Leave request must belong to an employee!"],
    },
    type: {
      type: String,
      required: [true, "Leave type is required!"],
      enum: ["Sick Leave", "Casual Leave", "Paid Leave"],
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required!"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required!"],
    },
    totalDays: {
      type: Number,
      required: [true, "Total days is required!"],
    },
    reason: {
      type: String,
      required: [true, "Leave reason is required!"],
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

const Leave = mongoose.model("Leave", leaveSchema);

export default Leave;
