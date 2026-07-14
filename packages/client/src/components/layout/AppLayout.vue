<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import AppHeader from './AppHeader.vue';
import AppSidebar from './AppSidebar.vue';

const authStore = useAuthStore();

const mobileSidebarOpen = ref(false)

const toggleMobileSidebar = () => {
  mobileSidebarOpen.value = !mobileSidebarOpen.value
}

onMounted(() => {
  const handleResize = () => {
    if (window.innerWidth >= 768) {
      mobileSidebarOpen.value = false
    }
  }

  window.addEventListener('resize', handleResize)
})
</script>

<style scoped>
main {
  transition: margin-left 0.3s ease;
}
</style>

<template>
  <div class="bg-base-100 w-full">
    <AppHeader @toggle-sidebar="toggleMobileSidebar"/>
    <div class="flex">
      <AppSidebar
        v-if="authStore.user"
        :is-mobile-open="mobileSidebarOpen"
        @close-sidebar="mobileSidebarOpen = false"
      />
      <main class="flex-1 p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>
