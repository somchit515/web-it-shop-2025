import mongoose from "mongoose";

const financialTransactionSchema = new mongoose.Schema(
    {
        // 1. ชนิดของรายการ (สำคัญมากสำหรับการจัดกลุ่มในรายงาน)
        type: {
            type: String,
            required: [true, "Please specify the transaction type."],
            enum: {
                values: ["Income", "Expense", "Adjustment"], // รายรับ, รายจ่าย, การปรับปรุง
                message: "Type must be either: Income, Expense, or Adjustment.",
            },
        },

        // 2. จำนวนเงินที่ทำรายการ
        amount: {
            type: Number,
            required: [true, "Please enter the transaction amount."],
            default: 0,
        },

        // 3. คำอธิบายรายการ
        description: {
            type: String,
            trim: true,
            maxLength: [255, "Description cannot exceed 255 characters."],
        },

        // 4. หมวดหมู่ (ช่วยให้สามารถกรองรายงานได้ละเอียดขึ้น เช่น ค่าเช่า, เงินเดือน, ค่าสินค้า)
        category: {
            type: String,
            required: [true, "Please enter the transaction category."],
            trim: true,
        },

        // 5. วันที่ทำรายการ (ใช้สำหรับกรองรายงานตามช่วงเวลา)
        transactionDate: {
            type: Date,
            default: Date.now,
        },

        // 6. ผู้ที่สร้างรายการนี้ (ถ้าจำเป็นต้องตรวจสอบว่าใครเป็นคนบันทึก)
        user: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: true, 
        },
    },
    {
        timestamps: true // เพิ่มฟิลด์ createdAt และ updatedAt โดยอัตโนมัติ
    }
);

export default mongoose.model("FinancialTransaction", financialTransactionSchema);