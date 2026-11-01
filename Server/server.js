import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import contactRoutes from "./routes/contactRoutes.js";
import careerRoutes from "./routes/careerRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import publicRoutes from "./routes/publicRoutes.js"; 
import { seedInitialAdmin } from "./utils/seedAdmin.js";

const app = express();

// CONSTANTS
const PORT = process.env.PORT || 5000;
const { MONGODB_URL, DB_PASSWORD, DATABASE_NAME, CLIENT_URL } = process.env;

if (!MONGODB_URL || !DB_PASSWORD || !DATABASE_NAME) {
    console.error("Missing required MongoDB environment variables");
    process.exit(1);
}

const mongoUrl = `${MONGODB_URL.replace("<db_password>", DB_PASSWORD)}/${DATABASE_NAME}`;

// MIDDLEWARES
app.use(
    cors({
        origin: true,
        credentials: true,
    }),
);
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// CONSOLE LOGS
console.log("PORT", PORT);
console.log("DATABASE_NAME", DATABASE_NAME);
console.log("CLIENT_URL", CLIENT_URL);

// MONGODB CONNECTION & INITIALIZATION
await connectDB(mongoUrl);
await seedInitialAdmin();

// API & ADMIN ROUTES
app.use("/uploads", express.static("uploads"));
app.use("/admin", adminRoutes);
app.use("/api/v1", publicRoutes);
app.use("/api/auth", authRoutes); 
app.use("/api/contact", contactRoutes); 
app.use("/api/careers", careerRoutes);

app.get("/", function (request, response) {
    response.status(200).json({
        success: true,
        message: "Liaxon API is running.",
    });
});

app.use((error, request, response, next) => {
    if (error instanceof SyntaxError && "body" in error) {
        return response.status(400).json({
            success: false,
            message: "The request body contains invalid JSON.",
        });
    }

    next(error);
});

app.use((request, response) => {
    response.status(404).json({
        success: false,
        message: "The requested route was not found.",
    });
});

function listenCallBack() {
    console.log(`APP IS RUNNING ON PORT: ${PORT}`);
}

app.listen(PORT, listenCallBack);
