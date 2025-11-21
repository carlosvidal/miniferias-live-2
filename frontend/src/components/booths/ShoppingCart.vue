<template>
  <!-- Shopping Cart Overlay -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-300"
      leave-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 pt-28"
        @click.self="emit('close')"
      >
        <Transition
          enter-active-class="transition-transform duration-300"
          leave-active-class="transition-transform duration-300"
          enter-from-class="translate-y-full"
          leave-to-class="translate-y-full"
        >
          <div
            v-if="isOpen"
            class="flex h-full flex-col rounded-t-2xl bg-[#f8f6f7] dark:bg-[#221019] text-gray-800 dark:text-white"
            @click.stop
          >
            <!-- Header -->
            <div class="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 p-4">
              <h2 class="text-lg font-bold">
                Carrito de Compras ({{ cartStore.totalItems }})
              </h2>
              <button
                @click="emit('close')"
                class="flex items-center justify-center size-8 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Cart Items -->
            <div class="flex-1 overflow-y-auto p-4">
              <div v-if="cartStore.items.length > 0" class="space-y-4">
                <div
                  v-for="item in cartStore.items"
                  :key="item.id"
                  class="flex items-center gap-4"
                >
                  <!-- Product Image -->
                  <div
                    class="h-20 w-20 shrink-0 rounded-lg bg-cover bg-center bg-gray-200 dark:bg-gray-700"
                    :style="{ backgroundImage: item.image ? `url(${item.image})` : 'none' }"
                  >
                    <div v-if="!item.image" class="h-full w-full flex items-center justify-center">
                      <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                  </div>

                  <!-- Product Info -->
                  <div class="flex-1 min-w-0">
                    <p class="font-semibold">{{ item.name }}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400" v-if="item.variant">
                      {{ item.variant }}
                    </p>
                    <p class="font-bold text-[#ee2b8c] mt-1">
                      S/ {{ formatPrice(item.price) }}
                    </p>
                  </div>

                  <!-- Quantity Controls -->
                  <div class="flex items-center gap-2">
                    <button
                      @click="decrementQuantity(item)"
                      class="flex items-center justify-center size-7 rounded-md border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      :disabled="item.quantity <= 1"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                      </svg>
                    </button>
                    <span class="w-6 text-center font-semibold">{{ item.quantity }}</span>
                    <button
                      @click="incrementQuantity(item)"
                      class="flex items-center justify-center size-7 rounded-md border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>

                  <!-- Delete Button -->
                  <button
                    @click="removeProduct(item)"
                    class="flex items-center justify-center size-8 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    :title="`Eliminar ${item.name}`"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Empty Cart -->
              <div v-else class="flex flex-col items-center justify-center py-12 text-center">
                <svg class="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p class="text-gray-600 dark:text-gray-400 text-lg font-medium">Tu carrito está vacío</p>
                <p class="text-gray-500 dark:text-gray-500 text-sm mt-2">Agrega productos para comenzar tu compra</p>
              </div>
            </div>

            <!-- Footer -->
            <div v-if="cartStore.items.length > 0" class="border-t border-gray-200 dark:border-gray-700 p-4">
              <div class="flex justify-between font-semibold mb-4">
                <span>Subtotal</span>
                <span>S/ {{ formatPrice(cartStore.subtotal) }}</span>
              </div>
              <button
                @click="goToCheckout"
                class="w-full rounded-full bg-[#ee2b8c] hover:bg-[#d91f78] py-3.5 text-center font-bold text-white transition-colors"
              >
                Checkout
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { useCartStore } from '@/stores/cart'
import { useRouter } from 'vue-router'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['close', 'open-checkout'])

const cartStore = useCartStore()

function formatPrice(price) {
  return new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price)
}

function incrementQuantity(item) {
  cartStore.updateQuantity(item.id, item.quantity + 1)
}

function decrementQuantity(item) {
  if (item.quantity > 1) {
    cartStore.updateQuantity(item.id, item.quantity - 1)
  }
}

function removeProduct(item) {
  if (confirm(`¿Eliminar ${item.name} del carrito?`)) {
    cartStore.removeItem(item.id)
  }
}

function goToCheckout() {
  emit('close')
  emit('open-checkout')
}
</script>
