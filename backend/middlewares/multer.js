// backend/middlewares/multer.js

import multer from 'multer';

// 1. Configure Storage (Example: in memory storage for Cloudinary upload)
const storage = multer.memoryStorage();

// 2. Create the upload instance
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5, // Limit to 5MB (optional)
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed!'), false);
        }
    }
});

// 3. Export the instance
export { upload };