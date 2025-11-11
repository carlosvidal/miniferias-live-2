import express from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getMyOrders
} from '../controllers/orders.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createOrderSchema, updateOrderStatusSchema } from '../utils/validators.js';

const router = express.Router();

// All routes require authentication
router.post('/', authenticate, validate(createOrderSchema), createOrder);
router.get('/', authenticate, getOrders);
router.get('/me', authenticate, getMyOrders);
router.get('/:id', authenticate, getOrderById);
router.put('/:id/status', authenticate, validate(updateOrderStatusSchema), updateOrderStatus);

export default router;
