import { defineStore } from 'pinia'
import { ref } from 'vue'
import { boothsAPI } from '@/services/api'

export const useBoothsStore = defineStore('booths', () => {
  const booths = ref([])
  const currentBooth = ref(null)
  const myBooth = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchBooths(params = {}) {
    loading.value = true
    error.value = null

    try {
      const response = await boothsAPI.getAll(params)
      booths.value = response.data.booths
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch booths'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchBoothById(id) {
    loading.value = true
    error.value = null

    try {
      const response = await boothsAPI.getById(id)
      currentBooth.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch booth'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchMyBooth() {
    loading.value = true
    error.value = null

    try {
      const response = await boothsAPI.getMyBooth()
      myBooth.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch your booth'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createBooth(data) {
    loading.value = true
    error.value = null

    try {
      const response = await boothsAPI.create(data)
      booths.value.unshift(response.data.booth)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to create booth'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateBooth(id, data) {
    loading.value = true
    error.value = null

    try {
      const response = await boothsAPI.update(id, data)
      const index = booths.value.findIndex(b => b.id === id)
      if (index !== -1) {
        booths.value[index] = response.data.booth
      }
      if (currentBooth.value?.id === id) {
        currentBooth.value = response.data.booth
      }
      if (myBooth.value?.id === id) {
        myBooth.value = response.data.booth
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to update booth'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteBooth(id) {
    loading.value = true
    error.value = null

    try {
      await boothsAPI.delete(id)
      booths.value = booths.value.filter(b => b.id !== id)
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to delete booth'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function startStream(id) {
    loading.value = true
    error.value = null

    try {
      const response = await boothsAPI.startStream(id)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to start stream'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function stopStream(id) {
    loading.value = true
    error.value = null

    try {
      const response = await boothsAPI.stopStream(id)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to stop stream'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function getStreamToken(id) {
    loading.value = true
    error.value = null

    try {
      const response = await boothsAPI.getStreamToken(id)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to get stream token'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    booths,
    currentBooth,
    myBooth,
    loading,
    error,
    fetchBooths,
    fetchBoothById,
    fetchMyBooth,
    createBooth,
    updateBooth,
    deleteBooth,
    startStream,
    stopStream,
    getStreamToken
  }
})
