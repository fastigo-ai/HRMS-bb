import WFH from "./wfh.model.js";
import Attendance from "../attendance/attendance.model.js";
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

  // Create attendance logs with status "WFH" if Approved
  if (status === "Approved") {
    const start = new Date(wfh.startDate);
    const end = new Date(wfh.endDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue; // Skip weekends
      
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;
      
      const clockInDate = new Date(d);
      clockInDate.setHours(9, 0, 0, 0);
      const clockOutDate = new Date(d);
      clockOutDate.setHours(18, 0, 0, 0);

      await Attendance.findOneAndUpdate(
        { employee: wfh.employee, date: dateStr },
        {
          clockIn: clockInDate,
          clockOut: clockOutDate,
          status: "WFH",
          mode: "WFH",
          isLate: false,
          timeSpent: "9h 0m",
          location: "Remote",
        },
        { upsert: true, new: true }
      );
    }
  }

  await wfh.save();

  res.status(200).json({
    status: "success",
    data: {
      wfh,
    },
  });
});
