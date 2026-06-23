import express from "express";
import { clockIn, clockOut, getTodayAttendance, getMyAttendanceLogs, getAllAttendanceLogs } from "./attendance.controller.js";
import { protect, restrictTo } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// Enforce auth protect middleware on all attendance paths
router.use(protect);

router.post("/clock-in", clockIn);
router.post("/clock-out", clockOut);
router.get("/today", getTodayAttendance);
router.get("/my", getMyAttendanceLogs);
router.get("/", restrictTo("hr_admin"), getAllAttendanceLogs);

export default router;
