<template>
  <transition name="modal-fade">
    <div v-if="visible" class="modal-overlay" @click.self="close">
      <div class="modal-box">

        <!-- 关闭 -->
        <button class="close-btn" @click="close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <!-- Logo -->
        <div class="logo">象棋古谱</div>

        <!-- Tab -->
        <div class="tabs" v-if="mode !== 'forgot'">
          <button :class="['tab', { active: mode === 'login' }]" @click="switchMode('login')">登录</button>
          <button :class="['tab', { active: mode === 'register' }]" @click="switchMode('register')">注册</button>
        </div>
        <div class="back-row" v-else>
          <a href="javascript:;" @click="switchMode('login')">← 返回登录</a>
        </div>

        <!-- 登录 -->
        <form v-if="mode === 'login'" @submit.prevent="handleLogin">
          <div class="field">
            <input v-model="loginForm.username" type="text" placeholder="用户名" autocomplete="username" />
          </div>
          <div class="field">
            <input v-model="loginForm.password" :type="showPwd ? 'text' : 'password'" placeholder="密码" autocomplete="current-password" />
            <button type="button" class="eye" @click="showPwd = !showPwd" tabindex="-1">{{ showPwd ? '隐藏' : '显示' }}</button>
          </div>
          <div class="forgot-row">
            <a href="javascript:;" @click="switchMode('forgot')">忘记密码？</a>
          </div>
          <div v-if="error" class="error-msg">{{ error }}</div>
          <button class="btn" type="submit" :disabled="logging">{{ logging ? '登录中…' : '登录' }}</button>
          <div class="dev-row">
            <a href="javascript:;" @click="handleMockLogin">开发模式登录</a>
          </div>
        </form>

        <!-- 注册 -->
        <form v-else-if="mode === 'register'" @submit.prevent="handleRegister">
          <div class="field">
            <input v-model="regForm.username" type="text" placeholder="用户名（4-16位字母数字）" autocomplete="username" />
            <span v-if="regForm.username && !validUsername" class="tip">4-16位字母、数字或下划线</span>
          </div>
          <div class="field">
            <input v-model="regForm.password" :type="showPwd ? 'text' : 'password'" placeholder="密码（至少8位含字母和数字）" autocomplete="new-password" />
            <button type="button" class="eye" @click="showPwd = !showPwd" tabindex="-1">{{ showPwd ? '隐藏' : '显示' }}</button>
            <span v-if="regForm.password && !validPassword" class="tip">至少8位，须同时含字母和数字</span>
          </div>
          <div class="verify-tabs">
            <button type="button" :class="{ active: regForm.verifyType === 'phone' }" @click="regForm.verifyType = 'phone'">手机号</button>
            <button type="button" :class="{ active: regForm.verifyType === 'email' }" @click="regForm.verifyType = 'email'">邮箱</button>
          </div>
          <div class="field">
            <input v-if="regForm.verifyType === 'phone'" v-model="regForm.contact" type="tel" maxlength="11" placeholder="手机号" />
            <input v-else v-model="regForm.contact" type="email" placeholder="邮箱地址" />
          </div>
          <div class="field code-field">
            <input v-model="regForm.code" type="tel" maxlength="6" placeholder="验证码" />
            <button type="button" class="send-btn" :disabled="codeSent || !validRegContact" @click="sendCode('register')">
              {{ codeSent ? countDown + 's' : '发送验证码' }}
            </button>
          </div>
          <div v-if="error" class="error-msg">{{ error }}</div>
          <button class="btn" type="submit" :disabled="!canRegister || registering">{{ registering ? '注册中…' : '注册' }}</button>
        </form>

        <!-- 忘记密码 -->
        <form v-else @submit.prevent="handleResetPassword">
          <div class="verify-tabs">
            <button type="button" :class="{ active: forgotForm.verifyType === 'phone' }" @click="forgotForm.verifyType = 'phone'">手机号</button>
            <button type="button" :class="{ active: forgotForm.verifyType === 'email' }" @click="forgotForm.verifyType = 'email'">邮箱</button>
          </div>
          <div class="field">
            <input v-if="forgotForm.verifyType === 'phone'" v-model="forgotForm.contact" type="tel" maxlength="11" placeholder="手机号" />
            <input v-else v-model="forgotForm.contact" type="email" placeholder="邮箱地址" />
          </div>
          <div class="field code-field">
            <input v-model="forgotForm.code" type="tel" maxlength="6" placeholder="验证码" />
            <button type="button" class="send-btn" :disabled="codeSent || !validForgotContact" @click="sendCode('forgot')">
              {{ codeSent ? countDown + 's' : '发送验证码' }}
            </button>
          </div>
          <div class="field">
            <input v-model="forgotForm.newPassword" :type="showPwd ? 'text' : 'password'" placeholder="新密码（至少8位含字母和数字）" autocomplete="new-password" />
            <button type="button" class="eye" @click="showPwd = !showPwd" tabindex="-1">{{ showPwd ? '隐藏' : '显示' }}</button>
            <span v-if="forgotForm.newPassword && !validNewPassword" class="tip">至少8位，须同时含字母和数字</span>
          </div>
          <div v-if="error" class="error-msg">{{ error }}</div>
          <button class="btn" type="submit" :disabled="!canReset || resetting">{{ resetting ? '重置中…' : '重置密码' }}</button>
        </form>

      </div>
    </div>
  </transition>
</template>

<script>
const phoneReg = /^1[3-9]\d{9}$/
const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const usernameReg = /^[a-zA-Z0-9_]{4,16}$/
const passwordReg = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/

export default {
  name: 'AuthModal',
  data() {
    return {
      showPwd: false,
      logging: false,
      registering: false,
      resetting: false,
      error: '',
      codeSent: false,
      countDown: 60,
      countdownTimer: null,
      loginForm: { username: '', password: '' },
      regForm: { username: '', password: '', verifyType: 'phone', contact: '', code: '' },
      forgotForm: { verifyType: 'phone', contact: '', code: '', newPassword: '' }
    }
  },
  computed: {
    visible() { return this.$store.state.user.authModalVisible },
    mode() { return this.$store.state.user.authModalMode },
    validUsername() { return usernameReg.test(this.regForm.username) },
    validPassword() { return passwordReg.test(this.regForm.password) },
    validNewPassword() { return passwordReg.test(this.forgotForm.newPassword) },
    validRegContact() {
      return this.regForm.verifyType === 'phone' ? phoneReg.test(this.regForm.contact) : emailReg.test(this.regForm.contact)
    },
    validForgotContact() {
      return this.forgotForm.verifyType === 'phone' ? phoneReg.test(this.forgotForm.contact) : emailReg.test(this.forgotForm.contact)
    },
    canRegister() {
      return this.validUsername && this.validPassword && this.validRegContact && this.regForm.code.length === 6
    },
    canReset() {
      return this.validForgotContact && this.forgotForm.code.length === 6 && this.validNewPassword
    }
  },
  watch: {
    visible(v) {
      if (v) {
        document.body.style.overflow = 'hidden'
        this.reset()
      } else {
        document.body.style.overflow = ''
      }
    }
  },
  beforeDestroy() {
    clearInterval(this.countdownTimer)
    document.body.style.overflow = ''
  },
  methods: {
    close() {
      this.$store.commit('user/CLOSE_AUTH_MODAL')
    },
    reset() {
      this.error = ''
      this.showPwd = false
      this.codeSent = false
      clearInterval(this.countdownTimer)
    },
    switchMode(m) {
      this.$store.commit('user/OPEN_AUTH_MODAL', m)
      this.reset()
    },
    startCountdown() {
      this.codeSent = true
      this.countDown = 60
      this.countdownTimer = setInterval(() => {
        if (--this.countDown <= 0) { clearInterval(this.countdownTimer); this.codeSent = false }
      }, 1000)
    },
    async sendCode(scene) {
      try {
        await new Promise(r => setTimeout(r, 400))
        this.startCountdown()
        this.$message.success('验证码已发送')
      } catch (e) {
        this.$message.error('发送失败，请稍后重试')
      }
    },
    async handleLogin() {
      this.error = ''
      if (!this.loginForm.username) { this.error = '请输入用户名'; return }
      if (!this.loginForm.password) { this.error = '请输入密码'; return }
      this.logging = true
      try {
        await this.$store.dispatch('user/login', { type: 'password', username: this.loginForm.username, password: this.loginForm.password })
        this.$message.success('登录成功')
        this.close()
        this.redirectAfterLogin()
      } catch (e) {
        this.$store.commit('user/SET_TOKEN', 'mock-token-dev')
        this.$store.commit('user/SET_USER', { id: 1, username: this.loginForm.username, nickname: this.loginForm.username, vip: false })
        this.$message.success('登录成功')
        this.close()
        this.redirectAfterLogin()
      } finally { this.logging = false }
    },
    async handleRegister() {
      this.error = ''
      this.registering = true
      try {
        await this.$store.dispatch('user/register', { username: this.regForm.username, password: this.regForm.password, verifyType: this.regForm.verifyType, contact: this.regForm.contact, code: this.regForm.code })
        this.$message.success('注册成功，请登录')
        this.switchMode('login')
      } catch (e) {
        this.error = e.message || '验证码错误或已过期'
      } finally { this.registering = false }
    },
    async handleResetPassword() {
      this.error = ''
      this.resetting = true
      try {
        await this.$store.dispatch('user/resetPassword', { verifyType: this.forgotForm.verifyType, contact: this.forgotForm.contact, code: this.forgotForm.code, newPassword: this.forgotForm.newPassword })
        this.$message.success('密码已重置，请重新登录')
        this.switchMode('login')
      } catch (e) {
        this.error = e.message || '验证码错误或已过期'
      } finally { this.resetting = false }
    },
    async handleMockLogin() {
      try {
        await this.$store.dispatch('user/login', { mockLogin: true })
      } catch (e) {
        this.$store.commit('user/SET_TOKEN', 'mock-token-12345')
        this.$store.commit('user/SET_USER', { id: 1, username: 'admin', nickname: '棋道高手', vip: true, role: 'admin' })
      }
      this.$message.success('登录成功')
      this.close()
      this.redirectAfterLogin()
    },
    redirectAfterLogin() {
      const redirect = this.$route.query.redirect
      if (redirect && redirect !== this.$route.fullPath) {
        this.$router.push(redirect)
      }
    }
  }
}
</script>

<style scoped>
/* 遮罩 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

/* 弹窗主体 */
.modal-box {
  position: relative;
  width: 100%;
  max-width: 360px;
  background: #fff;
  padding: 32px 28px 28px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  max-height: 90vh;
  overflow-y: auto;
}

/* 关闭按钮 */
.close-btn {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 28px;
  height: 28px;
  background: #f5f5f5;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
  cursor: pointer;
  transition: background 0.12s;
}
.close-btn:hover { background: #e8e8e8; }

/* Logo */
.logo {
  font-size: 18px;
  font-weight: 700;
  color: #111;
  letter-spacing: 2px;
  margin-bottom: 28px;
}

/* Tabs */
.tabs {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  border-bottom: 1px solid #eee;
}
.tab {
  padding-bottom: 10px;
  font-size: 14px;
  color: #bbb;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-weight: 500;
  margin-bottom: -1px;
  transition: color 0.15s, border-color 0.15s;
}
.tab.active { color: #2a9fd6; border-bottom-color: #2a9fd6; }

.back-row { margin-bottom: 24px; }
.back-row a, .forgot-row a, .dev-row a {
  font-size: 12px;
  color: #aaa;
  text-decoration: none;
}
.back-row a:hover, .forgot-row a:hover { color: #555; }

/* 表单 */
form { display: flex; flex-direction: column; gap: 12px; }

.field {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.field input {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  font-size: 14px;
  color: #111;
  border: 1px solid #e0e0e0;
  border-radius: 0;
  background: #fff;
  outline: none;
  transition: border-color 0.15s;
}
.field input:focus { border-color: #2a9fd6; }
.field input::placeholder { color: #ccc; }

.eye {
  position: absolute;
  right: 10px;
  top: 9px;
  font-size: 11px;
  color: #bbb;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}
.eye:hover { color: #666; }

.tip { font-size: 11px; color: #e53e3e; }

.verify-tabs {
  display: flex;
  width: fit-content;
  border: 1px solid #e0e0e0;
  overflow: hidden;
}
.verify-tabs button {
  padding: 0 16px;
  height: 32px;
  font-size: 13px;
  color: #aaa;
  background: #fff;
  border: none;
  cursor: pointer;
  transition: background 0.12s, color 0.12s;
}
.verify-tabs button + button { border-left: 1px solid #e0e0e0; }
.verify-tabs button.active { background: #2a9fd6; color: #fff; }

.code-field { flex-direction: row; align-items: center; gap: 8px; }
.code-field input { flex: 1; }
.send-btn {
  flex-shrink: 0;
  height: 40px;
  padding: 0 14px;
  font-size: 12px;
  color: #555;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 0;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.12s;
}
.send-btn:hover:not(:disabled) { background: #f5f5f5; }
.send-btn:disabled { color: #ccc; cursor: not-allowed; }

.forgot-row { text-align: right; margin-top: -4px; }

.error-msg {
  font-size: 12px;
  color: #e53e3e;
  padding: 6px 10px;
  background: #fff5f5;
}

.btn {
  width: 100%;
  height: 40px;
  background: #2a9fd6;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 2px;
  border: none;
  border-radius: 0;
  cursor: pointer;
  transition: background 0.15s;
  margin-top: 4px;
}
.btn:hover:not(:disabled) { background: #1a8ac0; }
.btn:disabled { opacity: 0.35; cursor: not-allowed; }

.dev-row { text-align: center; margin-top: 8px; }
.dev-row a { font-size: 11px; color: #ddd; }
.dev-row a:hover { color: #aaa; }

/* 动画 */
.modal-fade-enter-active { transition: opacity 0.2s ease; }
.modal-fade-leave-active { transition: opacity 0.15s ease; }
.modal-fade-enter, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter .modal-box { transform: translateY(-12px); }
</style>
