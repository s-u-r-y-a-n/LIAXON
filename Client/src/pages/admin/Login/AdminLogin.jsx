import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
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
    Fade,
} from "@mui/material";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import liaxonLogo from "../../../assets/logo-1.jpeg";
import { useAuth } from "../../../context/AuthContext.jsx";
import "./AdminLogin.scss";


const AdminLogin = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errorMessage) setErrorMessage("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const trimmedEmail = formData.email.trim();
        const trimmedPassword = formData.password.trim();

        if (!trimmedEmail) {
            setErrorMessage("Please enter your admin email address.");
            return;
        }

        if (!trimmedPassword) {
            setErrorMessage("Please enter your password.");
            return;
        }

        setLoading(true);
        setErrorMessage("");

        const result = await login(trimmedEmail, trimmedPassword);

        if (result.success) {
            const destination =
                location.state?.from?.pathname || "/admin/dashboard";
            navigate(destination, { replace: true });
        } else {
            setErrorMessage(result.message || "Invalid email or password.");
            setLoading(false);
        }
    };

    const handleClickShowPassword = () => setShowPassword((prev) => !prev);


    return (
        <Box className="admin-login-page">
            <Card className="login-card" elevation={0}>
                <Box className="login-header">
                    <Box className="brand-badge">
                        <img
                            src={liaxonLogo}
                            alt="Liaxon"
                            style={{
                                maxHeight: "48px",
                                width: "auto",
                                objectFit: "contain",
                            }}
                        />
                    </Box>
                    <Typography component="h1" className="login-title">
                        Admin Portal
                    </Typography>
                    <Typography className="login-subtitle">
                        Sign in to access your dashboard & controls
                    </Typography>
                </Box>

                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    className="login-form"
                    noValidate
                >
                    {errorMessage && (
                        <Fade in={Boolean(errorMessage)}>
                            <Alert
                                severity="error"
                                sx={{
                                    borderRadius: 2,
                                    fontSize: "0.85rem",
                                    py: 0.5,
                                }}
                            >
                                {errorMessage}
                            </Alert>
                        </Fade>
                    )}

                    <TextField
                        fullWidth
                        id="admin-email"
                        label="Admin Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        autoComplete="email"
                        autoFocus
                        disabled={loading}
                        placeholder="admin@liaxon.com"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <EmailRoundedIcon
                                        sx={{ color: "#94A3B8" }}
                                        fontSize="small"
                                    />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <TextField
                        fullWidth
                        id="admin-password"
                        label="Password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        autoComplete="current-password"
                        disabled={loading}
                        placeholder="••••••••"
                        slotProps={{
                            input: {
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={handleClickShowPassword}
                                            edge="end"
                                            aria-label={
                                                showPassword ? "Hide password" : "Show password"
                                            }
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={loading}
                        className="submit-button"
                    >
                        {loading ? (
                            <CircularProgress size={24} sx={{ color: "#0B0B0B" }} />
                        ) : (
                            "Sign In to Dashboard"
                        )}
                    </Button>
                </Box>

                <Box className="login-footer">
                    <Link to="/" className="back-link">
                        ← Back to Public Website
                    </Link>
                </Box>
            </Card>
        </Box>
    );
};

export default AdminLogin;
