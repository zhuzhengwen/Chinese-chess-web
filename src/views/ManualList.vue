<template>
  <div class="manual-list-page">
    <div class="search-bar">
      <input v-model="keyword" type="text" placeholder="搜索谱名、作者、朝代…" class="search-input" @input="page = 1" />
      <button v-if="keyword" class="clear-btn" @click="keyword = ''; page = 1">✕</button>
    </div>

    <div class="list-wrap">
      <div
        v-for="book in pagedList"
        :key="book.id"
        class="book-row"
        @click="$router.push('/manuals/' + book.id)"
      >
        <div class="row-left">
          <span class="book-title">{{ book.title }}</span>
          <span
            v-for="label in book.labels"
            :key="label"
            class="label-tag"
          >{{ label }}</span>
        </div>
        <div class="row-right">
          <span class="meta-dynasty">{{ book.dynasty }}</span>
          <span class="meta-author">{{ book.author }}</span>
          <span class="meta-diff" :class="'diff-' + book.difficulty">{{ diffLabel(book.difficulty) }}</span>
          <span class="game-count">{{ book.games.length }} 局</span>
        </div>
      </div>
    </div>

    <div class="pagination-wrap">
      <span class="total-count">共 {{ filteredList.length }} 部<template v-if="keyword"> · 搜索"{{ keyword }}"</template></span>
      <template v-if="filteredList.length > pageSize">
        <button class="page-btn" :disabled="page === 1" @click="page--">‹ 上一页</button>
        <span class="page-info">{{ page }} / {{ totalPages }}</span>
        <button class="page-btn" :disabled="page === totalPages" @click="page++">下一页 ›</button>
      </template>
    </div>
  </div>
</template>

<script>
import { MANUAL_BOOKS } from '../data/manualBooks.js'

export default {
  name: 'ManualList',
  data() {
    return {
      MANUAL_BOOKS,
      page: 1,
      pageSize: 15,
      keyword: ''
    }
  },
  methods: {
    diffLabel(d) {
      return ['', '入门', '初级', '中级', '高级', '大师'][d] || '—'
    }
  },
  computed: {
    filteredList() {
      const kw = this.keyword.trim().toLowerCase()
      if (!kw) return this.MANUAL_BOOKS
      return this.MANUAL_BOOKS.filter(b =>
        b.title.toLowerCase().includes(kw) ||
        (b.author && b.author.toLowerCase().includes(kw)) ||
        (b.dynasty && b.dynasty.includes(kw))
      )
    },
    totalPages() {
      return Math.ceil(this.filteredList.length / this.pageSize) || 1
    },
    pagedList() {
      const start = (this.page - 1) * this.pageSize
      return this.filteredList.slice(start, start + this.pageSize)
    }
  }
}
</script>

<style scoped>
.manual-list-page { display: flex; flex-direction: column; gap: 0; }

.search-bar {
  position: relative;
  margin-bottom: 12px;
}
.search-input {
  width: 100%;
  height: 38px;
  padding: 0 36px 0 12px;
  font-size: 14px;
  color: #333;
  border: 1px solid #d6eaf5;
  background: #fff;
  outline: none;
  transition: border-color 0.15s;
}
.search-input:focus { border-color: #2a9fd6; }
.search-input::placeholder { color: #ccc; }
.clear-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #bbb;
  cursor: pointer;
  font-size: 13px;
  padding: 0;
  line-height: 1;
}
.clear-btn:hover { color: #888; }

.page-header {
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 20px 0 14px;
}
.page-title { font-size: 18px; font-weight: 700; color: #1a1a1a; }
.page-count { font-size: 13px; color: #bbb; }

.list-wrap {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 0;
  overflow: hidden;
}

.book-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 20px;
  border-bottom: 1px solid #f4f4f4;
  cursor: pointer;
  transition: background 0.12s;
  gap: 16px;
}
.book-row:last-child { border-bottom: none; }
.book-row:hover { background: #fafafa; }
.book-row:hover .book-title { color: #2a9fd6; }

.row-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}
.book-title {
  font-size: 15px;
  font-weight: 600;
  color: #888;
  white-space: nowrap;
  transition: color 0.12s;
}
.label-tag {
  font-size: 11px;
  padding: 1px 7px;
  border-radius: 0;
  background: #e8f4fb;
  color: #2a9fd6;
  border: 1px solid #b8dff2;
  white-space: nowrap;
}

.row-right {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-shrink: 0;
}
.meta-dynasty {
  font-size: 12px;
  color: #aaa;
  min-width: 36px;
  text-align: right;
}
.meta-author {
  font-size: 13px;
  color: #666;
  min-width: 48px;
  text-align: right;
}
.meta-diff {
  font-size: 11px;
  padding: 1px 7px;
  border: 1px solid;
  white-space: nowrap;
}
.diff-1 { color: #52b26b; border-color: #c3e8cc; background: #f0faf2; }
.diff-2 { color: #2a9fd6; border-color: #b8dff2; background: #e8f4fb; }
.diff-3 { color: #e6a817; border-color: #f5dfa0; background: #fdf8e8; }
.diff-4 { color: #e07b2a; border-color: #f5ceac; background: #fdf2e8; }
.diff-5 { color: #c0392b; border-color: #f5b8b2; background: #fdf0ef; }
.game-count {
  font-size: 12px;
  color: #bbb;
  min-width: 30px;
  text-align: right;
}

.pagination-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 20px 0 4px;
}
.page-btn {
  padding: 6px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 0;
  background: #fff;
  font-size: 13px;
  color: #555;
  cursor: pointer;
  transition: all 0.15s;
}
.page-btn:hover:not(:disabled) { border-color: #2a9fd6; color: #2a9fd6; }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.page-info { font-size: 13px; color: #999; }
.total-count { font-size: 13px; color: #bbb; margin-right: auto; }
</style>

