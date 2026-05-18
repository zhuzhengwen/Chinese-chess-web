<template>
  <div class="player-page">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">棋手</h1>
        <p class="page-desc">历代象棋名家档案，收录各位大师经典对局</p>
      </div>

      <!-- 时代筛选 -->
      <div class="era-tabs">
        <span
          v-for="e in eras"
          :key="e.val"
          class="era-tab"
          :class="{ active: selectedEra === e.val }"
          @click="selectedEra = e.val"
        >{{ e.label }}</span>
      </div>

      <!-- 搜索 -->
      <div class="filter-bar">
        <input v-model="keyword" class="search-input" placeholder="搜索棋手姓名…" @input="filterPlayers" />
      </div>

      <div v-if="selectedPlayer" class="player-detail">
        <!-- 棋手详情 -->
        <div class="detail-back" @click="selectedPlayer = null">← 返回棋手列表</div>
        <div class="detail-header">
          <div class="detail-photo">
            <img v-if="selectedPlayer.photo" :src="selectedPlayer.photo" :alt="selectedPlayer.name" class="detail-photo-img" />
            <div v-else class="detail-photo-placeholder">
              <span>{{ selectedPlayer.name.charAt(0) }}</span>
            </div>
          </div>
          <div class="detail-info">
            <h2 class="detail-name">{{ selectedPlayer.name }}</h2>
            <div class="detail-meta">
              <span class="meta-item">{{ selectedPlayer.era }}</span>
              <span v-if="selectedPlayer.title" class="meta-item title-tag">{{ selectedPlayer.title }}</span>
              <span v-if="selectedPlayer.birthYear" class="meta-item">{{ selectedPlayer.birthYear }}</span>
            </div>
            <p class="detail-bio">{{ selectedPlayer.bio }}</p>
          </div>
        </div>

        <!-- 该棋手棋谱 -->
        <div class="player-manuals">
          <div class="manuals-title">相关棋谱 · {{ selectedPlayer.name }}</div>
          <div class="books-grid">
            <div
              v-for="item in selectedPlayer.manuals"
              :key="item.id"
              class="book-card"
              @click="$router.push('/manuals/' + item.id)"
            >
              <div class="book-label">
                <span class="book-title">{{ item.title }}</span>
                <span class="book-seal" v-if="item.premium">秘</span>
              </div>
              <div class="book-deco"></div>
              <div class="book-meta">
                <div class="book-diff">
                  <span v-for="n in 5" :key="n" class="diff-dot" :class="{ filled: n <= (item.difficulty || 3) }"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 棋手列表 -->
      <div v-else>
        <div class="players-grid">
          <div
            v-for="player in filteredPlayers"
            :key="player.id"
            class="player-card"
            @click="selectedPlayer = player"
          >
            <div class="player-photo">
              <img v-if="player.photo" :src="player.photo" :alt="player.name" class="photo-img" />
              <div v-else class="photo-placeholder">
                <span class="placeholder-char">{{ player.name.charAt(0) }}</span>
              </div>
              <div class="player-era-badge">{{ player.era }}</div>
            </div>
            <div class="player-info">
              <div class="player-name">{{ player.name }}</div>
              <div class="player-title" v-if="player.title">{{ player.title }}</div>
              <div class="player-desc">{{ player.shortDesc }}</div>
              <div class="player-count" v-if="player.manuals && player.manuals.length">{{ player.manuals.length }} 部棋谱</div>
            </div>
          </div>
        </div>
        <div v-if="!filteredPlayers.length" class="empty-tip">暂无棋手记录</div>
      </div>
    </div>
  </div>
</template>

<script>
import { players } from '../api/index'
export default {
  name: 'PlayerPage',
  data() {
    return {
      allPlayers: [], keyword: '', selectedEra: 'all', selectedPlayer: null,
      eras: [
        { val: 'all', label: '全部' },
        { val: 'ancient', label: '古代' },
        { val: 'ming', label: '明代' },
        { val: 'qing', label: '清代' },
        { val: 'modern', label: '近现代' }
      ]
    }
  },
  computed: {
    filteredPlayers() {
      let list = this.allPlayers
      if (this.selectedEra !== 'all') list = list.filter(p => p.eraClass === this.selectedEra)
      if (this.keyword) list = list.filter(p => p.name.includes(this.keyword))
      return list
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
          {
            id: 1, name: '朱晋桢', photo: '', era: '明代·嘉靖年间', eraClass: 'ming',
            title: '象棋理论家', birthYear: '约 1520—1570',
            shortDesc: '《橘中秘》作者，炮局理论集大成者',
            bio: '朱晋桢，明代著名象棋理论家，其所著《橘中秘》是中国象棋史上最重要的古谱之一。书中系统整理了炮局理论，对后世影响深远。全书分四卷，涵盖全局、残局各类局面，是学习古代象棋理论的必读经典。',
            works: ['橘中秘'],
            manuals: [
              { id: 1, title: '橘中秘·炮局第一', category: '橘中秘', difficulty: 3 },
              { id: 7, title: '橘中秘·马兵胜单车', category: '橘中秘', difficulty: 2 },
              { id: 10, title: '橘中秘·当头炮正变', category: '橘中秘', difficulty: 4, premium: true }
            ]
          },
          {
            id: 2, name: '张乔栋', photo: '', era: '清代·乾隆年间', eraClass: 'qing',
            title: '屏风马宗师', birthYear: '约 1720—1790',
            shortDesc: '《梅花谱》编撰者，屏风马布局理论创立者',
            bio: '张乔栋，清代乾隆年间著名象棋家，以屏风马布局理论著称。其编撰的《梅花谱》系统论述了屏风马的各种变化，奠定了防御性布局的理论基础，被后世棋手奉为圭臬。',
            works: ['梅花谱'],
            manuals: [
              { id: 2, title: '梅花谱·屏风马对进三兵', category: '梅花谱', difficulty: 4 },
              { id: 8, title: '梅花谱·反宫马布局', category: '梅花谱', difficulty: 3 }
            ]
          },
          {
            id: 3, name: '颜丙', photo: '', era: '明代·成化年间', eraClass: 'ming',
            title: '开局理论家', birthYear: '约 1460—1530',
            shortDesc: '象棋理论家，对开局战术有深入研究',
            bio: '颜丙，明代成化年间象棋理论家，精研开局理论。其著作系统整理了当时流行的各种开局变化，尤以当头炮系列的研究最为深入，对明代象棋理论的发展做出了重要贡献。',
            works: ['适情雅趣'],
            manuals: [
              { id: 3, title: '适情雅趣·当头炮进三兵', category: '适情雅趣', difficulty: 2, premium: true },
              { id: 9, title: '适情雅趣·飞象局精要', category: '适情雅趣', difficulty: 2 },
              { id: 11, title: '韬略元机·五七炮对屏风马', category: '韬略元机', difficulty: 3 }
            ]
          },
          {
            id: 4, name: '张志', photo: '', era: '清代·道光年间', eraClass: 'qing',
            title: '残局大师', birthYear: '约 1790—1860',
            shortDesc: '留有多部残局精选，残局理论卓著',
            bio: '张志，清代道光年间著名棋手，以残局研究著称。其整理的残局精选汇集了历代名家残局，难度各异，是训练象棋计算能力的重要教材。对马炮残局的研究尤为深入。',
            works: ['竹香斋'],
            manuals: [
              { id: 4, title: '韬略元机·顺炮横车对直车', category: '韬略元机', difficulty: 3 },
              { id: 5, title: '渊深海阔·仙人指路', category: '残局精选', difficulty: 4, premium: true },
              { id: 12, title: '渊深海阔·车马炮胜单车', category: '残局精选', difficulty: 3 }
            ]
          },
          {
            id: 5, name: '王天一', photo: '', era: '近现代', eraClass: 'modern',
            title: '特级大师', birthYear: '1994 年生',
            shortDesc: '当代顶级棋手，多届全国冠军得主',
            bio: '王天一，现役象棋特级大师，多次荣获全国象棋个人锦标赛冠军。以深厚的理论功底和精湛的计算能力著称，对传统布局有深刻研究，是当代象棋界的领军人物。',
            works: [],
            manuals: []
          },
          {
            id: 6, name: '谢靖', photo: '', era: '近现代', eraClass: 'modern',
            title: '特级大师', birthYear: '1991 年生',
            shortDesc: '全国冠军，当代顶尖棋手之一',
            bio: '谢靖，象棋特级大师，多次荣获全国象棋冠军。棋风凌厉，善于攻杀，尤擅中局混战。在现役棋手中以计算精确、战术丰富著称。',
            works: [],
            manuals: []
          }
        ]
      }
    },
    filterPlayers() {}
  }
}
</script>

<style scoped>
.player-page { background: #fff; min-height: calc(100vh - 56px); padding-bottom: 60px; }
.container { max-width: 1100px; margin: 0 auto; padding: 0 32px; }

.page-header { padding: 36px 0 24px; border-bottom: 1px solid #e8e8e8; margin-bottom: 24px; }
.page-title { font-size: 22px; font-weight: 700; color: #1a1a1a; margin-bottom: 4px; font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif; letter-spacing: 2px; }
.page-desc { font-size: 13px; color: #aaa; }

.era-tabs { display: flex; gap: 0; margin-bottom: 16px; border-bottom: 1px solid #e8e8e8; flex-wrap: wrap; }
.era-tab { padding: 7px 16px; font-size: 13px; color: #888; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -1px; transition: color 0.15s; }
.era-tab:hover { color: #333; }
.era-tab.active { color: #1a1a1a; font-weight: 600; border-bottom-color: #1a1a1a; }

.filter-bar { margin-bottom: 24px; }
.search-input { width: 200px; height: 32px; padding: 0 10px; border: 1px solid #e8e8e8; border-radius: 2px; font-size: 13px; background: #fff; outline: none; }
.search-input:focus { border-color: #333; }

/* ── 棋手网格 ── */
.players-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 24px; }

.player-card { background: #fff; border: 1px solid #ebebeb; cursor: pointer; transition: transform 0.18s, box-shadow 0.18s; overflow: hidden; }
.player-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,.1); }

/* 人像区 */
.player-photo { position: relative; width: 100%; aspect-ratio: 3/4; overflow: hidden; background: #1d2e4a; }
.photo-img { width: 100%; height: 100%; object-fit: cover; object-position: top; display: block; }
.photo-placeholder {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(160deg, #1d2e4a 0%, #2d3f5c 100%);
}
.placeholder-char { font-size: 56px; font-weight: 700; color: rgba(255,255,255,.2); }
.player-era-badge {
  position: absolute; bottom: 0; left: 0; right: 0;
  padding: 20px 10px 8px;
  background: linear-gradient(transparent, rgba(0,0,0,.65));
  font-size: 11px; color: rgba(255,255,255,.75); text-align: center;
}

/* 信息区 */
.player-info { padding: 12px 14px 14px; }
.player-name { font-size: 16px; font-weight: 700; color: #1a1a1a; margin-bottom: 4px; }
.player-title { display: inline-block; font-size: 11px; color: #8B1A1A; border: 1px solid #e8c8c8; padding: 1px 6px; margin-bottom: 8px; }
.player-desc { font-size: 12px; color: #888; line-height: 1.6; margin-bottom: 6px; }
.player-count { font-size: 11px; color: #bbb; }

/* ── 棋手详情 ── */
.detail-back { font-size: 13px; color: #888; cursor: pointer; margin-bottom: 20px; display: inline-block; }
.detail-back:hover { color: #1a1a1a; }
.detail-header { display: flex; align-items: flex-start; gap: 28px; padding: 24px; background: #fff; border: 1px solid #ebebeb; margin-bottom: 32px; }

.detail-photo { width: 120px; flex-shrink: 0; }
.detail-photo-img { width: 120px; height: 160px; object-fit: cover; object-position: top; display: block; border: 1px solid #ebebeb; }
.detail-photo-placeholder { width: 120px; height: 160px; background: linear-gradient(160deg, #1d2e4a, #2d3f5c); display: flex; align-items: center; justify-content: center; }
.detail-photo-placeholder span { font-size: 48px; font-weight: 700; color: rgba(255,255,255,.25); }

.detail-name { font-size: 22px; font-weight: 700; color: #1a1a1a; margin-bottom: 8px; }
.detail-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
.meta-item { font-size: 12px; color: #888; }
.title-tag { font-size: 11px; color: #8B1A1A; border: 1px solid #e8c8c8; padding: 1px 6px; }
.detail-bio { font-size: 13px; color: #666; line-height: 1.8; }

.manuals-title { font-size: 15px; font-weight: 700; color: #1a1a1a; margin-bottom: 20px; font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif; padding-bottom: 10px; border-bottom: 1px solid #e8e8e8; }

.books-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 24px 20px; }
.book-card { position: relative; width: 120px; height: 170px; cursor: pointer; background: #1d2e4a; border: 1px solid #162338; overflow: hidden; transition: transform 0.22s, box-shadow 0.22s; box-shadow: 2px 5px 14px rgba(0,0,0,.4); }
.book-card:hover { transform: translateY(-5px); box-shadow: 4px 12px 28px rgba(0,0,0,.55); }

.book-label { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 40px; height: 116px; background: #f5f0e2; display: flex; align-items: center; justify-content: center; padding: 6px 4px; overflow: hidden; }
.book-label::before { content: ''; position: absolute; inset: 4px; border: 1px solid #b8a06a; pointer-events: none; }

.book-title { writing-mode: vertical-rl; font-size: 13px; font-weight: 600; color: #1a1200; letter-spacing: 3px; line-height: 1.3; z-index: 1; max-height: 96px; overflow: hidden; text-overflow: ellipsis; }

.book-seal { position: absolute; bottom: 6px; right: 3px; width: 14px; height: 14px; border: 1px solid #8B1A1A; color: #8B1A1A; font-size: 8px; font-weight: 700; display: flex; align-items: center; justify-content: center; z-index: 2; background: rgba(245,240,226,.85); }

.book-deco { position: absolute; right: 0; top: 0; bottom: 0; width: 32px; background: repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(185,158,80,.5) 8px, rgba(185,158,80,.5) 9px), repeating-linear-gradient(-45deg, transparent, transparent 8px, rgba(185,158,80,.5) 8px, rgba(185,158,80,.5) 9px); }

.book-meta { position: absolute; bottom: 9px; left: 12px; }
.book-diff { display: flex; gap: 2px; }
.diff-dot { width: 4px; height: 4px; border-radius: 50%; background: rgba(255,255,255,.12); }
.diff-dot.filled { background: rgba(200,140,60,.75); }

.empty-tip { color: #ccc; font-size: 14px; padding: 60px; text-align: center; }
</style>
