import mongoose from "mongoose";

const wfhSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "WFH request must belong to an employee!"],
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required!"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required!"],
    },
    type: {
      type: String,
      enum: ["Full Day", "Half Day - AM", "Half Day - PM"],
      default: "Full Day",
    },
    reason: {
      type: String,
      required: [true, "WFH reason is required!"],
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

const WFH = mongoose.model("WFH", wfhSchema);

export default WFH;
