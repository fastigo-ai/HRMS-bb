import express from "express";
import { protect, restrictTo } from "../../middlewares/auth.middleware.js";
import { uploadDocument } from "../../middlewares/upload.js";
import {
  createCandidate,
  getCandidates,
  updateCandidateStage,
  deleteCandidate,
  getCandidateMetrics,
  updateCandidateMetrics,
} from "./candidate.controller.js";

const router = express.Router();

// Apply protect middleware to all recruitment candidate routes
router.use(protect);

router.route("/")
  .get(getCandidates)
  .post(uploadDocument.single("resume"), createCandidate);

router.route("/metrics")
  .get(getCandidateMetrics)
  .patch(updateCandidateMetrics);

router.route("/:id")
  .delete(deleteCandidate);

router.route("/:id/stage")
  .patch(updateCandidateStage);

export default router;
