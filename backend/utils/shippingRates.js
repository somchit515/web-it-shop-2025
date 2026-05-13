// backend/utils/shippingRates.js
// ✅ Server-side shipping rates — ตรงกับ frontend/src/constans/shipping.js
//    ใช้สำหรับ verify ค่าขนส่งที่ frontend ส่งมา (ป้องกัน tampering)

export const SHIPPING_RATES = {
  ANUSIT: { baseFee: 30000, freeShippingThreshold: 1000000 },
  MAISAY: { baseFee: 20000, freeShippingThreshold: 1000000 },
  UNITED: { baseFee: 50000, freeShippingThreshold: null },
  PICKUP: { baseFee: 0,     freeShippingThreshold: 0 },
};

/**
 * คำนวณค่าขนส่งฝั่ง server (ตรงกับ frontend logic)
 * @returns ค่า fee ที่คาดหวัง — frontend ต้องส่งค่าเดียวกัน
 */
export function expectedShippingFee(carrierCode, itemsPrice = 0) {
  const rate = SHIPPING_RATES[carrierCode];
  if (!rate) return 20000; // default (legacy carriers)

  if (rate.baseFee === 0) return 0;
  if (
    rate.freeShippingThreshold !== null &&
    itemsPrice >= rate.freeShippingThreshold
  ) {
    return 0;
  }
  return rate.baseFee;
}
