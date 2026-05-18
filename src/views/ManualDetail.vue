<template>
  <div class="manual-detail-page">
    <div class="container">
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/manuals' }">棋谱</el-breadcrumb-item>
        <el-breadcrumb-item>{{ manual ? manual.title : '加载中…' }}</el-breadcrumb-item>
      </el-breadcrumb>
      <div v-if="loading" class="loading-area"><i class="el-icon-loading"></i> 加载中...</div>
      <div v-else-if="manual" class="detail-layout">
        <div class="info-panel">
          <div class="tags-row">
            <el-tag type="danger" size="small">{{ manual.dynasty || '明代' }}</el-tag>
            <el-tag type="info" size="small">{{ manual.categoryName || manual.category || '名谱' }}</el-tag>
            <el-tag v-if="manual.isPremium || manual.premium" type="warning" size="small">VIP专属</el-tag>
          </div>
          <h1 class="manual-title">{{ manual.title }}</h1>
          <div class="author-row">
            <i class="el-icon-user"></i>
            <span>作者：{{ manual.author || '佚名' }}</span>
          </div>
          <div class="difficulty-row">
            <span class="diff-label">难度：</span>
            <i v-for="n in 5" :key="n" class="el-icon-star-on" :style="{ color: n <= (manual.difficulty || 3) ? '#e6a817' : '#ddd', fontSize: '18px' }"></i>
            <span class="diff-text">{{ difficultyLabel(manual.difficulty) }}</span>
          </div>
          <div class="desc-section">
            <h3>棋谱简介</h3>
            <p>{{ manual.description || manual.desc || '这是一部经典的象棋古谱，汇集了历代高手的对局精华，对学习象棋理论有极高的参考价值。' }}</p>
          </div>
          <div class="moves-count" v-if="moves.length">
            <i class="el-icon-s-order"></i> 共 {{ moves.length }} 步棋
          </div>
          <el-button type="primary" class="start-btn" @click="handleStartDemo" :disabled="isPremiumLocked">
            <i class="el-icon-video-play"></i>
            {{ isPremiumLocked ? 'VIP专属 · 开通后演示' : '开始演示' }}
          </el-button>
          <el-button v-if="isPremiumLocked" class="subscribe-btn" @click="$router.push('/subscribe')">开通会员</el-button>
        </div>
        <div class="board-panel">
          <div class="board-container">
            <div v-if="isPremiumLocked" class="vip-overlay">
              <div class="vip-lock-content">
                <i class="el-icon-lock" style="font-size:36px;color:#e6a817;margin-bottom:12px"></i>
                <h3>VIP专属内容</h3>
                <p>开通会员即可解锁全部棋谱演示</p>
                <el-button class="unlock-btn" @click="$router.push('/subscribe')">立即开通</el-button>
              </div>
            </div>
            <div class="chess-board">
              <div class="board-labels-h">
                <span v-for="col in 9" :key="col">{{ colLabel(col-1) }}</span>
              </div>
              <div class="board-inner">
                <div class="board-rows">
                  <div v-for="row in 10" :key="row" class="board-row">
                    <div v-for="col in 9" :key="col" class="board-cell">
                      <div v-if="getPieceAt(row-1, col-1)" class="chess-piece" :class="getPieceClass(row-1, col-1)">{{ getPieceAt(row-1, col-1) }}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="board-labels-h">
                <span v-for="col in 9" :key="col">{{ 9 - (col-1) }}</span>
              </div>
            </div>
            <div class="board-controls">
              <el-button-group>
                <el-button size="small" @click="goToStart">|◀</el-button>
                <el-button size="small" @click="prevMove">◀</el-button>
                <el-button size="small" @click="nextMove">▶</el-button>
                <el-button size="small" @click="goToEnd">▶|</el-button>
              </el-button-group>
              <span class="move-counter" v-if="moves.length">第 {{ currentMoveIndex + 1 }} / {{ moves.length }} 步</span>
              <span class="move-counter" v-else>初始局面</span>
            </div>
          </div>
          <div class="move-list" v-if="moves.length">
            <h4 class="move-list-title">棋步记录</h4>
            <div class="moves-grid">
              <div v-for="(move, idx) in moves" :key="idx" class="move-item" :class="{ active: idx === currentMoveIndex }" @click="currentMoveIndex = idx">
                <span class="move-num">{{ idx + 1 }}</span>
                <span class="move-text">{{ move.notation || move }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="not-found">
        <i class="el-icon-warning" style="font-size:48px;color:#ccc"></i>
        <p>棋谱不存在或已下架</p>
        <el-button @click="$router.push('/manuals')" type="primary">返回棋谱库</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { manuals as manualsApi } from '../api/index'
import { mapGetters } from 'vuex'

const INITIAL_BOARD = [
  ['車','馬','相','仕','將','仕','相','馬','車'],
  ['','','','','','','','',''],
  ['','砲','','','','','','砲',''],
  ['卒','','卒','','卒','','卒','','卒'],
  ['','','','','','','','',''],
  ['','','','','','','','',''],
  ['兵','','兵','','兵','','兵','','兵'],
  ['','炮','','','','','','炮',''],
  ['','','','','','','','',''],
  ['俥','傌','象','仕','帅','仕','象','傌','俥']
]

export default {
  name: 'ManualDetail',
  data() {
    return {
      manual: null, loading: false, currentMoveIndex: 0,
      board: JSON.parse(JSON.stringify(INITIAL_BOARD)), moves: []
    }
  },
  computed: {
    ...mapGetters('user', ['isLoggedIn', 'isVip']),
    isPremiumLocked() {
      return (this.manual && (this.manual.isPremium || this.manual.premium)) && !this.isVip
    }
  },
  mounted() { this.fetchDetail() },
  methods: {
    async fetchDetail() {
      this.loading = true
      try {
        const res = await manualsApi.getDetail(this.$route.params.id)
        this.manual = res.data || res
        if (this.manual && this.manual.content) this.parseMoves(this.manual.content)
        else this.moves = this.getMockMoves()
      } catch (e) {
        this.manual = {
          id: this.$route.params.id, title: '橘中秘·炮局第一', dynasty: '明',
          author: '朱晋桢', categoryName: '橘中秘', difficulty: 3,
          description: '《橘中秘》是明代象棋名谱，以炮局为主要战术体系。此局着重展示炮的进攻威力与灵活运用。',
          isPremium: false
        }
        this.moves = this.getMockMoves()
      } finally { this.loading = false }
    },
    getMockMoves() {
      return [
        { notation: '炮二平五' }, { notation: '炮８平５' }, { notation: '马二进三' },
        { notation: '马８进７' }, { notation: '车一平二' }, { notation: '车９平８' },
        { notation: '兵七进一' }, { notation: '卒７进１' }, { notation: '马八进七' },
        { notation: '马２进３' }
      ]
    },
    parseMoves(content) {
      try {
        if (typeof content === 'string') {
          const parsed = JSON.parse(content)
          this.moves = Array.isArray(parsed) ? parsed : []
        } else if (Array.isArray(content)) { this.moves = content }
      } catch (e) { this.moves = [] }
    },
    getPieceAt(row, col) { return this.board[row] && this.board[row][col] ? this.board[row][col] : null },
    getPieceClass(row, col) {
      const piece = this.board[row][col]
      const redPieces = ['帅', '仕', '象', '俥', '傌', '炮', '兵']
      return redPieces.includes(piece) ? 'red-piece' : 'black-piece'
    },
    colLabel(i) { return ['a','b','c','d','e','f','g','h','i'][i] },
    difficultyLabel(d) {
      const map = { 1: '入门', 2: '进阶', 3: '高级', 4: '大师', 5: '宗师' }
      return map[d] || '未知'
    },
    handleStartDemo() {
      if (this.moves.length) this.currentMoveIndex = 0
      this.$message.success('演示模式开始，使用下方按钮逐步播放棋步')
    },
    prevMove() { if (this.currentMoveIndex > 0) this.currentMoveIndex-- },
    nextMove() { if (this.currentMoveIndex < this.moves.length - 1) this.currentMoveIndex++ },
    goToStart() { this.currentMoveIndex = 0 },
    goToEnd() { this.currentMoveIndex = Math.max(0, this.moves.length - 1) }
  }
}
</script>

<style scoped>
.manual-detail-page { background: #f7f3ee; min-height: calc(100vh - 60px); padding-bottom: 48px; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
.breadcrumb { padding: 20px 0 8px; font-size: 13px; }
.loading-area { text-align: center; padding: 80px; color: #999; font-size: 16px; }
.detail-layout { display: flex; gap: 32px; align-items: flex-start; padding: 16px 0 0; }
.info-panel { flex: 0 0 40%; max-width: 420px; }
.tags-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
.manual-title { font-size: 30px; font-weight: 800; color: #1a1a1a; margin-bottom: 16px; line-height: 1.3; }
.author-row { display: flex; align-items: center; gap: 6px; font-size: 15px; color: #666; margin-bottom: 12px; }
.difficulty-row { display: flex; align-items: center; gap: 4px; margin-bottom: 20px; }
.diff-label { font-size: 14px; color: #666; }
.diff-text { font-size: 13px; color: #999; margin-left: 4px; }
.desc-section { background: #fff; border-radius: 10px; padding: 20px; margin-bottom: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.desc-section h3 { font-size: 15px; font-weight: 700; color: #1a1a1a; margin-bottom: 10px; }
.desc-section p { font-size: 14px; color: #555; line-height: 1.8; }
.moves-count { font-size: 14px; color: #888; margin-bottom: 16px; }
.start-btn { background: #8B1A1A !important; border-color: #8B1A1A !important; color: #fff !important; font-size: 16px; font-weight: 600; padding: 12px 32px; width: 100%; margin-bottom: 12px; }
.subscribe-btn { width: 100%; font-weight: 600; }
.board-panel { flex: 1; min-width: 0; }
.board-container { background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); position: relative; }
.vip-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.7); border-radius: 12px; display: flex; align-items: center; justify-content: center; z-index: 10; backdrop-filter: blur(4px); }
.vip-lock-content { text-align: center; color: #fff; }
.vip-lock-content h3 { font-size: 20px; margin-bottom: 8px; color: #f4c842; }
.vip-lock-content p { font-size: 14px; color: rgba(255,255,255,0.8); margin-bottom: 20px; }
.unlock-btn { background: linear-gradient(135deg, #e6a817, #f4c842) !important; color: #5C0000 !important; border: none !important; font-weight: 700; }
.chess-board { user-select: none; }
.board-labels-h { display: flex; justify-content: space-around; padding: 0 4px; margin-bottom: 4px; }
.board-labels-h span { width: 40px; text-align: center; font-size: 11px; color: #bbb; }
.board-inner { border: 3px solid #8B1A1A; border-radius: 4px; background: #f0d9a0; overflow: hidden; }
.board-rows { display: flex; flex-direction: column; }
.board-row { display: flex; border-bottom: 1px solid rgba(139,26,26,0.3); }
.board-row:last-child { border-bottom: none; }
.board-cell { width: 40px; height: 40px; border-right: 1px solid rgba(139,26,26,0.3); display: flex; align-items: center; justify-content: center; }
.board-cell:last-child { border-right: none; }
.chess-piece { width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; cursor: pointer; border: 2px solid; transition: transform 0.15s; }
.chess-piece:hover { transform: scale(1.1); }
.red-piece { background: radial-gradient(circle at 35% 35%, #fff0f0, #c0392b); color: #8B1A1A; border-color: #8B1A1A; }
.black-piece { background: radial-gradient(circle at 35% 35%, #555, #1a1a1a); color: #e8d5a0; border-color: #1a1a1a; }
.board-controls { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 16px; }
.move-counter { font-size: 13px; color: #888; }
.move-list { background: #fff; border-radius: 10px; padding: 16px; margin-top: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.move-list-title { font-size: 14px; font-weight: 700; color: #1a1a1a; margin-bottom: 12px; }
.moves-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; max-height: 160px; overflow-y: auto; }
.move-item { display: flex; align-items: center; gap: 6px; padding: 5px 8px; border-radius: 5px; cursor: pointer; font-size: 13px; transition: background 0.15s; }
.move-item:hover { background: #fdf0f0; }
.move-item.active { background: #8B1A1A; color: #fff; }
.move-num { font-size: 11px; opacity: 0.6; min-width: 18px; }
.not-found { text-align: center; padding: 80px; color: #bbb; }
.not-found p { margin: 16px 0 24px; font-size: 16px; }
@media (max-width: 768px) {
  .detail-layout { flex-direction: column; }
  .info-panel { max-width: 100%; }
  .board-cell { width: 32px; height: 32px; }
  .chess-piece { width: 28px; height: 28px; font-size: 11px; }
}
</style>
