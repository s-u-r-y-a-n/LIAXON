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
    Divider,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import LocationCityRoundedIcon from "@mui/icons-material/LocationCityRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import { applicationsApi } from "../../../services/adminApi.js";
import "./AdminApplications.scss";

const STATUS_OPTIONS = [
    "All",
    "Applied",
    "Under Review",
    "Shortlisted",
    "Interview Scheduled",
    "Rejected",
    "Hired",
];

const AdminApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    // Pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Detail Modal
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [activeApp, setActiveApp] = useState(null);
    const [adminNotesInput, setAdminNotesInput] = useState("");
    const [savingNotes, setSavingNotes] = useState(false);

    // Delete Modal
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [appToDelete, setAppToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Snackbar
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    const showSnackbar = (message, severity = "success") => {
        setSnackbar({ open: true, message, severity });
    };

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const response = await applicationsApi.getAll();
            const list =
                response.data?.applications ||
                response.data?.data ||
                response.data ||
                [];
            setApplications(Array.isArray(list) ? list : []);
        } catch (err) {
            console.error("Fetch Applications Error:", err);
            showSnackbar("Failed to fetch candidate applications.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const filteredApplications = useMemo(() => {
        return applications.filter((app) => {
            const matchesStatus =
                statusFilter === "All" ||
                app.status === statusFilter ||
                (statusFilter === "Under Review" && app.status === "Reviewed");

            const name = (app.fullName || "").toLowerCase();
            const email = (app.email || "").toLowerCase();
            const phone = (app.phone || "").toLowerCase();
            const position = (
                app.jobOpening?.title ||
                app.positionApplied ||
                ""
            ).toLowerCase();

            const query = searchQuery.toLowerCase().trim();
            const matchesSearch =
                !query ||
                name.includes(query) ||
                email.includes(query) ||
                phone.includes(query) ||
                position.includes(query);

            return matchesStatus && matchesSearch;
        });
    }, [applications, searchQuery, statusFilter]);

    // Handle status change
    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await applicationsApi.updateStatus(id, newStatus);
            setApplications((prev) =>
                prev.map((a) => (a._id === id ? { ...a, status: newStatus } : a)),
            );
            if (activeApp && activeApp._id === id) {
                setActiveApp((prev) => ({ ...prev, status: newStatus }));
            }
            showSnackbar(`Candidate marked as ${newStatus}.`);
        } catch (err) {
            console.error("Application Status Update Error:", err);
            showSnackbar("Failed to update applicant status.", "error");
        }
    };

    // Save Admin Notes
    const handleSaveAdminNotes = async () => {
        if (!activeApp) return;
        try {
            setSavingNotes(true);
            await applicationsApi.updateStatus(
                activeApp._id,
                activeApp.status,
                adminNotesInput,
            );
            setApplications((prev) =>
                prev.map((a) =>
                    a._id === activeApp._id
                        ? { ...a, adminNotes: adminNotesInput }
                        : a,
                ),
            );
            setActiveApp((prev) => ({ ...prev, adminNotes: adminNotesInput }));
            showSnackbar("Admin notes saved.");
        } catch (err) {
            console.error("Save Notes Error:", err);
            showSnackbar("Failed to save notes.", "error");
        } finally {
            setSavingNotes(false);
        }
    };

    // Delete Application
    const handleDeleteConfirm = async () => {
        if (!appToDelete) return;
        try {
            setDeleting(true);
            await applicationsApi.delete(appToDelete._id);
            setApplications((prev) =>
                prev.filter((a) => a._id !== appToDelete._id),
            );
            showSnackbar("Application record deleted.");
            setDeleteDialogOpen(false);
            setAppToDelete(null);
            if (detailDialogOpen && activeApp?._id === appToDelete._id) {
                setDetailDialogOpen(false);
            }
        } catch (err) {
            console.error("Delete Application Error:", err);
            showSnackbar("Failed to delete application.", "error");
        } finally {
            setDeleting(false);
        }
    };

    // Determine resume URL
    const getResumeUrl = (app) => {
        if (app.resumeUrl) return app.resumeUrl;
        if (app.resume?.fileData) {
            if (
                app.resume.fileData.startsWith("data:") ||
                app.resume.fileData.startsWith("http")
            ) {
                return app.resume.fileData;
            }
        }
        if (app.resume?.fileName) {
            const serverBase =
                import.meta.env.VITE_SERVER_URL ||
                (import.meta.env.VITE_PUBLIC_API_URL
                    ? import.meta.env.VITE_PUBLIC_API_URL.replace(/\/api\/v1\/?$/, "")
                    : "https://liaxon.onrender.com");
            return `${serverBase}/uploads/${app.resume.fileName}`;
        }
        return null;
    };

    // Safely open resume document, converting base64 data URLs to Blobs so browsers render them cleanly
    const handleOpenResume = (app) => {
        const url = getResumeUrl(app);
        if (!url) return;

        if (url.startsWith("data:")) {
            try {
                const [header, base64Data] = url.split(",");
                let mimeType = app.resume?.mimetype;
                if (!mimeType) {
                    const match = header.match(/:(.*?);/);
                    mimeType = match ? match[1] : "";
                }

                const fileName = app.resume?.fileName || "";
                if (!mimeType || mimeType === "application/octet-stream") {
                    if (fileName.toLowerCase().endsWith(".pdf")) mimeType = "application/pdf";
                    else if (fileName.toLowerCase().endsWith(".docx")) {
                        mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                    } else if (fileName.toLowerCase().endsWith(".doc")) {
                        mimeType = "application/msword";
                    } else {
                        mimeType = "application/pdf";
                    }
                }

                // Decode base64 to binary byte array
                const byteCharacters = atob(base64Data);
                const byteNumbers = new Uint8Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }

                const blob = new Blob([byteNumbers], { type: mimeType });
                const blobUrl = URL.createObjectURL(blob);

                const newWindow = window.open(blobUrl, "_blank", "noopener,noreferrer");
                if (!newWindow) {
                    const tempAnchor = document.createElement("a");
                    tempAnchor.href = blobUrl;
                    tempAnchor.target = "_blank";
                    tempAnchor.rel = "noopener noreferrer";
                    document.body.appendChild(tempAnchor);
                    tempAnchor.click();
                    document.body.removeChild(tempAnchor);
                }

                // Clean up object URL after 60 seconds
                setTimeout(() => {
                    URL.revokeObjectURL(blobUrl);
                }, 60000);
                return;
            } catch (err) {
                console.error("Failed to open resume document via blob URL:", err);
                window.open(url, "_blank", "noopener,noreferrer");
                return;
            }
        }

        window.open(url, "_blank", "noopener,noreferrer");
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case "Applied":
            case "New":
                return { bg: "rgba(212, 175, 55, 0.12)", text: "#D4AF37", border: "rgba(212, 175, 55, 0.3)" };
            case "Under Review":
            case "Reviewed":
                return { bg: "rgba(245, 158, 11, 0.12)", text: "#F59E0B", border: "rgba(245, 158, 11, 0.3)" };
            case "Shortlisted":
                return { bg: "rgba(168, 85, 247, 0.12)", text: "#C084FC", border: "rgba(168, 85, 247, 0.3)" };
            case "Interview Scheduled":
                return { bg: "rgba(56, 189, 248, 0.12)", text: "#38BDF8", border: "rgba(56, 189, 248, 0.3)" };
            case "Hired":
                return { bg: "rgba(16, 185, 129, 0.12)", text: "#10B981", border: "rgba(16, 185, 129, 0.3)" };
            case "Rejected":
                return { bg: "rgba(239, 68, 68, 0.12)", text: "#EF4444", border: "rgba(239, 68, 68, 0.3)" };
            default:
                return { bg: "rgba(255, 255, 255, 0.05)", text: "#A0A0A0", border: "rgba(255, 255, 255, 0.1)" };
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
        <Box className="admin-applications-page">
            {/* Header */}
            <Box className="apps-header">
                <Box className="header-info">
                    <Typography component="h1" className="page-title">
                        Candidate Applications
                    </Typography>
                    <Typography className="page-sub">
                        Review received resumes, candidate credentials, and hiring pipeline statuses.
                    </Typography>
                </Box>
                <Tooltip title="Refresh Applications">
                    <IconButton
                        onClick={fetchApplications}
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
            </Box>

            {/* Table Card */}
            <Card className="apps-card" elevation={0}>
                {/* Search & Filter Toolbar */}
                <Box className="toolbar-bar">
                    <TextField
                        size="small"
                        placeholder="Search candidate, email, applied position..."
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
                        <InputLabel id="status-filter-label">Filter Status</InputLabel>
                        <Select
                            labelId="status-filter-label"
                            label="Filter Status"
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPage(0);
                            }}
                        >
                            {STATUS_OPTIONS.map((st) => (
                                <MenuItem key={st} value={st}>
                                    {st}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                {/* Table */}
                <TableContainer>
                    <Table className="apps-table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Candidate</TableCell>
                                <TableCell>Position Applied</TableCell>
                                <TableCell>Experience</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Resume</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                                        <CircularProgress size={32} sx={{ color: "#D4AF37" }} />
                                    </TableCell>
                                </TableRow>
                            ) : filteredApplications.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 6, color: "text.secondary" }}>
                                        No candidate applications found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredApplications
                                    .slice(
                                        page * rowsPerPage,
                                        page * rowsPerPage + rowsPerPage,
                                    )
                                    .map((app) => {
                                        const badge = getStatusStyle(app.status);
                                        const resumeLink = getResumeUrl(app);
                                        const roleTitle =
                                            app.jobOpening?.title ||
                                            app.positionApplied ||
                                            "General Application";

                                        return (
                                            <TableRow key={app._id} hover>
                                                <TableCell>
                                                    <Box className="candidate-cell">
                                                        <Typography className="candidate-name">
                                                            {app.fullName}
                                                        </Typography>
                                                        <Typography className="candidate-contact">
                                                            {app.email} • {app.phone}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>

                                                <TableCell className="role-cell">
                                                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#FFFFFF" }}>
                                                        {roleTitle}
                                                    </Typography>
                                                    {app.jobOpening?.domain && (
                                                        <Typography variant="caption" color="text.secondary">
                                                            {app.jobOpening.domain}
                                                        </Typography>
                                                    )}
                                                </TableCell>

                                                <TableCell sx={{ fontSize: "0.85rem", color: "text.secondary" }}>
                                                    {app.experienceLevel || "Fresher"}
                                                </TableCell>

                                                <TableCell sx={{ color: "text.secondary", fontSize: "0.825rem", whiteSpace: "nowrap" }}>
                                                    {formatDate(app.createdAt)}
                                                </TableCell>

                                                <TableCell>
                                                    {resumeLink ? (
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            startIcon={<DescriptionRoundedIcon fontSize="small" />}
                                                            href={resumeLink}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            onClick={(e) => {
                                                                if (resumeLink && resumeLink.startsWith("data:")) {
                                                                    e.preventDefault();
                                                                    handleOpenResume(app);
                                                                }
                                                            }}
                                                            sx={{
                                                                py: 0.4,
                                                                px: 1.2,
                                                                fontSize: "0.775rem",
                                                                borderColor: "rgba(212, 175, 55, 0.4)",
                                                                color: "#D4AF37",
                                                                textTransform: "none",
                                                                "&:hover": {
                                                                    borderColor: "#D4AF37",
                                                                    backgroundColor: "rgba(212, 175, 55, 0.08)",
                                                                },
                                                            }}
                                                        >
                                                            Resume
                                                        </Button>
                                                    ) : (
                                                        <Typography variant="caption" color="text.secondary">
                                                            No File
                                                        </Typography>
                                                    )}
                                                </TableCell>

                                                <TableCell>
                                                    <Select
                                                        size="small"
                                                        value={app.status || "Applied"}
                                                        onChange={(e) =>
                                                            handleStatusUpdate(app._id, e.target.value)
                                                        }
                                                        sx={{
                                                            fontSize: "0.775rem",
                                                            fontWeight: 600,
                                                            backgroundColor: badge.bg,
                                                            color: badge.text,
                                                            borderRadius: 1.5,
                                                            "& .MuiOutlinedInput-notchedOutline": {
                                                                borderColor: badge.border,
                                                            },
                                                            "&:hover .MuiOutlinedInput-notchedOutline": {
                                                                borderColor: badge.text,
                                                            },
                                                            height: 30,
                                                        }}
                                                    >
                                                        <MenuItem value="Applied">Applied</MenuItem>
                                                        <MenuItem value="Under Review">Under Review</MenuItem>
                                                        <MenuItem value="Shortlisted">Shortlisted</MenuItem>
                                                        <MenuItem value="Interview Scheduled">Interview Scheduled</MenuItem>
                                                        <MenuItem value="Hired">Hired</MenuItem>
                                                        <MenuItem value="Rejected">Rejected</MenuItem>
                                                    </Select>
                                                </TableCell>

                                                <TableCell align="right">
                                                    <Tooltip title="View Application Details">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => {
                                                                setActiveApp(app);
                                                                setAdminNotesInput(app.adminNotes || "");
                                                                setDetailDialogOpen(true);
                                                            }}
                                                            sx={{ color: "#D4AF37" }}
                                                        >
                                                            <VisibilityRoundedIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete Application">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => {
                                                                setAppToDelete(app);
                                                                setDeleteDialogOpen(true);
                                                            }}
                                                            sx={{ color: "#EF4444" }}
                                                        >
                                                            <DeleteOutlineRoundedIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredApplications.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                />
            </Card>

            {/* Candidate Detail Modal Dialog */}
            <Dialog
                open={detailDialogOpen}
                onClose={() => setDetailDialogOpen(false)}
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
                {activeApp && (
                    <>
                        <DialogTitle sx={{ fontWeight: 700, pb: 1, color: "#FFFFFF" }}>
                            Candidate: {activeApp.fullName}
                        </DialogTitle>
                        <DialogContent dividers sx={{ borderColor: "rgba(255, 255, 255, 0.1)" }}>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                                {/* Profile Credentials */}
                                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <EmailRoundedIcon sx={{ color: "#D4AF37", fontSize: 20 }} />
                                        <Typography variant="body2">
                                            <a href={`mailto:${activeApp.email}`} style={{ color: "#D4AF37", textDecoration: "none" }}>
                                                {activeApp.email}
                                            </a>
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <PhoneRoundedIcon sx={{ color: "#D4AF37", fontSize: 20 }} />
                                        <Typography variant="body2" sx={{ color: "#E0E0E0" }}>{activeApp.phone}</Typography>
                                    </Box>

                                    {activeApp.currentCity && (
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <LocationCityRoundedIcon sx={{ color: "#D4AF37", fontSize: 20 }} />
                                            <Typography variant="body2" sx={{ color: "#E0E0E0" }}>City: {activeApp.currentCity}</Typography>
                                        </Box>
                                    )}

                                    {activeApp.qualification && (
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <SchoolRoundedIcon sx={{ color: "#D4AF37", fontSize: 20 }} />
                                            <Typography variant="body2" sx={{ color: "#E0E0E0" }}>Degree: {activeApp.qualification}</Typography>
                                        </Box>
                                    )}
                                </Box>

                                <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.1)" }} />

                                {/* Position & Experience */}
                                <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 1.5 }}>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: "#A0A0A0", textTransform: "uppercase", fontWeight: 700 }}>
                                            Target Position
                                        </Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 700, color: "#FFFFFF", mt: 0.5 }}>
                                            {activeApp.jobOpening?.title || activeApp.positionApplied}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: "#A0A0A0" }}>
                                            Experience Level: <strong style={{ color: "#FFFFFF" }}>{activeApp.experienceLevel || "Fresher"}</strong>
                                        </Typography>
                                    </Box>

                                    {/* Resume Download Button */}
                                    {getResumeUrl(activeApp) && (
                                        <Box sx={{ alignSelf: "center" }}>
                                            <Button
                                                variant="contained"
                                                startIcon={<OpenInNewRoundedIcon />}
                                                href={getResumeUrl(activeApp)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => {
                                                    const url = getResumeUrl(activeApp);
                                                    if (url && url.startsWith("data:")) {
                                                        e.preventDefault();
                                                        handleOpenResume(activeApp);
                                                    }
                                                }}
                                                sx={{
                                                    backgroundColor: "#D4AF37",
                                                    color: "#0B0B0B",
                                                    fontWeight: 700,
                                                    textTransform: "none",
                                                    "&:hover": { backgroundColor: "#E5C158" },
                                                }}
                                            >
                                                Open Resume Document
                                            </Button>
                                        </Box>
                                    )}
                                </Box>

                                {/* Cover Letter / Note */}
                                {activeApp.coverLetter && (
                                    <Box>
                                        <Typography variant="caption" sx={{ color: "#A0A0A0", textTransform: "uppercase", fontWeight: 700 }}>
                                            Cover Note / Candidate Statement
                                        </Typography>
                                        <Box
                                            sx={{
                                                mt: 1,
                                                p: 2,
                                                backgroundColor: "#0B0B0B",
                                                borderRadius: 2,
                                                border: "1px solid rgba(212, 175, 55, 0.2)",
                                                whiteSpace: "pre-wrap",
                                                lineHeight: 1.6,
                                                color: "#E0E0E0",
                                            }}
                                        >
                                            {activeApp.coverLetter}
                                        </Box>
                                    </Box>
                                )}

                                {/* Admin Internal Notes */}
                                <Box>
                                    <Typography variant="caption" sx={{ color: "#A0A0A0", textTransform: "uppercase", fontWeight: 700 }}>
                                        Admin Internal Notes
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={3}
                                        placeholder="Add private evaluation notes about interview performance, salary expectations, etc."
                                        value={adminNotesInput}
                                        onChange={(e) => setAdminNotesInput(e.target.value)}
                                        sx={{
                                            mt: 1,
                                            "& .MuiOutlinedInput-root": {
                                                backgroundColor: "#1B1B1B",
                                                color: "#FFFFFF",
                                                "& .MuiOutlinedInput-notchedOutline": {
                                                    borderColor: "rgba(255, 255, 255, 0.15)",
                                                },
                                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                                    borderColor: "rgba(212, 175, 55, 0.5)",
                                                },
                                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                                    borderColor: "#D4AF37",
                                                },
                                            },
                                        }}
                                    />
                                    <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            onClick={handleSaveAdminNotes}
                                            disabled={savingNotes}
                                            sx={{
                                                borderColor: "rgba(212, 175, 55, 0.4)",
                                                color: "#D4AF37",
                                                textTransform: "none",
                                                fontWeight: 600,
                                                "&:hover": {
                                                    borderColor: "#D4AF37",
                                                    backgroundColor: "rgba(212, 175, 55, 0.08)",
                                                },
                                            }}
                                        >
                                            {savingNotes ? "Saving..." : "Save Notes"}
                                        </Button>
                                    </Box>
                                </Box>
                            </Box>
                        </DialogContent>
                        <DialogActions sx={{ p: 2, borderColor: "rgba(255, 255, 255, 0.1)" }}>
                            <Button onClick={() => setDetailDialogOpen(false)} sx={{ color: "#A0A0A0" }}>Close</Button>
                        </DialogActions>
                    </>
                )}
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
                        Are you sure you want to delete the job application from{" "}
                        <strong style={{ color: "#FFFFFF" }}>{appToDelete?.fullName}</strong>? This action will permanently remove their application record.
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

            {/* Snackbar */}
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

export default AdminApplications;
