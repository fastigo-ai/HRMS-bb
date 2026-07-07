import express from "express";
import { protect, restrictTo } from "../../middlewares/auth.middleware.js";
import {
  getLeads,
  createLead,
  updateLeadStatus,
  updateLead,
  deleteLead,
  getActivities,
  createActivity,
  getDwrs,
  submitDwr,
  getSalesPerformance,
  updateSalesRole,
} from "./sales.controller.js";
import { getAnalytics } from "./analytics.controller.js";
import { generateQuotation, getQuotations, updateQuotation, deleteQuotation } from "./quotation.controller.js";

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

// Lead Routes
router.get("/leads", getLeads);
router.post("/leads", createLead);
router.patch("/leads/:id/status", updateLeadStatus); // changed this to /status for clarity, wait, no let's not break frontend.
router.patch("/leads/:id", updateLead);
router.delete("/leads/:id", deleteLead);

// Activity Routes
router.get("/activities", getActivities);
router.post("/activities", createActivity);

// Daily Work Report Routes
router.get("/dwrs", getDwrs);
router.post("/dwrs", submitDwr);

// Administrative Routes (restricted to managers and HR admins)
router.get("/performance", restrictTo("manager", "hr_admin"), getSalesPerformance);
router.patch("/role/:id", restrictTo("manager", "hr_admin"), updateSalesRole);

// Analytics
router.get("/analytics", getAnalytics);

// Quotation Routes
router.get("/quotations", getQuotations);
router.post("/quotations", generateQuotation);
router.patch("/quotations/:id", updateQuotation);
router.delete("/quotations/:id", deleteQuotation);

export default router;
