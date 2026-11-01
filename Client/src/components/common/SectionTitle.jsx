import React from "react";
import { motion } from "framer-motion";
import "./SectionTitle.scss";

const SectionTitle = ({
    badge,
    title,
    subtitle,
    centered = true,
    light = false,
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`section-title-component ${centered ? "centered" : ""} ${light ? "light-mode" : ""}`}
        >
            {badge && <span className="badge-tag">{badge}</span>}
            <h2 className="main-heading" style={{ color: light ? "#FFFFFF" : undefined }}>
                {title}
            </h2>
            {subtitle && (
                <p className="sub-heading" style={{ color: light ? "#94A3B8" : undefined }}>
                    {subtitle}
                </p>
            )}
        </motion.div>
    );
};

export default SectionTitle;
