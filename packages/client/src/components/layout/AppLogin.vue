<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore();
const router = useRouter();

const email = ref('');
const password = ref('');

onMounted(() => {
  if (authStore.needsEmailVerified)
    router.push('/verify-email');
});

const login = async () => {
  const payload = {
    id: 0,
    email: email.value,
    password: password.value
  };
  await authStore.login(payload);

  if (authStore.needsEmailVerified)
    router.push('/verify-email');
  else
    router.push('/');
}
</script>

<template>
  <form @submit.prevent="login" class="flex gap-2 h-full items-center">
    <input type="email" class="input input-bordered w-full pl-10" v-model="email" placeholder="Email" />
    <input type="password" class="input input-bordered w-full pl-10" v-model="password" placeholder="Password" />
    <button type="submit" class="btn btn-primary">Login</button>
  </form>
</template>
