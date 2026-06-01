import express from "express";
import { protect, restrictTo } from "../../middlewares/auth.middleware.js";
import {
  getLeads,
  createLead,
  updateLeadStatus,
  getActivities,
  createActivity,
  getDwrs,
  submitDwr,
  getSalesPerformance,
  updateSalesRole,
} from "./sales.controller.js";

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

// Lead Routes
router.get("/leads", getLeads);
router.post("/leads", createLead);
router.patch("/leads/:id", updateLeadStatus);

// Activity Routes
router.get("/activities", getActivities);
router.post("/activities", createActivity);

// Daily Work Report Routes
router.get("/dwrs", getDwrs);
router.post("/dwrs", submitDwr);

// Administrative Routes (restricted to managers and HR admins)
router.get("/performance", restrictTo("manager", "hr_admin"), getSalesPerformance);
router.patch("/role/:id", restrictTo("manager", "hr_admin"), updateSalesRole);

export default router;
