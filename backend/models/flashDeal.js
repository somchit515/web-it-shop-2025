import mongoose from "mongoose";

const flashDealSchema = new mongoose.Schema(
  {
    label:     { type: String, default: "Flash Deal" },
    products:  [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    endsAt:    { type: Date, default: () => { const d = new Date(); d.setHours(23, 59, 59, 999); return d; } },
    discountPercent: { type: Number, default: 0, min: 0, max: 90 },
    isActive:        { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("FlashDeal", flashDealSchema);
