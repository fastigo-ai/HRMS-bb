import Onboarding from "./onboarding.model.js";
import User from "../auth/user.model.js";
import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";

const DEFAULT_ONBOARDING_TASKS = [
  { taskKey: "id_docs", label: "Upload Aadhaar & PAN Card for identity verification" },
  { taskKey: "agreement", label: "Sign and submit Employment Agreement" },
  { taskKey: "credentials", label: "Collect dynamic corporate email & VPN credentials" },
  { taskKey: "assets", label: "Receive enterprise laptop & hardware assets" },
  { taskKey: "policies", label: "Complete compliance, code of conduct & safety training" },
  { taskKey: "manager_sync", label: "Initial onboarding sync with reporting manager" },
];

export const initializeOnboarding = catchAsync(async (req, res, next) => {
  const { employeeId } = req.body;

  if (!employeeId) {
    return next(new AppError("Please provide the employee ID to initialize onboarding!", 400));
  }

  const user = await User.findById(employeeId);
  if (!user) {
    return next(new AppError("User not found!", 404));
  }

  let onboarding = await Onboarding.findOne({ employee: employeeId });
  if (onboarding) {
    return res.status(200).json({
      status: "success",
      message: "Onboarding was already initialized.",
      data: { onboarding },
    });
  }

  onboarding = await Onboarding.create({
    employee: employeeId,
    tasks: DEFAULT_ONBOARDING_TASKS,
  });

  res.status(201).json({
    status: "success",
    data: {
      onboarding,
    },
  });
});

export const getOnboardingProgress = catchAsync(async (req, res, next) => {
  // If target employee is provided, verify HR admin, else fetch req.user.id
  const empId = req.query.employeeId || req.user.id;

  let onboarding = await Onboarding.findOne({ employee: empId });

  // Auto-initialize if it doesn't exist for standard employees
  if (!onboarding && empId === req.user.id) {
    onboarding = await Onboarding.create({
      employee: req.user.id,
      tasks: DEFAULT_ONBOARDING_TASKS,
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      onboarding: onboarding || null,
    },
  });
});

export const toggleOnboardingTask = catchAsync(async (req, res, next) => {
  const { taskKey, completed } = req.body;

  if (!taskKey) {
    return next(new AppError("Please specify the taskKey to toggle!", 400));
  }

  const onboarding = await Onboarding.findOne({ employee: req.user.id });
  if (!onboarding) {
    return next(new AppError("No active onboarding checklist found for you!", 404));
  }

  const task = onboarding.tasks.find((t) => t.taskKey === taskKey);
  if (!task) {
    return next(new AppError("Task not found in your onboarding checklist!", 404));
  }

  task.completed = !!completed;
  await onboarding.save();

  res.status(200).json({
    status: "success",
    data: {
      onboarding,
    },
  });
});

export const verifyOnboardingTask = catchAsync(async (req, res, next) => {
  const { id } = req.params; // onboarding record ID
  const { taskKey, verifiedByHR, completed } = req.body;

  if (!taskKey) {
    return next(new AppError("Please specify the taskKey to verify!", 400));
  }

  const onboarding = await Onboarding.findById(id);
  if (!onboarding) {
    return next(new AppError("No onboarding record found with that ID!", 404));
  }

  const task = onboarding.tasks.find((t) => t.taskKey === taskKey);
  if (!task) {
    return next(new AppError("Task not found in onboarding checklist!", 404));
  }

  if (verifiedByHR !== undefined) {
    task.verifiedByHR = !!verifiedByHR;
  }
  if (completed !== undefined) {
    task.completed = !!completed;
  }

  await onboarding.save();

  res.status(200).json({
    status: "success",
    data: {
      onboarding,
    },
  });
});

export const getAllOnboardings = catchAsync(async (req, res, next) => {
  const onboardings = await Onboarding.find()
    .populate("employee", "name position department empId email")
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: onboardings.length,
    data: {
      onboardings,
    },
  });
});
