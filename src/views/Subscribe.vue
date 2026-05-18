<template>
  <div class="subscribe-page">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">会员订阅</h1>
        <p class="page-desc">解锁全部200+棋谱，享受专属学习特权</p>
      </div>
      <div v-if="isVip && myPlan" class="vip-status-card">
        <div class="vip-status-left">
          <i class="el-icon-trophy" style="font-size:28px;color:#e6a817;margin-right:12px"></i>
          <div>
            <div class="vip-status-title">您当前是 <span class="vip-highlight">{{ myPlan.planName || 'VIP会员' }}</span></div>
            <div class="vip-status-sub">有效期至：{{ myPlan.expireDate || '永久' }}</div>
          </div>
        </div>
        <el-tag type="warning" size="medium">已开通</el-tag>
      </div>
      <div v-if="loading" class="loading-area"><i class="el-icon-loading"></i> 加载中...</div>
      <div v-else class="plans-row">
        <div v-for="(plan, idx) in displayPlans" :key="plan.id || idx" class="plan-card" :class="{ featured: plan.featured }">
          <div v-if="plan.featured" class="featured-badge">推荐</div>
          <div class="plan-name">{{ plan.name }}</div>
          <div class="plan-price-area">
            <span class="plan-currency">¥</span>
            <span class="plan-price">{{ plan.price }}</span>
            <span class="plan-duration">/ {{ plan.duration }}</span>
          </div>
          <div class="plan-origin" v-if="plan.originPrice">原价 ¥{{ plan.originPrice }}</div>
          <ul class="plan-features">
            <li v-for="f in plan.features" :key="f"><i class="el-icon-check"></i> {{ f }}</li>
          </ul>
          <el-button :class="plan.featured ? 'subscribe-btn-featured' : 'subscribe-btn'" :loading="subscribing === plan.id" @click="handleSubscribe(plan)">立即订阅</el-button>
        </div>
      </div>
      <div class="compare-section">
        <h2 class="section-title">权益对比</h2>
        <el-table :data="compareData" border class="compare-table">
          <el-table-column prop="feature" label="权益" width="200" />
          <el-table-column prop="free" label="免费用户" align="center" width="140">
            <template slot-scope="scope">
              <i v-if="scope.row.free === true" class="el-icon-check" style="color:#27ae60;font-size:16px"></i>
              <i v-else-if="scope.row.free === false" class="el-icon-close" style="color:#e74c3c;font-size:16px"></i>
              <span v-else>{{ scope.row.free }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="vip" label="VIP会员" align="center">
            <template slot-scope="scope">
              <i v-if="scope.row.vip === true" class="el-icon-check" style="color:#27ae60;font-size:16px"></i>
              <i v-else-if="scope.row.vip === false" class="el-icon-close" style="color:#e74c3c;font-size:16px"></i>
              <span v-else style="color:#e6a817;font-weight:600">{{ scope.row.vip }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="faq-section">
        <h2 class="section-title">常见问题</h2>
        <el-collapse>
          <el-collapse-item v-for="faq in faqs" :key="faq.q" :title="faq.q">
            <div class="faq-answer">{{ faq.a }}</div>
          </el-collapse-item>
        </el-collapse>
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
        { feature: '免费棋谱浏览', free: '50部', vip: '200+部' },
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
          features: ['解锁全部200+棋谱', '棋步高清演示', 'VIP专属棋谱', '学习进度同步']
        },
        {
          id: 'yearly', name: '年度会员', price: '98', duration: '年', originPrice: '168', featured: true,
          features: ['解锁全部200+棋谱', '棋步高清演示', 'VIP专属棋谱', '学习进度同步', '离线下载', '专属客服支持', '新谱优先解锁']
        },
        {
          id: 'lifetime', name: '永久会员', price: '298', duration: '永久', originPrice: '498', featured: false,
          features: ['解锁全部200+棋谱', '棋步高清演示', 'VIP专属棋谱', '学习进度同步', '离线下载', '专属客服支持', '新谱优先解锁', '终身免费更新']
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
        this.$confirm('登录后才能订阅会员，是否立即前往登录？', '提示', {
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
.subscribe-page { background: #f7f3ee; min-height: calc(100vh - 60px); padding-bottom: 48px; }
.container { max-width: 1000px; margin: 0 auto; padding: 0 24px; }
.page-header { padding: 32px 0 24px; text-align: center; }
.page-title { font-size: 32px; font-weight: 800; color: #1a1a1a; margin-bottom: 8px; }
.page-desc { font-size: 15px; color: #888; }
.vip-status-card { background: linear-gradient(135deg, #2c1810, #4a2020); border-radius: 12px; padding: 20px 24px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; color: #fff; }
.vip-status-left { display: flex; align-items: center; }
.vip-status-title { font-size: 16px; font-weight: 600; margin-bottom: 4px; }
.vip-highlight { color: #f4c842; font-weight: 700; }
.vip-status-sub { font-size: 13px; opacity: 0.7; }
.loading-area { text-align: center; padding: 60px; color: #999; font-size: 14px; }
.plans-row { display: flex; gap: 20px; margin-bottom: 48px; align-items: flex-start; }
.plan-card { flex: 1; background: #fff; border-radius: 16px; padding: 32px 24px; text-align: center; position: relative; box-shadow: 0 2px 8px rgba(0,0,0,0.07); transition: all 0.2s; border: 2px solid transparent; }
.plan-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
.plan-card.featured { border-color: #8B1A1A; transform: scale(1.04); box-shadow: 0 8px 32px rgba(139,26,26,0.2); z-index: 1; }
.plan-card.featured:hover { transform: scale(1.04) translateY(-4px); }
.featured-badge { position: absolute; top: -1px; left: 50%; transform: translateX(-50%); background: #8B1A1A; color: #fff; font-size: 12px; font-weight: 700; padding: 3px 16px; border-radius: 0 0 8px 8px; }
.plan-name { font-size: 18px; font-weight: 700; color: #1a1a1a; margin-bottom: 16px; margin-top: 8px; }
.plan-price-area { display: flex; align-items: baseline; justify-content: center; gap: 2px; margin-bottom: 4px; }
.plan-currency { font-size: 18px; font-weight: 600; color: #8B1A1A; }
.plan-price { font-size: 44px; font-weight: 800; color: #8B1A1A; line-height: 1; }
.plan-duration { font-size: 14px; color: #999; }
.plan-origin { font-size: 13px; color: #bbb; text-decoration: line-through; margin-bottom: 20px; }
.plan-features { list-style: none; padding: 0; margin: 0 0 24px; text-align: left; }
.plan-features li { font-size: 14px; color: #555; padding: 6px 0; border-bottom: 1px solid #f5f5f5; display: flex; align-items: center; gap: 8px; }
.plan-features li:last-child { border-bottom: none; }
.plan-features .el-icon-check { color: #27ae60; flex-shrink: 0; }
.subscribe-btn { width: 100%; font-size: 15px; font-weight: 600; padding: 12px; border-color: #8B1A1A !important; color: #8B1A1A !important; }
.subscribe-btn-featured { width: 100%; font-size: 15px; font-weight: 700; padding: 12px; background: #8B1A1A !important; border-color: #8B1A1A !important; color: #fff !important; }
.compare-section, .faq-section { margin-bottom: 40px; }
.section-title { font-size: 20px; font-weight: 700; color: #1a1a1a; margin-bottom: 20px; padding-left: 12px; position: relative; }
.section-title::before { content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 4px; height: 18px; background: #8B1A1A; border-radius: 2px; }
.compare-table { border-radius: 10px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.compare-table >>> th { background: #8B1A1A !important; color: #fff !important; font-weight: 600; }
.faq-answer { font-size: 14px; color: #666; line-height: 1.8; padding: 4px 0; }
@media (max-width: 768px) {
  .plans-row { flex-direction: column; }
  .plan-card.featured { transform: none; }
}
</style>
