// backend/utils/invoiceHtmlTemplate.js
function formatCurrency(amount) {
  return '₭' + Number(amount || 0).toLocaleString('lo-LA');
}

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('lo-LA');
}

function invoiceHtml(order = {}) {
  const {
    _id,
    createdAt,
    user = {},
    shippingInfo = {},
    paymentInfo = {},
    orderItems = [],
    itemsPrice,
    shippingAmount,
    taxAmount,
    totalAmount,
    orderStatus
  } = order;

  const itemsRows = (orderItems || []).map((it, idx) => `
    <tr>
      <td class="service">${idx+1}</td>
      <td class="desc">${it.name}</td>
      <td class="unit">${formatCurrency(it.price)}</td>
      <td class="qty">${it.quantity}</td>
      <td class="total">${formatCurrency(it.price * it.quantity)}</td>
    </tr>
  `).join('');

  return `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8"/>
      <title>Invoice ${_id}</title>
      <style>
        /* ใส่ CSS ของคุณที่นี่ (ตัดมาตามไฟล์ Invoice.css) */
        body { font-family: Arial, sans-serif; color: #333; }
        /* ... ตัดย่อ: ให้ใส่ CSS ทั้งหมดจาก Invoice.css ที่คุณให้มา ... */
        .order-invoice h1 { font-size: 24px; text-align:center; margin: 10px 0; }
        table { width:100%; border-collapse: collapse; }
        th, td { border: 1px solid #c1ced9; padding: 8px; text-align: center; }
        .service, .desc { text-align:left; }
        .total { text-align:right; }
        .grand.total { font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="order-invoice">
        <header>
          <div id="logo" style="text-align:center;">
            <img src="${process.env.FRONTEND_URL || ''}/images/logo.png" alt="logo" style="width:150px" />
          </div>
          <h1>ໃບເກັບເງິນ</h1>
          <div id="company" style="text-align:right;">
            <div>IT HUBB Supply CO,. LTD</div>
            <div>ຖະໜົນເລກ 7, ຊຽງຂວາງ, ລາວ</div>
            <div>(+856 20) 57047171</div>
            <div><a href="mailto:info@ithubb.com">info@ithubb.com</a></div>
          </div>
          <div id="project" style="margin-top:10px;">
            <div><strong>ຊື່:</strong> ${user.name || ''}</div>
            <div><strong>ອີເມວ:</strong> ${user.email || ''}</div>
            <div><strong>ເບີໂທ:</strong> ${shippingInfo.phoneNo || ''}</div>
            <div><strong>ທີ່ຢູ່:</strong> ${shippingInfo.address || ''}</div>
            <div><strong>ວັນທີ:</strong> ${formatDate(createdAt)}</div>
            <div><strong>ສະຖານະ:</strong> ${(paymentInfo?.status === 'Paid' || paymentInfo?.status === 'succeeded') ? 'ຊຳລະແລ້ວ' : orderStatus || ''}</div>
          </div>
        </header>

        <main>
          <table>
            <thead>
              <tr>
                <th>ID</th><th>ຊື່ລາຍການສິນຄ້າ</th><th>ລາຄາ</th><th>ຈຳນວນ</th><th>ລວມ</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
              <tr>
                <td colspan="4"><b>ລວມລາຄາສິນຄ້າທັງໝົດ</b></td>
                <td class="total">${formatCurrency(itemsPrice)}</td>
              </tr>
              <tr>
                <td colspan="4"><b>ອມພ (ອາກອນ)</b></td>
                <td class="total">${formatCurrency(taxAmount)}</td>
              </tr>
              <tr>
                <td colspan="4"><b>ຄ່າຂົນສົ່ງ</b></td>
                <td class="total">${formatCurrency(shippingAmount)}</td>
              </tr>
              <tr>
                <td colspan="4" class="grand total"><b>ລວມລາຄາທັງໝົດ</b></td>
                <td class="grand total">${formatCurrency(totalAmount)}</td>
              </tr>
            </tbody>
          </table>
        </main>

        <footer style="text-align:center; margin-top:20px;">
          ໃບເກັບເງິນຖືກສ້າງຂຶ້ນດ້ວຍລະບົບຄອມພິວເຕີ
        </footer>
      </div>
    </body>
  </html>
  `;
}

module.exports = invoiceHtml;
