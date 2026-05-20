<template>
  <div class="manual-detail-page">
    <nav class="breadcrumb">
      <router-link to="/manuals">棋谱库</router-link>
      <span class="sep">/</span>
      <span>{{ book ? book.title : '加载中…' }}</span>
    </nav>

    <div v-if="!book" class="not-found">
      <div>棋谱不存在</div>
      <button class="back-btn" @click="$router.push('/manuals')">返回棋谱库</button>
    </div>

    <template v-else>
      <!-- 书头信息 -->
      <div class="book-header">
        <div class="book-meta-row">
          <span class="meta-dynasty">{{ book.dynasty }}</span>
          <span class="meta-sep">·</span>
          <span class="meta-author">{{ book.author }}</span>
          <span class="meta-diff" :class="'diff-' + book.difficulty">{{ diffLabel(book.difficulty) }}</span>
          <span v-for="label in book.labels" :key="label" class="label-tag">{{ label }}</span>
        </div>
        <h1 class="book-title">{{ book.title }}</h1>
        <p class="book-desc">{{ book.desc }}</p>
        <div class="game-total">共 {{ book.games.length }} 局</div>
      </div>

      <!-- 局目录 -->
      <div class="games-list">
        <div
          v-for="(game, idx) in book.games"
          :key="game.id"
          class="game-item"
          :class="{ expanded: activeGameId === game.id }"
        >
          <!-- 局标题行（点击展开/收起） -->
          <div class="game-row" @click="toggleGame(game.id)">
            <div class="game-row-left">
              <span class="game-index">{{ idx + 1 }}</span>
              <span class="game-title">{{ game.title }}</span>
            </div>
            <div class="game-row-right">
              <span class="game-diff" :class="'diff-' + game.difficulty">{{ diffLabel(game.difficulty) }}</span>
              <span class="game-moves-count">{{ game.moves.length }} 步</span>
              <span class="expand-icon">{{ activeGameId === game.id ? '▲' : '▼' }}</span>
            </div>
          </div>

          <!-- 展开：棋盘演示 -->
          <div v-if="activeGameId === game.id" class="game-demo">
            <chess-board-player
              :moves="game.moves"
              :show-move-list="true"
              :show-ai-btn="true"
              @ai-analysis="showAiTip"
            />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { MANUAL_BOOKS } from '../data/manualBooks.js'
import ChessBoardPlayer from '../components/ChessBoardPlayer.vue'

export default {
  name: 'ManualDetail',
  components: { ChessBoardPlayer },
  data() {
    return {
      book: null,
      activeGameId: null
    }
  },
  mounted() {
    const id = Number(this.$route.params.id)
    this.book = MANUAL_BOOKS.find(b => b.id === id) || null
  },
  methods: {
    diffLabel(d) {
      return ['', '入门', '初级', '中级', '高级', '大师'][d] || '—'
    },
    toggleGame(gameId) {
      this.activeGameId = this.activeGameId === gameId ? null : gameId
    },
    showAiTip() {
      this.$message({ message: 'AI 分析功能即将上线，敬请期待', type: 'info', duration: 2500 })
    }
  }
}
</script>

<style scoped>
.manual-detail-page { padding-bottom: 40px; }

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 20px 0 16px;
  font-size: 13px;
  color: #bbb;
}
.breadcrumb a { color: #bbb; }
.breadcrumb a:hover { color: #2a9fd6; }
.sep { color: #ddd; }

/* 书头 */
.book-header {
  padding: 24px 28px;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 0;
  margin-bottom: 16px;
}
.book-meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}
.meta-dynasty, .meta-author { font-size: 13px; color: #999; }
.meta-sep { color: #ddd; font-size: 12px; }
.meta-diff {
  font-size: 11px;
  padding: 1px 7px;
  border: 1px solid;
  white-space: nowrap;
}
.label-tag {
  font-size: 11px;
  padding: 1px 7px;
  background: #e8f4fb;
  color: #2a9fd6;
  border: 1px solid #b8dff2;
}
.book-title {
  font-size: 24px;
  font-weight: 800;
  color: #1a1a1a;
  margin-bottom: 10px;
  font-family: 'STKaiti', 'KaiTi', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}
.book-desc {
  font-size: 14px;
  color: #777;
  line-height: 1.8;
  margin-bottom: 12px;
}
.game-total { font-size: 12px; color: #bbb; }

/* 局列表 */
.games-list {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 0;
  overflow: hidden;
}

.game-item { border-bottom: 1px solid #f4f4f4; }
.game-item:last-child { border-bottom: none; }

.game-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  cursor: pointer;
  transition: background 0.12s;
  gap: 12px;
}
.game-row:hover { background: #fafafa; }
.game-item.expanded > .game-row { background: #f7f9ff; }

.game-row-left {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
}
.game-index {
  font-size: 13px;
  color: #bbb;
  font-weight: 500;
  min-width: 22px;
  text-align: right;
}
.game-title {
  font-size: 15px;
  font-weight: 500;
  color: #1a1a1a;
}
.game-item.expanded .game-title { color: #2a9fd6; }

.game-row-right {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-shrink: 0;
}
.game-diff {
  font-size: 11px;
  padding: 1px 7px;
  border: 1px solid;
  white-space: nowrap;
}
.game-moves-count { font-size: 12px; color: #bbb; min-width: 30px; text-align: right; }

.diff-1 { color: #52b26b; border-color: #c3e8cc; background: #f0faf2; }
.diff-2 { color: #2a9fd6; border-color: #b8dff2; background: #e8f4fb; }
.diff-3 { color: #e6a817; border-color: #f5dfa0; background: #fdf8e8; }
.diff-4 { color: #e07b2a; border-color: #f5ceac; background: #fdf2e8; }
.diff-5 { color: #c0392b; border-color: #f5b8b2; background: #fdf0ef; }
.expand-icon { font-size: 10px; color: #ccc; width: 14px; text-align: center; }

/* 展开的演示区 */
.game-demo {
  padding: 24px 28px 28px;
  border-top: 1px solid #f0f0f0;
  background: #fafbff;
}

.not-found { text-align: center; padding: 80px; color: #bbb; font-size: 14px; }
.back-btn {
  margin-top: 16px;
  padding: 8px 24px;
  border: 1px solid #ddd;
  border-radius: 0;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
  color: #555;
}
</style>

