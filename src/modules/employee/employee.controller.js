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
  const { 
    name, email, password, role, position, department, phone, address, skills, bankDetails,
    location, gender, prevCompany, prevDesignation, prevDuration, prevCtc, prevRelievingDoc, prevSalarySlip, joiningSalary,
    aadhaarNumber, panNumber
  } = req.body || {};

  if (!email || !name) {
    return next(new AppError("Name and email are required parameters!", 400));
  }

  let aadhaarCardDocPath = undefined;
  let panCardDocPath = undefined;
  let prevRelievingDocPath = undefined;
  let prevSalarySlipPath = undefined;

  if (req.files) {
    if (req.files.aadhaarCardDoc && req.files.aadhaarCardDoc[0]) {
      aadhaarCardDocPath = req.files.aadhaarCardDoc[0].path;
    }
    if (req.files.panCardDoc && req.files.panCardDoc[0]) {
      panCardDocPath = req.files.panCardDoc[0].path;
    }
    if (req.files.prevRelievingDoc && req.files.prevRelievingDoc[0]) {
      prevRelievingDocPath = req.files.prevRelievingDoc[0].path;
    }
    if (req.files.prevSalarySlip && req.files.prevSalarySlip[0]) {
      prevSalarySlipPath = req.files.prevSalarySlip[0].path;
    }
  }

  let parsedBankDetails = bankDetails;
  if (typeof bankDetails === "string") {
    try {
      parsedBankDetails = JSON.parse(bankDetails);
    } catch (e) {
      // ignore
    }
  }

  let parsedSkills = skills;
  if (typeof skills === "string") {
    try {
      parsedSkills = JSON.parse(skills);
    } catch (e) {
      parsedSkills = skills.split(",").map(s => s.trim());
    }
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
    skills: parsedSkills,
    bankDetails: parsedBankDetails,
    location,
    gender,
    prevCompany,
    prevDesignation,
    prevDuration,
    prevCtc,
    prevRelievingDoc: prevRelievingDocPath || prevRelievingDoc,
    prevSalarySlip: prevSalarySlipPath || prevSalarySlip,
    joiningSalary,
    aadhaarNumber,
    panNumber,
    aadhaarCardDoc: aadhaarCardDocPath,
    panCardDoc: panCardDocPath,
  });

  newEmployee.password = undefined;

  res.status(201).json({
    status: "success",
    data: {
      employee: newEmployee,
    },
  });
});

// Update an existing employee (restricted to HR admin)
export const updateEmployee = catchAsync(async (req, res, next) => {
  // #swagger.tags = ['Employees']
  const { 
    name, email, password, role, position, department, phone, address, skills, bankDetails,
    location, gender, prevCompany, prevDesignation, prevDuration, prevCtc, prevRelievingDoc, prevSalarySlip, joiningSalary,
    aadhaarNumber, panNumber
  } = req.body || {};

  const employee = await User.findById(req.params.id);
  if (!employee) {
    return next(new AppError("Employee not found!", 404));
  }

  // Update fields if provided in request body
  if (name !== undefined) employee.name = name;
  if (email !== undefined) employee.email = email;
  if (password !== undefined && password !== "") {
    employee.password = password; // schema pre-save hook will hash it automatically
  }
  if (role !== undefined) employee.role = role;
  if (position !== undefined) employee.position = position;
  if (department !== undefined) employee.department = department;
  if (phone !== undefined) employee.phone = phone;
  if (address !== undefined) employee.address = address;
  if (skills !== undefined) employee.skills = skills;
  
  if (location !== undefined) employee.location = location;
  if (gender !== undefined) employee.gender = gender;
  if (prevCompany !== undefined) employee.prevCompany = prevCompany;
  if (prevDesignation !== undefined) employee.prevDesignation = prevDesignation;
  if (prevDuration !== undefined) employee.prevDuration = prevDuration;
  if (prevCtc !== undefined) employee.prevCtc = prevCtc;
  if (prevRelievingDoc !== undefined) employee.prevRelievingDoc = prevRelievingDoc;
  if (prevSalarySlip !== undefined) employee.prevSalarySlip = prevSalarySlip;
  if (joiningSalary !== undefined) employee.joiningSalary = joiningSalary;
  
  if (aadhaarNumber !== undefined) employee.aadhaarNumber = aadhaarNumber;
  if (panNumber !== undefined) employee.panNumber = panNumber;

  if (req.files) {
    if (req.files.aadhaarCardDoc && req.files.aadhaarCardDoc[0]) {
      employee.aadhaarCardDoc = req.files.aadhaarCardDoc[0].path;
    }
    if (req.files.panCardDoc && req.files.panCardDoc[0]) {
      employee.panCardDoc = req.files.panCardDoc[0].path;
    }
    if (req.files.prevRelievingDoc && req.files.prevRelievingDoc[0]) {
      employee.prevRelievingDoc = req.files.prevRelievingDoc[0].path;
    }
    if (req.files.prevSalarySlip && req.files.prevSalarySlip[0]) {
      employee.prevSalarySlip = req.files.prevSalarySlip[0].path;
    }
  }

  if (bankDetails !== undefined) {
    let parsedBankDetails = bankDetails;
    if (typeof bankDetails === "string") {
      try {
        parsedBankDetails = JSON.parse(bankDetails);
      } catch (e) {
        // ignore
      }
    }
    employee.bankDetails = {
      ...employee.bankDetails,
      ...parsedBankDetails
    };
  }

  if (skills !== undefined) {
    let parsedSkills = skills;
    if (typeof skills === "string") {
      try {
        parsedSkills = JSON.parse(skills);
      } catch (e) {
        parsedSkills = skills.split(",").map(s => s.trim());
      }
    }
    employee.skills = parsedSkills;
  }

  await employee.save();

  employee.password = undefined;

  res.status(200).json({
    status: "success",
    data: {
      employee,
    },
  });
});

// Delete an employee from the system roster (restricted to HR admin)
export const deleteEmployee = catchAsync(async (req, res, next) => {
  // #swagger.tags = ['Employees']
  const employee = await User.findById(req.params.id);
  if (!employee) {
    return next(new AppError("Employee not found!", 404));
  }

  await User.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: "success",
    data: null,
  });
});

export default { getAllEmployees, getEmployee, addEmployee, updateEmployee, deleteEmployee };

