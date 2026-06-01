import Task from "./task.model.js";
import User from "../auth/user.model.js";
import Notification from "../notification/notification.model.js";
import AppError from "../../utils/AppError.js";
import catchAsync from "../../utils/catchAsync.js";

// Helper to format task object for frontend compatibility (assignee populated to string name)
const formatTask = (task) => {
  const taskObj = task.toObject();
  if (taskObj.assignee && typeof taskObj.assignee === "object" && taskObj.assignee.name) {
    taskObj.assignee = taskObj.assignee.name;
  }
  
  // Re-map internal Mongo _id to standard 'id' for frontend expectation if needed
  taskObj.id = taskObj._id;
  
  return taskObj;
};

// Retrieve all tasks
export const getTasks = catchAsync(async (req, res, next) => {
  // #swagger.tags = ['Tasks']
  let query = {};
  
  // Standard employees can only view tasks assigned to them
  if (req.user.role === "standard_employee") {
    query.assignee = req.user.id;
  }
  
  const tasks = await Task.find(query)
    .populate("assignee", "name email position department")
    .sort("-createdAt");

  const formattedTasks = tasks.map(formatTask);

  res.status(200).json({
    status: "success",
    results: formattedTasks.length,
    data: {
      tasks: formattedTasks,
    },
  });
});

// Create new task (restricted to managers and HR)
export const createTask = catchAsync(async (req, res, next) => {
  // #swagger.tags = ['Tasks']
  const { title, description, priority, deadline, category, assignee } = req.body;

  if (!title || !deadline || !assignee) {
    return next(new AppError("Title, deadline, and assignee parameters are required!", 400));
  }

  // Find the user by name since the frontend posts the string name (e.g. 'Alex Johnson')
  const assignedUser = await User.findOne({ name: assignee });
  if (!assignedUser) {
    return next(new AppError(`No team member found with name '${assignee}'!`, 404));
  }

  const newTask = await Task.create({
    title,
    description,
    priority,
    deadline,
    category,
    assignee: assignedUser._id,
    status: "Pending",
    progress: 0,
  });

  // Create database notification for assigned employee
  await Notification.create({
    recipient: assignedUser._id,
    title: `New Task Assigned: ${title}`,
    message: `Manager ${req.user.name} assigned you a new task: "${title}". Deadline: ${deadline}.`,
    category: "task",
    priority: priority.toLowerCase(),
  });

  const populated = await Task.findById(newTask._id).populate("assignee", "name email");

  res.status(201).json({
    status: "success",
    data: {
      task: formatTask(populated),
    },
  });
});

// Start a Task (changes status to 'In Progress' and sets startTime)
export const startTask = catchAsync(async (req, res, next) => {
  // #swagger.tags = ['Tasks']
  const task = await Task.findById(req.params.id);
  if (!task) {
    return next(new AppError("Task not found!", 404));
  }

  // Verify authorization: only the assignee (or manager) can start it
  if (req.user.role === "standard_employee" && task.assignee.toString() !== req.user.id) {
    return next(new AppError("You do not have permission to modify this task!", 403));
  }

  task.status = "In Progress";
  task.startTime = new Date();
  await task.save();

  const populated = await Task.findById(task._id).populate("assignee", "name email");

  res.status(200).json({
    status: "success",
    data: {
      task: formatTask(populated),
    },
  });
});

// Add Daily Work Report
export const addWorkReport = catchAsync(async (req, res, next) => {
  // #swagger.tags = ['Tasks']
  const { dailyUpdate, workCompleted, issues = "None", timeSpent = "" } = req.body;
  
  if (!dailyUpdate || !workCompleted) {
    return next(new AppError("Daily update and work completed description are required!", 400));
  }

  const task = await Task.findById(req.params.id);
  if (!task) {
    return next(new AppError("Task not found!", 404));
  }

  if (req.user.role === "standard_employee" && task.assignee.toString() !== req.user.id) {
    return next(new AppError("You do not have permission to log updates on this task!", 403));
  }

  // Append report
  task.reports.push({
    dailyUpdate,
    workCompleted,
    issues,
    timeSpent,
    timestamp: new Date(),
  });

  // Increment progress incrementally (capped at 100)
  task.progress = Math.min(task.progress + 10, 100);
  await task.save();

  const populated = await Task.findById(task._id).populate("assignee", "name email");

  res.status(200).json({
    status: "success",
    data: {
      task: formatTask(populated),
    },
  });
});

// Complete Task (submit to manager for review approval)
export const completeTask = catchAsync(async (req, res, next) => {
  // #swagger.tags = ['Tasks']
  const { notes = "" } = req.body;

  const task = await Task.findById(req.params.id);
  if (!task) {
    return next(new AppError("Task not found!", 404));
  }

  if (req.user.role === "standard_employee" && task.assignee.toString() !== req.user.id) {
    return next(new AppError("You do not have permission to complete this task!", 403));
  }

  task.status = "Completed";
  task.progress = 100;
  task.completionNotes = notes;
  task.finalReport = notes;
  await task.save();

  // Find all managers to notify them
  const managers = await User.find({ role: "manager" });
  for (const manager of managers) {
    await Notification.create({
      recipient: manager._id,
      title: `Task Completed: ${task.title}`,
      message: `Employee ${req.user.name} has completed the task "${task.title}". Notes: "${notes}"`,
      category: "task",
      priority: "normal",
    });
  }

  const populated = await Task.findById(task._id).populate("assignee", "name email");

  res.status(200).json({
    status: "success",
    data: {
      task: formatTask(populated),
    },
  });
});

// Resolve Task (Manager approves task or reopens it with feedback)
export const resolveTask = catchAsync(async (req, res, next) => {
  // #swagger.tags = ['Tasks']
  const { status, feedbackNotes = "" } = req.body;

  if (!status || !["Approved", "Reopened"].includes(status)) {
    return next(new AppError("Resolution status must be either 'Approved' or 'Reopened'!", 400));
  }

  const task = await Task.findById(req.params.id);
  if (!task) {
    return next(new AppError("Task not found!", 404));
  }

  // Verify manager permissions
  if (req.user.role !== "manager" && req.user.role !== "hr_admin") {
    return next(new AppError("Only managers can review and resolve task completions!", 403));
  }

  task.status = status;
  task.managerFeedback = feedbackNotes;
  
  if (status === "Reopened") {
    task.progress = 90; // reset to 90% for rework
  }
  
  await task.save();

  // Create database notification for assigned employee
  await Notification.create({
    recipient: task.assignee,
    title: `Task Review: ${status}`,
    message: `Manager ${req.user.name} has ${status.toLowerCase()}ed your task "${task.title}". Feedback: "${feedbackNotes || 'No comments'}"`,
    category: "task",
    priority: status === "Reopened" ? "high" : "normal",
  });

  const populated = await Task.findById(task._id).populate("assignee", "name email");

  res.status(200).json({
    status: "success",
    data: {
      task: formatTask(populated),
    },
  });
});

// Update an existing task (restricted to managers and HR)
export const updateTask = catchAsync(async (req, res, next) => {
  // #swagger.tags = ['Tasks']
  const task = await Task.findById(req.params.id);
  if (!task) {
    return next(new AppError("Task not found!", 404));
  }

  const { title, description, priority, deadline, category, assignee, status } = req.body;

  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (priority !== undefined) task.priority = priority;
  if (deadline !== undefined) task.deadline = deadline;
  if (category !== undefined) task.category = category;
  if (status !== undefined) task.status = status;

  if (assignee !== undefined) {
    const assignedUser = await User.findOne({ name: assignee });
    if (!assignedUser) {
      return next(new AppError(`No team member found with name '${assignee}'!`, 404));
    }
    task.assignee = assignedUser._id;
  }

  await task.save();

  const populated = await Task.findById(task._id).populate("assignee", "name email");

  res.status(200).json({
    status: "success",
    data: {
      task: formatTask(populated),
    },
  });
});

// Delete a task (restricted to managers and HR)
export const deleteTask = catchAsync(async (req, res, next) => {
  // #swagger.tags = ['Tasks']
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) {
    return next(new AppError("Task not found!", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});
