import express from "express";
import { createOvertimeRequest, getMyOvertimeRequests, getAllOvertimeRequests, resolveOvertimeRequest } from "./overtime.controller.js";
import { protect, restrictTo } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);

// Employee actions
router.route("/my")
  .get(getMyOvertimeRequests)
  .post(createOvertimeRequest);

// Manager / HR Approvals actions
router.use(restrictTo("hr_admin", "manager"));

router.route("/")
  .get(getAllOvertimeRequests);

router.route("/:id/resolve")
  .patch(resolveOvertimeRequest);

export default router;
