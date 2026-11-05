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

  console.log('🚀 Launching Chrome to verify App 2: Client Member PWA...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=430,932']
  });

  const page = await browser.newPage();
  // Set iPhone 15 Pro Mobile Viewport (390 x 844, 2x device scale)
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

  try {
    // 1. Visit Client PWA Login Screen
    console.log('📸 Screen 46: Client PWA Login');
    await page.goto(`${BASE_URL}/?portal=client`, { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      localStorage.removeItem('elite_member_session');
    });
    await page.goto(`${BASE_URL}/?portal=client`, { waitUntil: 'networkidle0' });
    await sleep(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '46_client_pwa_login_screen.png'), fullPage: false });

    // 2. Click 1-Tap Demo Member "Vigneshwaran K" to Log In
    console.log('Logging in as Vigneshwaran K...');
    await page.evaluate(() => {
      const demoBtns = Array.from(document.querySelectorAll('button'));
      const vigneshBtn = demoBtns.find(b => b.textContent.includes('Vigneshwaran K'));
      if (vigneshBtn) vigneshBtn.click();
    });
    await sleep(2000);

    // 3. Dynamic QR Pass Screen
    console.log('📸 Screen 47: Dynamic QR Pass');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '47_client_pwa_dynamic_qr_pass.png'), fullPage: false });

    // 4. Test Scan Simulation on Front Desk Kiosk
    console.log('📸 Screen 48: Front-Desk Check-In Simulation');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const testScanBtn = btns.find(b => b.textContent.includes('Test Check-In Scan'));
      if (testScanBtn) testScanBtn.click();
    });
    await sleep(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '48_client_pwa_qr_simulated_scan_hud.png'), fullPage: false });

    // 5. Navigate to Workout Tab
    console.log('📸 Screen 49: Workout Tab');
    await page.evaluate(() => {
      const navBtns = Array.from(document.querySelectorAll('nav button'));
      const workoutTab = navBtns.find(b => b.textContent.includes('Workout'));
      if (workoutTab) workoutTab.click();
    });
    await sleep(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '49_client_pwa_workout_tab.png'), fullPage: false });

    // 6. Open Incline Dumbbell Bench Press Set Logger Drawer
    console.log('📸 Screen 50: Workout Set Logger Drawer');
    await page.evaluate(() => {
      const exCards = Array.from(document.querySelectorAll('div'));
      const benchCard = exCards.find(d => d.textContent.includes('Incline Dumbbell Bench Press'));
      if (benchCard) benchCard.click();
    });
    await sleep(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '50_client_pwa_workout_set_logger_drawer.png'), fullPage: false });

    // 7. Increase Weight to 36kg (+2kg PR) and Submit Set
    console.log('Submitting PR set...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const plusFive = btns.find(b => b.textContent.includes('+5'));
      if (plusFive) plusFive.click();
      const plusOne = btns.find(b => b.innerHTML.includes('lucide-plus'));
      if (plusOne) plusOne.click();
    });
    await sleep(500);
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const logBtn = btns.find(b => b.textContent.includes('Log Set'));
      if (logBtn) logBtn.click();
    });
    await sleep(1500);
    console.log('📸 Screen 51: PR Celebration & Rest Timer');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '51_client_pwa_workout_pr_celebration.png'), fullPage: false });

    // 8. Navigate to Nutrition & Diet Tab
    console.log('📸 Screen 52: Nutrition & Diet Tab');
    await page.evaluate(() => {
      const navBtns = Array.from(document.querySelectorAll('nav button'));
      const dietTab = navBtns.find(b => b.textContent.includes('Nutrition'));
      if (dietTab) dietTab.click();
    });
    await sleep(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '52_client_pwa_diet_macro_tracker.png'), fullPage: false });

    // 9. Check off Power Lunch meal
    console.log('📸 Screen 53: Meal Checkoff & Live Macro Recalculation');
    await page.evaluate(() => {
      const mealCards = Array.from(document.querySelectorAll('div'));
      const lunch = mealCards.find(d => d.textContent.includes('Power Lunch'));
      if (lunch) lunch.click();
    });
    await sleep(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '53_client_pwa_diet_meal_checked.png'), fullPage: false });

    // 10. Navigate to Loyalty Wallet Tab
    console.log('📸 Screen 54: Loyalty Wallet & Renewal Slider');
    await page.evaluate(() => {
      const navBtns = Array.from(document.querySelectorAll('nav button'));
      const walletTab = navBtns.find(b => b.textContent.includes('Wallet'));
      if (walletTab) walletTab.click();
    });
    await sleep(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '54_client_pwa_loyalty_wallet.png'), fullPage: false });

    // 11. Execute Renewal with 15% points discount
    console.log('📸 Screen 55: Membership Renewed Receipt');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const renewBtn = btns.find(b => b.textContent.includes('Extend Plan') || b.textContent.includes('Pay ₹'));
      if (renewBtn) renewBtn.click();
    });
    await sleep(2000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '55_client_pwa_plan_renewed_receipt.png'), fullPage: false });

    // Dismiss receipt
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const dismissBtn = btns.find(b => b.textContent.includes('Dismiss Receipt'));
      if (dismissBtn) dismissBtn.click();
    });
    await sleep(500);

    // 12. Navigate to Club Floor Rush Tab
    console.log('📸 Screen 56: Club Floor Rush & Notices');
    await page.evaluate(() => {
      const navBtns = Array.from(document.querySelectorAll('nav button'));
      const clubTab = navBtns.find(b => b.textContent.includes('Club'));
      if (clubTab) clubTab.click();
    });
    await sleep(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '56_client_pwa_floor_rush_and_notices.png'), fullPage: false });

    // 13. Open Member Switcher Dropdown in Top Bar
    console.log('📸 Screen 57: Demo Member Switcher Dropdown');
    await page.evaluate(() => {
      const topBtns = Array.from(document.querySelectorAll('header button'));
      const memberBtn = topBtns.find(b => b.textContent.includes('EG-1001') || b.textContent.includes('Vignesh'));
      if (memberBtn) memberBtn.click();
    });
    await sleep(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '57_client_pwa_member_switcher_dropdown.png'), fullPage: false });

    // 14. Switch to Admin Portal (Tablet Viewport 1280x800)
    console.log('📸 Screen 58: Seamless Switch to Admin Reception Kiosk');
    await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
    await page.goto(`${BASE_URL}/?portal=admin`, { waitUntil: 'networkidle0' });
    await sleep(1000);
    // Click Super Admin Fill & Enter
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const superAdminBtn = btns.find(b => b.textContent.includes('Super Admin'));
      if (superAdminBtn) superAdminBtn.click();
    });
    await sleep(2000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '58_admin_portal_reception_kiosk_seamless_sync.png'), fullPage: false });

    console.log('✅ All App 2 Client Member PWA visual tests & screenshots completed successfully!');
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
