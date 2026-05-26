import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Attendance record must belong to an employee!"],
    },
    date: {
      type: String, // Normalized to 'YYYY-MM-DD' for easy unique indexing per user per day
      required: [true, "Date is required!"],
    },
    clockIn: {
      type: Date,
      required: [true, "Clock in timestamp is required!"],
    },
    clockOut: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["Present", "Late", "Absent"],
      default: "Present",
    },
    isLate: {
      type: Boolean,
      default: false,
    },
    location: {
      type: String,
      default: "Headquarters",
    },
    mode: {
      type: String,
      enum: ["Office", "WFH", "Field"],
      default: "Office",
    },
    timeSpent: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Composite unique index so an employee can only have one attendance log per calendar date
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;
