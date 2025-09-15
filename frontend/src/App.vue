<script setup>
import { useRoute } from 'vue-router'
import Navbar from './components/layout/Navbar.vue'
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from './stores/auth'
import Breadcrumb from './components/ui/Breadcrumb.vue'
const route = useRoute()
const authStore = useAuthStore()
const hideNavbarOn = ['/login', '/register']
const shouldShowNavbar = computed(() => !hideNavbarOn.includes(route.path))


import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const breadcrumbItems = computed(() => {
  const pathArray = route.path.split('/').filter(Boolean);
  const items = [];

  // Ana sayfa her zaman ilk
  items.push({ label: t('navbar.home'), to: '/' });

  // Diğer path parçalarını ekle
  pathArray.forEach((segment, idx) => {
    let label = segment;
    // Burada segment'e göre label'ı özelleştirebilirsin
    if (segment === 'exams') label = t('navbar.exams');
    if (segment === 'create') label = t('navbar.createExam');
    if (segment === 'edit') label = t('navbar.editExam');
    if (segment === 'questions') label = t('navbar.questions');
    if (segment === 'question-bank') label = t('navbar.questionBank');
    if (segment === 'users') label = t('navbar.users');
    if (segment === 'admin') label = t('navbar.admin');

    items.push({
      label,
      to: '/' + pathArray.slice(0, idx + 1).join('/')
    });
  });

  return items;
});

onMounted(async () => {
  // Token varsa ama user yoksa, token'ın geçerli olup olmadığını kontrol et
  if (authStore.token && !authStore.user) {
    const isValid = await authStore.validateToken();
    if (!isValid) {
      // Token geçersizse login sayfasına yönlendir
      window.location.href = '/login';
    }
  }
})

const isSidebarCollapsed = ref(false);
const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
  isCollapsed.value = isSidebarCollapsed.value;
};
</script>



<template>
  <div class="app-container">
    <Navbar v-if="shouldShowNavbar" :is-collapsed="isSidebarCollapsed" :toggle-sidebar="toggleSidebar" />
    <main :class="['main-content', { 
      'with-sidebar': shouldShowNavbar,
      'sidebar-collapsed': isSidebarCollapsed && shouldShowNavbar,
      'p-0': !authStore.isAuthenticated
    }]">
      <Breadcrumb 
        v-if="!route.meta?.hideBreadcrumb" 
        class="container-fluid" 
        :items="breadcrumbItems" 
      />
      <div :class="['container-fluid', {
        'p-0': !authStore.isAuthenticated
      }]">
        <router-view></router-view>
      </div>
      <div class="toggle-sidebar-btn" @click="toggleSidebar">
        <span class="material-symbols-outlined">
          {{ isSidebarCollapsed ? 'toggle_on' : 'toggle_off' }}
        </span>
      </div>
    </main>
  </div>
</template>

<style scoped lang="scss">
@import "./assets/styles/_framework.scss";
.app-container {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.main-content {
  padding: 2rem;
  transition: margin-left 0.3s ease;
}

.main-content.with-sidebar {
  width: calc(100% - 280px);
  margin-left: 280px;
}

.main-content.with-sidebar.sidebar-collapsed {
  width: calc(100% - 72px);
  margin-left: 72px;
}

@media screen and (max-width: 768px) {
  .main-content.with-sidebar,
  .main-content.with-sidebar.sidebar-collapsed {
    width:100%;
    margin: 0 !important;
  }
  .toggle-sidebar-btn {
    display: block !important;
    position: absolute;
    top: 2em;
    right: 2em;
}
}
.toggle-sidebar-btn {  
  display: none;
}
</style>

