import React, { useState } from "react";
import { Outlet, NavLink, Link, useNavigate } from "react-router-dom";
import {
    Box,
    Button,
    IconButton,
    Drawer,
    List,
    ListItemButton,
    ListItemText,
    Typography,
    Divider,
    Menu,
    MenuItem,
} from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import "./MainLayout.scss";

const SERVICES_MENU = [
    { title: "Startup Support", path: "/services/startup-support" },
    { title: "Operations Support", path: "/services/operations-support" },
    { title: "Brand Visibility Support", path: "/services/brand-visibility-support" },
    { title: "Sales Management Support", path: "/services/sales-management-support" },
    { title: "Customer Support Service", path: "/services/customer-support-service" },
    { title: "IT Services", path: "/services/it-services" },
];

const MainLayout = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [servicesAnchorEl, setServicesAnchorEl] = useState(null);
    const navigate = useNavigate();

    const handleServicesMenuOpen = (event) => {
        setServicesAnchorEl(event.currentTarget);
    };

    const handleServicesMenuClose = () => {
        setServicesAnchorEl(null);
    };

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    return (
        <div className="main-layout">
            {/* Top Corporate Meta Bar */}
            <div className="top-info-bar">
                <div className="top-bar-inner">
                    <div className="top-contact-links">
                        <a href="tel:+919787015703">
                            <PhoneRoundedIcon sx={{ fontSize: 15 }} />
                            +91 97870 15703
                        </a>
                        <a href="mailto:info@liaxon.in">
                            <EmailRoundedIcon sx={{ fontSize: 15 }} />
                            info@liaxon.in
                        </a>
                    </div>
                    <div className="top-meta-info">
                        <span className="meta-item">
                            <AccessTimeRoundedIcon sx={{ fontSize: 15 }} />
                            Mon – Sat: 8:00 AM – 6:00 PM IST
                        </span>
                        <span className="meta-item">
                            <LocationOnRoundedIcon sx={{ fontSize: 15 }} />
                            Tholayavattam, Kanyakumari, Tamil Nadu
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Header / Sticky Navbar */}
            <header className="public-header">
                <div className="header-inner">
                    {/* Brand Logo */}
                    <Link to="/" className="brand-logo-link">
                        <div className="logo-symbol">
                            <ShieldRoundedIcon sx={{ fontSize: 26 }} />
                        </div>
                        <div className="brand-text-box">
                            <span className="brand-name">
                                LIAXON<span>.</span>
                            </span>
                            <span className="brand-caption">
                                Business &amp; Startup Consulting
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="desktop-nav">
                        <NavLink to="/" className={({ isActive }) => `nav-link-item ${isActive ? "active" : ""}`}>
                            Home
                        </NavLink>
                        <NavLink to="/about" className={({ isActive }) => `nav-link-item ${isActive ? "active" : ""}`}>
                            About Us
                        </NavLink>

                        {/* Services Dropdown */}
                        <div
                            className="services-dropdown-container"
                            onMouseLeave={handleServicesMenuClose}
                        >
                            <span
                                className="nav-link-item services-nav-trigger"
                                onClick={(e) => {
                                    if (window.innerWidth > 900) {
                                        navigate("/services");
                                    } else {
                                        handleServicesMenuOpen(e);
                                    }
                                }}
                                onMouseEnter={handleServicesMenuOpen}
                            >
                                Services <KeyboardArrowDownRoundedIcon fontSize="small" />
                            </span>
                            <Menu
                                anchorEl={servicesAnchorEl}
                                open={Boolean(servicesAnchorEl)}
                                onClose={handleServicesMenuClose}
                                MenuListProps={{ onMouseLeave: handleServicesMenuClose }}
                                PaperProps={{
                                    sx: {
                                        mt: 1.5,
                                        borderRadius: 2.5,
                                        boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.15)",
                                        minWidth: 240,
                                        border: "1px solid #E2E8F0",
                                    },
                                }}
                            >
                                <MenuItem
                                    onClick={() => {
                                        handleServicesMenuClose();
                                        navigate("/services");
                                    }}
                                    sx={{ fontWeight: 700, color: "#2563EB", fontSize: "0.875rem", pb: 1 }}
                                >
                                    All Services Overview →
                                </MenuItem>
                                <Divider sx={{ my: 0.5 }} />
                                {SERVICES_MENU.map((item) => (
                                    <MenuItem
                                        key={item.path}
                                        onClick={() => {
                                            handleServicesMenuClose();
                                            navigate(item.path);
                                        }}
                                        sx={{ fontSize: "0.875rem", py: 1 }}
                                    >
                                        {item.title}
                                    </MenuItem>
                                ))}
                            </Menu>
                        </div>

                        <NavLink to="/clients" className={({ isActive }) => `nav-link-item ${isActive ? "active" : ""}`}>
                            Clients
                        </NavLink>
                        <NavLink to="/careers" className={({ isActive }) => `nav-link-item ${isActive ? "active" : ""}`}>
                            Careers
                        </NavLink>
                        <NavLink to="/contact" className={({ isActive }) => `nav-link-item ${isActive ? "active" : ""}`}>
                            Contact Us
                        </NavLink>
                    </nav>

                    {/* Header Action Buttons */}
                    <div className="header-cta-group">
                        <Button
                            variant="contained"
                            className="get-in-touch-btn"
                            onClick={() => navigate("/contact")}
                            endIcon={<ArrowForwardRoundedIcon fontSize="small" />}
                        >
                            Book a Free Consultation
                        </Button>

                        <IconButton
                            className="mobile-menu-toggle"
                            aria-label="open mobile navigation"
                            onClick={handleDrawerToggle}
                            sx={{ color: "#0F172A" }}
                        >
                            <MenuRoundedIcon />
                        </IconButton>
                    </div>
                </div>
            </header>

            {/* Mobile Navigation Drawer */}
            <Drawer
                anchor="right"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                PaperProps={{
                    sx: { width: 300, p: 2.5, display: "flex", flexDirection: "column" },
                }}
            >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: "#0F172A" }}>
                        LIAXON CONSULTING
                    </Typography>
                    <IconButton onClick={handleDrawerToggle}>
                        <CloseRoundedIcon />
                    </IconButton>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <List sx={{ flexGrow: 1 }}>
                    <ListItemButton component={Link} to="/" onClick={() => setMobileOpen(false)} sx={{ borderRadius: 2 }}>
                        <ListItemText primary="Home" primaryTypographyProps={{ fontWeight: 600 }} />
                    </ListItemButton>
                    <ListItemButton component={Link} to="/about" onClick={() => setMobileOpen(false)} sx={{ borderRadius: 2 }}>
                        <ListItemText primary="About Us" primaryTypographyProps={{ fontWeight: 600 }} />
                    </ListItemButton>
                    <ListItemButton component={Link} to="/services" onClick={() => setMobileOpen(false)} sx={{ borderRadius: 2 }}>
                        <ListItemText primary="Services Overview" primaryTypographyProps={{ fontWeight: 600 }} />
                    </ListItemButton>
                    <Box sx={{ pl: 2 }}>
                        {SERVICES_MENU.map((item) => (
                            <ListItemButton
                                key={item.path}
                                component={Link}
                                to={item.path}
                                onClick={() => setMobileOpen(false)}
                                sx={{ py: 0.6 }}
                            >
                                <ListItemText
                                    primary={`• ${item.title}`}
                                    primaryTypographyProps={{ fontSize: "0.85rem", color: "#475569" }}
                                />
                            </ListItemButton>
                        ))}
                    </Box>
                    <ListItemButton component={Link} to="/clients" onClick={() => setMobileOpen(false)} sx={{ borderRadius: 2 }}>
                        <ListItemText primary="Clients" primaryTypographyProps={{ fontWeight: 600 }} />
                    </ListItemButton>
                    <ListItemButton component={Link} to="/careers" onClick={() => setMobileOpen(false)} sx={{ borderRadius: 2 }}>
                        <ListItemText primary="Careers" primaryTypographyProps={{ fontWeight: 600 }} />
                    </ListItemButton>
                    <ListItemButton component={Link} to="/contact" onClick={() => setMobileOpen(false)} sx={{ borderRadius: 2 }}>
                        <ListItemText primary="Contact Us" primaryTypographyProps={{ fontWeight: 600 }} />
                    </ListItemButton>
                </List>
                <Button
                    variant="contained"
                    fullWidth
                    onClick={() => {
                        setMobileOpen(false);
                        navigate("/contact");
                    }}
                    sx={{ backgroundColor: "#0F172A", py: 1.2, fontWeight: 700 }}
                >
                    Book a Free Consultation
                </Button>
            </Drawer>

            {/* Main Page Body */}
            <main className="main-content">
                <Outlet />
            </main>

            {/* Corporate Footer */}
            <footer className="public-footer">
                <div className="footer-inner">
                    <div className="footer-grid">
                        {/* Col 1: Corporate Summary */}
                        <div className="footer-col">
                            <h3 className="col-heading" style={{ fontSize: "1.25rem" }}>
                                LIAXON CONSULTING PVT. LTD.
                            </h3>
                            <p className="footer-summary">
                                Empowering businesses. Building systems. Transforming futures. Based in Tholayavattam, Kanyakumari District, Tamil Nadu, we bridge the gap between academic learning and real-world corporate execution.
                            </p>
                            <Typography variant="body2" sx={{ color: "#0EA5E9", fontWeight: 700, mb: 1 }}>
                                Strategy Today. Success Tomorrow.
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#94A3B8", display: "block" }}>
                                CIN: U70200TN2024PTC172081
                            </Typography>
                        </div>

                        {/* Col 2: Navigation Links */}
                        <div className="footer-col">
                            <h4 className="col-heading">Company</h4>
                            <ul className="footer-links-list">
                                <li><Link to="/">Home Overview</Link></li>
                                <li><Link to="/about">About Us &amp; Team</Link></li>
                                <li><Link to="/services">Services Overview</Link></li>
                                <li><Link to="/clients">Clients &amp; Partners</Link></li>
                                <li><Link to="/careers">Careers &amp; Culture</Link></li>
                                <li><Link to="/contact">Contact Coordinates</Link></li>
                            </ul>
                        </div>

                        {/* Col 3: Six Core Pillars */}
                        <div className="footer-col">
                            <h4 className="col-heading">Our Six Pillars</h4>
                            <ul className="footer-links-list">
                                <li><Link to="/services/startup-support">Startup Support</Link></li>
                                <li><Link to="/services/operations-support">Operations Support</Link></li>
                                <li><Link to="/services/brand-visibility-support">Brand Visibility Support</Link></li>
                                <li><Link to="/services/sales-management-support">Sales Management Support</Link></li>
                                <li><Link to="/services/customer-support-service">Customer Support Service</Link></li>
                                <li><Link to="/services/it-services">IT Services</Link></li>
                            </ul>
                        </div>

                        {/* Col 4: Contact Coordinates */}
                        <div className="footer-col">
                            <h4 className="col-heading">Visit Our Office</h4>
                            <ul className="contact-details-list">
                                <li>
                                    <LocationOnRoundedIcon className="contact-icon" />
                                    <span>
                                        Aalumoodu Junction, Tholayavattam, Kanyakumari District, Tamil Nadu – 629171
                                    </span>
                                </li>
                                <li>
                                    <PhoneRoundedIcon className="contact-icon" />
                                    <a href="tel:+919787015703">+91 97870 15703</a>
                                </li>
                                <li>
                                    <EmailRoundedIcon className="contact-icon" />
                                    <a href="mailto:info@liaxon.in">info@liaxon.in</a>
                                </li>
                                <li>
                                    <AccessTimeRoundedIcon className="contact-icon" />
                                    <span>Mon – Sat: 8:00 AM – 6:00 PM IST (Sunday by appt.)</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom Copyright & Admin link */}
                    <div className="footer-bottom-bar">
                        <span>
                            © {new Date().getFullYear()} Liaxon Consulting Private Limited. All Rights Reserved.
                        </span>
                        <div style={{ display: "flex", gap: "16px" }}>
                            <Link to="/clients" className="admin-link">Our Clients</Link>
                            <Link to="/careers" className="admin-link">Careers</Link>
                            <Link to="/admin/login" className="admin-link">Admin Portal →</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default MainLayout;
