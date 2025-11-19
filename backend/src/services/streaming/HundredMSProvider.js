import dotenv from 'dotenv';
import { IStreamProvider } from './IStreamProvider.js';
import jwt from 'jsonwebtoken';

dotenv.config();

/**
 * 100ms.live streaming provider implementation
 * Docs: https://www.100ms.live/docs
 */
export class HundredMSProvider extends IStreamProvider {
  constructor() {
    super();
    this.appAccessKey = process.env.HUNDREDMS_ACCESS_KEY;
    this.appSecret = process.env.HUNDREDMS_APP_SECRET;
    this.templateId = process.env.HUNDREDMS_TEMPLATE_ID; // Room template ID
    this.subdomain = process.env.HUNDREDMS_SUBDOMAIN; // Account subdomain

    if (!this.appAccessKey || !this.appSecret) {
      console.warn('Warning: 100ms credentials not configured');
    }
  }

  /**
   * Generate 100ms authentication token (JWT)
   * Docs: https://www.100ms.live/docs/server-side/v2/introduction/authentication-and-tokens
   */
  async generateToken(channelName, uid, role = 'audience') {
    if (!this.appAccessKey || !this.appSecret) {
      throw new Error('100ms credentials not configured');
    }

    const expirationTimeInSeconds = 3600; // 1 hour
    const currentTimestamp = Math.floor(Date.now() / 1000);

    // 100ms uses different role naming
    const hundredMsRole = role === 'host' ? 'broadcaster' : 'viewer';

    // JWT payload for 100ms
    const payload = {
      access_key: this.appAccessKey,
      room_id: channelName,
      user_id: uid.toString(),
      role: hundredMsRole,
      type: 'app',
      version: 2,
      iat: currentTimestamp,
      exp: currentTimestamp + expirationTimeInSeconds,
      nbf: currentTimestamp
    };

    const token = jwt.sign(payload, this.appSecret, {
      algorithm: 'HS256'
    });

    return {
      token,
      roomId: channelName,
      uid,
      role: hundredMsRole,
      expiresAt: currentTimestamp + expirationTimeInSeconds,
      provider: '100ms',
      // 100ms uses subdomain for connection
      subdomain: this.subdomain
    };
  }

  /**
   * Create a 100ms room
   * Requires 100ms Management API
   */
  async createChannel(channelName, options = {}) {
    if (!this.appAccessKey || !this.appSecret) {
      throw new Error('100ms credentials not configured');
    }

    // In production, call 100ms REST API to create room
    // POST https://api.100ms.live/v2/rooms
    /*
    const response = await fetch('https://api.100ms.live/v2/rooms', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${managementToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: channelName,
        template_id: this.templateId,
        ...options
      })
    });
    */

    return {
      roomId: channelName,
      provider: '100ms',
      config: {
        templateId: this.templateId,
        ...options
      }
    };
  }

  /**
   * Get 100ms room information
   */
  async getChannelInfo(channelName) {
    // In production, call 100ms REST API
    // GET https://api.100ms.live/v2/rooms/{room_id}
    return {
      roomId: channelName,
      provider: '100ms',
      active: true
    };
  }

  /**
   * End a 100ms room
   */
  async endChannel(channelName) {
    // In production, call 100ms REST API
    // POST https://api.100ms.live/v2/rooms/{room_id}/end
    return {
      roomId: channelName,
      ended: true
    };
  }

  /**
   * Get 100ms pricing structure
   * Source: https://www.100ms.live/pricing
   */
  getPricing() {
    return {
      provider: '100ms',
      currency: 'USD',
      freeMinutes: 10000, // 10,000 free minutes per month
      tiers: [
        {
          name: 'Free Tier',
          maxMinutes: 10000,
          pricePerMinute: 0
        },
        {
          name: 'Video Minutes',
          pricePerMinute: 0.0099, // $0.99 per 1000 minutes
          description: 'All video quality levels'
        }
      ],
      features: {
        recording: {
          pricePerMinute: 0.004 // $0.40 per 100 minutes
        },
        streaming: {
          pricePerMinute: 0.004 // RTMP streaming
        }
      }
    };
  }

  /**
   * Calculate estimated cost for 100ms
   * @param {Object} params
   * @param {number} params.peakConcurrentUsers - Peak concurrent viewers
   * @param {number} params.durationMinutes - Total event duration in minutes
   * @param {number} params.numberOfBooths - Number of concurrent rooms
   * @param {boolean} params.recording - Whether recording is enabled
   */
  calculateCost(params) {
    const {
      peakConcurrentUsers = 0,
      durationMinutes = 0,
      numberOfBooths = 1,
      recording = false
    } = params;

    const pricing = this.getPricing();

    // Each booth has 1 broadcaster + N viewers
    const broadcasterMinutes = numberOfBooths * durationMinutes;
    const viewerMinutes = peakConcurrentUsers * durationMinutes;
    const totalMinutes = broadcasterMinutes + viewerMinutes;

    // Video pricing (100ms charges same for all quality)
    const pricePerMinute = pricing.tiers[1].pricePerMinute;

    // Calculate cost after free tier
    const billableMinutes = Math.max(0, totalMinutes - pricing.freeMinutes);
    let totalCost = billableMinutes * pricePerMinute;

    // Add recording cost if enabled
    let recordingCost = 0;
    if (recording) {
      const recordingMinutes = numberOfBooths * durationMinutes;
      recordingCost = recordingMinutes * pricing.features.recording.pricePerMinute;
      totalCost += recordingCost;
    }

    return {
      provider: '100ms',
      breakdown: {
        broadcasterMinutes,
        viewerMinutes,
        totalMinutes,
        freeMinutes: Math.min(totalMinutes, pricing.freeMinutes),
        billableMinutes,
        pricePerMinute,
        recording,
        recordingMinutes: recording ? numberOfBooths * durationMinutes : 0,
        recordingCost
      },
      estimatedCost: totalCost,
      currency: 'USD'
    };
  }

  getName() {
    return '100ms';
  }
}
