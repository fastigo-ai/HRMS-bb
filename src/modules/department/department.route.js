import express from "express";
import { getAllDepartments, createDepartment, deleteDepartment } from "./department.controller.js";
import { protect, restrictTo } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.route("/")
  .get(getAllDepartments)
  .post(restrictTo("hr_admin"), createDepartment);

router.route("/:id")
  .delete(restrictTo("hr_admin"), deleteDepartment);

export default router;
