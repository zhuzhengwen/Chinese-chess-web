<template>
  <div id="app">
    <nav-bar />
    <main class="main-content">
      <router-view />
    </main>
    <page-footer />
  </div>
</template>

<script>
import NavBar from './components/NavBar.vue'
import PageFooter from './components/PageFooter.vue'

export default {
  name: 'App',
  components: { NavBar, PageFooter }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background-color: #f7f3ee;
  color: #333;
  min-height: 100vh;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding-top: 60px;
}

a {
  text-decoration: none;
  color: inherit;
}
</style>
