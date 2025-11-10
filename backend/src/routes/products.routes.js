import express from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByBooth
} from '../controllers/products.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createProductSchema, updateProductSchema } from '../utils/validators.js';

const router = express.Router();

// Public routes
router.get('/', optionalAuth, getProducts);
router.get('/:id', optionalAuth, getProductById);
router.get('/booth/:boothId', optionalAuth, getProductsByBooth);

// Authenticated routes
router.post('/', authenticate, validate(createProductSchema), createProduct);
router.put('/:id', authenticate, validate(updateProductSchema), updateProduct);
router.delete('/:id', authenticate, deleteProduct);

export default router;
