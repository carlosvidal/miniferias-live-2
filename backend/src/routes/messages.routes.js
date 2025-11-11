import express from 'express';
import {
  createMessage,
  getMessages,
  deleteMessage,
  getBoothMessages
} from '../controllers/messages.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createMessageSchema } from '../utils/validators.js';

const router = express.Router();

// Public routes (messages are public for viewing)
router.get('/booth/:boothId', optionalAuth, getBoothMessages);
router.get('/:boothId', optionalAuth, getMessages);

// Authenticated routes
router.post('/', authenticate, validate(createMessageSchema), createMessage);
router.delete('/:id', authenticate, deleteMessage);

export default router;
