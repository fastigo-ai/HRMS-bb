import express from "express";
import { createAnnouncement, getAllAnnouncements, deleteAnnouncement } from "./announcement.controller.js";
import { protect, restrictTo } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);

// All users can view announcements
router.route("/").get(getAllAnnouncements);

// Only HR Admins can post/delete announcements
router.use(restrictTo("hr_admin"));
router.route("/").post(createAnnouncement);
router.route("/:id").delete(deleteAnnouncement);

export default router;
