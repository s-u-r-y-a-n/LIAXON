import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Avatar } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import HandshakeRoundedIcon from "@mui/icons-material/HandshakeRounded";
import PageWrapper from "../../../components/common/PageWrapper.jsx";
import SectionTitle from "../../../components/common/SectionTitle.jsx";
import { companyInfo, clientsContent } from "../../../data/companyContent.js";
import "./Clients.scss";

const Clients = () => {
    const navigate = useNavigate();

    return (
        <PageWrapper className="clients-page">
            {/* 1. Hero Banner */}
            <section className="clients-hero-banner">
                <div className="hero-container">
                    <span className="hero-tag">Our Partnerships</span>
                    <h1>{clientsContent.heading}</h1>
                    <p className="hero-subtext">
                        {clientsContent.subheading}
                    </p>
                </div>
            </section>

            {/* 2. Client Showcase Grid */}
            <section className="clients-grid-section">
                <div className="clients-container">
                    <SectionTitle
                        badge="Client Portfolio"
                        title="Our Clients"
                        subtitle="Pioneering organizations that trusted Liaxon to engineer their operational frameworks, market brand, and technology systems."
                    />

                    <div className="clients-grid">
                        {clientsContent.clients.map((client, idx) => (
                            <div key={idx} className="client-card">
                                <div className="client-header">
                                    <Avatar
                                        sx={{
                                            width: 60,
                                            height: 60,
                                            bgcolor: idx % 2 === 0 ? "#2563EB" : "#0EA5E9",
                                            fontWeight: 800,
                                            fontSize: "1.2rem",
                                            boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)",
                                        }}
                                    >
                                        {client.initials}
                                    </Avatar>
                                    <div className="client-title-box">
                                        <h3>{client.name}</h3>
                                        <span className="client-tag">{client.tag}</span>
                                    </div>
                                </div>

                                <p className="client-desc">{client.description}</p>

                                <div className="client-footer">
                                    <div className="verified-badge">
                                        <VerifiedRoundedIcon sx={{ fontSize: 16, color: "#10B981" }} />
                                        <span>Verified Client Partner</span>
                                    </div>
                                    <span className="industry-pill">{client.industry}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. Industry Diversity Band */}
            <section className="industries-band">
                <div className="band-container">
                    <div className="band-content">
                        <HandshakeRoundedIcon sx={{ fontSize: 40, color: "#38BDF8" }} />
                        <div className="band-text">
                            <h3>Spanning Multiple Industry Sectors</h3>
                            <p>
                                From retail, jewellery, and corporate gifting to manufacturing, education, and deep-tech software, our consulting methodologies deliver predictable ROI regardless of domain.
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="contained"
                        className="partner-btn"
                        onClick={() => navigate("/contact")}
                        endIcon={<ArrowForwardRoundedIcon />}
                    >
                        Partner With Us
                    </Button>
                </div>
            </section>

            {/* 4. Consultation CTA */}
            <section className="client-cta-section">
                <div className="cta-container">
                    <h2>Ready to Build Systems for Your Business?</h2>
                    <p>
                        Join successful businesses across India who build their foundation with Liaxon Consulting.
                    </p>
                    <div className="cta-buttons">
                        <Button
                            variant="contained"
                            className="btn-primary"
                            onClick={() => navigate("/contact")}
                        >
                            Book a Free Consultation
                        </Button>
                        <Button
                            variant="outlined"
                            className="btn-secondary"
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

export default Clients;
