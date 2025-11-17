import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data)
}

// Events API
export const eventsAPI = {
  getAll: (params) => api.get('/events', { params }),
  getById: (id) => api.get(`/events/${id}`),
  getBySlug: (slug) => api.get(`/events/slug/${slug}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
  getStats: (id) => api.get(`/events/${id}/stats`),
  createReminder: (eventId, email) => api.post(`/events/${eventId}/reminders`, { email }),
  getReminders: (eventId) => api.get(`/events/${eventId}/reminders`)
}

// Booths API
export const boothsAPI = {
  getAll: (params) => api.get('/booths', { params }),
  getById: (id) => api.get(`/booths/${id}`),
  getMyBooth: () => api.get('/booths/me/booth'),
  create: (data) => api.post('/booths', data),
  update: (id, data) => api.put(`/booths/${id}`, data),
  delete: (id) => api.delete(`/booths/${id}`),
  startStream: (id) => api.post(`/booths/${id}/stream/start`),
  stopStream: (id) => api.post(`/booths/${id}/stream/stop`),
  getStreamToken: (id) => api.get(`/booths/${id}/stream-token`)
}

// Products API
export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getByBooth: (boothId, params) => api.get(`/products/booth/${boothId}`, { params }),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`)
}

// Orders API
export const ordersAPI = {
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  getMyOrders: () => api.get('/orders/me'),
  create: (data) => api.post('/orders', data),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data)
}

// Messages API
export const messagesAPI = {
  getByBooth: (boothId, params) => api.get(`/messages/booth/${boothId}`, { params }),
  create: (data) => api.post('/messages', data),
  delete: (id) => api.delete(`/messages/${id}`)
}

// Admin API
export const adminAPI = {
  getStats: () => api.get('/admin/stats')
}

// Users API
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  create: (data) => api.post('/users', data),
  updateRole: (id, role) => api.patch(`/users/${id}/role`, { role }),
  delete: (id) => api.delete(`/users/${id}`)
}

// Upload API (Cloudflare Images)
export const uploadAPI = {
  /**
   * Upload avatar (profile picture) - cuadrada, se muestra circular
   * @param {File} file - Archivo de imagen
   * @returns {Promise} - Promesa con la URL de la imagen
   */
  uploadAvatar: (file) => {
    const formData = new FormData()
    formData.append('avatar', file)
    return api.post('/upload/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  /**
   * Upload logo de expositor - cuadrada
   * @param {File} file - Archivo de imagen
   * @param {string} boothId - ID del booth (opcional)
   * @returns {Promise} - Promesa con la URL de la imagen
   */
  uploadLogo: (file, boothId = null) => {
    const formData = new FormData()
    formData.append('logo', file)
    if (boothId) formData.append('boothId', boothId)
    return api.post('/upload/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  /**
   * Upload cover image (evento o booth) - rectangular 16:9
   * @param {File} file - Archivo de imagen
   * @param {string} entityType - 'event' o 'booth'
   * @param {string} entityId - ID del evento o booth (opcional)
   * @returns {Promise} - Promesa con la URL de la imagen
   */
  uploadCover: (file, entityType, entityId = null) => {
    const formData = new FormData()
    formData.append('cover', file)
    formData.append('entityType', entityType)
    if (entityId) formData.append('entityId', entityId)
    return api.post('/upload/cover', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  /**
   * Upload imagen de producto - cuadrada
   * @param {File} file - Archivo de imagen
   * @param {string} productId - ID del producto (opcional)
   * @param {string} boothId - ID del booth (opcional)
   * @returns {Promise} - Promesa con la URL de la imagen
   */
  uploadProductImage: (file, productId = null, boothId = null) => {
    const formData = new FormData()
    formData.append('product', file)
    if (productId) formData.append('productId', productId)
    if (boothId) formData.append('boothId', boothId)
    return api.post('/upload/product', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  /**
   * Upload múltiples imágenes de producto - cuadradas
   * @param {File[]} files - Array de archivos de imagen (máximo 5)
   * @returns {Promise} - Promesa con array de URLs
   */
  uploadProductImages: (files) => {
    const formData = new FormData()
    files.forEach(file => {
      formData.append('products', file)
    })
    return api.post('/upload/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  /**
   * Upload comprobante de pago
   * @param {File} file - Archivo de imagen del comprobante
   * @param {string} orderId - ID de la orden (opcional)
   * @param {string} userName - Nombre del usuario (opcional)
   * @returns {Promise} - Promesa con la URL de la imagen
   */
  uploadPaymentProof: (file, orderId = null, userName = null) => {
    const formData = new FormData()
    formData.append('paymentProof', file)
    if (orderId) formData.append('orderId', orderId)
    if (userName) formData.append('userName', userName)
    return api.post('/upload/payment-proof', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  /**
   * Eliminar imagen
   * @param {string} imageId - ID de la imagen en Cloudflare
   * @returns {Promise}
   */
  deleteImage: (imageId) => api.delete(`/upload/${imageId}`),

  /**
   * Obtener URL de imagen con variant específico
   * @param {string} imageId - ID de la imagen
   * @param {string} variant - Variant (avatar, logo, product, cover, thumbnail, public)
   * @returns {Promise}
   */
  getImageUrl: (imageId, variant = 'public') => api.get(`/upload/url/${imageId}/${variant}`)
}
