import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import PageWrapper from "../../../components/common/PageWrapper.jsx";
import { companyInfo, servicesContent } from "../../../data/companyContent.js";
import { publicServicesApi } from "../../../services/publicApi.js";
import "./ServiceDetail.scss";

const ServiceDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [service, setService] = useState(null);
    const [expandedFaq, setExpandedFaq] = useState("faq-0");

    useEffect(() => {
        // First check static verified services
        const staticMatch = servicesContent.sixPillars.find(
            (s) => s.slug === slug,
        );
        if (staticMatch) {
            setService(staticMatch);
        }

        // Also fetch from API if available to ensure live sync
        const fetchService = async () => {
            try {
                const response = await publicServicesApi.getBySlug(slug);
                const data = response.data?.service || response.data?.data;
                if (data) {
                    setService((prev) => ({ ...(prev || {}), ...data }));
                }
            } catch (err) {
                // If API fails, staticMatch is already set
                if (!staticMatch) {
                    console.error("Service detail fetch error:", err);
                }
            }
        };

        fetchService();
    }, [slug]);

    if (!service) {
        return (
            <PageWrapper className="service-detail-page">
                <div style={{ textAlign: "center", padding: "100px 20px" }}>
                    <h2>Service Not Found</h2>
                    <p>The practice area you are looking for does not exist or has been moved.</p>
                    <Button
                        variant="contained"
                        onClick={() => navigate("/services")}
                        sx={{ mt: 2, backgroundColor: "#0B0B0B", color: "#FFFFFF", "&:hover": { backgroundColor: "#D4AF37", color: "#0B0B0B" } }}
                    >
                        Return to Services Catalog
                    </Button>
                </div>
            </PageWrapper>
        );
    }

    const offers = service.whatWeOffer || [];
    const processSteps = service.process || [];
    const benefits = service.benefits || [];
    const whoThisIsFor = service.whoThisIsFor || [];
    const faqs = service.faqs || [];

    return (
        <PageWrapper className="service-detail-page">
            {/* Hero Header */}
            <section className="detail-hero-banner">
                <div className="hero-container" style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
                    <div className="breadcrumb-trail">
                        <Link to="/">Home</Link>
                        <span>/</span>
                        <Link to="/services">Services</Link>
                        <span>/</span>
                        <span className="current">{service.title}</span>
                    </div>

                    <span className="badge-tag">{service.title}</span>
                    <h1>{service.heroTitle || service.title}</h1>
                    <p className="hero-tagline-sub">{service.tagline}</p>
                    <p className="hero-sub">{service.overview || service.fullDescription || service.shortSummary}</p>
                </div>
            </section>

            {/* Main Content Body */}
            <section className="detail-body-section">
                <div className="body-container">
                    {/* Practice Details */}
                    <div className="main-practice-content">
                        {/* 1. What We Offer */}
                        {offers.length > 0 && (
                            <div className="content-block">
                                <h2 className="block-title">What We Offer</h2>
                                <div className="offerings-grid">
                                    {offers.map((item, idx) => (
                                        <div key={idx} className="offering-card">
                                            <div className="offering-header">
                                                <CheckCircleRoundedIcon className="check-icon" />
                                                <h4>{item.title}</h4>
                                            </div>
                                            <p>{item.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 2. Our Process */}
                        {processSteps.length > 0 && (
                            <div className="content-block">
                                <h2 className="block-title">Our Process</h2>
                                <div className="process-timeline">
                                    {processSteps.map((step, idx) => (
                                        <div key={idx} className="process-step-item">
                                            <div className="step-circle">0{step.step || idx + 1}</div>
                                            <div className="step-details">
                                                <h4>{step.title}</h4>
                                                <p>{step.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 3. Benefits */}
                        {benefits.length > 0 && (
                            <div className="content-block">
                                <h2 className="block-title">Key Benefits</h2>
                                <ul className="benefits-checklist">
                                    {benefits.map((b, idx) => (
                                        <li key={idx}>
                                            <CheckCircleRoundedIcon className="check-icon" />
                                            <span>{b}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* 4. Who This Is For */}
                        {whoThisIsFor.length > 0 && (
                            <div className="content-block">
                                <h2 className="block-title">Who This Is For</h2>
                                <div className="audience-pill-container">
                                    {whoThisIsFor.map((item, idx) => (
                                        <div key={idx} className="audience-pill">
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 5. FAQs */}
                        {faqs.length > 0 && (
                            <div className="content-block">
                                <h2 className="block-title">Frequently Asked Questions</h2>
                                <div className="service-faq-accordion">
                                    {faqs.map((f, idx) => {
                                        const panelId = `faq-${idx}`;
                                        return (
                                            <Accordion
                                                key={idx}
                                                expanded={expandedFaq === panelId}
                                                onChange={(e, isExpanded) =>
                                                    setExpandedFaq(isExpanded ? panelId : false)
                                                }
                                                className="faq-accordion-item"
                                                sx={{
                                                    mb: 1.5,
                                                    borderRadius: "10px !important",
                                                    border: "1px solid #E2E8F0",
                                                    boxShadow: "none",
                                                    "&:before": { display: "none" },
                                                }}
                                            >
                                                <AccordionSummary
                                                    expandIcon={<ExpandMoreRoundedIcon sx={{ color: "#D4AF37" }} />}
                                                >
                                                    <Typography sx={{ fontWeight: 700, color: "#0B0B0B" }}>
                                                        {f.q || f.question}
                                                    </Typography>
                                                </AccordionSummary>
                                                <AccordionDetails>
                                                    <Typography sx={{ color: "#475569", lineHeight: 1.6 }}>
                                                        {f.a || f.answer}
                                                    </Typography>
                                                </AccordionDetails>
                                            </Accordion>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Action Sidebar */}
                    <aside className="practice-sidebar">
                        <div className="cta-sidebar-card">
                            <h3>{service.ctaText || "Work With Liaxon"}</h3>
                            <p>
                                Talk to our team in Kanyakumari and get a clear, custom plan for your next stage of growth.
                            </p>
                            <Button
                                variant="contained"
                                className="request-btn"
                                onClick={() =>
                                    navigate(
                                        `/contact?service=${encodeURIComponent(service.title)}`,
                                    )
                                }
                                endIcon={<ArrowForwardRoundedIcon />}
                            >
                                {service.ctaText || "Book a Consultation"}
                            </Button>
                        </div>

                        <div className="contact-quick-card">
                            <h4>Direct Business Desk</h4>
                            <ul className="quick-contact-list">
                                <li>
                                    <PhoneRoundedIcon sx={{ fontSize: 18, color: "#D4AF37" }} />
                                    <a href={`tel:${companyInfo.primaryPhone.replace(/\s+/g, "")}`}>
                                        {companyInfo.primaryPhone}
                                    </a>
                                </li>
                                <li>
                                    <EmailRoundedIcon sx={{ fontSize: 18, color: "#D4AF37" }} />
                                    <a href={`mailto:${companyInfo.primaryEmail}`}>
                                        {companyInfo.primaryEmail}
                                    </a>
                                </li>
                                <li>
                                    <LocationOnRoundedIcon sx={{ fontSize: 18, color: "#D4AF37" }} />
                                    <span>{companyInfo.locationShort}</span>
                                </li>
                            </ul>
                        </div>
                    </aside>
                </div>
            </section>
        </PageWrapper>
    );
};

export default ServiceDetail;
