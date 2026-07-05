<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

import {
  Bars3Icon,
  MagnifyingGlassIcon,
  SunIcon,
  MoonIcon,
  BellIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  BookOpenIcon,
  ChevronDownIcon
} from '@heroicons/vue/24/outline'

const emit = defineEmits(['toggle-sidebar'])

const authStore = useAuthStore()
const router = useRouter()

const searchQuery = ref('')
const notifications = ref([
  { id: 1, message: 'New resource saved: Vue 3 Guide', time: '5 min ago' },
  { id: 2, message: 'John shared a resource with you', time: '1 hour ago' }
])

const userInitials = computed(() => {
  if (!authStore.user?.name) return 'U'
  return authStore.user.name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})
const unreadNotifications = computed(() => notifications.value.length)

const performSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ name: 'Search', query: { q: searchQuery.value } })
  }
}

const logout = async () => {
  await authStore.logout();
  router.push('/login')
}

onMounted(() => {

})
</script>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 40;
  backdrop-filter: blur(8px);
  background-color: rgba(var(--color-base-100), 0.8);
}

.dropdown-content {
  animation: dropdown-fade 0.2s ease-out;
}

@keyframes dropdown-fade {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

<template>
  <header class="navbar bg-base-100 shadow-sm border-b border-gray-200 dark:border-gray-700">
    <!-- Left side: Logo and mobile menu toggle -->
    <div class="flex-1">
      <div class="flex items-center gap-4">
        <!-- Mobile menu button (hidden on desktop) -->
        <button
          class="lg:hidden btn btn-ghost btn-sm"
          @click="$emit('toggle-sidebar')"
          aria-label="Toggle sidebar"
        >
          <Bars3Icon class="h-5 w-5" />
        </button>

        <!-- Logo and app name -->
        <router-link to="/" class="flex items-center gap-2 no-underline">
          <div class="w-8 h-8 bg-primary text-primary-content rounded-lg flex items-center justify-center">
            <BookOpenIcon class="h-5 w-5" />
          </div>
          <span class="text-xl font-bold text-gray-800 dark:text-white">Knowledge Hub</span>
        </router-link>
      </div>
    </div>

    <!-- Center: Search bar (desktop only) -->
    <div class="flex-1 hidden md:flex justify-center">
      <div class="relative w-full max-w-md">
        <input
          type="text"
          placeholder="Search resources..."
          class="input input-bordered w-full pl-10"
          v-model="searchQuery"
          @keyup.enter="performSearch"
        />
        <MagnifyingGlassIcon class="absolute left-3 top-3 h-5 w-5 text-gray-400" />
      </div>
    </div>

    <!-- Right side: User actions -->
    <div class="flex-none gap-2">
      <!-- Theme toggle -->
      <button
        class="btn btn-ghost btn-circle"

        aria-label="Toggle theme"
      >
        <SunIcon v-if="true" class="h-5 w-5" />
        <MoonIcon v-else class="h-5 w-5" />
      </button>

      <!-- Notifications dropdown -->
      <div class="dropdown dropdown-end">
        <div class="indicator btn btn-ghost btn-circle m-1" role="button" tabindex="0">
          <BellIcon class="h-5 w-5" />
          <span v-if="unreadNotifications" class="badge badge-xs badge-primary indicator-item">
            {{ unreadNotifications }}
          </span>
        </div>
        <div class="dropdown-content z-1 mt-3 card card-compact w-72 bg-base-100 shadow" tabindex="-1">
          <div class="card-body">
            <span class="font-bold text-lg">Notifications</span>
            <div v-if="notifications.length" class="mt-2">
              <div
                v-for="notification in notifications"
                :key="notification.id"
                class="p-2 hover:bg-base-200 rounded cursor-pointer"
              >
                <p class="text-sm">{{ notification.message }}</p>
                <p class="text-xs text-gray-500">{{ notification.time }}</p>
              </div>
            </div>
            <p v-else class="text-gray-500">No new notifications</p>
          </div>
        </div>
      </div>

      <!-- User dropdown -->
      <div class="dropdown dropdown-end" v-if="authStore.user">
        <div class="avatar btn btn-ghost flex items-center gap-2" role="button" tabindex="0">
          <div class="w-8 rounded-full bg-primary text-primary-content flex items-center justify-center">
            {{ userInitials }}
          </div>
          <span class="hidden md:inline">{{ authStore.user.name }}</span>
          <ChevronDownIcon class="h-4 w-4" />
        </div>
        <ul class="dropdown-content z-1 mt-3 p-2 shadow bg-base-100 rounded-box w-52" tabindex="-1">
          <li>
            <router-link to="/profile" class="flex items-center gap-2 p-2 hover:bg-base-200 rounded">
              <UserIcon class="h-4 w-4" />
              Profile
            </router-link>
          </li>
          <li>
            <router-link to="/settings" class="flex items-center gap-2 p-2 hover:bg-base-200 rounded">
              <Cog6ToothIcon class="h-4 w-4" />
              Settings
            </router-link>
          </li>
          <div class="divider my-1"></div>
          <li>
            <button
              @click="logout"
              class="flex items-center gap-2 p-2 hover:bg-base-200 rounded w-full text-left"
            >
              <ArrowRightOnRectangleIcon class="h-4 w-4" />
              Logout
            </button>
          </li>
        </ul>
      </div>

      <!-- Login/Register buttons (when not authenticated) -->
      <div v-else class="flex gap-2">
        <router-link to="/login" class="btn btn-ghost">Login</router-link>
        <router-link to="/register" class="btn btn-primary">Register</router-link>
      </div>
    </div>
  </header>
</template>
