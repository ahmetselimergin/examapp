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
              :text="$t('common.logout')"
            />
          </div>
        </div>
      </div>

      <!-- Backup and Restore Section (Only for Admins) -->
      <div v-if="authStore.user?.role === 'admin'" class="settings-card">
        <div class="card-header">
          <div class="card-icon">
            <span class="material-symbols-outlined">backup</span>
          </div>
          <div class="card-title">
            <h3>{{ $t('settings.backup') }}</h3>
            <p>{{ $t('settings.backupDescription') }}</p>
          </div>
        </div>
        
        <div class="card-content">
          <!-- Backup Info -->
          <div v-if="backupInfo" class="backup-info">
            <div class="info-grid">
              <div class="info-stat">
                <span class="stat-number">{{ backupInfo.totalRecords.users }}</span>
                <span class="stat-label">{{ $t('settings.totalUsers') }}</span>
              </div>
              <div class="info-stat">
                <span class="stat-number">{{ backupInfo.totalRecords.questions }}</span>
                <span class="stat-label">{{ $t('settings.totalQuestions') }}</span>
              </div>
              <div class="info-stat">
                <span class="stat-number">{{ backupInfo.totalRecords.exams }}</span>
                <span class="stat-label">{{ $t('settings.totalExams') }}</span>
              </div>
              <div class="info-stat">
                <span class="stat-number">{{ backupInfo.totalRecords.studentAnswers }}</span>
                <span class="stat-label">{{ $t('settings.totalAnswers') }}</span>
              </div>
            </div>
          </div>

          <!-- Export Section -->
          <div class="backup-section">
            <div class="section-header">
              <h4>{{ $t('settings.exportData') }}</h4>
              <p>{{ $t('settings.exportDescription') }}</p>
            </div>
            
            <div class="export-options">
              <label class="checkbox-label">
                <input type="checkbox" v-model="exportOptions.includePasswords" />
                <span>{{ $t('settings.includePasswords') }}</span>
              </label>
              
              <div v-if="exportOptions.includePasswords" class="export-warning">
                <span class="material-symbols-outlined">warning</span>
                <div>
                  <strong>{{ $t('settings.passwordWarning') }}</strong>
                  <br>
                  <small>{{ $t('settings.defaultPassword') }}</small>
                </div>
              </div>
            </div>
            
            <div class="action-buttons">
              <Button 
                @click="handleExport"
                styleType="primary"
                size="medium"
                icon="download"
                :text="$t('settings.exportData')"
                :loading="exportLoading"
                :disabled="exportLoading"
              />
            </div>
          </div>

          <!-- Import Section -->
          <div class="backup-section">
            <div class="section-header">
              <h4>{{ $t('settings.importData') }}</h4>
              <p>{{ $t('settings.importDescription') }}</p>
            </div>
            
            <div class="import-controls">
              <div class="file-input-wrapper">
                <input 
                  type="file" 
                  ref="fileInput"
                  @change="handleFileSelect"
                  accept=".json"
                  style="display: none"
                />
                <Button 
                  @click="$refs.fileInput.click()"
                  styleType="secondary"
                  size="medium"
                  icon="upload_file"
                  :text="selectedFile ? selectedFile.name : $t('settings.selectFile')"
                />
              </div>
              
              <div v-if="selectedFile" class="import-options">
                <div class="option-group">
                  <h5 style="margin: 0 0 12px 0; color: var(--text-primary); font-size: 16px;">
                    {{ $t('settings.importOptions') }}
                  </h5>
                  
                  <label class="checkbox-label">
                    <input type="checkbox" v-model="importOptions.clearExisting" />
                    <div>
                      <strong>{{ $t('settings.clearExisting') }}</strong>
                      <br>
                      <small style="color: var(--text-tertiary);">Mevcut tüm veriler silinecek</small>
                    </div>
                  </label>
                  
                  <label class="checkbox-label">
                    <input type="checkbox" v-model="importOptions.skipExisting" />
                    <div>
                      <strong>{{ $t('settings.skipExisting') }}</strong>
                      <br>
                      <small style="color: var(--text-tertiary);">Aynı kayıtlar atlanacak</small>
                    </div>
                  </label>
                </div>
                
                <div class="import-warning">
                  <span class="material-symbols-outlined">warning</span>
                  <div>
                    <strong>{{ $t('settings.importWarning') }}</strong>
                    <br>
                    <small>Bu işlem geri alınamaz. Devam etmeden önce yedek aldığınızdan emin olun.</small>
                  </div>
                </div>
                
                <div class="action-buttons">
                  <Button 
                    @click="handleImport"
                    styleType="warning"
                    size="medium"
                    icon="upload"
                    :text="$t('settings.confirmImport')"
                    :loading="importLoading"
                    :disabled="importLoading || !selectedFile"
                  />
                </div>
              </div>
            </div>
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
              <span class="info-value">{{ $t('settings.examAppTeam') }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useI18n } from 'vue-i18n';
import { useToast } from '../composables/useToast';
import { useTheme } from '../composables/useTheme';
import LanguageSwitcher from '../components/LanguageSwitcher.vue';
import Button from '../components/ui/Button.vue';
import api from '../services/api';

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

// Backup related refs
const backupInfo = ref(null);
const exportLoading = ref(false);
const importLoading = ref(false);
const selectedFile = ref(null);
const fileInput = ref(null);
const importOptions = ref({
  clearExisting: false,
  skipExisting: true
});

const exportOptions = ref({
  includePasswords: false
});

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
  showError(t('settings.passwordChangeNotAvailable'));
  // TODO: Implement password change functionality
};

const handleLogout = () => {
  authStore.logout();
  showSuccess(t('settings.logoutSuccess'));
  router.push('/login');
};

// Backup functions
const loadBackupInfo = async () => {
  if (authStore.user?.role !== 'admin') return;
  
  try {
    const response = await api.get('/backup/info');
    backupInfo.value = response.data;
  } catch (error) {
    console.error('Backup info loading error:', error);
  }
};

const handleExport = async () => {
  exportLoading.value = true;
  try {
    const params = new URLSearchParams();
    if (exportOptions.value.includePasswords) {
      params.append('includePasswords', 'true');
    }
    
    const response = await api.get(`/backup/export?${params.toString()}`, {
      responseType: 'blob'
    });
    
    // Create download link
    const blob = new Blob([response.data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `examapp-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    showSuccess(t('settings.exportSuccess'));
  } catch (error) {
    console.error('Export error:', error);
    showError(t('settings.exportError'));
  } finally {
    exportLoading.value = false;
  }
};

const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (file && file.type === 'application/json') {
    selectedFile.value = file;
  } else {
    showError(t('settings.selectValidJsonFile'));
    selectedFile.value = null;
  }
};

const handleImport = async () => {
  if (!selectedFile.value) return;
  
  importLoading.value = true;
  try {
    const fileContent = await selectedFile.value.text();
    const importData = JSON.parse(fileContent);
    
    const response = await api.post('/backup/import', {
      data: importData.data,
      options: importOptions.value
    });
    
    showSuccess(t('settings.importSuccess'));
    
    // Reset form
    selectedFile.value = null;
    fileInput.value.value = '';
    importOptions.value = {
      clearExisting: false,
      skipExisting: true
    };
    
    // Reload backup info
    await loadBackupInfo();
    
  } catch (error) {
    console.error('Import error:', error);
    showError(t('settings.importError'));
  } finally {
    importLoading.value = false;
  }
};

// Load backup info on mount
onMounted(() => {
  loadBackupInfo();
});
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
    color: var(--text-primary);
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
  margin-top: 16px;
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

// Backup & Restore Styles
.backup-info {
  margin-bottom: 24px;
  padding: 20px;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-primary);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 20px;
}

.info-stat {
  text-align: center;
  padding: 16px;
  background: var(--bg-primary);
  border-radius: 8px;
  border: 1px solid var(--border-secondary);
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
  
  .stat-number {
    display: block;
    font-size: 28px;
    font-weight: 700;
    color: #667eea;
    margin-bottom: 8px;
    line-height: 1;
  }
  
  .stat-label {
    font-size: 13px;
    color: var(--text-secondary);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
}

.backup-section {
  padding: 24px 0;
  border-top: 1px solid var(--border-primary);
  
  &:first-child {
    border-top: none;
    padding-top: 0;
  }
}

.section-header {
  margin-bottom: 20px;
  
  h4 {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 6px 0;
    display: flex;
    align-items: center;
    gap: 8px;
    
    &::before {
      content: '';
      width: 4px;
      height: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 2px;
    }
  }
  
  p {
    font-size: 14px;
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.5;
  }
}

.export-options {
  margin-bottom: 20px;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-primary);
}

.import-controls {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.file-input-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.import-options {
  padding: 20px;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-primary);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-size: 14px;
  color: var(--text-primary);
  padding: 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--bg-tertiary);
  }
  
  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    border: 2px solid var(--border-secondary);
    border-radius: 4px;
    background: var(--bg-primary);
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:checked {
      background: #667eea;
      border-color: #667eea;
      position: relative;
      
      &::after {
        content: '✓';
        position: absolute;
        top: -2px;
        left: 2px;
        color: white;
        font-size: 12px;
        font-weight: bold;
      }
    }
  }
}

.import-warning, .export-warning {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 8px;
  color: #d97706;
  font-size: 14px;
  line-height: 1.5;
  
  .material-symbols-outlined {
    font-size: 20px;
    color: #f59e0b;
    flex-shrink: 0;
    margin-top: 1px;
  }
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
