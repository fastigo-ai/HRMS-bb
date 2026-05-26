import express from "express";
import { getAllEmployees, getEmployee, addEmployee } from "./employee.controller.js";
import { protect, restrictTo } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.route("/")
  .get(getAllEmployees)
  .post(restrictTo("hr_admin"), addEmployee);

router.route("/:id")
  .get(getEmployee);

export default router;
