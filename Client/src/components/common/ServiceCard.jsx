import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import BusinessCenterRoundedIcon from "@mui/icons-material/BusinessCenterRounded";
import CodeRoundedIcon from "@mui/icons-material/CodeRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import HandshakeRoundedIcon from "@mui/icons-material/HandshakeRounded";
import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";
import "./ServiceCard.scss";

const ICON_MAP = {
    BusinessCenterRounded: <BusinessCenterRoundedIcon fontSize="medium" />,
    CodeRounded: <CodeRoundedIcon fontSize="medium" />,
    TrendingUpRounded: <TrendingUpRoundedIcon fontSize="medium" />,
    SchoolRounded: <SchoolRoundedIcon fontSize="medium" />,
    HandshakeRounded: <HandshakeRoundedIcon fontSize="medium" />,
    PsychologyRounded: <PsychologyRoundedIcon fontSize="medium" />,
};

const ServiceCard = ({ service, index = 0 }) => {
    const iconElement =
        ICON_MAP[service.icon] || <BusinessCenterRoundedIcon fontSize="medium" />;

    return (
        <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.45, delay: index * 0.08, ease: "easeOut" }}
            className="service-card-item"
        >
            <div className="card-top">
                <div className="icon-wrapper">{iconElement}</div>
                {service.category && (
                    <span className="category-chip">{service.category}</span>
                )}
            </div>

            <h3 className="service-title">{service.title}</h3>

            <p className="service-desc">{service.shortDescription}</p>

            {service.deliverables && service.deliverables.length > 0 && (
                <ul className="deliverables-preview">
                    {service.deliverables.slice(0, 3).map((item, idx) => (
                        <li key={idx}>{item}</li>
                    ))}
                </ul>
            )}

            <div className="card-action">
                <Link
                    to={`/services/${service.slug}`}
                    className="learn-more-btn"
                >
                    Explore Service <ArrowForwardRoundedIcon fontSize="small" />
                </Link>
            </div>
        </motion.div>
    );
};

export default ServiceCard;
