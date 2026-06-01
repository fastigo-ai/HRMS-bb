import mongoose from "mongoose";

const timesheetSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "A timesheet must belong to an employee!"],
    },
    weekEnding: {
      type: String,
      required: [true, "A timesheet must specify a week ending date!"],
    },
    totalHours: {
      type: Number,
      default: 40,
    },
    allocation: {
      type: Number,
      default: 100, // percentage allocation, e.g. 80%
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index per employee per weekEnding date to prevent duplicates
timesheetSchema.index({ employee: 1, weekEnding: 1 }, { unique: true });

const Timesheet = mongoose.model("Timesheet", timesheetSchema);

export default Timesheet;
