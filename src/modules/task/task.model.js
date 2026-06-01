import mongoose from "mongoose";

const taskReportSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
  },
  dailyUpdate: {
    type: String,
    required: [true, "Daily update note is required!"],
  },
  workCompleted: {
    type: String,
    required: [true, "Work completed description is required!"],
  },
  issues: {
    type: String,
    default: "None",
  },
  timeSpent: {
    type: String,
    default: "",
  },
});

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "A task must have a title!"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    deadline: {
      type: String,
      required: [true, "A task must have a deadline!"],
    },
    category: {
      type: String,
      enum: ["Creative", "Engineering", "Product", "Backend", "Marketing", "Sales"],
      default: "Engineering",
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed", "Approved", "Reopened"],
      default: "Pending",
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "A task must have an assignee!"],
    },
    startTime: {
      type: Date,
    },
    notes: {
      type: String,
      default: "",
    },
    reports: [taskReportSchema],
    completionNotes: {
      type: String,
      default: "",
    },
    managerFeedback: {
      type: String,
      default: "",
    },
    finalReport: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Task = mongoose.model("Task", taskSchema);

export default Task;
