<template>
  <div class="manual-list-page">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">棋谱库</h1>
        <p class="page-desc">收录200+经典象棋古谱，传承千年棋道智慧</p>
      </div>
      <div class="layout">
        <aside class="sidebar" :class="{ 'sidebar-open': sidebarOpen }">
          <div class="sidebar-section">
            <div class="sidebar-title">棋谱分类</div>
            <div class="cat-item" :class="{ active: selectedCategory === '' }" @click="selectCategory('')">全部分类</div>
            <div
              v-for="cat in categories"
              :key="cat.id || cat.code"
              class="cat-item"
              :class="{ active: selectedCategory === (cat.id || cat.code) }"
              @click="selectCategory(cat.id || cat.code)"
            >
              <span>{{ cat.name }}</span>
              <span class="cat-count">{{ cat.count || '' }}</span>
            </div>
          </div>
          <div class="sidebar-section">
            <div class="sidebar-title">难度筛选</div>
            <el-radio-group v-model="selectedDifficulty" @change="handleFilterChange" class="diff-group">
              <el-radio-button label="">全部</el-radio-button>
              <el-radio-button label="1">入门</el-radio-button>
              <el-radio-button label="2">进阶</el-radio-button>
              <el-radio-button label="3">高级</el-radio-button>
              <el-radio-button label="4">大师</el-radio-button>
            </el-radio-group>
          </div>
        </aside>
        <main class="main-area">
          <div class="search-bar">
            <el-input
              v-model="keyword"
              placeholder="搜索棋谱名称、作者…"
              prefix-icon="el-icon-search"
              clearable
              @clear="handleFilterChange"
              @keyup.enter.native="handleFilterChange"
              class="search-input"
            >
              <el-button slot="append" @click="handleFilterChange">搜索</el-button>
            </el-input>
            <el-button class="filter-toggle" icon="el-icon-s-operation" @click="sidebarOpen = !sidebarOpen">筛选</el-button>
          </div>
          <div class="result-info" v-if="!loading">共找到 <strong>{{ total }}</strong> 部棋谱</div>
          <div v-if="loading" class="loading-area"><i class="el-icon-loading"></i> 加载中...</div>
          <div v-else>
            <div class="manual-card" v-for="item in list" :key="item.id" @click="$router.push('/manuals/' + item.id)">
              <div class="card-left">
                <div class="card-cover">{{ item.title ? item.title.charAt(0) : '棋' }}</div>
              </div>
              <div class="card-body">
                <div class="card-head">
                  <span class="card-title">{{ item.title }}</span>
                  <el-tag v-if="item.isPremium || item.premium" type="warning" size="mini" class="vip-tag">VIP</el-tag>
                </div>
                <div class="card-meta">
                  <el-tag size="mini" type="info">{{ item.dynasty || '未知朝代' }}</el-tag>
                  <span class="author">{{ item.author || '佚名' }}</span>
                  <span class="category-tag">{{ item.categoryName || item.category }}</span>
                </div>
                <div class="card-desc">{{ item.description || item.desc || '经典象棋古谱，传承棋道文化' }}</div>
                <div class="card-footer">
                  <span class="stars">
                    <i v-for="n in 5" :key="n" class="el-icon-star-on" :style="{ color: n <= (item.difficulty || 3) ? '#e6a817' : '#ddd' }"></i>
                  </span>
                  <span class="diff-label">{{ difficultyLabel(item.difficulty) }}</span>
                </div>
              </div>
              <div class="card-arrow"><i class="el-icon-arrow-right"></i></div>
            </div>
            <div v-if="!list.length" class="empty-state">
              <i class="el-icon-search" style="font-size:40px;color:#ccc"></i>
              <p>未找到符合条件的棋谱</p>
            </div>
          </div>
          <div class="pagination-wrap" v-if="total > pageSize">
            <el-pagination background layout="prev, pager, next" :total="total" :page-size="pageSize" :current-page.sync="page" @current-change="fetchList" />
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script>
import { manuals as manualsApi } from '../api/index'
export default {
  name: 'ManualList',
  data() {
    return {
      list: [], categories: [], total: 0, page: 1, pageSize: 12,
      keyword: '', selectedCategory: '', selectedDifficulty: '',
      loading: false, sidebarOpen: false
    }
  },
  mounted() {
    if (this.$route.query.category) this.selectedCategory = this.$route.query.category
    if (this.$route.query.keyword) this.keyword = this.$route.query.keyword
    this.fetchCategories()
    this.fetchList()
  },
  watch: {
    '$route.query'(newQ) {
      if (newQ.category !== undefined) this.selectedCategory = newQ.category || ''
      this.fetchList()
    }
  },
  methods: {
    async fetchCategories() {
      try {
        const res = await manualsApi.getCategories()
        this.categories = res.data || res || []
      } catch (e) {
        this.categories = [
          { id: 'jzm', name: '橘中秘', count: 32 },
          { id: 'mhp', name: '梅花谱', count: 28 },
          { id: 'sqyq', name: '适情雅趣', count: 45 },
          { id: 'tlyj', name: '韬略元机', count: 20 },
          { id: 'other', name: '其他名谱', count: 80 }
        ]
      }
    },
    async fetchList() {
      this.loading = true
      try {
        const res = await manualsApi.getList({
          category: this.selectedCategory, keyword: this.keyword,
          difficulty: this.selectedDifficulty, page: this.page, size: this.pageSize
        })
        const data = res.data || res || {}
        this.list = data.list || data.records || data || []
        this.total = data.total || this.list.length
      } catch (e) {
        this.list = [
          { id: 1, title: '橘中秘·炮局第一', dynasty: '明', author: '朱晋桢', difficulty: 3, description: '以炮为主要攻击武器的开局战术体系', categoryName: '橘中秘' },
          { id: 2, title: '梅花谱·屏风马局', dynasty: '清', author: '张乔栋', difficulty: 4, description: '以马为防守核心的稳健布局方式', categoryName: '梅花谱' },
          { id: 3, title: '适情雅趣·残局精选', dynasty: '清', author: '佚名', difficulty: 2, description: '精选残局练习，提升计算深度', categoryName: '适情雅趣' },
          { id: 4, title: '韬略元机·开局要诀', dynasty: '明', author: '颜丙', difficulty: 3, description: '系统讲解开局理论与实战技巧', categoryName: '韬略元机' },
          { id: 5, title: '竹香斋·全局对弈', dynasty: '清', author: '张志', difficulty: 5, description: '高水平全局对弈记录', categoryName: '其他名谱', isPremium: true },
          { id: 6, title: '渊深海阔·残局集', dynasty: '清', author: '佚名', difficulty: 4, description: '汇集清代著名残局', categoryName: '其他名谱', isPremium: true }
        ]
        this.total = this.list.length
      } finally { this.loading = false }
    },
    selectCategory(id) { this.selectedCategory = id; this.page = 1; this.fetchList() },
    handleFilterChange() { this.page = 1; this.fetchList() },
    difficultyLabel(d) {
      const map = { 1: '入门', 2: '进阶', 3: '高级', 4: '大师', 5: '宗师' }
      return map[d] || '未知'
    }
  }
}
</script>

<style scoped>
.manual-list-page { background: #f7f3ee; min-height: calc(100vh - 60px); padding-bottom: 48px; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
.page-header { padding: 32px 0 24px; }
.page-title { font-size: 28px; font-weight: 800; color: #1a1a1a; margin-bottom: 6px; }
.page-desc { font-size: 14px; color: #888; }
.layout { display: flex; gap: 24px; align-items: flex-start; }
.sidebar { width: 220px; flex-shrink: 0; }
.sidebar-section { background: #fff; border-radius: 10px; padding: 16px; margin-bottom: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.sidebar-title { font-size: 13px; font-weight: 700; color: #888; letter-spacing: 1px; margin-bottom: 12px; }
.cat-item { display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; border-radius: 6px; font-size: 14px; color: #555; cursor: pointer; transition: all 0.15s; margin-bottom: 2px; }
.cat-item:hover { background: #fdf0f0; color: #8B1A1A; }
.cat-item.active { background: #8B1A1A; color: #fff; }
.cat-count { font-size: 11px; opacity: 0.7; }
.diff-group { display: flex; flex-wrap: wrap; gap: 6px; }
.diff-group >>> .el-radio-button__inner { padding: 5px 10px; font-size: 12px; border-radius: 4px !important; border: 1px solid #ddd; }
.diff-group >>> .el-radio-button.is-active .el-radio-button__inner { background: #8B1A1A; border-color: #8B1A1A; }
.main-area { flex: 1; min-width: 0; }
.search-bar { display: flex; gap: 12px; margin-bottom: 16px; }
.search-input { flex: 1; }
.search-input >>> .el-input-group__append button { background: #8B1A1A; color: #fff; border-color: #8B1A1A; }
.filter-toggle { display: none; }
.result-info { font-size: 13px; color: #999; margin-bottom: 16px; }
.result-info strong { color: #8B1A1A; }
.loading-area { text-align: center; padding: 60px; color: #999; font-size: 14px; }
.manual-card { background: #fff; border-radius: 10px; display: flex; align-items: center; padding: 16px; margin-bottom: 12px; cursor: pointer; transition: all 0.2s; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.manual-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.1); transform: translateX(2px); }
.card-left { margin-right: 16px; }
.card-cover { width: 56px; height: 56px; border-radius: 10px; background: linear-gradient(135deg, #8B1A1A, #c0392b); color: #fff; font-size: 20px; font-weight: 800; display: flex; align-items: center; justify-content: center; }
.card-body { flex: 1; min-width: 0; }
.card-head { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.card-title { font-size: 16px; font-weight: 700; color: #1a1a1a; }
.vip-tag { background: linear-gradient(135deg, #e6a817, #f4c842) !important; border: none !important; color: #fff !important; }
.card-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; flex-wrap: wrap; }
.author { font-size: 13px; color: #888; }
.category-tag { font-size: 12px; color: #8B1A1A; background: #fdf0f0; padding: 1px 8px; border-radius: 4px; }
.card-desc { font-size: 13px; color: #999; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-bottom: 8px; }
.card-footer { display: flex; align-items: center; gap: 8px; }
.stars { font-size: 13px; }
.diff-label { font-size: 12px; color: #bbb; }
.card-arrow { color: #ccc; font-size: 18px; margin-left: 8px; }
.empty-state { text-align: center; padding: 60px; color: #bbb; font-size: 14px; }
.empty-state p { margin-top: 12px; }
.pagination-wrap { display: flex; justify-content: center; margin-top: 32px; }
.pagination-wrap >>> .el-pagination.is-background .el-pager li.active { background: #8B1A1A; }
@media (max-width: 768px) {
  .layout { flex-direction: column; }
  .sidebar { width: 100%; display: none; }
  .sidebar.sidebar-open { display: block; }
  .filter-toggle { display: inline-flex; }
}
</style>
