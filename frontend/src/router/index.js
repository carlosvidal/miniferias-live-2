import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { requiresAuth: false, guest: true }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/auth/RegisterView.vue'),
      meta: { requiresAuth: false, guest: true }
    },
    {
      path: '/events/:slug',
      name: 'event-detail',
      component: () => import('@/views/events/EventDetailView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/booths/:id',
      name: 'booth-detail',
      component: () => import('@/views/booths/BoothDetailView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfileView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/orders',
      name: 'my-orders',
      component: () => import('@/views/orders/MyOrdersView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: () => import('@/views/orders/CheckoutView.vue'),
      meta: { requiresAuth: true }
    },
    // Admin routes
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/views/admin/AdminLayout.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
      children: [
        {
          path: '',
          name: 'admin-dashboard',
          component: () => import('@/views/admin/DashboardView.vue')
        },
        {
          path: 'events',
          name: 'admin-events',
          component: () => import('@/views/admin/EventsView.vue')
        },
        {
          path: 'booths',
          name: 'admin-booths',
          component: () => import('@/views/admin/BoothsView.vue')
        }
      ]
    },
    // Exhibitor routes
    {
      path: '/exhibitor',
      name: 'exhibitor',
      component: () => import('@/views/exhibitor/ExhibitorLayout.vue'),
      meta: { requiresAuth: true, role: 'EXHIBITOR' },
      children: [
        {
          path: '',
          name: 'exhibitor-dashboard',
          component: () => import('@/views/exhibitor/DashboardView.vue')
        },
        {
          path: 'booth',
          name: 'exhibitor-booth',
          component: () => import('@/views/exhibitor/BoothSetupView.vue')
        },
        {
          path: 'products',
          name: 'exhibitor-products',
          component: () => import('@/views/exhibitor/ProductsView.vue')
        },
        {
          path: 'orders',
          name: 'exhibitor-orders',
          component: () => import('@/views/exhibitor/OrdersView.vue')
        },
        {
          path: 'live',
          name: 'exhibitor-live',
          component: () => import('@/views/exhibitor/LiveStreamView.vue')
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue')
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Check if route requires authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }

  // Check if route is for guests only
  if (to.meta.guest && authStore.isAuthenticated) {
    next({ name: 'home' })
    return
  }

  // Check role-based access
  if (to.meta.role && authStore.user?.role !== to.meta.role) {
    next({ name: 'home' })
    return
  }

  next()
})

export default router
