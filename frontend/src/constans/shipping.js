// frontend/src/constans/shipping.js
// ✅ Single source of truth สำหรับ shipping carriers + rates
// ใช้ได้ทั้ง Shipping.jsx, ConfrimOder.jsx, PaymentMethod.jsx

/**
 * baseFee: ค่าขนส่งคงที่ (LAK)
 * freeShippingThreshold: ถ้ายอดสินค้าถึงนี้ → ฟรีค่าส่ง (null = ไม่มีโปรฟรี)
 */
export const SHIPPING_CARRIERS = [
  {
    name: "ອານຸສິດຂົນສົ່ງດ່ວນ",
    code: "ANUSIT",
    logo: "/images/carriers/Anusith.png",
    description: "ບໍລິການຂົນສົ່ງດ່ວນທົ່ວລາວ",
    deliveryTime: "1-2 ມື້",
    baseFee: 30000,
    freeShippingThreshold: 1000000,
  },
  {
    name: "ມີໄຊຂົນສົ່ງດ່ວນ",
    code: "MAISAY",
    logo: "/images/carriers/mixay.png",
    description: "ຂົນສົ່ງທົ່ວປະເທດ ລາຄາຖືກ",
    deliveryTime: "2-3 ມື້",
    baseFee: 20000,
    freeShippingThreshold: 1000000,
  },
  {
    name: "ຢູນິເທວ ຂົນສົ່ງ",
    code: "UNITED",
    logo: "/images/carriers/unitel.png",
    description: "ບໍລິການຂົນສົ່ງສາກົນ",
    deliveryTime: "3-7 ມື້",
    baseFee: 50000,
    freeShippingThreshold: null, // ไม่มีโปรฟรี
  },
  {
    name: "ຮັບສິນຄ້າທີ່ຮ້ານເອງ",
    code: "PICKUP",
    logo: "/images/logo.png",
    description: "ມາຮັບສິນຄ້າດ້ວຍຕົນເອງທີ່ຮ້ານ — ບໍ່ມີຄ່າຂົນສົ່ງ",
    deliveryTime: "ພ້ອມຮັບ",
    baseFee: 0,
    freeShippingThreshold: 0, // ฟรีตลอด
  },
];

/**
 * คำนวณค่าขนส่งตาม carrier + ยอดสินค้า
 * @param {string} carrierCode - รหัส carrier
 * @param {number} itemsPrice - ยอดสินค้ารวม
 * @returns {{ fee: number, isFree: boolean, carrier: object }}
 */
export function calculateShippingFee(carrierCode, itemsPrice = 0) {
  const carrier = SHIPPING_CARRIERS.find((c) => c.code === carrierCode);
  if (!carrier) {
    // default fallback
    return { fee: 20000, isFree: false, carrier: SHIPPING_CARRIERS[1] };
  }

  // ฟรีตลอด (เช่น PICKUP)
  if (carrier.baseFee === 0) {
    return { fee: 0, isFree: true, carrier };
  }

  // ถึง threshold → ฟรี
  if (
    carrier.freeShippingThreshold !== null &&
    itemsPrice >= carrier.freeShippingThreshold
  ) {
    return { fee: 0, isFree: true, carrier };
  }

  return { fee: carrier.baseFee, isFree: false, carrier };
}

/** หา carrier ตาม code (ใช้ใน UI) */
export function getCarrierByCode(code) {
  return SHIPPING_CARRIERS.find((c) => c.code === code) || SHIPPING_CARRIERS[1];
}
