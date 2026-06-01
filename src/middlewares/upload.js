import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";
import AppError from "../utils/AppError.js";

dotenv.config();

// Configure Cloudinary using process.env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Cloudinary storage engine
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "hrm-saas-uploads",
    resource_type: "auto", // Crucial for auto-detecting images vs raw/document files like PDFs and Word Docs
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      // Clean original filename (remove extension and replace special characters)
      const nameWithoutExt = file.originalname.split(".").slice(0, -1).join(".");
      const ext = file.originalname.split(".").pop() || "bin";
      const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, "-");
      return `${file.fieldname}-${sanitizedName}-${uniqueSuffix}.${ext}`;
    },
  },
});

// Image only filter (run on backend as a quick check before uploading to Cloudinary)
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new AppError("Only image files are allowed!", 400), false);
  }
};

// Documents (Images + PDFs + Excel + Word) filter (run on backend before uploading)
const documentFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError("Unsupported file format! Only images, PDFs, Word, and Excel files are allowed.", 400), false);
  }
};

const uploadLimit = (parseInt(process.env.UPLOAD_LIMIT_MB, 10) || 5) * 1024 * 1024; // Convert MB to bytes

// Export configurations
export const uploadImage = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: uploadLimit },
});

export const uploadDocument = multer({
  storage,
  fileFilter: documentFilter,
  limits: { fileSize: uploadLimit },
});
