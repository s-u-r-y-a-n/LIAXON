import React, { useState, useEffect } from "react";
import {
    Box,
    Card,
    Typography,
    TextField,
    Button,
    InputAdornment,
    IconButton,
    Alert,
    CircularProgress,
    Snackbar,
    Chip,
    Divider,
} from "@mui/material";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import KeyRoundedIcon from "@mui/icons-material/KeyRounded";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import { useAuth } from "../../../context/AuthContext.jsx";
import { authApi } from "../../../services/adminApi.js";
import { encryptPassword } from "../../../utils/encryption.js";
import "./AdminProfile.scss";

const AdminProfile = () => {
    const { user, updateUser } = useAuth();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [showPassword, setShowPassword] = useState({
        old: false,
        new: false,
        confirm: false,
    });

    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState({
        type: "",
        text: "",
    });
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    useEffect(() => {
        if (user) {
            setFormData((prev) => ({
                ...prev,
                name: user.name || "",
                email: user.email || "",
            }));
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (statusMessage.text) {
            setStatusMessage({ type: "", text: "" });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const cleanName = formData.name.trim();
        const cleanEmail = formData.email.trim();
        const cleanCurrentPassword = formData.currentPassword.trim();
        const cleanNewPassword = formData.newPassword.trim();
        const cleanConfirmPassword = formData.confirmPassword.trim();

        // 1. Basic field validations
        if (!cleanName) {
            setStatusMessage({
                type: "error",
                text: "Please enter your name.",
            });
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!cleanEmail || !emailRegex.test(cleanEmail)) {
            setStatusMessage({
                type: "error",
                text: "Please provide a valid email address.",
            });
            return;
        }

        // 2. Password change validations
        const isChangingPassword = Boolean(cleanNewPassword || cleanConfirmPassword);

        if (isChangingPassword) {
            if (!cleanCurrentPassword) {
                setStatusMessage({
                    type: "error",
                    text: "Please enter your existing password to authorize the change.",
                });
                return;
            }

            if (cleanNewPassword.length < 6) {
                setStatusMessage({
                    type: "error",
                    text: "New password must be at least 6 characters long.",
                });
                return;
            }

            if (cleanNewPassword !== cleanConfirmPassword) {
                setStatusMessage({
                    type: "error",
                    text: "New password and Confirm Password do not match.",
                });
                return;
            }

            if (cleanCurrentPassword === cleanNewPassword) {
                setStatusMessage({
                    type: "error",
                    text: "Your new password must be different from your current password.",
                });
                return;
            }
        }

        try {
            setLoading(true);
            setStatusMessage({ type: "", text: "" });

            // Build payload with encrypted passwords via CryptoJS AES-256
            const payload = {
                name: cleanName,
                email: cleanEmail,
            };

            if (isChangingPassword) {
                payload.currentPassword = encryptPassword(cleanCurrentPassword);
                payload.newPassword = encryptPassword(cleanNewPassword);
            }

            const response = await authApi.updateProfile(payload);
            const updatedUser =
                response.data?.user ||
                response.data?.data?.admin ||
                response.data?.admin;

            if (updatedUser) {
                updateUser(updatedUser);
            }

            // Clear password fields on successful update
            setFormData((prev) => ({
                ...prev,
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            }));

            setSnackbar({
                open: true,
                message:
                    response.data?.message ||
                    "Administrator profile updated successfully.",
                severity: "success",
            });
        } catch (error) {
            console.error("Profile Update Error:", error);
            const errorMsg =
                error.response?.data?.message ||
                error.message ||
                "Failed to update profile. Please verify your details.";
            setStatusMessage({
                type: "error",
                text: errorMsg,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleClickShowPassword = (field) => {
        setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    return (
        <Box className="admin-profile-page">
            {/* Header */}
            <Box className="profile-header">
                <Box className="header-info">
                    <Typography component="h1" className="page-title">
                        Admin Profile & Security
                    </Typography>
                    <Typography className="page-sub">
                        Manage your administrator identity, credentials, and password settings.
                    </Typography>
                </Box>
                <Chip
                    icon={<ShieldRoundedIcon />}
                    label={user?.role ? `${user.role.toUpperCase()} ACCOUNT` : "ADMIN ACCOUNT"}
                    sx={{
                        bgcolor: "#0F172A",
                        color: "#FFFFFF",
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        letterSpacing: "0.05em",
                        px: 1,
                    }}
                />
            </Box>

            {statusMessage.text && (
                <Alert
                    severity={statusMessage.type || "info"}
                    sx={{ borderRadius: 2 }}
                >
                    {statusMessage.text}
                </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate className="profile-grid">
                {/* 1. Basic Account Information Card */}
                <Card className="profile-card" elevation={0}>
                    <Box className="card-header-box">
                        <Box className="icon-box">
                            <PersonRoundedIcon />
                        </Box>
                        <Box className="header-text">
                            <Typography component="h3">General Information</Typography>
                            <Typography>
                                Update your administrative display name and primary contact email.
                            </Typography>
                        </Box>
                    </Box>

                    <Box className="form-fields-grid">
                        <TextField
                            label="Administrator Name"
                            name="name"
                            required
                            fullWidth
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g. Surya"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PersonRoundedIcon sx={{ color: "#94A3B8" }} fontSize="small" />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <TextField
                            label="Admin Email Address"
                            name="email"
                            type="email"
                            required
                            fullWidth
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="e.g. admin@liaxon.in"
                            helperText="Used for administrative authentication and access"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <EmailRoundedIcon sx={{ color: "#94A3B8" }} fontSize="small" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>
                </Card>

                {/* 2. Security & Password Update Card */}
                <Card className="profile-card" elevation={0}>
                    <Box className="card-header-box">
                        <Box className="icon-box">
                            <KeyRoundedIcon />
                        </Box>
                        <Box className="header-text">
                            <Typography component="h3">Security & Password</Typography>
                            <Typography>
                                Change your password. Leave these fields blank if you do not want to change your password.
                            </Typography>
                        </Box>
                    </Box>

                    <Alert severity="info" sx={{ mb: 3, borderRadius: 2, fontSize: "0.85rem" }}>
                        All passwords are encrypted with AES-256 before transmission and stored securely with bcrypt hashing.
                    </Alert>

                    <Box className="password-fields-grid">
                        <TextField
                            label="Current Password"
                            name="currentPassword"
                            type={showPassword.old ? "text" : "password"}
                            fullWidth
                            value={formData.currentPassword}
                            onChange={handleChange}
                            placeholder="Enter existing password"
                            helperText="Required only when setting a new password"
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => handleClickShowPassword("old")}
                                                edge="end"
                                                aria-label={
                                                    showPassword.old ? "Hide password" : "Show password"
                                                }
                                            >
                                                {showPassword.old ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />

                        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                            <TextField
                                label="New Password"
                                name="newPassword"
                                type={showPassword.new ? "text" : "password"}
                                fullWidth
                                value={formData.newPassword}
                                onChange={handleChange}
                                placeholder="Minimum 6 characters"
                                helperText="Must be at least 6 characters long"
                                slotProps={{
                                    input: {
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => handleClickShowPassword("new")}
                                                    edge="end"
                                                    aria-label={
                                                        showPassword.new ? "Hide password" : "Show password"
                                                    }
                                                >
                                                    {showPassword.new ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />

                            <TextField
                                label="Confirm New Password"
                                name="confirmPassword"
                                type={showPassword.confirm ? "text" : "password"}
                                fullWidth
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Re-type new password"
                                helperText="Re-enter your new password to verify"
                                error={
                                    Boolean(formData.newPassword && formData.confirmPassword) &&
                                    formData.newPassword !== formData.confirmPassword
                                }
                                slotProps={{
                                    input: {
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => handleClickShowPassword("confirm")}
                                                    edge="end"
                                                    aria-label={
                                                        showPassword.confirm ? "Hide password" : "Show password"
                                                    }
                                                >
                                                    {showPassword.confirm ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />
                        </Box>
                    </Box>
                </Card>

                {/* Form Actions */}
                <Box className="form-actions-bar">
                    <Button
                        type="submit"
                        variant="contained"
                        className="save-btn"
                        disabled={loading}
                        startIcon={
                            loading ? (
                                <CircularProgress size={18} sx={{ color: "#FFFFFF" }} />
                            ) : (
                                <SaveRoundedIcon />
                            )
                        }
                    >
                        {loading ? "Saving Changes..." : "Save Profile Changes"}
                    </Button>
                </Box>
            </Box>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                message={snackbar.message}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            />
        </Box>
    );
};

export default AdminProfile;
