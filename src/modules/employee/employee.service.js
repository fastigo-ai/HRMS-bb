import Employee from "./employee.model.js";
import AppError from "../../utils/AppError.js";

export const createEmployee = async (employeeData) => {
  return await Employee.create(employeeData);
};

export const getAllEmployees = async (filter = {}) => {
  return await Employee.find(filter);
};

export const getEmployeeById = async (id) => {
  const employee = await Employee.findById(id);
  if (!employee) {
    throw new AppError("No employee found with that ID", 404);
  }
  return employee;
};

export const updateEmployee = async (id, updateData) => {
  const employee = await Employee.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
  if (!employee) {
    throw new AppError("No employee found with that ID", 404);
  }
  return employee;
};

export const deleteEmployee = async (id) => {
  const employee = await Employee.findByIdAndDelete(id);
  if (!employee) {
    throw new AppError("No employee found with that ID", 404);
  }
  return employee;
};
