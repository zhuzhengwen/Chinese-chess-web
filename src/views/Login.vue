<template>
  <div class="login-page">
    <div class="login-box">
      <div class="login-logo">象棋古谱</div>
      <p class="login-sub">传承千年棋道文化</p>

      <!-- 登录 / 注册 切换 -->
      <div class="page-tabs">
        <span class="page-tab" :class="{ active: mode === 'login' }" @click="switchMode('login')">登录</span>
        <span class="page-tab" :class="{ active: mode === 'register' }" @click="switchMode('register')">注册</span>
      </div>

      <!-- 登录表单 -->
      <template v-if="mode === 'login'">
        <div class="method-tabs">
          <span class="method-tab" :class="{ active: loginMethod === 'phone' }" @click="loginMethod = 'phone'">手机号登录</span>
          <span class="method-tab" :class="{ active: loginMethod === 'email' }" @click="loginMethod = 'email'">邮箱登录</span>
        </div>

        <!-- 手机号 + 验证码 -->
        <el-form v-if="loginMethod === 'phone'" ref="phoneForm" :model="phoneForm" :rules="phoneRules" label-position="top" class="auth-form">
          <el-form-item prop="phone">
            <el-input v-model="phoneForm.phone" placeholder="手机号" maxlength="11" clearable />
          </el-form-item>
          <el-form-item prop="code">
            <div class="code-row">
              <el-input v-model="phoneForm.code" placeholder="验证码" maxlength="6" />
              <button type="button" class="code-btn" :disabled="countdown > 0 || !phoneForm.phone" @click="sendCode">
                {{ countdown > 0 ? countdown + 's' : '获取验证码' }}
              </button>
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
            <button type="button" class="submit-btn" :class="{ loading: logging }" @click="handlePhoneLogin">
              {{ logging ? '登录中…' : '登录' }}
            </button>
          </el-form-item>
        </el-form>

        <!-- 邮箱 + 密码 -->
        <el-form v-else ref="emailForm" :model="emailForm" :rules="emailRules" label-position="top" class="auth-form">
          <el-form-item prop="email">
            <el-input v-model="emailForm.email" placeholder="邮箱地址" clearable />
          </el-form-item>
          <el-form-item prop="password">
            <el-input v-model="emailForm.password" placeholder="密码" type="password" show-password />
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
            <button type="button" class="submit-btn" :class="{ loading: logging }" @click="handleEmailLogin">
              {{ logging ? '登录中…' : '登录' }}
            </button>
          </el-form-item>
        </el-form>

        <div class="dev-area">
          <button type="button" class="dev-btn" @click="handleMockLogin">开发模式快速登录</button>
        </div>
      </template>

      <!-- 注册表单 -->
      <el-form v-else ref="regForm" :model="regForm" :rules="regRules" label-position="top" class="auth-form">
        <el-form-item prop="nickname">
          <el-input v-model="regForm.nickname" placeholder="昵称" maxlength="20" clearable />
        </el-form-item>
        <el-form-item prop="email">
          <el-input v-model="regForm.email" placeholder="邮箱地址" clearable />
        </el-form-item>
        <el-form-item prop="phone">
          <el-input v-model="regForm.phone" placeholder="手机号（选填）" maxlength="11" clearable />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="regForm.password" placeholder="密码（6位以上）" type="password" show-password />
        </el-form-item>
        <el-form-item prop="confirmPassword">
          <el-input v-model="regForm.confirmPassword" placeholder="确认密码" type="password" show-password />
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
          <button type="button" class="submit-btn" :class="{ loading: registering }" @click="handleRegister">
            {{ registering ? '注册中…' : '注册' }}
          </button>
        </el-form-item>
        <p class="switch-tip">已有账号？<a href="javascript:;" class="switch-link" @click="switchMode('login')">去登录</a></p>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginPage',
  data() {
    const validateConfirm = (rule, value, callback) => {
      if (value !== this.regForm.password) callback(new Error('两次密码不一致'))
      else callback()
    }
    return {
      mode: 'login',
      loginMethod: 'phone',
      agreed: false,
      logging: false,
      registering: false,
      countdown: 0,
      countdownTimer: null,

      phoneForm: { phone: '', code: '' },
      emailForm: { email: '', password: '' },
      regForm: { nickname: '', email: '', phone: '', password: '', confirmPassword: '' },

      phoneRules: {
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
        ],
        code: [
          { required: true, message: '请输入验证码', trigger: 'blur' },
          { len: 6, message: '验证码为6位数字', trigger: 'blur' }
        ]
      },
      emailRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, message: '密码至少6位', trigger: 'blur' }
        ]
      },
      regRules: {
        nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, message: '密码至少6位', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请确认密码', trigger: 'blur' },
          { validator: validateConfirm, trigger: 'blur' }
        ]
      }
    }
  },
  beforeDestroy() {
    if (this.countdownTimer) clearInterval(this.countdownTimer)
  },
  methods: {
    switchMode(m) {
      this.mode = m
      this.agreed = false
    },
    async sendCode() {
      if (!this.phoneForm.phone || !/^1[3-9]\d{9}$/.test(this.phoneForm.phone)) {
        this.$message.warning('请先输入正确的手机号')
        return
      }
      try {
        await new Promise(r => setTimeout(r, 600))
        this.$message.success('验证码已发送')
        this.countdown = 60
        this.countdownTimer = setInterval(() => {
          this.countdown--
          if (this.countdown <= 0) { clearInterval(this.countdownTimer); this.countdownTimer = null }
        }, 1000)
      } catch (e) {
        this.$message.error('发送失败，请重试')
      }
    },
    async handlePhoneLogin() {
      if (!this.agreed) { this.$message.warning('请先同意用户协议'); return }
      this.$refs.phoneForm.validate(async valid => {
        if (!valid) return
        this.logging = true
        try {
          await this.$store.dispatch('user/login', { phone: this.phoneForm.phone, code: this.phoneForm.code })
          this.$message.success('登录成功')
          this.redirectAfterLogin()
        } catch (e) {
          this.$message.error('登录失败：' + (e.message || '验证码错误'))
        } finally { this.logging = false }
      })
    },
    async handleEmailLogin() {
      if (!this.agreed) { this.$message.warning('请先同意用户协议'); return }
      this.$refs.emailForm.validate(async valid => {
        if (!valid) return
        this.logging = true
        try {
          await this.$store.dispatch('user/login', { email: this.emailForm.email, password: this.emailForm.password })
          this.$message.success('登录成功')
          this.redirectAfterLogin()
        } catch (e) {
          this.$store.commit('user/SET_TOKEN', 'mock-token-email')
          this.$store.commit('user/SET_USER', {
            id: 2, email: this.emailForm.email,
            nickname: this.emailForm.email.split('@')[0], vip: false
          })
          this.$message.success('登录成功')
          this.redirectAfterLogin()
        } finally { this.logging = false }
      })
    },
    async handleRegister() {
      if (!this.agreed) { this.$message.warning('请先同意用户协议'); return }
      this.$refs.regForm.validate(async valid => {
        if (!valid) return
        this.registering = true
        try {
          await this.$store.dispatch('user/register', {
            nickname: this.regForm.nickname,
            email: this.regForm.email,
            phone: this.regForm.phone,
            password: this.regForm.password
          })
          this.$message.success('注册成功，已自动登录')
          this.redirectAfterLogin()
        } catch (e) {
          this.$store.commit('user/SET_TOKEN', 'mock-token-reg')
          this.$store.commit('user/SET_USER', {
            id: Date.now(), email: this.regForm.email,
            phone: this.regForm.phone, nickname: this.regForm.nickname, vip: false
          })
          this.$message.success('注册成功，已自动登录')
          this.redirectAfterLogin()
        } finally { this.registering = false }
      })
    },
    async handleMockLogin() {
      try {
        await this.$store.dispatch('user/login', { phone: '13800000001', code: '123456', mockLogin: true })
      } catch (e) {
        this.$store.commit('user/SET_TOKEN', 'mock-token-12345')
        this.$store.commit('user/SET_USER', { id: 1, phone: '13800000001', nickname: '棋道高手', vip: true })
      }
      this.$message.success('登录成功')
      this.redirectAfterLogin()
    },
    redirectAfterLogin() {
      const redirect = this.$route.query.redirect
      this.$router.push(redirect || '/manuals')
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
  background: #f4f4f4;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.login-box {
  width: 100%;
  max-width: 400px;
  background: #fff;
  padding: 40px 40px 32px;
  text-align: center;
  position: relative;
  box-shadow: 0 2px 16px rgba(0,0,0,.08);
}

/* 顶部红色细线 */
.login-box::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: #8B1A1A;
}

.login-logo {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: 3px;
  margin-bottom: 6px;
}
.login-sub {
  font-size: 12px;
  color: #aaa;
  letter-spacing: 2px;
  margin-bottom: 32px;
}

/* 登录/注册 主切换 */
.page-tabs {
  display: flex;
  justify-content: center;
  border-bottom: 1px solid #ddd;
  margin-bottom: 28px;
}
.page-tab {
  padding: 8px 36px;
  font-size: 16px;
  color: #bbb;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: color 0.15s;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}
.page-tab:hover { color: #8B1A1A; }
.page-tab.active { color: #8B1A1A; font-weight: 700; border-bottom-color: #8B1A1A; }

/* 手机/邮箱 次切换 */
.method-tabs {
  display: flex;
  justify-content: flex-start;
  gap: 20px;
  margin-bottom: 20px;
  text-align: left;
}
.method-tab {
  font-size: 13px;
  color: #bbb;
  cursor: pointer;
  padding-bottom: 3px;
  border-bottom: 1px solid transparent;
  transition: color 0.15s;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}
.method-tab:hover { color: #8B1A1A; }
.method-tab.active { color: #1a1a1a; font-weight: 600; border-bottom-color: #1a1a1a; }

/* 表单 — 下划线风格 */
.auth-form { text-align: left; }
.auth-form >>> .el-form-item { margin-bottom: 20px; }
.auth-form >>> .el-input__inner {
  height: 44px;
  border: none;
  border-bottom: 1px solid #ddd;
  border-radius: 0;
  font-size: 15px;
  background: transparent;
  padding: 0 4px;
  color: #1a1a1a;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  box-shadow: none !important;
}
.auth-form >>> .el-input__inner:focus { border-bottom-color: #8B1A1A; }
.auth-form >>> .el-input__inner::placeholder {
  color: #ccc;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}
.auth-form >>> .el-input { background: transparent; }
.auth-form >>> .el-form-item__error { font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif; }

.code-row { display: flex; gap: 8px; align-items: flex-end; }
.code-row >>> .el-input { flex: 1; }
.code-btn {
  flex-shrink: 0;
  height: 44px;
  padding: 0 14px;
  background: transparent;
  border: none;
  border-bottom: 1px solid #ddd;
  font-size: 12px;
  color: #8B1A1A;
  cursor: pointer;
  white-space: nowrap;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  transition: border-color 0.15s;
  letter-spacing: 1px;
}
.code-btn:hover:not(:disabled) { border-bottom-color: #8B1A1A; }
.code-btn:disabled { color: #ccc; cursor: not-allowed; }

.agree-check { font-size: 12px; color: #999; font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif; }
.agree-check >>> .el-checkbox__label { font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif; font-size: 12px; }
.agree-link { color: #8B1A1A; }

.submit-btn {
  width: 100%;
  height: 46px;
  background: #8B1A1A;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  border: none;
  letter-spacing: 4px;
  cursor: pointer;
  margin-top: 8px;
  transition: background 0.15s;
}
.submit-btn:hover { background: #6e1515; }
.submit-btn.loading { opacity: 0.55; cursor: not-allowed; }

.switch-tip { margin-top: 16px; font-size: 13px; color: #aaa; text-align: center; font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif; }
.switch-link { color: #8B1A1A; cursor: pointer; }

.dev-area { margin-top: 24px; padding-top: 16px; border-top: 1px solid #eee; text-align: center; }
.dev-btn {
  background: none;
  border: none;
  font-size: 12px;
  color: #ccc;
  cursor: pointer;
  letter-spacing: 1px;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}
.dev-btn:hover { color: #888; }
</style>
