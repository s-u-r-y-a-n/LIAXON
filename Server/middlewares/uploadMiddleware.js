import multer from "multer";
import path from "path";

// Memory Storage: Files are kept as buffers in memory and stored directly in MongoDB as base64
const storage = multer.memoryStorage();

// File validation: Only PDF, DOC, DOCX
const fileFilter = (req, file, cb) => {
    const allowedExtensions = [".pdf", ".doc", ".docx"];
    const ext = path.extname(file.originalname).toLowerCase();

    const allowedMimeTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/octet-stream",
    ];

    if (allowedExtensions.includes(ext) || allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only .pdf, .doc, and .docx resume files are allowed."));
    }
};

export const uploadResume = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB limit
    },
    fileFilter,
});

// Middleware wrapper to catch Multer errors gracefully
export const handleResumeUpload = (req, res, next) => {
    const upload = uploadResume.single("resume");

    upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(400).json({
                    success: false,
                    message: "Resume file size must be less than 10MB.",
                });
            }
            return res.status(400).json({
                success: false,
                message: `File upload error: ${err.message}`,
            });
        } else if (err) {
            return res.status(400).json({
                success: false,
                message: err.message,
            });
        }

        next();
    });
};
