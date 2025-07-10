<template>
     <div v-if="user">
          <h2>Profil Bilgileri</h2>
          <ul>
               <li><strong>İsim:</strong> {{ user.name }}</li>
               <li><strong>Email:</strong> {{ user.email }}</li>
               <li><strong>Rol:</strong> {{ user.role }}</li>
          </ul>
     </div>
     <div v-else>
          <p>Yükleniyor...</p>
     </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const user = ref(authStore.user);

onMounted(async () => {
     if (!authStore.user) {
          try {
               await authStore.fetchUserProfile();
               user.value = authStore.user;
          } catch (e) {
               // Hata yönetimi ekleyebilirsin
          }
     }
});
</script>