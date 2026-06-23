import Attendance from "./attendance.model.js";
import Company from "../company/company.model.js";
import AppError from "../../utils/AppError.js";
import catchAsync from "../../utils/catchAsync.js";

// Helper to get today's date normalized as a 'YYYY-MM-DD' string in local system time
const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Clock In Controller
export const clockIn = catchAsync(async (req, res, next) => {
  // #swagger.tags = ['Attendance']
  const { mode = "Office", location = "Headquarters" } = req.body;
  const now = new Date();
  const dateStr = getLocalDateString(now);

  // Check if already checked in today
  const existingRecord = await Attendance.findOne({ employee: req.user.id, date: dateStr });
  if (existingRecord) {
    return next(new AppError("You have already clocked in today!", 400));
  }

  // Geofence check if mode is Office
  const company = await Company.findOne();
  if (mode === "Office" && company) {
    const { latitude, longitude } = req.body;
    if (latitude === undefined || longitude === undefined) {
      return next(new AppError("GPS coordinates are required to clock in from the office!", 400));
    }

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371e3; // Earth radius in meters
      const phi1 = (lat1 * Math.PI) / 180;
      const phi2 = (lat2 * Math.PI) / 180;
      const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
      const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

      const a =
        Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
        Math.cos(phi1) * Math.cos(phi2) *
        Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      return R * c; // Distance in meters
    };

    
    const distance = calculateDistance(
      Number(latitude),
      Number(longitude),
      company.latitude,
      company.longitude
    );

    if (distance > company.radius) {
      return next(
        new AppError(
          `Clock-in blocked! You are outside the authorized office boundary (${Math.round(distance)}m away from office).`,
          400
        )
      );
    }
  }

  // Calculate lateness threshold (e.g. 9:30 AM shift starts)
  const hour = now.getHours();
  const minute = now.getMinutes();
  let isLate = false;
  let status = "Present";

  if (mode === "WFH") {
    status = "WFH";
  } else if (hour > 9 || (hour === 9 && minute > 30)) {
    isLate = true;
    status = "Late";
  }

  const newRecord = await Attendance.create({
    employee: req.user.id,
    date: dateStr,
    clockIn: now,
    mode,
    location,
    isLate,
    status,
  });

  res.status(201).json({
    status: "success",
    data: {
      attendance: newRecord,
    },
  });
});

// Clock Out Controller
export const clockOut = catchAsync(async (req, res, next) => {
  // #swagger.tags = ['Attendance']
  const now = new Date();
  const dateStr = getLocalDateString(now);

  // Find today's check-in record
  const record = await Attendance.findOne({
    employee: req.user.id,
    date: dateStr,
    clockOut: { $exists: false },
  });

  if (!record) {
    return next(new AppError("No active check-in found for today, or you have already clocked out!", 400));
  }

  record.clockOut = now;

  // Calculate total elapsed time
  const diffMs = now - record.clockIn;
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffMins = Math.floor((diffMs % 3600000) / 60000);
  record.timeSpent = `${diffHrs}h ${diffMins}m`;

  await record.save();

  res.status(200).json({
    status: "success",
    data: {
      attendance: record,
    },
  });
});

// Get Today's Attendance Check Status
export const getTodayAttendance = catchAsync(async (req, res, next) => {
  // #swagger.tags = ['Attendance']
  const dateStr = getLocalDateString();
  const record = await Attendance.findOne({ employee: req.user.id, date: dateStr });

  res.status(200).json({
    status: "success",
    data: {
      attendance: record || null,
    },
  });
});

// Get My Attendance logs and metrics
export const getMyAttendanceLogs = catchAsync(async (req, res, next) => {
  // #swagger.tags = ['Attendance']
  const logs = await Attendance.find({ employee: req.user.id }).sort("-clockIn");

  // Summarize metrics
  let totalMs = 0;
  let presentDays = 0;
  let lateMarks = 0;
  let checkInMinutesSum = 0;
  let checkInCount = 0;

  logs.forEach((log) => {
    if (log.status === "Present" || log.status === "Late") {
      presentDays++;
    }
    if (log.status === "Late") {
      lateMarks++;
    }

    if (log.clockIn && log.clockOut) {
      totalMs += log.clockOut - log.clockIn;
    }

    if (log.clockIn) {
      const inDate = new Date(log.clockIn);
      const minsFromMidnight = inDate.getHours() * 60 + inDate.getMinutes();
      checkInMinutesSum += minsFromMidnight;
      checkInCount++;
    }
  });

  const totalHours = (totalMs / 3600000).toFixed(1);

  let avgCheckIn = "09:00 AM";
  if (checkInCount > 0) {
    const avgMins = Math.round(checkInMinutesSum / checkInCount);
    const avgHrs = Math.floor(avgMins / 60);
    const avgMns = avgMins % 60;
    const ampm = avgHrs >= 12 ? "PM" : "AM";
    const formattedHrs = String(avgHrs % 12 || 12).padStart(2, "0");
    const formattedMns = String(avgMns).padStart(2, "0");
    avgCheckIn = `${formattedHrs}:${formattedMns} ${ampm}`;
  }

  res.status(200).json({
    status: "success",
    data: {
      logs,
      stats: {
        totalHours: parseFloat(totalHours),
        avgCheckIn,
        presentDays,
        lateMarks,
      },
    },
  });
});

// Retrieve all attendance logs (restricted to HR admin)
export const getAllAttendanceLogs = catchAsync(async (req, res, next) => {
  // #swagger.tags = ['Attendance']
  const logs = await Attendance.find()
    .populate("employee", "name email role empId position department")
    .sort("-clockIn");

  res.status(200).json({
    status: "success",
    results: logs.length,
    data: {
      logs,
    },
  });
});

