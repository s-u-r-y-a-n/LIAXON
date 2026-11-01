import mongoose from "mongoose";

export const INQUIRY_TYPES = [
        "Business Partnerships & Alliances",
        "Business Services & Sales Enquiries",
        "Careers & Recruitment",
        "General Enquiries"
    ]

export const INQUIRY_STATUSES = [
    "New",
    "In Review",
    "Contacted",
    "Resolved",
];

const contactInquirySchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: [true, "First name is required."],
            trim: true,
            maxlength: [100, "First name cannot exceed 100 characters."],
        },
        lastName: {
            type: String,
            trim: true,
            default: "",
            maxlength: [100, "Last name cannot exceed 100 characters."],
        },
        email: {
            type: String,
            required: [true, "Email is required."],
            trim: true,
            lowercase: true,
            maxlength: [200, "Email cannot exceed 200 characters."],
        },
        phone: {
            type: String,
            trim: true,
            default: "",
            maxlength: [30, "Phone number cannot exceed 30 characters."],
        },
        company: {
            type: String,
            trim: true,
            default: "",
            maxlength: [200, "Company name cannot exceed 200 characters."],
        },
        jobTitle: {
            type: String,
            trim: true,
            default: "",
            maxlength: [200, "Job title cannot exceed 200 characters."],
        },
        inquiryType: {
            type: String,
            enum: {
                values: INQUIRY_TYPES,
                message: "{VALUE} is not a valid inquiry type.",
            },
            default: "General Enquiries",
        },
        subject: {
            type: String,
            trim: true,
            default: "",
            maxlength: [250, "Subject cannot exceed 250 characters."],
        },
        message: {
            type: String,
            required: [true, "Message is required."],
            trim: true,
            maxlength: [5000, "Message cannot exceed 5000 characters."],
        },
        status: {
            type: String,
            enum: {
                values: INQUIRY_STATUSES,
                message: "{VALUE} is not a valid status.",
            },
            default: "New",
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
        ipAddress: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    },
);

// Virtual for full name
contactInquirySchema.virtual("fullName").get(function () {
    return `${this.firstName} ${this.lastName}`.trim();
});

// Configure JSON output to include virtuals
contactInquirySchema.set("toJSON", { virtuals: true });
contactInquirySchema.set("toObject", { virtuals: true });

const ContactInquiryModel =
    mongoose.models.ContactInquiry ||
    mongoose.model("ContactInquiry", contactInquirySchema);

export default ContactInquiryModel;
