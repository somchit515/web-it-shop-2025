// backend/utils/createInvoicePdfPuppeteer.js
// ESM module — export named function `createInvoicePdf`
import puppeteer from 'puppeteer';

/**
 * createInvoicePdf({ html, url, pdfOptions })
 * - html: optional HTML string
 * - url: optional URL to render (if both provided, url has priority)
 * - pdfOptions: puppeteer pdf options (optional)
 *
 * Returns: Buffer (PDF)
 */
export async function createInvoicePdf({ html, url, pdfOptions = {} } = {}) {
  if (!html && !url) throw new Error('createInvoicePdf: html or url is required');

  const launchOptions = {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  };

  // ถ้าคุณมี Chrome/Chromium binary พิเศษ ให้กำหนด path ผ่าน env var: CHROME_PATH
  if (process.env.CHROME_PATH) {
    launchOptions.executablePath = process.env.CHROME_PATH;
  }

  const browser = await puppeteer.launch(launchOptions);

  try {
    const page = await browser.newPage();

    if (url) {
      await page.goto(url, { waitUntil: 'networkidle0' });
    } else {
      await page.setContent(html, { waitUntil: 'networkidle0' });
    }

    // รอรูป/ฟอนต์โหลด
    await page.evaluate(async () => {
      const imgs = Array.from(document.images || []);
      await Promise.all(imgs.map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise((res) => { img.onload = res; img.onerror = res; });
      }));
      if (document.fonts) await document.fonts.ready;
    });

    const defaultPdfOptions = {
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', right: '10mm', bottom: '20mm', left: '10mm' },
    };

    const finalOptions = Object.assign({}, defaultPdfOptions, pdfOptions);
    const buffer = await page.pdf(finalOptions);

    await page.close();
    return buffer;
  } finally {
    await browser.close();
  }
}
