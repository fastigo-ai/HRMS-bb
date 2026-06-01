import express from "express";
import { 
  getTasks, 
  createTask, 
  startTask, 
  addWorkReport, 
  completeTask, 
  resolveTask,
  updateTask,
  deleteTask
} from "./task.controller.js";
import { protect, restrictTo } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// Protect all task endpoints
router.use(protect);

router.route("/")
  .get(getTasks)
  .post(restrictTo("hr_admin", "manager"), createTask);

router.patch("/:id/start", startTask);
router.post("/:id/report", addWorkReport);
router.patch("/:id/complete", completeTask);
router.patch("/:id/resolve", restrictTo("hr_admin", "manager"), resolveTask);

router.route("/:id")
  .patch(restrictTo("hr_admin", "manager"), updateTask)
  .delete(restrictTo("hr_admin", "manager"), deleteTask);

export default router;
