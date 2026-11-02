import React, { useState, useEffect, useMemo } from "react";
import {
    Box,
    Card,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Chip,
    IconButton,
    TextField,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    InputAdornment,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
    CircularProgress,
    Snackbar,
    Alert,
    Tooltip,
    Switch,
    FormControlLabel,
    Grid,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import WorkRoundedIcon from "@mui/icons-material/WorkRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import { jobsApi } from "../../../services/adminApi.js";
import "./AdminJobs.scss";

const EMPLOYMENT_TYPES = [
    "Full-time",
    "Part-time",
    "Internship",
    "Contract",
];

const EXPERIENCE_OPTIONS = [
    "Fresher / 0-1 Year",
    "1-2 Years",
    "3-5 Years",
    "5+ Years",
    "Student / Intern",
    "Open to Freshers",
];

const INITIAL_FORM = {
    title: "",
    department: "Engineering",
    employmentType: "Full-time",
    location: "On-site",
    experienceLevel: "0-2 Years / Open to Freshers",
    openingsCount: 1,
    isActive: true,
    description: "",
    requirements: "",
    responsibilities: "",
};

const AdminJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState("All");

    // Pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Form Modal (Create / Edit)
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("create"); // "create" | "edit"
    const [activeJobId, setActiveJobId] = useState(null);
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState("");

    // Delete Modal
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [jobToDelete, setJobToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Toast
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    const showSnackbar = (message, severity = "success") => {
        setSnackbar({ open: true, message, severity });
    };

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const response = await jobsApi.getAll();
            const list =
                response.data?.jobs ||
                response.data?.data ||
                response.data ||
                [];
            setJobs(Array.isArray(list) ? list : []);
        } catch (err) {
            console.error("Fetch Jobs Error:", err);
            showSnackbar("Failed to fetch job postings.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const filteredJobs = useMemo(() => {
        return jobs.filter((job) => {
            const matchesType =
                typeFilter === "All" || job.employmentType === typeFilter;

            const title = (job.title || "").toLowerCase();
            const domain = (job.domain || "").toLowerCase();
            const location = (job.location || "").toLowerCase();

            const query = searchQuery.toLowerCase().trim();
            const matchesSearch =
                !query ||
                title.includes(query) ||
                domain.includes(query) ||
                location.includes(query);

            return matchesType && matchesSearch;
        });
    }, [jobs, searchQuery, typeFilter]);

    // Open Create Modal
    const handleOpenCreate = () => {
        setModalMode("create");
        setActiveJobId(null);
        setFormData(INITIAL_FORM);
        setFormError("");
        setModalOpen(true);
    };

    // Open Edit Modal
    const handleOpenEdit = (job) => {
        setModalMode("edit");
        setActiveJobId(job._id);
        setFormData({
            title: job.title || "",
            department: job.domain || "Engineering",
            employmentType: job.employmentType || "Full-time",
            location: job.location || "On-site",
            experienceLevel: job.experienceLevel || "0-2 Years",
            openingsCount: job.openingsCount || 1,
            isActive: job.isActive !== undefined ? job.isActive : true,
            description: job.description || "",
            requirements: Array.isArray(job.requirements)
                ? job.requirements.join("\n")
                : job.requirements || "",
            responsibilities: Array.isArray(job.responsibilities)
                ? job.responsibilities.join("\n")
                : job.responsibilities || "",
        });
        setFormError("");
        setModalOpen(true);
    };

    // Submit Create or Edit
    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            setFormError("Job title is required.");
            return;
        }
        if (!formData.description.trim()) {
            setFormError("Job description is required.");
            return;
        }

        try {
            setSubmitting(true);
            setFormError("");

            const payload = {
                title: formData.title.trim(),
                department: formData.department.trim(),
                domain: formData.department.trim(),
                employmentType: formData.employmentType,
                type: formData.employmentType,
                location: formData.location.trim(),
                experienceLevel: formData.experienceLevel,
                experience: formData.experienceLevel,
                openingsCount: Number(formData.openingsCount) || 1,
                isActive: Boolean(formData.isActive),
                description: formData.description.trim(),
                requirements: formData.requirements,
                responsibilities: formData.responsibilities,
            };

            if (modalMode === "create") {
                const response = await jobsApi.create(payload);
                const created = response.data?.job || response.data?.data;
                if (created) {
                    setJobs((prev) => [created, ...prev]);
                } else {
                    await fetchJobs();
                }
                showSnackbar("Job posting created successfully.");
            } else {
                const response = await jobsApi.update(activeJobId, payload);
                const updated = response.data?.job || response.data?.data;
                if (updated) {
                    setJobs((prev) =>
                        prev.map((j) => (j._id === activeJobId ? updated : j)),
                    );
                } else {
                    await fetchJobs();
                }
                showSnackbar("Job posting updated successfully.");
            }

            setModalOpen(false);
        } catch (err) {
            console.error("Job Save Error:", err);
            setFormError(
                err.response?.data?.message || "Failed to save job posting.",
            );
        } finally {
            setSubmitting(false);
        }
    };

    // Toggle Active Status
    const handleToggleActive = async (job) => {
        try {
            const nextStatus = !job.isActive;
            await jobsApi.update(job._id, { isActive: nextStatus });
            setJobs((prev) =>
                prev.map((j) =>
                    j._id === job._id ? { ...j, isActive: nextStatus } : j,
                ),
            );
            showSnackbar(
                `Job is now ${nextStatus ? "active and visible" : "hidden/inactive"}.`,
            );
        } catch (err) {
            console.error("Toggle Active Error:", err);
            showSnackbar("Failed to change job status.", "error");
        }
    };

    // Delete confirmation
    const handleDeleteConfirm = async () => {
        if (!jobToDelete) return;
        try {
            setDeleting(true);
            await jobsApi.delete(jobToDelete._id);
            setJobs((prev) => prev.filter((j) => j._id !== jobToDelete._id));
            showSnackbar("Job posting deleted successfully.");
            setDeleteDialogOpen(false);
            setJobToDelete(null);
        } catch (err) {
            console.error("Delete Job Error:", err);
            showSnackbar("Failed to delete job posting.", "error");
        } finally {
            setDeleting(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "—";
        try {
            return new Date(dateString).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            });
        } catch {
            return "—";
        }
    };

    return (
        <Box className="admin-jobs-page">
            {/* Header */}
            <Box className="jobs-header">
                <Box className="header-info">
                    <Typography component="h1" className="page-title">
                        Job Postings & Careers
                    </Typography>
                    <Typography className="page-sub">
                        Create and manage active openings, requirements, and job descriptions.
                    </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 1.5 }}>
                    <Tooltip title="Refresh Jobs">
                        <IconButton
                            onClick={fetchJobs}
                            sx={{
                                backgroundColor: "#141414",
                                border: "1px solid rgba(212, 175, 55, 0.25)",
                                color: "#D4AF37",
                                "&:hover": {
                                    backgroundColor: "#1F1F1F",
                                    borderColor: "#D4AF37",
                                },
                            }}
                        >
                            <RefreshRoundedIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Button
                        variant="contained"
                        startIcon={<AddRoundedIcon />}
                        onClick={handleOpenCreate}
                        sx={{
                            backgroundColor: "#D4AF37",
                            color: "#0B0B0B",
                            fontWeight: 700,
                            textTransform: "none",
                            "&:hover": { backgroundColor: "#E5C158" },
                        }}
                    >
                        Create Job
                    </Button>
                </Box>
            </Box>

            {/* Table Card */}
            <Card className="jobs-card" elevation={0}>
                {/* Search & Filter Toolbar */}
                <Box className="toolbar-bar">
                    <TextField
                        size="small"
                        placeholder="Search by title, domain, location..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setPage(0);
                        }}
                        className="search-box"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchRoundedIcon
                                        fontSize="small"
                                        sx={{ color: "#94A3B8" }}
                                    />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <FormControl size="small" className="filter-box">
                        <InputLabel id="type-filter-label">Job Type</InputLabel>
                        <Select
                            labelId="type-filter-label"
                            label="Job Type"
                            value={typeFilter}
                            onChange={(e) => {
                                setTypeFilter(e.target.value);
                                setPage(0);
                            }}
                        >
                            <MenuItem value="All">All Types</MenuItem>
                            {EMPLOYMENT_TYPES.map((t) => (
                                <MenuItem key={t} value={t}>
                                    {t}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                {/* Table */}
                <TableContainer>
                    <Table className="jobs-table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Job Title</TableCell>
                                <TableCell>Department</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Location</TableCell>
                                <TableCell>Experience</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Date Added</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                                        <CircularProgress size={32} sx={{ color: "#D4AF37" }} />
                                    </TableCell>
                                </TableRow>
                            ) : filteredJobs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 6, color: "text.secondary" }}>
                                        No job postings found. Click "Create Job" to publish a new opening.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredJobs
                                    .slice(
                                        page * rowsPerPage,
                                        page * rowsPerPage + rowsPerPage,
                                    )
                                    .map((job) => (
                                        <TableRow key={job._id} hover>
                                            <TableCell className="job-title-cell">
                                                {job.title}
                                            </TableCell>

                                            <TableCell>
                                                <Chip
                                                    label={job.domain || "General"}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: "rgba(212, 175, 55, 0.12)",
                                                        color: "#D4AF37",
                                                        border: "1px solid rgba(212, 175, 55, 0.25)",
                                                        fontWeight: 600,
                                                        fontSize: "0.75rem",
                                                    }}
                                                />
                                            </TableCell>

                                            <TableCell sx={{ fontSize: "0.85rem" }}>
                                                {job.employmentType || "Full-time"}
                                            </TableCell>

                                            <TableCell sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                                    <LocationOnRoundedIcon sx={{ fontSize: 16, color: "#D4AF37" }} />
                                                    {job.location || "On-site"}
                                                </Box>
                                            </TableCell>

                                            <TableCell sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                                                {job.experienceLevel || "0-2 Years"}
                                            </TableCell>

                                            <TableCell>
                                                <FormControlLabel
                                                    control={
                                                        <Switch
                                                            size="small"
                                                            checked={Boolean(job.isActive)}
                                                            onChange={() => handleToggleActive(job)}
                                                            sx={{
                                                                "& .MuiSwitch-switchBase.Mui-checked": {
                                                                    color: "#D4AF37",
                                                                },
                                                                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                                                                    backgroundColor: "#D4AF37",
                                                                },
                                                            }}
                                                        />
                                                    }
                                                    label={
                                                        <Typography variant="caption" sx={{ fontWeight: 600, color: job.isActive ? "#D4AF37" : "#777777" }}>
                                                            {job.isActive ? "Active" : "Draft"}
                                                        </Typography>
                                                    }
                                                />
                                            </TableCell>

                                            <TableCell sx={{ color: "text.secondary", fontSize: "0.825rem" }}>
                                                {formatDate(job.createdAt)}
                                            </TableCell>

                                            <TableCell align="right">
                                                <Tooltip title="Edit Job">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleOpenEdit(job)}
                                                        sx={{ color: "#D4AF37" }}
                                                    >
                                                        <EditRoundedIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete Job">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => {
                                                            setJobToDelete(job);
                                                            setDeleteDialogOpen(true);
                                                        }}
                                                        sx={{ color: "#EF4444" }}
                                                    >
                                                        <DeleteOutlineRoundedIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredJobs.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                />
            </Card>

            {/* Create / Edit Job Dialog */}
            <Dialog
                open={modalOpen}
                onClose={() => !submitting && setModalOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        backgroundColor: "#141414",
                        color: "#FFFFFF",
                        border: "1px solid rgba(212, 175, 55, 0.25)",
                    },
                }}
            >
                <form onSubmit={handleFormSubmit}>
                    <DialogTitle sx={{ fontWeight: 700, pb: 1, color: "#FFFFFF" }}>
                        {modalMode === "create" ? "Post New Job Opening" : "Edit Job Posting"}
                    </DialogTitle>
                    <DialogContent dividers sx={{ borderColor: "rgba(255, 255, 255, 0.1)" }}>
                        {formError && (
                            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
                                {formError}
                            </Alert>
                        )}

                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
                            <TextField
                                fullWidth
                                label="Job Title"
                                required
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({ ...formData, title: e.target.value })
                                }
                                placeholder="e.g. Senior Full Stack Engineer"
                            />

                            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                                <TextField
                                    label="Department / Domain"
                                    value={formData.department}
                                    onChange={(e) =>
                                        setFormData({ ...formData, department: e.target.value })
                                    }
                                    placeholder="e.g. Engineering, AI Labs, Design"
                                />

                                <FormControl fullWidth>
                                    <InputLabel id="employment-type-label">Employment Type</InputLabel>
                                    <Select
                                        labelId="employment-type-label"
                                        label="Employment Type"
                                        value={formData.employmentType}
                                        onChange={(e) =>
                                            setFormData({ ...formData, employmentType: e.target.value })
                                        }
                                    >
                                        {EMPLOYMENT_TYPES.map((t) => (
                                            <MenuItem key={t} value={t}>
                                                {t}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <TextField
                                    label="Location"
                                    value={formData.location}
                                    onChange={(e) =>
                                        setFormData({ ...formData, location: e.target.value })
                                    }
                                    placeholder="e.g. On-site, Remote, Hybrid"
                                />

                                <FormControl fullWidth>
                                    <InputLabel id="exp-level-label">Experience Level</InputLabel>
                                    <Select
                                        labelId="exp-level-label"
                                        label="Experience Level"
                                        value={formData.experienceLevel}
                                        onChange={(e) =>
                                            setFormData({ ...formData, experienceLevel: e.target.value })
                                        }
                                    >
                                        {EXPERIENCE_OPTIONS.map((exp) => (
                                            <MenuItem key={exp} value={exp}>
                                                {exp}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>

                            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                                <TextField
                                    label="Number of Openings"
                                    type="number"
                                    inputProps={{ min: 1 }}
                                    value={formData.openingsCount}
                                    onChange={(e) =>
                                        setFormData({ ...formData, openingsCount: e.target.value })
                                    }
                                />
                                <Box sx={{ display: "flex", alignItems: "center" }}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={formData.isActive}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, isActive: e.target.checked })
                                                }
                                                sx={{
                                                    "& .MuiSwitch-switchBase.Mui-checked": {
                                                        color: "#D4AF37",
                                                    },
                                                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                                                        backgroundColor: "#D4AF37",
                                                    },
                                                }}
                                            />
                                        }
                                        label="Publish Immediately (Active)"
                                    />
                                </Box>
                            </Box>

                            <TextField
                                fullWidth
                                label="Job Description"
                                multiline
                                rows={4}
                                required
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                placeholder="Provide comprehensive details about the role, expectations, and day-to-day work..."
                            />

                            <TextField
                                fullWidth
                                label="Requirements (Enter each requirement on a new line)"
                                multiline
                                rows={3}
                                value={formData.requirements}
                                onChange={(e) =>
                                    setFormData({ ...formData, requirements: e.target.value })
                                }
                                placeholder="• 2+ years React & Node.js experience&#10;• Experience with MongoDB&#10;• Excellent problem-solving skills"
                            />

                            <TextField
                                fullWidth
                                label="Responsibilities (Enter each responsibility on a new line)"
                                multiline
                                rows={3}
                                value={formData.responsibilities}
                                onChange={(e) =>
                                    setFormData({ ...formData, responsibilities: e.target.value })
                                }
                                placeholder="• Build scalable REST APIs&#10;• Collaborate with cross-functional teams"
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 2, borderColor: "rgba(255, 255, 255, 0.1)" }}>
                        <Button
                            onClick={() => setModalOpen(false)}
                            disabled={submitting}
                            sx={{ color: "#A0A0A0" }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={submitting}
                            sx={{
                                backgroundColor: "#D4AF37",
                                color: "#0B0B0B",
                                fontWeight: 700,
                                textTransform: "none",
                                "&:hover": { backgroundColor: "#E5C158" },
                            }}
                        >
                            {submitting ? (
                                <CircularProgress size={22} sx={{ color: "#0B0B0B" }} />
                            ) : modalMode === "create" ? (
                                "Publish Job"
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        p: 1,
                        backgroundColor: "#141414",
                        color: "#FFFFFF",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                    },
                }}
            >
                <DialogTitle sx={{ fontWeight: 700, color: "#FFFFFF" }}>
                    Confirm Deletion
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ color: "#A0A0A0" }}>
                        Are you sure you want to delete the job posting for{" "}
                        <strong style={{ color: "#FFFFFF" }}>{jobToDelete?.title}</strong>? All associated public listings will be removed.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ pb: 1, px: 2 }}>
                    <Button
                        onClick={() => setDeleteDialogOpen(false)}
                        disabled={deleting}
                        sx={{ color: "#A0A0A0" }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        variant="contained"
                        color="error"
                        disabled={deleting}
                    >
                        {deleting ? <CircularProgress size={20} color="inherit" /> : "Delete"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Feedback Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert
                    onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{
                        width: "100%",
                        borderRadius: 2,
                        backgroundColor: "#161616",
                        color: "#FFFFFF !important",
                        border: "1px solid rgba(212, 175, 55, 0.35)",
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.6)",
                        "& .MuiAlert-icon": {
                            color: snackbar.severity === "error" ? "#EF4444" : "#D4AF37",
                        },
                        "& .MuiAlert-message": {
                            color: "#FFFFFF !important",
                            fontWeight: 600,
                        },
                    }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AdminJobs;
