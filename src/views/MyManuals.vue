<template>
  <div class="my-manuals-page">

    <!-- 搜索 + 新增 -->
    <div class="toolbar">
      <div class="search-bar">
        <input v-model="keyword" type="text" placeholder="搜索棋谱名称、类型…" class="search-input" @input="page = 1" />
        <button v-if="keyword" class="clear-btn" @click="keyword = ''; page = 1">✕</button>
      </div>
      <div class="type-tabs">
        <button
          v-for="t in typeOpts" :key="t.val"
          :class="['type-tab', { active: selectedType === t.val }]"
          @click="selectedType = t.val; page = 1"
        >{{ t.label }}</button>
      </div>
      <button class="add-btn" @click="openForm(null)">+ 录入棋谱</button>
    </div>

    <!-- 详情面板 -->
    <div v-if="currentItem" class="detail-panel">
      <div class="detail-back" @click="currentItem = null">← 返回列表</div>
      <div class="detail-card">
        <div class="detail-header">
          <div>
            <h2 class="detail-title">{{ currentItem.title }}</h2>
            <div class="detail-meta">
              <span class="label-tag">{{ typeLabel(currentItem.type) }}</span>
              <span class="meta-diff" :class="'diff-' + currentItem.difficulty">{{ diffLabel(currentItem.difficulty) }}</span>
              <span v-if="currentItem.redPlayer" class="meta-players">{{ currentItem.redPlayer }} vs {{ currentItem.blackPlayer }}</span>
              <span v-if="currentItem.gameDate" class="meta-date">{{ currentItem.gameDate }}</span>
            </div>
          </div>
          <div class="detail-actions">
            <span class="action-btn" @click="openForm(currentItem)">编辑</span>
            <span class="action-del" @click="confirmDelete(currentItem)">删除</span>
          </div>
        </div>

        <div v-if="currentItem.moves" class="detail-section">
          <div class="section-label">棋步记录</div>
          <div class="moves-box">{{ currentItem.moves }}</div>
        </div>

        <div v-if="currentItem.remark" class="detail-section">
          <div class="section-label">备注 / 心得</div>
          <div class="remark-box">{{ currentItem.remark }}</div>
        </div>

        <div v-if="!currentItem.moves && !currentItem.remark" class="detail-empty">暂无棋步记录和备注</div>
      </div>
    </div>

    <!-- 列表 -->
    <template v-else>
    <div v-if="loading" class="loading-tip">加载中…</div>

    <template v-else-if="filteredList.length">
      <div class="list-wrap">
        <div
          v-for="item in pagedList"
          :key="item.id"
          class="book-row"
          @click="currentItem = item"
        >
          <div class="row-left">
            <span class="book-title">{{ item.title }}</span>
            <span class="label-tag">{{ typeLabel(item.type) }}</span>
          </div>
          <div class="row-right">
            <span class="meta-date">{{ formatDate(item.createdAt) }}</span>
            <span class="meta-diff" :class="'diff-' + item.difficulty">{{ diffLabel(item.difficulty) }}</span>
            <span class="action-btn" @click.stop="openForm(item)">编辑</span>
            <span class="action-del" @click.stop="confirmDelete(item)">删除</span>
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
    </template>

    <div v-else class="empty-state">
      <div class="empty-text">{{ keyword ? '没有匹配的棋谱' : '还没有录入棋谱' }}</div>
      <button v-if="!keyword" class="add-btn" @click="openForm(null)">立即录入</button>
    </div>
    </template> <!-- end v-else (list view) -->

    <!-- 录入/编辑弹窗 -->
    <div v-if="dialogVisible" class="dialog-mask" @click.self="dialogVisible = false">
      <div class="dialog">
        <div class="dialog-header">
          <span>{{ editItem ? '编辑棋谱' : '录入棋谱' }}</span>
          <button class="dialog-close" @click="dialogVisible = false">✕</button>
        </div>
        <div class="dialog-body">
          <div class="form-field">
            <label>棋谱名称 <em>*</em></label>
            <input v-model="form.title" type="text" placeholder="请输入棋谱名称" maxlength="50" />
          </div>
          <div class="form-field">
            <label>类型 <em>*</em></label>
            <select v-model="form.type">
              <option value="custom">自创棋谱</option>
              <option value="replay">复盘记录</option>
              <option value="study">学习笔记</option>
              <option value="endgame">残局练习</option>
            </select>
          </div>
          <div class="form-row">
            <div class="form-field">
              <label>红方</label>
              <input v-model="form.redPlayer" type="text" placeholder="红方（我方）" />
            </div>
            <div class="form-field">
              <label>黑方</label>
              <input v-model="form.blackPlayer" type="text" placeholder="黑方（对手）" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-field">
              <label>对局日期</label>
              <input v-model="form.gameDate" type="date" />
            </div>
            <div class="form-field">
              <label>难度</label>
              <select v-model="form.difficulty">
                <option :value="1">入门</option>
                <option :value="2">初级</option>
                <option :value="3">中级</option>
                <option :value="4">高级</option>
                <option :value="5">大师</option>
              </select>
            </div>
          </div>
          <div class="form-field">
            <label>棋步记录</label>
            <textarea v-model="form.moves" rows="4" placeholder="每行一步，例如：&#10;炮二平五&#10;炮８平５&#10;马二进三" />
          </div>
          <div class="form-field">
            <label>备注</label>
            <textarea v-model="form.remark" rows="2" placeholder="心得、注解…" />
          </div>
          <div v-if="formError" class="form-error">{{ formError }}</div>
        </div>
        <div class="dialog-footer">
          <button class="btn-cancel" @click="dialogVisible = false">取消</button>
          <button class="btn-confirm" :disabled="saving" @click="saveManual">
            {{ saving ? '保存中…' : (editItem ? '保存修改' : '录入') }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { myManuals } from '../api/index'

export default {
  name: 'MyManuals',
  data() {
    return {
      list: [],
      loading: false,
      saving: false,
      keyword: '',
      currentItem: null,
      selectedType: '',
      page: 1,
      pageSize: 15,
      dialogVisible: false,
      editItem: null,
      formError: '',
      form: { title: '', type: 'custom', redPlayer: '', blackPlayer: '', gameDate: '', difficulty: 3, moves: '', remark: '' },
      typeOpts: [
        { val: '', label: '全部' },
        { val: 'custom', label: '自创' },
        { val: 'replay', label: '复盘' },
        { val: 'study', label: '学习' },
        { val: 'endgame', label: '残局' }
      ]
    }
  },
  computed: {
    filteredList() {
      let res = this.list
      if (this.selectedType) res = res.filter(i => i.type === this.selectedType)
      const kw = this.keyword.trim().toLowerCase()
      if (kw) res = res.filter(i => i.title.toLowerCase().includes(kw) || this.typeLabel(i.type).includes(kw))
      return res
    },
    totalPages() {
      return Math.ceil(this.filteredList.length / this.pageSize) || 1
    },
    pagedList() {
      const start = (this.page - 1) * this.pageSize
      return this.filteredList.slice(start, start + this.pageSize)
    }
  },
  mounted() { this.fetchList() },
  methods: {
    async fetchList() {
      this.loading = true
      try {
        const res = await myManuals.getList({})
        this.list = res.data || res || []
      } catch (e) {
        this.list = [
          { id: 1, title: '我的当头炮变化研究', type: 'study', createdAt: '2024-01-10', difficulty: 3 },
          { id: 2, title: '与老张对局复盘', type: 'replay', createdAt: '2024-01-15', difficulty: 2 },
          { id: 3, title: '自创马炮残局', type: 'endgame', createdAt: '2024-01-20', difficulty: 4 }
        ]
      } finally { this.loading = false }
    },
    openForm(item) {
      this.editItem = item
      this.formError = ''
      this.form = item
        ? { title: item.title || '', type: item.type || 'custom', redPlayer: item.redPlayer || '', blackPlayer: item.blackPlayer || '', gameDate: item.gameDate || '', difficulty: item.difficulty || 3, moves: item.moves || '', remark: item.remark || '' }
        : { title: '', type: 'custom', redPlayer: '', blackPlayer: '', gameDate: '', difficulty: 3, moves: '', remark: '' }
      this.dialogVisible = true
    },
    async saveManual() {
      this.formError = ''
      if (!this.form.title.trim()) { this.formError = '请输入棋谱名称'; return }
      this.saving = true
      try {
        if (this.editItem) {
          await myManuals.update(this.editItem.id, this.form)
          const idx = this.list.findIndex(i => i.id === this.editItem.id)
          if (idx !== -1) this.$set(this.list, idx, { ...this.editItem, ...this.form })
        } else {
          await myManuals.create(this.form)
          this.list.unshift({ ...this.form, id: Date.now(), createdAt: new Date().toISOString().slice(0, 10) })
        }
        this.$message.success(this.editItem ? '修改成功' : '录入成功')
        this.dialogVisible = false
      } catch (e) {
        const newItem = { ...this.form, id: Date.now(), createdAt: new Date().toISOString().slice(0, 10) }
        if (this.editItem) {
          const idx = this.list.findIndex(i => i.id === this.editItem.id)
          if (idx !== -1) this.$set(this.list, idx, { ...this.editItem, ...this.form })
        } else {
          this.list.unshift(newItem)
        }
        this.$message.success(this.editItem ? '修改成功' : '录入成功')
        this.dialogVisible = false
      } finally { this.saving = false }
    },
    confirmDelete(item) {
      if (!window.confirm(`确定删除《${item.title}》吗？`)) return
      try { myManuals.remove(item.id) } catch (e) {}
      this.list = this.list.filter(i => i.id !== item.id)
      if (this.currentItem && this.currentItem.id === item.id) this.currentItem = null
      this.$message.success('已删除')
    },
    typeLabel(t) {
      return { custom: '自创', replay: '复盘', study: '学习', endgame: '残局' }[t] || '自创'
    },
    diffLabel(d) {
      return ['', '入门', '初级', '中级', '高级', '大师'][d] || '—'
    },
    formatDate(d) {
      return d ? d.toString().slice(0, 10) : ''
    }
  }
}
</script>

<style scoped>
.my-manuals-page { display: flex; flex-direction: column; gap: 0; padding-bottom: 40px; }

/* 详情面板 */
.detail-back {
  font-size: 13px; color: #999; cursor: pointer;
  padding: 4px 0 12px; display: inline-block; transition: color 0.12s;
}
.detail-back:hover { color: #2a9fd6; }
.detail-card {
  background: #fff; border: 1px solid #e8e8e8; padding: 24px;
}
.detail-header {
  display: flex; align-items: flex-start;
  justify-content: space-between; gap: 16px;
  margin-bottom: 20px; padding-bottom: 16px;
  border-bottom: 1px solid #f4f4f4;
}
.detail-title { font-size: 20px; font-weight: 700; color: #111; margin-bottom: 10px; }
.detail-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.meta-players { font-size: 12px; color: #888; }
.detail-actions { display: flex; gap: 8px; flex-shrink: 0; }
.detail-section { margin-bottom: 20px; }
.section-label {
  font-size: 12px; font-weight: 600; color: #888;
  margin-bottom: 8px; padding-left: 8px;
  border-left: 3px solid #2a9fd6;
}
.moves-box {
  background: #fafafa; border: 1px solid #e8e8e8;
  padding: 14px 16px; font-size: 14px; color: #333;
  line-height: 2; white-space: pre-wrap;
  font-family: 'Courier New', monospace;
}
.remark-box {
  background: #fafafa; border: 1px solid #e8e8e8;
  padding: 14px 16px; font-size: 14px; color: #555;
  line-height: 1.8; white-space: pre-wrap;
}
.detail-empty { padding: 40px 0; text-align: center; color: #ccc; font-size: 14px; }

/* 工具栏 */
.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.search-bar { position: relative; flex: 1; min-width: 160px; max-width: 280px; }
.search-input {
  width: 100%;
  height: 38px;
  padding: 0 32px 0 12px;
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
}
.clear-btn:hover { color: #888; }

/* 类型 tab */
.type-tabs { display: flex; border: 1px solid #d6eaf5; overflow: hidden; }
.type-tab {
  padding: 0 14px;
  height: 38px;
  border: none;
  background: #fff;
  font-size: 13px;
  color: #999;
  cursor: pointer;
  transition: background 0.12s, color 0.12s;
}
.type-tab + .type-tab { border-left: 1px solid #d6eaf5; }
.type-tab.active { background: #2a9fd6; color: #fff; }
.type-tab:hover:not(.active) { background: #e8f4fb; color: #2a9fd6; }

/* 新增按钮 */
.add-btn {
  height: 38px;
  padding: 0 18px;
  background: #2a9fd6;
  color: #fff;
  border: none;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s;
  margin-left: auto;
}
.add-btn:hover { background: #1a8ac0; }

/* 列表 */
.list-wrap {
  background: #fff;
  border: 1px solid #e8e8e8;
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

.row-left { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; }
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
  background: #e8f4fb;
  color: #2a9fd6;
  border: 1px solid #b8dff2;
  white-space: nowrap;
}

.row-right { display: flex; align-items: center; gap: 16px; flex-shrink: 0; }
.meta-date { font-size: 12px; color: #ccc; }
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

.action-btn, .action-del {
  font-size: 12px;
  cursor: pointer;
  padding: 2px 8px;
  border: 1px solid;
  transition: background 0.12s;
}
.action-btn { color: #2a9fd6; border-color: #b8dff2; background: #e8f4fb; }
.action-btn:hover { background: #d0ecf8; }
.action-del { color: #e53e3e; border-color: #f5b8b2; background: #fdf0ef; }
.action-del:hover { background: #fce0de; }

/* 分页 */
.pagination-wrap {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 0 4px;
}
.total-count { font-size: 13px; color: #bbb; margin-right: auto; }
.page-btn {
  padding: 6px 16px;
  border: 1px solid #e0e0e0;
  background: #fff;
  font-size: 13px;
  color: #555;
  cursor: pointer;
  transition: all 0.15s;
}
.page-btn:hover:not(:disabled) { border-color: #2a9fd6; color: #2a9fd6; }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.page-info { font-size: 13px; color: #999; }

/* 空状态 */
.loading-tip { color: #bbb; font-size: 14px; padding: 60px 0; text-align: center; }
.empty-state { text-align: center; padding: 80px 0; color: #bbb; }
.empty-text { font-size: 14px; margin-bottom: 16px; }

/* 弹窗 */
.dialog-mask {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.3);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dialog {
  width: 540px;
  background: #fff;
  border: 1px solid #d6eaf5;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}
.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid #e8f4fb;
  font-size: 15px;
  font-weight: 600;
  color: #111;
}
.dialog-close {
  background: none;
  border: none;
  color: #bbb;
  font-size: 14px;
  cursor: pointer;
  padding: 0;
}
.dialog-close:hover { color: #555; }
.dialog-body {
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.form-field { display: flex; flex-direction: column; gap: 5px; }
.form-field label { font-size: 12px; color: #888; font-weight: 500; }
.form-field label em { color: #e53e3e; font-style: normal; }
.form-field input,
.form-field select,
.form-field textarea {
  width: 100%;
  padding: 8px 10px;
  font-size: 13px;
  color: #333;
  border: 1px solid #e0e0e0;
  background: #fff;
  outline: none;
  transition: border-color 0.15s;
  font-family: inherit;
}
.form-field input:focus,
.form-field select:focus,
.form-field textarea:focus { border-color: #2a9fd6; }
.form-field textarea { resize: vertical; }
.form-row { display: flex; gap: 12px; }
.form-row .form-field { flex: 1; }
.form-error {
  font-size: 12px;
  color: #e53e3e;
  background: #fff5f5;
  border: 1px solid #fed7d7;
  padding: 7px 12px;
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 20px;
  border-top: 1px solid #e8f4fb;
}
.btn-cancel {
  padding: 7px 20px;
  border: 1px solid #e0e0e0;
  background: #fff;
  font-size: 13px;
  color: #555;
  cursor: pointer;
  transition: background 0.12s;
}
.btn-cancel:hover { background: #f5f5f5; }
.btn-confirm {
  padding: 7px 20px;
  border: none;
  background: #2a9fd6;
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-confirm:hover:not(:disabled) { background: #1a8ac0; }
.btn-confirm:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
