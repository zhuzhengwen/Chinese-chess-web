<template>
  <div class="explore-page">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">探索象棋文化</h1>
        <p class="page-desc">探索千年象棋文化，了解古代棋手与历史传承</p>
      </div>
      <section class="section">
        <h2 class="section-title">棋谱分类</h2>
        <div v-if="loadingCats" class="loading-area"><i class="el-icon-loading"></i> 加载中...</div>
        <div v-else class="cat-grid">
          <div
            v-for="(cat, idx) in categories"
            :key="cat.id || idx"
            class="cat-card"
            :style="{ background: catColors[idx % catColors.length] }"
            @click="$router.push('/manuals?category=' + (cat.id || cat.code))"
          >
            <div class="cat-icon">{{ cat.name ? cat.name.charAt(0) : '棋' }}</div>
            <div class="cat-info">
              <div class="cat-name">{{ cat.name }}</div>
              <div class="cat-count">{{ cat.count || 0 }} 部棋谱</div>
            </div>
          </div>
        </div>
      </section>
      <section class="section">
        <h2 class="section-title">历代名家</h2>
        <div class="masters-grid">
          <div v-for="master in masters" :key="master.name" class="master-card">
            <div class="master-avatar">{{ master.name.charAt(0) }}</div>
            <div class="master-info">
              <div class="master-name">{{ master.name }}</div>
              <div class="master-era">{{ master.era }}</div>
              <div class="master-desc">{{ master.desc }}</div>
            </div>
          </div>
        </div>
      </section>
      <section class="section">
        <h2 class="section-title">朝代与象棋</h2>
        <el-table :data="dynasties" border stripe class="dynasty-table">
          <el-table-column prop="dynasty" label="朝代" width="120">
            <template slot-scope="scope">
              <span class="dynasty-name">{{ scope.row.dynasty }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="years" label="年份" width="180" />
          <el-table-column prop="count" label="现存棋谱数" width="140">
            <template slot-scope="scope">
              <el-tag type="danger" size="small">{{ scope.row.count }} 部</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="feature" label="特点" />
        </el-table>
      </section>
      <section class="section">
        <h2 class="section-title">象棋知识</h2>
        <div class="knowledge-grid">
          <div v-for="k in knowledge" :key="k.title" class="knowledge-card">
            <div class="knowledge-icon">{{ k.icon }}</div>
            <h3 class="knowledge-title">{{ k.title }}</h3>
            <p class="knowledge-desc">{{ k.desc }}</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { manuals as manualsApi } from '../api/index'
export default {
  name: 'ExplorePage',
  data() {
    return {
      categories: [],
      loadingCats: false,
      catColors: [
        'linear-gradient(135deg, #8B1A1A, #2a9fd6)',
        'linear-gradient(135deg, #1a4a8b, #2980b9)',
        'linear-gradient(135deg, #1a5c1a, #27ae60)',
        'linear-gradient(135deg, #5c3d1a, #e67e22)',
        'linear-gradient(135deg, #4a1a5c, #9b59b6)',
        'linear-gradient(135deg, #1a5c5c, #16a085)'
      ],
      masters: [
        { name: '朱晋桢', era: '明代·嘉靖年间', desc: '《橘中秘》作者，炮局理论集大成者，对后世影响深远' },
        { name: '张乔栋', era: '清代·乾隆年间', desc: '《梅花谱》编撰者，屏风马布局理论创立者' },
        { name: '颜丙', era: '明代·成化年间', desc: '象棋理论家，对开局战术有深入研究' },
        { name: '张志', era: '清代·道光年间', desc: '著名棋手，留有多部残局精选，开局理论贡献卓著' }
      ],
      dynasties: [
        { dynasty: '明代', years: '1368–1644 年', count: 48, feature: '炮局理论成熟，《橘中秘》《适情雅趣》等名谱涌现' },
        { dynasty: '清代', years: '1644–1912 年', count: 86, feature: '棋道鼎盛，《梅花谱》《渊深海阔》等大型谱书出版' },
        { dynasty: '民国', years: '1912–1949 年', count: 34, feature: '西洋文化冲击下，象棋竞技化发展，规则逐步统一' },
        { dynasty: '近现代', years: '1949 年至今', count: 52, feature: '全国比赛体系建立，大量近代名局整理成谱' }
      ],
      knowledge: [
        { icon: '♟', title: '棋子走法', desc: '车走直线无限，马走日字，象走田字不过河，炮吃子需翻山，将帅不出九宫。' },
        { icon: '⚔', title: '开局理论', desc: '开局目的是争夺中心、快速出子、保护将帅安全，常见有当头炮、屏风马等布局。' },
        { icon: '🏆', title: '中局技巧', desc: '中局重在子力协调、攻防转换，善用牵制、封锁、引入等战术手段。' },
        { icon: '🔮', title: '残局要诀', desc: '残局讲究精准计算，车马炮兵各有残局技巧，将帅运用是制胜关键。' }
      ]
    }
  },
  mounted() { this.fetchCategories() },
  methods: {
    async fetchCategories() {
      this.loadingCats = true
      try {
        const res = await manualsApi.getCategories()
        this.categories = res.data || res || []
      } catch (e) {
        this.categories = [
          { id: 'jzm', name: '橘中秘', count: 32 },
          { id: 'mhp', name: '梅花谱', count: 28 },
          { id: 'sqyq', name: '适情雅趣', count: 45 },
          { id: 'tlyj', name: '韬略元机', count: 20 },
          { id: 'other', name: '其他名谱', count: 80 },
          { id: 'endgame', name: '残局精选', count: 60 }
        ]
      } finally { this.loadingCats = false }
    }
  }
}
</script>

<style scoped>
.explore-page { background: #f7f3ee; min-height: calc(100vh - 60px); padding-bottom: 48px; }
.container { padding: 0 24px; }
.page-header { padding: 32px 0 24px; }
.page-title { font-size: 28px; font-weight: 800; color: #1a1a1a; margin-bottom: 6px; }
.page-desc { font-size: 14px; color: #888; }
.section { margin-bottom: 40px; }
.section-title { font-size: 20px; font-weight: 700; color: #1a1a1a; margin-bottom: 20px; padding-left: 12px; position: relative; }
.section-title::before { content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 4px; height: 18px; background: #8B1A1A; border-radius: 0; }
.loading-area { text-align: center; padding: 40px; color: #999; font-size: 14px; }
.cat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.cat-card { border-radius: 0; padding: 24px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 16px; color: #fff; }
.cat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.15); }
.cat-icon { width: 52px; height: 52px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 800; flex-shrink: 0; }
.cat-name { font-size: 17px; font-weight: 700; margin-bottom: 4px; }
.cat-count { font-size: 13px; opacity: 0.85; }
.masters-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
.master-card { background: #fff; border-radius: 0; padding: 20px; display: flex; align-items: flex-start; gap: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); transition: all 0.2s; }
.master-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.1); }
.master-avatar { width: 52px; height: 52px; border-radius: 50%; background: linear-gradient(135deg, #8B1A1A, #2a9fd6); color: #fff; font-size: 20px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.master-name { font-size: 17px; font-weight: 700; color: #1a1a1a; margin-bottom: 4px; }
.master-era { font-size: 12px; color: #8B1A1A; margin-bottom: 8px; font-weight: 600; }
.master-desc { font-size: 13px; color: #666; line-height: 1.7; }
.dynasty-table { border-radius: 0; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.dynasty-table >>> .el-table__header-wrapper th { background: #8B1A1A; color: #fff; font-weight: 600; }
.dynasty-name { font-weight: 700; color: #8B1A1A; }
.knowledge-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.knowledge-card { background: #fff; border-radius: 0; padding: 24px 20px; text-align: center; box-shadow: 0 1px 4px rgba(0,0,0,0.06); transition: all 0.2s; }
.knowledge-card:hover { transform: translateY(-3px); box-shadow: 0 6px 20px rgba(0,0,0,0.1); }
.knowledge-icon { font-size: 32px; margin-bottom: 12px; }
.knowledge-title { font-size: 16px; font-weight: 700; color: #1a1a1a; margin-bottom: 10px; }
.knowledge-desc { font-size: 13px; color: #888; line-height: 1.7; text-align: left; }
@media (max-width: 768px) {
  .cat-grid { grid-template-columns: repeat(2, 1fr); }
  .masters-grid { grid-template-columns: 1fr; }
  .knowledge-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>

