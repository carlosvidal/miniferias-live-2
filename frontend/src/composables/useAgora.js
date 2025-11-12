import { ref, onUnmounted } from 'vue'
import AgoraRTC from 'agora-rtc-sdk-ng'

export function useAgora() {
  const client = ref(null)
  const localVideoTrack = ref(null)
  const localAudioTrack = ref(null)
  const remoteUsers = ref([])
  const isJoined = ref(false)
  const isPublishing = ref(false)
  const isReadyForEvents = ref(false) // New flag to prevent early subscriptions
  let onVideoTrackCallback = null // Callback for when video track is ready

  // Handle user published event with safe subscription
  async function handleUserPublished(user, mediaType) {
    try {
      await client.value.subscribe(user, mediaType)
      console.log(`✅ Subscribed to ${mediaType} from user ${user.uid}`)

      if (mediaType === 'video') {
        const remoteUser = remoteUsers.value.find(u => u.uid === user.uid)
        if (remoteUser) {
          remoteUser.videoTrack = user.videoTrack
        } else {
          remoteUsers.value.push({
            uid: user.uid,
            videoTrack: user.videoTrack,
            audioTrack: null
          })
        }

        // Notify callback so it can play the video when DOM is ready
        if (onVideoTrackCallback) {
          onVideoTrackCallback(user.uid, user.videoTrack)
        }
      }

      if (mediaType === 'audio') {
        const remoteUser = remoteUsers.value.find(u => u.uid === user.uid)
        if (remoteUser) {
          remoteUser.audioTrack = user.audioTrack
          user.audioTrack.play()
        } else {
          remoteUsers.value.push({
            uid: user.uid,
            videoTrack: null,
            audioTrack: user.audioTrack
          })
          user.audioTrack.play()
        }
        console.log(`🔊 Playing audio for user ${user.uid}`)
      }
    } catch (error) {
      console.error('❌ Failed to subscribe to user:', error)
    }
  }

  async function initClient() {
    if (!client.value) {
      // Set Agora log level to ERROR only to reduce console spam
      AgoraRTC.setLogLevel(3) // 0: DEBUG, 1: INFO, 2: WARNING, 3: ERROR, 4: NONE

      client.value = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' })

      client.value.on('user-published', async (user, mediaType) => {
        // Only handle user-published events AFTER we're fully ready
        if (!isReadyForEvents.value) {
          console.log('⏭️ Ignoring early user-published event (not ready yet)')
          return
        }

        console.log('📢 user-published event:', user.uid, mediaType)
        await handleUserPublished(user, mediaType)
      })

      client.value.on('user-unpublished', (user, mediaType) => {
        if (mediaType === 'video') {
          const remoteUser = remoteUsers.value.find(u => u.uid === user.uid)
          if (remoteUser) {
            remoteUser.videoTrack = null
          }
        }
      })

      client.value.on('user-left', (user) => {
        remoteUsers.value = remoteUsers.value.filter(u => u.uid !== user.uid)
      })
    }

    return client.value
  }

  async function joinChannel(appId, channel, token, uid, role = 'audience') {
    try {
      await initClient()

      // Set client role
      await client.value.setClientRole(role === 'host' ? 'host' : 'audience')

      // Join channel
      await client.value.join(appId, channel, token, uid)

      console.log('✅ Joined channel:', channel, 'as', role, 'with UID:', uid)

      // Mark as joined immediately
      isJoined.value = true

      // Use setTimeout to not block the UI thread
      setTimeout(async () => {
        // Subscribe to existing remote users (if host is already streaming)
        const existingRemoteUsers = client.value.remoteUsers
        console.log('🔍 Checking for existing remote users...', existingRemoteUsers.length)

        if (existingRemoteUsers && existingRemoteUsers.length > 0) {
          console.log(`📺 Found ${existingRemoteUsers.length} remote user(s) already streaming`)
          for (const user of existingRemoteUsers) {
            console.log(`  - User ${user.uid}: hasVideo=${user.hasVideo}, hasAudio=${user.hasAudio}`)
            if (user.hasVideo) {
              await handleUserPublished(user, 'video')
            }
            if (user.hasAudio) {
              await handleUserPublished(user, 'audio')
            }
          }
        } else {
          console.log('⏳ No remote users yet, waiting for user-published events...')
        }

        // Now we're ready to handle new user-published events
        isReadyForEvents.value = true
        console.log('✅ Ready for user-published events')
      }, 1000) // Check after 1s without blocking
    } catch (error) {
      console.error('❌ Failed to join channel:', error)
      throw error
    }
  }

  async function leaveChannel() {
    // Prevent duplicate calls
    if (!isJoined.value) {
      console.log('⚠️ Already left channel')
      return
    }

    try {
      // Reset flags immediately
      isReadyForEvents.value = false
      isJoined.value = false

      // Stop local tracks
      if (localVideoTrack.value) {
        localVideoTrack.value.stop()
        localVideoTrack.value.close()
        localVideoTrack.value = null
      }

      if (localAudioTrack.value) {
        localAudioTrack.value.stop()
        localAudioTrack.value.close()
        localAudioTrack.value = null
      }

      // Leave channel
      if (client.value) {
        await client.value.leave()
      }

      remoteUsers.value = []
      console.log('✅ Left channel')
    } catch (error) {
      console.error('❌ Failed to leave channel:', error)
      throw error
    }
  }

  async function startPublishing(videoContainerId) {
    try {
      // Create local tracks
      localVideoTrack.value = await AgoraRTC.createCameraVideoTrack()
      localAudioTrack.value = await AgoraRTC.createMicrophoneAudioTrack()

      // Play local video
      if (videoContainerId) {
        localVideoTrack.value.play(videoContainerId)
      }

      // Publish tracks
      await client.value.publish([localVideoTrack.value, localAudioTrack.value])
      isPublishing.value = true

      console.log('Started publishing')
    } catch (error) {
      console.error('Failed to start publishing:', error)
      throw error
    }
  }

  async function stopPublishing() {
    try {
      if (isPublishing.value) {
        await client.value.unpublish([localVideoTrack.value, localAudioTrack.value])
        isPublishing.value = false
      }

      if (localVideoTrack.value) {
        localVideoTrack.value.stop()
        localVideoTrack.value.close()
        localVideoTrack.value = null
      }

      if (localAudioTrack.value) {
        localAudioTrack.value.stop()
        localAudioTrack.value.close()
        localAudioTrack.value = null
      }

      console.log('Stopped publishing')
    } catch (error) {
      console.error('Failed to stop publishing:', error)
      throw error
    }
  }

  async function toggleAudio(mute) {
    if (localAudioTrack.value) {
      await localAudioTrack.value.setEnabled(!mute)
    }
  }

  async function toggleVideo(enabled) {
    if (localVideoTrack.value) {
      await localVideoTrack.value.setEnabled(enabled)
    }
  }

  async function switchCamera() {
    if (localVideoTrack.value) {
      await localVideoTrack.value.switchDevice()
    }
  }

  // Set callback for when video track is ready
  function setOnVideoTrack(callback) {
    onVideoTrackCallback = callback
  }

  // Cleanup on unmount
  onUnmounted(() => {
    leaveChannel()
  })

  return {
    client,
    localVideoTrack,
    localAudioTrack,
    remoteUsers,
    isJoined,
    isPublishing,
    initClient,
    joinChannel,
    leaveChannel,
    startPublishing,
    stopPublishing,
    toggleAudio,
    toggleVideo,
    switchCamera,
    setOnVideoTrack
  }
}
