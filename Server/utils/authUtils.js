import jwt from "jsonwebtoken";

export const createAuthTokens = (user) => {
    const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
    const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

    if (!JWT_ACCESS_SECRET || !JWT_REFRESH_SECRET) {
        throw new Error("JWT secrets are not configured"); 
    }

    const userId = user._id || user.id || "admin";
    const userEmail = user.email || "";

    const accessToken = jwt.sign(
        { email: userEmail, id: userId, role: user.role || "admin" },
        JWT_ACCESS_SECRET,
        { expiresIn: "1h" },
    );

    const refreshToken = jwt.sign(
        { id: userId, email: userEmail },
        JWT_REFRESH_SECRET, 
        { expiresIn: "24h" },
    );

    return { accessToken, refreshToken };
};
