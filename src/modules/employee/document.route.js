import express from "express";
import { protect, restrictTo } from "../../middlewares/auth.middleware.js";
import User from "../auth/user.model.js";
import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
import { OFFER_LETTER_TEMPLATE, APPOINTMENT_LETTER_TEMPLATE, EXPERIENCE_LETTER_TEMPLATE } from "./documentTemplate.js";

const router = express.Router();

router.use(protect);
router.use(restrictTo("hr_admin"));

// Retrieve available default templates
router.get("/templates", (req, res) => {
  res.status(200).json({
    status: "success",
    data: {
      offerTemplate: OFFER_LETTER_TEMPLATE,
      appointmentTemplate: APPOINTMENT_LETTER_TEMPLATE,
      experienceTemplate: EXPERIENCE_LETTER_TEMPLATE,
    },
  });
});

// Compile dynamic merged variables for an employee
router.post("/compile", catchAsync(async (req, res, next) => {
  const { employeeId, type, candidateName, candidateEmail, customSalary, customPosition, customDepartment, exitDate } = req.body;

  let employee = null;
  if (employeeId) {
    employee = await User.findById(employeeId);
  }

  const todayStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  let compiledHtml = "";
  const name = employee ? employee.name : (candidateName || "Candidate Name");
  const email = employee ? employee.email : (candidateEmail || "candidate@gmail.com");
  const position = customPosition || (employee ? employee.position : "Frontend Developer");
  const dept = customDepartment || (employee ? employee.department : "Engineering");
  const salary = customSalary || (employee ? (employee.joiningSalary || employee.bankDetails?.joiningSalary || 500000) : 500000);
  const joinDate = employee ? new Date(employee.joinDate || employee.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : todayStr;
  const exitStr = exitDate ? new Date(exitDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : todayStr;
  const empId = employee ? (employee.empId || "WS-992") : "WS-TEMP";

  if (type === "offer") {
    compiledHtml = OFFER_LETTER_TEMPLATE
      .replace(/{{DATE}}/g, todayStr)
      .replace(/{{CANDIDATE_NAME}}/g, name)
      .replace(/{{CANDIDATE_EMAIL}}/g, email)
      .replace(/{{POSITION}}/g, position)
      .replace(/{{DEPARTMENT}}/g, dept)
      .replace(/{{SALARY}}/g, salary.toLocaleString("en-IN"))
      .replace(/{{JOIN_DATE}}/g, joinDate);
  } else if (type === "appointment") {
    compiledHtml = APPOINTMENT_LETTER_TEMPLATE
      .replace(/{{DATE}}/g, todayStr)
      .replace(/{{EMPLOYEE_NAME}}/g, name)
      .replace(/{{EMP_ID}}/g, empId)
      .replace(/{{POSITION}}/g, position)
      .replace(/{{JOIN_DATE}}/g, joinDate)
      .replace(/{{SALARY}}/g, salary.toLocaleString("en-IN"));
  } else if (type === "experience") {
    compiledHtml = EXPERIENCE_LETTER_TEMPLATE
      .replace(/{{DATE}}/g, todayStr)
      .replace(/{{EMPLOYEE_NAME}}/g, name)
      .replace(/{{EMP_ID}}/g, empId)
      .replace(/{{POSITION}}/g, position)
      .replace(/{{DEPARTMENT}}/g, dept)
      .replace(/{{JOIN_DATE}}/g, joinDate)
      .replace(/{{EXIT_DATE}}/g, exitStr);
  } else {
    return next(new AppError("Invalid letter type requested!", 400));
  }

  res.status(200).json({
    status: "success",
    data: {
      html: compiledHtml,
    },
  });
}));

export default router;
