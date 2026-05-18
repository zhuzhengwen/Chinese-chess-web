<template>
  <div class="login-page">
    <div class="login-box">
      <div class="login-logo">象棋古谱</div>
      <p class="login-sub">传承千年棋道文化</p>

      <el-form ref="loginForm" :model="form" :rules="rules" label-position="top" class="login-form">
        <el-form-item prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" maxlength="11" clearable />
        </el-form-item>
        <el-form-item prop="code">
          <div class="code-row">
            <el-input v-model="form.code" placeholder="验证码" maxlength="6" />
            <button
              type="button"
              class="code-btn"
              :disabled="countdown > 0 || !form.phone"
              @click="sendCode"
            >{{ countdown > 0 ? countdown + 's' : '获取验证码' }}</button>
          </div>
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="agreed" class="agree-check">
            我已阅读并同意
            <a href="javascript:;" class="agree-link">《用户协议》</a>
            和
            <a href="javascript:;" class="agree-link">《隐私政策》</a>
          </el-checkbox>
        </el-form-item>
        <el-form-item>
          <button type="button" class="login-btn" :class="{ loading: logging }" @click="handleLogin">
            {{ logging ? '登录中…' : '登录' }}
          </button>
        </el-form-item>
        <div class="dev-area">
          <button type="button" class="dev-btn" @click="handleMockLogin">开发模式快速登录</button>
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
        if (this.countdown <= 0) { clearInterval(this.countdownTimer); this.countdownTimer = null }
      }, 1000)
    },
    async handleLogin() {
      if (!this.agreed) { this.$message.warning('请先同意用户协议和隐私政策'); return }
      this.$refs.loginForm.validate(async valid => {
        if (!valid) return
        this.logging = true
        try {
          await this.$store.dispatch('user/login', { phone: this.form.phone, code: this.form.code })
          this.$message.success('登录成功')
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
        this.$message.success('登录成功')
        this.redirectAfterLogin()
      } catch (e) {
        this.$store.commit('user/SET_TOKEN', 'mock-token-12345')
        this.$store.commit('user/SET_USER', { id: 1, phone: '13800000001', nickname: '棋道高手', vip: true })
        this.$message.success('离线模式登录成功')
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
.login-page {
  min-height: calc(100vh - 56px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
  background: #fff;
}
.login-box {
  width: 100%;
  max-width: 340px;
  text-align: center;
}

.login-logo {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: 4px;
  margin-bottom: 6px;
  font-family: 'STKaiti', 'KaiTi', serif;
}
.login-sub { font-size: 12px; color: #bbb; letter-spacing: 2px; margin-bottom: 36px; }

.login-form { text-align: left; }
.login-form >>> .el-form-item { margin-bottom: 14px; }
.login-form >>> .el-input__inner {
  height: 42px;
  border-radius: 2px;
  font-size: 14px;
  border-color: #e8e8e8;
}
.login-form >>> .el-input__inner:focus { border-color: #333; }

.code-row { display: flex; gap: 8px; }
.code-row >>> .el-input { flex: 1; }
.code-btn {
  flex-shrink: 0;
  height: 42px;
  padding: 0 14px;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 2px;
  font-size: 12px;
  color: #555;
  cursor: pointer;
  white-space: nowrap;
  transition: border-color 0.15s, color 0.15s;
}
.code-btn:hover:not(:disabled) { border-color: #333; color: #1a1a1a; }
.code-btn:disabled { color: #ccc; cursor: not-allowed; }

.agree-check { font-size: 12px; color: #999; }
.agree-link { color: #555; text-decoration: underline; }

.login-btn {
  width: 100%;
  height: 44px;
  background: #1a1a1a;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  border: none;
  border-radius: 2px;
  letter-spacing: 3px;
  cursor: pointer;
  transition: opacity 0.15s;
}
.login-btn:hover { opacity: 0.75; }
.login-btn.loading { opacity: 0.5; cursor: not-allowed; }

.dev-area { margin-top: 20px; text-align: center; }
.dev-btn {
  background: none;
  border: none;
  font-size: 12px;
  color: #ccc;
  cursor: pointer;
  padding: 4px 0;
}
.dev-btn:hover { color: #888; }
</style>
