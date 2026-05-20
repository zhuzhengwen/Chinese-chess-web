<template>
  <header class="navbar">
    <!-- 顶行：Logo + 用户区 -->
    <div class="navbar-top">
      <div class="top-inner">
        <router-link to="/manuals" class="logo">
          <span class="logo-text">中国象棋谱</span>
        </router-link>

        <div class="nav-user">
          <template v-if="isLoggedIn && userInfo">
            <div class="user-trigger" @click="dropdownOpen = !dropdownOpen" v-click-outside="() => dropdownOpen = false">
              <div class="avatar">{{ avatarChar }}</div>
              <span class="nickname">{{ userInfo.nickname || userInfo.phone }}</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#aaa" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
            <div class="dropdown" v-show="dropdownOpen">
              <div class="dropdown-user">
                <div class="dropdown-avatar">{{ avatarChar }}</div>
                <div>
                  <div class="dropdown-name">{{ userInfo.nickname || userInfo.phone }}</div>
                  <div class="dropdown-email">{{ userInfo.email || userInfo.phone || '' }}</div>
                </div>
              </div>
              <div class="dropdown-divider"></div>
              <div class="dropdown-item" @click="handleCommand('profile')">个人中心</div>
              <div class="dropdown-divider"></div>
              <div class="dropdown-item logout" @click="handleCommand('logout')">退出登录</div>
            </div>
          </template>
          <template v-else>
            <router-link to="/login" class="login-btn">登录</router-link>
          </template>
        </div>

        <!-- 移动端菜单按钮 -->
        <div class="mobile-menu-btn" @click="menuOpen = !menuOpen">
          <span></span><span></span><span></span>
        </div>
      </div>
    </div>

    <!-- 底行：导航 tabs -->
    <div class="navbar-tabs">
      <div class="tabs-inner">
        <router-link
          v-for="item in visibleNavItems"
          :key="item.path"
          :to="item.path"
          class="tab-item"
          :class="{ active: isActive(item) }"
        >{{ item.label }}</router-link>
      </div>
    </div>

    <!-- 移动端下拉菜单 -->
    <div class="mobile-menu" v-show="menuOpen" @click="menuOpen = false">
      <router-link
        v-for="item in visibleNavItems"
        :key="item.path"
        :to="item.path"
        class="mobile-nav-item"
        :class="{ active: isActive(item) }"
      >{{ item.label }}</router-link>
    </div>
  </header>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'NavBar',
  directives: {
    'click-outside': {
      bind(el, binding) {
        el._clickOutside = (e) => { if (!el.contains(e.target)) binding.value(e) }
        document.addEventListener('click', el._clickOutside)
      },
      unbind(el) { document.removeEventListener('click', el._clickOutside) }
    }
  },
  data() {
    return {
      menuOpen: false,
      dropdownOpen: false,
      navItems: [
        { label: '棋谱库',   path: '/manuals',     match: ['/manuals'],     auth: false },
        { label: '我的棋谱', path: '/my-manuals',  match: ['/my-manuals'],  auth: true  },
        { label: '赛事',     path: '/tournaments', match: ['/tournaments'], auth: false },
        { label: '棋手',     path: '/players',     match: ['/players'],     auth: false },
        { label: '资讯',     path: '/resources',   match: ['/resources'],   auth: false },
        { label: '论坛',     path: '/forum',       match: ['/forum'],       auth: false },
      ]
    }
  },
  computed: {
    ...mapGetters('user', ['isLoggedIn']),
    ...mapState('user', ['userInfo']),
    visibleNavItems() {
      return this.navItems.filter(item => !item.auth || this.isLoggedIn)
    },
    avatarChar() {
      if (!this.userInfo) return '?'
      return (this.userInfo.nickname || this.userInfo.phone || '?').charAt(0).toUpperCase()
    }
  },
  watch: {
    $route() { this.menuOpen = false }
  },
  methods: {
    isActive(item) {
      return item.match.some(p => this.$route.path.startsWith(p))
    },
    handleCommand(cmd) {
      if (cmd === 'profile') this.$router.push('/user')
      else if (cmd === 'subscribe') this.$router.push('/subscribe')
      else if (cmd === 'logout') {
        this.$store.dispatch('user/logout')
        this.$message.success('已退出登录')
        if (this.$route.meta.requiresAuth) this.$router.push('/manuals')
      }
    }
  }
}
</script>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: #fff;
  border-bottom: 1px solid #d6eaf5;
}

/* ── 顶行 ── */
.navbar-top { border-bottom: 1px solid #e8f4fb; }
.top-inner {
  height: 44px;
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.logo { text-decoration: none; flex-shrink: 0; }
.logo-text {
  font-size: 17px;
  font-weight: 800;
  color: #2a9fd6;
  letter-spacing: 1px;
}

/* 用户区 */
.nav-user {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
}

/* 登录按钮 */
.login-btn {
  font-size: 13px;
  color: #fff;
  background: #2a9fd6;
  padding: 5px 16px;
  text-decoration: none;
  font-weight: 500;
  transition: background 0.15s;
}
.login-btn:hover { background: #1a8ac0; }

/* 已登录：用户触发器 */
.user-trigger {
  display: flex;
  align-items: center;
  gap: 7px;
  cursor: pointer;
  padding: 4px 6px;
  transition: opacity 0.12s;
  user-select: none;
}
.user-trigger:hover { opacity: 0.8; }

.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #2a9fd6;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.nickname {
  font-size: 13px;
  color: #333;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 下拉菜单 */
.dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 200px;
  background: #fff;
  border: 1px solid #d6eaf5;
  box-shadow: 0 4px 12px rgba(42,159,214,0.08);
  z-index: 999;
}
.dropdown-user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  background: #f0f8fd;
}
.dropdown-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #2a9fd6;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.dropdown-name {
  font-size: 13px;
  font-weight: 600;
  color: #111;
}
.dropdown-email {
  font-size: 11px;
  color: #aaa;
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 120px;
}
.dropdown-divider { height: 1px; background: #e8f4fb; }
.dropdown-item {
  padding: 10px 16px;
  font-size: 13px;
  color: #444;
  cursor: pointer;
  transition: background 0.12s;
}
.dropdown-item:hover { background: #f0f8fd; color: #2a9fd6; }
.dropdown-item.logout { color: #e53e3e; }
.dropdown-item.logout:hover { background: #fff5f5; color: #e53e3e; }

/* ── 底行：tabs ── */
.navbar-tabs { background: #fff; }
.tabs-inner {
  height: 38px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 2px;
}

.tab-item {
  display: inline-flex;
  align-items: center;
  height: 26px;
  padding: 0 13px;
  font-size: 13px;
  color: #555;
  text-decoration: none;
  transition: background 0.12s, color 0.12s;
  white-space: nowrap;
}
.tab-item:hover { background: #e8f4fb; color: #2a9fd6; }
.tab-item.active { background: #2a9fd6; color: #fff; font-weight: 500; }

/* 移动端 */
.mobile-menu-btn {
  display: none;
  flex-direction: column;
  gap: 5px;
  cursor: pointer;
  padding: 4px;
  margin-left: 12px;
}
.mobile-menu-btn span {
  display: block;
  width: 22px;
  height: 2px;
  background: #2a9fd6;
}
.mobile-menu {
  background: #fff;
  border-top: 1px solid #e8f4fb;
  padding: 8px 0;
  display: flex;
  flex-direction: column;
}
.mobile-nav-item {
  padding: 10px 20px;
  font-size: 14px;
  color: #444;
  text-decoration: none;
  transition: background 0.12s;
}
.mobile-nav-item:hover, .mobile-nav-item.active {
  background: #e8f4fb;
  color: #2a9fd6;
}

@media (max-width: 768px) {
  .navbar-tabs { display: none; }
  .mobile-menu-btn { display: flex; }
  .top-inner { padding: 0 16px; }
}
</style>

