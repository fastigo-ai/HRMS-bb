import * as employeeService from "./employee.service.js";
import catchAsync from "../../utils/catchAsync.js";

export const httpCreateEmployee = catchAsync(async (req, res) => {
  const employeeData = { ...req.body };

  // Handle uploaded files if any
  if (req.files) {
    if (req.files.avatar) {
      employeeData.avatar = req.files.avatar[0].path;
    }
    if (req.files.resume) {
      employeeData.resume = req.files.resume[0].path;
    }
  } else if (req.file) {
    // If it's a single upload, map based on the fieldname
    employeeData[req.file.fieldname] = req.file.path;
  }

  const employee = await employeeService.createEmployee(employeeData);

  res.status(201).json({
    status: "success",
    data: {
      employee,
    },
  });
});

export const httpGetAllEmployees = catchAsync(async (req, res) => {
  const employees = await employeeService.getAllEmployees();

  res.status(200).json({
    status: "success",
    results: employees.length,
    data: {
      employees,
    },
  });
});

export const httpGetEmployeeById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const employee = await employeeService.getEmployeeById(id);

  res.status(200).json({
    status: "success",
    data: {
      employee,
    },
  });
});

export const httpUpdateEmployee = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updateData = { ...req.body };

  // Handle updated files if any
  if (req.files) {
    if (req.files.avatar) {
      updateData.avatar = req.files.avatar[0].path;
    }
    if (req.files.resume) {
      updateData.resume = req.files.resume[0].path;
    }
  } else if (req.file) {
    updateData[req.file.fieldname] = req.file.path;
  }

  const employee = await employeeService.updateEmployee(id, updateData);

  res.status(200).json({
    status: "success",
    data: {
      employee,
    },
  });
});

export const httpDeleteEmployee = catchAsync(async (req, res) => {
  const { id } = req.params;
  await employeeService.deleteEmployee(id);

  res.status(204).json({
    status: "success",
    data: null,
  });
});
