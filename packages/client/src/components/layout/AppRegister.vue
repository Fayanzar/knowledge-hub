<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore();
const router = useRouter();

const email = ref('');
const password = ref('');
const name = ref('');

const register = async () => {
  const payload = {
    name: name.value,
    email: email.value,
    password: password.value
  };
  await authStore.register(payload);

  router.push('/');
}
</script>

<template>
  <div class="flex gap-2">
    <input type="name" class="input input-bordered w-full pl-10" v-model="name" placeholder="Name" />
    <input type="email" class="input input-bordered w-full pl-10" v-model="email" placeholder="Email" />
    <input type="password" class="input input-bordered w-full pl-10" v-model="password" placeholder="Password" />
    <button @click="register" class="btn btn-primary">Sign Up</button>
  </div>
</template>
