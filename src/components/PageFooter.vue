<template>
  <footer class="page-footer">
    <div class="footer-inner">
      <div class="footer-logo">象棋古谱</div>
      <p class="footer-copy">© 2024 象棋古谱 · 传承千年棋道文化</p>
      <p class="footer-sub">精选200+古典棋谱 · 弘扬中华传统文化</p>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'PageFooter'
}
</script>

<style scoped>
.page-footer {
  background: #1a1a1a;
  color: #aaa;
  padding: 32px 24px;
  text-align: center;
}
.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
}
.footer-logo {
  font-size: 18px;
  font-weight: 800;
  color: #c0392b;
  letter-spacing: 3px;
  margin-bottom: 12px;
}
.footer-copy {
  font-size: 14px;
  color: #ccc;
  margin-bottom: 6px;
}
.footer-sub {
  font-size: 12px;
  color: #777;
}
</style>
