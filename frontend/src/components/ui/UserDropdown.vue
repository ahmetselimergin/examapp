<template>
  <div class="user-dropdown" ref="dropdownRef">
    <button :class="isCollapsed ? 'user-dropdown-button-collapsed' : 'user-dropdown-button'" @click="toggleDropdown">
     <div class="avatar">
          <span class="avatar-initials">
               {{ (user?.name?.[0] || '').toUpperCase() }}
               {{ (user?.surname?.[0] || '').toUpperCase() }}
          </span>
     </div>
     <div class="flex flex-column align-start" v-if="!isCollapsed">
      <span class="username">{{ user?.name }}</span>
      <span class="username-role">{{ user?.role }}</span>
     </div>
    </button>
    <div v-if="isOpen" class="user-dropdown-menu">
      <button @click="openSettings" class="dropdown-item">
        <span class="material-symbols-outlined"> tune </span>
        <span class="dropdown-item-text">{{ t('navbar.settings') }}</span>
      </button>
      <button @click="handleLogout" class="dropdown-item logout-button">
        <span class="material-symbols-outlined"> logout </span>
        <span class="dropdown-item-text">{{ t('common.logout') }}</span>
      </button>
    </div>
    <SettingsModal v-model="isSettingsOpen" />
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth";
import SettingsModal from "./SettingsModal.vue";
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const { isCollapsed } = defineProps({
  isCollapsed: Boolean
});

const router = useRouter();
const authStore = useAuthStore();
const user = computed(() => authStore.user);
const isOpen = ref(false);
const isSettingsOpen = ref(false);
const dropdownRef = ref(null);

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const openSettings = () => {
  isOpen.value = false;
  isSettingsOpen.value = true;
};

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});

const handleLogout = () => {
  authStore.logout();
  router.push("/login");
};
</script>

<style scoped lang="scss">
@import "../../assets/styles/_framework.scss";
.user-dropdown {
  position: relative;
  padding: 0 0.75em;
  display: inline-block;
}
.user-dropdown-button-collapsed {
     background: #fff;
    border: none;
    color: #002e73;
    cursor: pointer;
    padding: 2px 0px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 5px;
    width: 100%;
    min-height: auto;
    .avatar {
    background: $dark-blue;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    color: $white;
    display: flex;
    align-items: center;
    justify-content: center;
    .avatar-initials {
      font-size: 14px;
      font-weight: 500;
    }
  }
}
.user-dropdown-button {
  background: $white;
  border: none;
  color: $dark-blue;
  cursor: pointer;
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: flex-start;
  border-radius: 5px;
  width: 100%;
  min-height: 56px;
  .avatar {
    background: $dark-blue;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    color: $white;
    display: flex;
    align-items: center;
    justify-content: center;
    .avatar-initials {
      font-size: 14px;
      font-weight: 500;
    }
  }
}

.username {
  font-weight: 500;
  font-size: 13px;
  color: $dark-blue;
  font-weight: 600;
}


.user-dropdown-menu {
  position: absolute;
  bottom: calc(100% + 0.5em);
  right: 0;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  min-width: 200px;
  z-index: 1000;
  width: calc(100% - 1em);
  left: 0.5em;
  padding: 0.25em;
}

.dropdown-item {
     display: flex;
    padding: 0.75rem;
    color: #333;
    text-decoration: none;
    border: none;
    background: none;
    width: 100%;
    text-align: left;
    cursor: pointer;
    align-items: center;
    justify-content: flex-start;
    gap: .5em;
    border-radius: 5px;
    opacity: 0.75;
    .dropdown-item-text {
        font-size: 14px !important;
    }
    .material-symbols-outlined {
        font-size: 18px !important;
    }
    &.logout-button {
        background-color: $red;
        color: white;
    }
    &:hover {
        opacity: 1;
    }
}

</style>
