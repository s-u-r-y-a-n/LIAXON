import React from "react";
import { motion } from "framer-motion";
import { Button } from "@mui/material";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import WorkHistoryRoundedIcon from "@mui/icons-material/WorkHistoryRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import "./JobCard.scss";

const JobCard = ({ job, onApply, index = 0 }) => {
    const formatDate = (dateStr) => {
        if (!dateStr) return "Recently posted";
        try {
            return new Date(dateStr).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            });
        } catch {
            return "Recently posted";
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.45, delay: index * 0.08, ease: "easeOut" }}
            className="job-card-item"
        >
            <div className="job-header">
                <h3 className="job-title">{job.title}</h3>
                <div className="badge-group">
                    <span className="chip-dept">{job.domain || "General"}</span>
                    <span className="chip-type">{job.employmentType || "Full-time"}</span>
                </div>
            </div>

            <div className="job-meta-row">
                <span className="meta-item">
                    <LocationOnRoundedIcon sx={{ fontSize: 16, color: "#94A3B8" }} />
                    {job.location || "Tamil Nadu (On-site)"}
                </span>
                <span className="meta-item">
                    <WorkHistoryRoundedIcon sx={{ fontSize: 16, color: "#94A3B8" }} />
                    {job.experienceLevel || "Open to Freshers"}
                </span>
            </div>

            <p className="job-desc">{job.description}</p>

            {job.requirements && job.requirements.length > 0 && (
                <div className="job-requirements-summary">
                    <div className="req-title">Core Competencies:</div>
                    <div className="req-tags">
                        {job.requirements.slice(0, 3).map((req, idx) => (
                            <span key={idx} className="req-pill">
                                {req.replace(/^[•\-\*]\s*/, "")}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div className="job-card-footer">
                <span className="posted-date">Posted {formatDate(job.createdAt)}</span>
                <Button
                    variant="contained"
                    size="small"
                    endIcon={<ArrowForwardRoundedIcon />}
                    onClick={() => onApply(job)}
                    sx={{
                        backgroundColor: "#0F172A",
                        fontWeight: 600,
                        "&:hover": { backgroundColor: "#1E293B" },
                    }}
                >
                    Apply Now
                </Button>
            </div>
        </motion.div>
    );
};

export default JobCard;
