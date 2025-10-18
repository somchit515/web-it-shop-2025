import { v2 as cloudinary } from 'cloudinary'; // 💡 ใช้ v2 as cloudinary เป็น Best Practice
import dotenv from 'dotenv';


dotenv.config({ path: 'backend/config/config.env' })

// 💡 การตั้งค่า secure: true จะช่วยให้แน่ใจว่าลิงก์เป็น HTTPS
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true, // 🛑 FIX: เพิ่ม secure: true
})

export const upload_file = (file, folder) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
            file,
            {
                resource_type: 'auto',
                folder
            },
            (error, result) => {
                if (error) return reject(error);

                // 🛑 FIX: ใช้ result.secure_url เพื่อรับประกัน HTTPS
                resolve({
                    public_id: result.public_id,
                    url: result.secure_url // ใช้ secure_url แทน url
                });
            }
        )
    });
};

export const delete_file = async (file) => {
    const res = await cloudinary.uploader.destroy(file)
    if (res?.result === 'ok') return true
}