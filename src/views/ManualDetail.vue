<template>
  <div class="manual-detail-page">
    <div class="container">
      <nav class="breadcrumb">
        <router-link to="/manuals">棋谱</router-link>
        <span class="sep">/</span>
        <span>{{ manual ? manual.title : '加载中…' }}</span>
      </nav>

      <div v-if="loading" class="loading-tip">加载中…</div>
      <div v-else-if="manual" class="detail-layout">

        <!-- 左侧信息 -->
        <div class="info-panel">
          <div class="meta-row">
            <span class="meta-tag">{{ manual.dynasty || '明代' }}</span>
            <span class="meta-tag">{{ manual.categoryName || manual.category || '名谱' }}</span>
            <span v-if="manual.isPremium || manual.premium" class="vip-tag">VIP</span>
          </div>
          <h1 class="manual-title">{{ manual.title }}</h1>
          <div class="author-row">作者：{{ manual.author || '佚名' }}</div>
          <div class="diff-row">
            难度：
            <span v-for="n in 5" :key="n" class="dot" :class="{ filled: n <= (manual.difficulty || 3) }"></span>
            <span class="diff-text">{{ difficultyLabel(manual.difficulty) }}</span>
          </div>
          <div class="desc-block">
            <div class="block-label">棋谱简介</div>
            <p>{{ manual.description || manual.desc || '经典象棋古谱，汇集了历代高手的对局精华。' }}</p>
          </div>
          <div class="moves-count" v-if="moves.length">共 {{ moves.length }} 步棋</div>
          <button class="start-btn" @click="handleStartDemo" :disabled="isPremiumLocked">
            {{ isPremiumLocked ? 'VIP专属 · 开通后演示' : '开始演示' }}
          </button>
          <button v-if="isPremiumLocked" class="subscribe-btn" @click="$router.push('/subscribe')">开通会员</button>

          <!-- 棋步列表 -->
          <div class="move-list" v-if="moves.length">
            <div class="block-label" style="margin-bottom:8px">棋步记录</div>
            <div class="moves-grid">
              <div
                v-for="(move, idx) in moves"
                :key="idx"
                class="move-item"
                :class="{ active: idx === currentMoveIndex }"
                @click="currentMoveIndex = idx"
              >
                <span class="move-num">{{ idx + 1 }}</span>
                <span>{{ move.notation || move }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧棋盘 -->
        <div class="board-panel">
          <div v-if="isPremiumLocked" class="vip-overlay">
            <div class="lock-content">
              <div class="lock-title">VIP 专属内容</div>
              <div class="lock-desc">开通会员即可解锁全部棋谱演示</div>
              <button class="unlock-btn" @click="$router.push('/subscribe')">立即开通</button>
            </div>
          </div>

          <!-- 列号 -->
          <div class="col-numbers">
            <span v-for="c in 9" :key="c">{{ c }}</span>
          </div>

          <!-- 棋盘主体 -->
          <div class="board-wrap">
            <!-- SVG 棋盘线 -->
            <svg class="board-svg" :width="BW" :height="BH" xmlns="http://www.w3.org/2000/svg">
              <!-- 外框 -->
              <rect :x="PAD" :y="PAD" :width="CELL*8" :height="CELL*9"
                fill="none" stroke="#cc0000" stroke-width="2"/>
              <!-- 横线 (r=0..9) -->
              <line v-for="r in 10" :key="'h'+r"
                :x1="PAD" :y1="PAD+(r-1)*CELL"
                :x2="PAD+CELL*8" :y2="PAD+(r-1)*CELL"
                stroke="#cc0000" stroke-width="1"/>
              <!-- 竖线 左右两侧（全高） -->
              <line :x1="PAD" :y1="PAD" :x2="PAD" :y2="PAD+CELL*9" stroke="#cc0000" stroke-width="1"/>
              <line :x1="PAD+CELL*8" :y1="PAD" :x2="PAD+CELL*8" :y2="PAD+CELL*9" stroke="#cc0000" stroke-width="1"/>
              <!-- 竖线 中间 7 条上半（楚河处断开） -->
              <line v-for="c in 7" :key="'vu'+c"
                :x1="PAD+c*CELL" :y1="PAD" :x2="PAD+c*CELL" :y2="PAD+4*CELL"
                stroke="#cc0000" stroke-width="1"/>
              <!-- 竖线 中间 7 条下半 -->
              <line v-for="c in 7" :key="'vd'+c"
                :x1="PAD+c*CELL" :y1="PAD+5*CELL" :x2="PAD+c*CELL" :y2="PAD+9*CELL"
                stroke="#cc0000" stroke-width="1"/>
              <!-- 上将宫斜线 -->
              <line :x1="PAD+3*CELL" :y1="PAD" :x2="PAD+5*CELL" :y2="PAD+2*CELL" stroke="#cc0000" stroke-width="1"/>
              <line :x1="PAD+5*CELL" :y1="PAD" :x2="PAD+3*CELL" :y2="PAD+2*CELL" stroke="#cc0000" stroke-width="1"/>
              <!-- 下帅宫斜线 -->
              <line :x1="PAD+3*CELL" :y1="PAD+7*CELL" :x2="PAD+5*CELL" :y2="PAD+9*CELL" stroke="#cc0000" stroke-width="1"/>
              <line :x1="PAD+5*CELL" :y1="PAD+7*CELL" :x2="PAD+3*CELL" :y2="PAD+9*CELL" stroke="#cc0000" stroke-width="1"/>
              <!-- 楚河汉界 -->
              <text :x="PAD+CELL*1.8" :y="PAD+4*CELL+CELL*0.5+7"
                font-size="17" fill="#cc0000" font-weight="bold"
                font-family="STKaiti,KaiTi,SimSun,serif" letter-spacing="8">楚  河</text>
              <text :x="PAD+CELL*4.6" :y="PAD+4*CELL+CELL*0.5+7"
                font-size="17" fill="#cc0000" font-weight="bold"
                font-family="STKaiti,KaiTi,SimSun,serif" letter-spacing="8">漢  界</text>
            </svg>

            <!-- 棋子层 -->
            <div class="pieces-layer" :style="{ width: BW+'px', height: BH+'px' }">
              <div
                v-for="item in pieceList"
                :key="item.r + '-' + item.c"
                class="piece"
                :class="item.isRed ? 'red-piece' : 'black-piece'"
                :style="pieceStyle(item.r, item.c)"
              >{{ item.piece }}</div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="board-controls">
            <button class="ctrl-btn" @click="goToStart" title="跳至开局">|◀</button>
            <button class="ctrl-btn" @click="prevMove" title="上一步">◀</button>
            <span class="move-counter">
              {{ moves.length ? '第 ' + (currentMoveIndex + 1) + ' / ' + moves.length + ' 步' : '初始局面' }}
            </span>
            <button class="ctrl-btn" @click="nextMove" title="下一步">▶</button>
            <button class="ctrl-btn" @click="goToEnd" title="跳至末局">▶|</button>
          </div>
        </div>
      </div>

      <div v-else class="not-found">
        <div>棋谱不存在或已下架</div>
        <button class="start-btn" style="width:auto;padding:0 24px;margin-top:16px" @click="$router.push('/manuals')">返回棋谱库</button>
      </div>
    </div>
  </div>
</template>

<script>
import { manuals as manualsApi } from '../api/index'
import { mapGetters } from 'vuex'
import { MEIHUA_MANUALS } from '../data/meihuapu.js'

const INITIAL_BOARD = [
  ['車','馬','象','士','將','士','象','馬','車'],
  ['', '', '', '', '', '', '', '', ''],
  ['', '砲', '', '', '', '', '', '砲', ''],
  ['卒','','卒','','卒','','卒','','卒'],
  ['', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', ''],
  ['兵','','兵','','兵','','兵','','兵'],
  ['', '炮', '', '', '', '', '', '炮', ''],
  ['', '', '', '', '', '', '', '', ''],
  ['俥','傌','相','仕','帅','仕','相','傌','俥']
]

const RED_PIECES = new Set(['帅','仕','相','俥','傌','炮','兵'])

export default {
  name: 'ManualDetail',
  data() {
    const CELL = 52
    const PAD  = 28
    return {
      CELL, PAD,
      BW: PAD * 2 + CELL * 8,
      BH: PAD * 2 + CELL * 9,
      manual: null, loading: false,
      currentMoveIndex: 0,
      board: JSON.parse(JSON.stringify(INITIAL_BOARD)),
      moves: []
    }
  },
  computed: {
    ...mapGetters('user', ['isLoggedIn', 'isVip']),
    isPremiumLocked() {
      return (this.manual && (this.manual.isPremium || this.manual.premium)) && !this.isVip
    },
    pieceList() {
      const list = []
      this.board.forEach((row, r) => {
        row.forEach((piece, c) => {
          if (piece) list.push({ piece, r, c, isRed: RED_PIECES.has(piece) })
        })
      })
      return list
    }
  },
  mounted() { this.fetchDetail() },
  methods: {
    async fetchDetail() {
      this.loading = true
      try {
        const res = await manualsApi.getDetail(this.$route.params.id)
        this.manual = res.data || res
        const content = this.manual && this.manual.content
        if (content) this.parseMoves(content)
        else this.moves = this.getMockMoves()
      } catch (e) {
        const id = Number(this.$route.params.id)
        const meihua = MEIHUA_MANUALS.find(m => m.id === id)
        if (meihua) {
          this.manual = meihua
          this.moves = meihua.moves
        } else {
          this.manual = {
            id: this.$route.params.id,
            title: '橘中秘·炮局第一', dynasty: '明代',
            author: '朱晋桢', categoryName: '橘中秘', difficulty: 3,
            description: '《橘中秘》是明代象棋名谱，以炮局为主要战术体系，此局着重展示炮的进攻威力。',
            isPremium: false
          }
          this.moves = this.getMockMoves()
        }
      } finally { this.loading = false }
    },
    getMockMoves() {
      return [
        { notation: '炮二平五' }, { notation: '炮８平５' },
        { notation: '马二进三' }, { notation: '马８进７' },
        { notation: '车一平二' }, { notation: '车９平８' },
        { notation: '兵七进一' }, { notation: '卒７进１' },
        { notation: '马八进七' }, { notation: '马２进３' }
      ]
    },
    parseMoves(content) {
      try {
        const parsed = typeof content === 'string' ? JSON.parse(content) : content
        this.moves = Array.isArray(parsed) ? parsed : []
      } catch (e) { this.moves = [] }
    },
    pieceStyle(r, c) {
      return {
        left: (this.PAD + c * this.CELL) + 'px',
        top:  (this.PAD + r * this.CELL) + 'px'
      }
    },
    difficultyLabel(d) {
      return { 1: '入门', 2: '进阶', 3: '高级', 4: '大师', 5: '宗师' }[d] || ''
    },
    handleStartDemo() {
      if (this.moves.length) this.currentMoveIndex = 0
      this.$message.success('演示模式开始，使用下方按钮逐步播放')
    },
    prevMove() { if (this.currentMoveIndex > 0) this.currentMoveIndex-- },
    nextMove() { if (this.currentMoveIndex < this.moves.length - 1) this.currentMoveIndex++ },
    goToStart() { this.currentMoveIndex = 0 },
    goToEnd() { this.currentMoveIndex = Math.max(0, this.moves.length - 1) }
  }
}
</script>

<style scoped>
.manual-detail-page { background: #faf8f5; min-height: calc(100vh - 56px); padding-bottom: 48px; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 32px; }

.breadcrumb {
  padding: 20px 0 16px;
  font-size: 13px;
  color: #bbb;
  display: flex;
  align-items: center;
  gap: 6px;
}
.breadcrumb a { color: #bbb; }
.breadcrumb a:hover { color: #8B1A1A; }
.sep { color: #ddd; }

.loading-tip { color: #bbb; padding: 60px 0; font-size: 14px; }

.detail-layout { display: flex; gap: 48px; align-items: flex-start; }

/* ─── 左侧信息面板 ─── */
.info-panel { flex: 0 0 300px; }

.meta-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
.meta-tag {
  font-size: 11px; color: #999;
  border: 1px solid #e8e8e8;
  padding: 2px 8px; border-radius: 2px;
}
.vip-tag {
  font-size: 11px; font-weight: 700; color: #8B1A1A;
  border: 1px solid #8B1A1A;
  padding: 2px 8px; border-radius: 2px; letter-spacing: 1px;
}
.manual-title {
  font-size: 22px; font-weight: 800; color: #1a1a1a;
  margin-bottom: 10px; line-height: 1.3;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}
.author-row { font-size: 13px; color: #888; margin-bottom: 8px; }
.diff-row {
  display: flex; align-items: center; gap: 4px;
  font-size: 13px; color: #888; margin-bottom: 18px;
}
.dot { width: 6px; height: 6px; border-radius: 50%; background: #e0e0e0; }
.dot.filled { background: #8B1A1A; }
.diff-text { margin-left: 4px; color: #bbb; }

.desc-block { border: 1px solid #f0ebe0; border-radius: 4px; padding: 14px; margin-bottom: 14px; background: #fff; }
.block-label { font-size: 11px; font-weight: 700; color: #bbb; letter-spacing: 1px; margin-bottom: 6px; }
.desc-block p { font-size: 13px; color: #666; line-height: 1.8; }

.moves-count { font-size: 12px; color: #bbb; margin-bottom: 12px; }

.start-btn {
  width: 100%; height: 42px;
  background: #8B1A1A; color: #fff;
  border: none; border-radius: 3px;
  font-size: 14px; font-weight: 600;
  cursor: pointer; transition: opacity 0.15s;
  margin-bottom: 8px;
}
.start-btn:hover { opacity: 0.88; }
.start-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.subscribe-btn {
  width: 100%; height: 38px;
  background: #fff; border: 1px solid #8B1A1A;
  color: #8B1A1A; border-radius: 3px;
  font-size: 13px; font-weight: 600; cursor: pointer;
}

.move-list { margin-top: 20px; }
.moves-grid {
  display: grid; grid-template-columns: repeat(2, 1fr);
  gap: 2px; max-height: 220px; overflow-y: auto;
}
.move-item {
  display: flex; align-items: center; gap: 6px;
  padding: 5px 8px; border-radius: 3px;
  cursor: pointer; font-size: 12px; color: #555;
  transition: background 0.1s;
}
.move-item:hover { background: #fdf5f0; }
.move-item.active { background: #8B1A1A; color: #fff; }
.move-num { font-size: 10px; opacity: 0.5; min-width: 18px; }

/* ─── 右侧棋盘 ─── */
.board-panel { flex: 1; display: flex; flex-direction: column; align-items: flex-start; position: relative; }

.vip-overlay {
  position: absolute; inset: 0; z-index: 20;
  background: rgba(250,248,245,0.92);
  display: flex; align-items: center; justify-content: center;
  border-radius: 4px;
}
.lock-content { text-align: center; }
.lock-title { font-size: 17px; font-weight: 700; color: #1a1a1a; margin-bottom: 6px; }
.lock-desc { font-size: 13px; color: #888; margin-bottom: 20px; }
.unlock-btn {
  padding: 10px 28px; background: #8B1A1A; color: #fff;
  border: none; border-radius: 3px; font-size: 14px; font-weight: 600; cursor: pointer;
}

/* 列号 */
.col-numbers {
  display: flex;
  margin-bottom: 2px;
  padding-left: 28px;
}
.col-numbers span {
  width: 52px;
  text-align: center;
  font-size: 12px;
  color: #8a6030;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

/* 棋盘容器 */
.board-wrap {
  position: relative;
  display: inline-block;
  background: #ffffff;
  border: 2px solid #cc0000;
  border-radius: 2px;
  box-shadow: 2px 2px 10px rgba(0,0,0,0.15);
}

.board-svg { display: block; }

/* 棋子层 */
.pieces-layer { position: absolute; top: 0; left: 0; pointer-events: none; }

/* 棋子通用 */
.piece {
  position: absolute;
  width: 44px; height: 44px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 17px; font-weight: 900;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  transform: translate(-50%, -50%);
  cursor: pointer;
  pointer-events: all;
  transition: transform 0.15s;
  user-select: none;
}
.piece:hover { transform: translate(-50%, -50%) scale(1.1); z-index: 10; }

/* 红方棋子 */
.red-piece {
  background: #fff;
  color: #cc0000;
  border: 2px solid #cc0000;
  box-shadow: inset 0 0 0 2px #cc0000, 0 1px 3px rgba(0,0,0,.12);
}

/* 黑方棋子 */
.black-piece {
  background: #fff;
  color: #111111;
  border: 2px solid #111111;
  box-shadow: inset 0 0 0 2px #111111, 0 1px 3px rgba(0,0,0,.12);
}

/* 操作按钮 */
.board-controls {
  display: flex; align-items: center;
  justify-content: center; gap: 8px;
  margin-top: 14px;
}
.ctrl-btn {
  width: 38px; height: 32px;
  border: 1px solid #e0dbd0;
  background: #fff; border-radius: 3px;
  font-size: 12px; color: #555;
  cursor: pointer; transition: all 0.15s;
}
.ctrl-btn:hover { border-color: #8B1A1A; color: #8B1A1A; background: #fdf8f4; }
.move-counter {
  font-size: 12px; color: #999;
  min-width: 110px; text-align: center;
}

.not-found { text-align: center; padding: 80px; color: #bbb; font-size: 14px; }

@media (max-width: 960px) {
  .detail-layout { flex-direction: column; }
  .info-panel { flex: none; width: 100%; }
}
</style>
