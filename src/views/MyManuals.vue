<template>
  <div class="my-manuals-page">
    <div class="container">
      <div class="page-header">
        <div>
          <h1 class="page-title">我的棋谱</h1>

        </div>
        <button class="add-btn" @click="openForm(null)">+ 录入棋谱</button>
      </div>

      <!-- 筛选 -->
      <div class="filter-bar">
        <input v-model="keyword" class="search-input" placeholder="搜索棋谱名称…" @keyup.enter="fetchList" />
        <div class="type-tabs">
          <span
            v-for="t in typeOpts"
            :key="t.val"
            class="type-tab"
            :class="{ active: selectedType === t.val }"
            @click="selectedType = t.val; fetchList()"
          >{{ t.label }}</span>
        </div>
      </div>

      <div v-if="loading" class="loading-tip">加载中…</div>
      <div v-else-if="!list.length" class="empty-state">
        <div class="empty-icon">谱</div>
        <div class="empty-text">还没有录入棋谱</div>
        <button class="add-btn-sm" @click="openForm(null)">立即录入</button>
      </div>
      <div v-else class="books-grid">
        <div
          v-for="item in list"
          :key="item.id"
          class="book-card"
        >
          <!-- 书名签 -->
          <div class="book-label">
            <span class="book-title">{{ item.title }}</span>
          </div>
          <!-- 右侧线装图案 -->
          <div class="book-deco"></div>
          <!-- 底部操作 -->
          <div class="book-meta">
            <div class="book-type-tag">{{ typeLabel(item.type) }}</div>
            <div class="book-actions">
              <span class="action-btn" @click.stop="openForm(item)">编辑</span>
              <span class="action-sep">·</span>
              <span class="action-btn action-del" @click.stop="confirmDelete(item)">删除</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 录入弹窗 -->
    <el-dialog
      :title="editItem ? '编辑棋谱' : '录入棋谱'"
      :visible.sync="dialogVisible"
      width="560px"
      :close-on-click-modal="false"
    >
      <el-form ref="manualForm" :model="form" :rules="rules" label-width="80px" class="manual-form">
        <el-form-item label="棋谱名称" prop="title">
          <el-input v-model="form.title" placeholder="请输入棋谱名称" maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="form.type" placeholder="选择类型" style="width:100%">
            <el-option label="自创棋谱" value="custom" />
            <el-option label="复盘记录" value="replay" />
            <el-option label="学习笔记" value="study" />
            <el-option label="残局练习" value="endgame" />
          </el-select>
        </el-form-item>
        <el-form-item label="对局双方">
          <div style="display:flex;gap:8px">
            <el-input v-model="form.redPlayer" placeholder="红方（我方）" style="flex:1" />
            <span style="line-height:40px;color:#bbb">vs</span>
            <el-input v-model="form.blackPlayer" placeholder="黑方（对手）" style="flex:1" />
          </div>
        </el-form-item>
        <el-form-item label="对局日期">
          <el-date-picker v-model="form.gameDate" type="date" placeholder="选择日期" value-format="yyyy-MM-dd" style="width:100%" />
        </el-form-item>
        <el-form-item label="难度">
          <el-rate v-model="form.difficulty" :max="5" />
        </el-form-item>
        <el-form-item label="棋步记录" prop="moves">
          <el-input
            v-model="form.moves"
            type="textarea"
            :rows="4"
            placeholder="每行一步，例如：&#10;炮二平五&#10;炮８平５&#10;马二进三"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="心得、注解…" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveManual">
          {{ editItem ? '保存修改' : '录入' }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { myManuals } from '../api/index'
export default {
  name: 'MyManuals',
  data() {
    return {
      list: [], loading: false, saving: false,
      keyword: '', selectedType: '',
      dialogVisible: false, editItem: null,
      form: { title: '', type: 'custom', redPlayer: '', blackPlayer: '', gameDate: '', difficulty: 3, moves: '', remark: '' },
      rules: {
        title: [{ required: true, message: '请输入棋谱名称', trigger: 'blur' }],
        type: [{ required: true, message: '请选择类型', trigger: 'change' }]
      },
      typeOpts: [
        { val: '', label: '全部' },
        { val: 'custom', label: '自创' },
        { val: 'replay', label: '复盘' },
        { val: 'study', label: '学习' },
        { val: 'endgame', label: '残局' }
      ]
    }
  },
  mounted() { this.fetchList() },
  methods: {
    async fetchList() {
      this.loading = true
      try {
        const res = await myManuals.getList({ keyword: this.keyword, type: this.selectedType })
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
      if (item) {
        this.form = {
          title: item.title || '',
          type: item.type || 'custom',
          redPlayer: item.redPlayer || '',
          blackPlayer: item.blackPlayer || '',
          gameDate: item.gameDate || '',
          difficulty: item.difficulty || 3,
          moves: item.moves || '',
          remark: item.remark || ''
        }
      } else {
        this.form = { title: '', type: 'custom', redPlayer: '', blackPlayer: '', gameDate: '', difficulty: 3, moves: '', remark: '' }
      }
      this.dialogVisible = true
      this.$nextTick(() => { if (this.$refs.manualForm) this.$refs.manualForm.clearValidate() })
    },
    async saveManual() {
      this.$refs.manualForm.validate(async valid => {
        if (!valid) return
        this.saving = true
        try {
          if (this.editItem) {
            await myManuals.update(this.editItem.id, this.form)
            this.$message.success('修改成功')
          } else {
            await myManuals.create(this.form)
            this.$message.success('录入成功')
          }
          this.dialogVisible = false
          this.fetchList()
        } catch (e) {
          // 接口未接入时本地模拟
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
      })
    },
    confirmDelete(item) {
      this.$confirm(`确定删除《${item.title}》吗？`, '提示', {
        confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning'
      }).then(async () => {
        try {
          await myManuals.remove(item.id)
        } catch (e) {}
        this.list = this.list.filter(i => i.id !== item.id)
        this.$message.success('已删除')
      }).catch(() => {})
    },
    typeLabel(t) {
      return { custom: '自创', replay: '复盘', study: '学习', endgame: '残局' }[t] || '自创'
    },
    formatDate(d) {
      if (!d) return ''
      return d.toString().slice(0, 10)
    }
  }
}
</script>

<style scoped>
.my-manuals-page { background: #fff; min-height: calc(100vh - 56px); padding-bottom: 60px; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 32px; }

.page-header { display: flex; align-items: flex-end; justify-content: space-between; padding: 36px 0 24px; border-bottom: 1px solid #e8e8e8; margin-bottom: 24px; }
.page-title { font-size: 22px; font-weight: 700; color: #1a1a1a; margin-bottom: 4px; font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif; letter-spacing: 2px; }
.page-desc { font-size: 13px; color: #aaa; }

.add-btn { padding: 7px 18px; background: #1a1a1a; color: #fff; border: none; border-radius: 2px; font-size: 13px; cursor: pointer; transition: opacity 0.15s; }
.add-btn:hover { opacity: 0.75; }

.filter-bar { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
.search-input { width: 200px; height: 32px; padding: 0 10px; border: 1px solid #e8e8e8; border-radius: 2px; font-size: 13px; background: #fff; outline: none; }
.search-input:focus { border-color: #333; }
.type-tabs { display: flex; gap: 2px; }
.type-tab { padding: 4px 12px; font-size: 12px; color: #aaa; cursor: pointer; transition: color 0.1s; }
.type-tab:hover { color: #555; }
.type-tab.active { color: #1a1a1a; font-weight: 600; }

.loading-tip { color: #bbb; font-size: 14px; padding: 60px 0; text-align: center; }

.empty-state { text-align: center; padding: 80px 0; color: #bbb; }
.empty-icon { width: 56px; height: 56px; border-radius: 4px; background: #f0f0f0; color: #888; font-size: 24px; font-weight: 800; font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
.empty-text { font-size: 14px; margin-bottom: 16px; }
.add-btn-sm { padding: 6px 16px; background: #1a1a1a; color: #fff; border: none; border-radius: 2px; font-size: 13px; cursor: pointer; }

.books-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 24px 20px; }

.book-card { position: relative; width: 130px; height: 185px; cursor: pointer; background: #1d2e4a; border: 1px solid #162338; overflow: hidden; transition: transform 0.22s, box-shadow 0.22s; box-shadow: 2px 5px 14px rgba(0,0,0,.4); }
.book-card:hover { transform: translateY(-5px); box-shadow: 4px 12px 28px rgba(0,0,0,.55); }

.book-label { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); width: 42px; height: 126px; background: #f5f0e2; display: flex; align-items: center; justify-content: center; padding: 6px 4px; overflow: hidden; }
.book-label::before { content: ''; position: absolute; inset: 4px; border: 1px solid #b8a06a; pointer-events: none; }

.book-title { writing-mode: vertical-rl; font-size: 14px; font-weight: 600; color: #1a1200; letter-spacing: 3px; line-height: 1.3; z-index: 1; max-height: 104px; overflow: hidden; text-overflow: ellipsis; }

.book-deco { position: absolute; right: 0; top: 0; bottom: 0; width: 34px; background: repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(185,158,80,.5) 8px, rgba(185,158,80,.5) 9px), repeating-linear-gradient(-45deg, transparent, transparent 8px, rgba(185,158,80,.5) 8px, rgba(185,158,80,.5) 9px); }

.book-meta { position: absolute; bottom: 9px; left: 13px; display: flex; flex-direction: column; gap: 4px; }
.book-type-tag { font-size: 9px; color: rgba(185,158,80,.9); border: 1px solid rgba(185,158,80,.4); padding: 1px 4px; display: inline-block; background: rgba(0,0,0,.2); }
.book-actions { display: flex; align-items: center; gap: 2px; }
.action-btn { font-size: 10px; color: rgba(255,255,255,.35); cursor: pointer; transition: color 0.1s; }
.action-btn:hover { color: rgba(255,255,255,.8); }
.action-del:hover { color: #e06060; }
.action-sep { font-size: 10px; color: rgba(255,255,255,.15); }

.manual-form >>> .el-form-item__label { font-size: 13px; color: #555; }
.manual-form >>> .el-input__inner { border-radius: 2px; font-size: 13px; }
</style>
