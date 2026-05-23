<template>
  <div class="admin-page">

    <div class="toolbar">
      <input v-model="keyword" class="search-input" placeholder="搜索赛事名称、地点…" />
      <button class="btn-primary" @click="openForm(null)">+ 新增赛事</button>
    </div>

    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>赛事名称</th><th>年份</th><th>地点</th><th>冠军</th><th>对局数</th><th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredList" :key="item.id">
            <td class="td-title">{{ item.name }}</td>
            <td>{{ item.year }}</td>
            <td>{{ item.location || '—' }}</td>
            <td>{{ item.champion || '—' }}</td>
            <td>{{ (item.games||[]).length }}</td>
            <td class="td-actions">
              <button class="act-btn" @click="openForm(item)">编辑</button>
              <button class="act-btn" @click="openUpload(item)">上传棋谱</button>
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
          <span>{{ editItem ? '编辑赛事' : '新增赛事' }}</span>
          <button class="panel-close" @click="showForm = false">✕</button>
        </div>
        <form class="panel-body" @submit.prevent="saveForm">
          <div class="form-row">
            <label>赛事名称 <em>*</em></label>
            <input v-model="form.name" required placeholder="如：全国象棋个人赛" />
          </div>
          <div class="form-row two-col">
            <div>
              <label>年份 <em>*</em></label>
              <input v-model.number="form.year" type="number" required min="1900" :max="new Date().getFullYear()" placeholder="如：2023" />
            </div>
            <div>
              <label>地点</label>
              <input v-model="form.location" placeholder="如：北京" />
            </div>
          </div>
          <div class="form-row">
            <label>冠军</label>
            <input v-model="form.champion" placeholder="冠军棋手姓名" />
          </div>
          <div class="form-row">
            <label>简介</label>
            <textarea v-model="form.description" rows="3" placeholder="赛事简介…" />
          </div>
          <div class="panel-footer">
            <button type="button" class="btn-cancel" @click="showForm = false">取消</button>
            <button type="submit" class="btn-primary" :disabled="saving">{{ saving ? '保存中…' : '保存' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 上传棋谱 -->
    <div v-if="showUpload" class="panel-overlay" @click.self="showUpload = false">
      <div class="panel panel-sm">
        <div class="panel-head">
          <span>上传对局棋谱 — {{ uploadTarget && uploadTarget.name }}</span>
          <button class="panel-close" @click="showUpload = false">✕</button>
        </div>
        <div class="panel-body">
          <p class="upload-hint">支持 PGN 格式，每局一个对局记录，可批量</p>
          <div class="upload-zone" @click="$refs.fileInput.click()" @dragover.prevent @drop.prevent="onDrop">
            <div v-if="!uploadFile">
              <div class="upload-icon">📄</div>
              <div class="upload-text">点击或拖入 PGN 文件</div>
            </div>
            <div v-else class="upload-selected">
              <span class="file-name">{{ uploadFile.name }}</span>
              <button type="button" class="clear-file" @click.stop="uploadFile = null">✕</button>
            </div>
            <input ref="fileInput" type="file" accept=".pgn,.txt" style="display:none" @change="onFileChange" />
          </div>
          <div v-if="uploadResult" class="upload-result" :class="uploadResult.ok ? 'ok' : 'err'">{{ uploadResult.msg }}</div>
          <div class="panel-footer">
            <button type="button" class="btn-cancel" @click="showUpload = false">关闭</button>
            <button class="btn-primary" :disabled="!uploadFile || uploading" @click="doUpload">{{ uploading ? '上传中…' : '确认上传' }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 删除确认 -->
    <div v-if="delTarget" class="panel-overlay" @click.self="delTarget = null">
      <div class="panel panel-sm">
        <div class="panel-head"><span>确认删除</span><button class="panel-close" @click="delTarget = null">✕</button></div>
        <div class="panel-body">
          <p class="confirm-text">确定删除赛事「<strong>{{ delTarget.name }}</strong>」及其所有对局？</p>
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
  name: 'TournamentAdmin',
  data() {
    return {
      list: [],
      keyword: '',
      showForm: false,
      editItem: null,
      form: { name: '', year: new Date().getFullYear(), location: '', champion: '', description: '' },
      saving: false,
      showUpload: false,
      uploadTarget: null,
      uploadFile: null,
      uploading: false,
      uploadResult: null,
      delTarget: null,
      deleting: false
    }
  },
  computed: {
    filteredList() {
      const kw = this.keyword.trim().toLowerCase()
      if (!kw) return this.list
      return this.list.filter(t => t.name.toLowerCase().includes(kw) || (t.location && t.location.includes(kw)))
    }
  },
  created() { this.loadList() },
  methods: {
    async loadList() {
      try {
        const res = await admin.tournaments.getList()
        this.list = res.data || res || []
      } catch { this.list = [] }
    },
    openForm(item) {
      this.editItem = item
      this.form = item
        ? { name: item.name, year: item.year, location: item.location || '', champion: item.champion || '', description: item.description || '' }
        : { name: '', year: new Date().getFullYear(), location: '', champion: '', description: '' }
      this.showForm = true
    },
    async saveForm() {
      this.saving = true
      try {
        if (this.editItem) {
          await admin.tournaments.update(this.editItem.id, this.form)
          Object.assign(this.editItem, this.form)
        } else {
          const res = await admin.tournaments.create(this.form)
          this.list.unshift(res.data || { ...this.form, id: Date.now(), games: [] })
        }
        this.showForm = false
        this.$message.success('保存成功')
      } catch (e) {
        this.$message.error(e.message || '保存失败')
      } finally { this.saving = false }
    },
    openUpload(item) { this.uploadTarget = item; this.uploadFile = null; this.uploadResult = null; this.showUpload = true },
    onFileChange(e) { this.uploadFile = e.target.files[0] || null },
    onDrop(e) { this.uploadFile = e.dataTransfer.files[0] || null },
    async doUpload() {
      this.uploading = true; this.uploadResult = null
      try {
        await admin.tournaments.uploadPgn(this.uploadTarget.id, this.uploadFile)
        this.uploadResult = { ok: true, msg: '上传成功，对局已更新' }
        this.$message.success('上传成功')
      } catch (e) { this.uploadResult = { ok: false, msg: e.message || '上传失败' } }
      finally { this.uploading = false }
    },
    confirmDel(item) { this.delTarget = item },
    async doDelete() {
      this.deleting = true
      try { await admin.tournaments.remove(this.delTarget.id) } catch (e) { this.$message.error(e.message || '删除失败'); this.deleting = false; return }
      this.list = this.list.filter(t => t.id !== this.delTarget.id)
      this.$message.success('已删除')
      this.delTarget = null; this.deleting = false
    }
  }
}
</script>

<style scoped>
@import './admin-common.css';
</style>
