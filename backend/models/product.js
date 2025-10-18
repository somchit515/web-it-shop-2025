import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'ກະລຸນາໃສ່ຊື່ສິນຄ້າ'],
        maxLength: [200, 'ຊື່ສິນຄ້າຍາວບໍ່ເກິນ 200 ຄຳ']
    },
    price: {
        type: Number,
        required: [true, 'ກະລຸນາໃສ່ລາຄາສິນຄ້າ'],
        maxLength: [8, 'ລາຄາສິນຄ້າຍາວບໍ່ເກິນ 8 ຕົວເລກ']
    },
    description: {
        type: String,
        required: [true, 'ກະລຸນາໃສ່ຄຳອະທິບາຍສິນຄ້າ'],
        maxLength: [2000, 'ຄຳອະທິບາຍສິນຄ້າຍາວບໍ່ເກິນ 2000 ຄຳ']
    },
    ratings: {
        type: Number,
        default: 0,
    },
    images: [
        {
            public_id: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true,
            },
        },
    ],
    category: {
        type: String,
        required: [true, "ກະລູນາປ້ອນໝວດໝູ່ສິນຄ້າ"],
        enum: {
            values: [
                "laptops",
                "Cameras",
                "Headphones",
                "OutDoors",
                "PC",
                "Electronics",
                "Gammings",
                "smartphones",
                "Books",
                "sports"
            ],
            message: "ກະລຸນາເລືອກໝວດໝູ່ທີ່ຖືກຕ້ອງ",
        }
    },
    seller: {
        type: String,
        required: [true, "ກະລຸນາໃສ່ຊື່ຜູ້ຂາຍ"]
    },
    stock: {
        type: Number,
        required: [true, "ກະລຸນາໃສ່ສິນຄ້າທີ່ສະຕອ໊ກ"]
    },
    numOfReviews: {
        type: Number,
        default: 0,
    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
            rating: {
                type: Number,
                required: true,
            },
            comment: {
                type: String,
                required: true,
            }
        }
    ],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, { timestamps: true });

export default mongoose.model("Product", productSchema);
