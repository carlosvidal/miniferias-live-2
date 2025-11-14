import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI } from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'ADMIN')
  const isExhibitor = computed(() => user.value?.role === 'EXHIBITOR')
  const isVisitor = computed(() => user.value?.role === 'VISITOR')

  // Initialize user from localStorage
  const storedUser = localStorage.getItem('user')
  if (storedUser) {
    try {
      user.value = JSON.parse(storedUser)
    } catch (e) {
      localStorage.removeItem('user')
    }
  }

  async function register(userData) {
    loading.value = true
    error.value = null

    try {
      const response = await authAPI.register(userData)
      token.value = response.data.token
      user.value = response.data.user

      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))

      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Registration failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function login(credentials) {
    loading.value = true
    error.value = null

    try {
      const response = await authAPI.login(credentials)
      token.value = response.data.token
      user.value = response.data.user

      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))

      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Login failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  async function fetchUser() {
    if (!token.value) return

    loading.value = true
    try {
      const response = await authAPI.getMe()
      user.value = response.data
      localStorage.setItem('user', JSON.stringify(response.data))
    } catch (err) {
      console.error('Failed to fetch user:', err)
      logout()
    } finally {
      loading.value = false
    }
  }

  async function updateProfile(data) {
    loading.value = true
    error.value = null

    try {
      const response = await authAPI.updateProfile(data)
      user.value = response.data.user
      localStorage.setItem('user', JSON.stringify(response.data.user))
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Update failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Manual setters for guest checkout auto-login
  function setToken(newToken) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  function setUser(newUser) {
    user.value = newUser
    localStorage.setItem('user', JSON.stringify(newUser))
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    isExhibitor,
    isVisitor,
    register,
    login,
    logout,
    fetchUser,
    updateProfile,
    setToken,
    setUser
  }
})
