<template>
  <div class="quick-actions">
     <span class="quick-actions-title">{{ t('navbar.quickActions') }}</span>
     <hr>
    <router-link to="/exams/create" class="quick-action-item exam">
      <span class="material-symbols-outlined">add</span>
      <span>{{ t('navbar.createExam') }}</span>
     </router-link>
     <router-link to="/students" class="quick-action-item student">
      <span class="material-symbols-outlined">person_add</span>
      <span>{{ t('navbar.students') }}</span>
     </router-link>
     <router-link v-if="authStore.user?.role === 'admin'" to="/admin/users" class="quick-action-item user">
      <span class="material-symbols-outlined">person_add</span>
      <span>{{ t('navbar.users') }}</span>
     </router-link>
     <router-link to="/question-bank" class="quick-action-item question-bank">
      <span class="material-symbols-outlined">rate_review</span>
      <span>{{ t('navbar.questionBank') }}</span>
     </router-link>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const authStore = useAuthStore();
const { t } = useI18n();
</script>

<style scoped lang="scss">
.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background-color: white;
  border-radius: 0.5rem;
  padding: 1rem;
  .quick-actions-title {
    font-size: 1rem;
    font-weight: 600;
  }
  .quick-action-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    border-radius: 0.5rem;
    font-weight: 600;
    font-size: .85rem;
    text-decoration: none;
    cursor: pointer;     
    &.exam {
      background-color: rgb(239 246 255 / 1);
      color: rgb(37 99 235 / 1);
      &:hover {
        background-color: rgb(219 234 254 / 1);
      }
    }
    &.student {
      background-color: rgb(250 245 255  / 1);
      color: rgb(147 51 234 / 1);
      &:hover {
        background-color: rgb(243 232 255 / 1);
      }
    }
    &.user {
      background-color: rgb(240 253 244 / 1);
      color: rgb(22 163 74 / 1);
      &:hover {
        background-color: rgb(220 252 231 / 1);
      }
    }
    &.question-bank {
      background-color: rgb(255 251 235 / 1);
      color: rgb(217 119 6 / 1);
      &:hover {
        background-color: rgb(254 243 199 / 1);
      }
    }
  }
}
</style>
