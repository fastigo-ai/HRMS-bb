import express from "express";
import { submitResignation, getMyResignationStatus, getAllResignations, resolveResignationStatus, toggleClearanceStep } from "./resignation.controller.js";
import { protect, restrictTo } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);

// Employee actions
router.route("/my")
  .get(getMyResignationStatus)
  .post(submitResignation);

// HR actions
router.use(restrictTo("hr_admin"));

router.route("/")
  .get(getAllResignations);

router.route("/:id/resolve")
  .patch(resolveResignationStatus);

router.route("/:id/clearance")
  .patch(toggleClearanceStep);

export default router;
