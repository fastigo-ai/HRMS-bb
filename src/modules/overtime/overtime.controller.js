import Overtime from "./overtime.model.js";
import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";

export const createOvertimeRequest = catchAsync(async (req, res, next) => {
  const { date, hours, reason } = req.body;

  if (!date || !hours || !reason) {
    return next(new AppError("Please provide all required fields (date, hours, reason)!", 400));
  }

  const newOvertime = await Overtime.create({
    employee: req.user.id,
    date: new Date(date),
    hours: parseFloat(hours),
    reason,
  });

  res.status(201).json({
    status: "success",
    data: {
      overtime: newOvertime,
    },
  });
});

export const getMyOvertimeRequests = catchAsync(async (req, res, next) => {
  const requests = await Overtime.find({ employee: req.user.id }).sort({ date: -1 });

  res.status(200).json({
    status: "success",
    results: requests.length,
    data: {
      requests,
    },
  });
});


export const getAllOvertimeRequests = catchAsync(async (req, res, next) => {
  const requests = await Overtime.find()
    .populate("employee", "name position department empId")
    .sort({ date: -1 });

  res.status(200).json({
    status: "success",
    results: requests.length,
    data: {
      requests,
    },
  });
});

export const resolveOvertimeRequest = catchAsync(async (req, res, next) => {
  const { status } = req.body;

  if (!["Approved", "Rejected"].includes(status)) {
    return next(new AppError("Please provide a valid resolution status (Approved or Rejected)!", 400));
  }

  const overtime = await Overtime.findById(req.params.id);
  if (!overtime) {
    return next(new AppError("No overtime request found with that ID!", 404));
  }

  overtime.status = status;
  overtime.approvedBy = req.user.name || req.user.role;
  await overtime.save();

  res.status(200).json({
    status: "success",
    data: {
      overtime,
    },
  });
});
