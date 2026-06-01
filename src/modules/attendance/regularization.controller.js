import Regularization from "./regularization.model.js";
import Attendance from "./attendance.model.js";
import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";

// Helper to get normalized date string 'YYYY-MM-DD'
const getLocalDateString = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const applyRegularization = catchAsync(async (req, res, next) => {
  const { attendanceDate, requestedCheckIn, requestedCheckOut, reason } = req.body;

  if (!attendanceDate || !requestedCheckIn || !requestedCheckOut || !reason) {
    return next(new AppError("Please provide all required fields (attendanceDate, requestedCheckIn, requestedCheckOut, reason)!", 400));
  }

  const existingPending = await Regularization.findOne({
    employee: req.user.id,
    attendanceDate: new Date(attendanceDate),
    status: "Pending",
  });

  if (existingPending) {
    return next(new AppError("You already have a pending regularization request for this date!", 400));
  }

  const newReg = await Regularization.create({
    employee: req.user.id,
    attendanceDate: new Date(attendanceDate),
    requestedCheckIn,
    requestedCheckOut,
    reason,
  });

  res.status(201).json({
    status: "success",
    data: {
      regularization: newReg,
    },
  });
});

export const getMyRegularizations = catchAsync(async (req, res, next) => {
  const requests = await Regularization.find({ employee: req.user.id }).sort({ attendanceDate: -1 });

  res.status(200).json({
    status: "success",
    results: requests.length,
    data: {
      requests,
    },
  });
});

export const getAllRegularizations = catchAsync(async (req, res, next) => {
  const requests = await Regularization.find()
    .populate("employee", "name position department empId")
    .sort({ attendanceDate: -1 });

  res.status(200).json({
    status: "success",
    results: requests.length,
    data: {
      requests,
    },
  });
});

export const resolveRegularization = catchAsync(async (req, res, next) => {
  const { status } = req.body;

  if (!["Approved", "Rejected"].includes(status)) {
    return next(new AppError("Please specify a valid status (Approved or Rejected)!", 400));
  }

  const reg = await Regularization.findById(req.params.id);
  if (!reg) {
    return next(new AppError("No regularization request found with that ID!", 404));
  }

  reg.status = status;
  reg.approvedBy = req.user.name || req.user.role;
  await reg.save();

  // If approved, update/upsert the actual Attendance log!
  if (status === "Approved") {
    const targetDateStr = getLocalDateString(reg.attendanceDate);

    // Construct clockIn and clockOut dates
    const inParts = reg.requestedCheckIn.split(":");
    const outParts = reg.requestedCheckOut.split(":");

    const clockInDate = new Date(reg.attendanceDate);
    clockInDate.setHours(parseInt(inParts[0]), parseInt(inParts[1]), 0, 0);

    const clockOutDate = new Date(reg.attendanceDate);
    clockOutDate.setHours(parseInt(outParts[0]), parseInt(outParts[1]), 0, 0);

    // Calculate time spent
    const diffMs = clockOutDate - clockInDate;
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffMins = Math.floor((diffMs % 3600000) / 60000);
    const timeSpentStr = `${diffHrs}h ${diffMins}m`;

    // Determine status (Lateness check: after 9:30 AM is Late)
    let isLate = false;
    let attendanceStatus = "Present";
    if (parseInt(inParts[0]) > 9 || (parseInt(inParts[0]) === 9 && parseInt(inParts[1]) > 30)) {
      isLate = true;
      attendanceStatus = "Late";
    }

    // Check if record already exists
    let attendance = await Attendance.findOne({
      employee: reg.employee,
      date: targetDateStr,
    });

    if (attendance) {
      attendance.clockIn = clockInDate;
      attendance.clockOut = clockOutDate;
      attendance.timeSpent = timeSpentStr;
      attendance.isLate = isLate;
      attendance.status = attendanceStatus;
      await attendance.save();
    } else {
      await Attendance.create({
        employee: reg.employee,
        date: targetDateStr,
        clockIn: clockInDate,
        clockOut: clockOutDate,
        timeSpent: timeSpentStr,
        isLate,
        status: attendanceStatus,
        mode: "Office",
        location: "Headquarters",
      });
    }
  }

  res.status(200).json({
    status: "success",
    data: {
      regularization: reg,
    },
  });
});
