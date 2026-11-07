import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { getDb } from '../db/database.js';
import { getTenantGymId } from './tenant.js';

/**
 * Extracts and verifies JWT from Authorization header
 */
export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : req.headers['x-auth-token'];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch (err) {
    req.user = null;
    next();
  }
}

/**
 * Strict authentication guard
 */
export function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized: Authentication token is missing or expired.' });
  }
  next();
}

/**
 * Role-based authorization guard
 */
export function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Forbidden: User role '${req.user.role}' is not authorized for this action.` });
    }
    next();
  };
}

/**
 * Multi-Tenant Gym Isolation Guard
 * Guarantees that:
 * - Super Admins can access any facility
 * - Gym Owners can ONLY access facilities they own
 * - Branch Managers / Admins / Trainers / Members can ONLY access their assigned facility
 */
export async function enforceGymAuthorization(req, res, next) {
  // If user is not authenticated yet, let downstream route handle or reject
  if (!req.user) {
    return next();
  }

  // 1. Super Admin has unrestricted SaaS global access
  if (req.user.role === 'super_admin' || req.user.role === 'platform_admin' || req.user.app === 'platform') {
    return next();
  }

  const requestedGymId = getTenantGymId(req);

  // 2. Gym Owner: check if requested gym is owned by this owner
  if (req.user.role === 'owner') {
    try {
      const db = await getDb();
      const gym = await db.get('SELECT owner_id FROM gyms WHERE id = ?', [requestedGymId]);
      if (gym && gym.owner_id === req.user.id) {
        return next();
      }
      return res.status(403).json({
        error: `Forbidden: You do not have ownership access to facility '${requestedGymId}'.`,
        code: 'FORBIDDEN_CROSS_GYM_ACCESS'
      });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to verify gym ownership permissions.' });
    }
  }

  // 3. Manager, Front Desk Admin, Trainer, Member: Must match their assigned gym
  if (req.user.gym_id && req.user.gym_id !== requestedGymId) {
    return res.status(403).json({
      error: `Forbidden: Your account belongs to facility '${req.user.gym_id}'. You cannot view or modify data for '${requestedGymId}'.`,
      code: 'FORBIDDEN_FACILITY_MISMATCH'
    });
  }

  next();
}
