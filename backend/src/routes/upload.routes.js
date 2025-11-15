import express from 'express';
import {
  uploadAvatar,
  uploadLogo,
  uploadCover,
  uploadProductImage,
  uploadProductImages,
  uploadPaymentProof,
  deleteUploadedImage,
  getImageUrlByVariant
} from '../controllers/upload.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.middleware.js';
import { requireExhibitor } from '../middleware/role.middleware.js';
import {
  uploadSingle,
  uploadMultiple,
  handleUploadError
} from '../middleware/upload.middleware.js';

const router = express.Router();

/**
 * @route   POST /api/upload/avatar
 * @desc    Upload avatar image (profile picture)
 * @access  Private
 */
router.post(
  '/avatar',
  authenticate,
  uploadSingle('avatar'),
  handleUploadError,
  uploadAvatar
);

/**
 * @route   POST /api/upload/logo
 * @desc    Upload booth logo
 * @access  Private (Exhibitor)
 */
router.post(
  '/logo',
  authenticate,
  requireExhibitor,
  uploadSingle('logo'),
  handleUploadError,
  uploadLogo
);

/**
 * @route   POST /api/upload/cover
 * @desc    Upload cover image (event or booth banner)
 * @access  Private (Exhibitor for booths, Admin for events)
 */
router.post(
  '/cover',
  authenticate,
  uploadSingle('cover'),
  handleUploadError,
  uploadCover
);

/**
 * @route   POST /api/upload/product
 * @desc    Upload single product image
 * @access  Private (Exhibitor)
 */
router.post(
  '/product',
  authenticate,
  requireExhibitor,
  uploadSingle('product'),
  handleUploadError,
  uploadProductImage
);

/**
 * @route   POST /api/upload/products
 * @desc    Upload multiple product images
 * @access  Private (Exhibitor)
 */
router.post(
  '/products',
  authenticate,
  requireExhibitor,
  uploadMultiple('products', 5),
  handleUploadError,
  uploadProductImages
);

/**
 * @route   POST /api/upload/payment-proof
 * @desc    Upload payment proof screenshot
 * @access  Public (with optional auth for tracking)
 */
router.post(
  '/payment-proof',
  optionalAuth,
  uploadSingle('paymentProof'),
  handleUploadError,
  uploadPaymentProof
);

/**
 * @route   DELETE /api/upload/:imageId
 * @desc    Delete an uploaded image
 * @access  Private
 */
router.delete(
  '/:imageId',
  authenticate,
  deleteUploadedImage
);

/**
 * @route   GET /api/upload/url/:imageId/:variant
 * @desc    Get image URL with specific variant
 * @access  Public
 */
router.get(
  '/url/:imageId/:variant',
  getImageUrlByVariant
);

export default router;
