import express from 'express';
import {
  calculateCostEstimate,
  calculateCapacityFromBudget,
  compareProviders,
  getProviderPricing,
  getAvailableProviders,
  calculateOptimalDistribution
} from '../controllers/capacity.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// All capacity endpoints are protected (require authentication)
// Only admins and exhibitors should be able to access these for planning

// Get available providers
router.get('/providers', authMiddleware, getAvailableProviders);

// Get pricing for a specific provider
router.get('/pricing/:provider', authMiddleware, getProviderPricing);

// Calculate cost estimate
router.post('/estimate', authMiddleware, calculateCostEstimate);

// Calculate capacity from budget
router.post('/from-budget', authMiddleware, calculateCapacityFromBudget);

// Compare providers
router.post('/compare', authMiddleware, compareProviders);

// Calculate optimal booth distribution
router.post('/optimal-distribution', authMiddleware, calculateOptimalDistribution);

export default router;
