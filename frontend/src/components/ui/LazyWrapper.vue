<template>
  <div v-if="isVisible" class="lazy-wrapper">
    <slot />
  </div>
  <div v-else class="lazy-placeholder">
    <div class="loading-skeleton">
      <div class="skeleton-line" v-for="i in skeletonLines" :key="i"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useLazyLoad } from '../../composables/usePerformance'

interface Props {
  threshold?: number
  skeletonLines?: number
  delay?: number
}

const props = withDefaults(defineProps<Props>(), {
  threshold: 0.1,
  skeletonLines: 3,
  delay: 0
})

const isVisible = ref(false)
const { isIntersecting, observe, disconnect } = useLazyLoad()

const handleIntersection = () => {
  if (isIntersecting.value) {
    setTimeout(() => {
      isVisible.value = true
    }, props.delay)
  }
}

onMounted(() => {
  const element = document.querySelector('.lazy-wrapper') as HTMLElement
  if (element) {
    observe(element)
    watch(isIntersecting, handleIntersection)
  }
})

onUnmounted(() => {
  disconnect()
})
</script><style scoped lang="scss">.lazy-wrapper {
     width: 100%;
}

.lazy-placeholder {
     width: 100%;
     min-height: 200px;
     display: flex;
     align-items: center;
     justify-content: center;
}

.loading-skeleton {
     width: 100%;
     max-width: 400px;
     padding: 1rem;
}

.skeleton-line {
     height: 1rem;
     background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
     background-size: 200% 100%;
     animation: loading 1.5s infinite;
     border-radius: 4px;
     margin-bottom: 0.5rem;

     &:last-child {
          margin-bottom: 0;
     }

     &:nth-child(1) {
          width: 100%;
     }

     &:nth-child(2) {
          width: 80%;
     }

     &:nth-child(3) {
          width: 60%;
     }
}

@keyframes loading {
     0% {
          background-position: 200% 0;
     }

     100% {
          background-position: -200% 0;
     }
}

</style>