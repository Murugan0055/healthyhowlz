#!/bin/bash
# ==============================================================================
# HealthyHowlz Multi-Tenant Fitness OS — Automated 1-Click Production Deploy
# Target Environment: Hostinger VPS (Ubuntu 20.04 / 22.04 / Debian 11/12)
# ==============================================================================

set -e # Exit immediately if a command exits with a non-zero status

APP_DIR="/var/www/healthyhowlz"
BRANCH="main"

echo "=========================================================="
echo "🚀 Starting HealthyHowlz Production Deployment on Hostinger VPS"
echo "📅 $(date)"
echo "=========================================================="

# 1. Navigate to Application Directory
if [ ! -d "$APP_DIR" ]; then
  echo "❌ Error: Application directory $APP_DIR does not exist."
  echo "👉 Please clone your repository first:"
  echo "   git clone <your-git-repo-url> /var/www/healthyhowlz"
  exit 1
fi

cd "$APP_DIR"

# 2. Pull Latest Commits from Git
echo "📥 Pulling latest commits from git ($BRANCH)..."
git fetch --all
git reset --hard "origin/$BRANCH"

# 3. Create Required Logs & Database Directories
mkdir -p "$APP_DIR/logs"
mkdir -p "$APP_DIR/backend/uploads"

# 4. Install Dependencies
echo "📦 Installing root & backend dependencies..."
npm install --omit=dev --prefix backend

echo "📦 Installing frontend build dependencies..."
npm install --prefix frontend

# 5. Build High-Performance Production Frontend Bundle
echo "⚡ Building frontend with Vite..."
npm run build --prefix frontend

# 6. Run Database Sync & Migrations
echo "🌱 Syncing SQLite Database and Multi-Tenant Schema..."
node backend/src/db/seed.js

# 7. Restart Backend Process via PM2
echo "🔄 Reloading Node.js processes with PM2..."
if pm2 list | grep -q "healthyhowlz-backend"; then
  pm2 reload ecosystem.config.cjs --env production
else
  pm2 start ecosystem.config.cjs --env production
  pm2 save
fi

# 8. Reload Nginx (Optional check)
if command -v nginx &> /dev/null; then
  echo "🌐 Testing and reloading Nginx configuration..."
  nginx -t && systemctl reload nginx
fi

# 9. Verify Server Health
echo "🩺 Performing health verification check..."
sleep 2
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5000/api/health || echo "failed")

if [ "$HEALTH_STATUS" = "200" ]; then
  echo "=========================================================="
  echo "🎉 Deployment Succeeded! HealthyHowlz is LIVE on your VPS."
  echo "🌐 Health Status: HTTP 200 OK"
  echo "=========================================================="
else
  echo "⚠️ Warning: Health check returned status $HEALTH_STATUS. Check PM2 logs:"
  echo "   pm2 logs healthyhowlz-backend --lines 50"
fi

