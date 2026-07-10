import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import AppLogin from '@/components/layout/AppLogin.vue'
import AppRegister from '@/components/layout/AppRegister.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: AppLayout,
      children: [
        {
          path: 'resources',
          name: "Resources",
          component: () => import('../views/ResourcesView.vue')
        },
        {
          path: 'tags',
          name: "Tags",
          component: () => import('../views/TagsView.vue')
        },
        {
          path: 'favorites',
          name: "Favorites",
          component: () => import('../views/FavoritesView.vue')
        },
        {
          path: 'archive',
          name: "Archive",
          component: () => import('../views/ArchiveView.vue')
        },
        {
          path: 'analytics',
          name: "Analytics",
          component: () => import('../views/AnalyticsView.vue')
        },
        {
          path: 'settings',
          name: "Settings",
          component: () => import('../views/SettingsView.vue')
        },
        {
          path: 'profile',
          name: "Profile",
          component: () => import('../views/ProfileView.vue')
        }
      ]
    },
    {
      path: '/login',
      name: 'login',
      component: AppLogin
    },
    {
      path: '/register',
      name: 'register',
      component: AppRegister
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
  ],
})

export default router
