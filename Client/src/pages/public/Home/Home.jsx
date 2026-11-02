import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Button,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
} from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import RocketLaunchRoundedIcon from "@mui/icons-material/RocketLaunchRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import PageWrapper from "../../../components/common/PageWrapper.jsx";
import SectionTitle from "../../../components/common/SectionTitle.jsx";
import ServiceCard from "../../../components/common/ServiceCard.jsx";
import {
    companyInfo,
    homeContent,
    servicesContent,
} from "../../../data/companyContent.js";
import { publicServicesApi } from "../../../services/publicApi.js";
import "./Home.scss";

const Home = () => {
    const navigate = useNavigate();
    const [services, setServices] = useState(servicesContent.sixPillars);
    const [expandedFaq, setExpandedFaq] = useState("faq-0");

    useEffect(() => {
        const loadServices = async () => {
            try {
                const response = await publicServicesApi.getAll();
                const list = response.data?.services || response.data?.data;
                if (list && list.length > 0) {
                    setServices(list);
                }
            } catch (err) {
                console.info("Using static verified services catalog:", err);
            }
        };
        loadServices();
    }, []);

    const handleFaqChange = (panel) => (event, isExpanded) => {
        setExpandedFaq(isExpanded ? panel : false);
    };

    return (
        <PageWrapper className="home-page">
            {/* 1. Hero Section */}
            <section className="hero-section">
                <div className="hero-container">
                    <motion.div
                        className="hero-content"
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                        <div className="hero-badge">
                            <RocketLaunchRoundedIcon sx={{ fontSize: 16 }} />
                            {homeContent.empowerBadge}
                        </div>

                        <h1 className="hero-headline">
                            {homeContent.headline}
                        </h1>

                        <p className="hero-tagline-highlight">
                            {homeContent.tagline}
                        </p>

                        <p className="hero-subtitle">
                            {homeContent.heroDescription}
                        </p>

                        <div className="hero-actions">
                            <Button
                                variant="contained"
                                className="primary-cta"
                                onClick={() => navigate("/contact")}
                                endIcon={<ArrowForwardRoundedIcon />}
                            >
                                {homeContent.heroCtaPrimary}
                            </Button>
                            <Button
                                variant="outlined"
                                className="secondary-cta"
                                onClick={() => navigate("/services")}
                            >
                                {homeContent.heroCtaSecondary}
                            </Button>
                        </div>
                    </motion.div>

                    {/* Floating Hero Visual Card */}
                    <motion.div
                        className="hero-visual"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                    >
                        <div className="visual-card-main">
                            <div className="visual-header">
                                <div className="pulse-dot" />
                                <span className="visual-title">
                                    How We Work: 5-Step Engine
                                </span>
                            </div>

                            <div className="stage-pill-list">
                                {homeContent.howWeWorkSteps.map((s) => (
                                    <div key={s.step} className="stage-pill-item">
                                        <div className="pill-num">0{s.step}</div>
                                        <div className="pill-content">
                                            <div className="pill-title">{s.title}</div>
                                            <div className="pill-desc">{s.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* 2. Empower. Build. Transform. Corporate Statement */}
            <section className="statement-section">
                <div className="statement-container">
                    <div className="statement-badge">
                        <span>Empower. Build. Transform.</span>
                    </div>
                    <p className="statement-lead">
                        {homeContent.aboutSummary}
                    </p>
                    <div className="location-pill">
                        <LocationOnRoundedIcon sx={{ fontSize: 18, color: "#D4AF37" }} />
                        <span>Office at {companyInfo.officeAddress}</span>
                    </div>
                </div>
            </section>

            {/* 3. What We Do - Six Service Pillars */}
            <section className="services-section">
                <div className="services-container">
                    <SectionTitle
                        badge="Our Services"
                        title={homeContent.whatWeDoHeading}
                        subtitle={homeContent.whatWeDoSubheading}
                    />

                    <div className="services-grid">
                        {services.map((service, idx) => (
                            <ServiceCard
                                key={service.slug || service.id || idx}
                                service={service}
                                index={idx}
                            />
                        ))}
                    </div>

                    <div className="services-footer-cta">
                        <Button
                            variant="outlined"
                            onClick={() => navigate("/services")}
                            endIcon={<ArrowForwardRoundedIcon />}
                            sx={{
                                borderColor: "#0B0B0B",
                                color: "#0B0B0B",
                                fontWeight: 700,
                                px: 3,
                                py: 1.2,
                                borderRadius: "9999px",
                                "&:hover": {
                                    borderColor: "#D4AF37",
                                    color: "#D4AF37",
                                    backgroundColor: "rgba(212, 175, 55, 0.08)",
                                },
                            }}
                        >
                            Explore All Services &amp; Roadmaps
                        </Button>
                    </div>
                </div>
            </section>

            {/* 4. Why Businesses Choose Liaxon */}
            <section className="why-choose-section">
                <div className="why-container">
                    <div className="why-content">
                        <SectionTitle
                            badge="The Liaxon Edge"
                            title={homeContent.whyChooseUsHeading}
                            centered={false}
                            light={true}
                        />
                        <div className="feature-bullets">
                            {homeContent.whyChooseUsPoints.map((point, idx) => (
                                <div key={idx} className="bullet-item">
                                    <div className="check-icon-circle">
                                        <CheckCircleRoundedIcon fontSize="small" />
                                    </div>
                                    <div className="bullet-text">
                                        <h4>{point.title}</h4>
                                        <p>{point.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="why-highlight-card">
                        <span className="badge-gold">Strategy Today. Success Tomorrow.</span>
                        <h3>Partner with Us from Day One to Scale-Up</h3>
                        <p>
                            From initial company registration and compliance to operations SOPs, brand visibility, sales engines, and enterprise IT enablement, Liaxon handles the systems so you can focus on building.
                        </p>
                        <Button
                            variant="contained"
                            className="cta-btn"
                            onClick={() => navigate("/contact")}
                            endIcon={<ArrowForwardRoundedIcon />}
                        >
                            Book a Free Consultation
                        </Button>
                    </div>
                </div>
            </section>

            {/* 5. How We Work - 5 Stage Process */}
            <section className="methodology-section">
                <div className="methodology-container">
                    <SectionTitle
                        badge="Our Methodology"
                        title={homeContent.howWeWorkHeading}
                        subtitle="A proven, structured 5-step framework that turns goals into predictable execution."
                    />

                    <div className="stages-grid-5">
                        {homeContent.howWeWorkSteps.map((step) => (
                            <div key={step.step} className="stage-card">
                                <span className="stage-badge">0{step.step}</span>
                                <h3 className="stage-name">{step.title}</h3>
                                <p className="stage-desc">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 6. Frequently Asked Questions */}
            <section className="faq-section">
                <div className="faq-container">
                    <SectionTitle
                        badge="FAQ"
                        title={homeContent.faqsHeading}
                        subtitle="Answers to common questions about partnering with Liaxon Consulting."
                    />

                    <div className="faq-accordion-wrapper">
                        {homeContent.faqs.map((faq, idx) => {
                            const panelId = `faq-${idx}`;
                            return (
                                <Accordion
                                    key={idx}
                                    expanded={expandedFaq === panelId}
                                    onChange={handleFaqChange(panelId)}
                                    className="faq-accordion-item"
                                    sx={{
                                        mb: 2,
                                        borderRadius: "12px !important",
                                        border: "1px solid #E2E8F0",
                                        boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
                                        "&:before": { display: "none" },
                                    }}
                                >
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreRoundedIcon sx={{ color: "#D4AF37" }} />}
                                        aria-controls={`${panelId}-content`}
                                        id={`${panelId}-header`}
                                    >
                                        <Typography sx={{ fontWeight: 700, color: "#0B0B0B", fontSize: "1.05rem" }}>
                                            {faq.question}
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Typography sx={{ color: "#475569", lineHeight: 1.65 }}>
                                            {faq.answer}
                                        </Typography>
                                    </AccordionDetails>
                                </Accordion>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* 7. Ready to Build Banner */}
            <section className="quick-cta-banner">
                <div className="cta-container">
                    <h2>{homeContent.readyBannerHeading}</h2>
                    <p className="banner-subtext">
                        {homeContent.readyBannerSubheading}
                    </p>

                    <div className="banner-contacts">
                        <a href={`tel:${companyInfo.primaryPhone.replace(/\s+/g, "")}`} className="contact-chip">
                            <PhoneRoundedIcon sx={{ fontSize: 18 }} />
                            <span>Call {homeContent.readyBannerPhone}</span>
                        </a>
                        <a href={`mailto:${homeContent.readyBannerEmail}`} className="contact-chip">
                            <EmailRoundedIcon sx={{ fontSize: 18 }} />
                            <span>{homeContent.readyBannerEmail}</span>
                        </a>
                    </div>

                    <div className="banner-buttons">
                        <Button
                            variant="contained"
                            className="btn-white"
                            onClick={() => navigate("/contact")}
                        >
                            Book a Free Consultation
                        </Button>
                        <Button
                            variant="outlined"
                            className="btn-outline"
                            onClick={() => navigate("/services")}
                        >
                            Explore Our Services
                        </Button>
                    </div>
                </div>
            </section>
        </PageWrapper>
    );
};

export default Home;
