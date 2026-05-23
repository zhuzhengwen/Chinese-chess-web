<template>
  <div class="admin-shell">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <div class="sidebar-logo">
        <span class="logo-icon">帅</span>
        <span class="logo-text">管理后台</span>
      </div>
      <nav class="sidebar-nav">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          active-class="active"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </router-link>
      </nav>
      <div class="sidebar-footer">
        <router-link to="/manuals" class="back-link">← 返回前台</router-link>
      </div>
    </aside>

    <!-- 主区域 -->
    <div class="admin-main">
      <header class="admin-header">
        <div class="header-title">{{ currentTitle }}</div>
        <div class="header-user">
          <span class="user-badge">超级管理员</span>
          <span class="user-name">{{ nickname }}</span>
        </div>
      </header>
      <div class="admin-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {
  name: 'AdminLayout',
  data() {
    return {
      navItems: [
        { path: '/admin/manuals',     label: '棋谱库',  icon: '📚' },
        { path: '/admin/tournaments', label: '赛事',    icon: '🏆' },
        { path: '/admin/players',     label: '棋手',    icon: '♟' },
        { path: '/admin/news',        label: '资讯',    icon: '📰' }
      ]
    }
  },
  computed: {
    ...mapState('user', ['userInfo']),
    nickname() { return this.userInfo ? (this.userInfo.nickname || this.userInfo.username) : '' },
    currentTitle() {
      const map = {
        '/admin/manuals': '棋谱库管理',
        '/admin/tournaments': '赛事管理',
        '/admin/players': '棋手管理',
        '/admin/news': '资讯管理'
      }
      return map[this.$route.path] || '管理后台'
    }
  }
}
</script>

<style scoped>
.admin-shell {
  display: flex;
  min-height: 100vh;
  background: #f0f2f5;
}

/* 侧边栏 */
.sidebar {
  width: 200px;
  flex-shrink: 0;
  background: #1a2b3c;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 100;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 20px 18px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.logo-icon {
  width: 32px;
  height: 32px;
  background: #2a9fd6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #fff;
  font-weight: 900;
  flex-shrink: 0;
}
.logo-text {
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 1px;
}

.sidebar-nav {
  flex: 1;
  padding: 12px 0;
  overflow-y: auto;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 20px;
  font-size: 14px;
  color: rgba(255,255,255,0.6);
  text-decoration: none;
  transition: background 0.15s, color 0.15s;
  cursor: pointer;
}
.nav-item:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.9); }
.nav-item.active { background: #2a9fd6; color: #fff; }
.nav-icon { font-size: 15px; width: 20px; text-align: center; }

.sidebar-footer {
  padding: 16px 20px;
  border-top: 1px solid rgba(255,255,255,0.08);
}
.back-link {
  font-size: 13px;
  color: rgba(255,255,255,0.4);
  text-decoration: none;
  transition: color 0.15s;
}
.back-link:hover { color: rgba(255,255,255,0.8); }

/* 主区域 */
.admin-main {
  flex: 1;
  margin-left: 200px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.admin-header {
  height: 52px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  position: sticky;
  top: 0;
  z-index: 50;
}
.header-title {
  font-size: 16px;
  font-weight: 700;
  color: #111;
}
.header-user {
  display: flex;
  align-items: center;
  gap: 10px;
}
.user-badge {
  font-size: 11px;
  padding: 2px 8px;
  background: #fff3e0;
  color: #e07b2a;
  border: 1px solid #f5ceac;
}
.user-name {
  font-size: 13px;
  color: #555;
}

.admin-content {
  flex: 1;
  padding: 24px 28px;
}
</style>
