<template>
     <form @submit.prevent="handleRegister">
          <Input v-model="name" type="text" placeholder="Name" required size="large"      />
          <Input v-model="email" type="email" placeholder="Email" required size="large" />
          <Input v-model="password" type="password" placeholder="Password" required size="large" />
          <Select v-model="role"
               placeholder="Select Role"
               size="large"
          >
               <option value="student">Student</option>
               <option value="teacher">Teacher</option>
          </Select>
          <Button size="large" :disabled="authStore.loading" styleType="primary" type="submit">Register</Button>
          <div v-if="authStore.error" style="color:red">{{ authStore.error }}</div>
     </form>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import Input from '../ui/Input.vue';
import Button from '../ui/Button.vue';
import Select from '../ui/Select.vue';

const name = ref('');
const email = ref('');
const password = ref('');
const role = ref('student');
const router = useRouter();
const authStore = useAuthStore();

const handleRegister = async () => {
     try {
          await authStore.register({
               name: name.value,
               email: email.value,
               password: password.value,
               role: role.value,
          });
          router.push('/');
     } catch (e) { }
};
</script>
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