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

  try {
    // 1. Clear any stored auth to test Login Screen
    await page.goto('http://localhost:5000', { waitUntil: 'networkidle2' });
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload({ waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 800));

    // Capture Login Page
    await snap('20_admin_login_page');

    // 2. Perform Login as Super Admin
    const superAdminBtn = await page.$('button ::-p-text(Super Admin)');
    if (superAdminBtn) {
      await superAdminBtn.click();
      await new Promise((r) => setTimeout(r, 1200));
    }

    // 3. Navigate to Staff & Roles (User Management)
    const usersTab = await page.$('nav button ::-p-text(Staff & Roles)');
    if (usersTab) {
      await usersTab.click();
      await new Promise((r) => setTimeout(r, 800));
      await snap('21_user_management_roster');

      // Open Create New User Modal
      const createBtn = await page.$('button ::-p-text(Create Admin / Staff User)');
      if (createBtn) {
        await createBtn.click();
        await new Promise((r) => setTimeout(r, 600));
        await snap('22_create_user_modal_roles');

        // Fill Form
        await page.type('input[placeholder*="Suresh Kumar"]', 'Ramesh Sundaram');
        await page.select('select', 'manager');
        await page.type('input[placeholder*="10-digit number"]', '9840199123');
        await page.type('input[placeholder*="staff@elitegym.com"]', 'ramesh.manager@elitegym.com');
        await page.type('input[placeholder*="Min 6 characters"]', 'manager123');
        
        // PIN input
        const pinInput = await page.$('input[placeholder*="5678"]');
        if (pinInput) {
          await pinInput.click({ clickCount: 3 });
          await pinInput.type('4444');
        }

        await new Promise((r) => setTimeout(r, 400));
        await snap('23_create_user_filled_form');

        // Submit creation
        const submitBtn = await page.$('button ::-p-text(Create User & Authorize)');
        if (submitBtn) {
          page.on('dialog', async (dialog) => {
            console.log('Dialog:', dialog.message());
            await dialog.accept();
          });
          await submitBtn.click();
          await new Promise((r) => setTimeout(r, 1000));
          await snap('24_user_roster_with_new_manager');
        }
      }
    }

    console.log('🎉 AUTH & USER CREATION SCREENSHOTS COMPLETE!');
  } catch (err) {
    console.error('Auth test error:', err);
  } finally {
    await browser.close();
  }
}

run();

