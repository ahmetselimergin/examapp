<template>
  <Modal 
    :modelValue="modelValue" 
    @update:modelValue="$emit('update:modelValue', $event)" 
    :title="$t('settings.title')"
  >
    <div class="settings-content">
      <div class="profile-card">
        <div class="profile-header">
          <div class="profile-avatar">
            {{ authStore.user?.name ? authStore.user.name.charAt(0).toUpperCase() : '?' }}
          </div>
        </div>
        <div class="profile-info">
          <div class="info-item">
            <span class="info-value">{{ authStore.user?.name || $t('common.unspecified') }}</span>
          </div>
          <div class="info-item">
            <span class="info-value">{{ authStore.user?.email || $t('common.unspecified') }}</span>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <h3>{{ $t('settings.language') }}</h3>
        <LanguageSwitcher />
      </div>
    </div>
    <template #footer>
      <div class="modal-footer">
        <Button @click="close" variant="secondary">{{ $t('common.close') }}</Button>
      </div>
    </template>
  </Modal>
</template>

<script setup>
import { ref, watch } from 'vue';
import Modal from './Modal.vue';
import Input from './Input.vue';
import Button from './Button.vue';
import LanguageSwitcher from '../LanguageSwitcher.vue';
import { useAuthStore } from '../../stores/auth';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: 'Ayarlar'
  }
});

const emit = defineEmits(['update:modelValue']);
const authStore = useAuthStore();

const close = () => {
  emit('update:modelValue', false);
};

const handleSave = async () => {
  try {
    // TODO: Implement save functionality
    close();
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
};
</script>

<style scoped lang="scss">
@import "../../assets/styles/_framework.scss";

.settings-content {
  padding: 0rem 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.profile-card {
  background: $darker-blue;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 1rem;
  gap: 1rem;
  width: 100%;
  color: $white;
}

.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.profile-avatar {
  width: 2em;
  height: 2em;
  background: $white;
  color: $darker-blue;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.profile-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  span{
    font-size: 1rem;
    font-weight: 600;
    color: $white;
  }
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.info-value {
  font-size: 1rem;
  color: var(--text-primary);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.settings-section {
  padding: 1rem;
  background: $white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  h3 {
    font-size: 1rem;
    font-weight: 600;
    color: $darker-blue;
    margin-bottom: 1rem;
  }
}
</style> 