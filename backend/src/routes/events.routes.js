import express from 'express';
import {
  createEvent,
  getEvents,
  getEventById,
  getEventBySlug,
  updateEvent,
  deleteEvent,
  getEventStats
} from '../controllers/events.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createEventSchema, updateEventSchema } from '../utils/validators.js';

const router = express.Router();

// Public routes
router.get('/', optionalAuth, getEvents);
router.get('/slug/:slug', optionalAuth, getEventBySlug);
router.get('/:id', optionalAuth, getEventById);

// Admin only routes
router.post('/', authenticate, requireAdmin, validate(createEventSchema), createEvent);
router.put('/:id', authenticate, requireAdmin, validate(updateEventSchema), updateEvent);
router.delete('/:id', authenticate, requireAdmin, deleteEvent);
router.get('/:id/stats', authenticate, requireAdmin, getEventStats);

export default router;
