import express from "express";
import ContactInquiryModel, { INQUIRY_TYPES } from "../models/ContactInquiry.js";
import JobOpeningModel from "../models/JobOpening.js";
import JobApplicationModel from "../models/JobApplication.js";
import { normalizeEmail, normalizeText, isValidEmail } from "../utils/inputFields.js";
import {
    sendContactNotificationEmail,
    sendJobApplicationNotificationEmail,
} from "../utils/sendContactEmail.js";
import { handleResumeUpload } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// Liaxon Consulting Pvt. Ltd. Official 6 Service Pillars
export const LIAXON_SERVICES = [
    {
        id: "1",
        slug: "startup-support",
        title: "Startup Support",
        subtitle: "Startup Consulting and Company Registration in Kanyakumari",
        tagline: "Empowering Startups. Building Futures.",
        category: "Startup Support",
        shortDescription:
            "Company registration, business planning, financial planning and go-to-market strategy for new businesses.",
        fullDescription:
            "Starting a business is exciting, and complicated. Liaxon gives founders everything needed to launch: legal formation, business strategy, financial planning and a full go-to-market and operating plan.",
        icon: "BusinessCenterRounded",
        badge: "Pillar 01",
        deliverables: [
            "Business Strategy - Define vision, set clear goals and build strategies for long-term success.",
            "Market Research - Understand industry trends, customer needs and your competition.",
            "SWOT Analysis - Identify strengths, address weaknesses, explore opportunities and prepare for threats.",
            "Business Model Development - Scalable models defining how you create, deliver and capture value.",
            "Financial Planning - Budgets, forecasts, revenue and cost planning for profitability and stability.",
            "Growth Strategy - Market expansion and product strategy to grow share and profit.",
            "Business Registration - Private Limited, Proprietorship and other registrations, trademark & certification.",
            "Compliance - Stay compliant with laws and regulations and remain audit-ready.",
            "Implementation Roadmap - Step-by-step action plans with timelines, milestones and measurable results.",
            "Funding and Hiring Support - Government grant & loan analysis, investor pitches, white-collar hiring.",
        ],
        process: [
            { step: "01", title: "Discover and Understand", desc: "Business goals, challenges and stakeholder discussions." },
            { step: "02", title: "Research and Analyze", desc: "Market, industry and competitor benchmarking." },
            { step: "03", title: "Strategy Development", desc: "SWOT, strategic options and core business model." },
            { step: "04", title: "Financial Planning", desc: "Budget, forecasts and investment evaluation." },
            { step: "05", title: "Growth Planning", desc: "Opportunity mapping and competitive advantage plan." },
            { step: "06", title: "Roadmap Creation", desc: "Action plan, timelines and resource allocation." },
            { step: "07", title: "Implement & Optimize", desc: "Execution support and performance tracking." },
        ],
        benefits: [
            "Clear direction & strategic roadmap",
            "Data-driven decisions backed by research",
            "Profitable and scalable growth",
            "Reduced legal & financial risk",
            "Future-ready business structure",
        ],
        targetAudience: "First-time founders, new business owners, family businesses going formal, and startups preparing to raise funds.",
        faqs: [
            {
                q: "Can you help me register my company?",
                a: "Yes. We guide you through the right legal structure, prepare documents, and handle filing and government follow-up end-to-end.",
            },
            {
                q: "Do you help with business plans for loans or grants?",
                a: "Yes. We prepare detailed financial models, bankable business plans, and analyze government grant and loan options.",
            },
        ],
    },
    {
        id: "2",
        slug: "operations-support",
        title: "Operations Support",
        subtitle: "SOP Development and Process Excellence Services",
        tagline: "Streamlining Operations. Driving Excellence.",
        category: "Operations Support",
        shortDescription:
            "SOPs, workflow design, process mapping, compliance documentation and quality systems.",
        fullDescription:
            "We help organizations streamline operations, standardize processes and build systems that ensure consistency, compliance and continuous improvement, so your business runs smoothly even as it grows.",
        icon: "AccountTreeRounded",
        badge: "Pillar 02",
        deliverables: [
            "Business Audit - Evaluate processes, performance and potential for operational improvement.",
            "Department Analysis - Identify strengths, gaps and optimization areas in each department.",
            "Process Mapping - Map, analyze and visualize processes to find bottlenecks and opportunities.",
            "Workflow Design - Efficient workflows that remove bottlenecks and improve team productivity.",
            "SOP Development - Clear, practical, easy-to-follow Standard Operating Procedures.",
            "Department SOPs - Role and department-specific SOPs for accountability and daily smooth work.",
            "Business Structure Design - Clear roles, responsibilities and transparent reporting lines.",
            "Compliance Documentation - Policy documents and frameworks for regulatory adherence.",
            "Audit and Quality Systems - Quality controls and internal audit systems to maintain standards.",
            "Business Automation and AI Guidance - Automate repetitive work and deploy modern AI tools.",
        ],
        process: [
            { step: "01", title: "Discover", desc: "Understand your business, objectives and current processes." },
            { step: "02", title: "Analyze", desc: "Review workflows, uncover bottlenecks and identify gaps." },
            { step: "03", title: "Design", desc: "Build tailored SOPs, workflows and operational systems." },
            { step: "04", title: "Document", desc: "Create structured documentation and visual process maps." },
            { step: "05", title: "Implement", desc: "Roll out systems and train your teams on adoption." },
            { step: "06", title: "Monitor & Improve", desc: "Audit performance and refine continuously." },
        ],
        benefits: [
            "Standardized operations across teams",
            "Improved efficiency and output consistency",
            "Complete compliance assurance",
            "Clear employee roles & accountability",
            "Significantly lower operational costs",
        ],
        targetAudience: "Growing SMEs, institutions, retail chains, and companies experiencing operational bottlenecks.",
        faqs: [
            {
                q: "What is an SOP and why does my business need one?",
                a: "A Standard Operating Procedure documents exactly how each task should be done. It keeps quality consistent, reduces errors, and makes training new staff significantly faster.",
            },
            {
                q: "Can you create SOPs for specific departments?",
                a: "Yes. We develop tailored department-level SOPs for HR, Sales, Accounts, Production, and Logistics aligned to your goals.",
            },
        ],
    },
    {
        id: "3",
        slug: "brand-visibility-support",
        title: "Brand Visibility Support",
        subtitle: "Branding and Digital Presence Services",
        tagline: "Building Brands. Boosting Visibility. Driving Growth.",
        category: "Brand Visibility",
        shortDescription:
            "Brand strategy, social media, LinkedIn, Google Business Profile and website planning.",
        fullDescription:
            "We help businesses build a strong brand identity and a powerful digital presence that attracts, engages and converts the right audience, across every customer touchpoint.",
        icon: "TrendingUpRounded",
        badge: "Pillar 03",
        deliverables: [
            "Brand Strategy - Positioning, messaging and market presence aligned to your vision and audience.",
            "Brand Identity - Logo, color palette, typography, slogan and visual identity guidelines.",
            "Social Media Management - High-conversion content and strategy for Instagram, Facebook, and YouTube.",
            "LinkedIn Profile Management - Optimized personal profiles and company pages for B2B authority.",
            "Google Business Profile Management - Local search visibility, reviews management and customer trust.",
            "Website Planning - Modern, mobile-responsive layout structure aligned with your brand and sales goals.",
            "Marketing Collateral Support - Creative pitch decks, brochures, and digital banners.",
            "Digital Planning - SEO roadmap, CRM integration, and app planning.",
            "Workspace and Email Setup - Google Workspace, Microsoft 365, and branded domain emails.",
        ],
        process: [
            { step: "01", title: "Discover", desc: "Analyze business, goals, target audience and current footprint." },
            { step: "02", title: "Analyze", desc: "Design a customized branding, content, and digital strategy." },
            { step: "03", title: "Create", desc: "Craft brand assets, visual identity, content, and landing platforms." },
            { step: "04", title: "Implement", desc: "Launch and optimize your channels and digital profiles." },
            { step: "05", title: "Promote", desc: "Execute targeted activity for visibility, engagement and leads." },
            { step: "06", title: "Analyze & Improve", desc: "Continuously monitor analytics and refine engagement." },
        ],
        benefits: [
            "Distinctive and memorable brand identity",
            "Higher organic engagement and community trust",
            "Dominant local search visibility via Google Business Profile",
            "Predictable inbound lead generation",
            "Measurable marketing ROI",
        ],
        targetAudience: "Retailers, service professionals, local businesses, schools, healthcare centers, and B2B brands.",
        faqs: [
            {
                q: "Why is Google Business Profile important?",
                a: "It helps local customers find, trust, and call or visit you on Google Search and Maps, which is vital for shops, clinics, institutes, and service businesses.",
            },
            {
                q: "Do you manage social media regularly?",
                a: "Yes. We create, manage, schedule, and optimize your social channels to build community and drive measurable engagement.",
            },
        ],
    },
    {
        id: "4",
        slug: "sales-management-support",
        title: "Sales Management Support",
        subtitle: "Sales Management and Lead Generation Support",
        tagline: "Driving Sales. Building Relationships. Delivering Results.",
        category: "Sales Management",
        shortDescription:
            "Dedicated sales executives, lead management, follow-ups, CRM updates and sales reports.",
        fullDescription:
            "We provide end-to-end sales support to help you generate more leads, build stronger client relationships and close more deals efficiently, as an extension of your team.",
        icon: "HandshakeRounded",
        badge: "Pillar 04",
        deliverables: [
            "Dedicated Liaxon Sales Executive - Trained sales professionals representing your business.",
            "Lead Generation - Identify, prospect, and attract targeted buyers into your sales funnel.",
            "Lead Management and Assignment - Capture, qualify, organize and assign inbound and outbound leads.",
            "Customer Follow-Up - Prompt, persistent, professional follow-ups that build trust and close deals.",
            "Appointment Booking - Coordinate and schedule qualification meetings with decision-makers.",
            "CRM Updates - Timely, accurate recording of touchpoints, deal stages, and customer notes.",
            "Sales Reports - Comprehensive weekly and monthly sales velocity and pipeline reports.",
            "Performance Dashboard - Real-time tracking of targets, conversion rates, and revenue progress.",
        ],
        process: [
            { step: "01", title: "Sales Assessment", desc: "Understand your offering, target audience, and revenue targets." },
            { step: "02", title: "Lead Management", desc: "Capture and consolidate leads from multi-channel sources." },
            { step: "03", title: "Customer Follow-Up", desc: "Qualify, pitch, overcome objections, and nurture deals." },
            { step: "04", title: "CRM Updates", desc: "Maintain pristine CRM pipelines and customer contact history." },
            { step: "05", title: "Sales Reporting", desc: "Deliver actionable insights and pipeline forecasts." },
            { step: "06", title: "Appointment Scheduling", desc: "Secure qualified discovery and closing meetings." },
        ],
        benefits: [
            "Increased qualified lead flow",
            "Dramatically faster response times",
            "Time savings for founders and core leadership",
            "Structured CRM and transparency",
            "Direct top-line revenue growth",
        ],
        targetAudience: "B2B companies, real estate, manufacturers, distributors, and service companies looking to scale sales.",
        faqs: [
            {
                q: "Can Liaxon handle lead follow-ups for my business?",
                a: "Yes. Our trained sales executives follow up promptly with your leads via phone, WhatsApp, and email, qualify them, and update your CRM.",
            },
            {
                q: "Will I get sales reports?",
                a: "Yes. We deliver regular performance dashboards and executive reports tracking inquiries, meetings booked, and conversions.",
            },
        ],
    },
    {
        id: "5",
        slug: "customer-support-service",
        title: "Customer Support Service",
        subtitle: "Customer Support Services for Growing Businesses",
        tagline: "Responsive. Professional. Reliable.",
        category: "Customer Support",
        shortDescription:
            "Responsive, professional customer handling that keeps your clients loyal.",
        fullDescription:
            "Great customer experience keeps customers coming back. Liaxon's customer support service gives your business a trained, responsive team to handle customer queries and follow-ups professionally, so your clients always feel heard.",
        icon: "HeadsetMicRounded",
        badge: "Pillar 05",
        deliverables: [
            "Customer Query Handling - Prompt, empathetic responses to incoming customer inquiries.",
            "Customer Follow-Up - Timely post-service follow-ups that build lasting customer loyalty.",
            "Response Tracking - Ticket-based tracking from initial complaint to complete resolution.",
            "CRM Maintenance - Accurate customer histories, interaction notes, and preference logs.",
            "Appointment and Service Coordination - Proactive booking, confirmation, and reminder calls.",
            "Feedback & Reporting - Actionable customer satisfaction metrics and improvement summaries.",
        ],
        process: [
            { step: "01", title: "Understand", desc: "Learn your product, customer profiles, brand voice, and service standards." },
            { step: "02", title: "Set Up", desc: "Configure support workflows, resolution scripts, ticketing, and escalations." },
            { step: "03", title: "Support", desc: "Our trained team handles multi-channel queries and resolves customer requests." },
            { step: "04", title: "Report", desc: "Deliver regular satisfaction summaries and process improvement recommendations." },
        ],
        benefits: [
            "Higher customer satisfaction and retention",
            "Guaranteed quick response times",
            "Consistent, professional brand voice",
            "Freedom for founders to focus on strategic growth",
        ],
        targetAudience: "E-commerce stores, healthcare clinics, educational institutes, and service businesses.",
        faqs: [
            {
                q: "Is this service suitable for small businesses?",
                a: "Yes. It is designed to scale flexibly with your volume, whether you handle 20 inquiries a day or hundreds.",
            },
        ],
    },
    {
        id: "6",
        slug: "it-services",
        title: "IT Services",
        subtitle: "IT and Business Enablement Services",
        tagline: "Work Smarter. Collaborate Better. Grow Faster.",
        category: "IT & Technology",
        shortDescription:
            "Google Workspace, Microsoft 365, business email, CRM/ERP, Power BI dashboards, automation, website and application development.",
        fullDescription:
            "We empower businesses with the right technology, tools and automation to work smarter, collaborate better and grow faster.",
        icon: "CodeRounded",
        badge: "Pillar 06",
        deliverables: [
            "Google Workspace - Setup and administration for team productivity, shared drives, and data security.",
            "Microsoft 365 - Enterprise cloud office setup, Outlook configuration, and OneDrive backups.",
            "Business Email Setup - Secure, custom domain-based email addresses on your company domain.",
            "CRM Guidance - Selecting, configuring, and custom tailoring the best CRM for your workflow.",
            "Power BI Dashboards - Interactive management dashboards turning raw sheets into actionable insights.",
            "AI/ML & AI Tools Guidance - Identifying and deploying practical AI tools to automate office workflows.",
            "Business Automation - Eliminating repetitive data entry and syncing apps via automated webhooks.",
            "Website & Application Development - Building high-performance, responsive web portals and apps.",
            "ERP Planning & Implementation - Organizing supply chain, accounting, and inventory into unified systems.",
        ],
        process: [
            { step: "01", title: "Assess", desc: "Evaluate your technical requirements, pain points, and existing software stack." },
            { step: "02", title: "Plan", desc: "Create a vendor-neutral, cost-efficient IT roadmap and tool selection." },
            { step: "03", title: "Setup", desc: "Implement, configure, and secure tools, domains, and cloud environments." },
            { step: "04", title: "Guide", desc: "Conduct hands-on training sessions to ensure rapid team adoption." },
            { step: "05", title: "Integrate", desc: "Connect applications and automate routine data transfers." },
            { step: "06", title: "Optimize", desc: "Monitor system health, backups, access permissions, and performance." },
            { step: "07", title: "Empower", desc: "Enable your company to scale effortlessly with modern technology." },
        ],
        benefits: [
            "Secure, reliable, enterprise-grade cloud systems",
            "Enhanced team communication and remote collaboration",
            "Real-time operational dashboards with Power BI",
            "Lower software overhead and software consolidation",
            "High-conversion website and web application presence",
        ],
        targetAudience: "Companies upgrading legacy spreadsheets, startups needing modern IT infrastructure, and firms requiring custom development.",
        faqs: [
            {
                q: "Why do I need a professional business email?",
                a: "A domain-based email (like info@yourcompany.com) builds instant credibility with clients, prevents spam rejections, and gives you centralized control over business correspondence.",
            },
            {
                q: "Can you build dashboards from my existing data?",
                a: "Yes. We design custom Microsoft Power BI dashboards connecting Excel files, databases, or CRMs to visualize sales, stock, and operational metrics.",
            },
        ],
    },
];

// Provide backward compatibility aliases
export const getServiceBySlugOrId = (slugOrId) => {
    const s = slugOrId.toLowerCase();
    return LIAXON_SERVICES.find(
        (item) =>
            item.slug === s ||
            item.id === s ||
            (s.includes("startup") && item.slug === "startup-support") ||
            (s.includes("operation") && item.slug === "operations-support") ||
            (s.includes("brand") && item.slug === "brand-visibility-support") ||
            (s.includes("sale") && item.slug === "sales-management-support") ||
            (s.includes("customer") && item.slug === "customer-support-service") ||
            ((s.includes("it") || s.includes("tech")) && item.slug === "it-services"),
    );
};

// ==========================================
// 1. SERVICES ENDPOINTS
// ==========================================

router.get("/services", (req, res) => {
    return res.status(200).json({
        success: true,
        count: LIAXON_SERVICES.length,
        services: LIAXON_SERVICES,
        data: LIAXON_SERVICES,
    });
});

router.get("/services/:slug", (req, res) => {
    const { slug } = req.params;
    const service = getServiceBySlugOrId(slug);

    if (!service) {
        return res.status(404).json({
            success: false,
            message: `Service '${slug}' was not found.`,
        });
    }

    return res.status(200).json({
        success: true,
        service,
        data: service,
    });
});

// ==========================================
// 2. CAREERS & JOB OPENINGS ENDPOINTS
// ==========================================

router.get("/jobs", async (req, res) => {
    try {
        const jobs = await JobOpeningModel.find({ isActive: true })
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            count: jobs.length,
            jobs,
            data: jobs,
        });
    } catch (error) {
        console.error("Public Get Jobs Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch job postings.",
        });
    }
});

router.get("/jobs/:id", async (req, res) => {
    try {
        const job = await JobOpeningModel.findById(req.params.id).lean();

        if (!job || !job.isActive) {
            return res.status(404).json({
                success: false,
                message: "Job opening not found or is no longer active.",
            });
        }

        return res.status(200).json({
            success: true,
            job,
            data: job,
        });
    } catch (error) {
        console.error("Public Get Job Detail Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch job details.",
        });
    }
});

router.post("/applications", handleResumeUpload, async (req, res) => {
    try {
        const {
            jobId,
            positionApplied,
            fullName,
            email,
            phone,
            experienceLevel,
            qualification,
            currentCity,
            resumeUrl,
            coverNote,
            coverLetter,
        } = req.body;

        const cleanFullName = normalizeText(fullName);
        const cleanEmail = normalizeEmail(email);
        const cleanPhone = normalizeText(phone);

        if (!cleanFullName) {
            return res.status(400).json({
                success: false,
                message: "Please enter your full name.",
            });
        }
        if (!cleanEmail || !isValidEmail(cleanEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address.",
            });
        }
        if (!cleanPhone) {
            return res.status(400).json({
                success: false,
                message: "Please enter your contact phone number.",
            });
        }

        let targetPosition = normalizeText(positionApplied);
        let linkedJobId = null;

        if (jobId) {
            const job = await JobOpeningModel.findById(jobId);
            if (job) {
                linkedJobId = job._id;
                targetPosition = targetPosition || job.title;
            }
        }

        let resume = {
            fileName: "",
            fileData: "",
            mimetype: "",
            size: 0,
        };

        if (req.file) {
            resume = {
                fileName: req.file.originalname,
                fileData: `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
                mimetype: req.file.mimetype,
                size: req.file.size,
            };
        } else if (resumeUrl) {
            resume = {
                fileName: "Online Portfolio",
                fileData: normalizeText(resumeUrl),
                mimetype: "text/uri-list",
                size: 0,
            };
        }

        const application = new JobApplicationModel({
            jobOpening: linkedJobId,
            positionApplied: targetPosition || "General Application",
            fullName: cleanFullName,
            email: cleanEmail,
            phone: cleanPhone,
            experienceLevel: experienceLevel || "Fresher",
            qualification: normalizeText(qualification),
            currentCity: normalizeText(currentCity),
            resume,
            coverLetter: normalizeText(coverNote || coverLetter),
            status: "Applied",
        });

        await application.save();

        // Dispatch email notification to HR
        sendJobApplicationNotificationEmail(application, req.file).catch((err) => {
            console.error("[Application Email Notification Error]:", err.message);
        });

        return res.status(201).json({
            success: true,
            message: "Your application has been received successfully! Our HR team (hr@liaxon.in) will review your profile.",
            applicationId: application._id,
        });
    } catch (error) {
        console.error("Public Submit Application Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to submit application. Please try again.",
        });
    }
});

// ==========================================
// 3. CONTACT / INQUIRY ENDPOINT
// ==========================================

router.post("/contact", async (req, res) => {
    try {
        const {
            fullName,
            firstName,
            lastName,
            email,
            phone,
            company,
            jobTitle,
            serviceInterested,
            subject,
            message,
        } = req.body;

        let cleanFirstName = normalizeText(firstName);
        let cleanLastName = normalizeText(lastName);

        if (!cleanFirstName && fullName) {
            const parts = normalizeText(fullName).split(" ");
            cleanFirstName = parts[0];
            cleanLastName = parts.slice(1).join(" ") || "";
        }

        const cleanEmail = normalizeEmail(email);
        const cleanMessage = normalizeText(message);
        const cleanPhone = normalizeText(phone);

        if (!cleanFirstName) {
            return res.status(400).json({
                success: false,
                message: "Please enter your name.",
            });
        }
        if (!cleanEmail || !isValidEmail(cleanEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address.",
            });
        }
        if (!cleanMessage) {
            return res.status(400).json({
                success: false,
                message: "Please describe your requirement or message.",
            });
        }

        const rawInquiryType = normalizeText(
            req.body?.inquiryType || serviceInterested,
        );
        let resolvedInquiryType = "General Enquiries";

        if (INQUIRY_TYPES.includes(rawInquiryType)) {
            resolvedInquiryType = rawInquiryType;
        } else if (rawInquiryType) {
            if (
                rawInquiryType.includes("Partner") ||
                rawInquiryType.includes("Alliance") ||
                rawInquiryType.includes("Collaboration")
            ) {
                resolvedInquiryType = "Business Partnerships & Alliances";
            } else if (
                rawInquiryType.includes("Career") ||
                rawInquiryType.includes("Recruit") ||
                rawInquiryType.includes("Job") ||
                rawInquiryType.includes("Intern")
            ) {
                resolvedInquiryType = "Careers & Recruitment";
            } else if (
                rawInquiryType.includes("Service") ||
                rawInquiryType.includes("Sales") ||
                rawInquiryType.includes("Support") ||
                rawInquiryType.includes("IT")
            ) {
                resolvedInquiryType = "Business Services & Sales Enquiries";
            }
        }

        const inquiry = new ContactInquiryModel({
            firstName: cleanFirstName,
            lastName: cleanLastName,
            email: cleanEmail,
            phone: cleanPhone,
            company: normalizeText(company),
            jobTitle: normalizeText(jobTitle),
            inquiryType: resolvedInquiryType,
            subject:
                normalizeText(subject) ||
                (serviceInterested
                    ? `Inquiry regarding ${serviceInterested}`
                    : `Inquiry for ${resolvedInquiryType}`),
            message: cleanMessage,
            status: "New",
        });

        await inquiry.save();

        // Broadcast real-time Socket.io event to connected admin clients
        const io = req.app.get("io");
        if (io) {
            const payload = inquiry.toJSON ? inquiry.toJSON() : inquiry;
            io.emit("new_contact_inquiry", payload);
            io.emit("newContactInquiry", payload);
        }

        // Trigger email notification to the respective department head
        sendContactNotificationEmail(inquiry).catch((err) => {
            console.error("[Email Notification Trigger Error]:", err.message);
        });

        return res.status(201).json({
            success: true,
            message: "Thank you for contacting Liaxon Consulting! Your message has been routed to our respective department.",
            inquiryId: inquiry._id,
            inquiryType: inquiry.inquiryType,
        });
    } catch (error) {
        console.error("Public Contact Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Could not submit inquiry. Please try again.",
        });
    }
});

export default router;
