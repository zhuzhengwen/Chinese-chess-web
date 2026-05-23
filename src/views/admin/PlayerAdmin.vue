<template>
  <div class="admin-page">

    <div class="toolbar">
      <input v-model="keyword" class="search-input" placeholder="搜索棋手姓名、称号…" />
      <button class="btn-primary" @click="openForm(null)">+ 新增棋手</button>
    </div>

    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>姓名</th><th>称号</th><th>年代</th><th>出生年</th><th>关联棋谱</th><th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredList" :key="item.id">
            <td class="td-title">{{ item.name }}</td>
            <td>{{ item.title || '—' }}</td>
            <td>{{ item.era || '—' }}</td>
            <td>{{ item.birthYear || '—' }}</td>
            <td>{{ (item.manuals||[]).length }}</td>
            <td class="td-actions">
              <button class="act-btn" @click="openForm(item)">编辑</button>
              <button class="act-btn danger" @click="confirmDel(item)">删除</button>
            </td>
          </tr>
          <tr v-if="!filteredList.length">
            <td colspan="6" class="empty-cell">暂无数据</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 新增/编辑 -->
    <div v-if="showForm" class="panel-overlay" @click.self="showForm = false">
      <div class="panel">
        <div class="panel-head">
          <span>{{ editItem ? '编辑棋手' : '新增棋手' }}</span>
          <button class="panel-close" @click="showForm = false">✕</button>
        </div>
        <form class="panel-body" @submit.prevent="saveForm">
          <div class="form-row two-col">
            <div>
              <label>姓名 <em>*</em></label>
              <input v-model="form.name" required placeholder="如：胡荣华" />
            </div>
            <div>
              <label>称号</label>
              <select v-model="form.title">
                <option value="">无</option>
                <option>特级大师</option>
                <option>大师</option>
                <option>国际特级大师</option>
                <option>象棋名手</option>
              </select>
            </div>
          </div>
          <div class="form-row two-col">
            <div>
              <label>年代</label>
              <select v-model="form.era">
                <option value="">请选择</option>
                <option>当代</option>
                <option>近代</option>
                <option>古代</option>
              </select>
            </div>
            <div>
              <label>出生年</label>
              <input v-model.number="form.birthYear" type="number" min="900" :max="new Date().getFullYear()" placeholder="如：1945" />
            </div>
          </div>
          <div class="form-row">
            <label>简介</label>
            <textarea v-model="form.bio" rows="4" placeholder="棋手简介、成就…" />
          </div>
          <div class="panel-footer">
            <button type="button" class="btn-cancel" @click="showForm = false">取消</button>
            <button type="submit" class="btn-primary" :disabled="saving">{{ saving ? '保存中…' : '保存' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 删除确认 -->
    <div v-if="delTarget" class="panel-overlay" @click.self="delTarget = null">
      <div class="panel panel-sm">
        <div class="panel-head"><span>确认删除</span><button class="panel-close" @click="delTarget = null">✕</button></div>
        <div class="panel-body">
          <p class="confirm-text">确定删除棋手「<strong>{{ delTarget.name }}</strong>」的全部信息？</p>
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

export default {
  name: 'PlayerAdmin',
  data() {
    return {
      list: [],
      keyword: '',
      showForm: false,
      editItem: null,
      form: { name: '', title: '', era: '', birthYear: '', bio: '' },
      saving: false,
      delTarget: null,
      deleting: false
    }
  },
  computed: {
    filteredList() {
      const kw = this.keyword.trim().toLowerCase()
      if (!kw) return this.list
      return this.list.filter(p => p.name.toLowerCase().includes(kw) || (p.title && p.title.includes(kw)))
    }
  },
  created() { this.loadList() },
  methods: {
    async loadList() {
      try {
        const res = await admin.players.getList()
        this.list = res.data || res || []
      } catch { this.list = [] }
    },
    openForm(item) {
      this.editItem = item
      this.form = item
        ? { name: item.name, title: item.title || '', era: item.era || '', birthYear: item.birthYear || '', bio: item.bio || '' }
        : { name: '', title: '', era: '', birthYear: '', bio: '' }
      this.showForm = true
    },
    async saveForm() {
      this.saving = true
      try {
        if (this.editItem) {
          await admin.players.update(this.editItem.id, this.form)
          Object.assign(this.editItem, this.form)
        } else {
          const res = await admin.players.create(this.form)
          this.list.unshift(res.data || { ...this.form, id: Date.now(), manuals: [] })
        }
        this.showForm = false
        this.$message.success('保存成功')
      } catch (e) {
        this.$message.error(e.message || '保存失败')
      } finally { this.saving = false }
    },
    confirmDel(item) { this.delTarget = item },
    async doDelete() {
      this.deleting = true
      try { await admin.players.remove(this.delTarget.id) } catch (e) { this.$message.error(e.message || '删除失败'); this.deleting = false; return }
      this.list = this.list.filter(p => p.id !== this.delTarget.id)
      this.$message.success('已删除')
      this.delTarget = null; this.deleting = false
    }
  }
}
</script>

<style scoped>
@import './admin-common.css';
</style>
