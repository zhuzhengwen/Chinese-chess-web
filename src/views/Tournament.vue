<template>
  <div class="tournament-page">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">赛事</h1>
        <p class="page-desc">历届象棋赛事对局记录，见证棋道荣耀时刻</p>
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
                <span class="result-tag">{{ resultLabel(game.result) }}</span>
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
.tournament-page { background: #fff; min-height: calc(100vh - 56px); padding-bottom: 60px; }
.container { max-width: 1100px; margin: 0 auto; padding: 0 32px; }

.page-header { padding: 36px 0 24px; border-bottom: 1px solid #e8e8e8; margin-bottom: 24px; }
.page-title { font-size: 22px; font-weight: 700; color: #1a1a1a; margin-bottom: 4px; font-family: 'STKaiti','KaiTi',serif; letter-spacing: 2px; }
.page-desc { font-size: 13px; color: #aaa; }

.year-tabs { display: flex; gap: 0; margin-bottom: 24px; border-bottom: 1px solid #e8e8e8; flex-wrap: wrap; }
.year-tab { padding: 7px 16px; font-size: 13px; color: #888; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -1px; transition: color 0.15s; }
.year-tab:hover { color: #333; }
.year-tab.active { color: #1a1a1a; font-weight: 600; border-bottom-color: #1a1a1a; }

.loading-tip { color: #bbb; font-size: 14px; padding: 60px; text-align: center; }
.empty-tip { color: #ccc; font-size: 14px; padding: 60px; text-align: center; }

.tournament-card { border: 1px solid #e8e8e8; border-radius: 4px; background: #fff; margin-bottom: 10px; overflow: hidden; }

.t-header { display: flex; align-items: center; gap: 16px; padding: 16px 20px; cursor: pointer; transition: background 0.1s; }
.t-header:hover { background: #f5f5f5; }

.t-seal { width: 44px; height: 44px; border: 1px solid #e8e8e8; border-radius: 3px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #555; flex-shrink: 0; font-family: 'STKaiti','KaiTi',serif; background: #fafafa; }

.t-info { flex: 1; }
.t-name { font-size: 15px; font-weight: 600; color: #1a1a1a; margin-bottom: 4px; }
.t-meta { display: flex; align-items: center; gap: 4px; font-size: 12px; color: #aaa; }
.t-sep { color: #ddd; }
.t-date, .t-location { color: #888; }
.t-count { color: #666; }

.t-champion { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 6px 12px; border: 1px solid #e8e8e8; border-radius: 2px; background: #fafafa; }
.champion-label { font-size: 10px; color: #aaa; }
.champion-name { font-size: 13px; font-weight: 600; color: #333; font-family: 'STKaiti','KaiTi',serif; }

.t-toggle { font-size: 12px; color: #bbb; flex-shrink: 0; white-space: nowrap; }

.t-games { border-top: 1px solid #f0f0f0; background: #fafafa; }
.games-head { display: flex; align-items: center; padding: 8px 20px; font-size: 11px; font-weight: 600; color: #bbb; letter-spacing: 0.5px; border-bottom: 1px solid #f0f0f0; }
.game-row { display: flex; align-items: center; padding: 11px 20px; border-bottom: 1px solid #f0f0f0; cursor: pointer; font-size: 13px; transition: background 0.1s; }
.game-row:last-child { border-bottom: none; }
.game-row:hover { background: #f0f0f0; }

.col-round { width: 60px; flex-shrink: 0; color: #aaa; font-size: 12px; }
.col-red { flex: 1; color: #333; font-weight: 500; }
.col-result { width: 70px; flex-shrink: 0; text-align: center; }
.col-black { flex: 1; color: #333; font-weight: 500; }
.col-opening { flex: 1.5; color: #888; font-size: 12px; }
.col-action { width: 70px; flex-shrink: 0; font-size: 12px; color: #888; text-align: right; }

.result-tag { display: inline-block; font-size: 11px; padding: 2px 7px; border-radius: 2px; color: #555; background: #efefef; }
</style>
