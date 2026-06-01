import WFH from "./wfh.model.js";
import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";

export const createWFHRequest = catchAsync(async (req, res, next) => {
  const { startDate, endDate, type, reason } = req.body;

  if (!startDate || !endDate || !reason) {
    return next(new AppError("Please provide all required fields (startDate, endDate, reason)!", 400));
  }

  const newWFH = await WFH.create({
    employee: req.user.id,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    type: type || "Full Day",
    reason,
  });

  res.status(201).json({
    status: "success",
    data: {
      wfh: newWFH,
    },
  });
});

export const getMyWFHRequests = catchAsync(async (req, res, next) => {
  const requests = await WFH.find({ employee: req.user.id }).sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: requests.length,
    data: {
      requests,
    },
  });
});

export const getAllWFHRequests = catchAsync(async (req, res, next) => {
  const requests = await WFH.find()
    .populate("employee", "name position department empId")
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: requests.length,
    data: {
      requests,
    },
  });
});

export const resolveWFHRequest = catchAsync(async (req, res, next) => {
  const { status } = req.body;

  if (!["Approved", "Rejected"].includes(status)) {
    return next(new AppError("Please provide a valid resolution status (Approved or Rejected)!", 400));
  }

  const wfh = await WFH.findById(req.params.id);
  if (!wfh) {
    return next(new AppError("No WFH request found with that ID!", 404));
  }

  wfh.status = status;
  wfh.approvedBy = req.user.name || req.user.role;
  await wfh.save();

  res.status(200).json({
    status: "success",
    data: {
      wfh,
    },
  });
});
