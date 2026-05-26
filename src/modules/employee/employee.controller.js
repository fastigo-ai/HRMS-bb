import User from "../auth/user.model.js";
import AppError from "../../utils/AppError.js";
import catchAsync from "../../utils/catchAsync.js";

// Retrieve all employees (Staff Directory)
export const getAllEmployees = catchAsync(async (req, res, next) => {
  // #swagger.tags = ['Employees']
  const employees = await User.find().select("-password");

  res.status(200).json({
    status: "success",
    results: employees.length,
    data: {
      employees,
    },
  });
});

// Retrieve specific employee profile
export const getEmployee = catchAsync(async (req, res, next) => {
  // #swagger.tags = ['Employees']
  // Allow fetching by database _id or by human-readable empId string (like WS-00101)
  const query = req.params.id.startsWith("WS-") ? { empId: req.params.id } : { _id: req.params.id };
  
  const employee = await User.findOne(query).select("-password");
  if (!employee) {
    return next(new AppError("Employee not found!", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      employee,
    },
  });
});

// Add new employee (restricted to HR admin)
export const addEmployee = catchAsync(async (req, res, next) => {
  // #swagger.tags = ['Employees']
  const { name, email, password, role, position, department, phone, address, skills, bankDetails } = req.body;

  if (!email || !name) {
    return next(new AppError("Name and email are required parameters!", 400));
  }

  // Create employee. Pre-save hooks will generate empId, default department/position, and hash password!
  const newEmployee = await User.create({
    name,
    email,
    password: password || "password123", // default secure password
    role,
    position,
    department,
    phone,
    address,
    skills,
    bankDetails,
  });

  newEmployee.password = undefined;

  res.status(201).json({
    status: "success",
    data: {
      employee: newEmployee,
    },
  });
});

export default { getAllEmployees, getEmployee, addEmployee };
