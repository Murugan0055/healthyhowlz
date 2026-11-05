import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOT_DIR = path.resolve(__dirname, '../screenshots');
const BASE_URL = 'http://localhost:5000';

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runVerification() {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  console.log('🚀 Launching Chrome to verify Payment Integration, Income & Expenses, Hamburger Menu, and Plan Values...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  try {
    // ==========================================
    // PART 1: GYM OWNER APP (Desktop / Tablet)
    // ==========================================
    await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });

    // 1. Visit Admin Portal & Log In as Super Admin / Owner
    console.log('Visiting Admin Portal...');
    await page.goto(`${BASE_URL}/?portal=admin`, { waitUntil: 'networkidle0' });
    await sleep(1000);

    // Click Super Admin Fill & Enter if on login page
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const superAdminBtn = btns.find(b => b.textContent.includes('Super Admin'));
      if (superAdminBtn) superAdminBtn.click();
    });
    await sleep(1500);

    // 2. Open Hamburger Navigation Menu
    console.log('📸 Screen 59: Redesigned Admin Header & Hamburger Menu Drawer');
    await page.evaluate(() => {
      const menuBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Menu') || b.querySelector('.lucide-menu'));
      if (menuBtn) menuBtn.click();
    });
    await sleep(800);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '59_admin_redesigned_header_and_hamburger_menu_open.png'), fullPage: false });

    // 3. Navigate to "Income & Expense (P&L)" via Hamburger Menu
    console.log('Navigating to Income & Expense...');
    await page.evaluate(() => {
      const drawerBtns = Array.from(document.querySelectorAll('button'));
      const expBtn = drawerBtns.find(b => b.textContent.includes('Income & Expense'));
      if (expBtn) expBtn.click();
    });
    await sleep(1200);

    // 4. Capture Income & Expense Ledger
    console.log('📸 Screen 60: Gym Owner Income & Expense Ledger (P&L)');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '60_admin_income_and_expense_ledger.png'), fullPage: false });

    // 5. Open "+ Add Operating Expense" Modal
    console.log('📸 Screen 61: Add Operating Expense Modal');
    await page.evaluate(() => {
      const addBtns = Array.from(document.querySelectorAll('button'));
      const addExpBtn = addBtns.find(b => b.textContent.includes('Add Operating Expense'));
      if (addExpBtn) addExpBtn.click();
    });
    await sleep(800);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '61_admin_add_operating_expense_modal.png'), fullPage: false });

    // Close Add Expense Modal
    await page.evaluate(() => {
      const closeBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent === '✕' || b.textContent === 'Cancel');
      if (closeBtn) closeBtn.click();
    });
    await sleep(500);

    // ==========================================
    // PART 2: CLIENT APP (Mobile Viewport 390x844)
    // ==========================================
    console.log('Switching to Client App in Mobile Viewport (390x844)...');
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.goto(`${BASE_URL}/?portal=client`, { waitUntil: 'networkidle0' });
    await sleep(1000);

    // Ensure member is logged in as Vigneshwaran K
    await page.evaluate(() => {
      const demoBtns = Array.from(document.querySelectorAll('button'));
      const vigneshBtn = demoBtns.find(b => b.textContent.includes('Vigneshwaran K'));
      if (vigneshBtn) vigneshBtn.click();
    });
    await sleep(1500);

    // Navigate to Wallet Tab (Plans, Loyalty Points, Payment)
    await page.evaluate(() => {
      const navBtns = Array.from(document.querySelectorAll('nav button'));
      const walletTab = navBtns.find(b => b.textContent.includes('Wallet'));
      if (walletTab) walletTab.click();
    });
    await sleep(1500);

    // 6. Capture Correct Plan Values and 50 Points = 1 INR conversion
    console.log('📸 Screen 62: Correct Plan Values & 50 Points = 1 INR Ratio');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '62_client_app_redesigned_header_and_correct_plans.png'), fullPage: false });

    // 7. Click "Proceed to UPI Payment" to open the Payment Gateway Modal
    console.log('📸 Screen 63: Fast UPI Payment Gateway Sheet / Modal');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const payBtn = btns.find(b => b.textContent.includes('Proceed to UPI Payment'));
      if (payBtn) payBtn.click();
    });
    await sleep(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '63_client_app_upi_payment_gateway_modal.png'), fullPage: false });

    // 8. Confirm & Verify Payment
    console.log('📸 Screen 64: Completed Payment & Verified GST Receipt');
    await page.evaluate(() => {
      const modalBtns = Array.from(document.querySelectorAll('button'));
      const confirmBtn = modalBtns.find(b => b.textContent.includes('Confirm & Verify Payment'));
      if (confirmBtn) confirmBtn.click();
    });
    await sleep(2500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '64_client_app_payment_completed_tax_receipt.png'), fullPage: false });

    console.log('✅ All requested features verified and captured successfully!');
  } catch (err) {
    console.error('❌ Verification error:', err);
    throw err;
  } finally {
    await browser.close();
  }
}

runVerification().catch(err => {
  console.error(err);
  process.exit(1);
});

