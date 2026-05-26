import express from "express";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const swaggerFilePath = path.join(__dirname, "./swagger-output.json");

let swaggerDocument = {};
if (fs.existsSync(swaggerFilePath)) {
  try {
    swaggerDocument = JSON.parse(fs.readFileSync(swaggerFilePath, "utf8"));
  } catch (error) {
    console.error("Error loading swagger-output.json:", error);
  }
} else {
  console.warn("swagger-output.json not found. Please run 'node swagger.js' first.");
}

router.use("/", swaggerUi.serve);
router.get("/", swaggerUi.setup(swaggerDocument));

export default router;
