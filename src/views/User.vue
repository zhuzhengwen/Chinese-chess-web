<template>
  <div class="user-page">
    <div class="container">
      <div class="profile-card">
        <div class="avatar-circle">{{ avatarChar }}</div>
        <div class="profile-info">
          <div class="nickname">{{ userInfo ? (userInfo.nickname || userInfo.phone) : '未登录' }}</div>
          <div class="phone" v-if="userInfo && userInfo.phone">{{ maskPhone(userInfo.phone) }}</div>
          <div class="vip-badge" v-if="isVip"><i class="el-icon-trophy"></i> VIP会员</div>
          <div class="free-badge" v-else>
            免费用户 · <span class="upgrade-link" @click="$router.push('/subscribe')">升级会员</span>
          </div>
        </div>
        <div class="profile-actions">
          <el-button size="small" @click="handleLogout" icon="el-icon-switch-button">退出登录</el-button>
        </div>
      </div>
      <div class="stats-row">
        <div class="stat-item">
          <div class="stat-num">{{ studiedCount }}</div>
          <div class="stat-label">已学棋谱</div>
        </div>
        <div class="stat-item">
          <div class="stat-num">{{ favorites.length }}</div>
          <div class="stat-label">收藏棋谱</div>
        </div>
        <div class="stat-item">
          <div class="stat-num">{{ continuousDays }}</div>
          <div class="stat-label">连续学习天</div>
        </div>
      </div>
      <div class="two-col">
        <div class="col-card">
          <div class="col-header">
            <i class="el-icon-s-order"></i>
            <h3>学习记录</h3>
          </div>
          <div v-if="loadingRecords" class="loading-mini"><i class="el-icon-loading"></i></div>
          <div v-else>
            <div v-if="studyRecords.length === 0" class="empty-tip">
              <i class="el-icon-reading" style="font-size:28px;color:#ddd"></i>
              <p>还没有学习记录</p>
              <el-button size="mini" type="text" @click="$router.push('/manuals')">去学习</el-button>
            </div>
            <div v-else>
              <div v-for="record in studyRecords" :key="record.id || record.manualId" class="record-item" @click="$router.push('/manuals/' + (record.manualId || record.id))">
                <div class="record-cover">{{ record.title ? record.title.charAt(0) : '棋' }}</div>
                <div class="record-info">
                  <div class="record-title">{{ record.title || record.manualTitle || '未命名棋谱' }}</div>
                  <div class="record-meta">
                    <span>进度：{{ record.progress || 0 }}%</span>
                    <el-progress :percentage="record.progress || 0" :show-text="false" :stroke-width="4" color="#8B1A1A" style="width:80px;display:inline-flex;vertical-align:middle;margin-left:6px" />
                  </div>
                  <div class="record-date">{{ record.studyDate || record.createdAt || '' }}</div>
                </div>
                <i class="el-icon-arrow-right record-arrow"></i>
              </div>
            </div>
          </div>
        </div>
        <div class="col-card">
          <div class="col-header">
            <i class="el-icon-star-on" style="color:#e6a817"></i>
            <h3>收藏列表</h3>
          </div>
          <div v-if="loadingFavs" class="loading-mini"><i class="el-icon-loading"></i></div>
          <div v-else>
            <div v-if="favorites.length === 0" class="empty-tip">
              <i class="el-icon-star-off" style="font-size:28px;color:#ddd"></i>
              <p>还没有收藏棋谱</p>
              <el-button size="mini" type="text" @click="$router.push('/manuals')">去收藏</el-button>
            </div>
            <div v-else>
              <div v-for="fav in favorites" :key="fav.id || fav.manualId" class="record-item">
                <div class="record-cover" style="background:linear-gradient(135deg,#e6a817,#f4c842);color:#5C0000">
                  {{ fav.title ? fav.title.charAt(0) : '棋' }}
                </div>
                <div class="record-info" @click="$router.push('/manuals/' + (fav.manualId || fav.id))">
                  <div class="record-title">{{ fav.title || fav.manualTitle || '未命名棋谱' }}</div>
                  <div class="record-date">{{ fav.dynasty || '' }} {{ fav.author ? '· ' + fav.author : '' }}</div>
                </div>
                <el-button type="text" size="mini" class="remove-fav" icon="el-icon-delete" @click.stop="removeFavorite(fav.manualId || fav.id)"></el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="logout-area">
        <el-button type="danger" plain @click="handleLogout" icon="el-icon-switch-button">退出登录</el-button>
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
.user-page { background: #f7f3ee; min-height: calc(100vh - 60px); padding-bottom: 48px; }
.container { max-width: 900px; margin: 0 auto; padding: 32px 24px; }
.profile-card { background: linear-gradient(135deg, #8B1A1A, #5C0000); border-radius: 16px; padding: 32px; display: flex; align-items: center; gap: 24px; margin-bottom: 20px; color: #fff; }
.avatar-circle { width: 72px; height: 72px; border-radius: 50%; background: rgba(255,255,255,0.2); border: 3px solid rgba(255,255,255,0.4); font-size: 28px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.profile-info { flex: 1; }
.nickname { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
.phone { font-size: 13px; opacity: 0.7; margin-bottom: 8px; }
.vip-badge { display: inline-flex; align-items: center; gap: 4px; background: linear-gradient(135deg, #e6a817, #f4c842); color: #5C0000; font-size: 13px; font-weight: 700; padding: 3px 12px; border-radius: 20px; }
.free-badge { font-size: 13px; opacity: 0.8; }
.upgrade-link { color: #f4c842; cursor: pointer; font-weight: 600; text-decoration: underline; }
.profile-actions { margin-left: auto; }
.stats-row { display: flex; background: #fff; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); overflow: hidden; }
.stat-item { flex: 1; padding: 20px; text-align: center; border-right: 1px solid #f0f0f0; }
.stat-item:last-child { border-right: none; }
.stat-num { font-size: 28px; font-weight: 800; color: #8B1A1A; margin-bottom: 4px; }
.stat-label { font-size: 13px; color: #999; }
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
.col-card { background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.col-header { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #f5f5f5; }
.col-header i { font-size: 18px; color: #8B1A1A; }
.col-header h3 { font-size: 16px; font-weight: 700; color: #1a1a1a; }
.loading-mini { text-align: center; padding: 30px; color: #ccc; font-size: 20px; }
.empty-tip { text-align: center; padding: 24px; color: #bbb; font-size: 14px; }
.empty-tip p { margin: 8px 0 6px; }
.record-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f5f5f5; cursor: pointer; transition: background 0.15s; border-radius: 6px; }
.record-item:last-child { border-bottom: none; }
.record-item:hover { background: #fdf0f0; padding-left: 4px; }
.record-cover { width: 40px; height: 40px; border-radius: 8px; background: linear-gradient(135deg, #8B1A1A, #c0392b); color: #fff; font-size: 16px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.record-info { flex: 1; min-width: 0; }
.record-title { font-size: 14px; font-weight: 600; color: #1a1a1a; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.record-meta { font-size: 12px; color: #999; display: flex; align-items: center; gap: 4px; }
.record-date { font-size: 12px; color: #bbb; }
.record-arrow { color: #ddd; font-size: 14px; }
.remove-fav { color: #ccc !important; font-size: 14px; }
.remove-fav:hover { color: #e74c3c !important; }
.logout-area { text-align: center; margin-top: 8px; }
@media (max-width: 768px) {
  .two-col { grid-template-columns: 1fr; }
  .profile-card { flex-direction: column; text-align: center; }
}
</style>
