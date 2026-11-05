import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const localScreenshotsDir = path.resolve(__dirname, '../screenshots');

async function run() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1.5 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  async function snap(name) {
    const file = path.join(localScreenshotsDir, `${name}.png`);
    await page.screenshot({ path: file, fullPage: false });
    console.log(`📸 Saved: ${name}.png`);
  }

  // 1. Reception Tablet
  await page.goto('http://localhost:5000', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 600));
  await snap('01_reception_tablet');

  // 2. Scanner Modal
  const scanBtn = await page.$('button ::-p-text(SCAN MEMBER QR PASS)');
  if (scanBtn) {
    await scanBtn.click();
    await new Promise((r) => setTimeout(r, 600));
    await snap('02_qr_scanner_modal');
  }

  // 3. Green HUD
  await page.goto('http://localhost:5000', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 600));
  const eg1001 = await page.$('button ::-p-text(EG-1001)');
  if (eg1001) {
    await eg1001.click();
    await new Promise((r) => setTimeout(r, 600));
    await snap('03_status_hud_green');
  }

  // 4. Red HUD
  await page.goto('http://localhost:5000', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 600));
  const eg1008 = await page.$('button ::-p-text(EG-1008)');
  if (eg1008) {
    await eg1008.click();
    await new Promise((r) => setTimeout(r, 600));
    await snap('04_status_hud_red_blocked');
  }

  // 5. Manual Checkin PIN Gate
  await page.goto('http://localhost:5000', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 600));
  const manualBtn = await page.$('button ::-p-text(MANUAL CHECK-IN)');
  if (manualBtn) {
    await manualBtn.click();
    await new Promise((r) => setTimeout(r, 600));
    await snap('05_manual_checkin_pin_gate');

    // Type PIN 1234
    await page.type('input[type="password"]', '1234');
    const unlockBtn = await page.$('button ::-p-text(Unlock Manual Check-In)');
    if (unlockBtn) await unlockBtn.click();
    await new Promise((r) => setTimeout(r, 600));
    await page.type('input[placeholder*="member\'s name"]', 'Vignesh');
    await new Promise((r) => setTimeout(r, 600));
    await snap('06_manual_checkin_search');
  }

  // 6. Revenue Intel Dashboard
  await page.goto('http://localhost:5000', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 600));
  const revTab = await page.$('nav button ::-p-text(Revenue Intel)');
  if (revTab) {
    await revTab.click();
    await new Promise((r) => setTimeout(r, 600));
    await snap('07_revenue_dashboard');

    // EOD Modal
    const eodBtn = await page.$('button ::-p-text(EOD Cash Drawer Till)');
    if (eodBtn) {
      await eodBtn.click();
      await new Promise((r) => setTimeout(r, 600));
      await snap('08_eod_cash_drawer_modal');
    }
  }

  // 7. Sales CRM
  await page.goto('http://localhost:5000', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 600));
  const crmTab = await page.$('nav button ::-p-text(Sales CRM)');
  if (crmTab) {
    await crmTab.click();
    await new Promise((r) => setTimeout(r, 600));
    await snap('09_sales_crm_kanban');

    const winbackBtn = await page.$('button ::-p-text(Lost Lead Win-Back)');
    if (winbackBtn) {
      await winbackBtn.click();
      await new Promise((r) => setTimeout(r, 600));
      await snap('10_winback_campaigns');
    }

    const staffBtn = await page.$('button ::-p-text(Staff Conversion)');
    if (staffBtn) {
      await staffBtn.click();
      await new Promise((r) => setTimeout(r, 600));
      await snap('11_staff_commissions');
    }
  }

  // 8. Members Roster
  await page.goto('http://localhost:5000', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 600));
  const memTab = await page.$('nav button ::-p-text(Members)');
  if (memTab) {
    await memTab.click();
    await new Promise((r) => setTimeout(r, 600));
    await snap('12_members_roster');

    const firstCard = await page.$('.cursor-pointer.group');
    if (firstCard) {
      await firstCard.click();
      await new Promise((r) => setTimeout(r, 600));
      await snap('13_member_attendance_history_modal');
    }
  }

  // 9. Expiry Alerts
  await page.goto('http://localhost:5000', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 600));
  const expTab = await page.$('nav button ::-p-text(Expiry Alerts)');
  if (expTab) {
    await expTab.click();
    await new Promise((r) => setTimeout(r, 600));
    await snap('14_expiry_alerts_3tiers');
  }

  // 10. Retail POS & Lockers
  await page.goto('http://localhost:5000', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 600));
  const posTab = await page.$('nav button ::-p-text(Retail & Lockers)');
  if (posTab) {
    await posTab.click();
    await new Promise((r) => setTimeout(r, 600));
    const firstProd = await page.$('.grid button');
    if (firstProd) await firstProd.click();
    await new Promise((r) => setTimeout(r, 400));
    await snap('15_pos_retail_checkout');

    const lockerBtn = await page.$('button ::-p-text(Visual Locker Grid)');
    if (lockerBtn) {
      await lockerBtn.click();
      await new Promise((r) => setTimeout(r, 600));
      await snap('16_visual_locker_grid');
    }
  }

  // 11. Invoices (GST)
  await page.goto('http://localhost:5000', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 600));
  const invTab = await page.$('nav button ::-p-text(Invoices (GST))');
  if (invTab) {
    await invTab.click();
    await new Promise((r) => setTimeout(r, 600));
    await snap('17_invoices_archive');

    const viewPrintBtn = await page.$('table button ::-p-text(View / Print)');
    if (viewPrintBtn) {
      await viewPrintBtn.click();
      await new Promise((r) => setTimeout(r, 600));
      await snap('18_official_gst_tax_invoice');
    }
  }

  // 12. Settings & Plan Builder
  await page.goto('http://localhost:5000', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 600));
  const setTab = await page.$('nav button ::-p-text(Settings)');
  if (setTab) {
    await setTab.click();
    await new Promise((r) => setTimeout(r, 600));
    await snap('19_settings_and_plan_builder');
  }

  await browser.close();
  console.log('✅ ALL SCREENSHOTS RE-CAPTURED CLEANLY!');
}

run();

