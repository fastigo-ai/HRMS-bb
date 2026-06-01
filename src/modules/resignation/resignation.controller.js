import Resignation from "./resignation.model.js";
import User from "../auth/user.model.js";
import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";

export const submitResignation = catchAsync(async (req, res, next) => {
  const { lastWorkingDay, reason } = req.body;

  if (!lastWorkingDay || !reason) {
    return next(new AppError("Please provide both proposed last working day and reason!", 400));
  }

  const existing = await Resignation.findOne({ employee: req.user.id });
  if (existing) {
    return next(new AppError("You have already filed a resignation request!", 400));
  }

  const newRes = await Resignation.create({
    employee: req.user.id,
    lastWorkingDay: new Date(lastWorkingDay),
    reason,
    offboardingTasks: [
      { taskName: "Return laptop and security tokens", completed: false },
      { taskName: "Deactivate corporate email & VPN credentials", completed: false },
      { taskName: "Conduct exit interview & collect feedback", completed: false },
      { taskName: "Finalize salary settlement & outstanding claims", completed: false },
    ],
  });

  res.status(201).json({
    status: "success",
    data: {
      resignation: newRes,
    },
  });
});

export const getMyResignationStatus = catchAsync(async (req, res, next) => {
  const resignation = await Resignation.findOne({ employee: req.user.id });

  res.status(200).json({
    status: "success",
    data: {
      resignation: resignation || null,
    },
  });
});

export const getAllResignations = catchAsync(async (req, res, next) => {
  const resignations = await Resignation.find()
    .populate("employee", "name position department empId email phone")
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: resignations.length,
    data: {
      resignations,
    },
  });
});

export const resolveResignationStatus = catchAsync(async (req, res, next) => {
  const { status, lastWorkingDay } = req.body;

  if (!["Approved", "Rejected", "Completed"].includes(status)) {
    return next(new AppError("Please provide a valid resignation status (Approved, Rejected, Completed)!", 400));
  }

  const resignation = await Resignation.findById(req.params.id);
  if (!resignation) {
    return next(new AppError("No resignation file found with that ID!", 404));
  }

  resignation.status = status;
  if (lastWorkingDay) {
    resignation.lastWorkingDay = new Date(lastWorkingDay);
  }

  await resignation.save();

  // If status is Completed, mark user status to Resigned/Inactive if needed
  if (status === "Completed") {
    const user = await User.findById(resignation.employee);
    if (user) {
      // In this setup, let's keep status update or log it
      user.status = "Resigned"; 
      await user.save({ validateBeforeSave: false });
    }
  }

  res.status(200).json({
    status: "success",
    data: {
      resignation,
    },
  });
});

export const toggleClearanceStep = catchAsync(async (req, res, next) => {
  const { field, val, taskIndex, taskCompleted, taskVerified } = req.body;

  const resignation = await Resignation.findById(req.params.id);
  if (!resignation) {
    return next(new AppError("No resignation file found with that ID!", 404));
  }

  if (field === "clearanceIT") {
    resignation.clearanceIT = val;
  } else if (field === "clearanceFinance") {
    resignation.clearanceFinance = val;
  }

  // Handle offboarding checklist updates
  if (taskIndex !== undefined) {
    if (resignation.offboardingTasks[taskIndex]) {
      if (taskCompleted !== undefined) {
        resignation.offboardingTasks[taskIndex].completed = !!taskCompleted;
      }
      if (taskVerified !== undefined) {
        resignation.offboardingTasks[taskIndex].verifiedByHR = !!taskVerified;
      }
    }
  }

  await resignation.save();

  res.status(200).json({
    status: "success",
    data: {
      resignation,
    },
  });
});
