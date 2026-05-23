<template>
  <div class="tgame-page">
    <!-- 面包屑 -->
    <nav class="breadcrumb">
      <router-link to="/tournaments">赛事</router-link>
      <span class="sep">/</span>
      <span class="bc-tournament" @click="$router.push('/tournaments')" style="cursor:pointer">
        {{ gameInfo ? gameInfo.tournamentName : '…' }}
      </span>
      <span class="sep">/</span>
      <span>{{ gameInfo ? gameInfo.round : '对局详情' }}</span>
    </nav>

    <div v-if="!gameInfo" class="loading-tip">加载中…</div>
    <div v-else class="detail-layout">

      <!-- 左侧信息 -->
      <div class="info-panel">
        <!-- 对局信息卡 -->
        <div class="game-info-card">
          <div class="tournament-badge">{{ gameInfo.tournamentName }}</div>
          <div class="round-label">{{ gameInfo.round }}</div>

          <div class="players-block">
            <div class="player red-player">
              <div class="player-side">红方</div>
              <div class="player-name">{{ gameInfo.redPlayer }}</div>
            </div>
            <div class="result-center">
              <span class="result-tag" :class="'result-' + gameInfo.result">
                {{ resultLabel(gameInfo.result) }}
              </span>
            </div>
            <div class="player black-player">
              <div class="player-side">黑方</div>
              <div class="player-name">{{ gameInfo.blackPlayer }}</div>
            </div>
          </div>

          <div class="game-meta">
            <span v-if="gameInfo.opening" class="meta-item">开局：{{ gameInfo.opening }}</span>
            <span v-if="gameInfo.date" class="meta-item">日期：{{ gameInfo.date }}</span>
          </div>
        </div>

        <!-- 步数 -->
        <div class="moves-count" v-if="moves.length">共 {{ moves.length }} 步棋</div>
      </div>

      <!-- 右侧棋盘 -->
      <div class="board-panel">
        <chess-board-player
          :moves="moves"
          :show-move-list="true"
          :show-ai-btn="true"
          @ai-analysis="showAiAnalysis"
        />
      </div>
    </div>
  </div>
</template>

<script>
import ChessBoardPlayer from '../components/ChessBoardPlayer.vue'
import { tournaments } from '../api/index'

export default {
  name: 'TournamentGame',
  components: { ChessBoardPlayer },
  data() {
    return {
      gameInfo: null,
      moves: []
    }
  },
  mounted() { this.loadGame() },
  methods: {
    async loadGame() {
      const gameId = Number(this.$route.params.gameId)
      try {
        const res = await tournaments.getGame(gameId)
        const data = res.data || res
        if (data && data.gameInfo) {
          this.gameInfo = data.gameInfo
          this.moves = data.moves || []
        }
      } catch (e) {
        this.gameInfo = null
      }
    },
    resultLabel(r) {
      return { red: '红胜', black: '黑胜', draw: '和棋' }[r] || r
    },
    showAiAnalysis() {
      this.$message({ message: 'AI 分析功能即将上线，敬请期待', type: 'info', duration: 2500 })
    }
  }
}
</script>

<style scoped>
.tgame-page { padding-bottom: 40px; }

.breadcrumb { display: flex; align-items: center; gap: 6px; padding: 16px 0 20px; font-size: 13px; color: #bbb; }
.breadcrumb a { color: #bbb; }
.breadcrumb a:hover, .bc-tournament:hover { color: #2a9fd6; }
.sep { color: #ddd; }

.loading-tip { color: #bbb; padding: 60px; text-align: center; }

.detail-layout { display: flex; gap: 40px; align-items: flex-start; }

/* ── 左侧信息 ── */
.info-panel { flex: 0 0 280px; display: flex; flex-direction: column; gap: 16px; }

.game-info-card {
  background: #fff; border: 1px solid #e4e4e4; border-radius: 0;
  padding: 18px 16px;
}
.tournament-badge {
  font-size: 11px; color: #2a9fd6; font-weight: 600;
  background: #e8f4ff; padding: 2px 8px; border-radius: 0;
  display: inline-block; margin-bottom: 8px;
}
.round-label { font-size: 16px; font-weight: 700; color: #111; margin-bottom: 14px; }

.players-block {
  display: flex; align-items: center; justify-content: space-between;
  background: #f8f8f8; border-radius: 0; padding: 12px 10px; margin-bottom: 12px;
}
.player { text-align: center; flex: 1; }
.player-side { font-size: 11px; color: #aaa; margin-bottom: 4px; }
.red-player .player-name { font-size: 15px; font-weight: 700; color: #c00018; }
.black-player .player-name { font-size: 15px; font-weight: 700; color: #1a1a1a; }
.result-center { flex-shrink: 0; padding: 0 8px; }
.result-tag { display: inline-block; font-size: 12px; padding: 4px 10px; border-radius: 0; font-weight: 600; }
.result-red   { background: #fff1f0; color: #cf1322; border: 1px solid #ffa39e; }
.result-black { background: #f5f5f5; color: #333;    border: 1px solid #d9d9d9; }
.result-draw  { background: #e6f7ff; color: #006ecc; border: 1px solid #91caff; }

.game-meta { display: flex; flex-direction: column; gap: 4px; }
.meta-item { font-size: 12px; color: #888; }

.moves-count { font-size: 12px; color: #bbb; }

/* ── 棋盘 ── */
.board-panel { flex: 1; display: flex; flex-direction: column; align-items: flex-start; }

@media (max-width: 960px) {
  .detail-layout { flex-direction: column; }
  .info-panel { flex: none; width: 100%; }
}
</style>

