import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}

// FIXED: Added .trim() to strip hidden spaces/formatting characters, and enabled secure mode
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME?.trim(),
    api_key: process.env.CLOUD_API_KEY?.trim(),
    api_secret: process.env.CLOUD_API_SECRET?.trim(),
    secure: true
});

// Temporary Debugging Log: Run this once to verify what the SDK is actually seeing
console.log("=== Cloudinary Configuration Debug ===");
console.log("Cloud Name:", cloudinary.config().cloud_name);
console.log("API Key:", cloudinary.config().api_key);
console.log("API Secret Loaded?:", !!cloudinary.config().api_secret);
console.log("======================================");

const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const uploadToCloudinary = (req, res, next) => {
    // If no file was uploaded (e.g., editing a listing without changing the image), move on
    if (!req.file) {
        return next();
    }

    const options = {
        folder: 'wanderlust_DEV',
        allowed_formats: ['png', 'jpg', 'jpeg', 'webp'], // Cloudinary uses snake_case here
        resource_type: 'auto'
    };

    // Create the upload stream
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
        if (error) {
            console.error("Cloudinary Upload Error:", error);
            req.flash("error", "Image upload failed.");
            return res.redirect("/listings");
        }
        
        // Success! Attach the cloud URL and ID to the request object for the controller
        req.file.cloudinaryUrl = result.secure_url;
        req.file.cloudinaryId = result.public_id;
        next();
    });

    // Pipe the buffer from Multer directly into Cloudinary
    uploadStream.end(req.file.buffer);
};

export { upload, uploadToCloudinary, cloudinary };