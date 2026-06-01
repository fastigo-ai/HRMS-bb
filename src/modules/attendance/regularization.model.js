import mongoose from "mongoose";

const regularizationSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Regularization request must belong to an employee!"],
    },
    attendanceDate: {
      type: Date,
      required: [true, "Attendance date is required!"],
    },
    requestedCheckIn: {
      type: String,
      required: [true, "Requested check-in time is required!"],
    },
    requestedCheckOut: {
      type: String,
      required: [true, "Requested check-out time is required!"],
    },
    reason: {
      type: String,
      required: [true, "Regularization reason is required!"],
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

const Regularization = mongoose.model("Regularization", regularizationSchema);

export default Regularization;
