import express from 'express';
import {
  calculateCostEstimate,
  calculateCapacityFromBudget,
  compareProviders,
  getProviderPricing,
  getAvailableProviders,
  calculateOptimalDistribution
} from '../controllers/capacity.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// All capacity endpoints are protected (require authentication)
// Only admins and exhibitors should be able to access these for planning

// Get available providers
router.get('/providers', authenticate, getAvailableProviders);

// Get pricing for a specific provider
router.get('/pricing/:provider', authenticate, getProviderPricing);

// Calculate cost estimate
router.post('/estimate', authenticate, calculateCostEstimate);

// Calculate capacity from budget
router.post('/from-budget', authenticate, calculateCapacityFromBudget);

// Compare providers
router.post('/compare', authenticate, compareProviders);

// Calculate optimal booth distribution
router.post('/optimal-distribution', authenticate, calculateOptimalDistribution);

export default router;
