import express from "express";
import { getMyNotifications, markAllNotificationsRead } from "./notification.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.route("/")
  .get(getMyNotifications)
  .patch(markAllNotificationsRead);

export default router;
