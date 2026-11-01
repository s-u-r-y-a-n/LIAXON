import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Avatar,
    Button,
    Chip,
    Tooltip,
    useMediaQuery,
    useTheme,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Badge,
    Snackbar,
    Alert,
} from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import MailRoundedIcon from "@mui/icons-material/MailRounded";
import WorkRoundedIcon from "@mui/icons-material/WorkRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
import { useAuth } from "../context/AuthContext.jsx";
import { useSocketEvent } from "../hooks/useSocket.js";
import "./AdminLayout.scss";

const DRAWER_WIDTH = 260;

const NAV_ITEMS = [
    {
        label: "Dashboard",
        path: "/admin/dashboard",
        icon: <DashboardRoundedIcon fontSize="small" />,
    },
    {
        label: "Contact Messages",
        path: "/admin/contacts",
        icon: <MailRoundedIcon fontSize="small" />,
    },
    {
        label: "Manage Jobs",
        path: "/admin/jobs",
        icon: <WorkRoundedIcon fontSize="small" />,
    },
    {
        label: "Job Applications",
        path: "/admin/applications",
        icon: <PeopleAltRoundedIcon fontSize="small" />,
    },
    {
        label: "Profile & Security",
        path: "/admin/profile",
        icon: <ManageAccountsRoundedIcon fontSize="small" />,
    },
];

const AdminLayout = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const [mobileOpen, setMobileOpen] = useState(false);
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Real-time Contact Inquiries state
    const [unreadContactsCount, setUnreadContactsCount] = useState(0);
    const [toast, setToast] = useState({ open: false, sender: "", subject: "" });

    // Reset unread count when viewing contacts
    useEffect(() => {
        if (location.pathname.startsWith("/admin/contacts")) {
            setUnreadContactsCount(0);
        }
    }, [location.pathname]);

    // Handle real-time incoming contact inquiry
    const handleNewInquiry = (inquiry) => {
        if (!inquiry) return;

        if (!location.pathname.startsWith("/admin/contacts")) {
            setUnreadContactsCount((prev) => prev + 1);
        }

        // Show global toast if admin is not already on Dashboard or Contacts page
        if (
            !location.pathname.startsWith("/admin/dashboard") &&
            !location.pathname.startsWith("/admin/contacts")
        ) {
            const sender =
                inquiry.fullName ||
                `${inquiry.firstName || ""} ${inquiry.lastName || ""}`.trim() ||
                "A visitor";

            setToast({
                open: true,
                sender,
                subject: inquiry.subject || inquiry.inquiryType || "Contact Inquiry",
            });
        }
    };

    useSocketEvent("new_contact_inquiry", handleNewInquiry);
    useSocketEvent("newContactInquiry", handleNewInquiry);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleLogoutConfirm = async () => {
        setLogoutDialogOpen(false);
        await logout();
    };

    // Current page title mapping
    const getPageTitle = () => {
        const current = NAV_ITEMS.find((item) =>
            location.pathname.startsWith(item.path),
        );
        return current ? current.label : "Admin Portal";
    };

    const drawerContent = (
        <Box
            sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#FFFFFF",
            }}
        >
            {/* Sidebar Brand Header */}
            <Box className="sidebar-brand">
                <Box className="brand-icon">
                    <ShieldRoundedIcon fontSize="small" />
                </Box>
                <Box>
                    <Typography className="brand-text">
                        Liaxon <span>Admin</span>
                    </Typography>
                </Box>
                <span className="portal-badge">v1.0</span>
            </Box>

            {/* Navigation Menu */}
            <Box className="nav-list" sx={{ flexGrow: 1 }}>
                <Typography className="nav-section-title">Navigation</Typography>
                <List disablePadding>
                    {NAV_ITEMS.map((item) => {
                        const isActive =
                            location.pathname === item.path ||
                            (item.path !== "/admin/dashboard" &&
                                location.pathname.startsWith(item.path));

                        return (
                            <ListItemButton
                                key={item.path}
                                component={NavLink}
                                to={item.path}
                                className={`nav-item ${isActive ? "active" : ""}`}
                                onClick={() => {
                                    if (isMobile) setMobileOpen(false);
                                }}
                            >
                                <ListItemIcon className="nav-icon">
                                    {item.path === "/admin/contacts" && unreadContactsCount > 0 ? (
                                        <Badge
                                            badgeContent={unreadContactsCount}
                                            color="error"
                                            max={99}
                                            sx={{
                                                "& .MuiBadge-badge": {
                                                    fontSize: "0.7rem",
                                                    height: 18,
                                                    minWidth: 18,
                                                },
                                            }}
                                        >
                                            {item.icon}
                                        </Badge>
                                    ) : (
                                        item.icon
                                    )}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.label}
                                    primaryTypographyProps={{
                                        fontSize: "0.915rem",
                                        fontWeight: isActive ? 600 : 500,
                                    }}
                                />
                            </ListItemButton>
                        );
                    })}
                </List>
            </Box>

            {/* Sidebar User Footer */}
            <Box className="sidebar-footer">
                <Tooltip title="Click to view & edit Profile / Password">
                    <Box
                        className="admin-user-card"
                        onClick={() => {
                            navigate("/admin/profile");
                            if (isMobile) setMobileOpen(false);
                        }}
                        sx={{
                            cursor: "pointer",
                            transition: "background-color 0.2s, transform 0.15s",
                            "&:hover": {
                                backgroundColor: "#F1F5F9",
                                transform: "translateY(-1px)",
                            },
                        }}
                    >
                        <Avatar
                            sx={{
                                width: 38,
                                height: 38,
                                bgcolor: "#0F172A",
                                fontSize: "0.95rem",
                                fontWeight: 700,
                            }}
                        >
                            {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
                        </Avatar>
                        <Box className="user-info">
                            <Typography className="user-name">
                                {user?.name || "Admin"}
                            </Typography>
                            <Typography className="user-role">
                                {user?.email || "admin@liaxon.com"}
                            </Typography>
                        </Box>
                    </Box>
                </Tooltip>
            </Box>
        </Box>
    );

    return (
        <Box className="admin-layout">
            {/* Desktop Permanent Drawer */}
            <Drawer
                variant={isMobile ? "temporary" : "permanent"}
                open={isMobile ? mobileOpen : true}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                className="admin-sidebar"
                sx={{
                    "& .MuiDrawer-paper": {
                        width: DRAWER_WIDTH,
                        boxSizing: "border-box",
                        borderRight: "1px solid #E2E8F0",
                    },
                }}
            >
                {drawerContent}
            </Drawer>

            {/* Main Content Area */}
            <Box className="admin-main">
                {/* Top App Bar */}
                <AppBar position="sticky" elevation={0} className="admin-header">
                    <Toolbar className="header-toolbar">
                        <Box className="header-title-box">
                            {isMobile && (
                                <IconButton
                                    color="inherit"
                                    aria-label="open drawer"
                                    edge="start"
                                    onClick={handleDrawerToggle}
                                    sx={{ mr: 1, color: "#0F172A" }}
                                >
                                    <MenuRoundedIcon />
                                </IconButton>
                            )}
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 700,
                                    color: "#0F172A",
                                    fontSize: { xs: "1.1rem", md: "1.25rem" },
                                }}
                            >
                                {getPageTitle()}
                            </Typography>
                        </Box>

                        <Box className="header-actions">
                            <Tooltip title="Open Public Website">
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<OpenInNewRoundedIcon fontSize="small" />}
                                    onClick={() => window.open("/", "_blank")}
                                    sx={{
                                        borderColor: "#E2E8F0",
                                        color: "#475569",
                                        display: { xs: "none", sm: "inline-flex" },
                                        "&:hover": {
                                            borderColor: "#CBD5E1",
                                            backgroundColor: "#F8FAFC",
                                        },
                                    }}
                                >
                                    View Site
                                </Button>
                            </Tooltip>

                            <Chip
                                label={user?.role || "Admin"}
                                size="small"
                                color="primary"
                                sx={{
                                    fontWeight: 600,
                                    fontSize: "0.75rem",
                                    backgroundColor: "#0F172A",
                                    display: { xs: "none", md: "inline-flex" },
                                }}
                            />

                            <Tooltip title="Log out from Admin Portal">
                                <Button
                                    variant="contained"
                                    color="error"
                                    size="small"
                                    startIcon={<LogoutRoundedIcon fontSize="small" />}
                                    onClick={() => setLogoutDialogOpen(true)}
                                    sx={{
                                        backgroundColor: "#FEF2F2",
                                        color: "#EF4444",
                                        border: "1px solid #FEE2E2",
                                        boxShadow: "none",
                                        "&:hover": {
                                            backgroundColor: "#FEE2E2",
                                            boxShadow: "none",
                                        },
                                    }}
                                >
                                    Logout
                                </Button>
                            </Tooltip>
                        </Box>
                    </Toolbar>
                </AppBar>

                {/* Main Content Router Outlet */}
                <Box component="main" className="admin-content">
                    <Outlet />
                </Box>
            </Box>

            {/* Logout Confirmation Dialog */}
            <Dialog
                open={logoutDialogOpen}
                onClose={() => setLogoutDialogOpen(false)}
                PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
            >
                <DialogTitle sx={{ fontWeight: 700, color: "#0F172A" }}>
                    Confirm Logout
                </DialogTitle>
                <DialogContent>
                    <DialogContentText color="text.secondary">
                        Are you sure you want to log out of the Liaxon Admin Portal? Your active session token will be cleared.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ pb: 1, px: 2 }}>
                    <Button
                        onClick={() => setLogoutDialogOpen(false)}
                        sx={{ color: "#64748B" }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleLogoutConfirm}
                        variant="contained"
                        color="error"
                    >
                        Logout
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Global Real-time Lead Notification Toast */}
            <Snackbar
                open={toast.open}
                autoHideDuration={6000}
                onClose={() => setToast((prev) => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert
                    onClose={() => setToast((prev) => ({ ...prev, open: false }))}
                    severity="info"
                    variant="filled"
                    sx={{
                        width: "100%",
                        backgroundColor: "#0F172A",
                        color: "#FFFFFF",
                        boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.4)",
                        borderRadius: 2,
                        alignItems: "center",
                        "& .MuiAlert-icon": { color: "#38BDF8" },
                    }}
                    action={
                        <Button
                            color="inherit"
                            size="small"
                            onClick={() => {
                                setToast((prev) => ({ ...prev, open: false }));
                                navigate("/admin/contacts");
                            }}
                            sx={{
                                color: "#38BDF8",
                                fontWeight: 700,
                                textTransform: "none",
                                ml: 1,
                            }}
                        >
                            View
                        </Button>
                    }
                >
                    <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: "0.875rem" }}>
                            {toast.sender}
                        </Typography>
                        <Typography sx={{ fontSize: "0.8rem", opacity: 0.9 }}>
                            {toast.subject}
                        </Typography>
                    </Box>
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AdminLayout;
