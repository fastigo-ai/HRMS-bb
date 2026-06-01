import express from "express";
import { getTimesheets, submitTimesheet, resolveTimesheet } from "./timesheet.controller.js";
import { protect, restrictTo } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.route("/")
  .get(getTimesheets)
  .post(submitTimesheet);

router.patch("/:id/resolve", restrictTo("manager", "hr_admin"), resolveTimesheet);

export default router;
