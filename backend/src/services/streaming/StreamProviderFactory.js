import { AgoraProvider } from './AgoraProvider.js';
import { HundredMSProvider } from './HundredMSProvider.js';

/**
 * Factory for creating streaming provider instances
 */
export class StreamProviderFactory {
  static providers = {
    AGORA: AgoraProvider,
    HUNDREDMS: HundredMSProvider
  };

  /**
   * Create a streaming provider instance
   * @param {string} providerName - Provider name (AGORA, HUNDREDMS)
   * @returns {IStreamProvider} Provider instance
   */
  static createProvider(providerName) {
    const ProviderClass = this.providers[providerName?.toUpperCase()];

    if (!ProviderClass) {
      throw new Error(`Unknown streaming provider: ${providerName}`);
    }

    return new ProviderClass();
  }

  /**
   * Get all available providers
   * @returns {string[]} Array of provider names
   */
  static getAvailableProviders() {
    return Object.keys(this.providers);
  }

  /**
   * Check if a provider is available
   * @param {string} providerName - Provider name
   * @returns {boolean} True if provider exists
   */
  static isProviderAvailable(providerName) {
    return providerName?.toUpperCase() in this.providers;
  }
}
