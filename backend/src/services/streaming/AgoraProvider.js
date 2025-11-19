import pkg from 'agora-access-token';
const { RtcTokenBuilder, RtcRole } = pkg;
import dotenv from 'dotenv';
import { IStreamProvider } from './IStreamProvider.js';

dotenv.config();

/**
 * Agora.io streaming provider implementation
 */
export class AgoraProvider extends IStreamProvider {
  constructor() {
    super();
    this.appId = process.env.AGORA_APP_ID;
    this.appCertificate = process.env.AGORA_APP_CERTIFICATE;

    if (!this.appId || !this.appCertificate) {
      console.warn('Warning: Agora credentials not configured');
    }
  }

  /**
   * Generate Agora RTC token
   */
  async generateToken(channelName, uid, role = 'audience') {
    if (!this.appId || !this.appCertificate) {
      throw new Error('Agora credentials not configured');
    }

    const expirationTimeInSeconds = 3600; // 1 hour
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    // Convert role to Agora role
    const agoraRole = role === 'host' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

    const token = RtcTokenBuilder.buildTokenWithUid(
      this.appId,
      this.appCertificate,
      channelName,
      uid,
      agoraRole,
      privilegeExpiredTs
    );

    return {
      token,
      appId: this.appId,
      uid,
      channel: channelName,
      expiresAt: privilegeExpiredTs,
      provider: 'agora'
    };
  }

  /**
   * Agora doesn't require explicit channel creation
   * Channels are created on-the-fly when users join
   */
  async createChannel(channelName, options = {}) {
    return {
      channelName,
      provider: 'agora',
      config: {
        codec: options.codec || 'vp8',
        mode: options.mode || 'rtc', // 'rtc' or 'live'
        ...options
      }
    };
  }

  /**
   * Get channel information
   * Note: Agora requires REST API calls to get channel stats
   * This is a placeholder - implement REST API integration if needed
   */
  async getChannelInfo(channelName) {
    // In production, you would call Agora REST API:
    // https://api.agora.io/dev/v1/channel/{appid}/{channelName}
    return {
      channelName,
      provider: 'agora',
      // Would need to implement REST API call for actual data
      active: true
    };
  }

  /**
   * End a channel
   * Note: Agora channels automatically close when all users leave
   */
  async endChannel(channelName) {
    // Agora channels end automatically
    // In production, you might want to call REST API to force close
    return {
      channelName,
      ended: true
    };
  }

  /**
   * Get Agora pricing structure
   * Source: https://www.agora.io/en/pricing/
   */
  getPricing() {
    return {
      provider: 'agora',
      currency: 'USD',
      freeMinutes: 10000, // 10,000 free minutes per month
      tiers: [
        {
          name: 'Free Tier',
          maxMinutes: 10000,
          pricePerMinute: 0
        },
        {
          name: 'HD Video',
          pricePerMinute: 0.0099, // $0.99 per 1000 minutes
          resolution: '720p and below'
        },
        {
          name: 'Full HD Video',
          pricePerMinute: 0.0399, // $3.99 per 1000 minutes
          resolution: '1080p and above'
        }
      ],
      // Audio-only pricing
      audio: {
        pricePerMinute: 0.00099 // $0.99 per 1000 minutes
      }
    };
  }

  /**
   * Calculate estimated cost for Agora
   * @param {Object} params
   * @param {number} params.peakConcurrentUsers - Peak concurrent viewers
   * @param {number} params.durationMinutes - Total event duration in minutes
   * @param {number} params.numberOfBooths - Number of concurrent booths
   * @param {string} params.quality - Video quality: 'hd' or 'fullhd'
   */
  calculateCost(params) {
    const {
      peakConcurrentUsers = 0,
      durationMinutes = 0,
      numberOfBooths = 1,
      quality = 'hd'
    } = params;

    const pricing = this.getPricing();

    // Each booth has 1 publisher + N viewers
    // Total user-minutes = (publishers + viewers) * duration
    const publisherMinutes = numberOfBooths * durationMinutes;
    const viewerMinutes = peakConcurrentUsers * durationMinutes;
    const totalMinutes = publisherMinutes + viewerMinutes;

    // Apply pricing based on quality
    let pricePerMinute;
    if (quality === 'fullhd') {
      pricePerMinute = pricing.tiers[2].pricePerMinute;
    } else {
      pricePerMinute = pricing.tiers[1].pricePerMinute;
    }

    // Calculate cost after free tier
    const billableMinutes = Math.max(0, totalMinutes - pricing.freeMinutes);
    const totalCost = billableMinutes * pricePerMinute;

    return {
      provider: 'agora',
      breakdown: {
        publisherMinutes,
        viewerMinutes,
        totalMinutes,
        freeMinutes: Math.min(totalMinutes, pricing.freeMinutes),
        billableMinutes,
        pricePerMinute,
        quality
      },
      estimatedCost: totalCost,
      currency: 'USD'
    };
  }

  getName() {
    return 'agora';
  }
}
