/**
 * Interface for streaming service providers (Agora, 100ms, etc.)
 * All streaming providers must implement this interface
 */
export class IStreamProvider {
  /**
   * Generate an authentication token for joining a stream
   * @param {string} channelName - Name of the channel/room
   * @param {number} uid - User ID
   * @param {string} role - User role ('host' or 'audience')
   * @returns {Promise<Object>} Token data including token, appId, channel, etc.
   */
  async generateToken(channelName, uid, role = 'audience') {
    throw new Error('Method generateToken() must be implemented');
  }

  /**
   * Create or configure a streaming channel/room
   * @param {string} channelName - Name of the channel/room
   * @param {Object} options - Provider-specific options
   * @returns {Promise<Object>} Channel configuration
   */
  async createChannel(channelName, options = {}) {
    throw new Error('Method createChannel() must be implemented');
  }

  /**
   * Get information about a channel/room
   * @param {string} channelName - Name of the channel/room
   * @returns {Promise<Object>} Channel information
   */
  async getChannelInfo(channelName) {
    throw new Error('Method getChannelInfo() must be implemented');
  }

  /**
   * End a streaming channel/room
   * @param {string} channelName - Name of the channel/room
   * @returns {Promise<void>}
   */
  async endChannel(channelName) {
    throw new Error('Method endChannel() must be implemented');
  }

  /**
   * Get pricing information for this provider
   * @returns {Object} Pricing structure
   */
  getPricing() {
    throw new Error('Method getPricing() must be implemented');
  }

  /**
   * Calculate cost estimate based on usage
   * @param {Object} params - Usage parameters
   * @param {number} params.peakConcurrentUsers - Peak concurrent users
   * @param {number} params.durationMinutes - Total duration in minutes
   * @param {number} params.numberOfBooths - Number of booths/channels
   * @returns {Object} Cost estimate breakdown
   */
  calculateCost(params) {
    throw new Error('Method calculateCost() must be implemented');
  }

  /**
   * Get the provider name
   * @returns {string} Provider name
   */
  getName() {
    throw new Error('Method getName() must be implemented');
  }
}
