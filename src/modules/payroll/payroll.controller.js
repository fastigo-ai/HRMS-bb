import Payslip from "./payslip.model.js";
import User from "../auth/user.model.js";
import Notification from "../notification/notification.model.js";
import Attendance from "../attendance/attendance.model.js";
import Company from "../company/company.model.js";
import AppError from "../../utils/AppError.js";
import catchAsync from "../../utils/catchAsync.js";

const parsePayPeriod = (periodStr) => {
  const parts = periodStr.split(' ');
  if (parts.length === 2) {
    const monthName = parts[0];
    const year = parseInt(parts[1], 10);
    const months = {
      January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
      July: 7, August: 8, September: 9, October: 10, November: 11, December: 12
    };
    const month = months[monthName];
    if (month && year) {
      return { year, month };
    }
  }
  return null;
};

const isWorkingDay = (date, saturdayRule = "5-day") => {
  const dayOfWeek = date.getDay(); // 0 = Sun, 6 = Sat
  if (dayOfWeek === 0) return false; // Sunday is always off
  if (dayOfWeek === 6) { // Saturday
    if (saturdayRule === "5-day") return false;
    if (saturdayRule === "6-day") return true;
    if (saturdayRule === "2nd-4th-off") {
      const day = date.getDate();
      const isSecondSaturday = day >= 8 && day <= 14;
      const isFourthSaturday = day >= 22 && day <= 28;
      return !(isSecondSaturday || isFourthSaturday);
    }
  }
  return true; // Mon-Fri
};

const getWorkingDaysInMonth = (year, month, saturdayRule = "5-day") => {
  const numDays = new Date(year, month, 0).getDate();
  let workingDays = 0;
  for (let day = 1; day <= numDays; day++) {
    const date = new Date(year, month - 1, day);
    if (isWorkingDay(date, saturdayRule)) {
      workingDays++;
    }
  }
  return workingDays;
};


// Get logged-in employee's payslips
export const getMyPayslips = catchAsync(async (req, res, next) => {
  // #swagger.tags = ['Payroll']
  const payslips = await Payslip.find({ employee: req.user.id })
    .populate("employee", "name email role empId position department bankDetails")
    .sort("-createdAt");

  res.status(200).json({
    status: "success",
    results: payslips.length,
    data: {
      payslips,
    },
  });
});

// Get all corporate payroll disbursals (restricted to HR admin)
export const getAllPayslips = catchAsync(async (req, res, next) => {
  // #swagger.tags = ['Payroll']
  const payslips = await Payslip.find()
    .populate("employee", "name email role empId position department bankDetails")
    .sort("-createdAt");

  res.status(200).json({
    status: "success",
    results: payslips.length,
    data: {
      payslips,
    },
  });
});

// Disburse a new payslip to an employee (restricted to HR admin)
export const disbursePayslip = catchAsync(async (req, res, next) => {
  // #swagger.tags = ['Payroll']
  const { employeeName, period, baseSalary, taxWithheld, basic, hra, specialAllowance, providentFund, incomeTax, customEarnings, customDeductions } = req.body;

  if (!employeeName || !period || baseSalary === undefined || taxWithheld === undefined) {
    return next(new AppError("Employee name, period, base salary, and tax withheld are required!", 400));
  }

  // Find targeted user by name
  const employee = await User.findOne({ name: employeeName });
  if (!employee) {
    return next(new AppError(`No employee found with name '${employeeName}'!`, 404));
  }

  // Parse month and year from period
  const parsed = parsePayPeriod(period);
  if (!parsed) {
    return next(new AppError("Invalid pay period format! Use 'Month YYYY' (e.g. 'June 2026').", 400));
  }
  const { year, month } = parsed;
  const monthStr = String(month).padStart(2, '0');

  // Find all attendance records for employee in current month
  const dateRegex = new RegExp(`^${year}-${monthStr}-`);
  const logs = await Attendance.find({
    employee: employee._id,
    date: { $regex: dateRegex }
  });

  // Fetch the company's saturdayRule
  const company = await Company.findOne();
  const saturdayRule = company?.saturdayRule || "5-day";

  // Calculate working days in month
  const fullMonthWorkingDays = getWorkingDaysInMonth(year, month, saturdayRule);
  let effectiveWorkingDays = fullMonthWorkingDays;
  let startDay = 1;

  const joinDate = employee.joinDate ? new Date(employee.joinDate) : null;
  if (joinDate && joinDate.getFullYear() === year && (joinDate.getMonth() + 1) === month) {
    startDay = joinDate.getDate();
    let count = 0;
    const numDays = new Date(year, month, 0).getDate();
    for (let day = startDay; day <= numDays; day++) {
      const date = new Date(year, month - 1, day);
      if (isWorkingDay(date, saturdayRule)) {
        count++;
      }
    }
    effectiveWorkingDays = count;
  }

  // Count leaves and absent days
  const now = new Date();
  const isCurrentMonth = (year === now.getFullYear() && month === now.getMonth() + 1);
  const endDay = isCurrentMonth ? Math.min(now.getDate(), new Date(year, month, 0).getDate()) : new Date(year, month, 0).getDate();

  let totalLeaves = 0;
  
  const logMap = {};
  logs.forEach(log => {
    const parts = log.date.split('-');
    if (parts.length === 3) {
      const d = parseInt(parts[2], 10);
      logMap[d] = log;
    }
  });

  for (let day = startDay; day <= endDay; day++) {
    const date = new Date(year, month - 1, day);
    if (!isWorkingDay(date, saturdayRule)) continue;

    const log = logMap[day];
    if (log) {
      if (log.status === "Leave" || log.status === "Absent") {
        totalLeaves++;
      }
    } else {
      // Missing log on a working day is counted as absent/leave
      totalLeaves++;
    }
  }

  // Apply deduction logic: 2 leaves allowed, extra leaves deducted prorated
  let extraLeaves = 0;
  let deductionAmount = 0;
  if (totalLeaves > 2) {
    extraLeaves = totalLeaves - 2;
    const perDaySalary = baseSalary / (effectiveWorkingDays || 22); // fallback if 0
    deductionAmount = Math.round(perDaySalary * extraLeaves);
  }

  const finalSalary = Math.round(baseSalary - deductionAmount);
  const salaryNum = parseFloat(baseSalary);
  const taxNum = parseFloat(taxWithheld);
  const netPay = Math.max(0, finalSalary - taxNum);

  // Find and update/upsert to prevent duplicate payslip per month per employee
  const payslip = await Payslip.findOneAndUpdate(
    { employee: employee._id, period },
    {
      baseSalary: salaryNum,
      taxWithheld,
      basic: basic || 0,
      hra: hra || 0,
      specialAllowance: specialAllowance || 0,
      providentFund: providentFund || 0,
      incomeTax: incomeTax || 0,
      customEarnings: customEarnings || [],
      customDeductions: customDeductions || [],
      netPay,
      status: "Disbursed",
      totalLeaves,
      extraLeaves,
      deductionAmount,
      finalSalary,
    },
    { new: true, upsert: true, runValidators: true }
  );

  // Trigger a database notification for the employee!
  await Notification.create({
    recipient: employee._id,
    title: "Monthly Payslip Disbursed",
    message: `Your payroll receipt for ${period} has been disbursed by HR. Gross base: ₹${salaryNum.toLocaleString()}, net pay: ₹${netPay.toLocaleString()}.`,
    category: "payroll",
    priority: "normal",
  });

  const populated = await Payslip.findById(payslip._id).populate(
    "employee",
    "name email role empId position department bankDetails"
  );

  res.status(201).json({
    status: "success",
    data: {
      payslip: populated,
    },
  });
});

// Update a payslip (restricted to HR admin)
export const updatePayslip = catchAsync(async (req, res, next) => {
  // #swagger.tags = ['Payroll']
  const payslip = await Payslip.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!payslip) {
    return next(new AppError("No payslip found with that ID", 404));
  }

  const populated = await Payslip.findById(payslip._id).populate(
    "employee",
    "name email role empId position department bankDetails"
  );

  res.status(200).json({
    status: "success",
    data: {
      payslip: populated,
    },
  });
});

// Delete a payslip (restricted to HR admin)
export const deletePayslip = catchAsync(async (req, res, next) => {
  // #swagger.tags = ['Payroll']
  const payslip = await Payslip.findByIdAndDelete(req.params.id);

  if (!payslip) {
    return next(new AppError("No payslip found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});
