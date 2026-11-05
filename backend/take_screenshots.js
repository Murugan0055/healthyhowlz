import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outputDir = 'C:\\Users\\murug\\.gemini\antigravity\\brain\\2ef279eb-12eb-4a38-8024-dc4297bb41d3\\screenshots';
const localScreenshotsDir = path.resolve(__dirname, '../screenshots');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}
if (!fs.existsSync(localScreenshotsDir)) {
  fs.mkdirSync(localScreenshotsDir, { recursive: true });
}

async function run() {
  console.log('🚀 Launching Chrome to capture screenshots of every screen and feature...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1.5 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  async function snap(name) {
    const file1 = path.join(outputDir, `${name}.png`);
    const file2 = path.join(localScreenshotsDir, `${name}.png`);
    await page.screenshot({ path: file1, fullPage: false });
    fs.copyFileSync(file1, file2);
    console.log(`📸 Captured: ${name}.png`);
  }

  try {
    // 1. Reception Tablet Main Dashboard
    await page.goto('http://localhost:5000', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1000));
    await snap('01_reception_tablet');

    // 2. Open On-Demand QR Scanner Modal
    const scanButton = await page.$('button ::-p-text(SCAN MEMBER QR PASS)');
    if (scanButton) {
      await scanButton.click();
      await new Promise((r) => setTimeout(r, 800));
      await snap('02_qr_scanner_modal');

      // Close scanner modal
      const closeBtn = await page.$('.modal-overlay button');
      if (closeBtn) await closeBtn.click();
      await new Promise((r) => setTimeout(r, 400));
    }

    // 3. Trigger Green Screen Status HUD (Simulate EG-1001 scan)
    const eg1001Btn = await page.$('button ::-p-text(EG-1001)');
    if (eg1001Btn) {
      await eg1001Btn.click();
      await new Promise((r) => setTimeout(r, 600));
      await snap('03_status_hud_green');

      // Dismiss HUD
      const dismissBtn = await page.$('.modal-overlay button ::-p-text(Done)');
      if (dismissBtn) await dismissBtn.click();
      await new Promise((r) => setTimeout(r, 400));
    }

    // 4. Trigger Red Screen Status HUD (Simulate Expired EG-1008 scan)
    const eg1008Btn = await page.$('button ::-p-text(EG-1008)');
    if (eg1008Btn) {
      await eg1008Btn.click();
      await new Promise((r) => setTimeout(r, 600));
      await snap('04_status_hud_red_blocked');

      // Dismiss HUD
      const dismissBtn = await page.$('.modal-overlay button ::-p-text(Dismiss)');
      if (dismissBtn) await dismissBtn.click();
      await new Promise((r) => setTimeout(r, 400));
    }

    // 5. Open Protected Manual Check-in PIN Gate
    const manualBtn = await page.$('button ::-p-text(MANUAL CHECK-IN)');
    if (manualBtn) {
      await manualBtn.click();
      await new Promise((r) => setTimeout(r, 600));
      await snap('05_manual_checkin_pin_gate');

      // Type PIN 1234
      await page.type('input[type="password"]', '1234');
      const unlockBtn = await page.$('button ::-p-text(Unlock Manual Check-In)');
      if (unlockBtn) await unlockBtn.click();
      await new Promise((r) => setTimeout(r, 800));

      // Type search
      await page.type('input[placeholder*="member\'s name"]', 'Vignesh');
      await new Promise((r) => setTimeout(r, 600));
      await snap('06_manual_checkin_id_photo_verification');

      // Close manual checkin modal
      const closeBtn = await page.$('.modal-overlay button');
      if (closeBtn) await closeBtn.click();
      await new Promise((r) => setTimeout(r, 400));
    }

    // 6. Revenue Intel Dashboard
    const revTab = await page.$('nav button ::-p-text(Revenue Intel)');
    if (revTab) {
      await revTab.click();
      await new Promise((r) => setTimeout(r, 800));
      await snap('07_revenue_dashboard');

      // Open EOD Cash Drawer Modal
      const eodBtn = await page.$('button ::-p-text(EOD Cash Drawer Till)');
      if (eodBtn) {
        await eodBtn.click();
        await new Promise((r) => setTimeout(r, 600));
        await snap('08_eod_cash_drawer_modal');
        const closeBtn = await page.$('.modal-overlay .no-print button:last-child');
        if (closeBtn) await closeBtn.click();
        await new Promise((r) => setTimeout(r, 600));
      }
    }

    // 7. Sales CRM Kanban
    const crmTab = await page.$('nav button ::-p-text(Sales CRM)');
    if (crmTab) {
      await crmTab.click();
      await new Promise((r) => setTimeout(r, 800));
      await snap('09_sales_crm_kanban');

      // Lost lead win-back campaigns
      const winbackBtn = await page.$('button ::-p-text(Lost Lead Win-Back)');
      if (winbackBtn) {
        await winbackBtn.click();
        await new Promise((r) => setTimeout(r, 600));
        await snap('10_winback_campaigns');
      }

      // Staff conversion & commissions
      const staffBtn = await page.$('button ::-p-text(Staff Conversion)');
      if (staffBtn) {
        await staffBtn.click();
        await new Promise((r) => setTimeout(r, 600));
        await snap('11_staff_commissions');
      }
    }

    // 8. Members Roster & Directory
    const membersTab = await page.$('nav button ::-p-text(Members)');
    if (membersTab) {
      await membersTab.click();
      await new Promise((r) => setTimeout(r, 800));
      await snap('12_members_roster');

      // Open Member Details & Attendance History
      const firstMember = await page.$('.cursor-pointer.group');
      if (firstMember) {
        await firstMember.click();
        await new Promise((r) => setTimeout(r, 800));
        await snap('13_member_attendance_history_modal');
        const closeBtn = await page.$('.modal-overlay .no-print button:last-child');
        if (closeBtn) await closeBtn.click();
        await new Promise((r) => setTimeout(r, 600));
      }
    }

    // 9. 3-Tier Expiry Notification Alerts
    const expiryTab = await page.$('nav button ::-p-text(Expiry Alerts)');
    if (expiryTab) {
      await expiryTab.click();
      await new Promise((r) => setTimeout(r, 800));
      await snap('14_expiry_alerts_3tiers');
    }

    // 10. Retail POS & Lockers
    const posTab = await page.$('nav button ::-p-text(Retail & Lockers)');
    if (posTab) {
      await posTab.click();
      await new Promise((r) => setTimeout(r, 800));

      // Click an item to add to register
      const firstItem = await page.$('.grid button');
      if (firstItem) await firstItem.click();
      await new Promise((r) => setTimeout(r, 400));
      await snap('15_pos_retail_checkout');

      // Switch to Visual Locker Grid
      const lockerBtn = await page.$('button ::-p-text(Visual Locker Grid)');
      if (lockerBtn) {
        await lockerBtn.click();
        await new Promise((r) => setTimeout(r, 600));
        await snap('16_visual_locker_grid');
      }
    }

    // 11. Invoices & GST Tax Receipt
    const invTab = await page.$('nav button ::-p-text(Invoices (GST))');
    if (invTab) {
      await invTab.click();
      await new Promise((r) => setTimeout(r, 800));
      await snap('17_invoices_archive');

      // Click View/Print to open the official GST Tax Invoice modal
      const viewPrintBtn = await page.$('table button ::-p-text(View / Print)');
      if (viewPrintBtn) {
        await viewPrintBtn.click();
        await new Promise((r) => setTimeout(r, 600));
        await snap('18_official_gst_tax_invoice');
        const closeBtn = await page.$('.modal-overlay .no-print button:last-child');
        if (closeBtn) await closeBtn.click();
        await new Promise((r) => setTimeout(r, 600));
      }
    }

    // 12. Settings & Plan Builder
    const settingsTab = await page.$('nav button ::-p-text(Settings)');
    if (settingsTab) {
      await settingsTab.click();
      await new Promise((r) => setTimeout(r, 800));
      await snap('19_settings_and_plan_builder');
    }

    console.log('🎉 ALL SCREENSHOTS SUCCESSFULLY CAPTURED!');
  } catch (err) {
    console.error('Screenshot capture error:', err);
  } finally {
    await browser.close();
  }
}

run();
