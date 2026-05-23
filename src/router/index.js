import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '../store'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/manuals' },
  { path: '/manuals', component: () => import('../views/ManualList.vue') },
  { path: '/manuals/:id', component: () => import('../views/ManualDetail.vue') },
  { path: '/my-manuals', component: () => import('../views/MyManuals.vue'), meta: { requiresAuth: true } },
  { path: '/tournaments', component: () => import('../views/Tournament.vue') },
  { path: '/tournaments/game/:gameId', component: () => import('../views/TournamentGame.vue') },
  { path: '/players', component: () => import('../views/Player.vue') },
  { path: '/resources', component: () => import('../views/Resources.vue') },
  { path: '/forum', component: () => import('../views/Forum.vue') },
  { path: '/subscribe', component: () => import('../views/Subscribe.vue') },
  { path: '/user', component: () => import('../views/User.vue'), meta: { requiresAuth: true } },
  { path: '/login', redirect: '/' },
  {
    path: '/admin',
    component: () => import('../views/admin/AdminLayout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    redirect: '/admin/manuals',
    children: [
      { path: 'manuals',     component: () => import('../views/admin/ManualAdmin.vue') },
      { path: 'tournaments', component: () => import('../views/admin/TournamentAdmin.vue') },
      { path: 'players',     component: () => import('../views/admin/PlayerAdmin.vue') },
      { path: 'news',        component: () => import('../views/admin/NewsAdmin.vue') }
    ]
  }
]

const router = new VueRouter({
  mode: 'history',
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    next(false)
    store.commit('user/OPEN_AUTH_MODAL', 'login')
    return
  }
  if (to.meta.requiresAdmin) {
    const userInfo = store.state.user.userInfo
    const isAdmin = userInfo && (userInfo.role === 'admin' || userInfo.isAdmin)
    if (!isAdmin) { next('/'); return }
  }
  next()
})

export default router
