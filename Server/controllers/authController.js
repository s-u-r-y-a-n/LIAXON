import jwt from "jsonwebtoken";
import AdminModel from "../models/Admin.js";
import { normalizeEmail, normalizeText } from "../utils/inputFields.js";
import { createAuthTokens } from "../utils/authUtils.js";
import { decryptPassword } from "../utils/passwordEncryption.js";

/**
 * @desc    Admin login, verify credentials, and store refreshToken in database
 * @route   POST /api/auth/login
 * @access  Public
 */
export const adminLogin = async (req, res) => {
    try {
        const email = normalizeEmail(req.body?.email);
        const rawPassword = req.body?.password;

        if (!email || !rawPassword) {
            return res.status(400).json({
                success: false,
                message: "Please provide both email and password.",
            });
        }

        // Find admin in the database
        const admin = await AdminModel.findOne({ email });

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

        // Password validation via bcrypt
        const decrypted = decryptPassword(rawPassword);
        const candidatePassword = decrypted || rawPassword;

        let isMatch = await admin.comparePassword(candidatePassword);
        if (!isMatch && decrypted && decrypted !== rawPassword) {
            isMatch = await admin.comparePassword(rawPassword);
        }

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

        // Create JWT access and refresh tokens
        const tokens = createAuthTokens(admin);

        // Store the refreshToken in the admin's refreshTokens array
        admin.refreshTokens = Array.isArray(admin.refreshTokens)
            ? admin.refreshTokens
            : [];
        admin.refreshTokens.push(tokens.refreshToken);

        // Retain only the latest 10 tokens to prevent unbounded growth while supporting multi-device login
        if (admin.refreshTokens.length > 10) {
            admin.refreshTokens = admin.refreshTokens.slice(-10);
        }

        await admin.save();

        return res.status(200).json({
            success: true,
            message: "Login successful. Welcome, Admin!",
            data: {
                admin: {
                    id: admin._id,
                    name: admin.name,
                    email: admin.email,
                    role: admin.role,
                },
                tokens,
            },
        });
    } catch (error) {
        console.error("Admin Login Error:", error);
        return res.status(500).json({
            success: false,
            message: "Could not log in right now. Please try again.",
        });
    }
};

/**
 * @desc    Refresh access token and rotate refreshToken in database
 * @route   POST /api/auth/refresh-token
 * @access  Public
 */
export const refreshToken = async (req, res) => {
    try {
        const token = normalizeText(req.body?.refreshToken);

        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Refresh token is required.",
            });
        }

        const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
        if (!JWT_REFRESH_SECRET) {
            return res.status(500).json({
                success: false,
                message: "JWT secret is not configured.",
            });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, JWT_REFRESH_SECRET);
        } catch {
            return res.status(403).json({
                success: false,
                message: "Invalid or expired refresh token. Please log in again.",
            });
        }

        // Verify that the token exists in the database
        const admin = await AdminModel.findById(decoded.id);

        if (!admin || !admin.refreshTokens?.includes(token)) {
            return res.status(403).json({
                success: false,
                message: "Refresh token is invalid or has been revoked. Please log in again.",
            });
        }

        // Generate new token pair
        const newTokens = createAuthTokens(admin);

        // Token rotation: remove old token and add the new one
        admin.refreshTokens = admin.refreshTokens.filter((t) => t !== token);
        admin.refreshTokens.push(newTokens.refreshToken);

        if (admin.refreshTokens.length > 10) {
            admin.refreshTokens = admin.refreshTokens.slice(-10);
        }

        await admin.save();

        return res.status(200).json({
            success: true,
            message: "Token refreshed successfully.",
            data: {
                tokens: newTokens,
            },
        });
    } catch (error) {
        console.error("Refresh Token Error:", error);
        return res.status(500).json({
            success: false,
            message: "Could not refresh token.",
        });
    }
};

/**
 * @desc    Admin logout (removes refreshToken from database)
 * @route   POST /api/auth/logout
 * @access  Public
 */
export const adminLogout = async (req, res) => {
    try {
        const token = normalizeText(req.body?.refreshToken);

        if (token) {
            await AdminModel.updateOne(
                { refreshTokens: token },
                { $pull: { refreshTokens: token } },
            );
        }

        return res.status(200).json({
            success: true,
            message: "Logged out successfully.",
        });
    } catch (error) {
        console.error("Admin Logout Error:", error);
        return res.status(500).json({
            success: false,
            message: "Could not log out. Please try again.",
        });
    }
};

/**
 * @desc    Get current authenticated admin profile
 * @route   GET /api/auth/me
 * @access  Protected
 */
export const getAdminProfile = async (req, res) => {
    try {
        const admin = await AdminModel.findById(req.user?.id).select(
            "-password -refreshTokens",
        );

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin profile not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Admin profile retrieved.",
            data: {
                admin,
            },
        });
    } catch (error) {
        console.error("Get Admin Profile Error:", error);
        return res.status(500).json({
            success: false,
            message: "Could not fetch profile.",
        });
    }
};

/**
 * @desc    Update current authenticated admin profile (name, email, password)
 * @route   PUT /api/auth/profile
 * @access  Protected
 */
export const updateAdminProfile = async (req, res) => {
    try {
        const adminId = req.user?.id;
        if (!adminId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Missing authentication credentials.",
            });
        }

        const admin = await AdminModel.findById(adminId);
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin account not found.",
            });
        }

        const {
            name,
            email,
            currentPassword: rawCurrentPassword,
            newPassword: rawNewPassword,
        } = req.body;

        const cleanName = normalizeText(name);
        const cleanEmail = normalizeEmail(email);

        // 1. Update Name
        if (cleanName) {
            if (cleanName.length < 2) {
                return res.status(400).json({
                    success: false,
                    message: "Name must be at least 2 characters long.",
                });
            }
            if (cleanName.length > 100) {
                return res.status(400).json({
                    success: false,
                    message: "Name cannot exceed 100 characters.",
                });
            }
            admin.name = cleanName;
        }

        // 2. Update Email
        if (cleanEmail && cleanEmail !== admin.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(cleanEmail)) {
                return res.status(400).json({
                    success: false,
                    message: "Please enter a valid email address.",
                });
            }

            // Check if another admin already uses this email
            const existingAdmin = await AdminModel.findOne({
                email: cleanEmail,
                _id: { $ne: admin._id },
            });
            if (existingAdmin) {
                return res.status(409).json({
                    success: false,
                    message: "This email address is already in use by another admin account.",
                });
            }

            admin.email = cleanEmail;
        }

        // 3. Update Password
        if (rawNewPassword) {
            if (!rawCurrentPassword) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide your current password to set a new password.",
                });
            }

            // Decrypt current and new password using CryptoJS AES key
            const currentPassword = decryptPassword(rawCurrentPassword);
            const newPassword = decryptPassword(rawNewPassword);

            if (!currentPassword) {
                return res.status(400).json({
                    success: false,
                    message: "Could not read current password. Please try again.",
                });
            }

            // Verify current password against database bcrypt hash
            const isMatch = await admin.comparePassword(currentPassword);
            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: "The current password you entered is incorrect.",
                });
            }

            // Validate new password rules
            if (!newPassword || newPassword.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: "New password must be at least 6 characters long.",
                });
            }

            if (currentPassword === newPassword) {
                return res.status(400).json({
                    success: false,
                    message: "New password must be different from your current password.",
                });
            }

            // Set new password (adminSchema pre-save hook will hash it with bcrypt)
            admin.password = newPassword;
        }

        await admin.save();

        const userPayload = {
            id: admin._id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
        };

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            user: userPayload,
            data: {
                admin: userPayload,
            },
        });
    } catch (error) {
        console.error("Update Admin Profile Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to update profile. Please try again.",
        });
    }
};

