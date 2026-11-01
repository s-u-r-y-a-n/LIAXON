import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Typography,
    Card,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Button,
    Skeleton,
    Alert,
    IconButton,
    Tooltip,
} from "@mui/material";
import MailRoundedIcon from "@mui/icons-material/MailRounded";
import WorkRoundedIcon from "@mui/icons-material/WorkRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import HourglassTopRoundedIcon from "@mui/icons-material/HourglassTopRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import { dashboardApi } from "../../../services/adminApi.js";
import { useAuth } from "../../../context/AuthContext.jsx";
import "./AdminDashboard.scss";

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [stats, setStats] = useState({
        totalInquiries: 0,
        unreadInquiries: 0,
        activeJobs: 0,
        totalJobs: 0,
        totalApplications: 0,
        pendingApplications: 0,
    });
    const [recentInquiries, setRecentInquiries] = useState([]);
    const [recentApplications, setRecentApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await dashboardApi.getStats();
            const data = response.data;

            if (data.stats) {
                setStats(data.stats);
            }
            if (data.recentInquiries) {
                setRecentInquiries(data.recentInquiries);
            }
            if (data.recentApplications) {
                setRecentApplications(data.recentApplications);
            }
        } catch (err) {
            console.error("Dashboard Stats Fetch Error:", err);
            setError(
                err.response?.data?.message ||
                    "Could not load dashboard statistics. Please try refreshing.",
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case "New":
            case "Applied":
                return { bg: "#EFF6FF", text: "#2563EB", border: "#BFDBFE" };
            case "In Review":
            case "Under Review":
                return { bg: "#FFFBEB", text: "#D97706", border: "#FDE68A" };
            case "Shortlisted":
            case "Contacted":
            case "Hired":
            case "Resolved":
                return { bg: "#ECFDF5", text: "#059669", border: "#A7F3D0" };
            case "Rejected":
                return { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" };
            default:
                return { bg: "#F1F5F9", text: "#475569", border: "#E2E8F0" };
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
        <Box className="admin-dashboard">
            {/* Header Greeting */}
            <Box className="dashboard-header">
                <Box className="header-text">
                    <Typography component="h1" className="welcome-title">
                        Welcome back, {user?.name || "Admin"}
                    </Typography>
                    <Typography className="welcome-sub">
                        Here is an overview of inquiries, active career postings, and candidate applications.
                    </Typography>
                </Box>
                <Box className="header-actions">
                    <Tooltip title="Refresh Stats">
                        <IconButton
                            onClick={fetchDashboardData}
                            sx={{
                                border: "1px solid #E2E8F0",
                                backgroundColor: "#FFFFFF",
                                "&:hover": { backgroundColor: "#F8FAFC" },
                            }}
                        >
                            <RefreshRoundedIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Button
                        variant="contained"
                        onClick={() => navigate("/admin/jobs")}
                        startIcon={<WorkRoundedIcon />}
                    >
                        Post New Job
                    </Button>
                </Box>
            </Box>

            {error && (
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Top Metric Cards */}
            <Box className="metrics-grid">
                {/* Metric 1: Inquiries */}
                <Box className="metric-card">
                    <Box className="metric-info">
                        <Typography className="metric-label">
                            Contact Inquiries
                        </Typography>
                        <Typography className="metric-value">
                            {loading ? <Skeleton width={60} /> : stats.totalInquiries}
                        </Typography>
                        <Typography className="metric-sub highlight">
                            {loading ? (
                                <Skeleton width={80} />
                            ) : (
                                `${stats.unreadInquiries} Pending / New`
                            )}
                        </Typography>
                    </Box>
                    <Box className="metric-icon-box blue">
                        <MailRoundedIcon />
                    </Box>
                </Box>

                {/* Metric 2: Active Jobs */}
                <Box className="metric-card">
                    <Box className="metric-info">
                        <Typography className="metric-label">Active Jobs</Typography>
                        <Typography className="metric-value">
                            {loading ? <Skeleton width={60} /> : stats.activeJobs}
                        </Typography>
                        <Typography className="metric-sub">
                            {loading ? (
                                <Skeleton width={80} />
                            ) : (
                                `${stats.totalJobs || stats.activeJobs} Total Postings`
                            )}
                        </Typography>
                    </Box>
                    <Box className="metric-icon-box teal">
                        <WorkRoundedIcon />
                    </Box>
                </Box>

                {/* Metric 3: Total Applications */}
                <Box className="metric-card">
                    <Box className="metric-info">
                        <Typography className="metric-label">
                            Applications
                        </Typography>
                        <Typography className="metric-value">
                            {loading ? <Skeleton width={60} /> : stats.totalApplications}
                        </Typography>
                        <Typography className="metric-sub">
                            {loading ? <Skeleton width={80} /> : "Received Resumes"}
                        </Typography>
                    </Box>
                    <Box className="metric-icon-box purple">
                        <PeopleAltRoundedIcon />
                    </Box>
                </Box>

                {/* Metric 4: Pending Review */}
                <Box className="metric-card">
                    <Box className="metric-info">
                        <Typography className="metric-label">
                            Pending Review
                        </Typography>
                        <Typography className="metric-value">
                            {loading ? <Skeleton width={60} /> : stats.pendingApplications}
                        </Typography>
                        <Typography className="metric-sub highlight">
                            {loading ? <Skeleton width={80} /> : "Requires Action"}
                        </Typography>
                    </Box>
                    <Box className="metric-icon-box amber">
                        <HourglassTopRoundedIcon />
                    </Box>
                </Box>
            </Box>

            {/* Recent Activity Sections */}
            <Box className="recent-section-grid">
                {/* Recent Inquiries Table */}
                <Card className="recent-card" elevation={0}>
                    <Box className="card-header-bar">
                        <Typography className="card-title">
                            Recent Contact Messages
                        </Typography>
                        <Box
                            className="view-all-link"
                            onClick={() => navigate("/admin/contacts")}
                        >
                            View All <ArrowForwardRoundedIcon fontSize="inherit" />
                        </Box>
                    </Box>

                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Sender</TableCell>
                                    <TableCell>Subject</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell align="right">Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    [...Array(4)].map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton /></TableCell>
                                            <TableCell><Skeleton /></TableCell>
                                            <TableCell><Skeleton /></TableCell>
                                            <TableCell><Skeleton /></TableCell>
                                        </TableRow>
                                    ))
                                ) : recentInquiries.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center" className="empty-state">
                                            No contact inquiries received yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    recentInquiries.map((inquiry) => {
                                        const badge = getStatusColor(inquiry.status);
                                        const senderName =
                                            inquiry.fullName ||
                                            `${inquiry.firstName || ""} ${inquiry.lastName || ""}`.trim() ||
                                            "Anonymous";
                                        return (
                                            <TableRow
                                                key={inquiry._id}
                                                hover
                                                sx={{ cursor: "pointer" }}
                                                onClick={() => navigate("/admin/contacts")}
                                            >
                                                <TableCell sx={{ fontWeight: 600 }}>
                                                    {senderName}
                                                </TableCell>
                                                <TableCell
                                                    sx={{
                                                        maxWidth: 160,
                                                        whiteSpace: "nowrap",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                    }}
                                                >
                                                    {inquiry.subject || inquiry.inquiryType || "General Inquiry"}
                                                </TableCell>
                                                <TableCell sx={{ color: "text.secondary" }}>
                                                    {formatDate(inquiry.createdAt)}
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Chip
                                                        label={inquiry.status || "New"}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: badge.bg,
                                                            color: badge.text,
                                                            border: `1px solid ${badge.border}`,
                                                            fontWeight: 600,
                                                            fontSize: "0.75rem",
                                                        }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>

                {/* Recent Applications Table */}
                <Card className="recent-card" elevation={0}>
                    <Box className="card-header-bar">
                        <Typography className="card-title">
                            Recent Job Applications
                        </Typography>
                        <Box
                            className="view-all-link"
                            onClick={() => navigate("/admin/applications")}
                        >
                            View All <ArrowForwardRoundedIcon fontSize="inherit" />
                        </Box>
                    </Box>

                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Candidate</TableCell>
                                    <TableCell>Role</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell align="right">Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    [...Array(4)].map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton /></TableCell>
                                            <TableCell><Skeleton /></TableCell>
                                            <TableCell><Skeleton /></TableCell>
                                            <TableCell><Skeleton /></TableCell>
                                        </TableRow>
                                    ))
                                ) : recentApplications.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center" className="empty-state">
                                            No job applications received yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    recentApplications.map((app) => {
                                        const badge = getStatusColor(app.status);
                                        const roleTitle =
                                            app.jobOpening?.title ||
                                            app.positionApplied ||
                                            "General Application";
                                        return (
                                            <TableRow
                                                key={app._id}
                                                hover
                                                sx={{ cursor: "pointer" }}
                                                onClick={() => navigate("/admin/applications")}
                                            >
                                                <TableCell sx={{ fontWeight: 600 }}>
                                                    {app.fullName}
                                                </TableCell>
                                                <TableCell
                                                    sx={{
                                                        maxWidth: 160,
                                                        whiteSpace: "nowrap",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                    }}
                                                >
                                                    {roleTitle}
                                                </TableCell>
                                                <TableCell sx={{ color: "text.secondary" }}>
                                                    {formatDate(app.createdAt)}
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Chip
                                                        label={app.status || "Applied"}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: badge.bg,
                                                            color: badge.text,
                                                            border: `1px solid ${badge.border}`,
                                                            fontWeight: 600,
                                                            fontSize: "0.75rem",
                                                        }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>
            </Box>
        </Box>
    );
};

export default AdminDashboard;
