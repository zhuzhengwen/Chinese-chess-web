<template>
  <div class="player-page">

    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="search-bar">
        <input v-model="keyword" type="text" placeholder="搜索棋手姓名、称号…" class="search-input" @input="activeId = null" />
        <button v-if="keyword" class="clear-btn" @click="keyword = ''; activeId = null">✕</button>
      </div>
      <div class="era-tabs">
        <button
          v-for="e in eras" :key="e.val"
          :class="['era-tab', { active: selectedEra === e.val }]"
          @click="selectedEra = e.val; activeId = null"
        >{{ e.label }}</button>
      </div>
    </div>

    <!-- 列表 -->
    <div class="list-wrap">
      <div
        v-for="player in filteredList"
        :key="player.id"
        class="player-item"
        :class="{ expanded: activeId === player.id }"
      >
        <div class="player-row" @click="toggleItem(player.id)">
          <div class="row-left">
            <span class="player-name">{{ player.name }}</span>
            <span v-if="player.title" class="title-tag">{{ player.title }}</span>
          </div>
          <div class="row-right">
            <span class="player-era">{{ player.era }}</span>
            <span class="player-birth" v-if="player.birthYear">{{ player.birthYear }}</span>
            <span class="manual-count" v-if="player.manuals && player.manuals.length">{{ player.manuals.length }} 部棋谱</span>
            <span class="expand-icon">{{ activeId === player.id ? '▲' : '▼' }}</span>
          </div>
        </div>

        <div v-if="activeId === player.id" class="player-detail">
          <p class="player-bio">{{ player.bio }}</p>
          <div v-if="player.manuals && player.manuals.length" class="player-manuals">
            <span class="manuals-label">相关棋谱</span>
            <div class="manuals-list">
              <span
                v-for="m in player.manuals"
                :key="m.id + m.title"
                class="manual-link"
                @click.stop="$router.push('/manuals/' + m.id)"
              >{{ m.title }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!filteredList.length" class="empty-tip">暂无棋手记录</div>
    </div>

    <!-- 底部总数 -->
    <div class="pagination-wrap">
      <span class="total-count">共 {{ filteredList.length }} 位<template v-if="keyword"> · 搜索"{{ keyword }}"</template></span>
    </div>

  </div>
</template>

<script>
import { players } from '../api/index'
export default {
  name: 'PlayerPage',
  data() {
    return {
      allPlayers: [],
      keyword: '',
      selectedEra: 'all',
      activeId: null,
      eras: [
        { val: 'all',     label: '全部' },
        { val: 'ancient', label: '古代' },
        { val: 'ming',    label: '明代' },
        { val: 'qing',    label: '清代' },
        { val: 'modern',  label: '近现代' }
      ]
    }
  },
  computed: {
    filteredList() {
      let res = this.selectedEra === 'all' ? this.allPlayers : this.allPlayers.filter(p => p.eraClass === this.selectedEra)
      const kw = this.keyword.trim().toLowerCase()
      if (kw) res = res.filter(p => p.name.includes(kw) || (p.title && p.title.includes(kw)))
      return res
    }
  },
  mounted() { this.fetchPlayers() },
  methods: {
    async fetchPlayers() {
      try {
        const res = await players.getList()
        this.allPlayers = res.data || res || []
      } catch (e) {
        this.allPlayers = [
          { id: 1, name: '朱晋桢', era: '明代·嘉靖年间', eraClass: 'ming', title: '象棋理论家', birthYear: '约 1520—1570', bio: '朱晋桢，明代著名象棋理论家，其所著《橘中秘》是中国象棋史上最重要的古谱之一。书中系统整理了炮局理论，对后世影响深远。全书分四卷，涵盖全局、残局各类局面，是学习古代象棋理论的必读经典。', manuals: [{ id: 1, title: '橘中秘·炮局第一' }, { id: 1, title: '橘中秘·出车取士局' }, { id: 1, title: '橘中秘·当头炮正变' }] },
          { id: 2, name: '张乔栋', era: '清代·乾隆年间', eraClass: 'qing', title: '屏风马宗师', birthYear: '约 1720—1790', bio: '张乔栋，清代乾隆年间著名象棋家，以屏风马布局理论著称。其编撰的《梅花谱》系统论述了屏风马的各种变化，奠定了防御性布局的理论基础，被后世棋手奉为圭臬。', manuals: [{ id: 2, title: '梅花谱·屏风马对进三兵' }, { id: 2, title: '梅花谱·反宫马布局' }] },
          { id: 3, name: '颜丙', era: '明代·成化年间', eraClass: 'ming', title: '开局理论家', birthYear: '约 1460—1530', bio: '颜丙，明代成化年间象棋理论家，精研开局理论。其著作系统整理了当时流行的各种开局变化，尤以当头炮系列的研究最为深入，对明代象棋理论的发展做出了重要贡献。', manuals: [{ id: 3, title: '适情雅趣·当头炮进三兵' }, { id: 3, title: '适情雅趣·飞象局精要' }] },
          { id: 4, name: '张志', era: '清代·道光年间', eraClass: 'qing', title: '残局大师', birthYear: '约 1790—1860', bio: '张志，清代道光年间著名棋手，以残局研究著称。其整理的残局精选汇集了历代名家残局，难度各异，是训练象棋计算能力的重要教材。', manuals: [{ id: 4, title: '韬略元机·顺炮横车对直车' }, { id: 5, title: '渊深海阔·仙人指路变局' }] },
          { id: 5, name: '晁补之', era: '宋代', eraClass: 'ancient', title: '文学家·棋手', birthYear: '1053—1110', bio: '晁补之，北宋著名文学家，苏门四学士之一，同时也是象棋爱好者。相传《百局象棋谱》为其所编，是现存最早的象棋谱之一，对研究宋代象棋具有重要价值。', manuals: [{ id: 8, title: '百局象棋谱·第一局' }, { id: 8, title: '百局象棋谱·第二局' }] },
          { id: 6, name: '谢侠逊', era: '近现代', eraClass: 'modern', title: '象棋大师', birthYear: '1888—1987', bio: '谢侠逊，近现代著名象棋家，有"象棋圣手"之称。毕生致力于象棋理论研究与推广，著有多部棋谱，其中《象棋残局大全》是残局研究的集大成之作。', manuals: [{ id: 10, title: '象棋残局大全·车兵胜车' }, { id: 10, title: '象棋残局大全·马兵胜马' }] },
          { id: 7, name: '王天一', era: '近现代', eraClass: 'modern', title: '特级大师', birthYear: '1994 年生', bio: '王天一，现役象棋特级大师，多次荣获全国象棋个人锦标赛冠军。以深厚的理论功底和精湛的计算能力著称，是当代象棋界的领军人物。', manuals: [] },
          { id: 8, name: '谢靖', era: '近现代', eraClass: 'modern', title: '特级大师', birthYear: '1991 年生', bio: '谢靖，象棋特级大师，多次荣获全国象棋冠军。棋风凌厉，善于攻杀，尤擅中局混战，在现役棋手中以计算精确、战术丰富著称。', manuals: [] }
        ]
      }
    },
    toggleItem(id) { this.activeId = this.activeId === id ? null : id }
  }
}
</script>

<style scoped>
.player-page { display: flex; flex-direction: column; gap: 0; padding-bottom: 40px; }

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

.era-tabs { display: flex; overflow: hidden; border: 1px solid #d6eaf5; }
.era-tab {
  padding: 0 14px;
  height: 38px;
  font-size: 12px;
  color: #999;
  cursor: pointer;
  border: none;
  background: #fff;
  transition: all 0.12s;
}
.era-tab + .era-tab { border-left: 1px solid #d6eaf5; }
.era-tab:hover:not(.active) { background: #e8f4fb; color: #2a9fd6; }
.era-tab.active { background: #2a9fd6; color: #fff; font-weight: 600; }

/* 列表 */
.list-wrap {
  background: #fff;
  border: 1px solid #e8e8e8;
  overflow: hidden;
}
.player-item { border-bottom: 1px solid #f4f4f4; }
.player-item:last-child { border-bottom: none; }

.player-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 20px;
  cursor: pointer;
  transition: background 0.12s;
  gap: 16px;
}
.player-row:hover { background: #fafafa; }
.player-row:hover .player-name { color: #2a9fd6; }
.player-item.expanded > .player-row { background: #f0f8fd; }

.row-left { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; }
.player-name {
  font-size: 15px;
  font-weight: 600;
  color: #888;
  transition: color 0.12s;
}
.player-item.expanded .player-name { color: #2a9fd6; }

.title-tag {
  font-size: 11px;
  padding: 1px 7px;
  background: #e8f4fb;
  color: #2a9fd6;
  border: 1px solid #b8dff2;
  white-space: nowrap;
}

.row-right { display: flex; align-items: center; gap: 18px; flex-shrink: 0; }
.player-era { font-size: 12px; color: #aaa; }
.player-birth { font-size: 12px; color: #ccc; }
.manual-count { font-size: 12px; color: #bbb; min-width: 48px; text-align: right; }
.expand-icon { font-size: 10px; color: #ccc; width: 14px; text-align: center; }

/* 展开详情 */
.player-detail {
  padding: 16px 20px 20px;
  border-top: 1px solid #e8f4fb;
  background: #f7fbfd;
}
.player-bio {
  font-size: 14px;
  color: #555;
  line-height: 1.9;
  margin: 0 0 14px;
}
.player-manuals { display: flex; align-items: flex-start; gap: 12px; }
.manuals-label { font-size: 12px; color: #bbb; flex-shrink: 0; padding-top: 3px; }
.manuals-list { display: flex; flex-wrap: wrap; gap: 8px; }
.manual-link {
  font-size: 12px;
  color: #2a9fd6;
  cursor: pointer;
  padding: 2px 10px;
  border: 1px solid #b8dff2;
  background: #e8f4fb;
  transition: all 0.12s;
}
.manual-link:hover { background: #2a9fd6; color: #fff; border-color: #2a9fd6; }

/* 底部 */
.pagination-wrap { padding: 16px 0 4px; }
.total-count { font-size: 13px; color: #bbb; }
.empty-tip { color: #ccc; font-size: 14px; padding: 60px; text-align: center; }
</style>
