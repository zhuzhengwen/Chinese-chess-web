<template>
  <div class="user-page">
    <div class="container">
      <div class="profile-row">
        <div class="avatar">{{ avatarChar }}</div>
        <div class="profile-info">
          <div class="nickname">{{ userInfo ? (userInfo.nickname || userInfo.phone) : '未登录' }}</div>
          <div class="phone" v-if="userInfo && userInfo.phone">{{ maskPhone(userInfo.phone) }}</div>
          <div class="vip-label" v-if="isVip">VIP 会员</div>
          <div class="free-label" v-else>
            免费用户 · <span class="upgrade-link" @click="$router.push('/subscribe')">升级会员</span>
          </div>
        </div>
        <button class="logout-btn" @click="handleLogout">退出登录</button>
      </div>

      <div class="stats-bar">
        <div class="stat-item">
          <span class="stat-num">{{ studiedCount }}</span>
          <span class="stat-label">已学棋谱</span>
        </div>
        <div class="stat-sep"></div>
        <div class="stat-item">
          <span class="stat-num">{{ favorites.length }}</span>
          <span class="stat-label">收藏棋谱</span>
        </div>
        <div class="stat-sep"></div>
        <div class="stat-item">
          <span class="stat-num">{{ continuousDays }}</span>
          <span class="stat-label">连续学习天</span>
        </div>
      </div>

      <div class="two-col">
        <div class="col-block">
          <div class="col-title">学习记录</div>
          <div v-if="loadingRecords" class="loading-tip">加载中…</div>
          <div v-else>
            <div v-if="studyRecords.length === 0" class="empty-tip">
              <span>还没有学习记录</span>
              <span class="empty-link" @click="$router.push('/manuals')">去学习 →</span>
            </div>
            <div v-else>
              <div
                v-for="record in studyRecords"
                :key="record.id || record.manualId"
                class="list-row"
                @click="$router.push('/manuals/' + (record.manualId || record.id))"
              >
                <div class="row-cover">{{ record.title ? record.title.charAt(0) : '棋' }}</div>
                <div class="row-info">
                  <div class="row-title">{{ record.title || record.manualTitle || '未命名棋谱' }}</div>
                  <div class="row-sub">进度 {{ record.progress || 0 }}%</div>
                </div>
                <span class="row-arrow">›</span>
              </div>
            </div>
          </div>
        </div>

        <div class="col-block">
          <div class="col-title">收藏列表</div>
          <div v-if="loadingFavs" class="loading-tip">加载中…</div>
          <div v-else>
            <div v-if="favorites.length === 0" class="empty-tip">
              <span>还没有收藏棋谱</span>
              <span class="empty-link" @click="$router.push('/manuals')">去收藏 →</span>
            </div>
            <div v-else>
              <div
                v-for="fav in favorites"
                :key="fav.id || fav.manualId"
                class="list-row"
              >
                <div class="row-cover fav-cover">{{ fav.title ? fav.title.charAt(0) : '棋' }}</div>
                <div class="row-info" @click="$router.push('/manuals/' + (fav.manualId || fav.id))">
                  <div class="row-title">{{ fav.title || fav.manualTitle || '未命名棋谱' }}</div>
                  <div class="row-sub">{{ fav.dynasty }} {{ fav.author ? '· ' + fav.author : '' }}</div>
                </div>
                <span class="remove-fav" @click.stop="removeFavorite(fav.manualId || fav.id)">✕</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { study as studyApi, favorites as favoritesApi } from '../api/index'
import { mapGetters, mapState } from 'vuex'
export default {
  name: 'UserPage',
  data() {
    return {
      studyRecords: [], favorites: [], studiedCount: 0, continuousDays: 7,
      loadingRecords: false, loadingFavs: false
    }
  },
  computed: {
    ...mapGetters('user', ['isLoggedIn', 'isVip']),
    ...mapState('user', ['userInfo']),
    avatarChar() {
      if (!this.userInfo) return '?'
      const name = this.userInfo.nickname || this.userInfo.phone || '?'
      return name.charAt(0).toUpperCase()
    }
  },
  mounted() {
    this.$store.dispatch('user/fetchProfile')
    this.fetchRecords()
    this.fetchFavorites()
    this.fetchStudiedCount()
  },
  methods: {
    async fetchRecords() {
      this.loadingRecords = true
      try {
        const res = await studyApi.getRecords()
        this.studyRecords = res.data || res || []
      } catch (e) {
        this.studyRecords = [
          { manualId: 1, title: '橘中秘·炮局第一', progress: 75, studyDate: '2024-01-15' },
          { manualId: 2, title: '梅花谱·屏风马局', progress: 30, studyDate: '2024-01-14' }
        ]
      } finally { this.loadingRecords = false }
    },
    async fetchFavorites() {
      this.loadingFavs = true
      try {
        const res = await favoritesApi.getList()
        this.favorites = res.data || res || []
      } catch (e) {
        this.favorites = [
          { manualId: 3, title: '适情雅趣·残局精选', dynasty: '清', author: '佚名' },
          { manualId: 4, title: '韬略元机·开局要诀', dynasty: '明', author: '颜丙' }
        ]
      } finally { this.loadingFavs = false }
    },
    async fetchStudiedCount() {
      try {
        const res = await studyApi.getStudiedCount()
        this.studiedCount = (res.data !== undefined ? res.data : res) || 0
      } catch (e) { this.studiedCount = 12 }
    },
    async removeFavorite(manualId) {
      try {
        await favoritesApi.remove(manualId)
        this.favorites = this.favorites.filter(f => (f.manualId || f.id) !== manualId)
        this.$message.success('已取消收藏')
      } catch (e) { this.$message.error('操作失败，请重试') }
    },
    handleLogout() {
      this.$confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '退出', cancelButtonText: '取消', type: 'warning'
      }).then(() => {
        this.$store.dispatch('user/logout')
        this.$message.success('已退出登录')
        this.$router.push('/home')
      }).catch(() => {})
    },
    maskPhone(phone) {
      if (!phone) return ''
      return phone.toString().replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
    }
  }
}
</script>

<style scoped>
.user-page { background: #fff; min-height: calc(100vh - 56px); padding-bottom: 48px; }
.container { max-width: 900px; margin: 0 auto; padding: 36px 24px; }

/* profile */
.profile-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 24px;
}
.avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #8B1A1A;
  color: #fff;
  font-size: 22px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.profile-info { flex: 1; }
.nickname { font-size: 18px; font-weight: 700; color: #1a1a1a; margin-bottom: 2px; }
.phone { font-size: 13px; color: #bbb; margin-bottom: 4px; }
.vip-label {
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  color: #8B1A1A;
  border: 1px solid #8B1A1A;
  padding: 1px 8px;
  border-radius: 2px;
  letter-spacing: 1px;
}
.free-label { font-size: 13px; color: #bbb; }
.upgrade-link { color: #8B1A1A; cursor: pointer; }
.logout-btn {
  background: none;
  border: 1px solid #e8e8e8;
  padding: 6px 14px;
  border-radius: 4px;
  font-size: 13px;
  color: #888;
  cursor: pointer;
  transition: border-color 0.15s;
}
.logout-btn:hover { border-color: #8B1A1A; color: #8B1A1A; }

/* stats */
.stats-bar {
  display: flex;
  align-items: center;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 32px;
}
.stat-item {
  flex: 1;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.stat-sep { width: 1px; height: 40px; background: #f0f0f0; }
.stat-num { font-size: 26px; font-weight: 700; color: #1a1a1a; }
.stat-label { font-size: 12px; color: #bbb; }

/* two col */
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.col-block { border: 1px solid #f0f0f0; border-radius: 6px; overflow: hidden; }
.col-title {
  padding: 14px 16px;
  font-size: 13px;
  font-weight: 700;
  color: #888;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
  letter-spacing: 0.5px;
}
.loading-tip { color: #ccc; font-size: 13px; padding: 24px 16px; }
.empty-tip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 16px;
  font-size: 13px;
  color: #bbb;
}
.empty-link { color: #8B1A1A; cursor: pointer; font-size: 12px; }

/* list rows */
.list-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  transition: background 0.1s;
}
.list-row:last-child { border-bottom: none; }
.list-row:hover { background: #fafafa; }
.row-cover {
  width: 36px;
  height: 36px;
  border-radius: 4px;
  background: #8B1A1A;
  color: #fff;
  font-size: 14px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.fav-cover { background: #2c2c2c; }
.row-info { flex: 1; min-width: 0; }
.row-title {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 2px;
}
.row-sub { font-size: 11px; color: #bbb; }
.row-arrow { color: #ddd; font-size: 16px; }
.remove-fav {
  font-size: 12px;
  color: #e0e0e0;
  cursor: pointer;
  padding: 2px 4px;
  transition: color 0.15s;
}
.remove-fav:hover { color: #c0392b; }

@media (max-width: 768px) {
  .two-col { grid-template-columns: 1fr; }
}
</style>
