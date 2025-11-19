import { ref } from 'vue';
import { IStreamAdapter } from './IStreamAdapter.js';

/**
 * 100ms.live streaming adapter
 * SDK: @100mslive/react-sdk or @100mslive/hms-video-store
 * Docs: https://www.100ms.live/docs/javascript/v2/get-started/javascript-quickstart
 *
 * Note: This is a placeholder implementation. You need to install:
 * npm install @100mslive/hms-video-store
 */
export class HundredMSAdapter extends IStreamAdapter {
  constructor() {
    super();
    this.hmsManager = null;
    this.hmsStore = null;
    this.hmsActions = null;

    this.localVideoTrack = ref(null);
    this.localAudioTrack = ref(null);
    this.remoteUsers = ref([]);
    this.isJoined = ref(false);
    this.isPublishing = ref(false);
    this.onVideoTrackCallback = null;
  }

  async initClient() {
    try {
      // Dynamic import to avoid errors if SDK not installed
      const HMSReactiveStore = await import('@100mslive/hms-video-store').then(m => m.HMSReactiveStore);

      if (!this.hmsManager) {
        this.hmsManager = new HMSReactiveStore();
        this.hmsStore = this.hmsManager.getStore();
        this.hmsActions = this.hmsManager.getActions();

        // Subscribe to store changes
        this.hmsManager.subscribe((state) => {
          this.handleStoreChange(state);
        });

        console.log('✅ [100ms] Client initialized');
      }
    } catch (error) {
      console.error('❌ [100ms] Failed to initialize client. Make sure @100mslive/hms-video-store is installed:', error);
      throw new Error('100ms SDK not installed. Run: npm install @100mslive/hms-video-store');
    }
  }

  handleStoreChange(state) {
    // Update remote peers/tracks
    const remotePeers = state.peers.filter(p => !p.isLocal);
    this.remoteUsers.value = remotePeers.map(peer => ({
      uid: peer.id,
      videoTrack: peer.videoTrack,
      audioTrack: peer.audioTrack,
      peer
    }));

    // Notify callback for video tracks
    if (this.onVideoTrackCallback) {
      remotePeers.forEach(peer => {
        if (peer.videoTrack) {
          this.onVideoTrackCallback(peer.id, peer.videoTrack);
        }
      });
    }
  }

  async joinChannel(credentials, role = 'audience') {
    try {
      await this.initClient();

      const { token, roomId } = credentials;

      // 100ms uses the role from the token (configured in dashboard)
      // Role mapping: 'host' -> 'broadcaster', 'audience' -> 'viewer'
      const userName = `User-${Date.now()}`;

      await this.hmsActions.join({
        authToken: token,
        userName,
        settings: {
          isAudioMuted: false,
          isVideoMuted: false
        }
      });

      this.isJoined.value = true;
      console.log('✅ [100ms] Joined room:', roomId, 'as', role);

      // If host, publishing happens automatically with 100ms
      if (role === 'host') {
        this.isPublishing.value = true;
      }
    } catch (error) {
      console.error('❌ [100ms] Failed to join room:', error);
      throw error;
    }
  }

  async leaveChannel() {
    if (!this.isJoined.value) {
      console.log('⚠️ [100ms] Already left room');
      return;
    }

    try {
      await this.hmsActions.leave();

      this.isJoined.value = false;
      this.isPublishing.value = false;
      this.remoteUsers.value = [];

      console.log('✅ [100ms] Left room');
    } catch (error) {
      console.error('❌ [100ms] Failed to leave room:', error);
      throw error;
    }
  }

  async startPublishing(videoContainerId) {
    try {
      // With 100ms, tracks are published automatically when joining
      // We just need to enable them if they were muted
      await this.hmsActions.setLocalAudioEnabled(true);
      await this.hmsActions.setLocalVideoEnabled(true);

      this.isPublishing.value = true;
      console.log('✅ [100ms] Started publishing');
    } catch (error) {
      console.error('❌ [100ms] Failed to start publishing:', error);
      throw error;
    }
  }

  async stopPublishing() {
    try {
      await this.hmsActions.setLocalAudioEnabled(false);
      await this.hmsActions.setLocalVideoEnabled(false);

      this.isPublishing.value = false;
      console.log('✅ [100ms] Stopped publishing');
    } catch (error) {
      console.error('❌ [100ms] Failed to stop publishing:', error);
      throw error;
    }
  }

  async toggleAudio(mute) {
    try {
      await this.hmsActions.setLocalAudioEnabled(!mute);
    } catch (error) {
      console.error('❌ [100ms] Failed to toggle audio:', error);
    }
  }

  async toggleVideo(enabled) {
    try {
      await this.hmsActions.setLocalVideoEnabled(enabled);
    } catch (error) {
      console.error('❌ [100ms] Failed to toggle video:', error);
    }
  }

  async switchCamera() {
    try {
      const devices = await this.hmsActions.getVideoInputDevices();
      if (devices.length > 1) {
        const currentDevice = await this.hmsActions.getVideoTrack();
        const nextDevice = devices.find(d => d.deviceId !== currentDevice?.deviceId) || devices[0];
        await this.hmsActions.setVideoSettings({
          deviceId: nextDevice.deviceId
        });
      }
    } catch (error) {
      console.error('❌ [100ms] Failed to switch camera:', error);
    }
  }

  setOnVideoTrack(callback) {
    this.onVideoTrackCallback = callback;
  }

  getState() {
    return {
      localVideoTrack: this.localVideoTrack,
      localAudioTrack: this.localAudioTrack,
      remoteUsers: this.remoteUsers,
      isJoined: this.isJoined,
      isPublishing: this.isPublishing,
      hmsStore: this.hmsStore
    };
  }

  cleanup() {
    this.leaveChannel();
  }
}
