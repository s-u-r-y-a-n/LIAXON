import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Avatar } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import BuildRoundedIcon from "@mui/icons-material/BuildRounded";
import TransformRoundedIcon from "@mui/icons-material/TransformRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import PageWrapper from "../../../components/common/PageWrapper.jsx";
import SectionTitle from "../../../components/common/SectionTitle.jsx";
import { companyInfo, aboutContent } from "../../../data/companyContent.js";
import "./About.scss";

const VALUE_ICONS = {
    Empower: <AutoAwesomeRoundedIcon fontSize="inherit" />,
    Build: <BuildRoundedIcon fontSize="inherit" />,
    Transform: <TransformRoundedIcon fontSize="inherit" />,
    Integrity: <VerifiedUserRoundedIcon fontSize="inherit" />,
};

const About = () => {
    const navigate = useNavigate();

    return (
        <PageWrapper className="about-page">
            {/* 1. Page Hero Banner */}
            <section className="page-hero-banner">
                <div className="hero-container">
                    <span className="hero-tag">About LIAXON</span>
                    <h1>{aboutContent.pageTitle}</h1>
                    <p className="hero-tagline">{aboutContent.tagline}</p>
                    <p className="hero-lead-text">
                        {aboutContent.intro1}
                    </p>
                    <p className="hero-sub-text">
                        {aboutContent.intro2}
                    </p>
                </div>
            </section>

            {/* 2. Our Story Section */}
            <section className="story-section">
                <div className="story-container">
                    <div className="story-text">
                        <SectionTitle
                            badge="Behind the Brand"
                            title={aboutContent.storyHeading}
                            centered={false}
                        />
                        <p className="section-lead">
                            {aboutContent.storyP1}
                        </p>
                        <p className="story-highlight">
                            {aboutContent.storyP2}
                        </p>
                    </div>

                    <div className="story-stats-card">
                        <div className="vision-box">
                            <div className="vision-tag">Our Vision</div>
                            <h3>{aboutContent.visionText}</h3>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Mission Section */}
            <section className="mission-section">
                <div className="mission-container">
                    <SectionTitle
                        badge="Our Purpose"
                        title={aboutContent.missionHeading}
                        subtitle="Strategic pillars driving sustainable growth, institutional systems, and professional excellence."
                    />

                    <div className="mission-grid">
                        {aboutContent.missionPoints.map((point, idx) => (
                            <div key={idx} className="mission-card">
                                <div className="mission-icon">
                                    <CheckCircleRoundedIcon />
                                </div>
                                <p className="mission-text">{point}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. Core Values Section */}
            <section className="values-section">
                <div className="values-container">
                    <SectionTitle
                        badge="Our Foundation"
                        title={aboutContent.valuesHeading}
                        subtitle="The bedrock values guiding how we partner, build, and deliver results."
                    />

                    <div className="values-grid">
                        {aboutContent.values.map((v, i) => (
                            <div key={i} className="value-card">
                                <div className="val-icon">
                                    {VALUE_ICONS[v.title] || <ShieldRoundedIcon fontSize="inherit" />}
                                </div>
                                <h4>{v.title}</h4>
                                <p>{v.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. Leadership Section */}
            <section className="team-section leadership-section">
                <div className="team-container">
                    <SectionTitle
                        badge="Executive Leadership"
                        title={aboutContent.leadershipHeading}
                        subtitle="Experienced leaders combining hands-on operations excellence with consulting rigor."
                    />

                    <div className="leaders-grid">
                        {aboutContent.leaders.map((leader, idx) => (
                            <div key={idx} className="leader-card">
                                <div className="avatar-wrapper">
                                    <Avatar
                                        sx={{
                                            width: 88,
                                            height: 88,
                                            bgcolor: idx === 0 ? "#D4AF37" : idx === 1 ? "#C5A059" : "#0B0B0B",
                                            color: idx === 2 ? "#FFFFFF" : "#0B0B0B",
                                            fontSize: "1.75rem",
                                            fontWeight: 800,
                                            boxShadow: "0 8px 20px rgba(0, 0, 0, 0.25)",
                                        }}
                                    >
                                        {leader.initials}
                                    </Avatar>
                                </div>
                                <h3 className="leader-name">{leader.name}</h3>
                                <span className="leader-role">{leader.role}</span>
                                <p className="leader-bio">{leader.bio}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 6. Core Team Section */}
            <section className="team-section core-team-section">
                <div className="team-container">
                    <SectionTitle
                        badge="Our Specialists"
                        title={aboutContent.coreTeamHeading}
                        subtitle="Dedicated professionals driving human resources, analytics, design, and growth."
                    />

                    <div className="core-team-grid">
                        {aboutContent.coreTeam.map((member, idx) => (
                            <div key={idx} className="core-member-card">
                                <div className="member-avatar">
                                    <Avatar
                                        sx={{
                                            width: 64,
                                            height: 64,
                                            bgcolor: "#FAF5E6",
                                            color: "#D4AF37",
                                            fontWeight: 800,
                                            border: "2px solid rgba(212, 175, 55, 0.3)",
                                        }}
                                    >
                                        {member.initials}
                                    </Avatar>
                                </div>
                                <div className="member-info">
                                    <h4 className="member-name">{member.name}</h4>
                                    <span className="member-role">{member.role}</span>
                                    <span className="member-dept">{member.dept}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 7. Headquarters & Visit Our Office */}
            <section className="hq-banner-section">
                <div className="hq-container">
                    <div className="hq-info">
                        <h2>{aboutContent.visitOfficeHeading}</h2>
                        <div className="office-address-box">
                            <LocationOnRoundedIcon sx={{ color: "#D4AF37", fontSize: 24, mt: 0.3 }} />
                            <span>{aboutContent.officeAddress}</span>
                        </div>
                        <div className="hq-contacts-row">
                            <span className="meta-contact-item">
                                <PhoneRoundedIcon sx={{ fontSize: 18, color: "#D4AF37" }} />
                                <a href={`tel:${companyInfo.primaryPhone.replace(/\s+/g, "")}`}>{companyInfo.primaryPhone}</a>
                            </span>
                            <span className="meta-contact-item">
                                <EmailRoundedIcon sx={{ fontSize: 18, color: "#D4AF37" }} />
                                <a href={`mailto:${companyInfo.primaryEmail}`}>{companyInfo.primaryEmail}</a>
                            </span>
                        </div>
                    </div>

                    <div className="hq-action">
                        <Button
                            variant="contained"
                            className="hq-contact-btn"
                            onClick={() => navigate("/contact")}
                            endIcon={<ArrowForwardRoundedIcon />}
                        >
                            Contact Us
                        </Button>
                    </div>
                </div>
            </section>
        </PageWrapper>
    );
};

export default About;
