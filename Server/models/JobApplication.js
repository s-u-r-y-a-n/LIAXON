import mongoose from "mongoose";

export const APPLICATION_STATUSES = [
    "Applied",
    "Under Review",
    "Shortlisted",
    "Interview Scheduled",
    "Rejected",
    "Hired",
];

export const EXPERIENCE_LEVELS = [
    "Fresher",
    "1-2 Years",
    "3-5 Years",
    "5+ Years",
    "Student / Intern",
];

const jobApplicationSchema = new mongoose.Schema(
    {
        jobOpening: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "JobOpening",
            default: null,
        },
        positionApplied: {
            type: String,
            required: [true, "Position applied for is required."],
            trim: true,
            maxlength: [150, "Position cannot exceed 150 characters."],
        },
        fullName: {
            type: String,
            required: [true, "Full name is required."],
            trim: true,
            maxlength: [150, "Full name cannot exceed 150 characters."],
        },
        email: {
            type: String,
            required: [true, "Email address is required."],
            trim: true,
            lowercase: true,
            maxlength: [200, "Email cannot exceed 200 characters."],
        },
        phone: {
            type: String,
            required: [true, "Phone number is required."],
            trim: true,
            maxlength: [30, "Phone number cannot exceed 30 characters."],
        },
        experienceLevel: {
            type: String,
            enum: {
                values: EXPERIENCE_LEVELS,
                message: "{VALUE} is not a valid experience level.",
            },
            default: "Fresher",
        },
        qualification: {
            type: String,
            trim: true,
            default: "",
            maxlength: [200, "Qualification cannot exceed 200 characters."],
        },
        currentCity: {
            type: String,
            trim: true,
            default: "",
            maxlength: [150, "Current city cannot exceed 150 characters."],
        },
        resume: {
            fileName: {
                type: String,
                default: "",
            },
            fileData: {
                type: String,
                default: "",
            },
            mimetype: {
                type: String,
                default: "",
            },
            size: {
                type: Number,
                default: 0,
            },
        },
        coverLetter: {
            type: String,
            trim: true,
            default: "",
            maxlength: [4000, "Cover note cannot exceed 4000 characters."],
        },
        status: {
            type: String,
            enum: {
                values: APPLICATION_STATUSES,
                message: "{VALUE} is not a valid application status.",
            },
            default: "Applied",
        },
        starred: {
            type: Boolean,
            default: false,
        },
        adminNotes: {
            type: String,
            trim: true,
            default: "",
            maxlength: [2000, "Admin notes cannot exceed 2000 characters."],
        },
    },
    {
        timestamps: true,
    },
);

const JobApplicationModel =
    mongoose.models.JobApplication ||
    mongoose.model("JobApplication", jobApplicationSchema);

export default JobApplicationModel;
