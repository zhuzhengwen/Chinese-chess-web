<template>
  <div class="login-page">
    <div class="login-box">
      <div class="pieces-row">
        <div class="chess-piece-deco red-deco">
          <div class="piece-outer">
            <div class="piece-inner">帅</div>
          </div>
        </div>
        <div class="chess-piece-deco black-deco">
          <div class="piece-outer">
            <div class="piece-inner">将</div>
          </div>
        </div>
      </div>
      <h1 class="login-title">象棋古谱</h1>
      <p class="login-subtitle">传承千年棋道文化</p>
      <el-form ref="loginForm" :model="form" :rules="rules" label-position="top" class="login-form">
        <el-form-item prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" prefix-icon="el-icon-mobile-phone" maxlength="11" clearable />
        </el-form-item>
        <el-form-item prop="code">
          <div class="code-row">
            <el-input v-model="form.code" placeholder="请输入验证码" prefix-icon="el-icon-lock" maxlength="6" style="flex:1" />
            <el-button class="code-btn" :disabled="countdown > 0 || !form.phone" @click="sendCode" :loading="sendingCode">
              {{ countdown > 0 ? countdown + 's后重新获取' : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="agreed" class="agree-check">
            我已阅读并同意
            <a href="javascript:;" class="agree-link">《用户服务协议》</a>
            和
            <a href="javascript:;" class="agree-link">《隐私政策》</a>
          </el-checkbox>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="login-btn" :loading="logging" @click="handleLogin">登录</el-button>
        </el-form-item>
        <div class="dev-mode">
          <el-divider>开发调试</el-divider>
          <el-button class="dev-btn" @click="handleMockLogin" :loading="mockLogging">🛠 开发模式快速登录</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginPage',
  data() {
    return {
      form: { phone: '', code: '' },
      agreed: false, logging: false, mockLogging: false,
      sendingCode: false, countdown: 0, countdownTimer: null,
      rules: {
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
        ],
        code: [
          { required: true, message: '请输入验证码', trigger: 'blur' },
          { len: 6, message: '验证码为6位数字', trigger: 'blur' }
        ]
      }
    }
  },
  beforeDestroy() {
    if (this.countdownTimer) clearInterval(this.countdownTimer)
  },
  methods: {
    async sendCode() {
      if (!this.form.phone || !/^1[3-9]\d{9}$/.test(this.form.phone)) {
        this.$message.warning('请先输入正确的手机号')
        return
      }
      this.sendingCode = true
      try {
        await new Promise(r => setTimeout(r, 800))
        this.$message.success('验证码已发送')
        this.startCountdown()
      } catch (e) {
        this.$message.error('发送失败，请重试')
      } finally { this.sendingCode = false }
    },
    startCountdown() {
      this.countdown = 60
      this.countdownTimer = setInterval(() => {
        this.countdown--
        if (this.countdown <= 0) {
          clearInterval(this.countdownTimer)
          this.countdownTimer = null
        }
      }, 1000)
    },
    async handleLogin() {
      if (!this.agreed) {
        this.$message.warning('请先同意用户协议和隐私政策')
        return
      }
      this.$refs.loginForm.validate(async valid => {
        if (!valid) return
        this.logging = true
        try {
          await this.$store.dispatch('user/login', { phone: this.form.phone, code: this.form.code })
          this.$message.success('登录成功！')
          this.redirectAfterLogin()
        } catch (e) {
          this.$message.error('登录失败：' + (e.message || '验证码错误'))
        } finally { this.logging = false }
      })
    },
    async handleMockLogin() {
      this.mockLogging = true
      try {
        await this.$store.dispatch('user/login', { phone: '13800000001', code: '123456', mockLogin: true })
        this.$message.success('开发模式登录成功！')
        this.redirectAfterLogin()
      } catch (e) {
        this.$store.commit('user/SET_TOKEN', 'mock-token-12345')
        this.$store.commit('user/SET_USER', { id: 1, phone: '13800000001', nickname: '棋道高手', vip: true })
        this.$message.success('开发模式（离线）登录成功！')
        this.redirectAfterLogin()
      } finally { this.mockLogging = false }
    },
    redirectAfterLogin() {
      const redirect = this.$route.query.redirect
      this.$router.push(redirect || '/user')
    }
  }
}
</script>

<style scoped>
.login-page { min-height: calc(100vh - 60px); background: #f7f3ee; display: flex; align-items: center; justify-content: center; padding: 40px 16px; }
.login-box { background: #fff; border-radius: 20px; padding: 40px 40px 32px; width: 100%; max-width: 420px; box-shadow: 0 8px 40px rgba(0,0,0,0.1); text-align: center; }
.pieces-row { display: flex; justify-content: center; gap: 20px; margin-bottom: 20px; }
.chess-piece-deco { display: flex; align-items: center; justify-content: center; }
.piece-outer { width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; position: relative; }
.red-deco .piece-outer { background: radial-gradient(circle at 35% 35%, #ff6b6b, #8B1A1A); box-shadow: 0 4px 16px rgba(139,26,26,0.4), inset 0 0 0 5px rgba(255,255,255,0.15); border: 3px solid #5C0000; }
.black-deco .piece-outer { background: radial-gradient(circle at 35% 35%, #555, #1a1a1a); box-shadow: 0 4px 16px rgba(0,0,0,0.4), inset 0 0 0 5px rgba(255,255,255,0.08); border: 3px solid #000; }
.piece-inner { font-size: 28px; font-weight: 900; line-height: 1; }
.red-deco .piece-inner { color: #f4c842; text-shadow: 0 1px 3px rgba(0,0,0,0.4); }
.black-deco .piece-inner { color: #e8d5a0; text-shadow: 0 1px 3px rgba(0,0,0,0.6); }
.login-title { font-size: 28px; font-weight: 900; color: #8B1A1A; letter-spacing: 4px; margin-bottom: 6px; }
.login-subtitle { font-size: 13px; color: #bbb; letter-spacing: 2px; margin-bottom: 28px; }
.login-form { text-align: left; }
.login-form >>> .el-form-item { margin-bottom: 16px; }
.login-form >>> .el-input__inner { height: 46px; border-radius: 8px; font-size: 15px; }
.login-form >>> .el-input__inner:focus { border-color: #8B1A1A; }
.code-row { display: flex; gap: 10px; }
.code-btn { flex-shrink: 0; height: 46px; border-radius: 8px; background: #8B1A1A !important; color: #fff !important; border-color: #8B1A1A !important; font-size: 13px; white-space: nowrap; padding: 0 14px; }
.code-btn:disabled { background: #ccc !important; border-color: #ccc !important; color: #fff !important; }
.agree-check { font-size: 13px; color: #888; line-height: 1.6; }
.agree-link { color: #8B1A1A; text-decoration: none; }
.agree-link:hover { text-decoration: underline; }
.login-btn { width: 100%; height: 48px; font-size: 16px; font-weight: 700; border-radius: 10px; background: #8B1A1A !important; border-color: #8B1A1A !important; letter-spacing: 2px; }
.dev-mode { margin-top: 4px; }
.dev-mode >>> .el-divider__text { font-size: 12px; color: #ccc; }
.dev-btn { width: 100%; height: 42px; font-size: 14px; border-radius: 8px; border-color: #e0e0e0 !important; color: #888 !important; background: #fafafa !important; }
.dev-btn:hover { border-color: #8B1A1A !important; color: #8B1A1A !important; background: #fdf0f0 !important; }
</style>
