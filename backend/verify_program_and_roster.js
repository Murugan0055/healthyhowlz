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
  console.log('🚀 Starting end-to-end verification for Trainer Program Builder & Client Assignment...');
  const tempProfileDir = path.join(os.tmpdir(), `pup_prof_${Date.now()}`);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      `--user-data-dir=${tempProfileDir}`,
      '--window-size=1280,900'
    ]
  });

  const page = await browser.newPage();
  page.on('dialog', async (dialog) => {
    console.log(`[Dialog auto-dismissed]: ${dialog.message()}`);
    await dialog.dismiss();
  });

  try {
    // ------------------------------------------------------------------------------------
    // 1. ADMIN PORTAL: Member Directory & Coach Assignment Dropdowns
    // ------------------------------------------------------------------------------------
    console.log('Navigating to Admin Portal...');
    await page.setViewport({ width: 1280, height: 900 });
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
    await sleep(1000);

    // If login screen is shown, click 1-Tap preset "Fill & Enter ->"
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const loginPreset = btns.find(b => b.textContent.includes('Fill & Enter') || b.textContent.includes('Super Admin'));
      if (loginPreset) loginPreset.click();
    });
    await sleep(1500);

    // Dismiss any open HUD modal or alert if present
    await page.evaluate(() => {
      const dismissBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Dismiss') || b.textContent.includes('Collect Dues'));
      if (dismissBtn) dismissBtn.click();
    });
    await sleep(500);

    // Open Drawer menu and navigate to Members Directory
    console.log('Opening drawer and navigating to Members Directory...');
    await page.evaluate(() => {
      const menuBtn = document.querySelector('button[title="Open Navigation Menu"]') ||
                      Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Menu'));
      if (menuBtn) menuBtn.click();
    });
    await sleep(600);

    await page.evaluate(() => {
      const drawerBtns = Array.from(document.querySelectorAll('button'));
      const memBtn = drawerBtns.find(b => b.textContent.includes('Members Directory'));
      if (memBtn) memBtn.click();
    });
    await sleep(1500);

    console.log('📸 Capturing Screenshot 75: Admin Member Directory with Coach Dropdowns...');
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, '75_admin_member_roster_with_coach_assignment.png'),
      fullPage: false
    });

    // ------------------------------------------------------------------------------------
    // 2. TRAINER APP: Login & Roster Tab with "Assign Client to My Roster" Modal
    // ------------------------------------------------------------------------------------
    console.log('Navigating to Trainer App...');
    await page.setViewport({ width: 430, height: 920, isMobile: true, hasTouch: true });
    await page.goto(`${BASE_URL}/?portal=trainer`, { waitUntil: 'networkidle0' });
    await sleep(1000);

    // Click Murugan S demo login if at login screen
    await page.evaluate(() => {
      const demoBtns = Array.from(document.querySelectorAll('button'));
      const muruganBtn = demoBtns.find(b => b.textContent.includes('Murugan S'));
      if (muruganBtn) muruganBtn.click();
    });
    await sleep(1500);

    // Click "Assign Client to My Roster" button
    console.log('Opening "Assign Client to My Roster" modal...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const assignBtn = btns.find(b => b.textContent.includes('Assign Client to My Roster'));
      if (assignBtn) assignBtn.click();
    });
    await sleep(1200);

    console.log('📸 Capturing Screenshot 76: Trainer App Assign Client Modal...');
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, '76_trainer_app_assign_client_modal.png'),
      fullPage: false
    });

    // Close assign modal
    await page.evaluate(() => {
      const closeBtn = document.querySelector('.modal-overlay button');
      if (closeBtn) closeBtn.click();
    });
    await sleep(600);

    // ------------------------------------------------------------------------------------
    // 3. TRAINER APP: Workout & Diet Builder Tab (Predefined Master Splits)
    // ------------------------------------------------------------------------------------
    console.log('Switching to Program Builder Tab...');
    await page.evaluate(() => {
      const navBtns = Array.from(document.querySelectorAll('button'));
      const builderBtn = navBtns.find(b => b.textContent.trim().includes('Program'));
      if (builderBtn) builderBtn.click();
    });
    await sleep(1500);

    console.log('📸 Capturing Screenshot 77: Trainer App Predefined Master Splits...');
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, '77_trainer_app_predefined_programs_view.png'),
      fullPage: false
    });

    // ------------------------------------------------------------------------------------
    // 4. TRAINER APP: Click "Clone & Customize" to open Custom Program Editor
    // ------------------------------------------------------------------------------------
    console.log('Clicking "Clone & Customize" on PPL Split...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const cloneCustomizeBtn = btns.find(b => b.textContent.includes('Clone & Customize'));
      if (cloneCustomizeBtn) cloneCustomizeBtn.click();
    });
    await sleep(1500);

    console.log('📸 Capturing Screenshot 78: Trainer App Custom Program Editor Table...');
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, '78_trainer_app_custom_split_editor.png'),
      fullPage: false
    });

    console.log('✅ All 4 screenshots captured successfully!');
  } catch (err) {
    console.error('❌ Verification failed:', err);
  } finally {
    await browser.close();
  }
}

runVerification();
