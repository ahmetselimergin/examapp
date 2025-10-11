<template>
  <div class="settings-container">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h2>{{ $t('settings.title') }}</h2>
        <p>{{ $t('settings.subtitle') }}</p>
      </div>
    </div>

    <div class="settings-content">
      <!-- Profile Section -->
      <div class="settings-card">
        <div class="card-header">
          <div class="card-icon">
            <span class="material-symbols-outlined">person</span>
          </div>
          <div class="card-title">
            <h3>{{ $t('settings.profile') }}</h3>
            <p>{{ $t('settings.profileDescription') }}</p>
          </div>
        </div>
        
        <div class="card-content">
          <div class="profile-section">
            <div class="profile-avatar-section">
              <div class="profile-avatar">
                {{ authStore.user?.name ? authStore.user.name.charAt(0).toUpperCase() : '?' }}
              </div>
              <div class="profile-basic">
                <h4>{{ authStore.user?.name || $t('common.unspecified') }}</h4>
                <span class="role-badge" :class="authStore.user?.role">
                  {{ getRoleText(authStore.user?.role) }}
                </span>
              </div>
            </div>
            
            <div class="profile-details">
              <div class="detail-group">
                <div class="detail-item">
                  <label>{{ $t('common.email') }}</label>
                  <div class="detail-value">
                    <span class="material-symbols-outlined">email</span>
                    <span>{{ authStore.user?.email || $t('common.unspecified') }}</span>
                  </div>
                </div>
                
                <div class="detail-item">
                  <label>{{ $t('settings.accountStatus') }}</label>
                  <div class="detail-value">
                    <span class="material-symbols-outlined">check_circle</span>
                    <span class="status-active">{{ $t('settings.active') }}</span>
                  </div>
                </div>
                
                <div class="detail-item" v-if="authStore.user?.createdAt">
                  <label>{{ $t('settings.registrationDate') }}</label>
                  <div class="detail-value">
                    <span class="material-symbols-outlined">calendar_month</span>
                    <span>{{ formatDate(authStore.user.createdAt) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Theme Settings -->
      <div class="settings-card">
        <div class="card-header">
          <div class="card-icon">
            <span class="material-symbols-outlined">palette</span>
          </div>
          <div class="card-title">
            <h3>{{ $t('settings.theme') }}</h3>
            <p>{{ $t('settings.themeDescription') }}</p>
          </div>
        </div>
        
        <div class="card-content">
          <div class="theme-options">
            
            
            <div class="theme-selector">
              <div class="theme-buttons">
                <button 
                  v-for="theme in themeOptions" 
                  :key="theme.value"
                  @click="setTheme(theme.value)"
                  :class="['theme-button', { active: currentTheme === theme.value }]"
                >
                  <span class="material-symbols-outlined">{{ theme.icon }}</span>
                  <span class="theme-label">{{ theme.label.value }}</span>
                  <div v-if="currentTheme === theme.value" class="theme-check">
                    <span class="material-symbols-outlined">check</span>
                  </div>
                </button>
              </div>
            </div>
            
            <div class="theme-description">
              <p class="description-text">
                <span class="material-symbols-outlined">info</span>
                <span v-if="currentTheme === 'auto'">
                  {{ $t('settings.themeDescriptionAuto', { theme: resolvedTheme === 'dark' ? $t('settings.darkThemeText') : $t('settings.lightThemeText') }) }}
                </span>
                <span v-else-if="currentTheme === 'light'">
                  {{ $t('settings.themeDescriptionLight') }}
                </span>
                <span v-else>
                  {{ $t('settings.themeDescriptionDark') }}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Language Settings -->
      <div class="settings-card">
        <div class="card-header">
          <div class="card-icon">
            <span class="material-symbols-outlined">language</span>
          </div>
          <div class="card-title">
            <h3>{{ $t('settings.language') }}</h3>
            <p>{{ $t('settings.languageDescription') }}</p>
          </div>
        </div>
        
        <div class="card-content">
          <LanguageSwitcher />
        </div>
      </div>

      <!-- Account Actions -->
      <div class="settings-card">
        <div class="card-header">
          <div class="card-icon">
            <span class="material-symbols-outlined">security</span>
          </div>
          <div class="card-title">
            <h3>{{ $t('settings.accountActions') }}</h3>
            <p>{{ $t('settings.accountActionsDescription') }}</p>
          </div>
        </div>
        
        <div class="card-content">
          <div class="action-buttons">
            <Button 
              @click="handlePasswordChange"
              styleType="secondary"
              size="medium"
              icon="lock"
              :text="$t('settings.changePassword')"
            />
            <Button 
              @click="handleLogout"
              styleType="danger"
              size="medium"
              icon="logout"
              text="Çıkış Yap"
            />
          </div>
        </div>
      </div>

      <!-- System Info -->
      <div class="settings-card">
        <div class="card-header">
          <div class="card-icon">
            <span class="material-symbols-outlined">info</span>
          </div>
          <div class="card-title">
            <h3>{{ $t('settings.systemInfo') }}</h3>
            <p>{{ $t('settings.systemInfoDescription') }}</p>
          </div>
        </div>
        
        <div class="card-content">
          <div class="system-info">
            <div class="info-item">
              <span class="info-label">{{ $t('settings.appVersion') }}</span>
              <span class="info-value">v1.0.0</span>
            </div>
            <div class="info-item">
              <span class="info-label">{{ $t('settings.lastUpdate') }}</span>
              <span class="info-value">{{ formatDate(new Date()) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">{{ $t('settings.developer') }}</span>
              <span class="info-value">Exam App Team</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useI18n } from 'vue-i18n';
import { useToast } from '../composables/useToast';
import { useTheme } from '../composables/useTheme';
import LanguageSwitcher from '../components/LanguageSwitcher.vue';
import Button from '../components/ui/Button.vue';

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();
const { showSuccess, showError } = useToast();
const { 
  currentTheme, 
  resolvedTheme, 
  setTheme, 
  getThemeIcon, 
  getThemeLabel 
} = useTheme();

const themeOptions = [
  { value: 'light', label: computed(() => t('settings.lightTheme')), icon: 'light_mode' },
  { value: 'dark', label: computed(() => t('settings.darkTheme')), icon: 'dark_mode' },
  { value: 'auto', label: computed(() => t('settings.autoTheme')), icon: 'brightness_auto' }
];

const getRoleText = (role) => {
  const roleMap = {
    'admin': t('user.admin') || 'Yönetici',
    'teacher': t('user.teacher') || 'Öğretmen',
    'student': t('user.student') || 'Öğrenci'
  };
  return roleMap[role] || role;
};

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const handlePasswordChange = () => {
  showError('Şifre değiştirme özelliği henüz aktif değil');
  // TODO: Implement password change functionality
};

const handleLogout = () => {
  authStore.logout();
  showSuccess('Başarıyla çıkış yapıldı');
  router.push('/login');
};
</script>

<style scoped lang="scss">
@import "../assets/styles/_framework.scss";

.settings-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  padding: 20px;
  background: var(--bg-primary);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-primary);
}

.header-content {
  h2 {
    font-size: 24px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 8px 0;
  }
  
  p {
    color: var(--text-secondary);
    font-size: 14px;
    margin: 0;
  }
}

.settings-content {
  display: grid;
  gap: 24px;
}

.settings-card {
  background: var(--bg-primary);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-primary);
  overflow: hidden;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: var(--shadow-md);
  }
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-bottom: 1px solid var(--border-primary);
  background: var(--bg-secondary);
}

.card-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .material-symbols-outlined {
    color: white;
    font-size: 24px;
  }
}

.card-title {
  flex: 1;
  
  h3 {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 4px 0;
  }
  
  p {
    font-size: 14px;
    color: var(--text-secondary);
    margin: 0;
  }
}

// Theme Settings Styles
.theme-options {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.theme-current {
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-primary);
}

.theme-preview {
  display: flex;
  align-items: center;
  gap: 16px;
}

.theme-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .material-symbols-outlined {
    color: white;
    font-size: 24px;
  }
}

.theme-info {
  h4 {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 4px 0;
  }
  
  p {
    font-size: 14px;
    color: var(--text-secondary);
    margin: 0;
  }
}

.theme-selector {
  .theme-buttons {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
  }
}

.theme-button {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 2px solid var(--border-primary);
  border-radius: 12px;
  background: var(--bg-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  
  &:hover {
    border-color: #667eea;
    box-shadow: var(--shadow-sm);
  }
  
  &.active {
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.05);
  }
  
  .material-symbols-outlined {
    font-size: 20px;
    color: var(--text-secondary);
  }
  
  .theme-label {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
    flex: 1;
  }
  
  .theme-check {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 20px;
    height: 20px;
    background: #667eea;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .material-symbols-outlined {
      font-size: 14px;
      color: white;
    }
  }
}

.theme-description {
  .description-text {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.5;
    
    .material-symbols-outlined {
      font-size: 16px;
      color: var(--text-tertiary);
      margin-top: 2px;
      flex-shrink: 0;
    }
    
    strong {
      color: var(--text-primary);
      font-weight: 600;
    }
  }
}

.card-content {
  padding: 24px;
}

.profile-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.profile-avatar-section {
  display: flex;
  align-items: center;
  gap: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f1f3f4;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 600;
  flex-shrink: 0;
}

.profile-basic {
  h4 {
    font-size: 20px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0 0 8px 0;
  }
}

.role-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  &.admin {
    background: #fee2e2;
    color: #991b1b;
  }
  
  &.teacher {
    background: #dbeafe;
    color: #1e40af;
  }
  
  &.student {
    background: #dcfce7;
    color: #166534;
  }
}

.profile-details {
  .detail-group {
    display: grid;
    gap: 20px;
  }
}

.detail-item {
  label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
    margin-bottom: 8px;
  }
}

.detail-value {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  color: var(--text-primary);
  
  .material-symbols-outlined {
    font-size: 18px;
    color: var(--text-secondary);
  }
  
  .status-active {
    color: #059669;
    font-weight: 500;
  }
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.system-info {
  display: grid;
  gap: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-primary);
  
  &:last-child {
    border-bottom: none;
  }
}

.info-label {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
}

.info-value {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
}

@media (max-width: 768px) {
  .settings-container {
    padding: 16px;
  }
  
  .profile-avatar-section {
    flex-direction: column;
    text-align: center;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .action-buttons > * {
    width: 100%;
  }
}
</style>
