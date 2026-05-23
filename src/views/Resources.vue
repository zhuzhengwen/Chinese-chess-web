<template>
  <div class="resources-page">
    <div class="toolbar">
      <div class="search-bar">
        <input v-model="keyword" type="text" placeholder="搜索资讯标题、来源…" class="search-input" @input="page = 1; activeId = null" />
        <button v-if="keyword" class="clear-btn" @click="keyword = ''; page = 1">✕</button>
      </div>
      <div class="cat-tabs">
        <button
          v-for="cat in categories" :key="cat.val"
          :class="['cat-tab', { active: selectedCat === cat.val }]"
          @click="selectedCat = cat.val; page = 1; activeId = null"
        >{{ cat.label }}</button>
      </div>
    </div>

    <div class="list-wrap">
      <div
        v-for="item in pagedList"
        :key="item.id"
        class="news-item"
        :class="{ expanded: activeId === item.id }"
      >
        <!-- 新闻行 -->
        <div class="news-row" @click="toggleItem(item.id)">
          <div class="row-left">
            <span class="cat-tag" :class="catColor(item.category)">{{ item.category }}</span>
            <span class="news-title">{{ item.title }}</span>
          </div>
          <div class="row-right">
            <span class="news-source">{{ item.source }}</span>
            <span class="news-date">{{ item.date }}</span>
            <span class="expand-icon">{{ activeId === item.id ? '▲' : '▼' }}</span>
          </div>
        </div>

        <!-- 展开：正文 -->
        <div v-if="activeId === item.id" class="news-detail">
          <p class="news-summary">{{ item.summary }}</p>
          <div v-if="item.content" class="news-content" v-html="item.content"></div>
        </div>
      </div>

      <div v-if="!filteredList.length" class="empty-tip">暂无相关资讯</div>
    </div>

    <div class="pagination-wrap">
      <span class="total-count">共 {{ filteredList.length }} 条<template v-if="keyword"> · 搜索"{{ keyword }}"</template></span>
      <template v-if="filteredList.length > pageSize">
        <button class="page-btn" :disabled="page === 1" @click="page--">‹ 上一页</button>
        <span class="page-info">{{ page }} / {{ totalPages }}</span>
        <button class="page-btn" :disabled="page === totalPages" @click="page++">下一页 ›</button>
      </template>
    </div>
  </div>
</template>

<script>
import { news as newsApi } from '../api/index'

export default {
  name: 'ResourcesPage',
  data() {
    return {
      selectedCat: 'all',
      activeId: null,
      keyword: '',
      page: 1,
      pageSize: 15,
      categories: [
        { val: 'all', label: '全部' },
        { val: '赛事', label: '赛事' },
        { val: '棋手', label: '棋手' },
        { val: '文化', label: '文化' },
        { val: '技术', label: '技术' }
      ],
      allNews: []
    }
  },
  mounted() {
    this.fetchNews()
  },
  computed: {
    filteredList() {
      let res = this.selectedCat === 'all' ? this.allNews : this.allNews.filter(n => n.category === this.selectedCat)
      const kw = this.keyword.trim().toLowerCase()
      if (kw) res = res.filter(n => n.title.toLowerCase().includes(kw) || (n.source && n.source.includes(kw)))
      return res
    },
    totalPages() { return Math.max(1, Math.ceil(this.filteredList.length / this.pageSize)) },
    pagedList() {
      const s = (this.page - 1) * this.pageSize
      return this.filteredList.slice(s, s + this.pageSize)
    }
  },
  methods: {
    async fetchNews() {
      try {
        const res = await newsApi.getList()
        this.allNews = res.data || res || []
      } catch (e) {
        this.allNews = []
      }
    },
    toggleItem(id) { this.activeId = this.activeId === id ? null : id },
    catColor(cat) {
      return { '赛事': 'c-match', '棋手': 'c-player', '文化': 'c-culture', '技术': 'c-tech' }[cat] || ''
    }
  }
}
</script>

<style scoped>
.resources-page { display: flex; flex-direction: column; gap: 0; padding-bottom: 40px; }

.toolbar { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; flex-wrap: wrap; }
.search-bar { position: relative; flex: 1; min-width: 160px; max-width: 280px; }
.search-input { width: 100%; height: 38px; padding: 0 32px 0 12px; font-size: 14px; color: #333; border: 1px solid #d6eaf5; background: #fff; outline: none; transition: border-color 0.15s; }
.search-input:focus { border-color: #2a9fd6; }
.search-input::placeholder { color: #ccc; }
.clear-btn { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; color: #bbb; cursor: pointer; font-size: 13px; padding: 0; }
.clear-btn:hover { color: #888; }

.cat-tabs { display: flex; overflow: hidden; border: 1px solid #d6eaf5; }
.cat-tab { padding: 0 14px; height: 38px; font-size: 12px; color: #999; cursor: pointer; border: none; background: #fff; transition: all 0.12s; }
.cat-tab + .cat-tab { border-left: 1px solid #d6eaf5; }
.cat-tab:hover:not(.active) { background: #e8f4fb; color: #2a9fd6; }
.cat-tab.active { background: #2a9fd6; color: #fff; font-weight: 600; }

.list-wrap {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 0;
  overflow: hidden;
}

.news-item { border-bottom: 1px solid #f4f4f4; }
.news-item:last-child { border-bottom: none; }

.news-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  cursor: pointer;
  transition: background 0.12s;
  gap: 16px;
}
.news-row:hover { background: #fafafa; }
.news-item.expanded > .news-row { background: #f7f9ff; }

.row-left { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }

.cat-tag {
  flex-shrink: 0;
  font-size: 11px;
  padding: 1px 7px;
  border-radius: 0;
  font-weight: 500;
}
.c-match   { background: #e6f4ff; color: #2a9fd6; }
.c-player  { background: #f6ffed; color: #389e0d; }
.c-culture { background: #fff7e6; color: #d46b08; }
.c-tech    { background: #f9f0ff; color: #722ed1; }

.news-title {
  font-size: 15px;
  font-weight: 500;
  color: #888;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.12s;
}
.news-item.expanded .news-title { color: #2a9fd6; }

.row-right { display: flex; align-items: center; gap: 16px; flex-shrink: 0; }
.news-source { font-size: 12px; color: #999; }
.news-date { font-size: 12px; color: #bbb; min-width: 72px; text-align: right; }
.expand-icon { font-size: 10px; color: #ccc; width: 14px; text-align: center; }

/* 展开正文 */
.news-detail {
  padding: 16px 20px 20px 20px;
  border-top: 1px solid #f0f0f0;
  background: #fafbff;
}
.news-summary {
  font-size: 14px;
  color: #555;
  line-height: 1.9;
  margin: 0 0 10px;
}
.news-content { font-size: 14px; color: #555; line-height: 1.9; }
.news-content >>> p { margin-bottom: 10px; }

.empty-tip { color: #ccc; font-size: 14px; padding: 60px; text-align: center; }

.pagination-wrap { display: flex; align-items: center; gap: 16px; padding: 16px 0 4px; }
.total-count { font-size: 13px; color: #bbb; margin-right: auto; }
.page-btn {
  padding: 6px 16px; border: 1px solid #e0e0e0; border-radius: 0;
  background: #fff; font-size: 13px; color: #555; cursor: pointer; transition: all 0.15s;
}
.page-btn:hover:not(:disabled) { border-color: #2a9fd6; color: #2a9fd6; }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.page-info { font-size: 13px; color: #999; }
</style>

