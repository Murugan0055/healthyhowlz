import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\murug\\.gemini\\antigravity\\brain\\2ef279eb-12eb-4a38-8024-dc4297bb41d3';
const localScreenshotsDir = path.resolve(__dirname, '../screenshots');

if (!fs.existsSync(localScreenshotsDir)) {
  fs.mkdirSync(localScreenshotsDir, { recursive: true });
}

async function run() {
  console.log('🚀 Running Chrome Verification for Responsive Updates & Locker Management...');
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
    // 1. Login Page showing ONLY Super Admin quick 1-tap preset
    // Clear localStorage to ensure we are on login screen
    await page.goto('http://localhost:5000', { waitUntil: 'networkidle2' });
    await page.evaluate(() => localStorage.clear());
    await page.goto('http://localhost:5000', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 800));
    await snap('25_login_page_super_admin_only');

    // 2. Sign in via Super Admin 1-tap button
    const superAdminBtn = await page.$('button ::-p-text(Fill & Enter →)');
    if (superAdminBtn) {
      await superAdminBtn.click();
      await new Promise((r) => setTimeout(r, 1200));
    }

    // 3. Sales CRM Tab (Zero Vertical Scroll)
    const crmTab = await page.$('nav button ::-p-text(Sales CRM)');
    if (crmTab) {
      await crmTab.click();
      await new Promise((r) => setTimeout(r, 1000));
      await snap('26_sales_crm_zero_vertical_scroll');
    }

    // 4. Invoices (GST) Tab - Card-based Layout
    const invoicesTab = await page.$('nav button ::-p-text(Invoices (GST))');
    if (invoicesTab) {
      await invoicesTab.click();
      await new Promise((r) => setTimeout(r, 1000));
      await snap('27_invoices_gst_cards_grid');
    }

    // 5. Staff & Roles Tab - Responsive User Cards
    const staffTab = await page.$('nav button ::-p-text(Staff & Roles)');
    if (staffTab) {
      await staffTab.click();
      await new Promise((r) => setTimeout(r, 1000));
      await snap('28_staff_roles_responsive_cards');
    }

    // 6. Retail & Lockers -> Lockers View
    const posTab = await page.$('nav button ::-p-text(Retail & Lockers)');
    if (posTab) {
      await posTab.click();
      await new Promise((r) => setTimeout(r, 800));

      // Click Lockers sub-tab
      const lockersSubTab = await page.$('button ::-p-text(Visual Locker Grid)');
      if (lockersSubTab) {
        await lockersSubTab.click();
        await new Promise((r) => setTimeout(r, 800));
      }
      await snap('29_lockers_management_grid_with_add_delete');

      // 7. Click "+ Add New Locker" button
      const addLockerBtn = await page.$('button ::-p-text(+ Add New Locker)');
      if (addLockerBtn) {
        await addLockerBtn.click();
        await new Promise((r) => setTimeout(r, 600));

        // Fill form
        await page.type('input[placeholder*="L-25"]', 'L-25');
        await snap('30_add_locker_modal');

        // Submit form
        page.on('dialog', async (dialog) => {
          await dialog.accept();
        });

        const submitBtn = await page.$('button ::-p-text(Add Locker to Floor Grid)');
        if (submitBtn) {
          await submitBtn.click();
          await new Promise((r) => setTimeout(r, 1500));
        }

        // Snap updated grid with L-25
        await snap('31_locker_grid_with_newL_25');
      }
    }

    // 8. Tablet Viewport Verification (768 x 1024) - CRM
    await page.setViewport({ width: 768, height: 1024, deviceScaleFactor: 1.5 });
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('header button'));
      const crm = btns.find((b) => b.innerText?.includes('Sales CRM'));
      if (crm) crm.click();
    });
    await new Promise((r) => setTimeout(r, 800));
    await snap('32_tablet_responsive_crm');

    // 9. Mobile Viewport Verification (390 x 844) - Invoices Cards
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('header button'));
      const inv = btns.find((b) => b.innerText?.includes('Invoices'));
      if (inv) inv.click();
    });
    await new Promise((r) => setTimeout(r, 800));
    await snap('33_mobile_responsive_invoices');

    // 10. Mobile Viewport Verification (390 x 844) - Staff User Cards
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('header button'));
      const staff = btns.find((b) => b.innerText?.includes('Staff & Roles'));
      if (staff) staff.click();
    });
    await new Promise((r) => setTimeout(r, 800));
    await snap('34_mobile_responsive_staff_cards');

    console.log('✅ All responsive screenshots successfully captured!');
  } catch (err) {
    console.error('❌ Error capturing screenshots:', err);
  } finally {
    await browser.close();
  }
}

run();

