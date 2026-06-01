import express from "express";
import { initializeOnboarding, getOnboardingProgress, toggleOnboardingTask, verifyOnboardingTask, getAllOnboardings } from "./onboarding.controller.js";
import { protect, restrictTo } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);

// Employee onboarding queries & self-toggle
router.route("/progress").get(getOnboardingProgress);
router.route("/toggle").post(toggleOnboardingTask);

// HR admin actions
router.use(restrictTo("hr_admin"));

router.route("/").get(getAllOnboardings);
router.route("/initialize").post(initializeOnboarding);
router.route("/:id/verify").patch(verifyOnboardingTask);

export default router;
