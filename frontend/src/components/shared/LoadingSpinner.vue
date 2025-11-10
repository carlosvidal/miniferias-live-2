<template>
  <div :class="['flex items-center justify-center', containerClass]">
    <div
      :class="[
        'border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin',
        sizeClass
      ]"
    ></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  containerClass: {
    type: String,
    default: 'py-8'
  }
})

const sizeClass = computed(() => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }
  return sizes[props.size]
})
</script>
