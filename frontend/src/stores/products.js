import { defineStore } from 'pinia'
import { ref } from 'vue'
import { productsAPI } from '@/services/api'

export const useProductsStore = defineStore('products', () => {
  const products = ref([])
  const currentProduct = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchProducts(params = {}) {
    loading.value = true
    error.value = null

    try {
      const response = await productsAPI.getAll(params)
      products.value = response.data.products
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch products'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchProductById(id) {
    loading.value = true
    error.value = null

    try {
      const response = await productsAPI.getById(id)
      currentProduct.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch product'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchProductsByBooth(boothId, params = {}) {
    loading.value = true
    error.value = null

    try {
      const response = await productsAPI.getByBooth(boothId, params)
      products.value = response.data.products
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch products'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createProduct(data) {
    loading.value = true
    error.value = null

    try {
      const response = await productsAPI.create(data)
      products.value.unshift(response.data.product)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to create product'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateProduct(id, data) {
    loading.value = true
    error.value = null

    try {
      const response = await productsAPI.update(id, data)
      const index = products.value.findIndex(p => p.id === id)
      if (index !== -1) {
        products.value[index] = response.data.product
      }
      if (currentProduct.value?.id === id) {
        currentProduct.value = response.data.product
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to update product'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteProduct(id) {
    loading.value = true
    error.value = null

    try {
      await productsAPI.delete(id)
      products.value = products.value.filter(p => p.id !== id)
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to delete product'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    products,
    currentProduct,
    loading,
    error,
    fetchProducts,
    fetchProductById,
    fetchProductsByBooth,
    createProduct,
    updateProduct,
    deleteProduct
  }
})
