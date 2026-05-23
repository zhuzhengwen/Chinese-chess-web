<template>
  <div class="admin-page">

    <!-- 工具栏 -->
    <div class="toolbar">
      <input v-model="keyword" class="search-input" placeholder="搜索谱名、作者、朝代…" />
      <button class="btn-primary" @click="openForm(null)">+ 新增棋谱</button>
    </div>

    <!-- 列表 -->
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>谱名</th><th>朝代</th><th>作者</th><th>难度</th><th>标签</th><th>局数</th><th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredList" :key="item.id">
            <td class="td-title">{{ item.title }}</td>
            <td>{{ item.dynasty || '—' }}</td>
            <td>{{ item.author || '—' }}</td>
            <td><span class="diff-tag" :class="'d'+item.difficulty">{{ diffLabel(item.difficulty) }}</span></td>
            <td>
              <span v-for="l in (item.labels||[])" :key="l" class="label-chip">{{ l }}</span>
            </td>
            <td>{{ (item.games||[]).length }}</td>
            <td class="td-actions">
              <button class="act-btn" @click="openForm(item)">编辑</button>
              <button class="act-btn" @click="openUpload(item)">上传棋谱</button>
              <button class="act-btn danger" @click="confirmDel(item)">删除</button>
            </td>
          </tr>
          <tr v-if="!filteredList.length">
            <td colspan="7" class="empty-cell">暂无数据</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 新增/编辑表单面板 -->
    <div v-if="showForm" class="panel-overlay" @click.self="showForm = false">
      <div class="panel">
        <div class="panel-head">
          <span>{{ editItem ? '编辑棋谱' : '新增棋谱' }}</span>
          <button class="panel-close" @click="showForm = false">✕</button>
        </div>
        <form class="panel-body" @submit.prevent="saveForm">
          <div class="form-row">
            <label>谱名 <em>*</em></label>
            <input v-model="form.title" required placeholder="如：橘中秘" />
          </div>
          <div class="form-row two-col">
            <div>
              <label>朝代</label>
              <select v-model="form.dynasty">
                <option value="">请选择</option>
                <option v-for="d in dynasties" :key="d">{{ d }}</option>
              </select>
            </div>
            <div>
              <label>作者</label>
              <input v-model="form.author" placeholder="如：朱晋桢" />
            </div>
          </div>
          <div class="form-row two-col">
            <div>
              <label>难度</label>
              <select v-model.number="form.difficulty">
                <option :value="1">入门</option>
                <option :value="2">初级</option>
                <option :value="3">中级</option>
                <option :value="4">高级</option>
                <option :value="5">大师</option>
              </select>
            </div>
            <div>
              <label>标签（逗号分隔）</label>
              <input v-model="labelsInput" placeholder="如：残局,开局" />
            </div>
          </div>
          <div class="form-row">
            <label>简介</label>
            <textarea v-model="form.description" rows="3" placeholder="棋谱简介…" />
          </div>
          <div class="panel-footer">
            <button type="button" class="btn-cancel" @click="showForm = false">取消</button>
            <button type="submit" class="btn-primary" :disabled="saving">{{ saving ? '保存中…' : '保存' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 上传棋谱面板 -->
    <div v-if="showUpload" class="panel-overlay" @click.self="showUpload = false">
      <div class="panel panel-sm">
        <div class="panel-head">
          <span>上传棋谱文件 — {{ uploadTarget && uploadTarget.title }}</span>
          <button class="panel-close" @click="showUpload = false">✕</button>
        </div>
        <div class="panel-body">
          <p class="upload-hint">支持 PGN 格式，每局一个对局记录</p>
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
          <div v-if="uploadResult" class="upload-result" :class="uploadResult.ok ? 'ok' : 'err'">
            {{ uploadResult.msg }}
          </div>
          <div class="panel-footer">
            <button type="button" class="btn-cancel" @click="showUpload = false">关闭</button>
            <button class="btn-primary" :disabled="!uploadFile || uploading" @click="doUpload">
              {{ uploading ? '上传中…' : '确认上传' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 删除确认 -->
    <div v-if="delTarget" class="panel-overlay" @click.self="delTarget = null">
      <div class="panel panel-sm">
        <div class="panel-head"><span>确认删除</span><button class="panel-close" @click="delTarget = null">✕</button></div>
        <div class="panel-body">
          <p class="confirm-text">确定删除棋谱「<strong>{{ delTarget.title }}</strong>」？此操作不可撤销。</p>
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
  name: 'ManualAdmin',
  data() {
    return {
      list: [],
      keyword: '',
      showForm: false,
      editItem: null,
      form: { title: '', dynasty: '', author: '', difficulty: 2, description: '' },
      labelsInput: '',
      saving: false,
      showUpload: false,
      uploadTarget: null,
      uploadFile: null,
      uploading: false,
      uploadResult: null,
      delTarget: null,
      deleting: false,
      dynasties: ['先秦', '汉', '唐', '宋', '元', '明', '清', '民国', '当代']
    }
  },
  computed: {
    filteredList() {
      const kw = this.keyword.trim().toLowerCase()
      if (!kw) return this.list
      return this.list.filter(b =>
        b.title.toLowerCase().includes(kw) ||
        (b.author && b.author.toLowerCase().includes(kw)) ||
        (b.dynasty && b.dynasty.includes(kw))
      )
    }
  },
  created() { this.loadList() },
  methods: {
    diffLabel(d) { return ['', '入门', '初级', '中级', '高级', '大师'][d] || '—' },
    async loadList() {
      try {
        const res = await admin.manuals.getList()
        this.list = res.data || res || []
      } catch (e) {
        this.list = []
      }
    },
    openForm(item) {
      this.editItem = item
      if (item) {
        this.form = { title: item.title, dynasty: item.dynasty || '', author: item.author || '', difficulty: item.difficulty || 2, description: item.description || '' }
        this.labelsInput = (item.labels || []).join('，')
      } else {
        this.form = { title: '', dynasty: '', author: '', difficulty: 2, description: '' }
        this.labelsInput = ''
      }
      this.showForm = true
    },
    async saveForm() {
      this.saving = true
      const payload = { ...this.form, labels: this.labelsInput.split(/[,，]+/).map(s => s.trim()).filter(Boolean) }
      try {
        if (this.editItem) {
          await admin.manuals.update(this.editItem.id, payload)
          Object.assign(this.editItem, payload)
        } else {
          const res = await admin.manuals.create(payload)
          this.list.unshift(res.data || { ...payload, id: Date.now(), games: [] })
        }
        this.showForm = false
        this.$message.success('保存成功')
      } catch (e) {
        this.$message.error(e.message || '保存失败')
      } finally { this.saving = false }
    },
    openUpload(item) {
      this.uploadTarget = item
      this.uploadFile = null
      this.uploadResult = null
      this.showUpload = true
    },
    onFileChange(e) { this.uploadFile = e.target.files[0] || null },
    onDrop(e) { this.uploadFile = e.dataTransfer.files[0] || null },
    async doUpload() {
      if (!this.uploadFile) return
      this.uploading = true
      this.uploadResult = null
      try {
        await admin.manuals.uploadPgn(this.uploadTarget.id, this.uploadFile)
        this.uploadResult = { ok: true, msg: '上传成功，棋谱已更新' }
        this.$message.success('上传成功')
      } catch (e) {
        this.uploadResult = { ok: false, msg: e.message || '上传失败' }
      } finally { this.uploading = false }
    },
    confirmDel(item) { this.delTarget = item },
    async doDelete() {
      this.deleting = true
      try {
        await admin.manuals.remove(this.delTarget.id)
      } catch (e) { this.$message.error(e.message || '删除失败'); this.deleting = false; return }
      this.list = this.list.filter(b => b.id !== this.delTarget.id)
      this.$message.success('已删除')
      this.delTarget = null
      this.deleting = false
    }
  }
}
</script>

<style scoped>
@import './admin-common.css';
</style>
