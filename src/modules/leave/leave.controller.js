import Leave from "./leave.model.js";
import User from "../auth/user.model.js";
import AppError from "../../utils/AppError.js";
import catchAsync from "../../utils/catchAsync.js";

// Helper to map UI leave types to DB user balance properties
const getBalanceKey = (type) => {
  if (type === "Sick Leave") return "sickLeave";
  if (type === "Casual Leave") return "casualLeave";
  if (type === "Paid Leave") return "paidLeave";
  return null;
};

// Apply for a new leave request (Deducts balance immediately)
export const applyLeave = catchAsync(async (req, res, next) => {
  // #swagger.tags = ['Leaves']
  const { type, startDate, endDate, reason } = req.body;

  if (!type || !startDate || !endDate || !reason) {
    return next(new AppError("Please provide all required fields (type, startDate, endDate, reason)!", 400));
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  const balanceKey = getBalanceKey(type);
  if (!balanceKey) {
    return next(new AppError("Invalid leave type!", 400));
  }

  // Reload user to get fresh balances
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new AppError("User not found!", 404));
  }

  if (user.leaveBalances[balanceKey] < diffDays) {
    return next(new AppError(`Insufficient ${type} balance. Requested: ${diffDays} day(s), Available: ${user.leaveBalances[balanceKey]} day(s).`, 400));
  }

  // Deduct leave balance
  user.leaveBalances[balanceKey] -= diffDays;
  await user.save({ validateBeforeSave: false });

  // Create leave request
  const newLeave = await Leave.create({
    employee: user._id,
    type,
    startDate,
    endDate,
    totalDays: diffDays,
    reason,
    status: "Pending",
    approvedBy: "Pending Review",
  });

  res.status(201).json({
    status: "success",
    data: {
      leave: newLeave,
      user, // Returns the updated profile with new balances!
    },
  });
});

// Get active employee's leave requests history
export const getMyLeaves = catchAsync(async (req, res, next) => {
  // #swagger.tags = ['Leaves']
  const leaves = await Leave.find({ employee: req.user.id }).sort("-createdAt");

  res.status(200).json({
    status: "success",
    results: leaves.length,
    data: {
      leaves,
    },
  });
});

// Retrieve all employee leave requests (restricted to HR / managers)
export const getAllLeaves = catchAsync(async (req, res, next) => {
  // #swagger.tags = ['Leaves']
  const leaves = await Leave.find()
    .populate("employee", "name email role empId position department")
    .sort("-createdAt");

  res.status(200).json({
    status: "success",
    results: leaves.length,
    data: {
      leaves,
    },
  });
});

// Resolve a pending leave request (Approved/Rejected)
export const resolveLeave = catchAsync(async (req, res, next) => {
  // #swagger.tags = ['Leaves']
  const { status } = req.body;
  if (!status || !["Approved", "Rejected"].includes(status)) {
    return next(new AppError("Please provide a valid status ('Approved' or 'Rejected')!", 400));
  }

  const leave = await Leave.findById(req.params.id);
  if (!leave) {
    return next(new AppError("Leave request not found!", 404));
  }

  if (leave.status !== "Pending") {
    return next(new AppError("This leave request has already been resolved!", 400));
  }

  leave.status = status;
  leave.approvedBy = req.user.name || req.user.role;

  // Refund leave balances if the request is Rejected
  if (status === "Rejected") {
    const employee = await User.findById(leave.employee);
    if (employee) {
      const balanceKey = getBalanceKey(leave.type);
      if (balanceKey) {
        employee.leaveBalances[balanceKey] += leave.totalDays;
        await employee.save({ validateBeforeSave: false });
      }
    }
  }

  await leave.save();

  res.status(200).json({
    status: "success",
    data: {
      leave,
    },
  });
});

export default { applyLeave, getMyLeaves, getAllLeaves, resolveLeave };
