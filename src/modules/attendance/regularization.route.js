import express from "express";
import { applyRegularization, getMyRegularizations, getAllRegularizations, resolveRegularization } from "./regularization.controller.js";
import { protect, restrictTo } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);

// Employee actions
router.route("/my")
  .get(getMyRegularizations)
  .post(applyRegularization);

// Manager / HR Approvals actions
router.use(restrictTo("hr_admin", "manager"));

router.route("/")
  .get(getAllRegularizations);

router.route("/:id/resolve")
  .patch(resolveRegularization);

export default router;
