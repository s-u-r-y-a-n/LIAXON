export const normalizeEmail = (email) => {
    return typeof email === "string" ? email.trim().toLowerCase() : "";
};

export const normalizeText = (value) => {
    return typeof value === "string" ? value.trim() : "";
};

export const isValidEmail = (email) => {
    if (!email || typeof email !== "string") return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
};

export const isValidPhone = (phone) => { 
    if (!phone || typeof phone !== "string") return false;
    // Accepts international and local phone numbers (+91 97870 15703, (123) 456-7890, etc.)
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,20}$/;
    return phoneRegex.test(phone.trim());
};
