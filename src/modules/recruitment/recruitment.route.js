import express from "express";
import { protect, restrictTo } from "../../middlewares/auth.middleware.js";
import { uploadDocument, localUrlFormatter } from "../../middlewares/upload.js";
import {
  createJob,
  getJobs,
  getJob,
  updateJob,
  createCandidate,
  getCandidates,
  getCandidate,
  updateCandidate,
  createApplication,
  getJobApplications,
  updateApplicationStage,
  triggerAiMatch,
  triggerVoiceScreening,
  syncVoiceScreening,
  scheduleInterview,
  getInterviews,
  submitInterviewFeedback,
  getAnalytics
} from "./recruitment.controller.js";

const router = express.Router();

router.use(protect);

// Jobs Routes
router.route("/jobs")
  .get(getJobs)
  .post(restrictTo("hr_admin", "manager"), createJob);

router.route("/jobs/:id")
  .get(getJob)
  .patch(restrictTo("hr_admin", "manager"), updateJob);

// Candidates Routes
router.route("/candidates")
  .get(getCandidates)
  .post(uploadDocument.single("resume"), localUrlFormatter, createCandidate);

router.route("/candidates/:id")
  .get(getCandidate)
  .patch(uploadDocument.single("resume"), localUrlFormatter, updateCandidate);

// Job Applications (Pipeline) Routes
router.route("/applications")
  .get(getJobApplications)
  .post(createApplication);

router.route("/applications/:id/stage")
  .patch(updateApplicationStage);

router.post("/applications/:id/match", restrictTo("hr_admin", "manager"), triggerAiMatch);
router.post("/applications/:id/voice-start", restrictTo("hr_admin", "manager"), triggerVoiceScreening);
router.post("/applications/:id/voice-sync", restrictTo("hr_admin", "manager"), syncVoiceScreening);

// Interviews Routes
router.route("/interviews")
  .get(getInterviews)
  .post(scheduleInterview);

router.route("/interviews/:id/feedback")
  .patch(submitInterviewFeedback);

// Analytics Routes
router.route("/analytics")
  .get(getAnalytics);

export default router;
