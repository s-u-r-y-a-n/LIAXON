import mongoose from "mongoose";
import JobOpeningModel, {
    EMPLOYMENT_TYPES,
} from "../models/JobOpening.js";
import JobApplicationModel, {
    APPLICATION_STATUSES,
    EXPERIENCE_LEVELS,
} from "../models/JobApplication.js";
import {
    normalizeText,
    normalizeEmail,
    isValidEmail,
    isValidPhone,
} from "../utils/inputFields.js";
// ==========================================
// JOB OPENINGS CONTROLLERS
// ==========================================

/**
 * @desc    Get all job openings (Public - No Pagination)
 * @route   GET /api/careers/openings
 * @access  Public
 */
export const getJobOpenings = async (req, res) => {
    try {
        const {
            domain,
            employmentType,
            isActive,
            q,
            sortBy = "createdAt",
            order = "desc",
        } = req.query;

        const query = {};

        // By default, show active openings for public view
        if (isActive !== undefined) {
            query.isActive = isActive === "true";
        } else {
            query.isActive = true;
        }

        if (domain && typeof domain === "string") {
            query.domain = new RegExp(domain.trim(), "i");
        }

        if (employmentType && EMPLOYMENT_TYPES.includes(employmentType)) {
            query.employmentType = employmentType;
        }

        if (q && typeof q === "string") {
            const regex = new RegExp(q.trim(), "i");
            query.$or = [
                { title: regex },
                { domain: regex },
                { description: regex },
                { location: regex },
            ];
        }

        const sortDirection = order === "asc" ? 1 : -1;

        const openings = await JobOpeningModel.find(query)
            .sort({ [sortBy]: sortDirection })
            .lean();

        return res.status(200).json({
            success: true,
            message: "Job openings retrieved successfully.",
            data: openings,
        });
    } catch (error) {
        console.error("Get Job Openings Error:", error);
        return res.status(500).json({
            success: false,
            message: "Could not fetch job openings.",
        });
    }
};

/**
 * @desc    Get single job opening by ID (Public)
 * @route   GET /api/careers/openings/:id
 * @access  Public
 */
export const getJobOpeningById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid job opening ID format.",
            });
        }

        const opening = await JobOpeningModel.findById(id).lean();

        if (!opening) {
            return res.status(404).json({
                success: false,
                message: "Job opening not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Job opening details retrieved.",
            data: opening,
        });
    } catch (error) {
        console.error("Get Job Opening Detail Error:", error);
        return res.status(500).json({
            success: false,
            message: "Could not fetch job opening details.",
        });
    }
};

/**
 * @desc    Create a new job opening (Admin)
 * @route   POST /api/careers/openings
 * @access  Internal / Admin
 */
export const createJobOpening = async (req, res) => {
    try {
        const title = normalizeText(req.body?.title);
        const domain = normalizeText(req.body?.domain) || "General";
        const employmentType = normalizeText(req.body?.employmentType) || "Full-time";
        const location = normalizeText(req.body?.location) || "Tholayavattam, Kanyakumari (On-site)";
        const experienceLevel = normalizeText(req.body?.experienceLevel) || "0-2 Years / Open to Freshers";
        const description = normalizeText(req.body?.description);
        const responsibilities = Array.isArray(req.body?.responsibilities)
            ? req.body.responsibilities.map((r) => normalizeText(r)).filter(Boolean)
            : [];
        const requirements = Array.isArray(req.body?.requirements)
            ? req.body.requirements.map((r) => normalizeText(r)).filter(Boolean)
            : [];
        const openingsCount = Number(req.body?.openingsCount) || 1;
        const isActive = req.body?.isActive !== undefined ? Boolean(req.body.isActive) : true;

        if (!title) {
            return res.status(400).json({
                success: false,
                message: "Please enter a job title.",
            });
        }

        if (!domain) {
            return res.status(400).json({
                success: false,
                message: "Please enter a domain or department name.",
            });
        }

        if (!EMPLOYMENT_TYPES.includes(employmentType)) {
            return res.status(400).json({
                success: false,
                message: `Employment type is invalid. Allowed: ${EMPLOYMENT_TYPES.join(", ")}`,
            });
        }

        if (!description) {
            return res.status(400).json({
                success: false,
                message: "Please enter a job description.",
            });
        }

        const newOpening = await JobOpeningModel.create({
            title,
            domain,
            employmentType,
            location,
            experienceLevel,
            description,
            responsibilities,
            requirements,
            openingsCount,
            isActive,
        });

        return res.status(201).json({
            success: true,
            message: "Job opening created successfully.",
            data: newOpening,
        });
    } catch (error) {
        console.error("Create Job Opening Error:", error);
        return res.status(500).json({
            success: false,
            message: "Could not create job opening.",
        });
    }
};

/**
 * @desc    Update a job opening (Admin)
 * @route   PATCH /api/careers/openings/:id
 * @access  Internal / Admin
 */
export const updateJobOpening = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid job opening ID format.",
            });
        }

        const allowedFields = [
            "title",
            "domain",
            "employmentType",
            "location",
            "experienceLevel",
            "description",
            "responsibilities",
            "requirements",
            "openingsCount",
            "isActive",
        ];

        const updateData = {};
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        }

        if (updateData.employmentType && !EMPLOYMENT_TYPES.includes(updateData.employmentType)) {
            return res.status(400).json({
                success: false,
                message: `Employment type is invalid. Allowed: ${EMPLOYMENT_TYPES.join(", ")}`,
            });
        }

        const updatedOpening = await JobOpeningModel.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true },
        );

        if (!updatedOpening) {
            return res.status(404).json({
                success: false,
                message: "Job opening not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Job opening updated successfully.",
            data: updatedOpening,
        });
    } catch (error) {
        console.error("Update Job Opening Error:", error);
        return res.status(500).json({
            success: false,
            message: "Could not update job opening.",
        });
    }
};

/**
 * @desc    Delete a job opening (Admin)
 * @route   DELETE /api/careers/openings/:id
 * @access  Internal / Admin
 */
export const deleteJobOpening = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid job opening ID format.",
            });
        }

        const opening = await JobOpeningModel.findByIdAndDelete(id);

        if (!opening) {
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
        console.error("Delete Job Opening Error:", error);
        return res.status(500).json({
            success: false,
            message: "Could not delete job opening.",
        });
    }
};


// ==========================================
// JOB APPLICATIONS CONTROLLERS
// ==========================================

/**
 * @desc    Submit a job application with multipart/form-data resume upload
 * @route   POST /api/careers/apply
 * @access  Public
 */
export const submitJobApplication = async (req, res) => {
    try {
        const fullName = normalizeText(req.body?.fullName);
        const email = normalizeEmail(req.body?.email);
        const phone = normalizeText(req.body?.phone);
        const positionApplied = normalizeText(req.body?.positionApplied);
        const experienceLevel = normalizeText(req.body?.experienceLevel) || "Fresher";
        const qualification = normalizeText(req.body?.qualification);
        const currentCity = normalizeText(req.body?.currentCity);
        const coverLetter = normalizeText(req.body?.coverLetter);
        const jobOpeningId = req.body?.jobOpening;

        // Validation: Full Name
        if (!fullName) {
            return res.status(400).json({
                success: false,
                message: "Please enter your full name.",
            });
        }
        if (fullName.length < 2) {
            return res.status(400).json({
                success: false,
                message: "Full name must be at least 2 characters.",
            });
        }

        // Validation: Email
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Please enter your email address.",
            });
        }
        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address.",
            });
        }

        // Validation: Phone
        if (!phone) {
            return res.status(400).json({
                success: false,
                message: "Please enter your phone number.",
            });
        }
        if (!isValidPhone(phone)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid phone number (e.g. +91 73050 47532).",
            });
        }

        // Validation: Position Applied
        if (!positionApplied) {
            return res.status(400).json({
                success: false,
                message: "Please specify the position you are applying for.",
            });
        }

        // Validation: Experience Level
        if (experienceLevel && !EXPERIENCE_LEVELS.includes(experienceLevel)) {
            return res.status(400).json({
                success: false,
                message: `Experience level is invalid. Allowed: ${EXPERIENCE_LEVELS.join(", ")}`,
            });
        }

        // Validate optional jobOpening ObjectId
        let validatedJobId = null;
        if (jobOpeningId && mongoose.Types.ObjectId.isValid(jobOpeningId)) {
            const exists = await JobOpeningModel.exists({ _id: jobOpeningId });
            if (exists) {
                validatedJobId = jobOpeningId;
            }
        }

        // Base64 Resume File Object
        const resume = req.file
            ? {
                fileName: req.file.originalname,
                fileData: `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
                mimetype: req.file.mimetype,
                size: req.file.size,
            }
            : {
                fileName: "",
                fileData: "",
                mimetype: "",
                size: 0,
            };

        const newApplication = await JobApplicationModel.create({
            jobOpening: validatedJobId,
            positionApplied,
            fullName,
            email,
            phone,
            experienceLevel,
            qualification,
            currentCity,
            resume,
            coverLetter,
        });

        return res.status(201).json({
            success: true,
            message:
                "Thank you for applying to Liaxon Consulting! Your application has been received and our recruitment team will review it shortly.",
            data: {
                id: newApplication._id,
                fullName: newApplication.fullName,
                positionApplied: newApplication.positionApplied,
                email: newApplication.email,
                resumeFileName: newApplication.resume?.fileName || "None",
                status: newApplication.status,
                createdAt: newApplication.createdAt,
            },
        });
    } catch (error) {
        console.error("Submit Job Application Error:", error);
        return res.status(500).json({
            success: false,
            message: "We could not submit your application right now. Please try again later.",
        });
    }
};

/**
 * @desc    Get all job applications without pagination (Admin)
 * @route   GET /api/careers/applications
 * @access  Internal / Admin
 */
export const getAllJobApplications = async (req, res) => {
    try {
        const {
            status,
            positionApplied,
            experienceLevel,
            starred,
            q,
            sortBy = "createdAt",
            order = "desc",
        } = req.query;

        const query = {};

        if (status && APPLICATION_STATUSES.includes(status)) {
            query.status = status;
        }

        if (positionApplied) {
            query.positionApplied = new RegExp(positionApplied.trim(), "i");
        }

        if (experienceLevel && EXPERIENCE_LEVELS.includes(experienceLevel)) {
            query.experienceLevel = experienceLevel;
        }

        if (starred !== undefined && starred !== "") {
            query.starred = starred === "true";
        }

        if (q && typeof q === "string") {
            const regex = new RegExp(q.trim(), "i");
            query.$or = [
                { fullName: regex },
                { email: regex },
                { phone: regex },
                { positionApplied: regex },
                { currentCity: regex },
                { qualification: regex },
            ];
        }

        const sortDirection = order === "asc" ? 1 : -1;

        const applications = await JobApplicationModel.find(query)
            .populate("jobOpening", "title domain employmentType location")
            .sort({ [sortBy]: sortDirection })
            .lean();

        return res.status(200).json({
            success: true,
            message: "Job applications retrieved successfully.",
            data: applications,
        });
    } catch (error) {
        console.error("Get All Job Applications Error:", error);
        return res.status(500).json({
            success: false,
            message: "Could not fetch job applications.",
        });
    }
};

/**
 * @desc    Get single job application by ID (Admin)
 * @route   GET /api/careers/applications/:id
 * @access  Internal / Admin
 */
export const getJobApplicationById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid application ID format.",
            });
        }

        const application = await JobApplicationModel.findById(id).populate(
            "jobOpening",
            "title domain employmentType location",
        );

        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Job application not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Job application retrieved successfully.",
            data: application,
        });
    } catch (error) {
        console.error("Get Job Application Detail Error:", error);
        return res.status(500).json({
            success: false,
            message: "Could not fetch job application details.",
        });
    }
};

/**
 * @desc    Update application status, starred, or admin notes (Admin)
 * @route   PATCH /api/careers/applications/:id
 * @access  Internal / Admin
 */
export const updateJobApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, starred, adminNotes } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid application ID format.",
            });
        }

        const updateData = {};

        if (status !== undefined) {
            if (!APPLICATION_STATUSES.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid status. Allowed: ${APPLICATION_STATUSES.join(", ")}`,
                });
            }
            updateData.status = status;
        }

        if (starred !== undefined) {
            updateData.starred = Boolean(starred);
        }

        if (adminNotes !== undefined) {
            updateData.adminNotes = normalizeText(adminNotes);
        }

        const updated = await JobApplicationModel.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true },
        );

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Job application not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Job application updated successfully.",
            data: updated,
        });
    } catch (error) {
        console.error("Update Job Application Error:", error);
        return res.status(500).json({
            success: false,
            message: "Could not update job application.",
        });
    }
};

/**
 * @desc    Delete a job application and remove its resume file (Admin)
 * @route   DELETE /api/careers/applications/:id
 * @access  Internal / Admin
 */
export const deleteJobApplication = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid application ID format.",
            });
        }

        const application = await JobApplicationModel.findById(id);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Job application not found.",
            });
        }

        await JobApplicationModel.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Job application deleted successfully.",
        });
    } catch (error) {
        console.error("Delete Job Application Error:", error);
        return res.status(500).json({
            success: false,
            message: "Could not delete job application.",
        });
    }
};
