<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { ChevronLeftIcon, ChevronRightIcon, HomeIcon, BookmarkIcon, TagIcon, StarIcon,
  InboxIcon, ChartBarIcon, Cog6ToothIcon, PlusIcon
 } from '@heroicons/vue/24/solid';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute()
const router = useRouter()

const expanded = ref(true)
const showAllTags = ref(false)
const showTagModal = ref(false)
const isMobile = ref(false)

const emit = defineEmits(['close-sidebar'])
const props = defineProps({
  isMobileOpen: {
    type: Boolean,
    default: false
  }
})

interface NavItem {
  path: string,
  name: string,
  badge?: number
}

interface Tag {
  id: number,
  name: string,
  color: string,
  count: number
}

const isActive = (item: NavItem) => {
  return route.path === item.path || route.path.startsWith(item.path + '/')
}

const stats = ref({
  totalResources: 147,
  totalTags: 32,
  unreadResources: 8
})

const toggleExpand = () => {
  expanded.value = !expanded.value;
}

const toggleShowAllTags = () => {
  if (showAllTags.value) {
    displayedTags.value = popularTags.value.slice(0, 5);
  } else {
    displayedTags.value = popularTags.value;
  }
  showAllTags.value = !showAllTags.value;
}

const navItems = [
  { name: 'Dashboard', path: '/', icon: HomeIcon },
  { name: 'Resources', path: '/resources', icon: BookmarkIcon, badge: 12 },
  { name: 'Tags', path: '/tags', icon: TagIcon },
  { name: 'Favorites', path: '/favorites', icon: StarIcon },
  { name: 'Archive', path: '/archive', icon: InboxIcon },
  { name: 'Analytics', path: '/analytics', icon: ChartBarIcon },
  { name: 'Settings', path: '/settings', icon: Cog6ToothIcon }
]

const popularTags = ref([
  { id: 1, name: 'Vue.js', color: '#42b883', count: 24 },
  { id: 2, name: 'JavaScript', color: '#f7df1e', count: 18 },
  { id: 3, name: 'Interview', color: '#3b82f6', count: 12 },
  { id: 4, name: 'Backend', color: '#ef4444', count: 8 },
  { id: 5, name: 'DevOps', color: '#8b5cf6', count: 5 },
  { id: 6, name: 'Design', color: '#ec4899', count: 3 }
])

const displayedTags = ref<Tag[]>([])
displayedTags.value = popularTags.value.slice(0, 5);

const filterByTag = (tagName: string) => {
  router.push({
    name: 'Resources',
    query: { tag: tagName.toLowerCase() }
  })
  emit('close-sidebar')
}

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
  if (!isMobile.value) {
    expanded.value = true
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<template>
  <aside
    :class="[
      'sidebar bg-base-100 border-r border-gray-200 dark:border-gray-700 transition-all duration-300',
      { 'w-64': expanded, 'w-20': !expanded },
      { 'hidden': !isMobileOpen && isMobile },
      { 'fixed md:relative z-30 h-screen': isMobile }
    ]"
  >
    <div
      v-if="isMobile && isMobileOpen"
      class="md:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
      @click="$emit('close-sidebar')"
    ></div>

    <div class="h-full flex flex-col">
      <div class="hidden md:flex justify-end pr-4 pl-4 pt-4">
        <button
          type="button"
          @click="toggleExpand"
          class="btn btn-primary"
          aria-label="Toggle sidebar"
        >
          <ChevronLeftIcon class="h-5 w-5 transition-transform" v-if="expanded" />
          <ChevronRightIcon class="h-5 w-5 transition-transform" v-else />
        </button>
      </div>

      <nav class="flex-1 px-3 py-4">
        <ul class="space-y-1">
          <li v-for="item in navItems" :key="item.name">
            <router-link
              :to="item.path"
              :class="[
                'flex items-center rounded-lg px-3 py-3 transition-colors',
                isActive(item)
                  ? 'bg-primary text-primary-content font-semibold'
                  : 'hover:bg-base-200 text-gray-700 dark:text-gray-300'
              ]"
              @click="isMobile && $emit('close-sidebar')"
            >
              <component :is="item.icon" class="h-5 w-6 shrink-0 pr-1" />
              <span :class="['ml-3 transition-all pr-2', { 'opacity-0 w-0': !expanded }]">
                {{ item.name }}
              </span>
              <span
                v-if="item.badge"
                :class="[
                  'ml-auto badge badge-sm transition-all',
                  { 'opacity-0': !expanded }
                ]"
              >
                {{ item.badge }}
              </span>
            </router-link>
          </li>
        </ul>

        <!-- Divider -->
        <div class="my-6 border-t border-gray-200 dark:border-gray-700 transition-all duration-300"
        :class="expanded ? 'opacity-100' : 'opacity-0'"></div>

        <!-- Tags section -->
        <div class="px-3 mb-4 overflow-hidden transition-all duration-500 ease-out">
          <div class="flex items-center justify-between mb-2 transition-all duration-300"
          :class="expanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'">
            <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 transition-all duration-300 ease-out overflow-hidden"
            :style="{
                'max-height': expanded ? '30px' : '0',
                'opacity': expanded ? 1 : 0,
              }">TAGS</h3>
            <button
              v-if="expanded"
              @click="showTagModal = true"
              class="btn btn-ghost btn-xs transition-all duration-300 hover:scale-110"
              aria-label="Add tag"
            >
              <PlusIcon class="h-4 w-4" />
            </button>
          </div>

          <ul class="space-y-1">
            <li
              v-for="(tag, index) in displayedTags"
              :key="tag.id"
              class="transition-all duration-300 ease-out overflow-hidden"
              :style="{
                'max-height': expanded ? '48px' : '0',
                'opacity': expanded ? 1 : 0,
                'transform': expanded ? 'translateX(0)' : 'translateX(-10px)',
                'transition-delay': expanded ? `${index * 50}ms` : `${(displayedTags.length - index - 1) * 50}ms`
              }"
            >
              <button
                @click="filterByTag(tag.name)"
                class="flex items-center w-full text-left px-3 py-2 rounded-lg transition-colors hover:bg-base-200 text-gray-700 dark:text-gray-300"
              >
                <div
                  class="w-3 h-3 rounded-full mr-2"
                  :style="{ backgroundColor: tag.color }"
                ></div>
                <span class="text-sm flex-1 pl-1">{{ tag.name }}</span>
                <span class="text-xs text-gray-500">{{ tag.count }}</span>
              </button>
            </li>
          </ul>

          <!-- Show more/less button -->
          <button
            v-if="expanded && popularTags.length > 5"
            @click="toggleShowAllTags"
            class="mt-2 text-sm text-primary hover:underline w-full text-left px-3 transition-all duration-300"
            :style="{
              'opacity': expanded ? 1 : 0,
              'transition-delay': expanded ? `${displayedTags.length * 50}ms` : '0ms'
            }"
          >
            {{ showAllTags ? 'Show less' : 'Show all...' }}
          </button>
        </div>

        <!-- Quick stats (expanded only) -->
        <div class="px-3 mt-6 overflow-hidden transition-all duration-300"
        :class="expanded ? 'opacity-100' : 'opacity-0'">
          <div class="bg-base-200 rounded-lg p-3 transition-all duration-300"
          :class="expanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'">
            <h4 class="text-xs font-semibold text-gray-500 mb-2 transition-all duration-300 ease-out overflow-hidden"
            :style="{
                'max-height': expanded ? '20px' : '0',
                'opacity': expanded ? 1 : 0,
                'transform': expanded ? 'translateX(0)' : 'translateX(-10px)',
              }">QUICK STATS</h4>
            <div class="space-y-2">
              <div class="flex justify-between text-sm transition-all duration-300 ease-out overflow-hidden"
              :style="{
                'max-height': expanded ? '20px' : '0',
                'opacity': expanded ? 1 : 0,
                'transform': expanded ? 'translateX(0)' : 'translateX(-10px)',
              }">
                <span>Resources</span>
                <span class="font-semibold">{{ stats.totalResources }}</span>
              </div>
              <div class="flex justify-between text-sm transition-all duration-300 ease-out overflow-hidden"
              :style="{
                'max-height': expanded ? '20px' : '0',
                'opacity': expanded ? 1 : 0,
                'transform': expanded ? 'translateX(0)' : 'translateX(-10px)',
              }">
                <span>Tags</span>
                <span class="font-semibold">{{ stats.totalTags }}</span>
              </div>
              <div class="flex justify-between text-sm transition-all duration-300 ease-out overflow-hidden"
              :style="{
                'max-height': expanded ? '20px' : '0',
                'opacity': expanded ? 1 : 0,
                'transform': expanded ? 'translateX(0)' : 'translateX(-10px)',
              }">
                <span>Unread</span>
                <span class="font-semibold">{{ stats.unreadResources }}</span>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  </aside>
</template>
