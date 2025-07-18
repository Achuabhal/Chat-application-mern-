import express from "express";
import { protectRoute, isAdmin } from "../middleware/auth.middleware.js";
import { submitReport, getReports, markReportAsReviewed } from "../controllers/report.controller.js";

const router = express.Router();

router.post("/", protectRoute, submitReport);
router.get("/", protectRoute, isAdmin, getReports);
router.put("/:id/review", protectRoute, isAdmin, markReportAsReviewed);

export default router;
