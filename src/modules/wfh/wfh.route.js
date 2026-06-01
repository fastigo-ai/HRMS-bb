import express from "express";
import { createWFHRequest, getMyWFHRequests, getAllWFHRequests, resolveWFHRequest } from "./wfh.controller.js";
import { protect, restrictTo } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);

// Employee actions
router.route("/my")
  .get(getMyWFHRequests)
  .post(createWFHRequest);

// Manager / HR Approvals actions
router.use(restrictTo("hr_admin", "manager"));

router.route("/")
  .get(getAllWFHRequests);

router.route("/:id/resolve")
  .patch(resolveWFHRequest);

export default router;
