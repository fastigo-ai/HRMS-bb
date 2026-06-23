import express from "express";
import { handleWebhook } from "./omnidimension.controller.js";

const router = express.Router();

// Webhook endpoint (must be publicly accessible, no auth middleware)
router.post("/", handleWebhook);

export default router;
