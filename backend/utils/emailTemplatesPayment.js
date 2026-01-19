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
 * action: 'confirm' | 'reject' | 'uploaded'
 */
export function getEmailTemplate({ lang = 'la', action = 'confirm', order = {}, note = '' } = {}) {
  const orderHtml = orderSummaryHtml(order, lang);
  const orderLink = `${process.env.FRONTEND_URL || ''}/me/orders/${order._id}`;

  // --- Lao (Default) ---
  if (lang === 'la') {
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