<template>
  <div class="my-manuals-page">
    <div class="container">
      <div class="page-header">
        <div>
          <h1 class="page-title">我的棋谱</h1>
          <p class="page-desc">记录、整理属于自己的棋局与心得</p>
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
          :class="'type-' + (item.type || 'custom')"
        >
          <div class="book-spine">
            <span class="spine-char">{{ item.title ? item.title.charAt(0) : '谱' }}</span>
          </div>
          <div class="book-face">
            <div class="book-title-wrap">
              <span class="book-title">{{ item.title }}</span>
            </div>
            <div class="book-type-tag">{{ typeLabel(item.type) }}</div>
            <div class="book-date">{{ formatDate(item.createdAt) }}</div>
            <div class="book-actions">
              <span class="action-btn" @click.stop="openForm(item)">编辑</span>
              <span class="action-sep">·</span>
              <span class="action-btn action-del" @click.stop="confirmDelete(item)">删除</span>
            </div>
          </div>
          <div class="book-pages"></div>
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
        <el-button type="primary" :loading="saving" @click="saveManual" style="background:#8B1A1A;border-color:#8B1A1A">
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
.my-manuals-page { background: #faf8f5; min-height: calc(100vh - 56px); padding-bottom: 60px; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 32px; }

.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 36px 0 24px;
  border-bottom: 1px solid #ece8e0;
  margin-bottom: 24px;
}
.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 4px;
  font-family: 'STKaiti', 'KaiTi', serif;
  letter-spacing: 2px;
}
.page-desc { font-size: 13px; color: #aaa; }

.add-btn {
  padding: 8px 20px;
  background: #8B1A1A;
  color: #fff;
  border: none;
  border-radius: 2px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
}
.add-btn:hover { opacity: 0.88; }

.filter-bar { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
.search-input {
  width: 200px;
  height: 32px;
  padding: 0 10px;
  border: 1px solid #e0dbd0;
  border-radius: 2px;
  font-size: 13px;
  background: #fff;
  outline: none;
}
.search-input:focus { border-color: #8B1A1A; }
.type-tabs { display: flex; gap: 4px; }
.type-tab {
  padding: 4px 12px;
  font-size: 12px;
  color: #888;
  cursor: pointer;
  border-radius: 2px;
  transition: all 0.1s;
}
.type-tab:hover { color: #8B1A1A; }
.type-tab.active { background: #fdf0f0; color: #8B1A1A; font-weight: 600; }

.loading-tip { color: #bbb; font-size: 14px; padding: 60px 0; text-align: center; }

.empty-state {
  text-align: center;
  padding: 80px 0;
  color: #bbb;
}
.empty-icon {
  width: 64px;
  height: 64px;
  border-radius: 4px;
  background: #e8d4a0;
  color: #8B1A1A;
  font-size: 28px;
  font-weight: 800;
  font-family: 'STKaiti', 'KaiTi', serif;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}
.empty-text { font-size: 14px; margin-bottom: 16px; }
.add-btn-sm {
  padding: 6px 16px;
  background: #8B1A1A;
  color: #fff;
  border: none;
  border-radius: 2px;
  font-size: 13px;
  cursor: pointer;
}

/* 书籍网格 */
.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 24px 20px;
}

.book-card {
  position: relative;
  width: 130px;
  height: 185px;
  cursor: pointer;
  transition: transform 0.2s;
  display: flex;
}
.book-card:hover { transform: translateY(-4px) rotate(-1deg); }
.book-card:hover .book-face { box-shadow: 6px 6px 18px rgba(0,0,0,0.25); }

.book-spine {
  width: 20px;
  flex-shrink: 0;
  border-radius: 2px 0 0 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
}
.type-custom .book-spine { background: #5c3d8a; }
.type-replay .book-spine { background: #1a5c2a; }
.type-study .book-spine { background: #1a4a8b; }
.type-endgame .book-spine { background: #8B1A1A; }

.spine-char {
  font-size: 11px;
  color: rgba(255,255,255,0.7);
  font-family: 'STKaiti', 'KaiTi', serif;
}

.book-face {
  flex: 1;
  background: #f5e6c0;
  border: 1px solid #c9a96e;
  border-left: none;
  border-radius: 0 3px 3px 0;
  padding: 10px 8px 10px 10px;
  display: flex;
  flex-direction: column;
  box-shadow: 3px 3px 10px rgba(0,0,0,0.15);
  position: relative;
  overflow: hidden;
}
.book-face::before {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 18px,
    rgba(180,140,60,0.07) 18px,
    rgba(180,140,60,0.07) 19px
  );
  pointer-events: none;
}

.book-title-wrap { flex: 1; display: flex; align-items: flex-start; padding-top: 4px; }
.book-title {
  writing-mode: vertical-rl;
  font-size: 13px;
  font-weight: 700;
  color: #2c1a08;
  font-family: 'STKaiti', 'KaiTi', 'SimSun', serif;
  line-height: 1.4;
  letter-spacing: 1px;
  max-height: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.book-type-tag {
  font-size: 10px;
  color: #8B1A1A;
  border: 1px solid rgba(139,26,26,0.3);
  padding: 1px 4px;
  border-radius: 1px;
  margin-bottom: 4px;
  display: inline-block;
  font-family: 'STKaiti', 'KaiTi', serif;
}
.book-date { font-size: 10px; color: #b09060; margin-bottom: 6px; }
.book-actions { display: flex; align-items: center; gap: 2px; }
.action-btn {
  font-size: 10px;
  color: #8a6a3a;
  cursor: pointer;
  transition: color 0.1s;
}
.action-btn:hover { color: #8B1A1A; }
.action-del:hover { color: #c0392b; }
.action-sep { font-size: 10px; color: #c9a96e; }

.book-pages {
  position: absolute;
  right: -5px;
  top: 3px;
  bottom: 3px;
  width: 5px;
  background: repeating-linear-gradient(
    to bottom,
    #f0e4b8,
    #f0e4b8 1px,
    #e8d4a0 1px,
    #e8d4a0 2px
  );
  border-radius: 0 2px 2px 0;
  box-shadow: 1px 1px 3px rgba(0,0,0,0.1);
}

/* 表单 */
.manual-form >>> .el-form-item__label { font-size: 13px; color: #555; }
.manual-form >>> .el-input__inner { border-radius: 2px; font-size: 13px; }
</style>
