import React, { lazy, Suspense } from "react";
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import { ThemeProvider, CssBaseline, Box, CircularProgress } from "@mui/material";
import theme from "./theme/theme.js";
import { AuthProvider } from "./context/AuthContext.jsx";
import MainLayout from "./layouts/MainLayout.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import ProtectedRoute from "./components/admin/ProtectedRoute.jsx";

// Lazy-Loaded Public Corporate Pages
const Home = lazy(() => import("./pages/public/Home/Home.jsx"));
const About = lazy(() => import("./pages/public/About/About.jsx"));
const Services = lazy(() => import("./pages/public/Services/Services.jsx"));
const ServiceDetail = lazy(
    () => import("./pages/public/ServiceDetail/ServiceDetail.jsx"),
);
const Clients = lazy(() => import("./pages/public/Clients/Clients.jsx"));
const Careers = lazy(() => import("./pages/public/Careers/Careers.jsx"));
const Contact = lazy(() => import("./pages/public/Contact/Contact.jsx"));

// Lazy-Loaded Admin Portal Pages
const AdminLogin = lazy(() => import("./pages/admin/Login/AdminLogin.jsx"));
const AdminDashboard = lazy(
    () => import("./pages/admin/Dashboard/AdminDashboard.jsx"),
);
const AdminContacts = lazy(
    () => import("./pages/admin/Contacts/AdminContacts.jsx"),
);
const AdminJobs = lazy(() => import("./pages/admin/Jobs/AdminJobs.jsx"));
const AdminApplications = lazy(
    () => import("./pages/admin/Applications/AdminApplications.jsx"),
);
const AdminProfile = lazy(
    () => import("./pages/admin/Profile/AdminProfile.jsx"),
);

const PageLoadingFallback = () => (
    <Box
        sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "70vh",
            width: "100%",
        }}
    >
        <CircularProgress size={44} thickness={4} sx={{ color: "#0F172A" }} />
    </Box>
);

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
                <BrowserRouter>
                    <Suspense fallback={<PageLoadingFallback />}>
                        <Routes>
                            {/* ===================================== */}
                            {/* 1. PUBLIC CORPORATE WEBSITE (MainLayout) */}
                            {/* ===================================== */}
                            <Route element={<MainLayout />}>
                                <Route index element={<Home />} />
                                <Route path="about" element={<About />} />
                                <Route path="services" element={<Services />} />
                                <Route
                                    path="services/:slug"
                                    element={<ServiceDetail />}
                                />
                                <Route path="clients" element={<Clients />} />
                                <Route path="careers" element={<Careers />} />
                                <Route path="contact" element={<Contact />} />
                            </Route>

                            {/* ===================================== */}
                            {/* 2. ADMIN PORTAL (ProtectedRoute + AdminLayout) */}
                            {/* ===================================== */}
                            <Route path="/admin/login" element={<AdminLogin />} />

                            <Route
                                path="/admin"
                                element={
                                    <ProtectedRoute>
                                        <AdminLayout />
                                    </ProtectedRoute>
                                }
                            >
                                <Route
                                    index
                                    element={<Navigate to="/admin/dashboard" replace />}
                                />
                                <Route
                                    path="dashboard"
                                    element={<AdminDashboard />}
                                />
                                <Route
                                    path="contacts"
                                    element={<AdminContacts />}
                                />
                                <Route path="jobs" element={<AdminJobs />} />
                                <Route
                                    path="applications"
                                    element={<AdminApplications />}
                                />
                                <Route
                                    path="profile"
                                    element={<AdminProfile />}
                                />
                            </Route>

                            {/* ===================================== */}
                            {/* 3. FALLBACK CATCH-ALL                 */}
                            {/* ===================================== */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </Suspense>
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
