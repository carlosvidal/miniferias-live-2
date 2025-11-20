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
  const subscribedTracks = new Map() // Track subscriptions: uid -> {video: boolean, audio: boolean}
  const usersInChannel = new Set() // Track which users have actually joined the channel

  // Handle user published event with safe subscription
  async function handleUserPublished(user, mediaType) {
    try {
      // CRITICAL: Check if user has actually joined the channel first
      if (!usersInChannel.has(user.uid)) {
        console.log(`⏸️ User ${user.uid} published ${mediaType} but hasn't joined yet, waiting...`)
        // Wait a bit for user-joined event
        await new Promise(resolve => setTimeout(resolve, 500))

        // Check again
        if (!usersInChannel.has(user.uid)) {
          console.warn(`⚠️ User ${user.uid} still not in channel, skipping ${mediaType} subscription`)
          return
        }
      }

      // Check if already subscribed to this specific track
      const trackKey = `${user.uid}-${mediaType}`
      if (subscribedTracks.has(trackKey)) {
        console.log(`⏭️ Already subscribed to ${mediaType} from user ${user.uid}, skipping`)
        return
      }

      await client.value.subscribe(user, mediaType)
      subscribedTracks.set(trackKey, true)
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

      // Track when users actually join the channel
      client.value.on('user-joined', (user) => {
        console.log(`👤 User ${user.uid} joined the channel`)
        usersInChannel.add(user.uid)
      })

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
        // Remove from subscription tracking
        const trackKey = `${user.uid}-${mediaType}`
        subscribedTracks.delete(trackKey)

        if (mediaType === 'video') {
          const remoteUser = remoteUsers.value.find(u => u.uid === user.uid)
          if (remoteUser) {
            remoteUser.videoTrack = null
          }
        }
      })

      client.value.on('user-left', (user) => {
        console.log(`👋 User ${user.uid} left the channel`)
        // Clean up all subscriptions for this user
        subscribedTracks.delete(`${user.uid}-video`)
        subscribedTracks.delete(`${user.uid}-audio`)
        usersInChannel.delete(user.uid)
        remoteUsers.value = remoteUsers.value.filter(u => u.uid !== user.uid)
      })
    }

    return client.value
  }

  async function joinChannel(appId, channel, token, uid, role = 'audience') {
    try {
      await initClient()

      // Set client role
      const clientRole = role === 'host' ? 'host' : 'audience'
      console.log(`🎭 Setting client role to: ${clientRole}`)
      await client.value.setClientRole(clientRole)

      // Join channel
      console.log(`🔌 Joining channel: ${channel} with UID: ${uid}`)
      await client.value.join(appId, channel, token, uid)

      console.log('✅ Joined channel API call completed:', channel, 'as', role, 'with UID:', uid)

      // Wait for connection to be fully established
      console.log('⏳ Waiting for connection state to become CONNECTED...')
      let connectionReady = false
      let attempts = 0
      const maxAttempts = 20 // 10 seconds max

      while (!connectionReady && attempts < maxAttempts) {
        const state = client.value.connectionState
        console.log(`   Connection state: ${state} (attempt ${attempts + 1}/${maxAttempts})`)

        if (state === 'CONNECTED') {
          connectionReady = true
          console.log('✅ Connection state is CONNECTED, ready to proceed')
        } else {
          await new Promise(resolve => setTimeout(resolve, 500))
          attempts++
        }
      }

      if (!connectionReady) {
        throw new Error(`Failed to establish connection after ${maxAttempts * 0.5} seconds. Connection state: ${client.value.connectionState}`)
      }

      // Mark as joined
      isJoined.value = true

      // Wait a bit more for stability
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Subscribe to existing remote users (if host is already streaming)
      const existingRemoteUsers = client.value.remoteUsers
      console.log('🔍 Checking for existing remote users...', existingRemoteUsers.length)

      if (existingRemoteUsers && existingRemoteUsers.length > 0) {
        console.log(`📺 Found ${existingRemoteUsers.length} remote user(s) already streaming`)

        // Wait a bit for Agora to fully register these users internally
        console.log('⏳ Waiting for remote users to be fully registered...')
        await new Promise(resolve => setTimeout(resolve, 1500))

        for (const user of existingRemoteUsers) {
          console.log(`  - User ${user.uid}: hasVideo=${user.hasVideo}, hasAudio=${user.hasAudio}`)

          // Mark user as in channel
          usersInChannel.add(user.uid)

          // Subscribe to video
          if (user.hasVideo) {
            const trackKey = `${user.uid}-video`
            if (!subscribedTracks.has(trackKey)) {
              try {
                await client.value.subscribe(user, 'video')
                subscribedTracks.set(trackKey, true)
                console.log(`✅ Subscribed to video from user ${user.uid}`)

                // Wait a tiny bit for the track to be ready
                await new Promise(resolve => setTimeout(resolve, 100))

                // Verify track exists and is ready
                if (!user.videoTrack) {
                  console.error(`❌ Video track not available for user ${user.uid} after subscription`)
                  return
                }

                console.log(`   Video track details: type=${user.videoTrack.getMediaStreamTrack()?.kind}, readyState=${user.videoTrack.getMediaStreamTrack()?.readyState}`)

                // Update remoteUsers
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

                // Notify callback
                if (onVideoTrackCallback) {
                  console.log(`📢 Calling video track callback for user ${user.uid}`)
                  onVideoTrackCallback(user.uid, user.videoTrack)
                } else {
                  console.warn(`⚠️ No video track callback set, cannot play video for user ${user.uid}`)
                }
              } catch (error) {
                console.error('❌ Failed to subscribe to video:', error)
              }
            }
          }

          // Subscribe to audio
          if (user.hasAudio) {
            const trackKey = `${user.uid}-audio`
            if (!subscribedTracks.has(trackKey)) {
              try {
                await client.value.subscribe(user, 'audio')
                subscribedTracks.set(trackKey, true)
                console.log(`✅ Subscribed to audio from user ${user.uid}`)

                // Update remoteUsers
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
              } catch (error) {
                console.error('❌ Failed to subscribe to audio:', error)
              }
            }
          }
        }
      } else {
        console.log('⏳ No remote users yet, waiting for user-published events...')
      }

      // Now we're ready to handle new user-published events
      isReadyForEvents.value = true
      console.log('✅ Ready for user-published events')
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

      // Clean up
      remoteUsers.value = []
      subscribedTracks.clear()
      usersInChannel.clear()
      console.log('✅ Left channel')
    } catch (error) {
      console.error('❌ Failed to leave channel:', error)
      throw error
    }
  }

  async function startPublishing(videoContainerId) {
    try {
      console.log('🎬 Creating local camera and microphone tracks...')
      // Create local tracks
      localVideoTrack.value = await AgoraRTC.createCameraVideoTrack()
      localAudioTrack.value = await AgoraRTC.createMicrophoneAudioTrack()
      console.log('✅ Local tracks created successfully')

      // Play local video
      if (videoContainerId) {
        console.log(`📺 Playing local video in container: ${videoContainerId}`)
        localVideoTrack.value.play(videoContainerId)
      }

      // Publish tracks with retry logic for WS_ABORT errors
      console.log('📤 Publishing local tracks to channel...')
      let retries = 3
      let published = false

      while (retries > 0 && !published) {
        try {
          await client.value.publish([localVideoTrack.value, localAudioTrack.value])
          published = true
          isPublishing.value = true
          console.log('✅ Started publishing successfully - viewers should now see this stream')
        } catch (error) {
          retries--
          if (error.code === 'WS_ABORT' && retries > 0) {
            console.warn(`⚠️ WS_ABORT error, retrying... (${retries} attempts left)`)
            await new Promise(resolve => setTimeout(resolve, 1000))
          } else {
            throw error
          }
        }
      }

      if (!published) {
        throw new Error('Failed to publish after multiple retries')
      }
    } catch (error) {
      console.error('❌ Failed to start publishing:', error)
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
