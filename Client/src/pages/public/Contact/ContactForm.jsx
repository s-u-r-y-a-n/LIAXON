import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
    Box,
    TextField,
    Button,
    MenuItem,
    Alert,
    CircularProgress,
    Snackbar,
} from "@mui/material";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { publicContactApi } from "../../../services/publicApi.js";

const INQUIRY_TYPES = [
    "Business Partnerships & Alliances",
    "Business Services & Sales Enquiries",
    "Careers & Recruitment",
    "General Enquiries",
];

const INITIAL_VALIDATION_ERROR = {
    name: false,
    email: false,
    phone: false,
    inquiryType: false,
    jobTitle: false,
    message: false,
};

const INITIAL_ERROR_MESSAGE = {
    name: "",
    email: "",
    phone: "",
    inquiryType: "",
    jobTitle: "",
    message: "",
};

export default function ContactForm({
    prefilledJob = "",
    prefilledService = "",
    initialInquiryType = "",
    onSuccess,
}) {
    const [searchParams] = useSearchParams();

    // Query params fallback
    const paramService = prefilledService || searchParams.get("service") || "";
    const paramType =
        initialInquiryType ||
        searchParams.get("type") ||
        searchParams.get("inquiryType") ||
        "";
    const paramJob =
        prefilledJob ||
        searchParams.get("jobTitle") ||
        searchParams.get("role") ||
        "";

    const resolvedInitialType =
        paramType && INQUIRY_TYPES.includes(paramType)
            ? paramType
            : paramJob
            ? "Careers & Recruitment"
            : paramService
            ? "Business Services & Sales Enquiries"
            : "General Enquiries";

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        company: "",
        jobTitle: paramJob,
        inquiryType: resolvedInitialType,
        serviceInterested: paramService || resolvedInitialType,
        subject: paramJob
            ? `Application / Career Inquiry: ${paramJob}`
            : paramService
            ? `Inquiry regarding ${paramService}`
            : "",
        message: "",
    });

    const [submitting, setSubmitting] = useState(false);
    const [serverError, setServerError] = useState("");
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    // Team Blueprint: Two-state client-side validation
    const [validationError, setValidationError] = useState({
        name: false,
        email: false,
        phone: false,
        inquiryType: false,
        jobTitle: false,
        message: false,
    });

    const [errorMessage, setErrorMessage] = useState({
        name: "",
        email: "",
        phone: "",
        inquiryType: "",
        jobTitle: "",
        message: "",
    });

    // Real-time clearing of error states on user input (Strict Team Blueprint)
    function handleInputChange(event) {
        const { name, value } = event.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
            ...(name === "inquiryType"
                ? {
                      serviceInterested: value,
                      ...(value !== "Careers & Recruitment" ? { jobTitle: "" } : {}),
                  }
                : {}),
        }));

        // Clear errors for the active field
        setErrorMessage((prev) => ({
            ...prev,
            [name]: "",
            ...(name === "inquiryType" && value !== "Careers & Recruitment"
                ? { jobTitle: "" }
                : {}),
        }));
        setValidationError((prev) => ({
            ...prev,
            [name]: false,
            ...(name === "inquiryType" && value !== "Careers & Recruitment"
                ? { jobTitle: false }
                : {}),
        }));

        if (serverError) {
            setServerError("");
        }
    }

    // Client-side validation engine
    const validateForm = () => {
        const errors = { ...INITIAL_ERROR_MESSAGE };
        const errorFlags = { ...INITIAL_VALIDATION_ERROR };
        let isValid = true;

        // 1. Full Name Validation
        const nameTrimmed = (formData.name || "").trim();
        if (!nameTrimmed) {
            errors.name = "Please enter your full name.";
            errorFlags.name = true;
            isValid = false;
        } else if (nameTrimmed.length < 2) {
            errors.name = "Full name must be at least 2 characters.";
            errorFlags.name = true;
            isValid = false;
        } else if (nameTrimmed.length > 100) {
            errors.name = "Full name cannot exceed 100 characters.";
            errorFlags.name = true;
            isValid = false;
        } else if (!/^[a-zA-Z\s.'-]+$/.test(nameTrimmed)) {
            errors.name = "Please enter a valid name (letters, spaces, dots, and hyphens only).";
            errorFlags.name = true;
            isValid = false;
        }

        // 2. Email Address Validation
        const emailTrimmed = (formData.email || "").trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
        if (!emailTrimmed) {
            errors.email = "Please enter your email address.";
            errorFlags.email = true;
            isValid = false;
        } else if (!emailRegex.test(emailTrimmed)) {
            errors.email = "Please provide a valid corporate or personal email address (e.g. name@company.com).";
            errorFlags.email = true;
            isValid = false;
        } else if (emailTrimmed.length > 200) {
            errors.email = "Email address cannot exceed 200 characters.";
            errorFlags.email = true;
            isValid = false;
        }

        // 3. Phone Number Validation (Optional, but validated if filled)
        const phoneTrimmed = (formData.phone || "").trim();
        if (phoneTrimmed) {
            const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,20}$/;
            const digitsOnly = phoneTrimmed.replace(/\D/g, "");
            if (!phoneRegex.test(phoneTrimmed) || digitsOnly.length < 7 || digitsOnly.length > 15) {
                errors.phone = "Please provide a valid phone number (e.g. +91 97870 15703).";
                errorFlags.phone = true;
                isValid = false;
            }
        }

        // 4. Department / Inquiry Type Validation
        if (!formData.inquiryType || !INQUIRY_TYPES.includes(formData.inquiryType)) {
            errors.inquiryType = "Please select a valid department or inquiry type.";
            errorFlags.inquiryType = true;
            isValid = false;
        }

        // 5. Job Title Validation (Required when inquiryType is Careers & Recruitment)
        if (formData.inquiryType === "Careers & Recruitment") {
            const jobTrimmed = (formData.jobTitle || "").trim();
            if (!jobTrimmed) {
                errors.jobTitle = "Please specify the job title or role you are inquiring about.";
                errorFlags.jobTitle = true;
                isValid = false;
            } else if (jobTrimmed.length < 2) {
                errors.jobTitle = "Job title must be at least 2 characters.";
                errorFlags.jobTitle = true;
                isValid = false;
            } else if (jobTrimmed.length > 200) {
                errors.jobTitle = "Job title cannot exceed 200 characters.";
                errorFlags.jobTitle = true;
                isValid = false;
            }
        }

        // 6. Message / Requirements Validation
        const messageTrimmed = (formData.message || "").trim();
        if (!messageTrimmed) {
            errors.message = "Please enter your message or project requirements.";
            errorFlags.message = true;
            isValid = false;
        } else if (messageTrimmed.length < 10) {
            errors.message = "Message must be at least 10 characters long.";
            errorFlags.message = true;
            isValid = false;
        } else if (messageTrimmed.length > 5000) {
            errors.message = "Message cannot exceed 5000 characters.";
            errorFlags.message = true;
            isValid = false;
        }

        setErrorMessage(errors);
        setValidationError(errorFlags);

        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setSubmitting(true);
            setServerError("");

            const trimmedName = formData.name.trim();
            const payload = {
                name: trimmedName,
                fullName: trimmedName,
                firstName: trimmedName.split(" ")[0] || "",
                lastName: trimmedName.split(" ").slice(1).join(" ") || "",
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                company: formData.company.trim(),
                jobTitle:
                    formData.inquiryType === "Careers & Recruitment"
                        ? formData.jobTitle.trim()
                        : "",
                inquiryType: formData.inquiryType,
                serviceInterested: formData.inquiryType,
                subject:
                    formData.subject.trim() ||
                    (formData.jobTitle
                        ? `Application / Career Inquiry: ${formData.jobTitle.trim()}`
                        : `Inquiry regarding ${formData.inquiryType}`),
                message: formData.message.trim(),
            };

            const response = await publicContactApi.submitInquiry(payload);
            const successMsg =
                response.data?.message ||
                "Thank you for contacting Liaxon! Your inquiry has been routed to our respective department.";

            setSnackbar({
                open: true,
                message: successMsg,
                severity: "success",
            });

            // Reset form fields
            setFormData({
                name: "",
                email: "",
                phone: "",
                company: "",
                jobTitle: "",
                inquiryType: "General Enquiries",
                serviceInterested: "General Enquiries",
                subject: "",
                message: "",
            });

            // Reset validation states
            setValidationError({ ...INITIAL_VALIDATION_ERROR });
            setErrorMessage({ ...INITIAL_ERROR_MESSAGE });

            if (typeof onSuccess === "function") {
                onSuccess(response.data);
            }
        } catch (err) {
            console.error("Contact Form Submission Error:", err);
            setServerError(
                err.response?.data?.message ||
                "Failed to send message. Please call us directly at +91 97870 15703 or email info@liaxon.in."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="contact-form-wrapper">
            {serverError && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    {serverError}
                </Alert>
            )}

            <form onSubmit={handleSubmit} className="form-grid" noValidate>
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                        gap: 2,
                    }}
                >
                    <TextField
                        id="contact-name"
                        label="Full Name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g. Riya Max"
                        error={validationError.name}
                        helperText={errorMessage.name}
                        autoComplete="name"
                        fullWidth
                    />
                    <TextField
                        id="contact-email"
                        label="Email Address"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="e.g. founder@company.in"
                        error={validationError.email}
                        helperText={errorMessage.email}
                        autoComplete="email"
                        fullWidth
                    />
                    <TextField
                        id="contact-phone"
                        label="Phone Number"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+91 97870 15703"
                        error={validationError.phone}
                        helperText={errorMessage.phone}
                        autoComplete="tel"
                        fullWidth
                    />
                    <TextField
                        id="contact-company"
                        label="Company / Startup Name"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        placeholder="e.g. Craft N Corp"
                        autoComplete="organization"
                        fullWidth
                    />
                </Box>

                <TextField
                    select
                    id="contact-inquiryType"
                    label="Department / Inquiry Type"
                    name="inquiryType"
                    required
                    value={formData.inquiryType}
                    onChange={handleInputChange}
                    error={validationError.inquiryType}
                    helperText={
                        errorMessage.inquiryType ||
                        "Your inquiry will be routed directly to the respective department head."
                    }
                    fullWidth
                >
                    {INQUIRY_TYPES.map((type) => (
                        <MenuItem key={type} value={type}>
                            {type}
                        </MenuItem>
                    ))}
                </TextField>

                {formData.inquiryType === "Careers & Recruitment" && (
                    <TextField
                        id="contact-jobTitle"
                        label="Job Title / Role of Interest"
                        name="jobTitle"
                        required
                        value={formData.jobTitle}
                        onChange={handleInputChange}
                        placeholder="e.g. Business Development Associate, Operations Executive, Intern"
                        error={validationError.jobTitle}
                        helperText={
                            errorMessage.jobTitle ||
                            "Specify the position, department, or role you are inquiring about."
                        }
                        fullWidth
                    />
                )}

                <TextField
                    id="contact-subject"
                    label="Subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Brief overview of your requirements"
                    fullWidth
                />

                <TextField
                    multiline
                    rows={4}
                    required
                    id="contact-message"
                    label="Tell Us About Your Goals / Challenges"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Describe your business, growth goals, process bottlenecks, or IT requirements..."
                    error={validationError.message}
                    helperText={errorMessage.message}
                    fullWidth
                />

                <Button
                    type="submit"
                    variant="contained"
                    className="submit-btn"
                    disabled={submitting}
                    endIcon={<SendRoundedIcon />}
                >
                    {submitting ? (
                        <CircularProgress size={22} color="inherit" />
                    ) : (
                        "Book a Free Consultation"
                    )}
                </Button>
            </form>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={5000}
                onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert
                    onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                    severity={snackbar.severity}
                    sx={{ width: "100%", borderRadius: 2 }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </div>
    );
}
