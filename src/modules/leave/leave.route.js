import express from "express";
import { applyLeave, getMyLeaves, getAllLeaves, resolveLeave } from "./leave.controller.js";
import { protect, restrictTo } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);

// My leaves actions (Any employee)
router.route("/my")
  .get(getMyLeaves)
  .post(applyLeave);

// Global leave management actions (Restricted to managers and HR)
router.use(restrictTo("hr_admin", "manager"));

router.route("/")
  .get(getAllLeaves);

router.route("/:id/resolve")
  .patch(resolveLeave);

export default router;
