import express from "express";
import { getProjects, createProject } from "./project.controller.js";
import { protect, restrictTo } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.route("/")
  .get(getProjects)
  .post(restrictTo("manager", "hr_admin"), createProject);

export default router;
