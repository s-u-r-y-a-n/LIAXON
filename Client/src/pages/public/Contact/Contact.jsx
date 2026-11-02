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
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import HandshakeRoundedIcon from "@mui/icons-material/HandshakeRounded";
import BusinessCenterRoundedIcon from "@mui/icons-material/BusinessCenterRounded";
import GroupAddRoundedIcon from "@mui/icons-material/GroupAddRounded";
import ContactSupportRoundedIcon from "@mui/icons-material/ContactSupportRounded";
import PageWrapper from "../../../components/common/PageWrapper.jsx";
import SectionTitle from "../../../components/common/SectionTitle.jsx";
import {
    companyInfo,
    contactContent,
} from "../../../data/companyContent.js";
import { publicContactApi } from "../../../services/publicApi.js";
import "./Contact.scss";

const DEPT_ICONS = {
    "Business Collaboration": <HandshakeRoundedIcon />,
    "Business Services": <BusinessCenterRoundedIcon />,
    "Careers & Recruitment": <GroupAddRoundedIcon />,
    "General Enquiries": <ContactSupportRoundedIcon />,
};

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

const Contact = () => {
    const [searchParams] = useSearchParams();
    const prefilledService = searchParams.get("service") || "";
    const prefilledType = searchParams.get("type") || searchParams.get("inquiryType") || "";
    const prefilledJob = searchParams.get("jobTitle") || searchParams.get("role") || "";

    const initialInquiryType =
        prefilledType && INQUIRY_TYPES.includes(prefilledType)
            ? prefilledType
            : prefilledJob
            ? "Careers & Recruitment"
            : prefilledService
            ? "Business Services & Sales Enquiries"
            : "General Enquiries";

    const [formData, setFormData] = useState(() => ({
        name: "",
        email: "",
        phone: "",
        company: "",
        jobTitle: prefilledJob || "",
        inquiryType: initialInquiryType,
        serviceInterested: prefilledService || initialInquiryType,
        subject: prefilledJob
            ? `Application / Career Inquiry: ${prefilledJob}`
            : prefilledService
            ? `Inquiry regarding ${prefilledService}`
            : "",
        message: "",
    }));

    // Adjust state if query params change during navigation without cascading renders
    const [prevParams, setPrevParams] = useState({ job: prefilledJob, service: prefilledService });
    if (prevParams.job !== prefilledJob || prevParams.service !== prefilledService) {
        setPrevParams({ job: prefilledJob, service: prefilledService });
        if (prefilledJob) {
            setFormData((prev) => ({
                ...prev,
                inquiryType: "Careers & Recruitment",
                jobTitle: prefilledJob,
                serviceInterested: "Careers & Recruitment",
                subject: `Application / Career Inquiry: ${prefilledJob}`,
            }));
        } else if (prefilledService) {
            setFormData((prev) => ({
                ...prev,
                inquiryType: "Business Services & Sales Enquiries",
                serviceInterested: prefilledService,
                subject: `Inquiry regarding ${prefilledService}`,
            }));
        }
    }

    const [submitting, setSubmitting] = useState(false);
    const [serverError, setServerError] = useState("");
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    // Team Blueprint: Two-state client-side validation pattern
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
            errors.name = "Name can only contain letters, spaces, hyphens, and dots.";
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
            setSnackbar({
                open: true,
                message:
                    response.data?.message ||
                    "Thank you for contacting Liaxon! Your inquiry has been routed to our respective department.",
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
        } catch (err) {
            console.error("Contact Form Error:", err);
            setServerError(
                err.response?.data?.message ||
                "Failed to send message. Please call us directly at +91 97870 15703 or email info@liaxon.in."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <PageWrapper className="contact-page">
            {/* 1. Hero Header */}
            <section className="contact-hero-banner">
                <div className="hero-container">
                    <span className="hero-tag">Get in Touch</span>
                    <h1>{contactContent.title}</h1>
                    <p className="hero-tagline">{contactContent.tagline}</p>
                    <p className="hero-lead">{contactContent.lead}</p>
                </div>
            </section>

            {/* 2. Four Department Contact Channels */}
            <section className="dept-channels-section">
                <div className="channels-container">
                    <SectionTitle
                        badge="Dedicated Desks"
                        title="Get in Touch with the Right Team"
                        subtitle="Connect directly with our specialist departments for collaborations, services, careers, or general queries."
                    />

                    <div className="channels-grid">
                        {contactContent.departments.map((dept, idx) => (
                            <div key={idx} className="channel-card">
                                <div className="channel-icon-circle">
                                    {DEPT_ICONS[dept.category] || <ContactSupportRoundedIcon />}
                                </div>
                                <h3>{dept.category}</h3>
                                <p className="channel-desc">{dept.desc}</p>

                                <div className="channel-links">
                                    <div className="link-row">
                                        <EmailRoundedIcon sx={{ fontSize: 17, color: "#D4AF37" }} />
                                        <a href={`mailto:${dept.email}`}>{dept.email}</a>
                                    </div>

                                    {dept.phone && (
                                        <div className="link-row">
                                            <PhoneRoundedIcon sx={{ fontSize: 17, color: "#D4AF37" }} />
                                            <a href={`tel:${dept.phoneRaw}`}>{dept.phone}</a>
                                        </div>
                                    )}

                                    {dept.instagram && (
                                        <div className="link-row">
                                            <InstagramIcon sx={{ fontSize: 17, color: "#E1306C" }} />
                                            <a href={dept.instagramUrl} target="_blank" rel="noopener noreferrer">
                                                {dept.instagram}
                                            </a>
                                        </div>
                                    )}

                                    {dept.linkedin && (
                                        <div className="link-row">
                                            <LinkedInIcon sx={{ fontSize: 17, color: "#0A66C2" }} />
                                            <a href={dept.linkedinUrl} target="_blank" rel="noopener noreferrer">
                                                {dept.linkedin}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. Split Form & Office Coordinates */}
            <section className="contact-form-section">
                <div className="contact-container">
                    {/* Left: Office Coordinates */}
                    <div className="contact-info-panel">
                        <div className="info-header">
                            <h2 className="info-title">Our Office</h2>
                            <p className="info-desc">
                                Liaxon Consulting Private Limited is headquartered in Tholayavattam, serving clients across Tamil Nadu and all of India.
                            </p>
                        </div>

                        <div className="contact-cards-list">
                            <div className="contact-card-box">
                                <div className="icon-circle">
                                    <LocationOnRoundedIcon />
                                </div>
                                <div className="card-text">
                                    <h4>Office Address</h4>
                                    <p>{contactContent.office.address}</p>
                                </div>
                            </div>

                            <div className="contact-card-box">
                                <div className="icon-circle">
                                    <AccessTimeRoundedIcon />
                                </div>
                                <div className="card-text">
                                    <h4>When You Can Reach Us</h4>
                                    <p>{contactContent.office.timings}</p>
                                    <span className="sunday-note">
                                        {contactContent.office.sundayNote}
                                    </span>
                                </div>
                            </div>

                            <div className="contact-card-box">
                                <div className="icon-circle">
                                    <PhoneRoundedIcon />
                                </div>
                                <div className="card-text">
                                    <h4>Consultation Desk</h4>
                                    <a href={`tel:${companyInfo.primaryPhone.replace(/\s+/g, "")}`}>
                                        {companyInfo.primaryPhone}
                                    </a>
                                </div>
                            </div>

                            <div className="contact-card-box">
                                <div className="icon-circle">
                                    <EmailRoundedIcon />
                                </div>
                                <div className="card-text">
                                    <h4>Official Email</h4>
                                    <a href={`mailto:${companyInfo.primaryEmail}`}>
                                        {companyInfo.primaryEmail}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Message Form */}
                    <div className="contact-form-panel">
                        <h3 className="form-heading">Tell Us About Your Business</h3>
                        <p className="form-sub">
                            Fill out the inquiry form below and our team will get back to you with the right plan.
                        </p>

                        {serverError && (
                            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                                {serverError}
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit} className="form-grid" noValidate>
                            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
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
                    </div>
                </div>
            </section>

            {/* 4. Embedded Google Map (Tholayavattam, Kanyakumari District) */}
            <section className="map-section">
                <iframe
                    title="Liaxon Consulting Office - Tholayavattam, Kanyakumari District, Tamil Nadu"
                    src="https://maps.google.com/maps?q=Tholayavattam,+Kanyakumari+District,+Tamil+Nadu+629171&t=&z=14&ie=UTF8&iwloc=&output=embed"
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                />
            </section>

            {/* Toast Feedback */}
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
        </PageWrapper>
    );
};

export { default as ContactForm } from "./ContactForm.jsx";
export default Contact;
