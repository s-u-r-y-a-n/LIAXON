import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Admin name is required."],
            trim: true,
            maxlength: [100, "Name cannot exceed 100 characters."],
        },
        email: {
            type: String,
            required: [true, "Admin email is required."],
            unique: true,
            trim: true,
            lowercase: true,
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                "Please enter a valid email address.",
            ],
            maxlength: [200, "Email cannot exceed 200 characters."],
        },
        password: {
            type: String,
            required: [true, "Password is required."],
            minlength: [6, "Password must be at least 6 characters long."],
        },
        role: {
            type: String,
            enum: ["admin", "superadmin"],
            default: "admin",
        },
        refreshTokens: {
            type: [String],
            default: [],
        },
    },
    {
        timestamps: true,
    },
);

// Pre-save hook: always hash password before saving to the database
adminSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    // Guard: Prevent double-hashing if already a bcrypt hash
    const isAlreadyBcryptHash =
        typeof this.password === "string" &&
        (this.password.startsWith("$2a$") ||
            this.password.startsWith("$2b$") ||
            this.password.startsWith("$2y$")) &&
        this.password.length === 60;

    if (isAlreadyBcryptHash) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Instance method to verify password
adminSchema.methods.comparePassword = async function (candidatePassword) {
    if (!candidatePassword || !this.password) return false;
    return await bcrypt.compare(candidatePassword, this.password);
};

const AdminModel =
    mongoose.models.Admin || mongoose.model("Admin", adminSchema);

export default AdminModel;
