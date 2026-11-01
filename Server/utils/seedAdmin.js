import AdminModel from "../models/Admin.js";
import { normalizeEmail, normalizeText } from "./inputFields.js";

/**
 * Checks whether an admin exists in the database.
 * If not, creates a new admin using credentials defined in .env
 * (ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME).
 */
export const seedInitialAdmin = async () => {
    try {
        // Check if an admin exists in the database
        const adminCount = await AdminModel.countDocuments();

        if (adminCount > 0) {
            console.log(`[Admin Seed] Admin already exists in database (${adminCount} found).`);
            return;
        }

        const rawEmail = process.env.ADMIN_EMAIL || "";
        const rawPassword = process.env.ADMIN_PASSWORD || "";
        const rawName = process.env.ADMIN_NAME || "Admin";

        const cleanEmail = normalizeEmail(
            rawEmail.replace(/;+$/, "").replace(/^"+|"+$/g, ""),
        );
        const cleanPassword = normalizeText(
            rawPassword.replace(/;+$/, "").replace(/^"+|"+$/g, ""),
        );
        const cleanName =
            normalizeText(rawName.replace(/;+$/, "").replace(/^"+|"+$/g, "")) ||
            "Admin";

        if (!cleanEmail || !cleanPassword) {
            console.warn(
                "[Admin Seed] Missing ADMIN_EMAIL or ADMIN_PASSWORD in environment variables. Default admin not created.",
            );
            return;
        }

        // Create new admin document - the pre-save hook on AdminModel always hashes the password
        const admin = new AdminModel({
            name: cleanName,
            email: cleanEmail,
            password: cleanPassword,
            role: "admin",
            refreshTokens: [],
        });

        await admin.save();

        console.log(`[Admin Seed] Default admin created successfully for: ${cleanEmail}`);
    } catch (error) {
        console.error("[Admin Seed] Error checking/creating default admin:", error);
    }
};
