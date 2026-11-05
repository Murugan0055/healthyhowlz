import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\murug\\.gemini\\antigravity\\brain\\2ef279eb-12eb-4a38-8024-dc4297bb41d3';
const localScreenshotsDir = path.resolve(__dirname, '../screenshots');

async function run() {
  console.log('🚀 Running Chrome Verification for Premium Icons...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1.5 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  async function snap(name) {
    const file1 = path.join(artifactDir, `${name}.png`);
    const file2 = path.join(localScreenshotsDir, `${name}.png`);
    await page.screenshot({ path: file1, fullPage: false });
    fs.copyFileSync(file1, file2);
    console.log(`📸 Captured: ${name}.png`);
  }

  try {
    // Navigate and sign in with Super Admin
    await page.goto('http://localhost:5000', { waitUntil: 'networkidle2' });
    const superAdminBtn = await page.$('button ::-p-text(Fill & Enter →)');
    if (superAdminBtn) {
      await superAdminBtn.click();
      await new Promise((r) => setTimeout(r, 1200));
    }

    // Capture Reception Tablet with upgraded premium icons (no duplicate emojis)
    await snap('41_reception_kiosk_premium_icons');

    // Open QR scanner modal
    const scanBtn = await page.$('button ::-p-text(SCAN MEMBER QR PASS)');
    if (scanBtn) {
      await scanBtn.click();
      await new Promise((r) => setTimeout(r, 600));
      await snap('42_qr_scanner_modal_premium_icon');
      const closeBtn = await page.$('.modal-overlay button');
      if (closeBtn) await closeBtn.click();
      await new Promise((r) => setTimeout(r, 400));
    }

    console.log('✅ Premium icons verification completed!');
  } catch (err) {
    console.error('❌ Error during verification:', err);
  } finally {
    await browser.close();
  }
}

run();

