import mongoose from "mongoose";
import ContactInquiryModel, {
    INQUIRY_TYPES,
    INQUIRY_STATUSES,
} from "../models/ContactInquiry.js";
import {
    normalizeText,
    normalizeEmail,
    isValidEmail,
    isValidPhone,
} from "../utils/inputFields.js";
import { sendContactNotificationEmail } from "../utils/sendContactEmail.js";


export const createContactInquiry = async (req, res) => {
    try {
        const firstName = normalizeText(req.body?.firstName);
        const lastName = normalizeText(req.body?.lastName);
        const email = normalizeEmail(req.body?.email);
        const phone = normalizeText(req.body?.phone);
        const company = normalizeText(req.body?.company);
        const jobTitle = normalizeText(req.body?.jobTitle);
        const inquiryTypeInput = normalizeText(req.body?.inquiryType);
        const subject = normalizeText(req.body?.subject);
        const message = normalizeText(req.body?.message);

        if (!firstName) {
            return res.status(400).json({
                success: false,
                message: "Please enter your first name.",
            });
        }
        if (firstName.length < 2) {
            return res.status(400).json({
                success: false,
                message: "First name must be at least 2 characters.",
            });
        }
        if (firstName.length > 100) {
            return res.status(400).json({
                success: false,
                message: "First name must be 100 characters or fewer.",
            });
        }

        if (lastName && lastName.length > 100) {
            return res.status(400).json({
                success: false,
                message: "Last name must be 100 characters or fewer.",
            });
        }

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

        if (phone && !isValidPhone(phone)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid phone number (e.g. +91 97870 15703).",
            });
        }

        if (company && company.length > 200) {
            return res.status(400).json({
                success: false,
                message: "Company name must be 200 characters or fewer.",
            });
        }
        if (jobTitle && jobTitle.length > 200) {
            return res.status(400).json({
                success: false,
                message: "Job title must be 200 characters or fewer.",
            });
        }

        let inquiryType = "General Enquiries";
        if (inquiryTypeInput) {
            if (!INQUIRY_TYPES.includes(inquiryTypeInput)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid inquiry type. Allowed values: ${INQUIRY_TYPES.join(", ")}`,
                });
            }
            inquiryType = inquiryTypeInput;
        }

        if (subject && subject.length > 250) {
            return res.status(400).json({
                success: false,
                message: "Subject must be 250 characters or fewer.",
            });
        }

        if (!message) {
            return res.status(400).json({
                success: false,
                message: "Please enter your message or enquiry details.",
            });
        }
        if (message.length < 10) {
            return res.status(400).json({
                success: false,
                message: "Message must be at least 10 characters long.",
            });
        }
        if (message.length > 5000) {
            return res.status(400).json({
                success: false,
                message: "Message must be 5000 characters or fewer.",
            });
        }

        const ipAddress =
            req.headers["x-forwarded-for"]?.split(",")[0] ||
            req.socket?.remoteAddress ||
            "";

        const newInquiry = await ContactInquiryModel.create({
            firstName,
            lastName,
            email,
            phone,
            company,
            jobTitle,
            inquiryType,
            subject,
            message,
            ipAddress,
        });

        // Broadcast real-time Socket.io event to connected admin clients
        const io = req.app.get("io");
        if (io) {
            const payload = newInquiry.toJSON ? newInquiry.toJSON() : newInquiry;
            io.emit("new_contact_inquiry", payload);
            io.emit("newContactInquiry", payload);
        }

        // Trigger email notification to the respective department head
        sendContactNotificationEmail(newInquiry).catch((err) => {
            console.error("[Email Notification Trigger Error]:", err.message);
        });

        return res.status(201).json({
            success: true,
            message: "Thank you for reaching out! Your inquiry has been received. Our team will contact you shortly.",
            data: {
                id: newInquiry._id,
                fullName: newInquiry.fullName,
                email: newInquiry.email,
                inquiryType: newInquiry.inquiryType,
                createdAt: newInquiry.createdAt,
            },
        });
    } catch (error) {
        console.error("Create Contact Inquiry Error:", error);
        return res.status(500).json({
            success: false,
            message: "We could not process your inquiry right now. Please try again later.",
        });
    }
};

export const getAllContactInquiries = async (req, res) => {
    try {
        const {
            status,
            inquiryType,
            starred,
            q,
            sortBy = "createdAt",
            order = "desc",
        } = req.query;

        const query = {};

        if (status && INQUIRY_STATUSES.includes(status)) {
            query.status = status;
        }

        if (inquiryType && INQUIRY_TYPES.includes(inquiryType)) {
            query.inquiryType = inquiryType;
        }

        if (starred !== undefined && starred !== "") {
            query.starred = starred === "true";
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
            ];
        }

        const sortDirection = order === "asc" ? 1 : -1;

        const inquiries = await ContactInquiryModel.find(query)
            .sort({ [sortBy]: sortDirection })
            .lean();

        return res.status(200).json({
            success: true,
            message: "Contact inquiries retrieved successfully.",
            data: inquiries,
        });
    } catch (error) {
        console.error("Get All Contact Inquiries Error:", error);
        return res.status(500).json({
            success: false,
            message: "Could not fetch contact inquiries.",
        });
    }
};

/**
 * @desc    Get a single contact inquiry by ID
 * @route   GET /api/contact/:id
 * @access  Internal / Admin
 */
export const getContactInquiryById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid inquiry ID format.",
            });
        }

        const inquiry = await ContactInquiryModel.findById(id);

        if (!inquiry) {
            return res.status(404).json({
                success: false,
                message: "Contact inquiry not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Contact inquiry retrieved successfully.",
            data: inquiry,
        });
    } catch (error) {
        console.error("Get Contact Inquiry Error:", error);
        return res.status(500).json({
            success: false,
            message: "Could not fetch contact inquiry details.",
        });
    }
};

/**
 * @desc    Update inquiry status, starred flag, or admin notes
 * @route   PATCH /api/contact/:id
 * @access  Internal / Admin
 */
export const updateContactInquiry = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, starred, adminNotes } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid inquiry ID format.",
            });
        }

        const updateFields = {};

        if (status !== undefined) {
            if (!INQUIRY_STATUSES.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid status. Allowed values: ${INQUIRY_STATUSES.join(", ")}`,
                });
            }
            updateFields.status = status;
        }

        if (starred !== undefined) {
            updateFields.starred = Boolean(starred);
        }

        if (adminNotes !== undefined) {
            if (typeof adminNotes !== "string" || adminNotes.length > 2000) {
                return res.status(400).json({
                    success: false,
                    message: "Admin notes must be 2000 characters or fewer.",
                });
            }
            updateFields.adminNotes = adminNotes.trim();
        }

        const updatedInquiry = await ContactInquiryModel.findByIdAndUpdate(
            id,
            { $set: updateFields },
            { new: true, runValidators: true },
        );

        if (!updatedInquiry) {
            return res.status(404).json({
                success: false,
                message: "Contact inquiry not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Contact inquiry updated successfully.",
            data: updatedInquiry,
        });
    } catch (error) {
        console.error("Update Contact Inquiry Error:", error);
        return res.status(500).json({
            success: false,
            message: "Could not update contact inquiry.",
        });
    }
};

/**
 * @desc    Delete a contact inquiry
 * @route   DELETE /api/contact/:id
 * @access  Internal / Admin
 */
export const deleteContactInquiry = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid inquiry ID format.",
            });
        }

        const inquiry = await ContactInquiryModel.findByIdAndDelete(id);

        if (!inquiry) {
            return res.status(404).json({
                success: false,
                message: "Contact inquiry not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Contact inquiry deleted successfully.",
        });
    } catch (error) {
        console.error("Delete Contact Inquiry Error:", error);
        return res.status(500).json({
            success: false,
            message: "Could not delete contact inquiry.",
        });
    }
};
