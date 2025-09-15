<template>
  <div class="empty-state">
    <div class="empty-icon">
      <span class="material-symbols-outlined">{{ icon }}</span>
    </div>
    <h3 class="empty-title">{{ title }}</h3>
    <p class="empty-description">{{ description }}</p>
    <div v-if="$slots.actions" class="empty-actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  icon?: string
  title?: string
  description?: string
}

withDefaults(defineProps<Props>(), {
  icon: 'inbox',
  title: 'Veri bulunamadı',
  description: 'Aradığınız kriterlere uygun veri bulunamadı.'
})
</script>

<style scoped lang="scss">
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
  color: #666;
}

.empty-icon {
  margin-bottom: 1rem;
  
  .material-symbols-outlined {
    font-size: 4rem;
    opacity: 0.5;
    color: #999;
  }
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
}

.empty-description {
  font-size: 1rem;
  margin-bottom: 2rem;
  max-width: 400px;
  line-height: 1.5;
}

.empty-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}
</style>
