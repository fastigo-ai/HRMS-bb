import express from "express";
import { signup, login, refresh, logout, getProfile, updateProfile } from "./auth.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// Public auth endpoints
router.post("/signup", signup);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);

// Protected profile endpoints
router.use(protect);
router.route("/profile")
  .get(getProfile)
  .patch(updateProfile);

export default router;
