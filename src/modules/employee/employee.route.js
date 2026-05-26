import express from "express";
import * as employeeController from "./employee.controller.js";
import { uploadDocument } from "../../middlewares/upload.js";

const router = express.Router();

// Define field configurations for uploads (avatar and resume documents)
const employeeUploads = uploadDocument.fields([
  { name: "avatar", maxCount: 1 },
  { name: "resume", maxCount: 1 },
]);

router
  .route("/")
  .get(employeeController.httpGetAllEmployees)
  .post(employeeUploads, employeeController.httpCreateEmployee);

router
  .route("/:id")
  .get(employeeController.httpGetEmployeeById)
  .patch(employeeUploads, employeeController.httpUpdateEmployee)
  .delete(employeeController.httpDeleteEmployee);

export default router;
