import { v2 as cloudinary } from 'cloudinary';
import dotenv from "dotenv";

dotenv.config({ path: "backend/config/config.env" });

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
    timeout: 60000,
});

// Warn if ENV missing
if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
) {
    console.error("❌ Missing Cloudinary ENV configuration!");
}

export const upload_file = (file, folder) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
            file,
            { resource_type: "auto", folder },
            (error, result) => {
                if (error) {
                    console.error("❌ Cloudinary Upload Error:", error);
                    return reject(error);
                }
                resolve({
                    public_id: result.public_id,
                    url: result.secure_url,
                    bytes: result.bytes,
                    format: result.format,
                });
            }
        );
    });
};

export const delete_file = async (public_id) => {
    try {
        const res = await cloudinary.uploader.destroy(public_id);
        return res.result === "ok" || res.result === "not found";
    } catch (err) {
        console.error("❌ Cloudinary Delete Error:", err);
        return false;
    }
};
