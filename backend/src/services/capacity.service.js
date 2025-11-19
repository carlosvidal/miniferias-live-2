import { StreamProviderFactory } from './streaming/StreamProviderFactory.js';

/**
 * Service for calculating event capacity and costs
 */
export class CapacityService {
  /**
   * Calculate maximum capacity based on budget
   * @param {Object} params
   * @param {string} params.provider - Streaming provider name
   * @param {number} params.budget - Total budget (USD)
   * @param {number} params.durationMinutes - Event duration in minutes
   * @param {number} params.numberOfBooths - Number of booths
   * @param {Object} params.options - Additional options (quality, recording, etc.)
   * @returns {Object} Capacity breakdown
   */
  static calculateCapacityFromBudget(params) {
    const {
      provider,
      budget,
      durationMinutes,
      numberOfBooths,
      options = {}
    } = params;

    const streamProvider = StreamProviderFactory.createProvider(provider);
    const pricing = streamProvider.getPricing();

    // Binary search to find maximum viewers within budget
    let minViewers = 0;
    let maxViewers = 100000; // Reasonable upper limit
    let optimalViewers = 0;

    while (minViewers <= maxViewers) {
      const midViewers = Math.floor((minViewers + maxViewers) / 2);

      const costEstimate = streamProvider.calculateCost({
        peakConcurrentUsers: midViewers,
        durationMinutes,
        numberOfBooths,
        ...options
      });

      if (costEstimate.estimatedCost <= budget) {
        optimalViewers = midViewers;
        minViewers = midViewers + 1;
      } else {
        maxViewers = midViewers - 1;
      }
    }

    // Calculate final cost with optimal viewers
    const finalCostEstimate = streamProvider.calculateCost({
      peakConcurrentUsers: optimalViewers,
      durationMinutes,
      numberOfBooths,
      ...options
    });

    return {
      provider,
      budget,
      maxConcurrentViewers: optimalViewers,
      numberOfBooths,
      durationMinutes,
      estimatedCost: finalCostEstimate.estimatedCost,
      remainingBudget: budget - finalCostEstimate.estimatedCost,
      breakdown: finalCostEstimate.breakdown,
      utilizationPercentage: (finalCostEstimate.estimatedCost / budget) * 100
    };
  }

  /**
   * Calculate cost based on expected viewers
   * @param {Object} params
   * @param {string} params.provider - Streaming provider name
   * @param {number} params.peakConcurrentUsers - Expected peak viewers
   * @param {number} params.durationMinutes - Event duration in minutes
   * @param {number} params.numberOfBooths - Number of booths
   * @param {Object} params.options - Additional options
   * @returns {Object} Cost estimate
   */
  static calculateCostEstimate(params) {
    const { provider, ...calculationParams } = params;

    const streamProvider = StreamProviderFactory.createProvider(provider);
    const costEstimate = streamProvider.calculateCost(calculationParams);

    return {
      provider,
      ...costEstimate
    };
  }

  /**
   * Compare costs across multiple providers
   * @param {Object} params - Common parameters for all providers
   * @param {number} params.peakConcurrentUsers
   * @param {number} params.durationMinutes
   * @param {number} params.numberOfBooths
   * @param {Object} params.options
   * @returns {Array} Cost comparison for all providers
   */
  static compareProviders(params) {
    const providers = StreamProviderFactory.getAvailableProviders();
    const comparisons = [];

    for (const providerName of providers) {
      try {
        const estimate = this.calculateCostEstimate({
          provider: providerName,
          ...params
        });
        comparisons.push(estimate);
      } catch (error) {
        console.error(`Error calculating cost for ${providerName}:`, error);
      }
    }

    // Sort by cost (cheapest first)
    comparisons.sort((a, b) => a.estimatedCost - b.estimatedCost);

    return comparisons;
  }

  /**
   * Calculate optimal booth distribution within budget
   * @param {Object} params
   * @param {string} params.provider - Streaming provider
   * @param {number} params.budget - Total budget
   * @param {number} params.durationMinutes - Event duration
   * @param {number} params.estimatedPeakViewers - Total expected viewers
   * @param {Object} params.options - Additional options
   * @returns {Object} Optimal distribution
   */
  static calculateOptimalDistribution(params) {
    const {
      provider,
      budget,
      durationMinutes,
      estimatedPeakViewers,
      options = {}
    } = params;

    const streamProvider = StreamProviderFactory.createProvider(provider);

    // Try different booth configurations
    let maxBooths = 0;
    let bestConfig = null;

    for (let booths = 1; booths <= 100; booths++) {
      const viewersPerBooth = Math.floor(estimatedPeakViewers / booths);

      const costEstimate = streamProvider.calculateCost({
        peakConcurrentUsers: estimatedPeakViewers,
        durationMinutes,
        numberOfBooths: booths,
        ...options
      });

      if (costEstimate.estimatedCost <= budget) {
        maxBooths = booths;
        bestConfig = {
          numberOfBooths: booths,
          viewersPerBooth,
          totalViewers: estimatedPeakViewers,
          cost: costEstimate.estimatedCost,
          breakdown: costEstimate.breakdown
        };
      } else {
        break;
      }
    }

    return {
      provider,
      budget,
      maxBooths,
      recommendedConfig: bestConfig,
      remainingBudget: bestConfig ? budget - bestConfig.cost : budget
    };
  }

  /**
   * Validate event configuration against limits
   * @param {Object} event - Event configuration
   * @param {Object} currentUsage - Current usage stats
   * @returns {Object} Validation result
   */
  static validateEventCapacity(event, currentUsage) {
    const warnings = [];
    const errors = [];

    // Check if we're within viewer limits
    if (event.maxConcurrentViewers) {
      if (currentUsage.currentViewers > event.maxConcurrentViewers) {
        errors.push({
          field: 'viewers',
          message: `Current viewers (${currentUsage.currentViewers}) exceeds limit (${event.maxConcurrentViewers})`
        });
      } else if (currentUsage.currentViewers > event.maxConcurrentViewers * 0.9) {
        warnings.push({
          field: 'viewers',
          message: `Approaching viewer limit (${currentUsage.currentViewers}/${event.maxConcurrentViewers})`
        });
      }
    }

    // Check if we're within booth limits
    if (event.maxBooths) {
      if (currentUsage.activeBooths > event.maxBooths) {
        errors.push({
          field: 'booths',
          message: `Active booths (${currentUsage.activeBooths}) exceeds limit (${event.maxBooths})`
        });
      }
    }

    // Check if we're within budget
    if (event.budget && event.estimatedCost) {
      if (event.estimatedCost > event.budget) {
        warnings.push({
          field: 'budget',
          message: `Estimated cost ($${event.estimatedCost}) exceeds budget ($${event.budget})`
        });
      }
    }

    return {
      valid: errors.length === 0,
      warnings,
      errors
    };
  }
}
