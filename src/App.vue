<template>
  <div id="app">
    <nav-bar />
    <div class="app-body">
      <main class="main-content">
        <router-view />
      </main>
    </div>
    <page-footer />
    <auth-modal />
  </div>
</template>

<script>
import NavBar from './components/NavBar.vue'
import PageFooter from './components/PageFooter.vue'
import AuthModal from './components/AuthModal.vue'

export default {
  name: 'App',
  components: { NavBar, PageFooter, AuthModal }
}
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }

html {
  overflow-y: scroll; /* 滚动条始终占位，防止页面切换时宽度抖动 */
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif;
  background: #fff;
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
  font-size: 14px;
  color: #1a1a1a;
}

a { text-decoration: none; color: inherit; }

#app {
  max-width: 1000px;
  margin: 0 auto;
  min-height: 100vh;
  background: #f7f3ee;
  box-shadow: 0 0 24px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.06);
  display: flex;
  flex-direction: column;
}

/* ── 内容区 ── */
.app-body {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.main-content {
  padding: 20px 24px 48px;
  flex: 1;
}

/* 全局卡片 */
.ns-card {
  background: #fff;
  border: 1px solid #e4e4e4;
  border-radius: 0;
  overflow: hidden;
}

/* Element UI 覆盖 */
.el-pagination.is-background .el-pager li.active { background: #2a9fd6 !important; }
.el-pagination.is-background .el-pager li:hover { color: #2a9fd6 !important; }
.el-button--primary { background-color: #2a9fd6 !important; border-color: #2a9fd6 !important; }
.el-button--primary:hover { background-color: #006ecc !important; border-color: #006ecc !important; }

@media (max-width: 1000px) {
  #app { box-shadow: none; }
}

@media (max-width: 768px) {
  .main-content { padding: 12px 12px 40px; }
}
</style>

