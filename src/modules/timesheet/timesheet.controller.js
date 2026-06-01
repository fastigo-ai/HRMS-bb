import Timesheet from "./timesheet.model.js";
import User from "../auth/user.model.js";
import AppError from "../../utils/AppError.js";
import catchAsync from "../../utils/catchAsync.js";

// Retrieve all timesheets (with population)
export const getTimesheets = catchAsync(async (req, res, next) => {
  // #swagger.tags = ['Timesheets']
  let query = {};
  
  // Employees can only view their own timesheets
  if (req.user.role === "standard_employee") {
    query.employee = req.user.id;
  }

  const timesheets = await Timesheet.find(query)
    .populate("employee", "name email role empId position department")
    .sort("-createdAt");

  res.status(200).json({
    status: "success",
    results: timesheets.length,
    data: {
      timesheets,
    },
  });
});

// Submit a weekly timesheet entry
export const submitTimesheet = catchAsync(async (req, res, next) => {
  // #swagger.tags = ['Timesheets']
  const { weekEnding, totalHours, allocation, employeeId } = req.body;

  if (!weekEnding) {
    return next(new AppError("Week ending date is required!", 400));
  }

  // Determine who the timesheet is for (defaults to logged-in user unless an admin/manager specifies another)
  let targetEmployeeId = req.user.id;
  if (employeeId && ["manager", "hr_admin"].includes(req.user.role)) {
    targetEmployeeId = employeeId;
  }

  // Find or update timesheet to keep it unique per employee per week
  const timesheet = await Timesheet.findOneAndUpdate(
    { employee: targetEmployeeId, weekEnding },
    {
      totalHours: totalHours || 40,
      allocation: allocation || 100,
      status: "Pending" // Reset to pending on edit/submission
    },
    { new: true, upsert: true, runValidators: true }
  );

  const populated = await Timesheet.findById(timesheet._id).populate(
    "employee",
    "name email role empId position department"
  );

  res.status(200).json({
    status: "success",
    data: {
      timesheet: populated,
    },
  });
});

// Resolve timesheet (Approve / Reject) - restricted to managers and HR admins
export const resolveTimesheet = catchAsync(async (req, res, next) => {
  // #swagger.tags = ['Timesheets']
  const { status } = req.body;

  if (!status || !["Approved", "Rejected", "Pending"].includes(status)) {
    return next(new AppError("Please provide a valid resolution status (Approved/Rejected/Pending)!", 400));
  }

  const timesheet = await Timesheet.findById(req.params.id);
  if (!timesheet) {
    return next(new AppError("Timesheet not found!", 404));
  }

  timesheet.status = status;
  await timesheet.save();

  const populated = await Timesheet.findById(timesheet._id).populate(
    "employee",
    "name email role empId position department"
  );

  res.status(200).json({
    status: "success",
    data: {
      timesheet: populated,
    },
  });
});
