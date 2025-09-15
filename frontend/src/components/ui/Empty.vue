<template>
  <div class="empty-state">
    <div class="empty-icon">
      <span class="material-symbols-outlined">{{ icon }}</span>
    </div>
    <h3 class="empty-title">{{ title }}</h3>
    <p class="empty-description">{{ description }}</p>
    <div v-if="showAction && actionText" class="empty-action">
      <Button 
        :variant="actionVariant" 
        :size="actionSize"
        @click="$emit('action')"
      >
        {{ actionText }}
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from './Button.vue';

interface Props {
  icon?: string;
  title?: string;
  description?: string;
  actionText?: string;
  actionVariant?: 'primary' | 'secondary' | 'danger' | 'success';
  actionSize?: 'small' | 'medium' | 'large';
  showAction?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'inbox',
  title: 'Veri bulunamadı',
  description: 'Burada gösterilecek veri bulunmuyor.',
  actionText: '',
  actionVariant: 'primary',
  actionSize: 'medium',
  showAction: false
});

const emit = defineEmits<{
  action: [];
}>();
</script>

<style scoped lang="scss">
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  color: #6b7280;
}

.empty-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  
  .material-symbols-outlined {
    font-size: 32px;
    color: #9ca3af;
  }
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 8px 0;
}

.empty-description {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 24px 0;
  max-width: 400px;
  line-height: 1.5;
}

.empty-action {
  margin-top: 8px;
}
</style>
