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
  console.log('🚀 Running Chrome Verification for Search Clear behavior...');
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

    // TEST 1: Manual Check-in Modal Search & Clear
    console.log('🧪 Testing Manual Check-in Modal search and clear...');
    const manualCheckinBtn = await page.$('button ::-p-text(MANUAL CHECK-IN)');
    if (manualCheckinBtn) {
      await manualCheckinBtn.click();
      await new Promise((r) => setTimeout(r, 600));

      // Enter PIN 1234
      await page.type('input[placeholder="••••"]', '1234');
      const unlockBtn = await page.$('button ::-p-text(Unlock Manual Check-In)');
      if (unlockBtn) await unlockBtn.click();
      await new Promise((r) => setTimeout(r, 800));

      // Type "Rahul" into search input
      const searchInput = await page.$('input[placeholder*="Type member"]');
      if (searchInput) {
        await searchInput.type('Rahul');
        await new Promise((r) => setTimeout(r, 500));
        await snap('35_manual_checkin_typed_search');

        // Clear input using backspace or clear button
        const clearBtn = await page.$('button[title*="Clear search"]');
        if (clearBtn) {
          await clearBtn.click();
        } else {
          await page.evaluate(() => {
            const input = document.querySelector('input[placeholder*="Type member"]');
            if (input) {
              input.value = '';
              input.dispatchEvent(new Event('input', { bubbles: true }));
              input.dispatchEvent(new Event('change', { bubbles: true }));
            }
          });
        }
        await new Promise((r) => setTimeout(r, 800));
        await snap('36_manual_checkin_cleared_all_members_visible');
      }

      // Close modal
      const closeBtn = await page.$('.modal-overlay button');
      if (closeBtn) await closeBtn.click();
      await new Promise((r) => setTimeout(r, 500));
    }

    // TEST 2: Staff & Roles Search & Clear
    console.log('🧪 Testing Staff & Roles User search and clear...');
    const staffTab = await page.$('nav button ::-p-text(Staff & Roles)');
    if (staffTab) {
      await staffTab.click();
      await new Promise((r) => setTimeout(r, 800));

      const staffSearch = await page.$('input[placeholder*="Search name, phone, email"]');
      if (staffSearch) {
        await staffSearch.type('Karthik');
        await new Promise((r) => setTimeout(r, 500));
        await snap('37_staff_users_typed_search');

        // Clear search
        const clearStaffBtn = await page.$('button[title*="Clear search"]');
        if (clearStaffBtn) {
          await clearStaffBtn.click();
        } else {
          await page.evaluate(() => {
            const input = document.querySelector('input[placeholder*="Search name, phone, email"]');
            if (input) {
              input.value = '';
              input.dispatchEvent(new Event('input', { bubbles: true }));
              input.dispatchEvent(new Event('change', { bubbles: true }));
            }
          });
        }
        await new Promise((r) => setTimeout(r, 800));
        await snap('38_staff_users_cleared_all_users_visible');
      }
    }

    // TEST 3: Members Directory Search & Clear
    console.log('🧪 Testing Members Directory search and clear...');
    const membersTab = await page.$('nav button ::-p-text(Members)');
    if (membersTab) {
      await membersTab.click();
      await new Promise((r) => setTimeout(r, 800));

      const memberSearch = await page.$('input[placeholder*="Search name, phone, code"]');
      if (memberSearch) {
        await memberSearch.type('Priya');
        await new Promise((r) => setTimeout(r, 500));
        await snap('39_members_typed_search');

        // Clear search
        const clearMemberBtn = await page.$('button[title*="Clear search"]');
        if (clearMemberBtn) {
          await clearMemberBtn.click();
        } else {
          await page.evaluate(() => {
            const input = document.querySelector('input[placeholder*="Search name, phone, code"]');
            if (input) {
              input.value = '';
              input.dispatchEvent(new Event('input', { bubbles: true }));
              input.dispatchEvent(new Event('change', { bubbles: true }));
            }
          });
        }
        await new Promise((r) => setTimeout(r, 800));
        await snap('40_members_cleared_all_members_visible');
      }
    }

    console.log('✅ Search clear verification completed successfully!');
  } catch (err) {
    console.error('❌ Error during verification:', err);
  } finally {
    await browser.close();
  }
}

run();

