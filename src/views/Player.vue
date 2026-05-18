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
          <div class="detail-avatar">{{ selectedPlayer.name.charAt(0) }}</div>
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
              <div class="book-spine">
                <span class="spine-char">{{ selectedPlayer.name.charAt(0) }}</span>
              </div>
              <div class="book-face">
                <div class="book-vip" v-if="item.premium">秘</div>
                <div class="book-title-wrap">
                  <span class="book-title">{{ item.title }}</span>
                </div>
                <div class="book-cat">{{ item.category }}</div>
                <div class="book-diff">
                  <span v-for="n in 5" :key="n" class="diff-dot" :class="{ filled: n <= (item.difficulty || 3) }"></span>
                </div>
              </div>
              <div class="book-pages"></div>
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
            <div class="player-avatar" :class="'era-' + player.eraClass">
              {{ player.name.charAt(0) }}
            </div>
            <div class="player-info">
              <div class="player-name">{{ player.name }}</div>
              <div class="player-era">{{ player.era }}</div>
              <div class="player-title" v-if="player.title">{{ player.title }}</div>
              <div class="player-desc">{{ player.shortDesc }}</div>
              <div class="player-count">{{ player.manuals ? player.manuals.length : 0 }} 部棋谱</div>
            </div>
            <div class="player-works" v-if="player.works">
              <div class="works-label">代表作</div>
              <div v-for="w in player.works.slice(0, 2)" :key="w" class="work-item">《{{ w }}》</div>
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
            id: 1, name: '朱晋桢', era: '明代·嘉靖年间', eraClass: 'ming',
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
            id: 2, name: '张乔栋', era: '清代·乾隆年间', eraClass: 'qing',
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
            id: 3, name: '颜丙', era: '明代·成化年间', eraClass: 'ming',
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
            id: 4, name: '张志', era: '清代·道光年间', eraClass: 'qing',
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
            id: 5, name: '王天一', era: '近现代', eraClass: 'modern',
            title: '特级大师', birthYear: '1994 年生',
            shortDesc: '当代顶级棋手，多届全国冠军得主',
            bio: '王天一，现役象棋特级大师，多次荣获全国象棋个人锦标赛冠军。以深厚的理论功底和精湛的计算能力著称，对传统布局有深刻研究，是当代象棋界的领军人物。',
            works: [],
            manuals: []
          },
          {
            id: 6, name: '谢靖', era: '近现代', eraClass: 'modern',
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
.player-page { background: #faf8f5; min-height: calc(100vh - 56px); padding-bottom: 60px; }
.container { max-width: 1100px; margin: 0 auto; padding: 0 32px; }

.page-header { padding: 36px 0 24px; border-bottom: 1px solid #ece8e0; margin-bottom: 24px; }
.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 4px;
  font-family: 'STKaiti', 'KaiTi', serif;
  letter-spacing: 2px;
}
.page-desc { font-size: 13px; color: #aaa; }

/* 时代标签 */
.era-tabs { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
.era-tab {
  padding: 4px 14px;
  font-size: 13px;
  color: #666;
  border: 1px solid #e0dbd0;
  border-radius: 2px;
  cursor: pointer;
  background: #fff;
  transition: all 0.15s;
}
.era-tab:hover { border-color: #8B1A1A; color: #8B1A1A; }
.era-tab.active { background: #8B1A1A; border-color: #8B1A1A; color: #fff; }

.filter-bar { margin-bottom: 24px; }
.search-input {
  width: 200px;
  height: 32px;
  padding: 0 10px;
  border: 1px solid #e0dbd0;
  border-radius: 2px;
  font-size: 13px;
  background: #fff;
  outline: none;
}
.search-input:focus { border-color: #8B1A1A; }

/* 棋手列表 */
.players-grid { display: flex; flex-direction: column; gap: 0; border: 1px solid #ece8e0; border-radius: 4px; overflow: hidden; }
.player-card {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  padding: 20px 24px;
  border-bottom: 1px solid #f0ebe0;
  cursor: pointer;
  transition: background 0.1s;
  background: #fff;
}
.player-card:last-child { border-bottom: none; }
.player-card:hover { background: #fdf8f4; }

.player-avatar {
  width: 56px;
  height: 56px;
  border-radius: 4px;
  color: #fff;
  font-size: 22px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-family: 'STKaiti', 'KaiTi', serif;
}
.era-ming .player-avatar, .player-avatar.era-ming { background: #8B1A1A; }
.era-qing .player-avatar, .player-avatar.era-qing { background: #1a4a8b; }
.era-modern .player-avatar, .player-avatar.era-modern { background: #1a5c2a; }
.era-ancient .player-avatar, .player-avatar.era-ancient { background: #5c3d1a; }

/* 选择器需要在父级上 */
.player-card:nth-child(1) .player-avatar { background: #8B1A1A; }

.player-info { flex: 1; }
.player-name { font-size: 17px; font-weight: 700; color: #1a1a1a; margin-bottom: 4px; font-family: 'STKaiti', 'KaiTi', serif; }
.player-era { font-size: 12px; color: #888; margin-bottom: 4px; }
.player-title {
  display: inline-block;
  font-size: 11px;
  color: #8B1A1A;
  border: 1px solid rgba(139,26,26,0.3);
  padding: 1px 6px;
  border-radius: 2px;
  margin-bottom: 8px;
}
.player-desc { font-size: 13px; color: #666; margin-bottom: 4px; }
.player-count { font-size: 12px; color: #8B1A1A; }

.player-works { flex-shrink: 0; text-align: right; }
.works-label { font-size: 11px; color: #bbb; margin-bottom: 4px; }
.work-item { font-size: 12px; color: #8B1A1A; font-family: 'STKaiti', 'KaiTi', serif; margin-bottom: 2px; }

/* 棋手详情 */
.detail-back {
  font-size: 13px;
  color: #8B1A1A;
  cursor: pointer;
  margin-bottom: 20px;
  display: inline-block;
}
.detail-header {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  padding: 24px;
  background: #fff;
  border: 1px solid #ece8e0;
  border-radius: 4px;
  margin-bottom: 32px;
}
.detail-avatar {
  width: 72px;
  height: 72px;
  border-radius: 4px;
  background: #8B1A1A;
  color: #fff;
  font-size: 28px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-family: 'STKaiti', 'KaiTi', serif;
}
.detail-name { font-size: 22px; font-weight: 700; color: #1a1a1a; margin-bottom: 6px; font-family: 'STKaiti', 'KaiTi', serif; }
.detail-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
.meta-item { font-size: 12px; color: #888; }
.title-tag {
  font-size: 11px;
  color: #8B1A1A;
  border: 1px solid rgba(139,26,26,0.3);
  padding: 1px 6px;
  border-radius: 2px;
}
.detail-bio { font-size: 13px; color: #666; line-height: 1.8; }

.player-manuals { }
.manuals-title {
  font-size: 15px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 20px;
  font-family: 'STKaiti', 'KaiTi', serif;
  padding-bottom: 10px;
  border-bottom: 1px solid #ece8e0;
}

/* 书籍网格（复用） */
.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 24px 20px;
}
.book-card {
  position: relative;
  width: 120px;
  height: 170px;
  cursor: pointer;
  transition: transform 0.2s;
  display: flex;
}
.book-card:hover { transform: translateY(-4px) rotate(-1deg); }
.book-card:hover .book-face { box-shadow: 6px 6px 18px rgba(0,0,0,0.25); }

.book-spine {
  width: 18px;
  flex-shrink: 0;
  background: #8B1A1A;
  border-radius: 2px 0 0 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}
.spine-char { font-size: 10px; color: rgba(255,255,255,0.6); font-family: 'STKaiti', 'KaiTi', serif; }

.book-face {
  flex: 1;
  background: #f5e6c0;
  border: 1px solid #c9a96e;
  border-left: none;
  border-radius: 0 3px 3px 0;
  padding: 8px 6px 8px 8px;
  display: flex;
  flex-direction: column;
  box-shadow: 3px 3px 10px rgba(0,0,0,0.15);
  position: relative;
  overflow: hidden;
}
.book-face::before {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(0deg, transparent, transparent 18px, rgba(180,140,60,0.07) 18px, rgba(180,140,60,0.07) 19px);
  pointer-events: none;
}
.book-vip {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #8B1A1A;
  color: #f4c842;
  font-size: 9px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'STKaiti', 'KaiTi', serif;
}
.book-title-wrap { flex: 1; display: flex; align-items: flex-start; padding-top: 2px; }
.book-title {
  writing-mode: vertical-rl;
  font-size: 13px;
  font-weight: 700;
  color: #2c1a08;
  font-family: 'STKaiti', 'KaiTi', 'SimSun', serif;
  line-height: 1.4;
  letter-spacing: 1px;
  max-height: 100px;
  overflow: hidden;
}
.book-cat { font-size: 10px; color: #8a6a3a; margin-bottom: 4px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.book-diff { display: flex; gap: 3px; }
.diff-dot { width: 5px; height: 5px; border-radius: 50%; background: #d4b880; }
.diff-dot.filled { background: #8B1A1A; }
.book-pages {
  position: absolute;
  right: -5px;
  top: 3px;
  bottom: 3px;
  width: 5px;
  background: repeating-linear-gradient(to bottom, #f0e4b8, #f0e4b8 1px, #e8d4a0 1px, #e8d4a0 2px);
  border-radius: 0 2px 2px 0;
  box-shadow: 1px 1px 3px rgba(0,0,0,0.1);
}

.empty-tip { color: #ccc; font-size: 14px; padding: 60px; text-align: center; }
</style>
