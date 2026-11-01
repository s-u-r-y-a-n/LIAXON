import React, { useState, useEffect } from "react";
import { Button } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import WorkRoundedIcon from "@mui/icons-material/WorkRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import PageWrapper from "../../../components/common/PageWrapper.jsx";
import SectionTitle from "../../../components/common/SectionTitle.jsx";
import ApplyModal from "../../../components/common/ApplyModal.jsx";
import { companyInfo, careersContent } from "../../../data/companyContent.js";
import { publicCareersApi } from "../../../services/publicApi.js";
import "./Careers.scss";

const WHY_ICONS = [
    <WorkRoundedIcon fontSize="inherit" />,
    <SchoolRoundedIcon fontSize="inherit" />,
    <GroupsRoundedIcon fontSize="inherit" />,
    <BusinessRoundedIcon fontSize="inherit" />,
];

const Careers = () => {
    const [liveJobs, setLiveJobs] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await publicCareersApi.getJobs();
                const list = response.data?.jobs || response.data?.data || [];
                setLiveJobs(list);
            } catch (err) {
                console.info("Using official career opportunities catalog:", err);
            }
        };
        fetchJobs();
    }, []);

    const handleApplyForRole = (roleTitle) => {
        setSelectedJob({
            title: roleTitle,
            domain: "Liaxon Consulting",
            employmentType: roleTitle.includes("Internship") ? "Internship" : "Full-time",
        });
        setModalOpen(true);
    };

    const handleGeneralApply = () => {
        setSelectedJob({
            title: "General Talent Application",
            domain: "Liaxon Consulting",
            employmentType: "Full-time / Internship",
        });
        setModalOpen(true);
    };

    return (
        <PageWrapper className="careers-page">
            {/* 1. Page Hero Banner */}
            <section className="careers-hero-banner">
                <div className="hero-container">
                    <span className="hero-tag">Join Our Team</span>
                    <h1>{careersContent.title}</h1>
                    <p className="hero-tagline">{careersContent.tagline}</p>
                    <p className="hero-intro">{careersContent.intro}</p>
                    <div className="hero-cta-box">
                        <Button
                            variant="contained"
                            className="hero-apply-btn"
                            onClick={handleGeneralApply}
                            endIcon={<ArrowForwardRoundedIcon />}
                        >
                            Apply Now
                        </Button>
                    </div>
                </div>
            </section>

            {/* 2. Why Work With Us */}
            <section className="why-work-section">
                <div className="why-container">
                    <SectionTitle
                        badge="The Liaxon Experience"
                        title={careersContent.whyWorkWithUsHeading}
                        subtitle="Bridging academic potential and corporate execution through practical, real-world immersion."
                    />

                    <div className="why-grid">
                        {careersContent.whyWorkWithUs.map((item, idx) => (
                            <div key={idx} className="why-card">
                                <div className="why-icon">{WHY_ICONS[idx % WHY_ICONS.length]}</div>
                                <h3>{item.title}</h3>
                                <p>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. Future Opportunities */}
            <section className="opportunities-section">
                <div className="opp-container">
                    <SectionTitle
                        badge="Career Pathways"
                        title={careersContent.futureOpportunitiesHeading}
                        subtitle="Explore our active roles, upcoming openings, and talent incubation cohorts."
                    />

                    <div className="opportunities-grid">
                        {liveJobs && liveJobs.length > 0 ? (
                            liveJobs.map((job) => (
                                <div key={job._id} className="opportunity-card">
                                    <div className="role-meta">
                                        <span className="badge-role">
                                            {job.domain || (job.employmentType === "Internship" ? "Cohort Program" : "Professional Role")}
                                        </span>
                                        {job.employmentType && (
                                            <span className="badge-type">
                                                {job.employmentType}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="role-title">{job.title}</h3>
                                    <p className="role-location">
                                        {job.location || "Tholayavattam, Kanyakumari District"}
                                    </p>
                                    {job.experienceLevel && (
                                        <p className="role-exp">
                                            <strong>Experience:</strong> {job.experienceLevel}
                                        </p>
                                    )}
                                    {job.description && (
                                        <p className="role-desc">
                                            {job.description.length > 130
                                                ? `${job.description.slice(0, 130)}...`
                                                : job.description}
                                        </p>
                                    )}
                                    <Button
                                        variant="outlined"
                                        className="role-apply-btn"
                                        onClick={() => {
                                            setSelectedJob(job);
                                            setModalOpen(true);
                                        }}
                                    >
                                        Apply for Role
                                    </Button>
                                </div>
                            ))
                        ) : (
                            careersContent.futureOpportunities.map((role, idx) => (
                                <div key={idx} className="opportunity-card">
                                    <div className="role-meta">
                                        <span className="badge-role">
                                            {role.includes("Internship") ? "Cohort Program" : "Professional Role"}
                                        </span>
                                    </div>
                                    <h3 className="role-title">{role}</h3>
                                    <p className="role-location">
                                        Tholayavattam, Kanyakumari District
                                    </p>
                                    <Button
                                        variant="outlined"
                                        className="role-apply-btn"
                                        onClick={() => handleApplyForRole(role)}
                                    >
                                        Apply for Role
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="openings-note-box">
                        <p>{careersContent.openingsNote}</p>
                        <a href="mailto:hr@liaxon.in" className="hr-email-link">
                            <EmailRoundedIcon sx={{ fontSize: 18 }} />
                            <span>hr@liaxon.in</span>
                        </a>
                    </div>
                </div>
            </section>

            {/* 4. Core Values of Liaxon (10 Core Values) */}
            <section className="core-values-section">
                <div className="values-container">
                    <SectionTitle
                        badge="Our Guiding Code"
                        title={careersContent.coreValuesHeading}
                        subtitle="The ten principles defining our professional conduct, teamwork, and daily excellence."
                    />

                    <div className="ten-values-grid">
                        {careersContent.coreValues.map((val, idx) => (
                            <div key={idx} className="val-card">
                                <div className="val-index">{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}</div>
                                <h4>{val.title}</h4>
                                <p>{val.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. Our Culture */}
            <section className="culture-story-section">
                <div className="culture-container">
                    <div className="culture-content-box">
                        <span className="badge-culture">{careersContent.culture.heading}</span>
                        <h2>{careersContent.culture.title}</h2>
                        <p className="culture-p1">{careersContent.culture.p1}</p>
                        <p className="culture-p2">{careersContent.culture.p2}</p>
                    </div>
                </div>
            </section>

            {/* 6. How to Apply */}
            <section className="how-to-apply-section">
                <div className="apply-steps-container">
                    <SectionTitle
                        badge="Application Process"
                        title={careersContent.howToApply.heading}
                        subtitle="A simple, transparent 4-stage journey to joining Liaxon Consulting."
                    />

                    <div className="steps-grid">
                        {careersContent.howToApply.steps.map((st) => (
                            <div key={st.step} className="step-card">
                                <div className="step-badge">Step 0{st.step}</div>
                                <h4>{st.title}</h4>
                                <p>{st.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="apply-cta-footer">
                        <Button
                            variant="contained"
                            className="apply-now-btn"
                            onClick={handleGeneralApply}
                            endIcon={<ArrowForwardRoundedIcon />}
                        >
                            {careersContent.howToApply.ctaText}
                        </Button>
                    </div>
                </div>
            </section>

            {/* Job Application Modal */}
            <ApplyModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                job={selectedJob}
            />
        </PageWrapper>
    );
};

export default Careers;
