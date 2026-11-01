import express from "express";
import jwt from "jsonwebtoken";
import AdminModel from "../models/Admin.js";
import ContactInquiryModel, {
    INQUIRY_TYPES,
    INQUIRY_STATUSES,
} from "../models/ContactInquiry.js";
import JobOpeningModel from "../models/JobOpening.js";
import JobApplicationModel from "../models/JobApplication.js";
import { authenticateToken } from "../middlewares/authenticateToken.js";
import { normalizeEmail, normalizeText } from "../utils/inputFields.js";
import { createAuthTokens } from "../utils/authUtils.js";
import { decryptPassword } from "../utils/passwordEncryption.js";
import { updateAdminProfile } from "../controllers/authController.js";

const router = express.Router();

// ==========================================
// 1. AUTHENTICATION ENDPOINTS
// ==========================================

/**
 * @route   POST /admin/auth/login
 * @desc    Authenticate admin and return accessToken & user
 * @access  Public
 */
router.post("/auth/login", async (req, res) => {
    try {
        const email = normalizeEmail(req.body?.email);
        const rawPassword = req.body?.password;

        if (!email || !rawPassword) {
            return res.status(400).json({
                success: false,
                message: "Please provide both email and password.",
            });
        }

        const admin = await AdminModel.findOne({ email });
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

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

        const tokens = createAuthTokens(admin);

        admin.refreshTokens = Array.isArray(admin.refreshTokens)
            ? admin.refreshTokens
            : [];
        admin.refreshTokens.push(tokens.refreshToken);
        if (admin.refreshTokens.length > 10) {
            admin.refreshTokens = admin.refreshTokens.slice(-10);
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
            message: "Login successful.",
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: userPayload,
            data: {
                admin: userPayload,
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
});

/**
 * @route   GET /admin/auth/me
 * @desc    Verify accessToken and return current admin profile
 * @access  Protected
 */
router.get("/auth/me", authenticateToken, async (req, res) => {
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

        const userPayload = {
            id: admin._id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
        };

        return res.status(200).json({
            success: true,
            user: userPayload,
            data: {
                admin: userPayload,
            },
        });
    } catch (error) {
        console.error("Get Admin Profile Error:", error);
        return res.status(500).json({
            success: false,
            message: "Could not fetch profile.",
        });
    }
});

/**
 * @route   PUT /admin/auth/profile
 * @desc    Update admin name, email, or password (with current password verification)
 * @access  Protected
 */
router.put("/auth/profile", authenticateToken, updateAdminProfile);
router.put("/profile", authenticateToken, updateAdminProfile);

// ==========================================
// 2. DASHBOARD OVERVIEW ENDPOINTS
// ==========================================

/**
 * @route   GET /admin/dashboard/stats
 * @desc    Return aggregate metrics and recent activity
 * @access  Protected
 */
router.get("/dashboard/stats", authenticateToken, async (req, res) => {
    try {
        const [
            totalInquiries,
            unreadInquiries,
            activeJobs,
            totalJobs,
            totalApplications,
            pendingApplications,
            recentInquiries,
            recentApplications,
        ] = await Promise.all([
            ContactInquiryModel.countDocuments(),
            ContactInquiryModel.countDocuments({ status: { $in: ["New", "In Review"] } }),
            JobOpeningModel.countDocuments({ isActive: true }),
            JobOpeningModel.countDocuments(),
            JobApplicationModel.countDocuments(),
            JobApplicationModel.countDocuments({
                status: { $in: ["Applied", "Under Review"] },
            }),
            ContactInquiryModel.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .lean(),
            JobApplicationModel.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .populate("jobOpening", "title domain employmentType")
                .lean(),
        ]);

        return res.status(200).json({
            success: true,
            stats: {
                totalInquiries,
                unreadInquiries,
                activeJobs,
                totalJobs,
                totalApplications,
                pendingApplications,
            },
            recentInquiries,
            recentApplications,
        });
    } catch (error) {
        console.error("Admin Dashboard Stats Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve dashboard statistics.",
        });
    }
});

// ==========================================
// 3. INQUIRIES & CONTACT MESSAGES ENDPOINTS
// ==========================================

/**
 * @route   GET /admin/contacts
 * @desc    Get list of contact messages
 * @access  Protected
 */
router.get("/contacts", authenticateToken, async (req, res) => {
    try {
        const {
            status,
            inquiryType,
            q,
            sortBy = "createdAt",
            order = "desc",
        } = req.query;

        const query = {};

        if (status && status !== "All" && INQUIRY_STATUSES.includes(status)) {
            query.status = status;
        }

        if (
            inquiryType &&
            inquiryType !== "All" &&
            INQUIRY_TYPES.includes(inquiryType)
        ) {
            query.inquiryType = inquiryType;
        }

        if (q && typeof q === "string") {
            const regex = new RegExp(q.trim(), "i");
            query.$or = [
                { firstName: regex },
                { lastName: regex },
                { email: regex },
                { company: regex },
                { subject: regex },
                { message: regex },
                { inquiryType: regex },
            ];
        }

        const sortDirection = order === "asc" ? 1 : -1;

        const inquiries = await ContactInquiryModel.find(query)
            .sort({ [sortBy]: sortDirection })
            .lean();

        return res.status(200).json({
            success: true,
            count: inquiries.length,
            inquiries,
            data: inquiries,
        });
    } catch (error) {
        console.error("Admin Get Contacts Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch contact inquiries.",
        });
    }
});

/**
 * @route   PATCH /admin/contacts/:id/status
 * @desc    Update contact message status (New / In Review / Contacted / Resolved / Archived)
 * @access  Protected
 */
router.patch("/contacts/:id/status", authenticateToken, async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({
                success: false,
                message: "Status field is required.",
            });
        }

        const inquiry = await ContactInquiryModel.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true },
        );

        if (!inquiry) {
            return res.status(404).json({
                success: false,
                message: "Contact inquiry not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Status updated successfully.",
            inquiry,
        });
    } catch (error) {
        console.error("Admin Update Contact Status Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update contact inquiry status.",
        });
    }
});

/**
 * @route   DELETE /admin/contacts/:id
 * @desc    Delete contact message
 * @access  Protected
 */
router.delete("/contacts/:id", authenticateToken, async (req, res) => {
    try {
        const inquiry = await ContactInquiryModel.findByIdAndDelete(req.params.id);
        if (!inquiry) {
            return res.status(404).json({
                success: false,
                message: "Contact inquiry not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Contact message deleted successfully.",
        });
    } catch (error) {
        console.error("Admin Delete Contact Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete contact inquiry.",
        });
    }
});

// ==========================================
// 4. JOB POSTINGS ENDPOINTS
// ==========================================

/**
 * @route   GET /admin/jobs
 * @desc    List all jobs
 * @access  Protected
 */
router.get("/jobs", authenticateToken, async (req, res) => {
    try {
        const jobs = await JobOpeningModel.find()
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            count: jobs.length,
            jobs,
            data: jobs,
        });
    } catch (error) {
        console.error("Admin Get Jobs Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch job postings.",
        });
    }
});

/**
 * @route   POST /admin/jobs
 * @desc    Create a job opening
 * @access  Protected
 */
router.post("/jobs", authenticateToken, async (req, res) => {
    try {
        const {
            title,
            department,
            domain,
            location,
            type,
            employmentType,
            experience,
            experienceLevel,
            description,
            responsibilities,
            requirements,
            openingsCount,
            isActive,
        } = req.body;

        if (!title || !description) {
            return res.status(400).json({
                success: false,
                message: "Job title and description are required.",
            });
        }

        const parseList = (item) => {
            if (Array.isArray(item)) return item;
            if (typeof item === "string") {
                return item
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean);
            }
            return [];
        };

        const job = new JobOpeningModel({
            title: title.trim(),
            domain: (department || domain || "General").trim(),
            location: (location || "On-site").trim(),
            employmentType: type || employmentType || "Full-time",
            experienceLevel: experience || experienceLevel || "0-2 Years / Open to Freshers",
            description: description.trim(),
            responsibilities: parseList(responsibilities),
            requirements: parseList(requirements),
            openingsCount: Number(openingsCount) || 1,
            isActive: isActive !== undefined ? Boolean(isActive) : true,
        });

        await job.save();

        return res.status(201).json({
            success: true,
            message: "Job opening created successfully.",
            job,
        });
    } catch (error) {
        console.error("Admin Create Job Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to create job posting.",
        });
    }
});

/**
 * @route   PUT /admin/jobs/:id or PATCH /admin/jobs/:id
 * @desc    Update a job opening
 * @access  Protected
 */
const updateJobHandler = async (req, res) => {
    try {
        const {
            title,
            department,
            domain,
            location,
            type,
            employmentType,
            experience,
            experienceLevel,
            description,
            responsibilities,
            requirements,
            openingsCount,
            isActive,
        } = req.body;

        const updateData = {};
        if (title !== undefined) updateData.title = title.trim();
        if (department !== undefined || domain !== undefined)
            updateData.domain = (department || domain).trim();
        if (location !== undefined) updateData.location = location.trim();
        if (type !== undefined || employmentType !== undefined)
            updateData.employmentType = type || employmentType;
        if (experience !== undefined || experienceLevel !== undefined)
            updateData.experienceLevel = experience || experienceLevel;
        if (description !== undefined) updateData.description = description.trim();
        if (openingsCount !== undefined) updateData.openingsCount = Number(openingsCount);
        if (isActive !== undefined) updateData.isActive = Boolean(isActive);

        const parseList = (item) => {
            if (Array.isArray(item)) return item;
            if (typeof item === "string") {
                return item
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean);
            }
            return undefined;
        };

        if (responsibilities !== undefined) {
            const parsed = parseList(responsibilities);
            if (parsed) updateData.responsibilities = parsed;
        }
        if (requirements !== undefined) {
            const parsed = parseList(requirements);
            if (parsed) updateData.requirements = parsed;
        }

        const updatedJob = await JobOpeningModel.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true },
        );

        if (!updatedJob) {
            return res.status(404).json({
                success: false,
                message: "Job opening not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Job opening updated successfully.",
            job: updatedJob,
        });
    } catch (error) {
        console.error("Admin Update Job Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to update job posting.",
        });
    }
};

router.put("/jobs/:id", authenticateToken, updateJobHandler);
router.patch("/jobs/:id", authenticateToken, updateJobHandler);

/**
 * @route   DELETE /admin/jobs/:id
 * @desc    Delete a job opening
 * @access  Protected
 */
router.delete("/jobs/:id", authenticateToken, async (req, res) => {
    try {
        const job = await JobOpeningModel.findByIdAndDelete(req.params.id);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job opening not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Job opening deleted successfully.",
        });
    } catch (error) {
        console.error("Admin Delete Job Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete job posting.",
        });
    }
});

// ==========================================
// 5. JOB APPLICATIONS ENDPOINTS
// ==========================================

/**
 * @route   GET /admin/applications
 * @desc    List received candidate applications
 * @access  Protected
 */
router.get("/applications", authenticateToken, async (req, res) => {
    try {
        const applications = await JobApplicationModel.find()
            .sort({ createdAt: -1 })
            .populate("jobOpening", "title domain employmentType location")
            .lean();

        // Ensure resume download/view URLs are easily accessible for frontend
        const mapped = applications.map((app) => ({
            ...app,
            resumeUrl:
                app.resume?.fileData?.startsWith("data:") ||
                app.resume?.fileData?.startsWith("http")
                    ? app.resume.fileData
                    : app.resume?.fileName
                      ? `/uploads/${app.resume.fileName}`
                      : null,
        }));

        return res.status(200).json({
            success: true,
            count: mapped.length,
            applications: mapped,
            data: mapped,
        });
    } catch (error) {
        console.error("Admin Get Applications Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch job applications.",
        });
    }
});

/**
 * @route   PATCH /admin/applications/:id/status
 * @desc    Update application status (Applied / Under Review / Shortlisted / Interview Scheduled / Rejected / Hired)
 * @access  Protected
 */
router.patch("/applications/:id/status", authenticateToken, async (req, res) => {
    try {
        const { status, adminNotes } = req.body;
        if (!status) {
            return res.status(400).json({
                success: false,
                message: "Status field is required.",
            });
        }

        const updateFields = { status };
        if (adminNotes !== undefined) {
            updateFields.adminNotes = adminNotes;
        }

        const updatedApp = await JobApplicationModel.findByIdAndUpdate(
            req.params.id,
            updateFields,
            { new: true, runValidators: true },
        ).populate("jobOpening", "title domain");

        if (!updatedApp) {
            return res.status(404).json({
                success: false,
                message: "Job application not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Application status updated successfully.",
            application: updatedApp,
        });
    } catch (error) {
        console.error("Admin Update Application Status Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update application status.",
        });
    }
});

/**
 * @route   DELETE /admin/applications/:id
 * @desc    Delete a job application
 * @access  Protected
 */
router.delete("/applications/:id", authenticateToken, async (req, res) => {
    try {
        const app = await JobApplicationModel.findByIdAndDelete(req.params.id);
        if (!app) {
            return res.status(404).json({
                success: false,
                message: "Job application not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Application deleted successfully.",
        });
    } catch (error) {
        console.error("Admin Delete Application Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete application.",
        });
    }
});

export default router;
