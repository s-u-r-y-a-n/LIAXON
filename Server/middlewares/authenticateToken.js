import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Access token is required. Please log in.",
        });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Access token is missing. Please log in.",
        });
    }

    jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: "Invalid or expired token. Please log in again.",
            });
        }
        req.user = user;
        next();
    });
};
