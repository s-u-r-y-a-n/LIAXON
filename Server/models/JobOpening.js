import mongoose from "mongoose";

export const EMPLOYMENT_TYPES = [
    "Full-time",
    "Part-time",
    "Internship",
    "Contract",
];

const jobOpeningSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Job title is required."],
            trim: true,
            maxlength: [150, "Job title cannot exceed 150 characters."],
        },
        domain: {
            type: String,
            required: [true, "Domain / Department is required."],
            trim: true,
            maxlength: [100, "Domain cannot exceed 100 characters."],
            default: "General",
        },
        employmentType: {
            type: String,
            enum: {
                values: EMPLOYMENT_TYPES,
                message: "{VALUE} is not a valid employment type.",
            },
            default: "Full-time",
        },
        location: {
            type: String,
            trim: true,
            default: "Tholayavattam, Kanyakumari (On-site)",
            maxlength: [200, "Location cannot exceed 200 characters."],
        },
        experienceLevel: {
            type: String,
            trim: true,
            default: "0-2 Years / Open to Freshers",
            maxlength: [100, "Experience level cannot exceed 100 characters."],
        },
        description: {
            type: String,
            required: [true, "Job description is required."],
            trim: true,
            maxlength: [5000, "Description cannot exceed 5000 characters."],
        },
        responsibilities: {
            type: [String],
            default: [],
        },
        requirements: {
            type: [String],
            default: [],
        },
        openingsCount: {
            type: Number,
            default: 1,
            min: [1, "Openings count must be at least 1."],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    },
);

const JobOpeningModel =
    mongoose.models.JobOpening ||
    mongoose.model("JobOpening", jobOpeningSchema);

export default JobOpeningModel;
