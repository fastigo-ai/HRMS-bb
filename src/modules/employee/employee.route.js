import express from "express";
import { getAllEmployees, getEmployee, addEmployee, updateEmployee, deleteEmployee } from "./employee.controller.js";
import { protect, restrictTo } from "../../middlewares/auth.middleware.js";
import { uploadDocument } from "../../middlewares/upload.js";

const router = express.Router();

router.use(protect);

router.route("/")
  .get(getAllEmployees)
  .post(
    restrictTo("hr_admin"),
    uploadDocument.fields([
      { name: "aadhaarCardDoc", maxCount: 1 },
      { name: "panCardDoc", maxCount: 1 },
      { name: "prevRelievingDoc", maxCount: 1 },
      { name: "prevSalarySlip", maxCount: 1 }
    ]),
    addEmployee
  );

router.route("/:id")
  .get(getEmployee)
  .patch(
    restrictTo("hr_admin"),
    uploadDocument.fields([
      { name: "aadhaarCardDoc", maxCount: 1 },
      { name: "panCardDoc", maxCount: 1 },
      { name: "prevRelievingDoc", maxCount: 1 },
      { name: "prevSalarySlip", maxCount: 1 }
    ]),
    updateEmployee
  )
  .delete(restrictTo("hr_admin"), deleteEmployee);


export default router;
