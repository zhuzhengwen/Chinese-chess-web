<template>
  <header class="navbar">
    <div class="navbar-inner">
      <router-link to="/home" class="logo">象棋古谱</router-link>
      <nav class="nav-links">
        <router-link to="/home" class="nav-item" active-class="active" exact>首页</router-link>
        <router-link to="/manuals" class="nav-item" active-class="active">棋谱</router-link>
        <router-link to="/explore" class="nav-item" active-class="active">探索</router-link>
        <router-link to="/subscribe" class="nav-item" active-class="active">订阅</router-link>
      </nav>
      <div class="nav-right">
        <template v-if="isLoggedIn && userInfo">
          <el-dropdown @command="handleCommand" trigger="click">
            <div class="user-trigger">
              <div class="avatar">{{ avatarChar }}</div>
              <span class="nickname">{{ userInfo.nickname || userInfo.phone }}</span>
              <i class="el-icon-arrow-down" style="font-size:12px;margin-left:4px;color:#666"></i>
            </div>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="profile">
                <i class="el-icon-user"></i> 个人中心
              </el-dropdown-item>
              <el-dropdown-item command="logout" divided>
                <i class="el-icon-switch-button"></i> 退出
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
        <template v-else>
          <router-link to="/login">
            <el-button type="primary" size="small" class="login-btn">登录</el-button>
          </router-link>
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
      const name = this.userInfo.nickname || this.userInfo.phone || '?'
      return name.charAt(0).toUpperCase()
    }
  },
  methods: {
    handleCommand(cmd) {
      if (cmd === 'profile') {
        this.$router.push('/user')
      } else if (cmd === 'logout') {
        this.$store.dispatch('user/logout')
        this.$message.success('已退出登录')
        if (this.$route.meta.requiresAuth) {
          this.$router.push('/home')
        }
      }
    }
  }
}
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #ececec;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.navbar-inner {
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 24px;
}
.logo {
  font-size: 20px;
  font-weight: 800;
  color: #8B1A1A;
  letter-spacing: 2px;
  flex-shrink: 0;
  text-decoration: none;
}
.nav-links {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 48px;
  flex: 1;
}
.nav-item {
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 15px;
  color: #555;
  text-decoration: none;
  transition: all 0.2s;
  font-weight: 500;
}
.nav-item:hover { color: #8B1A1A; background: #fdf0f0; }
.nav-item.active { color: #8B1A1A; background: #fdf0f0; font-weight: 600; }
.nav-right { margin-left: auto; display: flex; align-items: center; }
.login-btn {
  background: #8B1A1A !important;
  border-color: #8B1A1A !important;
  color: #fff !important;
  font-weight: 600;
  padding: 0 20px;
}
.user-trigger {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: background 0.2s;
}
.user-trigger:hover { background: #f5f5f5; }
.avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8B1A1A, #c0392b);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
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
