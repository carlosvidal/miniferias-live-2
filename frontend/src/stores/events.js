import { defineStore } from 'pinia'
import { ref } from 'vue'
import { eventsAPI } from '@/services/api'

export const useEventsStore = defineStore('events', () => {
  const events = ref([])
  const currentEvent = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchEvents(params = {}) {
    loading.value = true
    error.value = null

    try {
      const response = await eventsAPI.getAll(params)
      events.value = response.data.events
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch events'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchEventById(id) {
    loading.value = true
    error.value = null

    try {
      const response = await eventsAPI.getById(id)
      currentEvent.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch event'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchEventBySlug(slug) {
    loading.value = true
    error.value = null

    try {
      const response = await eventsAPI.getBySlug(slug)
      currentEvent.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch event'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createEvent(data) {
    loading.value = true
    error.value = null

    try {
      const response = await eventsAPI.create(data)
      events.value.unshift(response.data.event)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to create event'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateEvent(id, data) {
    loading.value = true
    error.value = null

    try {
      const response = await eventsAPI.update(id, data)
      const index = events.value.findIndex(e => e.id === id)
      if (index !== -1) {
        events.value[index] = response.data.event
      }
      if (currentEvent.value?.id === id) {
        currentEvent.value = response.data.event
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to update event'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteEvent(id) {
    loading.value = true
    error.value = null

    try {
      await eventsAPI.delete(id)
      events.value = events.value.filter(e => e.id !== id)
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to delete event'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    events,
    currentEvent,
    loading,
    error,
    fetchEvents,
    fetchEventById,
    fetchEventBySlug,
    createEvent,
    updateEvent,
    deleteEvent
  }
})
