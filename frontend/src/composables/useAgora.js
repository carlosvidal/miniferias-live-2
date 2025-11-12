import { ref, onUnmounted } from 'vue'
import AgoraRTC from 'agora-rtc-sdk-ng'

export function useAgora() {
  const client = ref(null)
  const localVideoTrack = ref(null)
  const localAudioTrack = ref(null)
  const remoteUsers = ref([])
  const isJoined = ref(false)
  const isPublishing = ref(false)

  // Handle user published event with safe subscription
  async function handleUserPublished(user, mediaType) {
    try {
      await client.value.subscribe(user, mediaType)
      console.log(`Subscribed to ${mediaType} from user ${user.uid}`)

      if (mediaType === 'video') {
        const remoteUser = remoteUsers.value.find(u => u.uid === user.uid)
        if (remoteUser) {
          remoteUser.videoTrack = user.videoTrack
        } else {
          remoteUsers.value.push({
            uid: user.uid,
            videoTrack: user.videoTrack,
            audioTrack: user.audioTrack
          })
        }
      }

      if (mediaType === 'audio') {
        const remoteUser = remoteUsers.value.find(u => u.uid === user.uid)
        if (remoteUser) {
          remoteUser.audioTrack = user.audioTrack
          user.audioTrack.play()
        }
      }
    } catch (error) {
      console.error('Failed to subscribe to user:', error)
    }
  }

  async function initClient() {
    if (!client.value) {
      client.value = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' })

      client.value.on('user-published', async (user, mediaType) => {
        // Wait until we're fully joined before subscribing
        if (!isJoined.value) {
          console.log('Deferring subscription until joined')
          // Wait for join to complete, then subscribe
          const checkInterval = setInterval(async () => {
            if (isJoined.value) {
              clearInterval(checkInterval)
              await handleUserPublished(user, mediaType)
            }
          }, 100)
          return
        }

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

      // Wait a bit for the channel state to stabilize
      await new Promise(resolve => setTimeout(resolve, 1000))

      isJoined.value = true

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
    } catch (error) {
      console.error('❌ Failed to join channel:', error)
      throw error
    }
  }

  async function leaveChannel() {
    try {
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
      if (client.value && isJoined.value) {
        await client.value.leave()
        isJoined.value = false
      }

      remoteUsers.value = []
      console.log('Left channel')
    } catch (error) {
      console.error('Failed to leave channel:', error)
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
    switchCamera
  }
}
