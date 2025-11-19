/**
 * Interface for frontend streaming adapters
 * Each provider (Agora, 100ms) must implement this interface
 */
export class IStreamAdapter {
  /**
   * Initialize the streaming client
   * @returns {Promise<Object>} Initialized client
   */
  async initClient() {
    throw new Error('Method initClient() must be implemented');
  }

  /**
   * Join a streaming channel/room
   * @param {Object} credentials - Connection credentials from backend
   * @param {string} role - User role ('host' or 'audience')
   * @returns {Promise<void>}
   */
  async joinChannel(credentials, role) {
    throw new Error('Method joinChannel() must be implemented');
  }

  /**
   * Leave the current channel/room
   * @returns {Promise<void>}
   */
  async leaveChannel() {
    throw new Error('Method leaveChannel() must be implemented');
  }

  /**
   * Start publishing local media (host only)
   * @param {string} videoContainerId - DOM element ID for local video
   * @returns {Promise<void>}
   */
  async startPublishing(videoContainerId) {
    throw new Error('Method startPublishing() must be implemented');
  }

  /**
   * Stop publishing local media
   * @returns {Promise<void>}
   */
  async stopPublishing() {
    throw new Error('Method stopPublishing() must be implemented');
  }

  /**
   * Toggle audio on/off
   * @param {boolean} mute - True to mute, false to unmute
   * @returns {Promise<void>}
   */
  async toggleAudio(mute) {
    throw new Error('Method toggleAudio() must be implemented');
  }

  /**
   * Toggle video on/off
   * @param {boolean} enabled - True to enable, false to disable
   * @returns {Promise<void>}
   */
  async toggleVideo(enabled) {
    throw new Error('Method toggleVideo() must be implemented');
  }

  /**
   * Switch camera (front/back on mobile)
   * @returns {Promise<void>}
   */
  async switchCamera() {
    throw new Error('Method switchCamera() must be implemented');
  }

  /**
   * Set callback for when remote video track is ready
   * @param {Function} callback - Callback function
   */
  setOnVideoTrack(callback) {
    throw new Error('Method setOnVideoTrack() must be implemented');
  }

  /**
   * Get reactive state
   * @returns {Object} Reactive state object
   */
  getState() {
    throw new Error('Method getState() must be implemented');
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    throw new Error('Method cleanup() must be implemented');
  }
}
