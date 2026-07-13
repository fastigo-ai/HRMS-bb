import express from "express";
import { getMyPayslips, getAllPayslips, disbursePayslip, updatePayslip, deletePayslip } from "./payroll.controller.js";
import { protect, restrictTo } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/my", getMyPayslips);
router.get("/all", restrictTo("hr_admin"), getAllPayslips);
router.post("/disburse", restrictTo("hr_admin"), disbursePayslip);
router.patch("/:id", restrictTo("hr_admin"), updatePayslip);
router.delete("/:id", restrictTo("hr_admin"), deletePayslip);

export default router;
