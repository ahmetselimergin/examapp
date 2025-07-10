<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import Input from '../ui/Input.vue';
import Button from '../ui/Button.vue';

const email = ref('');
const password = ref('');
const router = useRouter();
const authStore = useAuthStore();

const handleLogin = async () => {
     try {
          await authStore.login(email.value, password.value);
          router.push('/');
     } catch (e) { }
};
</script>
<template>
     <form @submit.prevent="handleLogin">
          <Input v-model="email" type="email" placeholder="Email" required size="large" />
          <Input v-model="password" type="password" placeholder="Password" required size="large" />
          <Button size="large" :disabled="authStore.loading"  styleType="primary" nativeType="submit">Login</Button>
          <div v-if="authStore.error" style="color:red">{{ authStore.error }}</div>
     </form>
</template>

<style lang="scss" scoped>

form {
     display: flex;
     flex-direction: column;
     align-items: center;
     gap: 1rem;

     padding: 1rem;
     border-radius: 0.5rem;
     button{
          width: 100%;
     }
}
</style>
