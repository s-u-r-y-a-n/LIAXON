import express from "express";
import {
    getJobOpenings,
    getJobOpeningById,
    createJobOpening,
    updateJobOpening,
    deleteJobOpening,
    submitJobApplication,
    getAllJobApplications,
    getJobApplicationById,
    updateJobApplication,
    deleteJobApplication,
} from "../controllers/careerController.js";
import { handleResumeUpload } from "../middlewares/uploadMiddleware.js";
import { authenticateToken } from "../middlewares/authenticateToken.js";

const router = express.Router();

// ==========================================
// JOB OPENINGS ROUTES
// ==========================================
// Public routes
router.get("/openings", getJobOpenings);
router.get("/openings/:id", getJobOpeningById);

// Admin-only routes (Protected)
router.post("/openings", authenticateToken, createJobOpening);
router.patch("/openings/:id", authenticateToken, updateJobOpening);
router.delete("/openings/:id", authenticateToken, deleteJobOpening);

// ==========================================
// JOB APPLICATIONS ROUTES
// ==========================================
// Public: Submit application with multipart/form-data resume file upload
router.post("/apply", handleResumeUpload, submitJobApplication);

// Admin-only routes (Protected)
router.get("/applications", authenticateToken, getAllJobApplications);
router.get("/applications/:id", authenticateToken, getJobApplicationById);
router.patch("/applications/:id/status", authenticateToken, updateJobApplication);
router.delete("/applications/:id", authenticateToken, deleteJobApplication);

export default router;
