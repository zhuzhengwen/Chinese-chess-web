import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/manuals' },
  { path: '/manuals', component: () => import('../views/ManualList.vue') },
  { path: '/manuals/:id', component: () => import('../views/ManualDetail.vue') },
  { path: '/my-manuals', component: () => import('../views/MyManuals.vue'), meta: { requiresAuth: true } },
  { path: '/tournaments', component: () => import('../views/Tournament.vue') },
  { path: '/players', component: () => import('../views/Player.vue') },
  { path: '/resources', component: () => import('../views/Resources.vue') },
  { path: '/forum', component: () => import('../views/Forum.vue') },
  { path: '/subscribe', component: () => import('../views/Subscribe.vue') },
  { path: '/user', component: () => import('../views/User.vue'), meta: { requiresAuth: true } },
  { path: '/login', component: () => import('../views/Login.vue') }
]

const router = new VueRouter({
  mode: 'history',
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    next({ path: '/login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router
