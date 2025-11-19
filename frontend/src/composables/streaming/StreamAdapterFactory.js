import { AgoraAdapter } from './AgoraAdapter.js';
import { HundredMSAdapter } from './HundredMSAdapter.js';

/**
 * Factory for creating streaming adapter instances
 */
export class StreamAdapterFactory {
  static adapters = {
    AGORA: AgoraAdapter,
    agora: AgoraAdapter,
    HUNDREDMS: HundredMSAdapter,
    '100ms': HundredMSAdapter,
    hundredms: HundredMSAdapter
  };

  /**
   * Create a streaming adapter instance
   * @param {string} provider - Provider name (AGORA, HUNDREDMS, etc.)
   * @returns {IStreamAdapter} Adapter instance
   */
  static createAdapter(provider) {
    const normalizedProvider = provider?.toUpperCase();
    const AdapterClass = this.adapters[provider] || this.adapters[normalizedProvider];

    if (!AdapterClass) {
      console.error(`Unknown streaming provider: ${provider}, defaulting to Agora`);
      return new AgoraAdapter();
    }

    return new AdapterClass();
  }

  /**
   * Check if a provider is available
   * @param {string} provider - Provider name
   * @returns {boolean} True if provider exists
   */
  static isProviderAvailable(provider) {
    return provider?.toUpperCase() in this.adapters || provider in this.adapters;
  }
}
