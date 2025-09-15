<template>
  <div v-if="isOpen" class="confirmation-overlay" @click="handleOverlayClick">
    <div class="confirmation-modal" @click.stop>
      <div class="confirmation-header">
        <h3 class="confirmation-title">{{ title }}</h3>
        <button class="close-button" @click="handleCancel">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <div class="confirmation-body">
        <div class="confirmation-icon">
          <div class="icon-circle" :class="iconClass">
            <span class="material-symbols-outlined">{{ iconName }}</span>
          </div>
        </div>
        <p class="confirmation-message">{{ message }}</p>
        <div v-if="details" class="confirmation-details">
          <strong>{{ details }}</strong>
        </div>
      </div>

      <div class="confirmation-actions">
        <button
          class="cancel-button"
          @click="handleCancel"
          :disabled="loading"
        >
          {{ cancelText }}
        </button>
        <button
          class="confirm-button"
          :class="confirmStyle"
          @click="handleConfirm"
          :disabled="loading"
        >
          <span v-if="loading" class="loading-spinner"></span>
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Onay Gerekli'
  },
  message: {
    type: String,
    required: true
  },
  details: {
    type: String,
    default: ''
  },
  confirmText: {
    type: String,
    default: 'Evet, Sil'
  },
  cancelText: {
    type: String,
    default: 'İptal'
  },
  confirmStyle: {
    type: String,
    default: 'danger', // danger, primary, warning
    validator: (value) => ['danger', 'primary', 'warning'].includes(value)
  },
  iconName: {
    type: String,
    default: 'warning'
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:isOpen', 'confirm', 'cancel']);

const iconClass = computed(() => {
  const classes = {
    'danger': 'danger-icon',
    'primary': 'primary-icon',
    'warning': 'warning-icon'
  };
  return classes[props.confirmStyle] || classes.danger;
});

const handleConfirm = () => {
  emit('confirm');
};

const handleCancel = () => {
  emit('cancel');
  emit('update:isOpen', false);
};

const handleOverlayClick = () => {
  if (!props.loading) {
    handleCancel();
  }
};
</script>

<style scoped>
.confirmation-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

.confirmation-modal {
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  max-width: 320px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  animation: modalSlideIn 0.2s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.confirmation-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 12px;
  border-bottom: 1px solid #e5e7eb;
}

.confirmation-title {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.close-button {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  color: #6b7280;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  background: #f3f4f6;
  color: #374151;
}

.close-button .material-symbols-outlined {
  font-size: 20px;
}

.confirmation-body {
  padding: 16px 20px 12px;
  text-align: center;
}

.confirmation-icon {
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
}

.icon-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.icon-circle .material-symbols-outlined {
  font-size: 24px;
  color: white;
}

.danger-icon {
  background: #ef4444;
}

.primary-icon {
  background: #3b82f6;
}

.warning-icon {
  background: #f59e0b;
}

.confirmation-message {
  font-size: 14px;
  color: #374151;
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.confirmation-details {
  background: #f9fafb;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  margin-top: 12px;
}

.confirmation-details strong {
  color: #111827;
  font-weight: 500;
  font-size: 12px;
}

.confirmation-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding: 12px 16px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.cancel-button {
  padding: 8px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: white;
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 70px;
}

.cancel-button:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #d1d5db;
  color: #374151;
}

.cancel-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.confirm-button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 80px;
  justify-content: center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.confirm-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.confirm-button.danger {
  background: #ef4444;
}

.confirm-button.danger:hover:not(:disabled) {
  background: #dc2626;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
}

.confirm-button.primary {
  background: #2563eb;
}

.confirm-button.primary:hover:not(:disabled) {
  background: #1d4ed8;
}

.confirm-button.warning {
  background: #d97706;
}

.confirm-button.warning:hover:not(:disabled) {
  background: #b45309;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Mobile responsiveness */
@media (max-width: 480px) {
  .confirmation-overlay {
    padding: 16px;
  }
  
  .confirmation-modal {
    max-width: 100%;
  }
  
  .confirmation-actions {
    flex-direction: column;
  }
  
  .cancel-button,
  .confirm-button {
    width: 100%;
    justify-content: center;
  }
}
</style>
