import nodemailer from "nodemailer";
import "dotenv/config";

const cleanEnv = (val, defaultVal = "") => {
    if (!val) return defaultVal;
    return String(val).trim().replace(/^["']|["']$/g, "");
};

const host = cleanEnv(process.env.SMTP_HOST, "smtp-relay.brevo.com");
const user = cleanEnv(process.env.SMTP_USER);
const password = cleanEnv(process.env.SMTP_PASSWORD);
const port = Number(cleanEnv(process.env.SMTP_PORT, "2525")) || 2525;

const auth = {
    user: user,
    pass: password,
};

const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth,
    tls: {
        rejectUnauthorized: false,
    },
});

export default transporter;
