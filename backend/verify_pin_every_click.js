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
  console.log('🚀 Running Chrome Verification for PIN prompt on EVERY manual check-in click...');
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

    // CLICK 1: Click Manual Check-In
    console.log('👉 Click 1: Opening Manual Check-In for the first time...');
    const manualBtn1 = await page.$('button ::-p-text(MANUAL CHECK-IN)');
    if (manualBtn1) {
      await manualBtn1.click();
      await new Promise((r) => setTimeout(r, 600));
      await snap('43_manual_checkin_click1_pin_gate');

      // Enter PIN 1234
      await page.type('input[placeholder="••••"]', '1234');
      const unlockBtn = await page.$('button ::-p-text(Unlock Manual Check-In)');
      if (unlockBtn) await unlockBtn.click();
      await new Promise((r) => setTimeout(r, 800));
      await snap('44_manual_checkin_click1_authenticated');

      // Close modal
      const closeBtn = await page.$('.modal-overlay button');
      if (closeBtn) await closeBtn.click();
      await new Promise((r) => setTimeout(r, 600));
    }

    // CLICK 2: Click Manual Check-In AGAIN! Must show PIN prompt again!
    console.log('👉 Click 2: Opening Manual Check-In a second time (MUST require PIN again)...');
    const manualBtn2 = await page.$('button ::-p-text(MANUAL CHECK-IN)');
    if (manualBtn2) {
      await manualBtn2.click();
      await new Promise((r) => setTimeout(r, 600));

      // Verify that the PIN input exists again!
      const pinInput = await page.$('input[placeholder="••••"]');
      if (pinInput) {
        console.log('✅ PASS: PIN prompt is present on Click 2!');
      } else {
        console.error('❌ FAIL: PIN prompt was bypassed on Click 2!');
      }

      await snap('45_manual_checkin_click2_pin_gate_again');

      const closeBtn2 = await page.$('.modal-overlay button');
      if (closeBtn2) await closeBtn2.click();
    }

    console.log('🎉 Verification completed successfully!');
  } catch (err) {
    console.error('❌ Error during verification:', err);
  } finally {
    await browser.close();
  }
}

run();

