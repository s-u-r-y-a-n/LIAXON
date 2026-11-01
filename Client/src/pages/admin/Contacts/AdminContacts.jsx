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
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import { contactsApi } from "../../../services/adminApi.js";
import { useSocketEvent } from "../../../hooks/useSocket.js";
import "./AdminContacts.scss";

const STATUS_OPTIONS = [
    "All",
    "New",
    "In Review",
    "Contacted",
    "Resolved",
];

const INQUIRY_TYPE_OPTIONS = [
    "All",
    "Business Partnerships & Alliances",
    "Business Services & Sales Enquiries",
    "Careers & Recruitment",
    "General Enquiries",
];

const AdminContacts = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [inquiryTypeFilter, setInquiryTypeFilter] = useState("All");

    // Pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // View Modal
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [activeContact, setActiveContact] = useState(null);

    // Delete Confirmation
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [contactToDelete, setContactToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Toast feedback
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    const showSnackbar = (message, severity = "success") => {
        setSnackbar({ open: true, message, severity });
    };

    // Real-time listener: prepend newly submitted inquiry to table immediately
    const handleNewInquiry = (newInquiry) => {
        if (!newInquiry) return;

        setContacts((prev) => {
            const id = newInquiry._id || newInquiry.id;
            const exists = prev.some((item) => (item._id || item.id) === id);
            if (exists) return prev;
            return [newInquiry, ...prev];
        });

        const senderName =
            newInquiry.fullName ||
            `${newInquiry.firstName || ""} ${newInquiry.lastName || ""}`.trim() ||
            "A visitor";

        showSnackbar(
            `Real-time lead received from ${senderName} (${newInquiry.inquiryType || "General"})`,
            "info",
        );
    };

    useSocketEvent("new_contact_inquiry", handleNewInquiry);
    useSocketEvent("newContactInquiry", handleNewInquiry);

    const fetchContacts = async () => {
        try {
            setLoading(true);
            const response = await contactsApi.getAll();
            const list =
                response.data?.inquiries ||
                response.data?.data ||
                response.data ||
                [];
            setContacts(Array.isArray(list) ? list : []);
        } catch (err) {
            console.error("Fetch Contacts Error:", err);
            showSnackbar("Failed to fetch contact inquiries.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    // Filter contacts based on search, status, and inquiryType
    const filteredContacts = useMemo(() => {
        return contacts.filter((item) => {
            const matchesStatus =
                statusFilter === "All" || item.status === statusFilter;

            const matchesInquiryType =
                inquiryTypeFilter === "All" ||
                item.inquiryType === inquiryTypeFilter;

            const name =
                item.fullName ||
                `${item.firstName || ""} ${item.lastName || ""}`.toLowerCase();
            const email = (item.email || "").toLowerCase();
            const phone = (item.phone || "").toLowerCase();
            const company = (item.company || "").toLowerCase();
            const subject = (item.subject || "").toLowerCase();
            const inquiryType = (item.inquiryType || "").toLowerCase();

            const query = searchQuery.toLowerCase().trim();
            const matchesSearch =
                !query ||
                name.includes(query) ||
                email.includes(query) ||
                phone.includes(query) ||
                company.includes(query) ||
                subject.includes(query) ||
                inquiryType.includes(query);

            return matchesStatus && matchesInquiryType && matchesSearch;
        });
    }, [contacts, searchQuery, statusFilter, inquiryTypeFilter]);

    // Handle status change
    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await contactsApi.updateStatus(id, newStatus);
            setContacts((prev) =>
                prev.map((c) => (c._id === id ? { ...c, status: newStatus } : c)),
            );
            if (activeContact && activeContact._id === id) {
                setActiveContact((prev) => ({ ...prev, status: newStatus }));
            }
            showSnackbar(`Inquiry status updated to ${newStatus}.`);
        } catch (err) {
            console.error("Status Update Error:", err);
            showSnackbar("Failed to update status.", "error");
        }
    };

    // Handle Delete
    const handleDeleteConfirm = async () => {
        if (!contactToDelete) return;
        try {
            setDeleting(true);
            await contactsApi.delete(contactToDelete._id);
            setContacts((prev) =>
                prev.filter((c) => c._id !== contactToDelete._id),
            );
            showSnackbar("Contact message deleted successfully.");
            setDeleteDialogOpen(false);
            setContactToDelete(null);
            if (viewDialogOpen && activeContact?._id === contactToDelete._id) {
                setViewDialogOpen(false);
            }
        } catch (err) {
            console.error("Delete Contact Error:", err);
            showSnackbar("Failed to delete contact inquiry.", "error");
        } finally {
            setDeleting(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case "New":
                return { bg: "#EFF6FF", text: "#2563EB", border: "#BFDBFE" };
            case "In Review":
                return { bg: "#FFFBEB", text: "#D97706", border: "#FDE68A" };
            case "Contacted":
                return { bg: "#F5F3FF", text: "#7C3AED", border: "#DDD6FE" };
            case "Resolved":
                return { bg: "#ECFDF5", text: "#059669", border: "#A7F3D0" };
            default:
                return { bg: "#F1F5F9", text: "#475569", border: "#E2E8F0" };
        }
    };

    const getInquiryTypeBadge = (type) => {
        switch (type) {
            case "Business Partnerships & Alliances":
                return { bg: "#F5F3FF", text: "#6D28D9", border: "#DDD6FE" };
            case "Business Services & Sales Enquiries":
                return { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" };
            case "Careers & Recruitment":
                return { bg: "#ECFDF5", text: "#047857", border: "#A7F3D0" };
            case "General Enquiries":
            default:
                return { bg: "#F0F9FF", text: "#0369A1", border: "#BAE6FD" };
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "—";
        try {
            return new Date(dateString).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return "—";
        }
    };

    return (
        <Box className="admin-contacts-page">
            {/* Header */}
            <Box className="contacts-header">
                <Box className="header-info">
                    <Typography component="h1" className="page-title">
                        Contact Inquiries
                    </Typography>
                    <Typography className="page-sub">
                        Manage visitor inquiries, client collaboration messages, and feedback.
                    </Typography>
                </Box>
                <Tooltip title="Refresh Messages">
                    <IconButton
                        onClick={fetchContacts}
                        sx={{
                            backgroundColor: "#FFFFFF",
                            border: "1px solid #E2E8F0",
                            "&:hover": { backgroundColor: "#F8FAFC" },
                        }}
                    >
                        <RefreshRoundedIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>

            {/* Table Card */}
            <Card className="contacts-card" elevation={0}>
                {/* Search & Filter Bar */}
                <Box className="toolbar-bar">
                    <TextField
                        size="small"
                        placeholder="Search by name, email, company, subject..."
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

                    <FormControl size="small" className="filter-box" sx={{ minWidth: { xs: "100%", sm: 220 } }}>
                        <InputLabel id="inquiry-type-filter-label">Inquiry Type</InputLabel>
                        <Select
                            labelId="inquiry-type-filter-label"
                            label="Inquiry Type"
                            value={inquiryTypeFilter}
                            onChange={(e) => {
                                setInquiryTypeFilter(e.target.value);
                                setPage(0);
                            }}
                        >
                            {INQUIRY_TYPE_OPTIONS.map((opt) => (
                                <MenuItem key={opt} value={opt}>
                                    {opt === "All" ? "All Inquiry Types" : opt}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" className="filter-box" sx={{ minWidth: { xs: "100%", sm: 140 } }}>
                        <InputLabel id="status-filter-label">Status</InputLabel>
                        <Select
                            labelId="status-filter-label"
                            label="Status"
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPage(0);
                            }}
                        >
                            {STATUS_OPTIONS.map((opt) => (
                                <MenuItem key={opt} value={opt}>
                                    {opt === "All" ? "All Statuses" : opt}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                {/* Table */}
                <TableContainer>
                    <Table className="contacts-table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>Sender</TableCell>
                                <TableCell>Subject / Inquiry</TableCell>
                                <TableCell>Company / Role</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                        <CircularProgress size={32} sx={{ color: "#0F172A" }} />
                                    </TableCell>
                                </TableRow>
                            ) : filteredContacts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 6, color: "text.secondary" }}>
                                        No contact inquiries found matching the criteria.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredContacts
                                    .slice(
                                        page * rowsPerPage,
                                        page * rowsPerPage + rowsPerPage,
                                    )
                                    .map((contact) => {
                                        const badge = getStatusStyle(contact.status);
                                        const name =
                                            contact.fullName ||
                                            `${contact.firstName || ""} ${contact.lastName || ""}`.trim() ||
                                            "Anonymous";

                                        return (
                                            <TableRow key={contact._id} hover>
                                                <TableCell sx={{ color: "text.secondary", fontSize: "0.825rem", whiteSpace: "nowrap" }}>
                                                    {formatDate(contact.createdAt)}
                                                </TableCell>

                                                <TableCell>
                                                    <Box className="sender-cell">
                                                        <Typography className="sender-name">
                                                            {name}
                                                        </Typography>
                                                        <Typography className="sender-email">
                                                            {contact.email}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>

                                                <TableCell className="subject-cell">
                                                    <Box sx={{ mb: 0.6 }}>
                                                        <Chip
                                                            label={contact.inquiryType || "General Enquiries"}
                                                            size="small"
                                                            sx={{
                                                                fontSize: "0.72rem",
                                                                fontWeight: 700,
                                                                backgroundColor: getInquiryTypeBadge(contact.inquiryType).bg,
                                                                color: getInquiryTypeBadge(contact.inquiryType).text,
                                                                border: `1px solid ${getInquiryTypeBadge(contact.inquiryType).border}`,
                                                                height: 22,
                                                            }}
                                                        />
                                                    </Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#0F172A" }}>
                                                        {contact.subject || contact.inquiryType || "General Inquiry"}
                                                    </Typography>
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                        sx={{
                                                            display: "-webkit-box",
                                                            WebkitLineClamp: 1,
                                                            WebkitBoxOrient: "vertical",
                                                            overflow: "hidden",
                                                        }}
                                                    >
                                                        {contact.message}
                                                    </Typography>
                                                </TableCell>

                                                <TableCell sx={{ fontSize: "0.85rem", color: "text.secondary" }}>
                                                    {contact.company || contact.jobTitle
                                                        ? `${contact.company || ""}${contact.company && contact.jobTitle ? " • " : ""}${contact.jobTitle || ""}`
                                                        : "—"}
                                                </TableCell>

                                                <TableCell>
                                                    <Select
                                                        size="small"
                                                        value={contact.status || "New"}
                                                        onChange={(e) =>
                                                            handleStatusUpdate(contact._id, e.target.value)
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
                                                        <MenuItem value="New">New</MenuItem>
                                                        <MenuItem value="In Review">In Review</MenuItem>
                                                        <MenuItem value="Contacted">Contacted</MenuItem>
                                                        <MenuItem value="Resolved">Resolved</MenuItem>
                                                    </Select>
                                                </TableCell>

                                                <TableCell align="right">
                                                    <Tooltip title="View Message">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => {
                                                                setActiveContact(contact);
                                                                setViewDialogOpen(true);
                                                            }}
                                                            sx={{ color: "#2563EB" }}
                                                        >
                                                            <VisibilityRoundedIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete Message">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => {
                                                                setContactToDelete(contact);
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

                {/* Pagination */}
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredContacts.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                />
            </Card>

            {/* View Message Detail Dialog */}
            <Dialog
                open={viewDialogOpen}
                onClose={() => setViewDialogOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                {activeContact && (
                    <>
                        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
                            Inquiry from {activeContact.fullName || `${activeContact.firstName || ""} ${activeContact.lastName || ""}`}
                        </DialogTitle>
                        <DialogContent dividers>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                                {/* Metadata Row */}
                                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <EmailRoundedIcon sx={{ color: "#64748B", fontSize: 20 }} />
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            <a href={`mailto:${activeContact.email}`} style={{ color: "#2563EB", textDecoration: "none" }}>
                                                {activeContact.email}
                                            </a>
                                        </Typography>
                                    </Box>
                                    {activeContact.phone && (
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <PhoneRoundedIcon sx={{ color: "#64748B", fontSize: 20 }} />
                                            <Typography variant="body2">{activeContact.phone}</Typography>
                                        </Box>
                                    )}
                                    {activeContact.company && (
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <BusinessRoundedIcon sx={{ color: "#64748B", fontSize: 20 }} />
                                            <Typography variant="body2">
                                                {activeContact.company} {activeContact.jobTitle ? `(${activeContact.jobTitle})` : ""}
                                            </Typography>
                                        </Box>
                                    )}
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            Received: {formatDate(activeContact.createdAt)}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Divider />

                                {/* Subject & Type */}
                                <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontWeight: 700 }}>
                                        Inquiry Subject
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.5, color: "#0F172A" }}>
                                        {activeContact.subject || activeContact.inquiryType || "General Inquiry"}
                                    </Typography>
                                    {activeContact.inquiryType && (
                                        <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1 }}>
                                            <Chip
                                                label={activeContact.inquiryType}
                                                size="small"
                                                sx={{
                                                    fontWeight: 700,
                                                    backgroundColor: getInquiryTypeBadge(activeContact.inquiryType).bg,
                                                    color: getInquiryTypeBadge(activeContact.inquiryType).text,
                                                    border: `1px solid ${getInquiryTypeBadge(activeContact.inquiryType).border}`,
                                                }}
                                            />
                                        </Box>
                                    )}
                                </Box>

                                {/* Full Message */}
                                <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontWeight: 700 }}>
                                        Message Body
                                    </Typography>
                                    <Box
                                        sx={{
                                            mt: 1,
                                            p: 2.5,
                                            backgroundColor: "#F8FAFC",
                                            borderRadius: 2,
                                            border: "1px solid #E2E8F0",
                                            whiteSpace: "pre-wrap",
                                            lineHeight: 1.6,
                                            color: "#1E293B",
                                        }}
                                    >
                                        {activeContact.message}
                                    </Box>
                                </Box>

                                {/* Status Selector in modal */}
                                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        Status:
                                    </Typography>
                                    <Select
                                        size="small"
                                        value={activeContact.status || "New"}
                                        onChange={(e) =>
                                            handleStatusUpdate(activeContact._id, e.target.value)
                                        }
                                        sx={{ minWidth: 150 }}
                                    >
                                        <MenuItem value="New">New</MenuItem>
                                        <MenuItem value="In Review">In Review</MenuItem>
                                        <MenuItem value="Contacted">Contacted</MenuItem>
                                        <MenuItem value="Resolved">Resolved</MenuItem>
                                    </Select>
                                </Box>
                            </Box>
                        </DialogContent>
                        <DialogActions sx={{ p: 2 }}>
                            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
                            <Button
                                variant="contained"
                                href={`mailto:${activeContact.email}?subject=Re: ${encodeURIComponent(activeContact.subject || "Your Inquiry to Liaxon")}`}
                            >
                                Reply via Email
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
            >
                <DialogTitle sx={{ fontWeight: 700, color: "#0F172A" }}>
                    Confirm Deletion
                </DialogTitle>
                <DialogContent>
                    <DialogContentText color="text.secondary">
                        Are you sure you want to delete the contact inquiry from{" "}
                        <strong>{contactToDelete?.fullName || contactToDelete?.email}</strong>? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ pb: 1, px: 2 }}>
                    <Button
                        onClick={() => setDeleteDialogOpen(false)}
                        disabled={deleting}
                        sx={{ color: "#64748B" }}
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

            {/* Snackbar feedback */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
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
        </Box>
    );
};

export default AdminContacts;
