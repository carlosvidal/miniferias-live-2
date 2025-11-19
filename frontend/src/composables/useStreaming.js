import { onUnmounted } from 'vue';
import { StreamAdapterFactory } from './streaming/StreamAdapterFactory.js';

/**
 * Composable for streaming with multiple providers (Agora, 100ms, etc.)
 * @param {string} provider - Provider name (default: 'agora')
 * @returns {Object} Streaming methods and reactive state
 */
export function useStreaming(provider = 'agora') {
  // Create adapter based on provider
  const adapter = StreamAdapterFactory.createAdapter(provider);

  // Cleanup on unmount
  onUnmounted(() => {
    adapter.cleanup();
  });

  // Get reactive state from adapter
  const state = adapter.getState();

  return {
    // Reactive state
    ...state,

    // Methods
    initClient: () => adapter.initClient(),
    joinChannel: (credentials, role) => adapter.joinChannel(credentials, role),
    leaveChannel: () => adapter.leaveChannel(),
    startPublishing: (videoContainerId) => adapter.startPublishing(videoContainerId),
    stopPublishing: () => adapter.stopPublishing(),
    toggleAudio: (mute) => adapter.toggleAudio(mute),
    toggleVideo: (enabled) => adapter.toggleVideo(enabled),
    switchCamera: () => adapter.switchCamera(),
    setOnVideoTrack: (callback) => adapter.setOnVideoTrack(callback)
  };
}
