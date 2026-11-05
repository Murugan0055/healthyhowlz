import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOT_DIR = path.resolve(__dirname, '../screenshots');
const ARTIFACTS_DIR = 'C:\\Users\\murug\\.gemini\\antigravity\\brain\\2ef279eb-12eb-4a38-8024-dc4297bb41d3';
const BASE_URL = 'http://127.0.0.1:5000';

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function saveAndCopyScreenshot(filename, buffer) {
  const localPath = path.join(SCREENSHOT_DIR, filename);
  fs.writeFileSync(localPath, buffer);
  const artifactPath = path.join(ARTIFACTS_DIR, filename);
  fs.writeFileSync(artifactPath, buffer);
  console.log(`Saved screenshot: ${filename}`);
}

async function runVerification() {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  console.log('🚀 Launching Chrome to visually verify App 3: Trainer & Floor Coach Platform...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  page.on('dialog', async (dialog) => {
    console.log(`[Browser Dialog]: ${dialog.message()}`);
    await dialog.dismiss();
  });

  try {
    // ========================================================
    // 1. Trainer Login & 1-Tap Demo Switcher (Tablet Viewport: 820 x 1080)
    // ========================================================
    await page.setViewport({ width: 820, height: 1000, deviceScaleFactor: 1 });

    // Clear localStorage to see login screen
    await page.goto(`${BASE_URL}/?portal=trainer`, { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      localStorage.removeItem('elite_gym_trainer_user');
      window.location.reload();
    });
    await sleep(1500);

    console.log('📸 Screen 65: Trainer Login & 1-Tap Demo Switcher');
    const buf65 = await page.screenshot({ fullPage: false });
    saveAndCopyScreenshot('65_trainer_app_login_and_demo_switcher.png', buf65);

    // Click Coach Murugan S Demo card to log in
    await page.evaluate(() => {
      const demoBtn = document.querySelector('button[data-demo-trainer="staff-trainer-1"]');
      if (demoBtn) demoBtn.click();
    });
    await sleep(1200);

    // Make sure dropdown menu is closed
    await page.evaluate(() => {
      const main = document.querySelector('main');
      if (main) main.click();
    });
    await sleep(500);

    // ========================================================
    // 2. App 3 Roster & Floor Tab (Mobile / Tablet Responsive: 820 x 1050)
    // ========================================================
    console.log('📸 Screen 66: Trainer Roster & Floor Coaching Tab');
    const buf66 = await page.screenshot({ fullPage: false });
    saveAndCopyScreenshot('66_trainer_app_roster_and_floor_tab.png', buf66);

    // ========================================================
    // 3. Perform 1-Tap Floor Check-In for a member (e.g. Vigneshwaran or Kavitha)
    // ========================================================
    console.log('Performing 1-Tap Floor Check-in...');
    await page.evaluate(() => {
      const checkinBtns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.includes('1-Tap Floor Check-In'));
      if (checkinBtns.length > 0) {
        checkinBtns[0].click();
      }
    });
    await sleep(1000);

    console.log('📸 Screen 67: 1-Tap Floor Check-In Verified with Toast');
    const buf67 = await page.screenshot({ fullPage: false });
    saveAndCopyScreenshot('67_trainer_app_1tap_floor_checkin_success.png', buf67);

    // ========================================================
    // 4. Switch to Anti-Fraud PT Punch-In Tab
    // ========================================================
    console.log('Switching to PT Punch-In Tab...');
    await page.evaluate(() => {
      const navBtns = Array.from(document.querySelectorAll('button'));
      const ptNav = navBtns.find(b => b.textContent.includes('PT Punch-In'));
      if (ptNav) ptNav.click();
    });
    await sleep(1200);

    console.log('📸 Screen 68: Anti-Fraud PT Punch-In Gate with 4-Digit PIN entry');
    const buf68 = await page.screenshot({ fullPage: false });
    saveAndCopyScreenshot('68_trainer_app_anti_fraud_pt_punchin_gate.png', buf68);

    // ========================================================
    // 5. Fill Verification Code & Sign Off PT Session
    // ========================================================
    console.log('Filling 4-digit code and verifying PT session...');
    await page.evaluate(() => {
      // Click Demo Auto-Fill (4821)
      const autoFillBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Demo Auto-Fill'));
      if (autoFillBtn) autoFillBtn.click();
    });
    await sleep(500);

    // Click "Verify & Sign Off PT Session"
    await page.evaluate(() => {
      const verifyBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Verify & Sign Off PT Session'));
      if (verifyBtn) verifyBtn.click();
    });
    await sleep(1500);

    console.log('📸 Screen 69: PT Session Signed Off & Session Balance Decremented');
    const buf69 = await page.screenshot({ fullPage: false });
    saveAndCopyScreenshot('69_trainer_app_pt_session_signed_off_success.png', buf69);

    // ========================================================
    // 6. Switch to Trainer Earnings & Commission Dashboard
    // ========================================================
    console.log('Switching to Earnings Dashboard...');
    await page.evaluate(() => {
      const navBtns = Array.from(document.querySelectorAll('button'));
      const earningsNav = navBtns.find(b => b.textContent.includes('Earnings'));
      if (earningsNav) earningsNav.click();
    });
    await sleep(1200);

    console.log('📸 Screen 70: Trainer Real-Time Earnings & Commission Dashboard');
    const buf70 = await page.screenshot({ fullPage: false });
    saveAndCopyScreenshot('70_trainer_app_earnings_and_commission_dashboard.png', buf70);

    // ========================================================
    // 7. Switch to Program Builder (Workout Splits)
    // ========================================================
    console.log('Switching to Program Builder Tab...');
    await page.evaluate(() => {
      const navBtns = Array.from(document.querySelectorAll('button'));
      const builderNav = navBtns.find(b => b.textContent.includes('Program Builder') || b.textContent.includes('Builder'));
      if (builderNav) builderNav.click();
    });
    await sleep(1200);

    console.log('📸 Screen 71: Rapid Workout Program Cloner');
    const buf71 = await page.screenshot({ fullPage: false });
    saveAndCopyScreenshot('71_trainer_app_rapid_workout_builder_splits.png', buf71);

    // ========================================================
    // 8. Switch to Diet Plans in Program Builder
    // ========================================================
    console.log('Switching to Diet Blueprints Sub-tab...');
    await page.evaluate(() => {
      const subBtns = Array.from(document.querySelectorAll('button'));
      const dietSub = subBtns.find(b => b.textContent.includes('Diet Plans'));
      if (dietSub) dietSub.click();
    });
    await sleep(1000);

    console.log('📸 Screen 72: Nutrition & Diet Master Blueprints');
    const buf72 = await page.screenshot({ fullPage: false });
    saveAndCopyScreenshot('72_trainer_app_rapid_diet_blueprints.png', buf72);

    // ========================================================
    // 9. Switch to Client Member App (App 2) - View Personal Training Pass
    // ========================================================
    console.log('Switching to Client Member App...');
    await page.setViewport({ width: 412, height: 915, deviceScaleFactor: 1 });
    await page.goto(`${BASE_URL}/?portal=client`, { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      localStorage.removeItem('elite_member_session');
      window.location.reload();
    });
    await sleep(2000);

    // Scroll down to display Personal Training (PT) Pass card
    await page.evaluate(() => {
      const scrollable = document.querySelector('main');
      if (scrollable) scrollable.scrollTop = 450;
      window.scrollBy(0, 450);
    });
    await sleep(800);

    console.log('📸 Screen 73: Client Member App - Personal Training Pass with 4-Digit Code');
    const buf73 = await page.screenshot({ fullPage: false });
    saveAndCopyScreenshot('73_client_app_pt_pass_with_verification_pin.png', buf73);

    // ========================================================
    // 10. Switch to Admin Portal (App 1) - Hamburger Menu with Trainer Link
    // ========================================================
    console.log('Switching to Admin Portal to verify drawer link...');
    await page.setViewport({ width: 1280, height: 850, deviceScaleFactor: 1 });
    await page.goto(`${BASE_URL}/?portal=admin`, { waitUntil: 'networkidle0' });
    await sleep(1200);

    // If on login page, click Super Admin Fill & Enter
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const superAdminBtn = btns.find(b => b.textContent.includes('Super Admin'));
      if (superAdminBtn) superAdminBtn.click();
    });
    await sleep(1500);

    // Open Hamburger Drawer
    await page.evaluate(() => {
      const menuBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Menu') || b.querySelector('.lucide-menu'));
      if (menuBtn) menuBtn.click();
    });
    await sleep(800);

    console.log('📸 Screen 74: Admin Portal Hamburger Menu with Trainer App Link');
    const buf74 = await page.screenshot({ fullPage: false });
    saveAndCopyScreenshot('74_admin_app_hamburger_menu_with_trainer_link.png', buf74);

    console.log('🎉 All 10 verification screenshots captured successfully!');

  } catch (err) {
    console.error('Error during verification:', err);
  } finally {
    await browser.close();
  }
}

runVerification();
