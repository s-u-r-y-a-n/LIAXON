import React from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useAuth } from "../../context/AuthContext.jsx";

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "100vh",
                    backgroundColor: "#F8FAFC",
                    gap: 2,
                }}
            >
                <CircularProgress size={48} thickness={4} sx={{ color: "#0F172A" }} />
                <Typography variant="body2" color="text.secondary">
                    Verifying admin session...
                </Typography>
            </Box>
        );
    }

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/admin/login"
                replace
                state={{ from: location }}
            />
        );
    }

    return children ? children : <Outlet />;
};

export default ProtectedRoute;
