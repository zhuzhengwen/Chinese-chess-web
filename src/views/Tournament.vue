<template>
  <div class="tournament-page">
    <div class="toolbar">
      <div class="search-bar">
        <input v-model="keyword" type="text" placeholder="搜索赛事名称、地点…" class="search-input" @input="page = 1; expanded = null" />
        <button v-if="keyword" class="clear-btn" @click="keyword = ''; page = 1">✕</button>
      </div>
      <div class="year-tabs">
        <button
          v-for="y in years" :key="y"
          :class="['year-tab', { active: selectedYear === y }]"
          @click="selectedYear = y"
        >{{ y === 'all' ? '全部' : y }}</button>
      </div>
    </div>

    <div v-if="loading" class="loading-tip">加载中…</div>
    <div v-else class="list-wrap">
      <div
        v-for="t in pagedList"
        :key="t.id"
        class="t-item"
        :class="{ expanded: expanded === t.id }"
      >
        <!-- 赛事行 -->
        <div class="t-row" @click="toggleExpand(t.id)">
          <div class="row-left">
            <span class="year-badge">{{ t.year }}</span>
            <span class="t-name">{{ t.name }}</span>
          </div>
          <div class="row-right">
            <span class="t-location">{{ t.location }}</span>
            <span class="t-champion" v-if="t.champion">
              <span class="champion-icon">冠</span>{{ t.champion }}
            </span>
            <span class="t-game-count">{{ t.games.length }} 局</span>
            <span class="expand-icon">{{ expanded === t.id ? '▲' : '▼' }}</span>
          </div>
        </div>

        <!-- 展开：对局列表 -->
        <div v-if="expanded === t.id" class="t-games">
          <div class="games-head">
            <span class="col-round">轮次</span>
            <span class="col-players">对阵</span>
            <span class="col-opening">开局</span>
            <span class="col-date">日期</span>
            <span class="col-action"></span>
          </div>
          <div
            v-for="game in t.games"
            :key="game.id"
            class="game-row"
            @click.stop="$router.push('/tournaments/game/' + game.id)"
          >
            <span class="col-round">{{ game.round }}</span>
            <span class="col-players">
              <span class="red-name">{{ game.redPlayer }}</span>
              <span class="result-tag" :class="'result-' + game.result">{{ resultLabel(game.result) }}</span>
              <span class="black-name">{{ game.blackPlayer }}</span>
            </span>
            <span class="col-opening">{{ game.opening || '—' }}</span>
            <span class="col-date">{{ game.date || '—' }}</span>
            <span class="col-action">查看棋谱 ›</span>
          </div>
        </div>
      </div>

      <div v-if="!filteredList.length" class="empty-tip">暂无赛事记录</div>
    </div>

    <div class="pagination-wrap">
      <span class="total-count">共 {{ filteredList.length }} 项<template v-if="keyword"> · 搜索"{{ keyword }}"</template></span>
      <template v-if="filteredList.length > pageSize">
        <button class="page-btn" :disabled="page === 1" @click="page--">‹ 上一页</button>
        <span class="page-info">{{ page }} / {{ totalPages }}</span>
        <button class="page-btn" :disabled="page === totalPages" @click="page++">下一页 ›</button>
      </template>
    </div>
  </div>
</template>

<script>
import { tournaments } from '../api/index'
export default {
  name: 'TournamentPage',
  data() {
    return {
      list: [], loading: false, expanded: null,
      keyword: '',
      selectedYear: 'all',
      years: ['all', '2024', '2023', '2022', '2021', '2020'],
      page: 1, pageSize: 20
    }
  },
  computed: {
    filteredList() {
      let res = this.selectedYear === 'all' ? this.list : this.list.filter(t => String(t.year) === String(this.selectedYear))
      const kw = this.keyword.trim().toLowerCase()
      if (kw) res = res.filter(t => t.name.toLowerCase().includes(kw) || (t.location && t.location.includes(kw)))
      return res
    },
    totalPages() { return Math.max(1, Math.ceil(this.filteredList.length / this.pageSize)) },
    pagedList() {
      const s = (this.page - 1) * this.pageSize
      return this.filteredList.slice(s, s + this.pageSize)
    }
  },
  watch: {
    selectedYear() { this.page = 1; this.expanded = null }
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
            location: '广东广州', champion: '王天一',
            games: [
              { id: 1, round: '第1轮', redPlayer: '王天一', blackPlayer: '谢靖', result: 'red', opening: '顺炮直车', date: '2024-07-15' },
              { id: 2, round: '第2轮', redPlayer: '郑惟桐', blackPlayer: '王天一', result: 'black', opening: '当头炮', date: '2024-07-16' },
              { id: 3, round: '决赛', redPlayer: '王天一', blackPlayer: '谢靖', result: 'draw', opening: '飞象局', date: '2024-07-28' }
            ]
          },
          {
            id: 2, name: '象棋甲级联赛 2024 赛季', year: '2024',
            location: '全国各地', champion: '广东恒大队',
            games: [
              { id: 4, round: '第1轮', redPlayer: '许银川', blackPlayer: '王天一', result: 'draw', opening: '屏风马', date: '2024-03-01' },
              { id: 5, round: '第8轮', redPlayer: '谢靖', blackPlayer: '郑惟桐', result: 'red', opening: '反宫马', date: '2024-05-10' }
            ]
          },
          {
            id: 3, name: '全国象棋团体赛 2023', year: '2023',
            location: '浙江杭州', champion: '广东队',
            games: [
              { id: 6, round: '半决赛', redPlayer: '王天一', blackPlayer: '许银川', result: 'red', opening: '中炮对屏风马', date: '2023-09-15' },
              { id: 7, round: '决赛', redPlayer: '谢靖', blackPlayer: '王天一', result: 'draw', opening: '当头炮进三兵', date: '2023-09-20' }
            ]
          },
          {
            id: 4, name: '第三十九届全国象棋个人赛', year: '2023',
            location: '江苏扬州', champion: '谢靖',
            games: [
              { id: 8, round: '第1轮', redPlayer: '谢靖', blackPlayer: '汪洋', result: 'red', opening: '顺炮', date: '2023-07-12' },
              { id: 9, round: '决赛', redPlayer: '谢靖', blackPlayer: '郑惟桐', result: 'red', opening: '仙人指路', date: '2023-07-25' }
            ]
          },
          {
            id: 5, name: '全国象棋团体赛 2022', year: '2022',
            location: '河南郑州', champion: '上海队',
            games: [
              { id: 10, round: '小组赛', redPlayer: '王天一', blackPlayer: '卜凤波', result: 'red', opening: '顺炮', date: '2022-10-06' },
              { id: 11, round: '决赛', redPlayer: '许银川', blackPlayer: '谢靖', result: 'draw', opening: '屏风马', date: '2022-10-15' }
            ]
          }
        ]
      } finally { this.loading = false }
    },
    toggleExpand(id) { this.expanded = this.expanded === id ? null : id },
    resultLabel(r) { return { red: '红胜', black: '黑胜', draw: '和棋' }[r] || r }
  }
}
</script>

<style scoped>
.tournament-page { display: flex; flex-direction: column; gap: 0; padding-bottom: 40px; }

/* 工具栏 */
.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.search-bar { position: relative; flex: 1; min-width: 160px; max-width: 280px; }
.search-input {
  width: 100%;
  height: 38px;
  padding: 0 32px 0 12px;
  font-size: 14px;
  color: #333;
  border: 1px solid #d6eaf5;
  background: #fff;
  outline: none;
  transition: border-color 0.15s;
}
.search-input:focus { border-color: #2a9fd6; }
.search-input::placeholder { color: #ccc; }
.clear-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #bbb;
  cursor: pointer;
  font-size: 13px;
  padding: 0;
}
.clear-btn:hover { color: #888; }

.year-tabs { display: flex; overflow: hidden; border: 1px solid #d6eaf5; }
.year-tab {
  padding: 0 14px;
  height: 38px;
  font-size: 12px;
  color: #999;
  cursor: pointer;
  border: none;
  background: #fff;
  transition: all 0.12s;
}
.year-tab + .year-tab { border-left: 1px solid #d6eaf5; }
.year-tab:hover:not(.active) { background: #e8f4fb; color: #2a9fd6; }
.year-tab.active { background: #2a9fd6; color: #fff; font-weight: 600; }

.loading-tip { color: #bbb; font-size: 14px; padding: 60px; text-align: center; background: #fff; border: 1px solid #e8e8e8; border-radius: 0; }
.empty-tip { color: #ccc; font-size: 14px; padding: 60px; text-align: center; }

.list-wrap {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 0;
  overflow: hidden;
}

.t-item { border-bottom: 1px solid #f4f4f4; }
.t-item:last-child { border-bottom: none; }

.t-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  cursor: pointer;
  transition: background 0.12s;
  gap: 16px;
}
.t-row:hover { background: #fafafa; }
.t-item.expanded > .t-row { background: #f7f9ff; }

.row-left { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }

.year-badge {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 700;
  color: #2a9fd6;
  background: #e8f4ff;
  border: 1px solid #b8d8f8;
  padding: 2px 8px;
  border-radius: 0;
}
.t-name {
  font-size: 15px;
  font-weight: 600;
  color: #888;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.12s;
}
.t-item.expanded .t-name { color: #2a9fd6; }

.row-right { display: flex; align-items: center; gap: 18px; flex-shrink: 0; }
.t-location { font-size: 12px; color: #aaa; }
.t-champion { display: flex; align-items: center; gap: 5px; font-size: 13px; color: #8B6914; }
.champion-icon {
  font-size: 10px; font-weight: 700; color: #fff;
  background: #c8960c; width: 16px; height: 16px;
  border-radius: 0; display: inline-flex; align-items: center; justify-content: center;
}
.t-game-count { font-size: 12px; color: #bbb; min-width: 28px; text-align: right; }
.expand-icon { font-size: 10px; color: #ccc; width: 14px; text-align: center; }

.t-games { border-top: 1px solid #f0f0f0; }
.games-head {
  display: flex; align-items: center;
  padding: 8px 20px;
  font-size: 11px; font-weight: 600; color: #bbb; letter-spacing: 0.5px;
  background: #f8f9fc; border-bottom: 1px solid #f0f0f0;
}
.game-row {
  display: flex; align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid #f8f8f8;
  cursor: pointer; font-size: 13px; transition: background 0.1s;
}
.game-row:last-child { border-bottom: none; }
.game-row:hover { background: #f5f7ff; }

.col-round { width: 60px; flex-shrink: 0; font-size: 12px; color: #aaa; }
.col-players { flex: 1; display: flex; align-items: center; gap: 8px; }
.red-name { color: #c00018; font-weight: 600; }
.black-name { color: #1a1a1a; font-weight: 600; }
.col-opening { width: 120px; flex-shrink: 0; font-size: 12px; color: #999; }
.col-date { width: 90px; flex-shrink: 0; font-size: 12px; color: #bbb; }
.col-action { width: 68px; flex-shrink: 0; font-size: 12px; color: #2a9fd6; text-align: right; opacity: 0; transition: opacity 0.1s; }
.game-row:hover .col-action { opacity: 1; }

.result-tag { display: inline-block; font-size: 11px; padding: 1px 7px; border-radius: 0; font-weight: 500; white-space: nowrap; }
.result-red   { background: #fff1f0; color: #cf1322; border: 1px solid #ffa39e; }
.result-black { background: #f5f5f5; color: #333;    border: 1px solid #d9d9d9; }
.result-draw  { background: #e6f7ff; color: #006ecc; border: 1px solid #91caff; }

.pagination-wrap {
  display: flex; align-items: center;
  gap: 16px; padding: 16px 0 4px;
}
.total-count { font-size: 13px; color: #bbb; margin-right: auto; }
.page-btn {
  padding: 6px 16px; border: 1px solid #e0e0e0; border-radius: 0;
  background: #fff; font-size: 13px; color: #555; cursor: pointer; transition: all 0.15s;
}
.page-btn:hover:not(:disabled) { border-color: #2a9fd6; color: #2a9fd6; }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.page-info { font-size: 13px; color: #999; }
</style>

