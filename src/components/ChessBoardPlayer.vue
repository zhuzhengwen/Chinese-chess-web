<template>
  <div class="cbp-root">
    <!-- 棋盘区 -->
    <div class="cbp-board-panel">
      <div class="cbp-board-wrap">
        <!-- VIP 遮罩 -->
        <div v-if="locked" class="cbp-vip-overlay">
          <div class="cbp-lock-content">
            <div class="cbp-lock-title">VIP 专属内容</div>
            <div class="cbp-lock-desc">开通会员即可解锁全部棋谱演示</div>
            <slot name="unlock-btn">
              <button class="cbp-unlock-btn" @click="$emit('unlock')">立即开通</button>
            </slot>
          </div>
        </div>

        <svg class="cbp-board-svg" :width="BW" :height="BH" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" :width="BW" :height="BH" fill="#f0c060"/>
          <rect :x="PAD" :y="PAD" :width="CELL*8" :height="CELL*9" fill="#e8b84b"/>
          <rect :x="PAD" :y="PAD+4*CELL" :width="CELL*8" :height="CELL" fill="#d4a030"/>
          <rect :x="PAD" :y="PAD" :width="CELL*8" :height="CELL*9" fill="none" stroke="#6b3a00" stroke-width="2.5"/>
          <line v-for="r in 10" :key="'h'+r"
            :x1="PAD" :y1="PAD+(r-1)*CELL" :x2="PAD+CELL*8" :y2="PAD+(r-1)*CELL"
            stroke="#6b3a00" stroke-width="1"/>
          <line :x1="PAD" :y1="PAD" :x2="PAD" :y2="PAD+CELL*9" stroke="#6b3a00" stroke-width="1"/>
          <line :x1="PAD+CELL*8" :y1="PAD" :x2="PAD+CELL*8" :y2="PAD+CELL*9" stroke="#6b3a00" stroke-width="1"/>
          <line v-for="c in 7" :key="'vu'+c"
            :x1="PAD+c*CELL" :y1="PAD" :x2="PAD+c*CELL" :y2="PAD+4*CELL"
            stroke="#6b3a00" stroke-width="1"/>
          <line v-for="c in 7" :key="'vd'+c"
            :x1="PAD+c*CELL" :y1="PAD+5*CELL" :x2="PAD+c*CELL" :y2="PAD+9*CELL"
            stroke="#6b3a00" stroke-width="1"/>
          <line :x1="PAD+3*CELL" :y1="PAD" :x2="PAD+5*CELL" :y2="PAD+2*CELL" stroke="#6b3a00" stroke-width="1"/>
          <line :x1="PAD+5*CELL" :y1="PAD" :x2="PAD+3*CELL" :y2="PAD+2*CELL" stroke="#6b3a00" stroke-width="1"/>
          <line :x1="PAD+3*CELL" :y1="PAD+7*CELL" :x2="PAD+5*CELL" :y2="PAD+9*CELL" stroke="#6b3a00" stroke-width="1"/>
          <line :x1="PAD+5*CELL" :y1="PAD+7*CELL" :x2="PAD+3*CELL" :y2="PAD+9*CELL" stroke="#6b3a00" stroke-width="1"/>
          <text :x="PAD+CELL*1.5" :y="PAD+4*CELL+CELL*0.58+5"
            font-size="18" fill="#6b3a00" font-weight="bold"
            font-family="STKaiti,KaiTi,SimSun,serif" letter-spacing="10">楚  河</text>
          <text :x="PAD+CELL*4.4" :y="PAD+4*CELL+CELL*0.58+5"
            font-size="18" fill="#6b3a00" font-weight="bold"
            font-family="STKaiti,KaiTi,SimSun,serif" letter-spacing="10">漢  界</text>
          <g v-for="m in markPoints" :key="m.x+'-'+m.y" :transform="`translate(${m.x},${m.y})`">
            <line x1="-5" y1="-5" x2="-5" y2="-2" stroke="#6b3a00" stroke-width="1.2"/>
            <line x1="-5" y1="-5" x2="-2" y2="-5" stroke="#6b3a00" stroke-width="1.2"/>
            <line x1="5" y1="-5" x2="5" y2="-2" stroke="#6b3a00" stroke-width="1.2"/>
            <line x1="5" y1="-5" x2="2" y2="-5" stroke="#6b3a00" stroke-width="1.2"/>
            <line x1="-5" y1="5" x2="-5" y2="2" stroke="#6b3a00" stroke-width="1.2"/>
            <line x1="-5" y1="5" x2="-2" y2="5" stroke="#6b3a00" stroke-width="1.2"/>
            <line x1="5" y1="5" x2="5" y2="2" stroke="#6b3a00" stroke-width="1.2"/>
            <line x1="5" y1="5" x2="2" y2="5" stroke="#6b3a00" stroke-width="1.2"/>
          </g>
        </svg>

        <div class="cbp-pieces-layer" :style="{ width: BW+'px', height: BH+'px' }">
          <div
            v-for="item in pieceList"
            :key="item.key"
            class="cbp-piece"
            :class="item.isRed ? 'cbp-red' : 'cbp-black'"
            :style="pieceStyle(item.r, item.c)"
          >{{ item.piece }}</div>
        </div>
      </div>

      <!-- 操作按钮行 -->
      <div class="cbp-actions">
        <div class="cbp-act-row">
          <button class="cbp-act-btn" @click="resetBoard">开始</button>
          <button class="cbp-act-btn" @click="resetBoard">重置</button>
          <button class="cbp-act-btn" :class="{ active: autoPlaying }" @click="toggleAuto">
            {{ autoPlaying ? '⏹ 停止' : '▶ 自动' }}
          </button>
          <button v-if="showAiBtn" class="cbp-act-btn cbp-ai-btn" @click="$emit('ai-analysis')">AI 分析</button>
        </div>
        <div class="cbp-nav-row">
          <button class="cbp-ctrl-btn" @click="goToStart" title="跳至开局">|◀</button>
          <button class="cbp-ctrl-btn" @click="prevMove" title="上一步">◀</button>
          <span class="cbp-counter">{{ moveCounterText }}</span>
          <button class="cbp-ctrl-btn" @click="nextMove" title="下一步">▶</button>
          <button class="cbp-ctrl-btn" @click="goToEnd" title="跳至末局">▶|</button>
        </div>
      </div>
    </div>

    <!-- 棋步列表（可选） -->
    <div v-if="showMoveList && moves.length" class="cbp-move-list">
      <div class="cbp-block-label">棋步记录</div>
      <div class="cbp-moves-grid" ref="movesGrid">
        <div
          v-for="(move, idx) in moves"
          :key="idx"
          class="cbp-move-item"
          :class="{ active: idx + 1 === currentMoveIndex }"
          @click="currentMoveIndex = idx + 1"
        >
          <span class="cbp-move-num">{{ idx + 1 }}</span>
          <span>{{ move.notation || move }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const INITIAL_BOARD = [
  ['車','馬','象','士','將','士','象','馬','車'],
  ['','','','','','','','',''],
  ['','砲','','','','','','砲',''],
  ['卒','','卒','','卒','','卒','','卒'],
  ['','','','','','','','',''],
  ['','','','','','','','',''],
  ['兵','','兵','','兵','','兵','','兵'],
  ['','炮','','','','','','炮',''],
  ['','','','','','','','',''],
  ['俥','傌','相','仕','帅','仕','相','傌','俥']
]

const RED_PIECES = new Set(['帅','仕','相','俥','傌','炮','兵'])
const RED_SET    = new Set(['帅','仕','相','俥','傌','炮','兵'])

const ZH_COL = {'一':8,'二':7,'三':6,'四':5,'五':4,'六':3,'七':2,'八':1,'九':0}
const AR_COL = {'１':0,'２':1,'３':2,'４':3,'５':4,'６':5,'７':6,'８':7,'９':8,'1':0,'2':1,'3':2,'4':3,'5':4,'6':5,'7':6,'8':7,'9':8}
const ZH_NUM = {'一':1,'二':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9}
const AR_NUM = {'１':1,'２':2,'３':3,'４':4,'５':5,'６':6,'７':7,'８':8,'９':9,'1':1,'2':2,'3':3,'4':4,'5':5,'6':6,'7':7,'8':8,'9':9}

function applyNotation(board, notation) {
  const skip = new Set(['红胜','黑胜','和棋','红负','黑负'])
  if (!notation || skip.has(notation.trim())) return board
  const b = board.map(r => [...r])
  const n = notation.trim()
  let cursor = 0, prefix = null
  if ('前后中'.includes(n[0])) { prefix = n[0]; cursor = 1 }
  const pieceChar = n[cursor++], fileStr = n[cursor++], direction = n[cursor++], destStr = n[cursor]
  const isRed = RED_SET.has(pieceChar)
  const fromCol = prefix ? -1 : (isRed ? ZH_COL[fileStr] : AR_COL[fileStr])
  const candidates = []
  for (let r = 0; r < 10; r++)
    for (let c = 0; c < 9; c++)
      if (b[r][c] === pieceChar && (fromCol === -1 || c === fromCol)) candidates.push({ r, c })
  if (!candidates.length) return b
  candidates.sort((a, bb) => a.r - bb.r)
  let pick
  if (prefix === '前') pick = isRed ? candidates[0] : candidates[candidates.length - 1]
  else if (prefix === '后') pick = isRed ? candidates[candidates.length - 1] : candidates[0]
  else pick = isRed ? candidates.reduce((a, bb) => a.r > bb.r ? a : bb) : candidates[0]
  const fromRow = pick.r, actualFromCol = pick.c
  let toRow, toCol
  if (direction === '平') {
    toRow = fromRow; toCol = isRed ? ZH_COL[destStr] : AR_COL[destStr]
  } else {
    const isAdv = direction === '进'
    const isMa    = pieceChar === '傌' || pieceChar === '馬'
    const isXiang = pieceChar === '相' || pieceChar === '象'
    const isShi   = pieceChar === '仕' || pieceChar === '士'
    if (isMa) {
      toCol = isRed ? ZH_COL[destStr] : AR_COL[destStr]
      const cd = Math.abs(toCol - actualFromCol)
      toRow = isRed ? (isAdv ? fromRow - (cd===1?2:1) : fromRow + (cd===1?2:1))
                    : (isAdv ? fromRow + (cd===1?2:1) : fromRow - (cd===1?2:1))
    } else if (isXiang) {
      toCol = isRed ? ZH_COL[destStr] : AR_COL[destStr]
      toRow = isRed ? (isAdv ? fromRow-2 : fromRow+2) : (isAdv ? fromRow+2 : fromRow-2)
    } else if (isShi) {
      toCol = isRed ? ZH_COL[destStr] : AR_COL[destStr]
      toRow = isRed ? (isAdv ? fromRow-1 : fromRow+1) : (isAdv ? fromRow+1 : fromRow-1)
    } else {
      const steps = (isRed ? ZH_NUM[destStr] : AR_NUM[destStr]) || AR_NUM[destStr] || ZH_NUM[destStr]
      toCol = actualFromCol
      toRow = isRed ? (isAdv ? fromRow-steps : fromRow+steps) : (isAdv ? fromRow+steps : fromRow-steps)
    }
  }
  if (toRow >= 0 && toRow < 10 && toCol >= 0 && toCol < 9) {
    b[toRow][toCol] = b[fromRow][actualFromCol]
    b[fromRow][actualFromCol] = ''
  }
  return b
}

function buildBoardStates(moves) {
  const states = [JSON.parse(JSON.stringify(INITIAL_BOARD))]
  for (const m of moves) {
    const notation = typeof m === 'string' ? m : m.notation
    states.push(applyNotation(states[states.length - 1], notation))
  }
  return states
}

export default {
  name: 'ChessBoardPlayer',
  props: {
    moves: { type: Array, default: () => [] },
    locked: { type: Boolean, default: false },
    showMoveList: { type: Boolean, default: false },
    showAiBtn: { type: Boolean, default: true },
    autoInterval: { type: Number, default: 1000 }
  },
  data() {
    const CELL = 52, PAD = 28
    return {
      CELL, PAD,
      BW: PAD * 2 + CELL * 8,
      BH: PAD * 2 + CELL * 9,
      currentMoveIndex: 0,
      boardStates: [JSON.parse(JSON.stringify(INITIAL_BOARD))],
      autoPlaying: false,
      autoTimer: null
    }
  },
  computed: {
    board() {
      return this.boardStates[this.currentMoveIndex] || this.boardStates[0]
    },
    pieceList() {
      const list = []
      this.board.forEach((row, r) => {
        row.forEach((piece, c) => {
          if (piece) list.push({ piece, r, c, isRed: RED_PIECES.has(piece), key: `${r}-${c}-${piece}` })
        })
      })
      return list
    },
    markPoints() {
      const marks = [[2,1],[2,7],[7,1],[7,7],[3,0],[3,2],[3,4],[3,6],[3,8],[6,0],[6,2],[6,4],[6,6],[6,8]]
      return marks.map(([r, c]) => ({ x: this.PAD + c * this.CELL, y: this.PAD + r * this.CELL }))
    },
    moveCounterText() {
      if (this.currentMoveIndex === 0) return '初始局面'
      return `第 ${this.currentMoveIndex} / ${this.moves.length} 步`
    }
  },
  watch: {
    moves(newMoves) {
      this.boardStates = buildBoardStates(newMoves)
      this.currentMoveIndex = 0
    },
    currentMoveIndex() {
      this.$nextTick(() => {
        const grid = this.$refs.movesGrid
        if (!grid) return
        const active = grid.querySelector('.cbp-move-item.active')
        if (active) active.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      })
    }
  },
  mounted() {
    if (this.moves.length) {
      this.boardStates = buildBoardStates(this.moves)
    }
  },
  beforeDestroy() { this.stopAuto() },
  methods: {
    pieceStyle(r, c) {
      return { left: (this.PAD + c * this.CELL) + 'px', top: (this.PAD + r * this.CELL) + 'px' }
    },
    resetBoard() { this.stopAuto(); this.currentMoveIndex = 0 },
    prevMove() { if (this.currentMoveIndex > 0) this.currentMoveIndex-- },
    nextMove() { if (this.currentMoveIndex < this.moves.length) this.currentMoveIndex++ },
    goToStart() { this.stopAuto(); this.currentMoveIndex = 0 },
    goToEnd() { this.stopAuto(); this.currentMoveIndex = this.moves.length },
    toggleAuto() {
      if (this.autoPlaying) { this.stopAuto(); return }
      if (this.currentMoveIndex >= this.moves.length) this.currentMoveIndex = 0
      this.autoPlaying = true
      this.autoTimer = setInterval(() => {
        if (this.currentMoveIndex < this.moves.length) this.currentMoveIndex++
        else this.stopAuto()
      }, this.autoInterval)
    },
    stopAuto() {
      this.autoPlaying = false
      if (this.autoTimer) { clearInterval(this.autoTimer); this.autoTimer = null }
    }
  }
}
</script>

<style scoped>
.cbp-root { display: flex; gap: 0; align-items: flex-start; }

/* ── 棋盘面板 ── */
.cbp-board-panel { display: flex; flex-direction: column; align-items: flex-start; }

.cbp-board-wrap {
  position: relative; display: inline-block;
  border: 6px solid #8b4d00; border-radius: 4px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.28), inset 0 0 8px rgba(0,0,0,0.1);
}
.cbp-board-svg { display: block; }
.cbp-pieces-layer { position: absolute; top: 0; left: 0; pointer-events: none; }

.cbp-piece {
  position: absolute; width: 44px; height: 44px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; font-weight: 900;
  font-family: 'STKaiti','KaiTi','PingFang SC','Microsoft YaHei',sans-serif;
  transform: translate(-50%,-50%); cursor: pointer; pointer-events: all;
  transition: transform 0.12s, box-shadow 0.12s; user-select: none;
}
.cbp-piece:hover { transform: translate(-50%,-50%) scale(1.12); z-index: 10; }
.cbp-red {
  background: radial-gradient(circle at 38% 35%, #ffe8a0 0%, #f5c842 55%, #d4980a 100%);
  color: #c00018; border: 2.5px solid #c00018;
  box-shadow: inset 0 0 0 3px #f5c842, inset 0 0 0 5.5px #c00018, 0 3px 6px rgba(0,0,0,0.35);
}
.cbp-black {
  background: radial-gradient(circle at 38% 35%, #ffe8a0 0%, #f5c842 55%, #d4980a 100%);
  color: #111; border: 2.5px solid #222;
  box-shadow: inset 0 0 0 3px #f5c842, inset 0 0 0 5.5px #222, 0 3px 6px rgba(0,0,0,0.35);
}

/* VIP 遮罩 */
.cbp-vip-overlay {
  position: absolute; inset: 0; z-index: 20;
  background: rgba(240,192,96,0.92);
  display: flex; align-items: center; justify-content: center;
  border-radius: 4px;
}
.cbp-lock-content { text-align: center; }
.cbp-lock-title { font-size: 17px; font-weight: 700; color: #1a1a1a; margin-bottom: 6px; }
.cbp-lock-desc { font-size: 13px; color: #555; margin-bottom: 20px; }
.cbp-unlock-btn {
  padding: 10px 28px; background: #0084ff; color: #fff;
  border: none; border-radius: 3px; font-size: 14px; font-weight: 600; cursor: pointer;
}

/* 操作区 */
.cbp-actions { margin-top: 12px; display: flex; flex-direction: column; gap: 8px; }
.cbp-act-row { display: flex; gap: 8px; }
.cbp-act-btn {
  padding: 6px 16px; height: 32px;
  border: 1px solid #ddd; background: #fff;
  border-radius: 4px; font-size: 13px; color: #444;
  cursor: pointer; transition: all 0.15s; white-space: nowrap;
}
.cbp-act-btn:hover { border-color: #0084ff; color: #0084ff; background: #f0f7ff; }
.cbp-act-btn.active { background: #0084ff; color: #fff; border-color: #0084ff; }
.cbp-ai-btn { border-color: #0084ff; color: #0084ff; }
.cbp-ai-btn:hover { background: #0084ff; color: #fff; }

.cbp-nav-row { display: flex; align-items: center; gap: 6px; }
.cbp-ctrl-btn {
  width: 34px; height: 30px; border: 1px solid #ddd; background: #fff;
  border-radius: 4px; font-size: 12px; color: #555; cursor: pointer; transition: all 0.15s;
}
.cbp-ctrl-btn:hover { border-color: #0084ff; color: #0084ff; background: #f0f7ff; }
.cbp-counter { font-size: 12px; color: #888; min-width: 100px; text-align: center; }

/* 棋步列表 */
.cbp-move-list { margin-left: 20px; min-width: 160px; max-width: 200px; }
.cbp-block-label { font-size: 11px; font-weight: 700; color: #bbb; letter-spacing: 1px; margin-bottom: 8px; }
.cbp-moves-grid {
  display: grid; grid-template-columns: repeat(2, 1fr);
  gap: 2px; max-height: 440px; overflow-y: auto;
}
.cbp-move-item {
  display: flex; align-items: center; gap: 6px;
  padding: 5px 8px; border-radius: 3px;
  cursor: pointer; font-size: 12px; color: #555; transition: background 0.1s;
}
.cbp-move-item:hover { background: #f5f5f5; }
.cbp-move-item.active { background: #0084ff; color: #fff; }
.cbp-move-num { font-size: 10px; opacity: 0.5; min-width: 18px; }
</style>
