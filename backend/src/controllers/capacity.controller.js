import { CapacityService } from '../services/capacity.service.js';
import { StreamProviderFactory } from '../services/streaming/StreamProviderFactory.js';

/**
 * Calculate cost estimate based on parameters
 * POST /api/capacity/estimate
 */
export async function calculateCostEstimate(req, res) {
  try {
    const {
      provider,
      peakConcurrentUsers,
      durationMinutes,
      numberOfBooths,
      options = {}
    } = req.body;

    // Validate required fields
    if (!provider) {
      return res.status(400).json({ error: 'Provider is required' });
    }

    if (!peakConcurrentUsers || !durationMinutes || !numberOfBooths) {
      return res.status(400).json({
        error: 'peakConcurrentUsers, durationMinutes, and numberOfBooths are required'
      });
    }

    const estimate = CapacityService.calculateCostEstimate({
      provider,
      peakConcurrentUsers,
      durationMinutes,
      numberOfBooths,
      options
    });

    res.json(estimate);
  } catch (error) {
    console.error('Calculate cost estimate error:', error);
    res.status(500).json({ error: 'Failed to calculate cost estimate' });
  }
}

/**
 * Calculate maximum capacity from budget
 * POST /api/capacity/from-budget
 */
export async function calculateCapacityFromBudget(req, res) {
  try {
    const {
      provider,
      budget,
      durationMinutes,
      numberOfBooths,
      options = {}
    } = req.body;

    // Validate required fields
    if (!provider || !budget || !durationMinutes || !numberOfBooths) {
      return res.status(400).json({
        error: 'provider, budget, durationMinutes, and numberOfBooths are required'
      });
    }

    const capacity = CapacityService.calculateCapacityFromBudget({
      provider,
      budget,
      durationMinutes,
      numberOfBooths,
      options
    });

    res.json(capacity);
  } catch (error) {
    console.error('Calculate capacity from budget error:', error);
    res.status(500).json({ error: 'Failed to calculate capacity' });
  }
}

/**
 * Compare providers
 * POST /api/capacity/compare
 */
export async function compareProviders(req, res) {
  try {
    const {
      peakConcurrentUsers,
      durationMinutes,
      numberOfBooths,
      options = {}
    } = req.body;

    // Validate required fields
    if (!peakConcurrentUsers || !durationMinutes || !numberOfBooths) {
      return res.status(400).json({
        error: 'peakConcurrentUsers, durationMinutes, and numberOfBooths are required'
      });
    }

    const comparison = CapacityService.compareProviders({
      peakConcurrentUsers,
      durationMinutes,
      numberOfBooths,
      options
    });

    res.json(comparison);
  } catch (error) {
    console.error('Compare providers error:', error);
    res.status(500).json({ error: 'Failed to compare providers' });
  }
}

/**
 * Get provider pricing information
 * GET /api/capacity/pricing/:provider
 */
export async function getProviderPricing(req, res) {
  try {
    const { provider } = req.params;

    if (!provider) {
      return res.status(400).json({ error: 'Provider is required' });
    }

    const streamProvider = StreamProviderFactory.createProvider(provider);
    const pricing = streamProvider.getPricing();

    res.json(pricing);
  } catch (error) {
    console.error('Get provider pricing error:', error);
    res.status(500).json({ error: 'Failed to get provider pricing' });
  }
}

/**
 * Get all available providers
 * GET /api/capacity/providers
 */
export async function getAvailableProviders(req, res) {
  try {
    const providers = StreamProviderFactory.getAvailableProviders();

    // Get pricing for all providers
    const providersWithPricing = providers.map(providerName => {
      try {
        const provider = StreamProviderFactory.createProvider(providerName);
        const pricing = provider.getPricing();
        return {
          name: providerName,
          displayName: providerName.charAt(0) + providerName.slice(1).toLowerCase(),
          pricing
        };
      } catch (error) {
        return {
          name: providerName,
          displayName: providerName,
          error: 'Failed to load pricing'
        };
      }
    });

    res.json(providersWithPricing);
  } catch (error) {
    console.error('Get available providers error:', error);
    res.status(500).json({ error: 'Failed to get available providers' });
  }
}

/**
 * Calculate optimal booth distribution
 * POST /api/capacity/optimal-distribution
 */
export async function calculateOptimalDistribution(req, res) {
  try {
    const {
      provider,
      budget,
      durationMinutes,
      estimatedPeakViewers,
      options = {}
    } = req.body;

    // Validate required fields
    if (!provider || !budget || !durationMinutes || !estimatedPeakViewers) {
      return res.status(400).json({
        error: 'provider, budget, durationMinutes, and estimatedPeakViewers are required'
      });
    }

    const distribution = CapacityService.calculateOptimalDistribution({
      provider,
      budget,
      durationMinutes,
      estimatedPeakViewers,
      options
    });

    res.json(distribution);
  } catch (error) {
    console.error('Calculate optimal distribution error:', error);
    res.status(500).json({ error: 'Failed to calculate optimal distribution' });
  }
}
