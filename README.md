# Elite Fitness Center — Operating Platform (App 1: Admin & Owner Portal)

> **Zero External Access Hardware • High-Performance Web Ecosystem**  
> Custom-built for Elite Fitness Center (2,500–3,000 sq. ft. club in Gudiyatham, Tamil Nadu).

---

## 🌟 System Overview & Architecture

### 1. Reception Tablet Attendance & Authentication Engine
* **On-Demand Camera Scanner (`[📷 Scan Member QR]`):**
  * **Zero Hardware Heating:** Camera stays **idle** by default to protect tablet thermals and preserve battery life.
  * Tapping activates client-side fast QR scanning (< 300ms).
  * **Auto-Termination:** Camera instantly shuts down upon successful decode or a 15-second inactivity timeout.
  * **Visual HUD Screens:**
    * 🟢 **Green Screen (`+20 Points Added`)**: Active member verification with photo, days left, and confetti celebration.
    * 🔵 **Blue Screen (`Already Logged Today`)**: Re-entry permitted (0 points credited).
    * 🟡 **Yellow Screen (`Grace Period Active`)**: Permitted under 2-day grace window with payment overdue banner.
    * 🔴 **Red Screen (`Access Blocked`)**: Plan expired or account frozen with 1-click `[Renew Now]` / `[Collect Dues]`.
* **Protected Manual Check-In (`[🔍 Manual Check-In]`):**
  * Front Officer Security Gate: Requires **4-Digit Officer PIN** (`1234`) or Master PIN (`9999`) to block unauthorized or proxy buddy check-ins.
  * Search by member name or last 4 digits of mobile number.
  * Displays member's uploaded **ID Photo** for visual face verification at the desk.
  * Full audit trail logging: `manual_checkin_by: staff_id`.

### 2. Sales CRM & Lead Conversion Pipeline
* **Visual Kanban Board:** Stages: *New Inquiry → Call Scheduled → Free Trial Booked → Trial Attended → Price Negotiation → Closed Won / Closed Lost*.
* **Speed-to-Lead Urgency Tags:**
  * 🟢 Green: `< 2 hours` fresh
  * 🟡 Amber: `2–24 hours` pending
  * 🔴 Red: `> 24 hours` overdue for follow-up
* **WhatsApp VIP Guest Pass:** Quick 15s lead capture generates branded 1-day guest pass with 1-click WhatsApp message dispatch.
* **Lost Lead Win-Back Campaigns:** Filters trial visitors from last 30/60/90 days with 1-click WhatsApp promo offer (500 bonus credits + zero joining fee).
* **Staff Sales Performance:** Live conversion rates and sales commission calculations.

### 3. Revenue Intelligence & Financial Dashboard
* **Real-Time Counters:** Today's Collections, Month-to-Date (MTD), Year-to-Date (YTD).
* **Payment Method Breakdown:** UPI (PhonePe, GPay), Cash in Drawer, Card Swipes, Net Banking.
* **Cash-in-Drawer EOD Reconciliation:** Front-desk shift cash submission with automatic variance calculation (Shortage/Surplus/Balanced) and owner audit history.
* **Projected Cash Flow & Renewal Forecast:** Upcoming renewals grouped by 7, 14, and 30 days with expected renewal revenue in ₹.
* **ARPM & Auxiliary Yields:** Average Revenue Per Member across memberships, retail POS, locker rentals, and PT packs.

### 4. Expiry Interception & Automated Renewals
* **3-Tier Expiry Notification Engine:**
  * **Tier 1 (7 Days Out):** Early bird incentive (+200 bonus loyalty credits on renewal).
  * **Tier 2 (3 Days Out):** Urgent WhatsApp reminder with direct UPI payment link (`upi://pay?pa=...`).
  * **Tier 3 (0 to -2 Days):** Day of expiry & grace period notice.
* **Membership Freeze Rules:** Pause memberships with annual quota tracking (up to 30 days/yr) and automatic forward shifting of expiry dates upon unfreeze.

### 5. Retail POS & Visual Locker Grid
* **Retail POS:** Tap-to-add checkout for protein shakes, BCAA drinks, tees, and shakers with automatic 18% GST tax handling and stock decrement.
* **Visual Locker Grid:** 24 lockers across Men Floor, Women Floor, and VIP with status mapping (Available, Occupied) synchronized with membership validity.

### 6. GST Invoicing & Taxation
* Audit-ready B2C and B2B GST tax invoices with CGST (9%) and SGST (9%), Gudiyatham facility address, GSTIN, and printable / PDF receipts.

---

## 🚀 Quick Start Guide

### Default Security Credentials:
* **Front Desk Officer Master PIN:** `1234` (Officer Priya V)
* **Owner Master PIN:** `9999` (Owner Karthik Raja)
* **Gym Facility:** Elite Fitness Center, Gudiyatham, Tamil Nadu
* **Gym GSTIN:** `33AAAAE1234M1Z5`

### 1. Run the Full Stack (Single Command):
```bash
# Start backend API & pre-built React application on port 5000:
npm start
```
Open your browser at **`http://localhost:5000`**

### 2. Development Mode (Separate Watchers):
```bash
# Backend (Port 5000):
npm run dev:backend

# Frontend (Port 3000 with hot-reload & proxy to 5000):
npm run dev:frontend
```

---

## 📦 Hostinger VPS Deployment Blueprint

1. **Upload Code to VPS:** Clone or copy repo to `/var/www/elite-gym`.
2. **Build Frontend:**
   ```bash
   cd frontend && npm install && npm run build
   ```
3. **Start Node Backend via PM2:**
   ```bash
   cd ../backend && npm install
   pm2 start src/server.js --name "elite-gym-app"
   pm2 save
   ```
4. **Nginx Reverse Proxy Configuration (`/etc/nginx/sites-available/elitegym.conf`):**
   ```nginx
   server {
       listen 80;
       server_name gym.elitegymgudiyatham.com;

       location / {
           proxy_pass http://127.0.0.1:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
5. **SSL via Certbot:**
   ```bash
   sudo certbot --nginx -d gym.elitegymgudiyatham.com
   ```

