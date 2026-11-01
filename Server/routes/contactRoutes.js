import express from "express";
import {
    createContactInquiry,
    getAllContactInquiries,
    getContactInquiryById,
    updateContactInquiry,
    deleteContactInquiry,
} from "../controllers/contactController.js";
import { authenticateToken } from "../middlewares/authenticateToken.js";

const router = express.Router();

// Public route: Visitor submits contact form
router.post("/", createContactInquiry);

// Admin-only routes (Protected)
router.get("/", authenticateToken, getAllContactInquiries);
router.get("/:id", authenticateToken, getContactInquiryById);
router.patch("/:id", authenticateToken, updateContactInquiry);
router.delete("/:id", authenticateToken, deleteContactInquiry);

export default router;
