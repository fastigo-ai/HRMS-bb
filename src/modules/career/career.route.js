import express from "express";
import { processCareerUpdate, getCareerHistory } from "./career.controller.js";
import { protect, restrictTo } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);

// Employee or HR can view history logs
router.route("/history").get(getCareerHistory);

// Only HR can trigger transfers / promotions
router.use(restrictTo("hr_admin"));
router.route("/").post(processCareerUpdate);

export default router;
