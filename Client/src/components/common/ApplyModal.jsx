import React, { useState, useRef } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    MenuItem,
    Alert,
    CircularProgress,
    Chip,
    IconButton,
} from "@mui/material";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import { publicCareersApi } from "../../services/publicApi.js";

const EXPERIENCE_OPTIONS = [
    "Fresher",
    "Student / Intern",
    "1-2 Years",
    "3-5 Years",
    "5+ Years",
];

const ApplyModal = ({ open, onClose, job }) => {
    const fileInputRef = useRef(null);
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        qualification: "",
        currentCity: "",
        experienceLevel: "Fresher",
        resumeUrl: "",
        coverNote: "",
    });
    const [resumeFile, setResumeFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errorMessage) setErrorMessage("");
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file extension
        const allowedExts = [".pdf", ".doc", ".docx"];
        const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
        if (!allowedExts.includes(ext)) {
            setErrorMessage("Only .pdf, .doc, and .docx resume files are allowed.");
            return;
        }

        // Check file size (10 MB maximum)
        if (file.size > 10 * 1024 * 1024) {
            setErrorMessage("Resume file size must be less than 10MB.");
            return;
        }

        setResumeFile(file);
        setErrorMessage("");
    };

    const handleRemoveFile = () => {
        setResumeFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.fullName.trim()) {
            setErrorMessage("Please enter your full name.");
            return;
        }
        if (!formData.email.trim()) {
            setErrorMessage("Please enter your email address.");
            return;
        }
        if (!formData.phone.trim()) {
            setErrorMessage("Please enter your contact phone number.");
            return;
        }
        if (!resumeFile && !formData.resumeUrl.trim()) {
            setErrorMessage("Please upload your resume document (.pdf, .doc, .docx) or provide a portfolio link.");
            return;
        }

        try {
            setSubmitting(true);
            setErrorMessage("");
            setSuccessMessage("");

            const data = new FormData();
            if (job?._id) {
                data.append("jobId", job._id);
            }
            data.append("positionApplied", job?.title || "General Application");
            data.append("fullName", formData.fullName.trim());
            data.append("email", formData.email.trim());
            data.append("phone", formData.phone.trim());
            data.append("qualification", formData.qualification.trim());
            data.append("currentCity", formData.currentCity.trim());
            data.append("experienceLevel", formData.experienceLevel);

            if (resumeFile) {
                data.append("resume", resumeFile);
            }
            if (formData.resumeUrl.trim()) {
                data.append("resumeUrl", formData.resumeUrl.trim());
            }
            if (formData.coverNote.trim()) {
                data.append("coverNote", formData.coverNote.trim());
            }

            const response = await publicCareersApi.submitApplication(data);
            setSuccessMessage(
                response.data?.message ||
                    "Application submitted successfully! Our recruitment team will review your profile.",
            );

            // Reset form after delay
            setTimeout(() => {
                setFormData({
                    fullName: "",
                    email: "",
                    phone: "",
                    qualification: "",
                    currentCity: "",
                    experienceLevel: "Fresher",
                    resumeUrl: "",
                    coverNote: "",
                });
                setResumeFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
                setSuccessMessage("");
                onClose();
            }, 2500);
        } catch (err) {
            console.error("Application submission error:", err);
            setErrorMessage(
                err.response?.data?.message ||
                    "Failed to submit application. Please try again or email us directly.",
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={() => !submitting && onClose()}
            maxWidth="md"
            fullWidth
            PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
        >
            <form onSubmit={handleSubmit}>
                <DialogTitle sx={{ pb: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: "#0F172A" }}>
                        Apply for {job?.title || "Position"}
                    </Typography>
                    {job && (
                        <Box sx={{ display: "flex", gap: 1, mt: 0.5, flexWrap: "wrap" }}>
                            {job.domain && (
                                <Chip label={job.domain} size="small" sx={{ fontWeight: 600 }} />
                            )}
                            <Chip
                                label={job.employmentType || "Full-time"}
                                size="small"
                                color="primary"
                                sx={{ fontWeight: 600 }}
                            />
                            {job.location && (
                                <Chip
                                    label={job.location}
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontWeight: 500 }}
                                />
                            )}
                        </Box>
                    )}
                </DialogTitle>

                <DialogContent dividers>
                    {errorMessage && (
                        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                            {errorMessage}
                        </Alert>
                    )}
                    {successMessage && (
                        <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
                            {successMessage}
                        </Alert>
                    )}

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
                        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                            <TextField
                                label="Full Name"
                                name="fullName"
                                required
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="e.g. Anand Kumar"
                            />
                            <TextField
                                label="Email Address"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="anand@example.com"
                            />
                            <TextField
                                label="Phone Number"
                                name="phone"
                                required
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="+91 98765 43210"
                            />
                            <TextField
                                select
                                label="Experience Level"
                                name="experienceLevel"
                                value={formData.experienceLevel}
                                onChange={handleChange}
                            >
                                {EXPERIENCE_OPTIONS.map((opt) => (
                                    <MenuItem key={opt} value={opt}>
                                        {opt}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                label="Highest Qualification"
                                name="qualification"
                                value={formData.qualification}
                                onChange={handleChange}
                                placeholder="e.g. B.E. Computer Science, MBA"
                            />
                            <TextField
                                label="Current City / Location"
                                name="currentCity"
                                value={formData.currentCity}
                                onChange={handleChange}
                                placeholder="e.g. Nagercoil, Kanyakumari, Chennai"
                            />
                        </Box>

                        {/* Resume / Document Upload Area */}
                        <Box sx={{ mt: 1 }}>
                            <Typography
                                variant="subtitle2"
                                sx={{ fontWeight: 700, color: "#1E293B", mb: 1 }}
                            >
                                Resume / CV Document <span style={{ color: "#EF4444" }}>*</span>
                            </Typography>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.doc,.docx"
                                style={{ display: "none" }}
                                onChange={handleFileChange}
                            />

                            {!resumeFile ? (
                                <Box
                                    onClick={() => fileInputRef.current?.click()}
                                    sx={{
                                        border: "2px dashed #CBD5E1",
                                        borderRadius: 2.5,
                                        p: 3,
                                        textAlign: "center",
                                        cursor: "pointer",
                                        backgroundColor: "#F8FAFC",
                                        transition: "all 0.2s ease",
                                        "&:hover": {
                                            borderColor: "#2563EB",
                                            backgroundColor: "#EFF6FF",
                                        },
                                    }}
                                >
                                    <CloudUploadRoundedIcon sx={{ fontSize: 38, color: "#2563EB", mb: 1 }} />
                                    <Typography variant="body1" sx={{ fontWeight: 700, color: "#1E293B" }}>
                                        Click to upload your Resume / CV
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: "#64748B", display: "block", mt: 0.5 }}>
                                        Supports PDF, DOC, DOCX files up to 10MB
                                    </Typography>
                                </Box>
                            ) : (
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        p: 1.75,
                                        border: "1px solid #BFDBFE",
                                        borderRadius: 2,
                                        backgroundColor: "#EFF6FF",
                                    }}
                                >
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, overflow: "hidden" }}>
                                        <DescriptionRoundedIcon sx={{ color: "#2563EB", fontSize: 30, flexShrink: 0 }} />
                                        <Box sx={{ overflow: "hidden" }}>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: 700,
                                                    color: "#0F172A",
                                                    textOverflow: "ellipsis",
                                                    overflow: "hidden",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {resumeFile.name}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: "#64748B" }}>
                                                {formatFileSize(resumeFile.size)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <IconButton
                                        size="small"
                                        onClick={handleRemoveFile}
                                        title="Remove file"
                                        sx={{ color: "#EF4444" }}
                                    >
                                        <DeleteOutlineRoundedIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            )}
                        </Box>

                        <TextField
                            fullWidth
                            label="Portfolio / LinkedIn / GitHub Profile Link (Optional)"
                            name="resumeUrl"
                            value={formData.resumeUrl}
                            onChange={handleChange}
                            placeholder="https://drive.google.com/... or https://linkedin.com/in/..."
                            helperText="You can provide an online portfolio or LinkedIn profile in addition to your resume."
                        />

                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Cover Note / Why are you a great fit?"
                            name="coverNote"
                            value={formData.coverNote}
                            onChange={handleChange}
                            placeholder="Tell us about your background, key projects, and career aspirations..."
                        />
                    </Box>
                </DialogContent>

                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={onClose} disabled={submitting} sx={{ color: "#64748B" }}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={submitting || Boolean(successMessage)}
                        sx={{
                            backgroundColor: "#0F172A",
                            px: 3,
                            fontWeight: 700,
                            "&:hover": { backgroundColor: "#1E293B" },
                        }}
                    >
                        {submitting ? (
                            <CircularProgress size={22} color="inherit" />
                        ) : (
                            "Submit Application"
                        )}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default ApplyModal;
