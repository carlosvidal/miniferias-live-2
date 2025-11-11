import express from 'express';
import { getStats } from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = express.Router();

// All admin routes require authentication and ADMIN role
router.use(authenticate);
router.use(requireRole('ADMIN'));

// GET /api/admin/stats
router.get('/stats', getStats);

export default router;
