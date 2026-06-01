import Payslip from "./payslip.model.js";
import User from "../auth/user.model.js";
import Notification from "../notification/notification.model.js";
import AppError from "../../utils/AppError.js";
import catchAsync from "../../utils/catchAsync.js";

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
  const { employeeName, period, baseSalary, taxWithheld } = req.body;

  if (!employeeName || !period || baseSalary === undefined || taxWithheld === undefined) {
    return next(new AppError("Employee name, period, base salary, and tax withheld are required!", 400));
  }

  // Find targeted user by name
  const employee = await User.findOne({ name: employeeName });
  if (!employee) {
    return next(new AppError(`No employee found with name '${employeeName}'!`, 404));
  }

  // Set custom tax and calculate net pay
  const salaryNum = parseFloat(baseSalary);
  const taxNum = parseFloat(taxWithheld);
  const netPay = salaryNum - taxNum;


  // Find and update/upsert to prevent duplicate payslip per month per employee
  const payslip = await Payslip.findOneAndUpdate(
    { employee: employee._id, period },
    {
      baseSalary: salaryNum,
      taxWithheld,
      netPay,
      status: "Disbursed",
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
