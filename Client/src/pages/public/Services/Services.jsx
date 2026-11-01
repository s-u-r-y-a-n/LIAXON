import React, { useState, useEffect, useMemo } from "react";
import { TextField, InputAdornment, Button } from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import PageWrapper from "../../../components/common/PageWrapper.jsx";
import SectionTitle from "../../../components/common/SectionTitle.jsx";
import ServiceCard from "../../../components/common/ServiceCard.jsx";
import { servicesContent } from "../../../data/companyContent.js";
import { publicServicesApi } from "../../../services/publicApi.js";
import "./Services.scss";

const Services = () => {
    const [services, setServices] = useState(servicesContent.sixPillars);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchServices = async () => {
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
        fetchServices();
    }, []);

    const filteredServices = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return services;
        return services.filter((s) => {
            const title = (s.title || "").toLowerCase();
            const desc = (s.shortSummary || s.shortDescription || s.overview || s.fullDescription || "").toLowerCase();
            const tagline = (s.tagline || "").toLowerCase();
            return title.includes(query) || desc.includes(query) || tagline.includes(query);
        });
    }, [services, searchQuery]);

    return (
        <PageWrapper className="services-catalog-page">
            {/* Hero Header */}
            <section className="services-hero-banner">
                <div className="hero-inner">
                    <span className="hero-tag">Services</span>
                    <h1>{servicesContent.overviewHeading}</h1>
                    <p>{servicesContent.overviewSubheading}</p>
                </div>
            </section>

            {/* Catalog Content Section */}
            <section className="catalog-content-section">
                <div className="catalog-container">
                    {/* Search Toolbar */}
                    <div className="filter-toolbar">
                        <div className="six-pillars-badge">
                            Six Core Service Pillars
                        </div>

                        <TextField
                            size="small"
                            placeholder="Search service pillars..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-field"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchRoundedIcon
                                            fontSize="small"
                                            sx={{ color: "#94A3B8" }}
                                        />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </div>

                    {/* Services Grid */}
                    {filteredServices.length === 0 ? (
                        <div className="no-results">
                            <p>No services found matching "{searchQuery}". Try a different keyword.</p>
                            <Button
                                variant="outlined"
                                onClick={() => setSearchQuery("")}
                                sx={{ mt: 2 }}
                            >
                                Reset Search
                            </Button>
                        </div>
                    ) : (
                        <div className="services-grid-list">
                            {filteredServices.map((service, idx) => (
                                <ServiceCard
                                    key={service.slug || service.id || idx}
                                    service={service}
                                    index={idx}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </PageWrapper>
    );
};

export default Services;
