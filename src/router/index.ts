/**
 * Application router and navigation guards.
 *
 * Route modules are lazy-loaded to keep the initial bundle small.
 * Auth is enforced via `meta.requiresAuth` / `meta.guestOnly` rather than per-route checks.
 */
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

import { docsSectionIds, type DocsSectionId } from '../data/docs.sections'

const LandingView = () => import('../views/LandingView.vue')
const DocsView = () => import('../views/DocsView.vue')
const LoginView = () => import('../views/LoginView.vue')
const AdminLayout = () => import('../layouts/AdminLayout.vue')
const AdminDashboardView = () => import('../views/admin/AdminDashboardView.vue')
const AdminApplicationsView = () => import('../views/admin/AdminApplicationsView.vue')
const AdminClinicsView = () => import('../views/admin/AdminClinicsView.vue')
const AdminUsersView = () => import('../views/admin/AdminUsersView.vue')
const AdminSettingsView = () => import('../views/admin/AdminSettingsView.vue')

export const ROUTE_NAMES = {
  LANDING: 'landing',
  DOCS: 'docs',
  LOGIN: 'login',
  ADMIN: 'admin',
  ADMIN_DASHBOARD: 'admin-dashboard',
  ADMIN_APPLICATIONS: 'admin-applications',
  ADMIN_CLINICS: 'admin-clinics',
  ADMIN_USERS: 'admin-users',
  ADMIN_SETTINGS: 'admin-settings',
  /** @deprecated Use ADMIN_CLINICS */
  CLINICS: 'admin-clinics',
} as const

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: ROUTE_NAMES.LANDING,
      component: LandingView,
    },
    {
      path: '/docs/:section?',
      name: ROUTE_NAMES.DOCS,
      component: DocsView,
      beforeEnter: (to) => {
        const section = to.params.section as string | undefined

        if (!section) {
          return { name: ROUTE_NAMES.DOCS, params: { section: 'intro' } }
        }

        if (!docsSectionIds.includes(section as DocsSectionId)) {
          return { name: ROUTE_NAMES.DOCS, params: { section: 'intro' } }
        }
      },
    },
    {
      path: '/login',
      name: ROUTE_NAMES.LOGIN,
      component: LoginView,
      meta: { guestOnly: true },
    },
    {
      path: '/admin',
      component: AdminLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: { name: ROUTE_NAMES.ADMIN_DASHBOARD },
        },
        {
          path: 'dashboard',
          name: ROUTE_NAMES.ADMIN_DASHBOARD,
          component: AdminDashboardView,
        },
        {
          path: 'applications',
          name: ROUTE_NAMES.ADMIN_APPLICATIONS,
          component: AdminApplicationsView,
        },
        {
          path: 'clinics',
          name: ROUTE_NAMES.ADMIN_CLINICS,
          component: AdminClinicsView,
        },
        {
          path: 'users',
          name: ROUTE_NAMES.ADMIN_USERS,
          component: AdminUsersView,
        },
        {
          path: 'settings',
          name: ROUTE_NAMES.ADMIN_SETTINGS,
          component: AdminSettingsView,
        },
      ],
    },
    {
      path: '/clinics',
      redirect: '/admin/clinics',
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
  scrollBehavior(to) {
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth', top: 80 }
    }
    return { top: 0 }
  },
})

router.beforeEach((to) => {
  const authStore = useAuthStore()
  // Rehydrate Pinia from localStorage before evaluating guards (handles F5 on /admin/*).
  authStore.syncFromSession()

  if (to.matched.some((record) => record.meta.requiresAuth) && !authStore.isAuthenticated) {
    return {
      name: ROUTE_NAMES.LOGIN,
      query: { redirect: to.fullPath },
    }
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return { name: ROUTE_NAMES.ADMIN_DASHBOARD }
  }
})

export default router
