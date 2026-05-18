<template>
  <div class="manual-list-page">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">棋谱</h1>
      </div>

      <!-- 分类标签 -->
      <div class="cat-tabs">
        <span
          class="cat-tab"
          :class="{ active: selectedCategory === '' }"
          @click="selectCategory('')"
        >全部</span>
        <span
          v-for="cat in categories"
          :key="cat.id || cat.code"
          class="cat-tab"
          :class="{ active: selectedCategory === (cat.id || cat.code) }"
          @click="selectCategory(cat.id || cat.code)"
        >{{ cat.name }}</span>
      </div>

      <!-- 搜索 + 难度 -->
      <div class="filter-bar">
        <input
          v-model="keyword"
          class="search-input"
          placeholder="搜索棋谱名称、作者…"
          @keyup.enter="handleFilter"
        />
        <div class="diff-tabs">
          <span
            v-for="opt in diffOpts"
            :key="opt.val"
            class="diff-tab"
            :class="{ active: selectedDiff === opt.val }"
            @click="selectedDiff = opt.val; handleFilter()"
          >{{ opt.label }}</span>
        </div>
      </div>

      <div class="result-bar" v-if="!loading">
        共 <strong>{{ total }}</strong> 部棋谱
      </div>

      <!-- 书籍网格 -->
      <div v-if="loading" class="loading-tip">加载中…</div>
      <div v-else class="books-grid">
        <div
          v-for="item in list"
          :key="item.id"
          class="book-card"
          @click="$router.push('/manuals/' + item.id)"
        >
          <!-- 书名签 -->
          <div class="book-label">
            <span class="book-title">{{ item.title }}</span>
            <span class="book-seal" v-if="item.isPremium || item.premium">秘</span>
          </div>
          <!-- 右侧线装图案 -->
          <div class="book-deco"></div>
          <!-- 底部作者+难度 -->
          <div class="book-meta">
            <span class="book-author">{{ item.author || '' }}</span>
            <div class="book-diff">
              <span v-for="n in 5" :key="n" class="diff-dot" :class="{ filled: n <= (item.difficulty || 3) }"></span>
            </div>
          </div>
        </div>
        <div v-if="!list.length" class="empty-tip">暂无棋谱</div>
      </div>

      <div class="pagination-wrap" v-if="total > pageSize">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="total"
          :page-size="pageSize"
          :current-page.sync="page"
          @current-change="fetchList"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { manuals as manualsApi } from '../api/index'
import { MEIHUA_MANUALS } from '../data/meihuapu.js'
export default {
  name: 'ManualList',
  data() {
    return {
      list: [], categories: [], total: 0, page: 1, pageSize: 24,
      keyword: '', selectedCategory: '', selectedDiff: '',
      loading: false,
      diffOpts: [
        { val: '', label: '全部' },
        { val: '1', label: '入门' },
        { val: '2', label: '进阶' },
        { val: '3', label: '高级' },
        { val: '4', label: '大师' }
      ]
    }
  },
  mounted() {
    if (this.$route.query.category) this.selectedCategory = this.$route.query.category
    this.fetchCategories()
    this.fetchList()
  },
  watch: {
    '$route.query'(q) {
      if (q.category !== undefined) { this.selectedCategory = q.category || ''; this.fetchList() }
    }
  },
  methods: {
    async fetchCategories() {
      try {
        const res = await manualsApi.getCategories()
        this.categories = res.data || res || []
      } catch (e) {
        this.categories = [
          { id: 'cat1', name: '橘中秘' },
          { id: 'cat2', name: '梅花谱' },
          { id: 'cat3', name: '适情雅趣' },
          { id: 'cat4', name: '韬略元机' },
          { id: 'cat5', name: '残局精选' }
        ]
      }
    },
    async fetchList() {
      this.loading = true
      try {
        const res = await manualsApi.getList({
          category: this.selectedCategory,
          keyword: this.keyword,
          difficulty: this.selectedDiff,
          page: this.page,
          size: this.pageSize
        })
        const data = res.data || res || {}
        this.list = data.list || data.records || (Array.isArray(data) ? data : [])
        this.total = data.total || this.list.length
      } catch (e) {
        const base = [
          { id: 1, title: '橘中秘·出车取士局', dynasty: '明', author: '朱晋桢', difficulty: 3, categoryName: '橘中秘', category: 'cat1' },
          { id: 3, title: '适情雅趣·当头炮进三兵', dynasty: '明', author: '颜丙', difficulty: 2, categoryName: '适情雅趣', category: 'cat3', isPremium: true },
          { id: 4, title: '韬略元机·顺炮横车对直车', dynasty: '清', author: '张志', difficulty: 3, categoryName: '韬略元机', category: 'cat4' },
          { id: 5, title: '渊深海阔·仙人指路', dynasty: '清', author: '佚名', difficulty: 4, categoryName: '残局精选', category: 'cat5', isPremium: true },
          { id: 6, title: '七星聚会·马后炮绝杀', dynasty: '古代', author: '佚名', difficulty: 5, categoryName: '残局精选', category: 'cat5', isPremium: true },
          { id: 7, title: '橘中秘·马兵胜单车', dynasty: '明', author: '朱晋桢', difficulty: 2, categoryName: '橘中秘', category: 'cat1' },
          { id: 9, title: '适情雅趣·飞象局精要', dynasty: '明', author: '颜丙', difficulty: 2, categoryName: '适情雅趣', category: 'cat3' },
          { id: 10, title: '竹香斋·当头炮正变', dynasty: '清', author: '张志', difficulty: 4, categoryName: '橘中秘', category: 'cat1', isPremium: true },
          { id: 11, title: '韬略元机·五七炮对屏风马', dynasty: '清', author: '颜丙', difficulty: 3, categoryName: '韬略元机', category: 'cat4' },
          { id: 12, title: '渊深海阔·车马炮胜单车', dynasty: '清', author: '佚名', difficulty: 3, categoryName: '残局精选', category: 'cat5' }
        ]
        const meihua = MEIHUA_MANUALS.map(m => ({
          id: m.id, title: m.title, dynasty: m.dynasty, author: m.author,
          difficulty: m.difficulty, categoryName: m.categoryName, category: m.category,
          isPremium: m.isPremium
        }))
        this.list = [...meihua, ...base]
        if (this.selectedCategory) {
          this.list = this.list.filter(i => i.category === this.selectedCategory)
        }
        if (this.keyword) {
          const kw = this.keyword.toLowerCase()
          this.list = this.list.filter(i => i.title.includes(kw) || (i.author || '').includes(kw))
        }
        this.total = this.list.length
      } finally { this.loading = false }
    },
    selectCategory(id) { this.selectedCategory = id; this.page = 1; this.fetchList() },
    handleFilter() { this.page = 1; this.fetchList() },
    getDynastyClass(dynasty) {
      if (!dynasty) return 'default'
      if (dynasty.includes('明')) return 'ming'
      if (dynasty.includes('清')) return 'qing'
      if (dynasty.includes('近') || dynasty.includes('现')) return 'modern'
      return 'ancient'
    }
  }
}
</script>

<style scoped>
.manual-list-page { background: #fff; min-height: calc(100vh - 56px); padding-bottom: 60px; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 32px; }

.page-header { padding: 36px 0 24px; border-bottom: 1px solid #e8e8e8; margin-bottom: 24px; }
.page-title { font-size: 22px; font-weight: 700; color: #1a1a1a; margin-bottom: 4px; font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif; letter-spacing: 2px; }
.page-desc { font-size: 13px; color: #aaa; }

.cat-tabs { display: flex; flex-wrap: wrap; gap: 0; margin-bottom: 16px; border-bottom: 1px solid #e8e8e8; }
.cat-tab { padding: 8px 16px; font-size: 13px; color: #888; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -1px; transition: color 0.15s; font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif; }
.cat-tab:hover { color: #333; }
.cat-tab.active { color: #1a1a1a; font-weight: 600; border-bottom-color: #1a1a1a; }

.filter-bar { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
.search-input { width: 240px; height: 32px; padding: 0 12px; border: 1px solid #e8e8e8; border-radius: 2px; font-size: 13px; background: #fff; outline: none; transition: border-color 0.15s; }
.search-input:focus { border-color: #333; }
.diff-tabs { display: flex; gap: 2px; }
.diff-tab { padding: 4px 12px; font-size: 12px; color: #aaa; cursor: pointer; transition: color 0.1s; }
.diff-tab:hover { color: #555; }
.diff-tab.active { color: #1a1a1a; font-weight: 600; }

.result-bar { font-size: 12px; color: #bbb; margin-bottom: 20px; }
.result-bar strong { color: #555; }
.loading-tip { color: #bbb; font-size: 14px; padding: 60px 0; text-align: center; }
.empty-tip { color: #ccc; font-size: 14px; padding: 60px; text-align: center; grid-column: 1/-1; }

.books-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 24px 20px; }

/* ── 古书封面 ── */
/* ── 线装古籍封面 ── */
.book-card {
  position: relative;
  width: 130px;
  height: 185px;
  cursor: pointer;
  background: #1d2e4a;
  border: 1px solid #162338;
  overflow: hidden;
  transition: transform 0.22s, box-shadow 0.22s;
  box-shadow: 2px 5px 14px rgba(0,0,0,.4);
}
.book-card:hover {
  transform: translateY(-5px);
  box-shadow: 4px 12px 28px rgba(0,0,0,.55);
}

/* 书名签 */
.book-label {
  position: absolute;
  left: 13px;
  top: 50%;
  transform: translateY(-50%);
  width: 42px;
  height: 126px;
  background: #f5f0e2;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 4px;
  overflow: hidden;
}
/* 双框线 */
.book-label::before {
  content: '';
  position: absolute;
  inset: 4px;
  border: 1px solid #b8a06a;
  pointer-events: none;
}

.book-title {
  writing-mode: vertical-rl;
  font-size: 15px;
  font-weight: 600;
  color: #1a1200;
  letter-spacing: 3px;
  line-height: 1.3;
  z-index: 1;
  max-height: 104px;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 秘籍印章 */
.book-seal {
  position: absolute;
  bottom: 7px;
  right: 4px;
  width: 16px;
  height: 16px;
  border: 1px solid #8B1A1A;
  color: #8B1A1A;
  font-size: 9px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  background: rgba(245,240,226,.85);
}

/* 右侧线装图案 */
.book-deco {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 34px;
  background:
    repeating-linear-gradient(45deg,  transparent, transparent 8px, rgba(185,158,80,.5) 8px, rgba(185,158,80,.5) 9px),
    repeating-linear-gradient(-45deg, transparent, transparent 8px, rgba(185,158,80,.5) 8px, rgba(185,158,80,.5) 9px);
}

/* 作者 + 难度 */
.book-meta {
  position: absolute;
  bottom: 9px;
  left: 13px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.book-author { font-size: 9px; color: rgba(255,255,255,.3); white-space: nowrap; overflow: hidden; max-width: 44px; text-overflow: ellipsis; }
.book-diff { display: flex; gap: 2px; }
.diff-dot { width: 4px; height: 4px; border-radius: 50%; background: rgba(255,255,255,.12); }
.diff-dot.filled { background: rgba(200,140,60,.75); }

.pagination-wrap { display: flex; justify-content: center; margin-top: 40px; }
.pagination-wrap >>> .el-pagination.is-background .el-pager li.active { background: #8B1A1A; }

@media (max-width: 768px) {
  .books-grid { grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 16px; }
  .book-card { width: 110px; height: 158px; }
}
</style>
