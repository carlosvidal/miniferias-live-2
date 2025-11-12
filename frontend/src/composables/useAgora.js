import { ref, onUnmounted } from 'vue'
import AgoraRTC from 'agora-rtc-sdk-ng'

export function useAgora() {
  const client = ref(null)
  const localVideoTrack = ref(null)
  const localAudioTrack = ref(null)
  const remoteUsers = ref([])
  const isJoined = ref(false)
  const isPublishing = ref(false)

  async function initClient() {
    if (!client.value) {
      client.value = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' })

      client.value.on('user-published', async (user, mediaType) => {
        try {
          await client.value.subscribe(user, mediaType)

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
          // Retry subscription after a short delay if user not in channel yet
          if (error.code === 'INVALID_REMOTE_USER') {
            setTimeout(async () => {
              try {
                await client.value.subscribe(user, mediaType)
                console.log('Successfully subscribed on retry')

                // Update remoteUsers after successful retry
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
              } catch (retryError) {
                console.error('Retry subscribe failed:', retryError)
              }
            }, 500)
          }
        }
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
      isJoined.value = true

      console.log('Joined channel:', channel)
    } catch (error) {
      console.error('Failed to join channel:', error)
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
