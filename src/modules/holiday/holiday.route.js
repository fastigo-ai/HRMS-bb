import express from "express";
import { createHoliday, getAllHolidays, deleteHoliday } from "./holiday.controller.js";
import { protect, restrictTo } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);

// Anyone logged in can get holidays list
router.route("/").get(getAllHolidays);

// Only HR Admins can create and delete holidays
router.use(restrictTo("hr_admin"));
router.route("/").post(createHoliday);
router.route("/:id").delete(deleteHoliday);

export default router;
