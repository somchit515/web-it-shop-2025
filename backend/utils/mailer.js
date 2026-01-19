import nodemailer from 'nodemailer';
import { getEmailTemplate } from './emailTemplatesPayment.js';
import { createInvoicePdf } from './createInvoicePdfPuppeteer.js';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: (process.env.SMTP_SECURE === 'true'),
  auth: {
    user: process.env.SMTP_USER || process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASS || process.env.SMTP_PASSWORD
  }
});

export async function sendOrderEmail({ to, order, action = 'confirm', lang = 'la', invoiceFromUrl } = {}) {
  if (!to) throw new Error('sendOrderEmail: "to" is required');
  const template = getEmailTemplate({ lang, action, order, note: '' });

  const attachments = [];
  if (action === 'confirm' && invoiceFromUrl) {
    try {
      const pdfBuffer = await createInvoicePdf({ url: invoiceFromUrl });
      attachments.push({
        filename: `invoice-${order._id}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      });
    } catch (err) {
      console.error('Failed to generate invoice PDF', err);
    }
  }

  const mailOptions = {
    from: `${process.env.SMTP_FROM_NAME || 'No-Reply'} <${process.env.SMTP_FROM_EMAIL || process.env.FROM_EMAIL || 'no-reply@yourshop.com'}>`,
    to,
    subject: template.subject,
    text: template.text,
    html: template.html,
    attachments
  };

  return transporter.sendMail(mailOptions);
}
