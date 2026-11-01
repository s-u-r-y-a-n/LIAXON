import express from "express";
import {
    adminLogin,
    refreshToken,
    adminLogout,
    getAdminProfile,
    updateAdminProfile,
} from "../controllers/authController.js";
import { authenticateToken } from "../middlewares/authenticateToken.js";

const router = express.Router();

// Public auth endpoints
router.post("/login", adminLogin);
router.post("/refresh-token", refreshToken);
router.post("/logout", adminLogout);

// Protected admin endpoints
router.get("/me", authenticateToken, getAdminProfile);
router.put("/profile", authenticateToken, updateAdminProfile);

export default router;
