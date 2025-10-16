<script setup>
import {
     useRouter
} from 'vue-router';
import {
     computed,
     ref
} from 'vue';
import {
     useAuthStore
} from '../../stores/auth';
import UserDropdown from '../ui/UserDropdown.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const { isCollapsed, toggleSidebar } = defineProps({
     isCollapsed: Boolean,
     toggleSidebar: Function
});

const userRole = computed(() => authStore.user?.role || '');
const router = useRouter();
const authStore = useAuthStore();
const isMenuOpen = ref(false);

const toggleMenu = () => {
     isMenuOpen.value = !isMenuOpen.value;
};

function onToggleSidebar() {
  toggleSidebar();
}
const handleLogout = () => {
     authStore.logout();
     router.push('/login');
};

</script>

<template>
<nav class="modern-sidebar" :class="{ 'is-active': isMenuOpen, 'is-collapsed': isCollapsed }">
     <!-- Header Section -->
     <div class="sidebar-header">
          <router-link to="/" class="sidebar-brand">
               <div class="brand-icon">
                    <span class="material-symbols-outlined">school</span>
               </div>
               <span v-if="!isCollapsed" class="brand-text">Exam App</span>
          </router-link>
          <button class="toggle-btn" @click="onToggleSidebar" :title="isCollapsed ? 'Genişlet' : 'Daralt'">
               <span class="material-symbols-outlined">{{ isCollapsed ? 'chevron_right' : 'chevron_left' }}</span>
          </button>
     </div>

     <!-- Navigation Menu -->
     <div class="sidebar-content">
          <div class="nav-section">
               <div class="nav-group">
                    <div class="nav-group-title" v-if="!isCollapsed">Main</div>
                    
                    <template v-if="authStore.isAuthenticated">
                         <router-link to="/" class="nav-item" :class="{ 'active': $route.path === '/' }" :title="isCollapsed ? t('navbar.home') : ''">
                              <div class="nav-icon">
                                   <span class="material-symbols-outlined">dashboard</span>
                              </div>
                              <span v-if="!isCollapsed" class="nav-text">{{ t('navbar.home') }}</span>
                         </router-link>
                         
                         
                         <router-link v-if="authStore.user && authStore.user.role === 'admin'" to="/admin/users" class="nav-item" :class="{ 'active': $route.path === '/admin/users' }" :title="isCollapsed ? 'Kullanıcılar' : ''">
                              <div class="nav-icon">
                                   <span class="material-symbols-outlined">group</span>
                              </div>
                              <span v-if="!isCollapsed" class="nav-text">{{ t('navbar.users') }}</span>
                         </router-link>
                         
                         <router-link to="/exams" class="nav-item" :class="{ 'active': $route.path.startsWith('/exams') }" :title="isCollapsed ? t('navbar.exams') : ''">
                              <div class="nav-icon">
                                   <span class="material-symbols-outlined">quiz</span>
                              </div>
                              <span v-if="!isCollapsed" class="nav-text">{{ t('navbar.exams') }}</span>
                         </router-link>
                         
                         <router-link v-if="authStore.user && (authStore.user.role === 'admin' || authStore.user.role === 'teacher')" to="/students" class="nav-item" :class="{ 'active': $route.path === '/students' }" :title="isCollapsed ? 'Öğrenciler' : ''">
                              <div class="nav-icon">
                                   <span class="material-symbols-outlined">school</span>
                              </div>
                              <span v-if="!isCollapsed" class="nav-text">{{ t('navbar.students') }}</span>
                         </router-link>
                         
                         <router-link v-if="authStore.user && (authStore.user.role === 'admin' || authStore.user.role === 'teacher')" to="/question-bank" class="nav-item" :class="{ 'active': $route.path === '/question-bank' }" :title="isCollapsed ? 'Soru Bankası' : ''">
                              <div class="nav-icon">
                                   <span class="material-symbols-outlined">library_books</span>
                              </div>
                              <span v-if="!isCollapsed" class="nav-text">{{ t('navbar.questionBank') }}</span>
                         </router-link>
                    </template>
               </div>

               <!-- Help Section -->
               <div class="nav-group" v-if="!isCollapsed">
                    <div class="nav-group-title">Help</div>
                    
                    <router-link to="/settings" class="nav-item" :class="{ 'active': $route.path === '/settings' }" :title="isCollapsed ? 'Ayarlar' : ''">
                         <div class="nav-icon">
                              <span class="material-symbols-outlined">settings</span>
                         </div>
                         <span v-if="!isCollapsed" class="nav-text">{{ t('navbar.settings') }}</span>
                    </router-link>
                    
                    
               </div>
          </div>

          <!-- User Section -->
          <div class="sidebar-footer">
               <UserDropdown ref="userDropdownRef" :is-collapsed="isCollapsed" />
          </div>
     </div>

     <!-- Login for non-authenticated users -->
     <template v-if="!authStore.isAuthenticated">
          <div class="auth-section">
               <router-link to="/login" class="auth-item" :title="isCollapsed ? 'Giriş Yap' : ''">
                    <div class="nav-icon">
                         <span class="material-symbols-outlined">login</span>
                    </div>
                    <span v-if="!isCollapsed" class="nav-text">{{ t('navbar.login') }}</span>
               </router-link>
          </div>
     </template>
</nav>
</template>

<style scoped lang="scss">
@import "../../assets/styles/_framework.scss";

.modern-sidebar {
     position: fixed;
     left: 0;
     top: 0;
     height: 100vh;
     width: 280px;
     background: var(--bg-primary);
     border-right: 1px solid var(--border-primary);
     transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
     z-index: 1000;
     display: flex;
     flex-direction: column;
     box-shadow: var(--shadow-md);
}

.modern-sidebar.is-collapsed {
     width: 72px;
}

// Header Section
.sidebar-header {
     display: flex;
     align-items: center;
     justify-content: space-between;
     padding: 24px 20px;
     border-bottom: 1px solid var(--border-primary);
     background: var(--bg-secondary);
     min-height: 80px;
}

.sidebar-brand {
     display: flex;
     align-items: center;
     gap: 12px;
     text-decoration: none;
     color: var(--text-primary);
     font-weight: 700;
     font-size: 20px;
     transition: all 0.2s ease;
     
     .brand-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 20px;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
     }
     
     .brand-text {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
     }
}

.toggle-btn {
     width: 36px;
     height: 36px;
     border: none;
     background: var(--bg-tertiary);
     border-radius: 8px;
     display: flex;
     align-items: center;
     justify-content: center;
     cursor: pointer;
     transition: all 0.2s ease;
     color: var(--text-secondary);
     
     &:hover {
          background: var(--border-secondary);
          color: var(--text-primary);
     }
     
     .material-symbols-outlined {
          font-size: 18px;
     }
}

// Content Section
.sidebar-content {
     flex: 1;
     display: flex;
     flex-direction: column;
     padding: 20px 0;
     overflow-y: auto;
}

.nav-section {
     flex: 1;
     padding: 0 16px;
}

.nav-group {
     margin-bottom: 32px;
     
     &:last-child {
          margin-bottom: 0;
     }
}

.nav-group-title {
     font-size: 12px;
     font-weight: 600;
     color: var(--text-tertiary);
     text-transform: uppercase;
     letter-spacing: 0.05em;
     margin-bottom: 12px;
     padding: 0 12px;
}

.nav-item {
     display: flex;
     align-items: center;
     gap: 12px;
     padding: 12px;
     margin-bottom: 4px;
     border-radius: 12px;
     text-decoration: none;
     color: var(--text-secondary);
     font-weight: 500;
     font-size: 14px;
     transition: all 0.2s ease;
     position: relative;
     cursor: pointer;
     
     &:hover {
          background: var(--bg-secondary);
          color: var(--text-primary);
          transform: translateX(2px);
     }
     
     &.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
          
          .nav-icon {
               color: white;
          }
          
          .nav-text {
               color: white;
               font-weight: 600;
          }
     }
     
     .nav-icon {
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-tertiary);
          transition: all 0.2s ease;
          
          .material-symbols-outlined {
               font-size: 20px;
          }
     }
     
     .nav-text {
          color: var(--text-secondary);
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          transition: all 0.2s ease;
     }
}

// Collapsed State
.modern-sidebar.is-collapsed {
     .sidebar-brand .brand-text {
          display: none;
     }
     
     .nav-group-title {
          display: none;
     }
     
     .nav-text {
          display: none;
     }
     
     .nav-item {
          justify-content: center;
          padding: 12px;
     }
     
     .sidebar-header {
          justify-content: center;
          padding: 24px 16px;
     }
}

// Footer Section
.sidebar-footer {
     padding: 20px 16px;
     border-top: 1px solid #f1f3f4;
     margin-top: auto;
}

// Auth Section
.auth-section {
     padding: 20px 16px;
     border-top: 1px solid #f1f3f4;
}

.auth-item {
     display: flex;
     align-items: center;
     gap: 12px;
     padding: 12px;
     margin-bottom: 8px;
     border-radius: 12px;
     text-decoration: none;
     color: #6b7280;
     font-weight: 500;
     font-size: 14px;
     transition: all 0.2s ease;
     
     &:hover {
          background: #f8fafc;
          color: #374151;
     }
     
     .nav-icon {
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9ca3af;
          
          .material-symbols-outlined {
               font-size: 20px;
          }
     }
     
     .nav-text {
          color: #6b7280;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
     }
}

// Mobile Responsive
@media screen and (max-width: 768px) {
     .modern-sidebar {
          transform: translateX(-100%);
          width: 280px;
     }
     
     .modern-sidebar.is-active {
          transform: translateX(0);
     }
     
     .modern-sidebar.is-collapsed {
          transform: translateX(-100%);
     }
}

// Scrollbar Styling
.sidebar-content::-webkit-scrollbar {
     width: 4px;
}

.sidebar-content::-webkit-scrollbar-track {
     background: transparent;
}

.sidebar-content::-webkit-scrollbar-thumb {
     background: #e5e7eb;
     border-radius: 2px;
}

.sidebar-content::-webkit-scrollbar-thumb:hover {
     background: #d1d5db;
}
</style>
