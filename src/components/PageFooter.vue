<template>
  <footer class="page-footer">
    <div class="footer-inner">
      <span class="footer-logo">象棋古谱</span>
      <span class="sep">·</span>
      <span class="footer-copy">传承千年棋道文化</span>
      <span class="sep">·</span>
      <span class="footer-copy">© 2024</span>
    </div>
  </footer>
</template>

<script>
export default { name: 'PageFooter' }
</script>

<style scoped>
.page-footer {
  border-top: 1px solid #f0f0f0;
  padding: 24px;
  text-align: center;
}
.footer-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 13px;
  color: #bbb;
}
.footer-logo { font-weight: 600; color: #111; }
.sep { color: #e0e0e0; }
</style>

