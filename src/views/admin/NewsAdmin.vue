<template>
  <div class="admin-page">

    <div class="toolbar">
      <input v-model="keyword" class="search-input" placeholder="搜索标题、来源…" />
      <div class="cat-filter">
        <button
          v-for="c in catOpts" :key="c.val"
          :class="['filter-btn', { active: selectedCat === c.val }]"
          @click="selectedCat = c.val"
        >{{ c.label }}</button>
      </div>
      <button class="btn-primary" @click="openForm(null)">+ 发布资讯</button>
    </div>

    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>标题</th><th>分类</th><th>来源</th><th>发布日期</th><th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredList" :key="item.id">
            <td class="td-title">{{ item.title }}</td>
            <td><span class="cat-tag" :class="catColor(item.category)">{{ item.category }}</span></td>
            <td>{{ item.source || '—' }}</td>
            <td>{{ item.date }}</td>
            <td class="td-actions">
              <button class="act-btn" @click="openForm(item)">编辑</button>
              <button class="act-btn danger" @click="confirmDel(item)">删除</button>
            </td>
          </tr>
          <tr v-if="!filteredList.length">
            <td colspan="5" class="empty-cell">暂无数据</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 新增/编辑 -->
    <div v-if="showForm" class="panel-overlay" @click.self="showForm = false">
      <div class="panel panel-wide">
        <div class="panel-head">
          <span>{{ editItem ? '编辑资讯' : '发布资讯' }}</span>
          <button class="panel-close" @click="showForm = false">✕</button>
        </div>
        <form class="panel-body" @submit.prevent="saveForm">
          <div class="form-row">
            <label>标题 <em>*</em></label>
            <input v-model="form.title" required placeholder="资讯标题" />
          </div>
          <div class="form-row two-col">
            <div>
              <label>分类 <em>*</em></label>
              <select v-model="form.category" required>
                <option v-for="c in catOpts.slice(1)" :key="c.val" :value="c.val">{{ c.label }}</option>
              </select>
            </div>
            <div>
              <label>来源</label>
              <input v-model="form.source" placeholder="如：中国象棋协会" />
            </div>
          </div>
          <div class="form-row">
            <label>发布日期 <em>*</em></label>
            <input v-model="form.date" type="date" required />
          </div>
          <div class="form-row">
            <label>摘要</label>
            <textarea v-model="form.summary" rows="2" placeholder="一句话摘要（可选）" />
          </div>
          <div class="form-row">
            <label>正文</label>
            <textarea v-model="form.content" rows="8" placeholder="正文内容，支持 HTML" />
          </div>
          <div class="panel-footer">
            <button type="button" class="btn-cancel" @click="showForm = false">取消</button>
            <button type="submit" class="btn-primary" :disabled="saving">{{ saving ? '保存中…' : '发布' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 删除确认 -->
    <div v-if="delTarget" class="panel-overlay" @click.self="delTarget = null">
      <div class="panel panel-sm">
        <div class="panel-head"><span>确认删除</span><button class="panel-close" @click="delTarget = null">✕</button></div>
        <div class="panel-body">
          <p class="confirm-text">确定删除资讯「<strong>{{ delTarget.title }}</strong>」？</p>
          <div class="panel-footer">
            <button class="btn-cancel" @click="delTarget = null">取消</button>
            <button class="btn-danger" :disabled="deleting" @click="doDelete">{{ deleting ? '删除中…' : '确认删除' }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { admin } from '../../api/index'

const today = new Date().toISOString().slice(0, 10)

export default {
  name: 'NewsAdmin',
  data() {
    return {
      list: [],
      keyword: '',
      selectedCat: 'all',
      catOpts: [
        { val: 'all', label: '全部' },
        { val: '新闻', label: '新闻' },
        { val: '技术', label: '技术' },
        { val: '文化', label: '文化' },
        { val: '赛事', label: '赛事' }
      ],
      showForm: false,
      editItem: null,
      form: { title: '', category: '新闻', source: '', date: today, summary: '', content: '' },
      saving: false,
      delTarget: null,
      deleting: false
    }
  },
  computed: {
    filteredList() {
      let list = this.list
      if (this.selectedCat !== 'all') list = list.filter(n => n.category === this.selectedCat)
      const kw = this.keyword.trim().toLowerCase()
      if (kw) list = list.filter(n => n.title.toLowerCase().includes(kw) || (n.source && n.source.includes(kw)))
      return list
    }
  },
  created() { this.loadList() },
  methods: {
    catColor(cat) {
      return { '新闻': 'cat-news', '技术': 'cat-tech', '文化': 'cat-culture', '赛事': 'cat-event' }[cat] || ''
    },
    async loadList() {
      try {
        const res = await admin.news.getList()
        this.list = res.data || res || []
      } catch { this.list = [] }
    },
    openForm(item) {
      this.editItem = item
      this.form = item
        ? { title: item.title, category: item.category, source: item.source || '', date: item.date, summary: item.summary || '', content: item.content || '' }
        : { title: '', category: '新闻', source: '', date: today, summary: '', content: '' }
      this.showForm = true
    },
    async saveForm() {
      this.saving = true
      try {
        if (this.editItem) {
          await admin.news.update(this.editItem.id, this.form)
          Object.assign(this.editItem, this.form)
        } else {
          const res = await admin.news.create(this.form)
          this.list.unshift(res.data || { ...this.form, id: Date.now() })
        }
        this.showForm = false
        this.$message.success('发布成功')
      } catch (e) {
        this.$message.error(e.message || '保存失败')
      } finally { this.saving = false }
    },
    confirmDel(item) { this.delTarget = item },
    async doDelete() {
      this.deleting = true
      try { await admin.news.remove(this.delTarget.id) } catch (e) { this.$message.error(e.message || '删除失败'); this.deleting = false; return }
      this.list = this.list.filter(n => n.id !== this.delTarget.id)
      this.$message.success('已删除')
      this.delTarget = null; this.deleting = false
    }
  }
}
</script>

<style scoped>
@import './admin-common.css';

.cat-filter { display: flex; gap: 4px; }
.filter-btn {
  height: 36px;
  padding: 0 14px;
  font-size: 13px;
  background: #fff;
  border: 1px solid #d9d9d9;
  color: #555;
  cursor: pointer;
  transition: all 0.12s;
}
.filter-btn:hover { border-color: #2a9fd6; color: #2a9fd6; }
.filter-btn.active { background: #2a9fd6; border-color: #2a9fd6; color: #fff; }

.panel-wide { max-width: 680px; }
</style>
