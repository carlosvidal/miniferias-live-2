import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  const boothId = ref(null)

  const totalItems = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  const subtotal = computed(() => {
    return items.value.reduce((sum, item) => {
      return sum + (parseFloat(item.price) * item.quantity)
    }, 0)
  })

  const total = computed(() => {
    const shipping = 0 // TODO: Calculate shipping
    return subtotal.value + shipping
  })

  function addItem(product, quantity = 1) {
    // Check if cart is for same booth
    if (boothId.value && boothId.value !== product.boothId) {
      throw new Error('No puedes agregar productos de diferentes booths')
    }

    boothId.value = product.boothId

    const existingItem = items.value.find(item => item.id === product.productId || item.id === product.id)

    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      items.value.push({
        id: product.productId || product.id,
        name: product.name,
        price: product.price,
        image: product.imageUrl || product.images?.[0] || product.image || '',
        quantity,
        boothId: product.boothId
      })
    }

    saveToLocalStorage()
  }

  function removeItem(productId) {
    items.value = items.value.filter(item => item.id !== productId)

    if (items.value.length === 0) {
      boothId.value = null
    }

    saveToLocalStorage()
  }

  function updateQuantity(productId, quantity) {
    const item = items.value.find(item => item.id === productId)

    if (item) {
      if (quantity <= 0) {
        removeItem(productId)
      } else {
        item.quantity = quantity
      }
    }

    saveToLocalStorage()
  }

  function clear() {
    items.value = []
    boothId.value = null
    saveToLocalStorage()
  }

  function saveToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify({
      items: items.value,
      boothId: boothId.value
    }))
  }

  function loadFromLocalStorage() {
    const saved = localStorage.getItem('cart')
    if (saved) {
      try {
        const data = JSON.parse(saved)
        items.value = data.items || []
        boothId.value = data.boothId || null
      } catch (e) {
        console.error('Failed to load cart from localStorage:', e)
      }
    }
  }

  // Initialize from localStorage
  loadFromLocalStorage()

  return {
    items,
    boothId,
    totalItems,
    subtotal,
    total,
    addItem,
    removeItem,
    updateQuantity,
    clear,
    loadFromLocalStorage
  }
})
