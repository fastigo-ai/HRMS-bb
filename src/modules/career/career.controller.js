import Career from "./career.model.js";
import User from "../auth/user.model.js";
import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";

export const processCareerUpdate = catchAsync(async (req, res, next) => {
  const { employeeId, type, newDepartment, newPosition, newSalary, effectiveDate, notes } = req.body;

  if (!employeeId || !type || !effectiveDate) {
    return next(new AppError("Please provide all required fields (employeeId, type, effectiveDate)!", 400));
  }

  const employee = await User.findById(employeeId);
  if (!employee) {
    return next(new AppError("Employee not found!", 404));
  }

  const prevDept = employee.department || "Unassigned";
  const prevPos = employee.position || "Staff Member";
  const prevSal = employee.joiningSalary || 0;

  const newDeptVal = newDepartment || prevDept;
  const newPosVal = newPosition || prevPos;
  const newSalVal = newSalary !== undefined ? parseFloat(newSalary) : prevSal;

  // Create Career log record
  const log = await Career.create({
    employee: employeeId,
    type,
    previousDepartment: prevDept,
    newDepartment: newDeptVal,
    previousPosition: prevPos,
    newPosition: newPosVal,
    previousSalary: prevSal,
    newSalary: newSalVal,
    effectiveDate: new Date(effectiveDate),
    notes: notes || "",
  });

  // Update direct User specifications in MongoDB
  employee.department = newDeptVal;
  employee.position = newPosVal;
  employee.joiningSalary = newSalVal;
  await employee.save({ validateBeforeSave: false });

  res.status(201).json({
    status: "success",
    data: {
      log,
      employee,
    },
  });
});

export const getCareerHistory = catchAsync(async (req, res, next) => {
  const empId = req.query.employeeId || req.user.id;

  const history = await Career.find({ employee: empId }).sort({ effectiveDate: -1 });

  res.status(200).json({
    status: "success",
    results: history.length,
    data: {
      history,
    },
  });
});
