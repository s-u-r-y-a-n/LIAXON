import mongoose from "mongoose";

const connectDB = async (URL) => {
    try {
        await mongoose.connect(URL);

        console.log("MongoDB connected successfully");

        mongoose.connection.on("error", (err) => {
            console.error("MongoDB connection error:", err);
        });
        mongoose.connection.on("disconnected", () => {
            console.log("MongoDB disconnected");
        });
    } catch (err) {
        console.error("Initial MongoDB connection failed:", err);
        process.exit(1);
    }
};

export default connectDB;
