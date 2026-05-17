// backend/utils/emailTemplates.js
// Ensure this file is saved as ES module (package.json should contain "type": "module")

function formatCurrencyLAK(value) {
  const num = Number(value || 0);
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 0, // ປັບເປັນ 0 ເພາະສະກຸນເງິນກີບປົກກະຕິບໍ່ມີເສດສະຕາງ
    maximumFractionDigits: 0,
  });
}

function orderSummaryHtml(order, lang) {
  const labels = {
    en: { product: 'Product', qty: 'Qty', price: 'Price', total: 'Total' },
    th: { product: 'สินค้า', qty: 'จำนวน', price: 'ราคา', total: 'รวมທັງໝົດ' },
    la: { product: 'ສິນຄ້າ', qty: 'ຈຳນວນ', price: 'ລາຄາ', total: 'ລວມທັງໝົດ' }
  };
  const label = labels[lang] || labels.en;

  const itemsHtml = (order.orderItems || []).map(i => `
    <tr>
      <td style="padding:6px 8px; border-bottom:1px solid #eee;">${i.name}</td>
      <td style="text-align:center; padding:6px 8px; border-bottom:1px solid #eee;">${i.quantity}</td>
      <td style="text-align:right; padding:6px 8px; border-bottom:1px solid #eee;">₭${formatCurrencyLAK(i.price)}</td>
    </tr>
  `).join('');

  return `
    <table style="width:100%; border-collapse:collapse; font-family:Arial, sans-serif; margin: 20px 0;">
      <thead>
        <tr>
          <th style="text-align:left; padding:6px 8px; border-bottom:2px solid #ddd;">${label.product}</th>
          <th style="text-align:center; padding:6px 8px; border-bottom:2px solid #ddd;">${label.qty}</th>
          <th style="text-align:right; padding:6px 8px; border-bottom:2px solid #ddd;">${label.price}</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="2" style="padding:8px 8px; text-align:left;"><strong>${label.total}</strong></td>
          <td style="text-align:right; padding:8px 8px;"><strong>₭${formatCurrencyLAK(order.totalAmount)}</strong></td>
        </tr>
      </tfoot>
    </table>
  `;
}

/**
 * Returns an object: { subject, text, html }
 * lang: 'la' | 'en' | 'th'
 * action: 'created' | 'confirm' | 'reject' | 'uploaded' | 'shipped' | 'delivered' | 'cancelled'
 */
export function getEmailTemplate({ lang = 'la', action = 'confirm', order = {}, note = '' } = {}) {
  const orderHtml = orderSummaryHtml(order, lang);
  const orderLink = `${process.env.FRONTEND_URL || ''}/me/orders/${order._id}`;
  const tracking = order.trackingCode || '';
  const carrier = order.shippingInfo?.shippingCarrier || '';

  // --- Lao (Default) ---
  if (lang === 'la') {
    // ✅ NEW: ສ້າງ order ສຳເລັດ (receipt)
    if (action === 'created') {
      const isPayAtStore = order.paymentMethod === 'PayAtStore';
      const isCOD = order.paymentMethod === 'COD' || isPayAtStore;
      return {
        subject: `🛒 ໄດ້ຮັບຄຳສັ່ງຊື້ #${String(order._id).substring(0, 8)} ແລ້ວ`,
        text: `ຂອບໃຈ! ໄດ້ຮັບຄຳສັ່ງຊື້ ${order._id} ຍອດ ₭${formatCurrencyLAK(order.totalAmount)}`,
        html: `
          <div style="font-family: 'Noto Sans Lao', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px;">
            <h2 style="color: #667eea;">ຂອບໃຈສຳລັບການສັ່ງຊື້! 🎉</h2>
            <p>ສະບາຍດີ ທ່ານ ${order.user?.name || ''},</p>
            <p>ພວກເຮົາໄດ້ຮັບຄຳສັ່ງຊື້ຂອງທ່ານແລ້ວ (ID: <strong>${order._id}</strong>)</p>
            ${orderHtml}
            <div style="background: #f0f9ff; padding: 14px 16px; border-radius: 10px; margin: 16px 0; border-left: 4px solid #3b82f6;">
              <strong>💳 ວິທີຊຳລະ:</strong> ${
                isPayAtStore ? '🏪 ຈ່າຍທີ່ໜ້າຮ້ານ' :
                isCOD ? '💵 ເງິນສົດເມື່ອຮັບສິນຄ້າ (COD)' :
                '🏦 ໂອນເງິນຜ່ານທະນາຄານ'
              }<br>
              ${isPayAtStore
                ? '<small>ກະລຸນາມາຮັບສິນຄ້າ ແລະ ຊຳລະທີ່ໜ້າຮ້ານພາຍໃນ 3 ວັນ</small>'
                : isCOD
                  ? '<small>ກະລຸນາກຽມເງິນສົດໃຫ້ພ້ອມເມື່ອພະນັກງານຂົນສົ່ງມາສົ່ງ</small>'
                  : '<small>ກະລຸນາໂອນເງິນ ແລະ ອັບໂຫຼດສະຫຼິບໃບໂອນຢູ່ໃນລະບົບ</small>'}
            </div>
            <p>ສະຖານະປະຈຸບັນ: <strong>ກຳລັງດຳເນີນການ</strong></p>
            <p style="text-align: center; margin: 24px 0;">
              <a href="${orderLink}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
                📋 ເບິ່ງລາຍລະອຽດອໍເດີ
              </a>
            </p>
          </div>
        `
      };
    }

    // ✅ NEW: ຈັດສົ່ງແລ້ວ
    if (action === 'shipped') {
      return {
        subject: `🚚 ຄຳສັ່ງຊື້ #${String(order._id).substring(0, 8)} ກຳລັງຈັດສົ່ງ`,
        text: `ສິນຄ້າຂອງທ່ານກຳລັງຈັດສົ່ງ ${tracking ? `ເລກພັດດຸ: ${tracking}` : ''}`,
        html: `
          <div style="font-family: 'Noto Sans Lao', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px;">
            <h2 style="color: #f59e0b;">🚚 ສິນຄ້າຂອງທ່ານກຳລັງຈັດສົ່ງ!</h2>
            <p>ສະບາຍດີ ທ່ານ ${order.user?.name || ''},</p>
            <p>ຄຳສັ່ງຊື້ <strong>${order._id}</strong> ໄດ້ຖືກສົ່ງໃຫ້ບໍລິສັດຂົນສົ່ງແລ້ວ</p>
            ${carrier ? `<p><strong>📦 ບໍລິສັດຂົນສົ່ງ:</strong> ${carrier}</p>` : ''}
            ${tracking ? `
              <div style="background: #fef3c7; padding: 14px 16px; border-radius: 10px; margin: 16px 0; border-left: 4px solid #f59e0b;">
                <strong>🔍 ເລກຕິດຕາມພັດດຸ:</strong>
                <div style="font-family: monospace; font-size: 18px; color: #92400e; margin-top: 8px;">
                  ${tracking}
                </div>
              </div>
            ` : ''}
            <p style="text-align: center; margin: 24px 0;">
              <a href="${orderLink}" style="display: inline-block; padding: 12px 24px; background: #f59e0b; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
                ຕິດຕາມການຈັດສົ່ງ
              </a>
            </p>
          </div>
        `
      };
    }

    // ✅ NEW: ສົ່ງສຳເລັດ
    if (action === 'delivered') {
      return {
        subject: `✅ ຄຳສັ່ງຊື້ #${String(order._id).substring(0, 8)} ສົ່ງສຳເລັດແລ້ວ`,
        text: `ສິນຄ້າຂອງທ່ານໄດ້ສົ່ງເຖິງມືແລ້ວ. ຂອບໃຈທີ່ໃຊ້ບໍລິການ!`,
        html: `
          <div style="font-family: 'Noto Sans Lao', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px;">
            <h2 style="color: #10b981;">✅ ສິນຄ້າສົ່ງເຖິງມືແລ້ວ!</h2>
            <p>ສະບາຍດີ ທ່ານ ${order.user?.name || ''},</p>
            <p>ຄຳສັ່ງຊື້ <strong>${order._id}</strong> ໄດ້ສົ່ງເຖິງມືທ່ານສຳເລັດແລ້ວ</p>
            <p>ຫວັງວ່າທ່ານຈະພໍໃຈກັບສິນຄ້າ 🙏</p>
            <div style="background: #f0fdf4; padding: 16px; border-radius: 10px; margin: 16px 0; text-align: center;">
              <p style="margin: 0;">⭐ ກະລຸນາສະລະເວລາໃຫ້ຄະແນນ + ຄຳຄິດເຫັນ</p>
              <a href="${orderLink}" style="display: inline-block; margin-top: 10px; padding: 10px 20px; background: #10b981; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
                ໃຫ້ຄະແນນສິນຄ້າ
              </a>
            </div>
          </div>
        `
      };
    }

    // ✅ NEW: ຍົກເລີກ
    if (action === 'cancelled') {
      return {
        subject: `❌ ຄຳສັ່ງຊື້ #${String(order._id).substring(0, 8)} ຖືກຍົກເລີກ`,
        text: `ຄຳສັ່ງຊື້ຂອງທ່ານຖືກຍົກເລີກ${note ? `: ${note}` : ''}`,
        html: `
          <div style="font-family: 'Noto Sans Lao', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px;">
            <h2 style="color: #ef4444;">ຄຳສັ່ງຊື້ຖືກຍົກເລີກ</h2>
            <p>ສະບາຍດີ ທ່ານ ${order.user?.name || ''},</p>
            <p>ຄຳສັ່ງຊື້ <strong>${order._id}</strong> ໄດ້ຖືກຍົກເລີກແລ້ວ</p>
            ${note ? `
              <div style="background: #fef2f2; padding: 14px 16px; border-radius: 10px; margin: 16px 0; border-left: 4px solid #ef4444;">
                <strong>ເຫດຜົນ:</strong> ${note}
              </div>
            ` : ''}
            <p>ສິນຄ້າຄືນສາງແລ້ວ ຖ້າທ່ານໂອນເງິນແລ້ວ ກະລຸນາຕິດຕໍ່ຝ່າຍຊ່ວຍເຫຼືອເພື່ອຂໍຄືນເງິນ</p>
            <p style="text-align: center; margin: 24px 0;">
              <a href="${orderLink}" style="display: inline-block; padding: 10px 20px; background: #64748b; color: white; text-decoration: none; border-radius: 8px;">
                ເບິ່ງລາຍລະອຽດ
              </a>
            </p>
          </div>
        `
      };
    }

    if (action === 'refunded') {
      const refundAmt = order.refundAmount ?? order.totalAmount;
      const bank = order.refundBank || '';
      const acct = order.refundAccount || '';
      return {
        subject: `💸 ຄືນເງິນສຳລັບອໍເດີ #${String(order._id).substring(0, 8)}`,
        text: `ພວກເຮົາໄດ້ອອກໃບຄືນເງິນ ₭${formatCurrencyLAK(refundAmt)} ສຳລັບອໍເດີ ${order._id} ແລ້ວ`,
        html: `
          <div style="font-family:'Noto Sans Lao',Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;">
            <h2 style="color:#8b5cf6;">💸 ພວກເຮົາໄດ້ຄືນເງິນໃຫ້ທ່ານແລ້ວ</h2>
            <p>ສະບາຍດີ ທ່ານ ${order.user?.name || ''},</p>
            <p>ພວກເຮົາໄດ້ດຳເນີນການ <strong>ຄືນເງິນ</strong> ສຳລັບຄຳສັ່ງຊື້ <strong>#${order._id}</strong> ແລ້ວ.</p>
            <div style="background:#f5f3ff;padding:16px 20px;border-radius:12px;margin:16px 0;border-left:4px solid #8b5cf6;">
              <p style="margin:0 0 6px;"><strong>💰 ຍອດຄືນເງິນ:</strong> ₭${formatCurrencyLAK(refundAmt)}</p>
              ${bank ? `<p style="margin:0 0 6px;"><strong>🏦 ທະນາຄານ:</strong> ${bank}</p>` : ''}
              ${acct ? `<p style="margin:0;"><strong>📋 ເລກບັນຊີ:</strong> ${acct}</p>` : ''}
            </div>
            ${note ? `
            <div style="background:#fefce8;padding:12px 16px;border-radius:10px;border-left:4px solid #f59e0b;margin:12px 0;">
              <strong>ໝາຍເຫດ:</strong> ${note}
            </div>` : ''}
            <p>ກະລຸນາລໍຖ້າ 3–5 ວັນທຳການ ສຳລັບເງິນເຂົ້າບັນຊີ. ຖ້າມີຄຳຖາມ ກະລຸນາຕິດຕໍ່ທີມງານ.</p>
            <p style="text-align:center;margin:24px 0;">
              <a href="${orderLink}" style="display:inline-block;padding:12px 24px;background:#8b5cf6;color:white;text-decoration:none;border-radius:8px;font-weight:600;">
                ເບິ່ງລາຍລະອຽດອໍເດີ
              </a>
            </p>
          </div>
        `
      };
    }

    if (action === 'confirm') {
      return {
        subject: `ຢືນຢັນການຊຳລະເງິນສຳລັບຄຳສັ່ງຊື້ #${order._id}`,
        text: `ຄຳສັ່ງຊື້ #${order._id} ໄດ້ຮັບການຢືນຢັນການຊຳລະເງິນແລ້ວ. ຍອດລວມ: ₭${formatCurrencyLAK(order.totalAmount)}`,
        html: `
          <div style="font-family: 'Noto Sans Lao', Arial, sans-serif; line-height: 1.6; color: #333;">
            <p>ສະບາຍດີ ທ່ານ ${order.user?.name || ''},</p>
            <p>ອີເມວສະບັບນີ້ແຈ້ງໃຫ້ຊາບວ່າ ພວກເຮົາໄດ້ <strong>ຢືນຢັນການຊຳລະເງິນ</strong> ສຳລັບຄຳສັ່ງຊື້ຂອງທ່ານແລ້ວ (ID: ${order._id}).</p>
            ${orderHtml}
            ${note ? `<p style="color: #666;"><strong>ໝາຍເຫດຈາກຜູ້ດູແລ:</strong> ${note}</p>` : ''}
            <p>ທ່ານສາມາດຕິດຕາມສະຖານະການຈັດສົ່ງໄດ້ທີ່: <a href="${orderLink}" style="color: #4A90E2;">ກົດບ່ອນນີ້ເພື່ອເບິ່ງລາຍລະອຽດ</a></p>
            <p>ຂອບໃຈທີ່ໃຊ້ບໍລິການກັບພວກເຮົາ.</p>
          </div>
        `
      };
    } else if (action === 'reject') {
      return {
        subject: `ແຈ້ງເຕືອນການປະຕິເສດການຊຳລະເງິນ (#${order._id})`,
        text: `ຄຳສັ່ງຊື້ #${order._id} ຖືກປະຕິເສດການຊຳລະເງິນ. ເຫດຜົນ: ${note}`,
        html: `
          <div style="font-family: 'Noto Sans Lao', Arial, sans-serif; line-height: 1.6; color: #333;">
            <p>ສະບາຍດີ ທ່ານ ${order.user?.name || ''},</p>
            <p>ພວກເຮົາເສຍໃຈທີ່ຕ້ອງແຈ້ງໃຫ້ຊາບວ່າ <strong>ການຊຳລະເງິນຂອງທ່ານຖືກປະຕິເສດ</strong> ສຳລັບຄຳສັ່ງຊື້ (ID: ${order._id}).</p>
            ${note ? `<p style="background: #fff5f5; padding: 10px; border-left: 4px solid #f56565;"><strong>ສາເຫດ:</strong> ${note}</p>` : ''}
            <p>ກະລຸນາກວດສອບຄວາມຖືກຕ້ອງ ແລະ ອັບໂຫຼດຫຼັກຖານໃໝ່ອີກຄັ້ງ ຫຼື ຕິດຕໍ່ທີມງານຊ່ວຍເຫຼືອ.</p>
            <p><a href="${orderLink}" style="display: inline-block; padding: 10px 20px; background: #4A90E2; color: #fff; text-decoration: none; border-radius: 5px;">ເບິ່ງລາຍລະອຽດອໍເດີ</a></p>
          </div>
        `
      };
    } else { // uploaded
      return {
        subject: `ໄດ້ຮັບຫຼັກຖານການຊຳລະເງິນແລ້ວ (#${order._id})`,
        text: `ພວກເຮົາໄດ້ຮັບຫຼັກຖານການຊຳລະເງິນຂອງທ່ານແລ້ວ. ທີມງານຈະກວດສອບ ແລະ ແຈ້ງຜົນໃຫ້ຊາບໂດຍໄວ.`,
        html: `
          <div style="font-family: 'Noto Sans Lao', Arial, sans-serif; line-height: 1.6; color: #333;">
            <p>ສະບາຍດີ ທ່ານ ${order.user?.name || ''},</p>
            <p>ພວກເຮົາໄດ້ຮັບຫຼັກຖານການຊຳລະເງິນສຳລັບຄຳສັ່ງຊື້ (ID: ${order._id}) ຂອງທ່ານແລ້ວ.</p>
            <p>ຂະນະນີ້ ທີມງານກຳລັງດຳເນີນການກວດສອບຄວາມຖືກຕ້ອງ ແລະ ຈະແຈ້ງຜົນໃຫ້ທ່ານຊາບຜ່ານທາງອີເມວນີ້ໂດຍໄວທີ່ສຸດ.</p>
            <p>ຂອບໃຈ.</p>
          </div>
        `
      };
    }
  }

  // --- Thai Section ---
  if (lang === 'th') {
    if (action === 'confirm') {
      return {
        subject: `ยืนยันการชำระเงินสำหรับคำสั่งซื้อ #${order._id}`,
        text: `คำสั่งซื้อ #${order._id} ได้รับการยืนยันการชำระเงินแล้ว`,
        html: `
          <p>สวัสดีคุณ ${order.user?.name || ''},</p>
          <p>เราได้ <strong>ยืนยันการชำระเงิน</strong> สำหรับคำสั่งซื้อของคุณแล้ว (ID: ${order._id}).</p>
          ${orderHtml}
          ${note ? `<p><strong>หมายเหตุ:</strong> ${note}</p>` : ''}
          <p>ดูสถานะ: <a href="${orderLink}">${orderLink}</a></p>
        `
      };
    } else if (action === 'reject') {
      return {
        subject: `ปฏิเสธการชำระเงินสำหรับคำสั่งซื้อ #${order._id}`,
        text: `การชำระเงินถูกปฏิเสธเนื่องจาก: ${note}`,
        html: `
          <p>สวัสดีคุณ ${order.user?.name || ''},</p>
          <p><strong>การชำระเงินถูกปฏิเสธ</strong> สำหรับคำสั่งซื้อ (ID: ${order._id}).</p>
          ${note ? `<p><strong>สาเหตุ:</strong> ${note}</p>` : ''}
          <p>กรุณาอัปโหลดหลักฐานใหม่: <a href="${orderLink}">${orderLink}</a></p>
        `
      };
    } else {
      return {
        subject: `ได้รับหลักฐานการชำระเงินแล้ว (#${order._id})`,
        text: `เราได้รับหลักฐานแล้ว กำลังดำเนินการตรวจสอบ`,
        html: `<p>ได้รับหลักฐานการชำระเงินสำหรับอໍເດີ ${order._id} แล้ว ทีมงานจะแจ้งผลให้ทราบเร็วๆ นี้</p>`
      };
    }
  }

  // --- Default English ---
  if (action === 'created') {
    return {
      subject: `Order received #${order._id}`,
      text: `Thank you! We have received your order ${order._id}.`,
      html: `
        <p>Hi ${order.user?.name || ''},</p>
        <p>Thank you for your order <strong>${order._id}</strong>!</p>
        ${orderHtml}
        <p>Payment method: <strong>${order.paymentMethod}</strong></p>
        <p>View details: <a href="${orderLink}">${orderLink}</a></p>
      `
    };
  }
  if (action === 'shipped') {
    return {
      subject: `Your order #${order._id} is on the way 🚚`,
      text: `Your order has been shipped. ${tracking ? `Tracking: ${tracking}` : ''}`,
      html: `
        <p>Hi ${order.user?.name || ''},</p>
        <p>Your order <strong>${order._id}</strong> has been shipped.</p>
        ${carrier ? `<p>Carrier: <strong>${carrier}</strong></p>` : ''}
        ${tracking ? `<p>Tracking code: <code>${tracking}</code></p>` : ''}
        <p><a href="${orderLink}">Track your order</a></p>
      `
    };
  }
  if (action === 'delivered') {
    return {
      subject: `Order #${order._id} delivered ✅`,
      text: `Your order has been delivered. Thank you!`,
      html: `
        <p>Hi ${order.user?.name || ''},</p>
        <p>Your order <strong>${order._id}</strong> has been delivered. Thank you!</p>
        <p>Please rate the products: <a href="${orderLink}">${orderLink}</a></p>
      `
    };
  }
  if (action === 'cancelled') {
    return {
      subject: `Order #${order._id} cancelled`,
      text: `Your order has been cancelled. ${note}`,
      html: `
        <p>Hi ${order.user?.name || ''},</p>
        <p>Your order <strong>${order._id}</strong> has been cancelled.</p>
        ${note ? `<p>Reason: ${note}</p>` : ''}
      `
    };
  }
  if (action === 'confirm') {
    return {
      subject: `Payment confirmed for order #${order._id}`,
      text: `Your order #${order._id} has been confirmed.`,
      html: `
        <p>Hi ${order.user?.name || ''},</p>
        <p>Your payment for order <strong>${order._id}</strong> has been <strong>confirmed</strong>.</p>
        ${orderHtml}
        ${note ? `<p><strong>Admin note:</strong> ${note}</p>` : ''}
        <p>View details: <a href="${orderLink}">${orderLink}</a></p>
      `
    };
  } else if (action === 'reject') {
    return {
      subject: `Payment rejected for order #${order._id}`,
      text: `Your payment was rejected. Reason: ${note}`,
      html: `
        <p>Hi ${order.user?.name || ''},</p>
        <p>We are sorry to inform that your payment for order <strong>${order._id}</strong> was <strong>rejected</strong>.</p>
        ${note ? `<p><strong>Reason:</strong> ${note}</p>` : ''}
        <p>Please re-upload proof: <a href="${orderLink}">${orderLink}</a></p>
      `
    };
  } else {
    return {
      subject: `Payment proof received for order #${order._id}`,
      text: `We received your payment proof and will verify it shortly.`,
      html: `<p>Hi ${order.user?.name || ''}, we have received your payment proof for order ${order._id}. Our team will update you soon.</p>`
    };
  }
}