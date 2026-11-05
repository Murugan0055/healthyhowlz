import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';
import os from 'os';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\murug\\.gemini\\antigravity\\brain\\2ef279eb-12eb-4a38-8024-dc4297bb41d3';
const BASE_URL = 'http://127.0.0.1:5000';

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runVerification() {
  console.log('🚀 Starting Mobile & Tablet Responsive Verification for Trainer App...');
  const tempProfileDir = path.join(os.tmpdir(), `pup_prof_${Date.now()}`);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      `--user-data-dir=${tempProfileDir}`,
      '--window-size=430,932'
    ]
  });

  const page = await browser.newPage();
  page.on('dialog', async (dialog) => {
    console.log(`[Dialog]: ${dialog.message()}`);
    await dialog.dismiss();
  });

  try {
    // ------------------------------------------------------------------------------------
    // PART 1: MOBILE VIEWPORT (390 x 844, iPhone 15 Pro standard mobile)
    // ------------------------------------------------------------------------------------
    console.log('📱 Testing Mobile Viewport (390 x 844)...');
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.goto(`${BASE_URL}/?portal=trainer`, { waitUntil: 'networkidle0' });
    await sleep(1000);

    // Click demo login Murugan S
    await page.evaluate(() => {
      const demoBtns = Array.from(document.querySelectorAll('button'));
      const muruganBtn = demoBtns.find(b => b.textContent.includes('Murugan S'));
      if (muruganBtn) muruganBtn.click();
    });
    await sleep(1500);

    // Switch to Program Builder tab
    console.log('Switching to Program tab on Mobile...');
    await page.evaluate(() => {
      const navBtns = Array.from(document.querySelectorAll('button'));
      const progBtn = navBtns.find(b => b.textContent.trim().includes('Program'));
      if (progBtn) progBtn.click();
    });
    await sleep(1200);

    console.log('📸 Screen 79: Mobile - Predefined Master Splits (2x2 Subtabs & Stacked Buttons)');
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, '79_trainer_mobile_program_predefined_splits.png'),
      fullPage: false
    });

    // Click "Clone & Customize" to open Custom Program Editor (NOW WITH CARDS INSTEAD OF TABLE)
    console.log('Clicking "Clone & Customize" to test Responsive Exercise Cards...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const cloneBtn = btns.find(b => b.textContent.includes('Clone & Customize'));
      if (cloneBtn) cloneBtn.click();
    });
    await sleep(1200);

    console.log('📸 Screen 80: Mobile - Custom Program Editor with Exercise Cards (No Table)');
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, '80_trainer_mobile_custom_editor_exercise_cards.png'),
      fullPage: false
    });

    // Scroll down to see exercise cards in detail
    await page.evaluate(() => {
      window.scrollBy(0, 750);
    });
    await sleep(600);

    console.log('📸 Screen 81: Mobile - Custom Exercise Card Fields & Form Cues');
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, '81_trainer_mobile_exercise_card_fields_and_cues.png'),
      fullPage: false
    });

    // Switch to Earnings Tab to verify responsive session cards instead of table
    console.log('Switching to Earnings tab on Mobile...');
    await page.evaluate(() => {
      const navBtns = Array.from(document.querySelectorAll('button'));
      const earnBtn = navBtns.find(b => b.textContent.trim().includes('Earnings'));
      if (earnBtn) earnBtn.click();
    });
    await sleep(1200);

    // Scroll down to see verified session breakdown cards
    await page.evaluate(() => {
      window.scrollBy(0, 400);
    });
    await sleep(600);

    console.log('📸 Screen 82: Mobile - Earnings Session Cards (No Table)');
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, '82_trainer_mobile_earnings_session_cards.png'),
      fullPage: false
    });

    // ------------------------------------------------------------------------------------
    // PART 2: TABLET VIEWPORT (768 x 1024, iPad / Tablet)
    // ------------------------------------------------------------------------------------
    console.log('📱 Testing Tablet Viewport (768 x 1024)...');
    await page.setViewport({ width: 768, height: 1024, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(500);

    // Switch back to Program tab on Tablet
    console.log('Switching to Program tab on Tablet...');
    await page.evaluate(() => {
      const navBtns = Array.from(document.querySelectorAll('button'));
      const progBtn = navBtns.find(b => b.textContent.trim().includes('Program'));
      if (progBtn) progBtn.click();
    });
    await sleep(1200);

    // Switch to Custom Split Editor subtab on Tablet
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const customSubBtn = btns.find(b => b.textContent.includes('Custom Editor'));
      if (customSubBtn) customSubBtn.click();
    });
    await sleep(1000);

    console.log('📸 Screen 83: Tablet - Custom Split Editor Cards Layout');
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, '83_trainer_tablet_custom_editor_cards.png'),
      fullPage: false
    });

    console.log('✅ All mobile & tablet verification screenshots captured successfully!');
  } catch (err) {
    console.error('❌ Verification failed:', err);
  } finally {
    await browser.close();
  }
}

runVerification();
