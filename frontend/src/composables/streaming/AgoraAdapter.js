import { ref } from 'vue';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { IStreamAdapter } from './IStreamAdapter.js';

/**
 * Agora.io streaming adapter
 */
export class AgoraAdapter extends IStreamAdapter {
  constructor() {
    super();
    this.client = ref(null);
    this.localVideoTrack = ref(null);
    this.localAudioTrack = ref(null);
    this.remoteUsers = ref([]);
    this.isJoined = ref(false);
    this.isPublishing = ref(false);
    this.isReadyForEvents = ref(false);
    this.onVideoTrackCallback = null;
  }

  async handleUserPublished(user, mediaType) {
    try {
      await this.client.value.subscribe(user, mediaType);
      console.log(`✅ [Agora] Subscribed to ${mediaType} from user ${user.uid}`);

      if (mediaType === 'video') {
        const remoteUser = this.remoteUsers.value.find(u => u.uid === user.uid);
        if (remoteUser) {
          remoteUser.videoTrack = user.videoTrack;
        } else {
          this.remoteUsers.value.push({
            uid: user.uid,
            videoTrack: user.videoTrack,
            audioTrack: null
          });
        }

        if (this.onVideoTrackCallback) {
          this.onVideoTrackCallback(user.uid, user.videoTrack);
        }
      }

      if (mediaType === 'audio') {
        const remoteUser = this.remoteUsers.value.find(u => u.uid === user.uid);
        if (remoteUser) {
          remoteUser.audioTrack = user.audioTrack;
          user.audioTrack.play();
        } else {
          this.remoteUsers.value.push({
            uid: user.uid,
            videoTrack: null,
            audioTrack: user.audioTrack
          });
          user.audioTrack.play();
        }
        console.log(`🔊 [Agora] Playing audio for user ${user.uid}`);
      }
    } catch (error) {
      console.error('❌ [Agora] Failed to subscribe to user:', error);
    }
  }

  async initClient() {
    if (!this.client.value) {
      AgoraRTC.setLogLevel(3);

      this.client.value = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });

      this.client.value.on('user-published', async (user, mediaType) => {
        if (!this.isReadyForEvents.value) {
          console.log('⏭️ [Agora] Ignoring early user-published event');
          return;
        }
        console.log('📢 [Agora] user-published event:', user.uid, mediaType);
        await this.handleUserPublished(user, mediaType);
      });

      this.client.value.on('user-unpublished', (user, mediaType) => {
        if (mediaType === 'video') {
          const remoteUser = this.remoteUsers.value.find(u => u.uid === user.uid);
          if (remoteUser) {
            remoteUser.videoTrack = null;
          }
        }
      });

      this.client.value.on('user-left', (user) => {
        this.remoteUsers.value = this.remoteUsers.value.filter(u => u.uid !== user.uid);
      });
    }

    return this.client.value;
  }

  async joinChannel(credentials, role = 'audience') {
    try {
      await this.initClient();

      const { appId, channel, token, uid } = credentials;

      await this.client.value.setClientRole(role === 'host' ? 'host' : 'audience');
      await this.client.value.join(appId, channel, token, uid);

      console.log('✅ [Agora] Joined channel:', channel, 'as', role, 'with UID:', uid);

      this.isJoined.value = true;

      setTimeout(async () => {
        const existingRemoteUsers = this.client.value.remoteUsers;
        console.log('🔍 [Agora] Checking for existing remote users...', existingRemoteUsers.length);

        if (existingRemoteUsers && existingRemoteUsers.length > 0) {
          console.log(`📺 [Agora] Found ${existingRemoteUsers.length} remote user(s)`);
          for (const user of existingRemoteUsers) {
            if (user.hasVideo) {
              await this.handleUserPublished(user, 'video');
            }
            if (user.hasAudio) {
              await this.handleUserPublished(user, 'audio');
            }
          }
        }

        this.isReadyForEvents.value = true;
        console.log('✅ [Agora] Ready for user-published events');
      }, 1000);
    } catch (error) {
      console.error('❌ [Agora] Failed to join channel:', error);
      throw error;
    }
  }

  async leaveChannel() {
    if (!this.isJoined.value) {
      console.log('⚠️ [Agora] Already left channel');
      return;
    }

    try {
      this.isReadyForEvents.value = false;
      this.isJoined.value = false;

      if (this.localVideoTrack.value) {
        this.localVideoTrack.value.stop();
        this.localVideoTrack.value.close();
        this.localVideoTrack.value = null;
      }

      if (this.localAudioTrack.value) {
        this.localAudioTrack.value.stop();
        this.localAudioTrack.value.close();
        this.localAudioTrack.value = null;
      }

      if (this.client.value) {
        await this.client.value.leave();
      }

      this.remoteUsers.value = [];
      console.log('✅ [Agora] Left channel');
    } catch (error) {
      console.error('❌ [Agora] Failed to leave channel:', error);
      throw error;
    }
  }

  async startPublishing(videoContainerId) {
    try {
      this.localVideoTrack.value = await AgoraRTC.createCameraVideoTrack();
      this.localAudioTrack.value = await AgoraRTC.createMicrophoneAudioTrack();

      if (videoContainerId) {
        this.localVideoTrack.value.play(videoContainerId);
      }

      await this.client.value.publish([this.localVideoTrack.value, this.localAudioTrack.value]);
      this.isPublishing.value = true;

      console.log('✅ [Agora] Started publishing');
    } catch (error) {
      console.error('❌ [Agora] Failed to start publishing:', error);
      throw error;
    }
  }

  async stopPublishing() {
    try {
      if (this.isPublishing.value) {
        await this.client.value.unpublish([this.localVideoTrack.value, this.localAudioTrack.value]);
        this.isPublishing.value = false;
      }

      if (this.localVideoTrack.value) {
        this.localVideoTrack.value.stop();
        this.localVideoTrack.value.close();
        this.localVideoTrack.value = null;
      }

      if (this.localAudioTrack.value) {
        this.localAudioTrack.value.stop();
        this.localAudioTrack.value.close();
        this.localAudioTrack.value = null;
      }

      console.log('✅ [Agora] Stopped publishing');
    } catch (error) {
      console.error('❌ [Agora] Failed to stop publishing:', error);
      throw error;
    }
  }

  async toggleAudio(mute) {
    if (this.localAudioTrack.value) {
      await this.localAudioTrack.value.setEnabled(!mute);
    }
  }

  async toggleVideo(enabled) {
    if (this.localVideoTrack.value) {
      await this.localVideoTrack.value.setEnabled(enabled);
    }
  }

  async switchCamera() {
    if (this.localVideoTrack.value) {
      await this.localVideoTrack.value.switchDevice();
    }
  }

  setOnVideoTrack(callback) {
    this.onVideoTrackCallback = callback;
  }

  getState() {
    return {
      client: this.client,
      localVideoTrack: this.localVideoTrack,
      localAudioTrack: this.localAudioTrack,
      remoteUsers: this.remoteUsers,
      isJoined: this.isJoined,
      isPublishing: this.isPublishing
    };
  }

  cleanup() {
    this.leaveChannel();
  }
}
