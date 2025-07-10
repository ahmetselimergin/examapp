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
  console.log('toggle!');
}
const handleLogout = () => {
     authStore.logout();
     router.push('/login');
};

</script>

<template>
<nav class="sidebar" :class="{ 'is-active': isMenuOpen, 'is-collapsed': isCollapsed }">
     <div :class="isCollapsed ? 'sidebar-header-collapsed' : 'sidebar-header'">
          <router-link to="/" class="sidebar-brand">
               <span v-if="!isCollapsed">Exam App</span>
          </router-link>
          <button class="toggle-btn"  @click="onToggleSidebar" :title="isCollapsed ? 'Genişlet' : 'Daralt'">
               <span v-if="!isCollapsed" class="material-symbols-outlined">toggle_on</span>
               <span v-else class="material-symbols-outlined">toggle_off</span>
          </button>

     </div>
     <div class="sidebar-menu">
          <template v-if="authStore.isAuthenticated">
               <div>
               <router-link to="/" :class="isCollapsed ? 'sidebar-item center flex' : 'sidebar-item '" :title="isCollapsed ? t('navbar.home') : ''">
                    <span class="material-symbols-outlined">home</span>
                    <span v-if="!isCollapsed">{{ t('navbar.home') }}</span>
               </router-link>
               
               <router-link to="/exams/create" v-if="authStore.user && (authStore.user.role === 'admin' || authStore.user.role === 'teacher')" :class="isCollapsed ? 'sidebar-item center flex' : 'sidebar-item '" :title="isCollapsed ? t('navbar.createExam') : ''">
                    <span class="material-symbols-outlined">add</span>
                    <span v-if="!isCollapsed">{{ t('navbar.createExam') }}</span>
               </router-link>
               <router-link v-if="authStore.user && authStore.user.role === 'admin'" to="/admin/users" :class="isCollapsed ? 'sidebar-item center flex' : 'sidebar-item '" :title="isCollapsed ? 'Kullanıcılar' : ''">
                    <span class="material-symbols-outlined">group</span>
                    <span v-if="!isCollapsed">{{ t('navbar.users') }}</span>
               </router-link>
               <router-link to="/exams" :class="isCollapsed ? 'sidebar-item center flex' : 'sidebar-item '" :title="isCollapsed ? t('navbar.exams') : ''">
                    <span class="material-symbols-outlined">file_present</span>
                    <span v-if="!isCollapsed">{{ t('navbar.exams') }}</span>
               </router-link>
               <router-link  v-if="authStore.user && (authStore.user.role === 'admin' || authStore.user.role === 'teacher')"  to="/students" :class="isCollapsed ? 'sidebar-item center flex' : 'sidebar-item '" :title="isCollapsed ? 'Öğrenciler' : ''">
                    <span class="material-symbols-outlined">person</span>
                    <span v-if="!isCollapsed">{{ t('navbar.students') }}</span>
               </router-link>
               <router-link  v-if="authStore.user && (authStore.user.role === 'admin' || authStore.user.role === 'teacher')"  to="/question-bank" :class="isCollapsed ? 'sidebar-item center flex' : 'sidebar-item '" :title="isCollapsed ? 'Soru Bankası' : ''">
                    <span class="material-symbols-outlined">rate_review</span>
                    <span v-if="!isCollapsed">{{ t('navbar.questionBank') }}</span>
               </router-link>
          </div>
               <UserDropdown :is-collapsed="isCollapsed" />
          </template>

          <template v-else>
               <router-link to="/login" class="sidebar-item" :title="isCollapsed ? 'Giriş Yap' : ''">
                    <i class="fas fa-sign-in-alt"></i>
                    <span v-if="!isCollapsed">{{ t('navbar.login') }}</span>
               </router-link>
               <router-link to="/register" class="sidebar-item" :title="isCollapsed ? t('navbar.register') : ''">
                    <i class="fas fa-user-plus"></i>
                    <span v-if="!isCollapsed">{{ t('navbar.register') }}</span>
               </router-link>
          </template>
     </div>
</nav>
</template>

<style scoped lang="scss">
@import "../../assets/styles/_framework.scss";

.sidebar {
     position: fixed;
     left: 0;
     top: 0;
     height: 100vh;
     width: 250px;
     background-color: $darker-blue;
     color: white;
     transition: all 0.3s ease;
     z-index: 1000;
}

.sidebar.is-collapsed {
     width: 60px;
}

.sidebar-header {
     display: flex;
     align-items: center;
     justify-content: space-between;
     padding: 1rem;
     border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.sidebar-header-collapsed {
     display: flex;
     align-items: center;
     justify-content: center;
     padding: 1rem 0;
     border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-brand {
     color: white;
     text-decoration: none;
     font-size: 1.5rem;
     font-weight: bold;
     white-space: nowrap;
     overflow: hidden;
}

.toggle-btn {
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: background 0.3s;
}
.toggle-btn:hover {
  background-color: rgba(255,255,255,0.1);
  border-radius: 4px;
}
@media screen and (max-width: 768px) {
  .toggle-btn {
    display: none;
  }
}

.sidebar-menu {
     display: flex;
     flex-direction: column;
     padding: 1rem 0;
     justify-content: space-between;
     height: calc(100% - 75px);;
}

.sidebar-item {
     color: white;
     text-decoration: none;
     padding: 0.75rem;
     display: flex;
     align-items: center;
     gap: 0.75rem;
     transition: background-color 0.3s ease;
     white-space: nowrap;
}

.sidebar-item i {
     width: 20px;
     text-align: center;
     font-size: 1.1rem;
}

.sidebar-item:hover {
     background-color: rgba(255, 255, 255, 0.1);
}

@media screen and (max-width: 768px) {
     .sidebar {
          transform: translateX(-100%);
     }

     .sidebar.is-collapsed {
          transform: translateX(0);
          width: 60px;
     }

     .hamburger {
          display: flex;
     }

     .toggle-btn {
          display: none;
     }
}
</style>
