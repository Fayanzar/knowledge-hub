<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useAuthStore } from '@/stores/auth'
import { useRoute } from 'vue-router'
import router from '@/router';

const authStore = useAuthStore();
const route = useRoute();

const email = ref('');
const isVerifying = ref(false);
const isSuccessfullyVerified = ref(false);
const counter = ref(3);

const sendVerificationEmail = async () => {
  await authStore.sendVerificationEmail(email.value);
}

async function countdown() {
  const n = counter.value;
  for (let i = n; i > 0; i--) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    counter.value--;
  }
  router.push("/");
}

onMounted(async () => {
  const verifyParam = route.query.verify;
  if (verifyParam?.toString().toLowerCase() == "true") {
    isVerifying.value = true;
    const token = String(route.query.token);
    const res = await authStore.verify(token);
    if (res.error == null) {
      isSuccessfullyVerified.value = true;
      countdown();
    } else {
      isVerifying.value = false;
      router.push("/verify-email")
    }
  }
})
</script>

<template>
  <form v-if="!isVerifying"
    @submit.prevent="sendVerificationEmail" class="flex gap-2 h-full items-center">
    <input type="email" class="input input-bordered w-full pl-10" v-model="email" placeholder="Email" />
    <button type="submit" class="btn btn-primary">Send verification email</button>
  </form>

  <div v-if="isSuccessfullyVerified" class="flex gap-2 h-full items-center">
    <p>
      Successfully verified! You will be redirected to the main page in {{ counter }}...
    </p>
  </div>
</template>
