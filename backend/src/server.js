import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/index.js';
import { getDb } from './db/database.js';
import { seedDatabase } from './db/seed.js';

// Import Routes
import kioskRoutes from './routes/kioskRoutes.js';
import memberRoutes from './routes/memberRoutes.js';
import planRoutes from './routes/planRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import revenueRoutes from './routes/revenueRoutes.js';
import expiryRoutes from './routes/expiryRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import posRoutes from './routes/posRoutes.js';
import lockerRoutes from './routes/lockerRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import settingRoutes from './routes/settingRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import trainerRoutes from './routes/trainerRoutes.js';
import platformRoutes from './routes/platformRoutes.js';
import gymRoutes from './routes/gymRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { authenticateToken, enforceGymAuthorization } from './middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(authenticateToken); // Auto-decode JWT token on all incoming requests

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    gym: config.gym.name,
    location: config.gym.location,
    timestamp: new Date().toISOString()
  });
});

// Mount Routes with Multi-Tenant Gym Authorization
app.use('/api/kiosk', enforceGymAuthorization, kioskRoutes);
app.use('/api/members', enforceGymAuthorization, memberRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/leads', enforceGymAuthorization, leadRoutes);
app.use('/api/revenue', enforceGymAuthorization, revenueRoutes);
app.use('/api/expiry', enforceGymAuthorization, expiryRoutes);
app.use('/api/invoices', enforceGymAuthorization, invoiceRoutes);
app.use('/api/pos', enforceGymAuthorization, posRoutes);
app.use('/api/lockers', enforceGymAuthorization, lockerRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/expenses', enforceGymAuthorization, expenseRoutes);
app.use('/api/trainer', enforceGymAuthorization, trainerRoutes);
app.use('/api/platform', platformRoutes);
app.use('/api/gyms', gymRoutes);
app.use('/api/auth', authRoutes);

// Serve static frontend build if dist exists
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');
app.use(express.static(frontendDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(frontendDistPath, 'index.html'), (err) => {
    if (err) {
      next();
    }
  });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Initialize DB and Start Server
async function startServer() {
  try {
    await getDb();
    await seedDatabase();

    const PORT = config.port;
    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 Elite Gym Operating Platform — Backend API Running`);
      console.log(`📍 Facility: ${config.gym.name} (${config.gym.location})`);
      console.log(`🌐 Port: ${PORT}`);
      console.log(`👉 Front Desk Master PIN: ${config.officerMasterPin}`);
      console.log(`=======================================================`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
