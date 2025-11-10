import express from 'express';
import {
  createBooth,
  getBooths,
  getBoothById,
  updateBooth,
  deleteBooth,
  getMyBooth,
  startStreaming,
  stopStreaming,
  getStreamToken
} from '../controllers/booths.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.middleware.js';
import { requireAdmin, requireExhibitor } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createBoothSchema, updateBoothSchema } from '../utils/validators.js';

const router = express.Router();

// Public routes
router.get('/', optionalAuth, getBooths);
router.get('/:id', optionalAuth, getBoothById);
router.get('/:id/stream-token', optionalAuth, getStreamToken);

// Exhibitor routes
router.get('/me/booth', authenticate, requireExhibitor, getMyBooth);
router.put('/:id', authenticate, validate(updateBoothSchema), updateBooth);
router.post('/:id/stream/start', authenticate, startStreaming);
router.post('/:id/stream/stop', authenticate, stopStreaming);

// Admin only routes
router.post('/', authenticate, requireAdmin, validate(createBoothSchema), createBooth);
router.delete('/:id', authenticate, requireAdmin, deleteBooth);

export default router;
