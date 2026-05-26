import express from "express";
import { createCategory, getAllCategories } from "./category.controller.js";
import { protect, restrictTo } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// Apply authentication to all category routes
router.use(protect);

router.route("/")
  .get(getAllCategories)
  .post(restrictTo("hr_admin", "manager"), createCategory);

export default router;
