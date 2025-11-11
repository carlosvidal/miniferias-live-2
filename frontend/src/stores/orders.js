import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ordersAPI } from '@/services/api'

export const useOrdersStore = defineStore('orders', () => {
  const orders = ref([])
  const myOrders = ref([])
  const currentOrder = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchOrders(params = {}) {
    loading.value = true
    error.value = null

    try {
      const response = await ordersAPI.getAll(params)
      orders.value = response.data.orders
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch orders'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchMyOrders() {
    loading.value = true
    error.value = null

    try {
      const response = await ordersAPI.getMyOrders()
      myOrders.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch orders'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchOrderById(id) {
    loading.value = true
    error.value = null

    try {
      const response = await ordersAPI.getById(id)
      currentOrder.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch order'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createOrder(data) {
    loading.value = true
    error.value = null

    try {
      const response = await ordersAPI.create(data)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to create order'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateOrderStatus(id, status, notes = null) {
    loading.value = true
    error.value = null

    try {
      const response = await ordersAPI.updateStatus(id, { status, notes })

      // Update order in lists
      const updateOrder = (order) => {
        if (order.id === id) {
          return { ...order, status, notes: notes || order.notes }
        }
        return order
      }

      orders.value = orders.value.map(updateOrder)
      myOrders.value = myOrders.value.map(updateOrder)

      if (currentOrder.value?.id === id) {
        currentOrder.value = { ...currentOrder.value, status, notes: notes || currentOrder.value.notes }
      }

      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to update order status'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    orders,
    myOrders,
    currentOrder,
    loading,
    error,
    fetchOrders,
    fetchMyOrders,
    fetchOrderById,
    createOrder,
    updateOrderStatus
  }
})
