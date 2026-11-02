import { useState, useEffect } from "react";
import { Button, Box, CircularProgress } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import WorkRoundedIcon from "@mui/icons-material/WorkRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import PageWrapper from "../../../components/common/PageWrapper.jsx";
import SectionTitle from "../../../components/common/SectionTitle.jsx";
import ApplyModal from "../../../components/common/ApplyModal.jsx";
import { careersContent } from "../../../data/companyContent.js";
import { publicCareersApi } from "../../../services/publicApi.js";
import "./Careers.scss";

const WHY_ICONS = [
    <WorkRoundedIcon fontSize="inherit" />,
    <SchoolRoundedIcon fontSize="inherit" />,
    <GroupsRoundedIcon fontSize="inherit" />,
    <BusinessRoundedIcon fontSize="inherit" />,
];

const parseList = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) {
        return val
            .flatMap((item) => (typeof item === "string" ? item.split("\n") : []))
            .map((s) => s.replace(/^[•\-\*]\s*/, "").trim())
            .filter(Boolean);
    }
    if (typeof val === "string") {
        return val
            .split("\n")
            .map((s) => s.replace(/^[•\-\*]\s*/, "").trim())
            .filter(Boolean);
    }
    return [];
};

const Careers = () => {
    const [liveJobs, setLiveJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                setLoading(true);
                const response = await publicCareersApi.getJobs();
                const list = response.data?.jobs || response.data?.data || [];
                setLiveJobs(list);
            } catch (err) {
                console.info("Could not fetch active jobs:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, []);

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

                    {loading ? (
                        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                            <CircularProgress size={36} sx={{ color: "#D4AF37" }} />
                        </Box>
                    ) : liveJobs && liveJobs.length > 0 ? (
                        <div className="opportunities-grid">
                            {liveJobs.map((job) => {
                                const responsibilities = parseList(job.responsibilities);
                                const requirements = parseList(job.requirements);

                                return (
                                    <div key={job._id} className="opportunity-card">
                                        <div className="role-top-content">
                                            <div className="role-meta">
                                                <span className="badge-role">
                                                    {job.domain || (job.employmentType === "Internship" ? "Cohort Program" : "Professional Role")}
                                                </span>
                                                {job.employmentType && (
                                                    <span className="badge-type">
                                                        {job.employmentType}
                                                    </span>
                                                )}
                                                {job.openingsCount > 1 && (
                                                    <span className="badge-openings">
                                                        {job.openingsCount} Openings
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
                                                    {job.description}
                                                </p>
                                            )}

                                            {responsibilities.length > 0 && (
                                                <div className="role-section">
                                                    <h4 className="role-section-title">Key Responsibilities</h4>
                                                    <ul className="role-list">
                                                        {responsibilities.map((resp, idx) => (
                                                            <li key={idx}>{resp}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {requirements.length > 0 && (
                                                <div className="role-section">
                                                    <h4 className="role-section-title">Requirements & Skills</h4>
                                                    <ul className="role-list">
                                                        {requirements.map((req, idx) => (
                                                            <li key={idx}>{req}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>

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
                                );
                            })}
                        </div>
                    ) : (
                        <div className="no-openings-box">
                            <p className="no-openings-text">
                                Currently, there are no active openings.
                            </p>
                        </div>
                    )}

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
