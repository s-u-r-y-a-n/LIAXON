import transporter from "../config/nodemailer.js";

/**
 * Maps inquiryType to the respective management head's department email
 */
export const getDepartmentEmail = (inquiryType) => {
    switch (inquiryType) {
        case "Business Partnerships & Alliances":
            return (
                process.env.BUSINESS_PARTNERSHIPS_EMAIL || "business@liaxon.in"
            );
        case "Business Services & Sales Enquiries":
            return (
                process.env.BUSINESS_SERVICES_EMAIL || "sales@liaxon.in"
            );
        case "Careers & Recruitment":
            return process.env.CAREERS_EMAIL || "hr@liaxon.in";
        case "General Enquiries":
        default:
            return (
                process.env.GENERAL_ENQUIRIES_EMAIL || "info@liaxon.in"
            );
    }
};

/**
 * Sends an email notification to the respective department head for a contact inquiry
 * @param {Object} inquiry - The contact inquiry document from MongoDB or req.body
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export const sendContactNotificationEmail = async (inquiry) => {
    try {
        const {
            firstName = "",
            lastName = "",
            fullName,
            email,
            phone = "",
            company = "",
            jobTitle = "",
            inquiryType = "General Enquiries",
            subject = "",
            message = "",
            createdAt = new Date(),
        } = inquiry;

        const senderName =
            fullName || `${firstName} ${lastName}`.trim() || "Website Visitor";
        const targetEmail = getDepartmentEmail(inquiryType);

        // Sender header for SMTP
        const fromEmail =
            process.env.SMTP_FROM ||
            `"Liaxon Web Portal" <${process.env.GENERAL_ENQUIRIES_EMAIL || "info@liaxon.in"}>`;

        const mailSubject = `[${inquiryType}] New Inquiry from ${senderName}${subject ? ` - ${subject}` : ""}`;

        const formattedDate = new Date(createdAt).toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            dateStyle: "full",
            timeStyle: "short",
        });

        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Contact Inquiry - Liaxon Consulting</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 15px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" max-width="640" cellspacing="0" cellpadding="0" style="max-width: 640px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0;">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 32px 36px; text-align: left;">
                            <table width="100%" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td>
                                        <div style="font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em;">
                                            LIAXON<span style="color: #38bdf8;">.</span>
                                        </div>
                                        <div style="font-size: 13px; color: #94a3b8; margin-top: 4px; font-weight: 500;">
                                            Business Consulting &bull; Tholayavattam, Kanyakumari
                                        </div>
                                    </td>
                                    <td align="right">
                                        <span style="display: inline-block; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.35); color: #38bdf8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; padding: 5px 12px; border-radius: 20px;">
                                            ${inquiryType}
                                        </span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td style="padding: 32px 36px;">
                            <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 700; color: #0f172a;">
                                New Inquiry Received for Your Department
                            </h2>
                            <p style="margin: 0 0 24px 0; font-size: 14px; color: #64748b; line-height: 1.5;">
                                A new website visitor submitted a contact request directed to <strong>${targetEmail}</strong>. Please find the enquiry specifics below:
                            </p>

                            <!-- Sender Details Card -->
                            <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
                                <tr>
                                    <td style="padding: 16px 20px;">
                                        <table width="100%" cellspacing="0" cellpadding="6">
                                            <tr>
                                                <td width="130" style="font-size: 13px; font-weight: 600; color: #64748b;">Full Name:</td>
                                                <td style="font-size: 14px; font-weight: 700; color: #0f172a;">${senderName}</td>
                                            </tr>
                                            <tr>
                                                <td style="font-size: 13px; font-weight: 600; color: #64748b;">Email Address:</td>
                                                <td style="font-size: 14px; color: #2563eb; font-weight: 600;">
                                                    <a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a>
                                                </td>
                                            </tr>
                                            ${
                                                phone
                                                    ? `<tr>
                                                <td style="font-size: 13px; font-weight: 600; color: #64748b;">Phone Number:</td>
                                                <td style="font-size: 14px; color: #0f172a;"><a href="tel:${phone.replace(/\s+/g, "")}" style="color: #0f172a; text-decoration: none;">${phone}</a></td>
                                            </tr>`
                                                    : ""
                                            }
                                            ${
                                                company
                                                    ? `<tr>
                                                <td style="font-size: 13px; font-weight: 600; color: #64748b;">Company / Org:</td>
                                                <td style="font-size: 14px; color: #0f172a;">${company} ${jobTitle ? `(${jobTitle})` : ""}</td>
                                            </tr>`
                                                    : ""
                                            }
                                            <tr>
                                                <td style="font-size: 13px; font-weight: 600; color: #64748b;">Department:</td>
                                                <td style="font-size: 14px; font-weight: 700; color: #2563eb;">${inquiryType}</td>
                                            </tr>
                                            ${
                                                subject
                                                    ? `<tr>
                                                <td style="font-size: 13px; font-weight: 600; color: #64748b;">Subject:</td>
                                                <td style="font-size: 14px; color: #0f172a; font-weight: 600;">${subject}</td>
                                            </tr>`
                                                    : ""
                                            }
                                            <tr>
                                                <td style="font-size: 13px; font-weight: 600; color: #64748b;">Timestamp:</td>
                                                <td style="font-size: 13px; color: #64748b;">${formattedDate}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Message Body -->
                            <div style="margin-bottom: 24px;">
                                <div style="font-size: 13px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">
                                    Message / Requirement:
                                </div>
                                <div style="background-color: #ffffff; border: 1px solid #cbd5e1; border-left: 4px solid #2563eb; border-radius: 6px; padding: 18px 20px; font-size: 14px; color: #1e293b; line-height: 1.6; white-space: pre-wrap;">${message}</div>
                            </div>

                            <!-- Direct Action -->
                            <table width="100%" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td>
                                        <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject || `Inquiry regarding ${inquiryType}`)}" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; padding: 12px 24px; border-radius: 6px; text-align: center;">
                                            Reply Directly to ${firstName || "Sender"}
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8fafc; padding: 20px 36px; border-top: 1px solid #e2e8f0; text-align: center;">
                            <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.5;">
                                Liaxon Consulting Private Limited &bull; Aalumoodu Junction, Tholayavattam, Kanyakumari District, Tamil Nadu &ndash; 629171<br>
                                Automated System Notification &bull; Target Desk: <strong style="color: #64748b;">${targetEmail}</strong>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `;

        const textContent = `
NEW INQUIRY FOR: ${inquiryType}
Target Department: ${targetEmail}

Sender: ${senderName}
Email: ${email}
Phone: ${phone || "Not provided"}
Company: ${company || "Not provided"}
Subject: ${subject || inquiryType}
Received At: ${formattedDate}

Message:
${message}

Reply directly to: ${email}
-------------------------------------------------------
Liaxon Consulting Pvt. Ltd. | Tholayavattam, Kanyakumari
        `.trim();

        const mailOptions = {
            from: fromEmail,
            to: targetEmail,
            replyTo: `${senderName} <${email}>`,
            subject: mailSubject,
            text: textContent,
            html: htmlContent,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[Email Notification] Sent to ${targetEmail} for ${inquiryType} (MessageId: ${info.messageId})`);
        return { success: true, messageId: info.messageId, targetEmail };
    } catch (error) {
        console.error("[Email Notification Error] Failed to send email:", error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Sends an email notification to HR for a newly submitted job application
 * @param {Object} application - The application document
 * @param {Object} [uploadedFile] - Multer file object if uploaded
 */
export const sendJobApplicationNotificationEmail = async (application, uploadedFile = null) => {
    try {
        const {
            fullName,
            email,
            phone,
            positionApplied,
            experienceLevel,
            qualification,
            currentCity,
            coverLetter,
            resume,
            createdAt = new Date(),
        } = application;

        const targetEmail = process.env.CAREERS_EMAIL || "hr@liaxon.in";
        const fromEmail =
            process.env.SMTP_FROM ||
            `"Liaxon Careers Desk" <${process.env.GENERAL_ENQUIRIES_EMAIL || "info@liaxon.in"}>`;

        const mailSubject = `[Job Application] ${positionApplied} - ${fullName}`;

        const formattedDate = new Date(createdAt).toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            dateStyle: "full",
            timeStyle: "short",
        });

        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>New Job Application - Liaxon Careers</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 15px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" max-width="640" cellspacing="0" cellpadding="0" style="max-width: 640px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0;">
                    <tr>
                        <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 32px 36px;">
                            <div style="font-size: 22px; font-weight: 800; color: #ffffff;">LIAXON<span style="color: #38bdf8;">.</span> CAREERS</div>
                            <div style="font-size: 13px; color: #94a3b8; margin-top: 4px;">Candidate Application Received</div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 32px 36px;">
                            <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0;">New Application for: ${positionApplied}</h2>
                            <table width="100%" style="font-size: 14px; color: #334155; line-height: 1.6; margin-bottom: 24px;">
                                <tr><td style="width: 140px; font-weight: 600; color: #64748b;">Candidate Name:</td><td><strong>${fullName}</strong></td></tr>
                                <tr><td style="font-weight: 600; color: #64748b;">Email Address:</td><td><a href="mailto:${email}" style="color: #2563eb;">${email}</a></td></tr>
                                <tr><td style="font-weight: 600; color: #64748b;">Phone Number:</td><td><a href="tel:${phone}" style="color: #2563eb;">${phone}</a></td></tr>
                                <tr><td style="font-weight: 600; color: #64748b;">Experience Level:</td><td>${experienceLevel || "Fresher"}</td></tr>
                                <tr><td style="font-weight: 600; color: #64748b;">Qualification:</td><td>${qualification || "Not provided"}</td></tr>
                                <tr><td style="font-weight: 600; color: #64748b;">Current City:</td><td>${currentCity || "Not provided"}</td></tr>
                                <tr><td style="font-weight: 600; color: #64748b;">Applied At:</td><td>${formattedDate}</td></tr>
                            </table>
                            ${coverLetter ? `<div style="background: #f8fafc; border-left: 4px solid #38bdf8; padding: 16px; border-radius: 4px; margin-bottom: 20px;"><div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;">Cover Note:</div><p style="margin: 8px 0 0 0; font-size: 14px; color: #1e293b; white-space: pre-wrap;">${coverLetter}</p></div>` : ""}
                            ${resume?.fileName ? `<div style="padding: 12px 16px; background: #e0f2fe; border-radius: 8px; font-size: 13px; color: #0369a1; font-weight: 600;">📎 Attached Resume: ${resume.fileName}</div>` : ""}
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `;

        const mailOptions = {
            from: fromEmail,
            to: targetEmail,
            replyTo: `${fullName} <${email}>`,
            subject: mailSubject,
            text: `New Application for ${positionApplied}\nCandidate: ${fullName}\nEmail: ${email}\nPhone: ${phone}\nExperience: ${experienceLevel}\nCity: ${currentCity}\n\nCover Letter:\n${coverLetter || "None"}`,
            html: htmlContent,
        };

        if (uploadedFile && uploadedFile.buffer) {
            mailOptions.attachments = [
                {
                    filename: uploadedFile.originalname,
                    content: uploadedFile.buffer,
                },
            ];
        } else if (resume?.fileData && resume.fileData.startsWith("data:")) {
            const matches = resume.fileData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            if (matches && matches.length === 3) {
                mailOptions.attachments = [
                    {
                        filename: resume.fileName || "Candidate_Resume.pdf",
                        content: Buffer.from(matches[2], "base64"),
                        contentType: matches[1],
                    },
                ];
            }
        }

        const info = await transporter.sendMail(mailOptions);
        console.log(`[Job Application Email] Sent to ${targetEmail} for ${positionApplied} (MessageId: ${info.messageId})`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("[Job Application Email Error]:", error.message);
        return { success: false, error: error.message };
    }
};

export default sendContactNotificationEmail;
