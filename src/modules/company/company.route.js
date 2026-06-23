import express from "express";
import { getCompanyDetails, updateCompanyDetails } from "./company.controller.js";
import { protect, restrictTo } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.route("/")
  .get(getCompanyDetails)
  .put(restrictTo("hr_admin"), updateCompanyDetails);

export default router;
