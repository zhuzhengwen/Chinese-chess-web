<template>
  <div class="tournament-page">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">赛事</h1>
      </div>

      <!-- 年份筛选 -->
      <div class="year-tabs">
        <span
          v-for="y in years"
          :key="y"
          class="year-tab"
          :class="{ active: selectedYear === y }"
          @click="selectedYear = y; filterTournaments()"
        >{{ y === 'all' ? '全部' : y }}</span>
      </div>

      <div v-if="loading" class="loading-tip">加载中…</div>
      <div v-else>
        <div
          v-for="t in filteredList"
          :key="t.id"
          class="tournament-card"
          :class="{ expanded: expanded === t.id }"
        >
          <div class="t-header" @click="toggleExpand(t.id)">
            <div class="t-seal">{{ t.year }}</div>
            <div class="t-info">
              <div class="t-name">{{ t.name }}</div>
              <div class="t-meta">
                <span class="t-date">{{ t.dateRange }}</span>
                <span class="t-sep">·</span>
                <span class="t-location">{{ t.location }}</span>
                <span class="t-sep">·</span>
                <span class="t-count">{{ t.games ? t.games.length : 0 }} 局</span>
              </div>
            </div>
            <div class="t-champion" v-if="t.champion">
              <span class="champion-label">冠军</span>
              <span class="champion-name">{{ t.champion }}</span>
            </div>
            <span class="t-toggle">{{ expanded === t.id ? '收起 ▲' : '展开 ▼' }}</span>
          </div>

          <div v-if="expanded === t.id" class="t-games">
            <div class="games-head">
              <span class="col-round">轮次</span>
              <span class="col-red">红方</span>
              <span class="col-result">结果</span>
              <span class="col-black">黑方</span>
              <span class="col-opening">开局</span>
              <span class="col-action"></span>
            </div>
            <div
              v-for="game in t.games"
              :key="game.id"
              class="game-row"
              @click="$router.push('/manuals/' + game.manualId)"
            >
              <span class="col-round">{{ game.round }}</span>
              <span class="col-red">{{ game.redPlayer }}</span>
              <span class="col-result">
                <span class="result-tag" :class="'result-' + game.result">{{ resultLabel(game.result) }}</span>
              </span>
              <span class="col-black">{{ game.blackPlayer }}</span>
              <span class="col-opening">{{ game.opening }}</span>
              <span class="col-action">查看棋谱 ›</span>
            </div>
          </div>
        </div>

        <div v-if="!filteredList.length" class="empty-tip">暂无赛事记录</div>
      </div>
    </div>
  </div>
</template>

<script>
import { tournaments } from '../api/index'
export default {
  name: 'TournamentPage',
  data() {
    return {
      list: [], loading: false, expanded: null, selectedYear: 'all',
      years: ['all', '2024', '2023', '2022', '2021', '2020']
    }
  },
  computed: {
    filteredList() {
      if (this.selectedYear === 'all') return this.list
      return this.list.filter(t => String(t.year) === String(this.selectedYear))
    }
  },
  mounted() { this.fetchList() },
  methods: {
    async fetchList() {
      this.loading = true
      try {
        const res = await tournaments.getList()
        this.list = res.data || res || []
      } catch (e) {
        this.list = [
          {
            id: 1, name: '第四十届全国象棋个人赛', year: '2024',
            dateRange: '2024-07-15 ~ 07-28', location: '广东广州', champion: '王天一',
            games: [
              { id: 1, round: '第1轮', redPlayer: '王天一', blackPlayer: '谢靖', result: 'red', opening: '顺炮直车', manualId: 1 },
              { id: 2, round: '第2轮', redPlayer: '郑惟桐', blackPlayer: '王天一', result: 'black', opening: '当头炮', manualId: 2 },
              { id: 3, round: '决赛', redPlayer: '王天一', blackPlayer: '谢靖', result: 'draw', opening: '飞象局', manualId: 3 }
            ]
          },
          {
            id: 2, name: '象棋甲级联赛 2024 赛季', year: '2024',
            dateRange: '2024-03-01 ~ 11-30', location: '全国各地', champion: '广东恒大队',
            games: [
              { id: 4, round: '第1轮', redPlayer: '许银川', blackPlayer: '王天一', result: 'draw', opening: '屏风马', manualId: 4 },
              { id: 5, round: '第8轮', redPlayer: '谢靖', blackPlayer: '郑惟桐', result: 'red', opening: '反宫马', manualId: 5 }
            ]
          },
          {
            id: 3, name: '全国象棋团体赛 2023', year: '2023',
            dateRange: '2023-09-10 ~ 09-20', location: '浙江杭州', champion: '广东队',
            games: [
              { id: 6, round: '半决赛', redPlayer: '王天一', blackPlayer: '许银川', result: 'red', opening: '中炮对屏风马', manualId: 1 },
              { id: 7, round: '决赛', redPlayer: '谢靖', blackPlayer: '王天一', result: 'draw', opening: '当头炮进三兵', manualId: 2 }
            ]
          },
          {
            id: 4, name: '第三十九届全国象棋个人赛', year: '2023',
            dateRange: '2023-07-12 ~ 07-25', location: '江苏扬州', champion: '谢靖',
            games: [
              { id: 8, round: '第1轮', redPlayer: '谢靖', blackPlayer: '汪洋', result: 'red', opening: '顺炮', manualId: 3 },
              { id: 9, round: '决赛', redPlayer: '谢靖', blackPlayer: '郑惟桐', result: 'red', opening: '仙人指路', manualId: 4 }
            ]
          }
        ]
      } finally { this.loading = false }
    },
    filterTournaments() {},
    toggleExpand(id) { this.expanded = this.expanded === id ? null : id },
    resultLabel(r) {
      return { red: '红胜', black: '黑胜', draw: '和棋' }[r] || r
    }
  }
}
</script>

<style scoped>
.tournament-page { background: #f5f6f8; min-height: calc(100vh - 56px); padding-bottom: 60px; }
.container { max-width: 1100px; margin: 0 auto; padding: 0 32px; }

.page-header { padding: 28px 0 20px; }
.page-title { font-size: 22px; font-weight: 700; color: #1a1a1a; letter-spacing: 2px; }

/* 年份筛选 — 胶囊形 */
.year-tabs { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
.year-tab { padding: 5px 18px; font-size: 13px; color: #555; cursor: pointer; border-radius: 20px; background: #fff; border: 1px solid #e8e8e8; transition: all 0.15s; box-shadow: 0 1px 3px rgba(0,0,0,.04); }
.year-tab:hover { border-color: #8B1A1A; color: #8B1A1A; }
.year-tab.active { background: #8B1A1A; color: #fff; border-color: #8B1A1A; font-weight: 600; }

.loading-tip { color: #bbb; font-size: 14px; padding: 60px; text-align: center; background: #fff; border-radius: 6px; }
.empty-tip { color: #ccc; font-size: 14px; padding: 60px; text-align: center; background: #fff; border-radius: 6px; }

/* 赛事卡片 */
.tournament-card { background: #fff; margin-bottom: 10px; overflow: hidden; border-radius: 6px; box-shadow: 0 1px 4px rgba(0,0,0,.06); transition: box-shadow 0.15s; }
.tournament-card.expanded { box-shadow: 0 4px 16px rgba(0,0,0,.1); }

.t-header { display: flex; align-items: center; gap: 16px; padding: 16px 20px; cursor: pointer; transition: background 0.12s; border-left: 3px solid transparent; }
.t-header:hover { background: #fdf8f8; border-left-color: #e8c8c8; }
.tournament-card.expanded .t-header { border-left-color: #8B1A1A; background: #fdf8f8; }

/* 年份印章 */
.t-seal {
  width: 48px; height: 48px;
  border-radius: 4px;
  background: linear-gradient(135deg, #8B1A1A 0%, #6e1515 100%);
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; color: #fff;
  flex-shrink: 0; letter-spacing: 0.5px;
  box-shadow: 0 2px 6px rgba(139,26,26,.3);
}

.t-info { flex: 1; }
.t-name { font-size: 15px; font-weight: 600; color: #1a1a1a; margin-bottom: 5px; }
.t-meta { display: flex; align-items: center; gap: 6px; font-size: 12px; flex-wrap: wrap; }
.t-sep { color: #ddd; }
.t-date { color: #888; }
.t-location { color: #888; }
.t-count { color: #8B1A1A; font-weight: 500; }

/* 冠军标签 */
.t-champion { display: flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 20px; background: linear-gradient(90deg, #fff8e6, #fff3d0); border: 1px solid #f0d080; }
.champion-label { font-size: 10px; color: #b8860b; }
.champion-name { font-size: 13px; font-weight: 700; color: #8B6914; }

.t-toggle { font-size: 12px; color: #bbb; flex-shrink: 0; white-space: nowrap; transition: color 0.15s; }
.tournament-card.expanded .t-toggle { color: #8B1A1A; }

/* 对局展开区 */
.t-games { border-top: 1px solid #f5f0f0; }
.games-head { display: flex; align-items: center; padding: 8px 20px; font-size: 11px; font-weight: 600; color: #bbb; letter-spacing: 0.5px; background: #fdf8f8; border-bottom: 1px solid #f5f0f0; }
.game-row { display: flex; align-items: center; padding: 12px 20px; border-bottom: 1px solid #f8f4f4; cursor: pointer; font-size: 13px; transition: background 0.1s; }
.game-row:last-child { border-bottom: none; }
.game-row:hover { background: #fdf4f4; }

.col-round { width: 64px; flex-shrink: 0; color: #aaa; font-size: 12px; }
.col-red { flex: 1; color: #c0392b; font-weight: 600; }
.col-result { width: 68px; flex-shrink: 0; text-align: center; }
.col-black { flex: 1; color: #1a1a1a; font-weight: 600; }
.col-opening { flex: 1.5; color: #999; font-size: 12px; }
.col-action { width: 70px; flex-shrink: 0; font-size: 12px; color: #8B1A1A; text-align: right; opacity: 0; transition: opacity 0.1s; }
.game-row:hover .col-action { opacity: 1; }

/* 结果标签 三色 */
.result-tag { display: inline-block; font-size: 11px; padding: 2px 8px; border-radius: 10px; font-weight: 500; }
.result-red   { background: #fff1f0; color: #cf1322; border: 1px solid #ffa39e; }
.result-black { background: #f5f5f5; color: #333;    border: 1px solid #d9d9d9; }
.result-draw  { background: #e6f7ff; color: #0958d9; border: 1px solid #91caff; }
</style>
