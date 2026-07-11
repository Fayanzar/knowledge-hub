<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore();
const router = useRouter();

const email = ref('');
const password = ref('');

const login = async () => {
  const payload = {
    id: 0,
    email: email.value,
    password: password.value
  };
  await authStore.login(payload);

  router.push('/');
}
</script>

<template>
  <div class="flex gap-2">
    <input type="email" class="input input-bordered w-full pl-10" v-model="email" placeholder="Email" />
    <input type="password" class="input input-bordered w-full pl-10" v-model="password" placeholder="Password" />
    <button @click="login" class="btn btn-primary">Login</button>
  </div>
</template>
