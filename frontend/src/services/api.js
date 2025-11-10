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
  getStats: (id) => api.get(`/events/${id}/stats`)
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
