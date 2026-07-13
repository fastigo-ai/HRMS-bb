import express from "express";
import { 
  clockIn, 
  clockOut, 
  getTodayAttendance, 
  getMyAttendanceLogs, 
  getAllAttendanceLogs,
  createAttendance,
  getAttendanceById,
  updateAttendance,
  deleteAttendance
} from "./attendance.controller.js";
import { protect, restrictTo } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// Enforce auth protect middleware on all attendance paths
router.use(protect);

router.post("/clock-in", clockIn);
router.post("/clock-out", clockOut);
router.get("/today", getTodayAttendance);
router.get("/my", getMyAttendanceLogs);

// HR Admin routes
router.use(restrictTo("hr_admin"));

router.route("/")
  .get(getAllAttendanceLogs)
  .post(createAttendance);

router.route("/:id")
  .get(getAttendanceById)
  .patch(updateAttendance)
  .delete(deleteAttendance);

export default router;
