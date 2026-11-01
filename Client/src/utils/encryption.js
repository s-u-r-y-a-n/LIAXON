import CryptoJS from "crypto-js";

const DEFAULT_KEY = "nxEHud/C1oWToPoCOjqpoErRhWu5dLDJeZPLoGgYNn0=";

const RAW_KEY =
    import.meta.env.VITE_PASSWORD_ENCRYPTION_KEY || DEFAULT_KEY;

const ENCRYPTION_KEY = RAW_KEY.replace(/^["']|["']$/g, "").trim();

/**
 * Encrypts a plaintext password using AES-256 before transmitting over the network
 * @param {string} plainPassword - Plaintext password
 * @returns {string} Ciphertext string
 */
export const encryptPassword = (plainPassword) => {
    if (!plainPassword || typeof plainPassword !== "string") {
        return "";
    }
    try {
        const encrypted = CryptoJS.AES.encrypt(plainPassword, ENCRYPTION_KEY);
        return encrypted.toString();
    } catch (error) {
        console.error("Password encryption error:", error);
        return plainPassword;
    }
};

export default encryptPassword;
