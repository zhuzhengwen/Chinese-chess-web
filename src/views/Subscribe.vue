<template>
  <div class="subscribe-page">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">会员订阅</h1>
        <p class="page-desc">解锁全部 200+ 棋谱，享受专属学习特权</p>
      </div>

      <div v-if="isVip && myPlan" class="vip-status-bar">
        <span>当前方案：<strong>{{ myPlan.planName || 'VIP会员' }}</strong></span>
        <span class="vip-expire">有效期至 {{ myPlan.expireDate || '永久' }}</span>
      </div>

      <div v-if="loading" class="loading-tip">加载中…</div>
      <div v-else class="plans-row">
        <div
          v-for="(plan, idx) in displayPlans"
          :key="plan.id || idx"
          class="plan-card"
          :class="{ featured: plan.featured }"
        >
          <div v-if="plan.featured" class="featured-tag">推荐</div>
          <div class="plan-name">{{ plan.name }}</div>
          <div class="plan-price-area">
            <span class="plan-currency">¥</span>
            <span class="plan-price">{{ plan.price }}</span>
            <span class="plan-unit">/ {{ plan.duration }}</span>
          </div>
          <div class="plan-origin" v-if="plan.originPrice">原价 ¥{{ plan.originPrice }}</div>
          <ul class="plan-features">
            <li v-for="f in plan.features" :key="f">{{ f }}</li>
          </ul>
          <button
            class="subscribe-btn"
            :class="{ 'subscribe-btn--featured': plan.featured }"
            :disabled="subscribing === plan.id"
            @click="handleSubscribe(plan)"
          >{{ subscribing === plan.id ? '处理中…' : '立即订阅' }}</button>
        </div>
      </div>

      <div class="compare-section">
        <h2 class="sub-title">权益对比</h2>
        <div class="compare-table">
          <div class="compare-head">
            <span class="col-feature">权益</span>
            <span class="col-free">免费用户</span>
            <span class="col-vip">VIP 会员</span>
          </div>
          <div v-for="row in compareData" :key="row.feature" class="compare-row">
            <span class="col-feature">{{ row.feature }}</span>
            <span class="col-free">
              <i v-if="row.free === true" class="check">✓</i>
              <i v-else-if="row.free === false" class="cross">✗</i>
              <span v-else>{{ row.free }}</span>
            </span>
            <span class="col-vip">
              <i v-if="row.vip === true" class="check">✓</i>
              <i v-else-if="row.vip === false" class="cross">✗</i>
              <span v-else class="vip-val">{{ row.vip }}</span>
            </span>
          </div>
        </div>
      </div>

      <div class="faq-section">
        <h2 class="sub-title">常见问题</h2>
        <div class="faq-list">
          <div v-for="faq in faqs" :key="faq.q" class="faq-item">
            <div class="faq-q">{{ faq.q }}</div>
            <div class="faq-a">{{ faq.a }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { subscribe as subscribeApi } from '../api/index'
import { mapGetters, mapState } from 'vuex'
export default {
  name: 'SubscribePage',
  data() {
    return {
      plans: [], myPlan: null, loading: false, subscribing: null,
      compareData: [
        { feature: '免费棋谱浏览', free: '50 部', vip: '200+ 部' },
        { feature: '棋步演示', free: true, vip: true },
        { feature: 'VIP专属棋谱', free: false, vip: true },
        { feature: '离线下载', free: false, vip: true },
        { feature: '学习进度记录', free: true, vip: true },
        { feature: '专属客服支持', free: false, vip: true },
        { feature: '新谱优先解锁', free: false, vip: true }
      ],
      faqs: [
        { q: '开通会员后如何使用？', a: '开通成功后立即生效，刷新页面即可看到全部解锁内容，无需重新登录。' },
        { q: '会员到期后数据会丢失吗？', a: '不会。您的学习记录和收藏始终保留，到期后仅恢复为免费用户权限。' },
        { q: '支持哪些支付方式？', a: '目前支持微信支付、支付宝，更多支付方式即将开放。' },
        { q: '永久会员是否真的永久？', a: '永久会员一次购买，终身有效，平台承诺持续维护不会关闭服务。' }
      ]
    }
  },
  computed: {
    ...mapGetters('user', ['isLoggedIn', 'isVip']),
    ...mapState('user', ['userInfo']),
    displayPlans() {
      if (this.plans.length) return this.plans
      return [
        {
          id: 'monthly', name: '月度会员', price: '18', duration: '月', originPrice: '28', featured: false,
          features: ['解锁全部 200+ 棋谱', '棋步高清演示', 'VIP 专属棋谱', '学习进度同步']
        },
        {
          id: 'yearly', name: '年度会员', price: '98', duration: '年', originPrice: '168', featured: true,
          features: ['解锁全部 200+ 棋谱', '棋步高清演示', 'VIP 专属棋谱', '学习进度同步', '离线下载', '专属客服支持', '新谱优先解锁']
        },
        {
          id: 'lifetime', name: '永久会员', price: '298', duration: '永久', originPrice: '498', featured: false,
          features: ['解锁全部 200+ 棋谱', '棋步高清演示', 'VIP 专属棋谱', '学习进度同步', '离线下载', '专属客服支持', '新谱优先解锁', '终身免费更新']
        }
      ]
    }
  },
  mounted() {
    this.fetchPlans()
    if (this.isLoggedIn) this.fetchMyPlan()
  },
  methods: {
    async fetchPlans() {
      this.loading = true
      try {
        const res = await subscribeApi.getPlans()
        const data = res.data || res || []
        if (data.length) this.plans = data
      } catch (e) { } finally { this.loading = false }
    },
    async fetchMyPlan() {
      try {
        const res = await subscribeApi.getMy()
        this.myPlan = res.data || res
      } catch (e) { }
    },
    async handleSubscribe(plan) {
      if (!this.isLoggedIn) {
        this.$confirm('登录后才能订阅会员，是否前往登录？', '提示', {
          confirmButtonText: '去登录', cancelButtonText: '取消', type: 'info'
        }).then(() => {
          this.$router.push({ path: '/login', query: { redirect: '/subscribe' } })
        }).catch(() => {})
        return
      }
      this.subscribing = plan.id
      try {
        await subscribeApi.subscribe({ plan: plan.id })
        this.$message.success(plan.name + '开通成功！')
        this.fetchMyPlan()
        this.$store.dispatch('user/fetchProfile')
      } catch (e) {
        this.$message.error('订阅失败，请稍后重试')
      } finally { this.subscribing = null }
    }
  }
}
</script>

<style scoped>
.subscribe-page { background: #fff; min-height: calc(100vh - 56px); padding-bottom: 48px; }
.container { max-width: 900px; margin: 0 auto; padding: 0 24px; }
.page-header { padding: 36px 0 24px; border-bottom: 1px solid #f0f0f0; margin-bottom: 32px; text-align: center; }
.page-title { font-size: 24px; font-weight: 700; color: #1a1a1a; margin-bottom: 4px; }
.page-desc { font-size: 13px; color: #aaa; }

/* vip status */
.vip-status-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  font-size: 13px;
  color: #555;
  margin-bottom: 24px;
}
.vip-expire { color: #bbb; margin-left: auto; }

.loading-tip { color: #bbb; font-size: 14px; padding: 40px 0; text-align: center; }

/* plans */
.plans-row { display: flex; gap: 16px; margin-bottom: 48px; align-items: flex-start; }
.plan-card {
  flex: 1;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  padding: 28px 20px;
  text-align: center;
  position: relative;
  transition: border-color 0.15s;
}
.plan-card:hover { border-color: #ddd; }
.plan-card.featured { border-color: #8B1A1A; }
.featured-tag {
  position: absolute;
  top: -1px;
  left: 50%;
  transform: translateX(-50%);
  background: #8B1A1A;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 14px;
  border-radius: 0 0 4px 4px;
  letter-spacing: 1px;
}
.plan-name { font-size: 15px; font-weight: 600; color: #1a1a1a; margin-bottom: 16px; margin-top: 8px; }
.plan-price-area { display: flex; align-items: baseline; justify-content: center; gap: 2px; margin-bottom: 4px; }
.plan-currency { font-size: 16px; color: #8B1A1A; font-weight: 600; }
.plan-price { font-size: 40px; font-weight: 800; color: #8B1A1A; line-height: 1; }
.plan-unit { font-size: 13px; color: #bbb; }
.plan-origin { font-size: 12px; color: #ccc; text-decoration: line-through; margin-bottom: 20px; }

.plan-features { list-style: none; padding: 0; margin: 0 0 20px; text-align: left; }
.plan-features li {
  font-size: 13px;
  color: #666;
  padding: 6px 0;
  border-bottom: 1px solid #fafafa;
  display: flex;
  align-items: center;
  gap: 6px;
}
.plan-features li::before { content: '·'; color: #8B1A1A; font-weight: 700; }
.plan-features li:last-child { border-bottom: none; }

.subscribe-btn {
  width: 100%;
  height: 40px;
  border: 1px solid #8B1A1A;
  background: #fff;
  color: #8B1A1A;
  font-size: 14px;
  font-weight: 600;
  border-radius: 4px;
  cursor: pointer;
  transition: opacity 0.15s;
}
.subscribe-btn:hover { opacity: 0.85; }
.subscribe-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.subscribe-btn--featured { background: #8B1A1A; color: #fff; }

/* compare */
.compare-section, .faq-section { margin-bottom: 40px; }
.sub-title { font-size: 16px; font-weight: 700; color: #1a1a1a; margin-bottom: 16px; }
.compare-table { border: 1px solid #f0f0f0; border-radius: 6px; overflow: hidden; }
.compare-head {
  display: flex;
  padding: 10px 16px;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
  font-size: 12px;
  font-weight: 600;
  color: #aaa;
}
.compare-row {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f5f5f5;
  font-size: 13px;
}
.compare-row:last-child { border-bottom: none; }
.col-feature { flex: 1; color: #555; }
.col-free, .col-vip { width: 120px; text-align: center; flex-shrink: 0; }
.check { color: #27ae60; font-style: normal; font-weight: 700; }
.cross { color: #ddd; font-style: normal; }
.vip-val { color: #8B1A1A; font-weight: 600; }

/* faq */
.faq-list { border: 1px solid #f0f0f0; border-radius: 6px; overflow: hidden; }
.faq-item { padding: 16px; border-bottom: 1px solid #f5f5f5; }
.faq-item:last-child { border-bottom: none; }
.faq-q { font-size: 14px; font-weight: 600; color: #1a1a1a; margin-bottom: 6px; }
.faq-a { font-size: 13px; color: #888; line-height: 1.7; }

@media (max-width: 768px) {
  .plans-row { flex-direction: column; }
}
</style>
