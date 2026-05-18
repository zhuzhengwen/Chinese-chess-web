<template>
  <div class="home">
    <section class="hero">
      <div class="hero-inner">
        <h1 class="hero-title">象棋古谱</h1>
        <p class="hero-subtitle">传承千年棋道文化 · 精选200+古典棋谱</p>
        <div class="hero-btns">
          <el-button type="primary" size="large" class="btn-start" @click="$router.push('/manuals')">开始学习</el-button>
          <el-button size="large" class="btn-member" @click="$router.push('/subscribe')">了解会员</el-button>
        </div>
      </div>
    </section>
    <section class="stats-section">
      <div class="container">
        <div class="stats-row">
          <div class="stat-card"><div class="stat-num">200+</div><div class="stat-label">精选棋谱</div></div>
          <div class="stat-card"><div class="stat-num">4大</div><div class="stat-label">古典名谱</div></div>
          <div class="stat-card"><div class="stat-num">10万+</div><div class="stat-label">棋友学习</div></div>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">今日推荐</h2>
          <router-link to="/manuals" class="more-link">查看全部 →</router-link>
        </div>
        <div v-if="loadingRecommended" class="loading-area"><i class="el-icon-loading"></i> 加载中...</div>
        <div v-else class="manual-grid">
          <div v-for="item in recommendedList" :key="item.id" class="manual-card" @click="$router.push('/manuals/' + item.id)">
            <div class="card-top">
              <span v-if="item.isPremium || item.premium" class="vip-badge">VIP</span>
            </div>
            <div class="card-title">{{ item.title }}</div>
            <div class="card-meta">{{ item.dynasty }}·{{ item.author }}</div>
            <div class="card-stars">
              <i v-for="n in 5" :key="n" class="el-icon-star-on" :style="{ color: n <= (item.difficulty || 3) ? '#e6a817' : '#ddd' }"></i>
            </div>
          </div>
          <div v-if="!recommendedList.length" class="empty-tip">暂无推荐数据</div>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="section-header"><h2 class="section-title">四大名谱</h2></div>
        <div class="classic-grid">
          <div v-for="book in classicBooks" :key="book.name" class="classic-card" @click="$router.push('/manuals?category=' + book.cat)">
            <div class="classic-icon">{{ book.icon }}</div>
            <div class="classic-name">{{ book.name }}</div>
            <div class="classic-desc">{{ book.desc }}</div>
          </div>
        </div>
      </div>
    </section>
    <section class="vip-banner">
      <div class="vip-banner-inner">
        <div class="vip-text">
          <h3>开通会员 · 解锁全部棋谱</h3>
          <p>畅享200+高清棋谱，专属学习路径，无限演示回放</p>
        </div>
        <el-button class="vip-cta-btn" @click="$router.push('/subscribe')">立即开通</el-button>
      </div>
    </section>
  </div>
</template>

<script>
import { manuals as manualsApi } from '../api/index'
export default {
  name: 'HomePage',
  data() {
    return {
      recommendedList: [],
      loadingRecommended: false,
      classicBooks: [
        { name: '橘中秘', icon: '橘', desc: '明代象棋经典', cat: 'jzm' },
        { name: '梅花谱', icon: '梅', desc: '清代弈棋精华', cat: 'mhp' },
        { name: '适情雅趣', icon: '适', desc: '清代传世名谱', cat: 'sqyq' },
        { name: '韬略元机', icon: '韬', desc: '明清弈道精要', cat: 'tlyj' }
      ]
    }
  },
  mounted() { this.fetchRecommended() },
  methods: {
    async fetchRecommended() {
      this.loadingRecommended = true
      try {
        const res = await manualsApi.getRecommended()
        const list = res.data || res || []
        this.recommendedList = list.slice(0, 6)
      } catch (e) {
        this.recommendedList = [
          { id: 1, title: '橘中秘·炮局', dynasty: '明', author: '朱晋桢', difficulty: 3 },
          { id: 2, title: '梅花谱·屏风马', dynasty: '清', author: '张乔栋', difficulty: 4 },
          { id: 3, title: '适情雅趣·残局', dynasty: '清', author: '佚名', difficulty: 2 },
          { id: 4, title: '韬略元机·开局', dynasty: '明', author: '颜丙', difficulty: 3 },
          { id: 5, title: '竹香斋·全局', dynasty: '清', author: '张志', difficulty: 5, isPremium: true },
          { id: 6, title: '渊深海阔·残局', dynasty: '清', author: '佚名', difficulty: 4, isPremium: true }
        ]
      } finally { this.loadingRecommended = false }
    }
  }
}
</script>

<style scoped>
.home { background: #f7f3ee; }
.hero { height: 320px; background: linear-gradient(135deg, #8B1A1A 0%, #5C0000 100%); display: flex; align-items: center; justify-content: center; text-align: center; }
.hero-title { font-size: 52px; font-weight: 900; color: #fff; letter-spacing: 8px; margin-bottom: 12px; }
.hero-subtitle { font-size: 16px; color: rgba(255,255,255,0.85); letter-spacing: 2px; margin-bottom: 32px; }
.hero-btns { display: flex; gap: 16px; justify-content: center; }
.btn-start { background: #fff !important; color: #8B1A1A !important; border-color: #fff !important; font-weight: 700; padding: 12px 36px; font-size: 15px; }
.btn-member { background: transparent !important; color: #fff !important; border-color: rgba(255,255,255,0.6) !important; font-weight: 600; padding: 12px 36px; font-size: 15px; }
.stats-section { background: #fff; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
.stats-row { display: flex; }
.stat-card { flex: 1; padding: 28px 16px; text-align: center; border-right: 1px solid #f0f0f0; }
.stat-card:last-child { border-right: none; }
.stat-num { font-size: 32px; font-weight: 800; color: #8B1A1A; line-height: 1; margin-bottom: 8px; }
.stat-label { font-size: 14px; color: #888; }
.section { padding: 40px 0; }
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
.section-title { font-size: 22px; font-weight: 700; color: #1a1a1a; padding-left: 12px; position: relative; }
.section-title::before { content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 4px; height: 20px; background: #8B1A1A; border-radius: 2px; }
.more-link { font-size: 13px; color: #8B1A1A; text-decoration: none; }
.manual-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.manual-card { background: #fff; border-radius: 10px; padding: 20px; cursor: pointer; transition: all 0.2s; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.manual-card:hover { transform: translateY(-3px); box-shadow: 0 6px 20px rgba(0,0,0,0.1); }
.card-top { min-height: 20px; margin-bottom: 8px; }
.vip-badge { display: inline-block; background: linear-gradient(135deg, #e6a817, #f4c842); color: #fff; font-size: 11px; font-weight: 700; padding: 1px 7px; border-radius: 3px; }
.card-title { font-size: 16px; font-weight: 700; color: #1a1a1a; margin-bottom: 6px; }
.card-meta { font-size: 13px; color: #999; margin-bottom: 10px; }
.card-stars { font-size: 14px; }
.loading-area { text-align: center; color: #999; padding: 40px; font-size: 14px; }
.empty-tip { color: #bbb; font-size: 14px; grid-column: 1/-1; text-align: center; padding: 30px; }
.classic-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.classic-card { background: #fff; border-radius: 10px; padding: 28px 16px; text-align: center; cursor: pointer; transition: all 0.2s; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.classic-card:hover { transform: translateY(-3px); box-shadow: 0 6px 20px rgba(139,26,26,0.15); }
.classic-icon { width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #8B1A1A, #c0392b); color: #fff; font-size: 22px; font-weight: 800; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; }
.classic-name { font-size: 16px; font-weight: 700; color: #1a1a1a; margin-bottom: 4px; }
.classic-desc { font-size: 12px; color: #999; }
.vip-banner { background: linear-gradient(135deg, #2c1810, #4a2020); padding: 40px 24px; }
.vip-banner-inner { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
.vip-text h3 { font-size: 22px; font-weight: 700; color: #f4c842; margin-bottom: 8px; }
.vip-text p { font-size: 14px; color: rgba(255,255,255,0.7); }
.vip-cta-btn { background: linear-gradient(135deg, #e6a817, #f4c842) !important; color: #5C0000 !important; border: none !important; font-weight: 700; font-size: 15px; padding: 14px 40px; border-radius: 8px; }
@media (max-width: 768px) {
  .manual-grid { grid-template-columns: repeat(2, 1fr); }
  .classic-grid { grid-template-columns: repeat(2, 1fr); }
  .vip-banner-inner { flex-direction: column; gap: 20px; text-align: center; }
  .hero-title { font-size: 36px; }
}
</style>
