import CryptoJS from "crypto-js";
import "dotenv/config";

const DEFAULT_KEY = "nxEHud/C1oWToPoCOjqpoErRhWu5dLDJeZPLoGgYNn0=";

const getEncryptionKey = () => {
    const raw = process.env.PASSWORD_ENCRYPTION_KEY || DEFAULT_KEY;
    return raw.replace(/^["']|["']$/g, "").trim();
};

/**
 * Decrypts an AES-encrypted password ciphertext received from the client
 * @param {string} encryptedPassword - Ciphertext string or plaintext fallback
 * @returns {string} Decrypted plaintext password
 */
export const decryptPassword = (encryptedPassword) => {
    if (!encryptedPassword || typeof encryptedPassword !== "string") {
        return "";
    }

    try {
        const key = getEncryptionKey();
        const bytes = CryptoJS.AES.decrypt(encryptedPassword.trim(), key);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);

        // If decrypted is non-empty UTF-8 string, return it
        if (decrypted && decrypted.length > 0) {
            return decrypted;
        }

        // Fallback in case a plaintext password was sent directly (e.g. tests or legacy requests)
        return encryptedPassword;
    } catch {
        return encryptedPassword;
    }
};

export default decryptPassword;
