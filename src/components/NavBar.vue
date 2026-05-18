<template>
  <header class="navbar">
    <div class="navbar-inner">
      <router-link to="/manuals" class="logo">象棋古谱</router-link>
      <nav class="nav-links">
        <router-link to="/manuals" class="nav-item" active-class="active">棋谱</router-link>
        <router-link to="/my-manuals" class="nav-item" active-class="active">我的棋谱</router-link>
        <router-link to="/tournaments" class="nav-item" active-class="active">赛事</router-link>
        <router-link to="/players" class="nav-item" active-class="active">棋手</router-link>
        <router-link to="/resources" class="nav-item" active-class="active">资源</router-link>
        <router-link to="/forum" class="nav-item" active-class="active">论坛</router-link>
      </nav>
      <div class="nav-right">
        <template v-if="isLoggedIn && userInfo">
          <el-dropdown @command="handleCommand" trigger="click">
            <div class="user-trigger">
              <div class="avatar">{{ avatarChar }}</div>
              <span class="nickname">{{ userInfo.nickname || userInfo.phone }}</span>
            </div>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="profile">个人中心</el-dropdown-item>
              <el-dropdown-item command="subscribe">会员订阅</el-dropdown-item>
              <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
        <template v-else>
          <router-link to="/login" class="login-link">登录</router-link>
        </template>
      </div>
    </div>
  </header>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
export default {
  name: 'NavBar',
  computed: {
    ...mapGetters('user', ['isLoggedIn']),
    ...mapState('user', ['userInfo']),
    avatarChar() {
      if (!this.userInfo) return '?'
      return (this.userInfo.nickname || this.userInfo.phone || '?').charAt(0).toUpperCase()
    }
  },
  methods: {
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
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 1000;
  height: 56px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
}
.navbar-inner {
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 32px;
}
.logo {
  font-size: 17px;
  font-weight: 700;
  color: #8B1A1A;
  letter-spacing: 2px;
  flex-shrink: 0;
  font-family: 'STKaiti', 'KaiTi', 'SimSun', serif;
}
.nav-links {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-left: 48px;
  flex: 1;
}
.nav-item {
  padding: 5px 16px;
  font-size: 14px;
  color: #555;
  border-radius: 4px;
  transition: color 0.15s;
}
.nav-item:hover { color: #1a1a1a; }
.nav-item.active { color: #1a1a1a; font-weight: 600; }
.nav-right { margin-left: auto; }
.login-link { font-size: 14px; color: #8B1A1A; font-weight: 500; }
.user-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #8B1A1A;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}
.nickname {
  font-size: 14px;
  color: #333;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
