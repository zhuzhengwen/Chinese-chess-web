<template>
  <div class="forum-page">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">论坛</h1>
        <p class="page-desc">棋友交流，共探象棋之道</p>
      </div>

      <!-- 话题详情视图 -->
      <div v-if="currentTopic" class="topic-detail">
        <div class="detail-back" @click="backToList">← 返回论坛</div>

        <!-- 原帖 -->
        <div class="post-card original-post">
          <div class="post-header">
            <div class="post-avatar" :style="{ background: avatarColor(currentTopic.author) }">
              {{ currentTopic.author.charAt(0) }}
            </div>
            <div class="post-meta">
              <span class="post-author">{{ currentTopic.author }}</span>
              <span class="post-time">{{ currentTopic.createdAt }}</span>
            </div>
            <span class="topic-cat-tag" :class="currentTopic.category">{{ catLabel(currentTopic.category) }}</span>
          </div>
          <h2 class="post-title">{{ currentTopic.title }}</h2>
          <div class="post-content">{{ currentTopic.content }}</div>
          <div class="post-footer">
            <span class="stat-item">{{ currentTopic.views }} 浏览</span>
            <span class="stat-item">{{ currentTopic.replies.length }} 回复</span>
            <span class="like-btn" :class="{ liked: currentTopic.liked }" @click="likeTopic(currentTopic)">
              {{ currentTopic.likes }} 赞
            </span>
          </div>
        </div>

        <!-- 回复列表 -->
        <div class="replies-section">
          <div class="replies-title">全部回复 ({{ currentTopic.replies.length }})</div>
          <div v-if="currentTopic.replies.length === 0" class="empty-replies">暂无回复，来说第一句吧</div>
          <div
            v-for="(reply, idx) in currentTopic.replies"
            :key="reply.id"
            class="post-card reply-card"
          >
            <div class="post-header">
              <div class="reply-floor">#{{ idx + 1 }}</div>
              <div class="post-avatar small" :style="{ background: avatarColor(reply.author) }">
                {{ reply.author.charAt(0) }}
              </div>
              <div class="post-meta">
                <span class="post-author">{{ reply.author }}</span>
                <span class="post-time">{{ reply.createdAt }}</span>
              </div>
              <span class="like-btn small" :class="{ liked: reply.liked }" @click="likeReply(reply)">
                {{ reply.likes }} 赞
              </span>
            </div>
            <div class="post-content">{{ reply.content }}</div>
          </div>
        </div>

        <!-- 发表回复 -->
        <div class="reply-box">
          <div class="reply-box-title">发表回复</div>
          <div v-if="!isLoggedIn" class="login-tip">
            请 <router-link to="/login">登录</router-link> 后发表回复
          </div>
          <template v-else>
            <el-input
              type="textarea"
              v-model="replyContent"
              :rows="4"
              placeholder="写下你的回复…"
              maxlength="2000"
              show-word-limit
            />
            <div class="reply-submit-row">
              <el-button type="primary" size="small" :loading="submitting" @click="submitReply">发表回复</el-button>
            </div>
          </template>
        </div>
      </div>

      <!-- 话题列表视图 -->
      <div v-else class="forum-main">
        <!-- 顶部操作栏 -->
        <div class="forum-toolbar">
          <div class="cat-tabs">
            <span
              v-for="cat in categories"
              :key="cat.val"
              class="cat-tab"
              :class="{ active: selectedCat === cat.val }"
              @click="selectedCat = cat.val"
            >{{ cat.label }}</span>
          </div>
          <el-button
            v-if="isLoggedIn"
            type="primary"
            size="small"
            class="new-topic-btn"
            @click="showNewTopic = true"
          >+ 发起话题</el-button>
          <router-link v-else to="/login" class="new-topic-link">登录后发帖</router-link>
        </div>

        <!-- 排序切换 -->
        <div class="sort-bar">
          <span
            v-for="s in sorts"
            :key="s.val"
            class="sort-item"
            :class="{ active: selectedSort === s.val }"
            @click="selectedSort = s.val"
          >{{ s.label }}</span>
        </div>

        <div v-if="loading" class="loading-tip">加载中…</div>

        <!-- 话题列表 -->
        <div v-else class="topic-list">
          <div
            v-for="topic in filteredTopics"
            :key="topic.id"
            class="topic-row"
            @click="openTopic(topic)"
          >
            <div class="topic-avatar" :style="{ background: avatarColor(topic.author) }">
              {{ topic.author.charAt(0) }}
            </div>
            <div class="topic-main">
              <div class="topic-top-row">
                <span v-if="topic.pinned" class="pin-badge">置顶</span>
                <span class="topic-cat-tag" :class="topic.category">{{ catLabel(topic.category) }}</span>
                <span class="topic-title">{{ topic.title }}</span>
              </div>
              <div class="topic-bottom-row">
                <span class="topic-author">{{ topic.author }}</span>
                <span class="dot">·</span>
                <span class="topic-time">{{ topic.updatedAt }}</span>
                <span v-if="topic.lastReplyAuthor" class="last-reply">
                  <span class="dot">·</span>最后回复：{{ topic.lastReplyAuthor }}
                </span>
              </div>
            </div>
            <div class="topic-stats">
              <div class="stat-col">
                <div class="stat-num">{{ topic.replies.length }}</div>
                <div class="stat-label">回复</div>
              </div>
              <div class="stat-col">
                <div class="stat-num">{{ topic.views }}</div>
                <div class="stat-label">浏览</div>
              </div>
            </div>
          </div>

          <div v-if="filteredTopics.length === 0" class="empty-tip">暂无话题，快来发起讨论吧</div>
        </div>
      </div>
    </div>

    <!-- 发起话题对话框 -->
    <el-dialog title="发起话题" :visible.sync="showNewTopic" width="560px" :close-on-click-modal="false">
      <el-form :model="newTopicForm" label-width="70px" size="small">
        <el-form-item label="分类">
          <el-select v-model="newTopicForm.category" style="width:100%">
            <el-option
              v-for="cat in postCategories"
              :key="cat.val"
              :label="cat.label"
              :value="cat.val"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="标题">
          <el-input v-model="newTopicForm.title" maxlength="60" show-word-limit placeholder="请输入话题标题" />
        </el-form-item>
        <el-form-item label="内容">
          <el-input
            type="textarea"
            v-model="newTopicForm.content"
            :rows="6"
            maxlength="5000"
            show-word-limit
            placeholder="详细描述你的话题内容…"
          />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button size="small" @click="showNewTopic = false">取消</el-button>
        <el-button type="primary" size="small" :loading="submitting" @click="submitNewTopic">发布</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

function hashColor() { return '#e8e8e8' }

let nextId = 100

const mockTopics = [
  {
    id: 1, pinned: true, category: 'opening',
    title: '当头炮对屏风马，红方第五手最优解讨论',
    author: '棋道求索', views: 1842, likes: 36, liked: false,
    createdAt: '2026-05-15 10:22', updatedAt: '2026-05-17 18:04',
    lastReplyAuthor: '残局高手',
    content: '当头炮对屏风马是最经典的开局之一。近期研究发现红方第五手走马八进七和马二进三各有优劣，大家怎么看？欢迎分享实战经验和研究心得。',
    replies: [
      { id: 11, author: '残局高手', createdAt: '2026-05-16 09:14', likes: 12, liked: false,
        content: '个人偏好马八进七，中路压力更大，对方屏风马形难以展开。但遇到软化变例需要提前准备。' },
      { id: 12, author: '攻杀流', createdAt: '2026-05-17 14:33', likes: 8, liked: false,
        content: '马二进三更稳健，保持阵型完整性。职业比赛中两者都有用，看个人风格。' },
      { id: 13, author: '初学象棋', createdAt: '2026-05-17 18:04', likes: 3, liked: false,
        content: '作为初学者，感觉马八进七更容易理解，变化相对少一些，实战效果不错。' }
    ]
  },
  {
    id: 2, pinned: false, category: 'endgame',
    title: '车马胜单车的基本定式整理',
    author: '残局高手', views: 976, likes: 28, liked: false,
    createdAt: '2026-05-14 20:10', updatedAt: '2026-05-16 11:30',
    lastReplyAuthor: '棋道求索',
    content: '整理了常见的车马胜单车定式，包括"马低兵胜车"和"车马联攻"两种基本形态，附图解说明，希望对大家残局学习有帮助。\n\n一、马低兵胜车：马在高位配合低兵，利用将门限制对方车的活动空间……',
    replies: [
      { id: 21, author: '棋道求索', createdAt: '2026-05-15 08:45', likes: 15, liked: false,
        content: '整理得很全面！补充一点：车马胜单车还需注意"闷车"战术，当对方车陷入角落时胜率大增。' },
      { id: 22, author: '研究党', createdAt: '2026-05-16 11:30', likes: 7, liked: false,
        content: '感谢分享，这类定式是残局基础，建议新手反复练习。' }
    ]
  },
  {
    id: 3, pinned: false, category: 'tournament',
    title: '2025全国象棋锦标赛——王天一vs谢靖精彩对局分析',
    author: '赛事观察员', views: 2310, likes: 54, liked: false,
    createdAt: '2026-05-10 15:00', updatedAt: '2026-05-14 22:17',
    lastReplyAuthor: '攻杀流',
    content: '昨天全国赛半决赛，王天一执红对阵谢靖，开局走飞相局对挺卒，中盘出现精彩的马炮换双车牺牲，最终以一步"车踩中兵"奠定胜局。大家一起来复盘！',
    replies: [
      { id: 31, author: '棋谱收藏家', createdAt: '2026-05-11 09:22', likes: 20, liked: false,
        content: '那步马炮换双车真是神来之笔，牺牲物质换取绝对攻势，体现了王天一对局面的深刻理解。' },
      { id: 32, author: '攻杀流', createdAt: '2026-05-14 22:17', likes: 11, liked: false,
        content: '最后车踩中兵之后红方胜势已成，但谢靖的防御也相当顽强，拖到最后关头才认负。' }
    ]
  },
  {
    id: 4, pinned: false, category: 'player',
    title: '胡荣华九连冠时代的开局体系解析',
    author: '历史研究者', views: 1540, likes: 41, liked: false,
    createdAt: '2026-05-08 11:30', updatedAt: '2026-05-12 16:55',
    lastReplyAuthor: '历史研究者',
    content: '胡荣华先生创造了全国象棋个人赛九连冠的传奇纪录，其开局研究深度远超时代。本帖梳理其标志性的"仙人指路"和"飞相局"体系，欢迎共同研究。',
    replies: [
      { id: 41, author: '古谱爱好者', createdAt: '2026-05-09 14:00', likes: 18, liked: false,
        content: '胡老的棋风以灵活多变著称，同一局面往往有多套应对方案，这种"预备系统"的思想在当时非常超前。' },
      { id: 42, author: '历史研究者', createdAt: '2026-05-12 16:55', likes: 9, liked: false,
        content: '补充：胡老晚年接受采访时提到，开局最重要的是"掌握主动"，宁可牺牲一子也要争夺先手。' }
    ]
  },
  {
    id: 5, pinned: false, category: 'general',
    title: '推荐几本适合入门的象棋书籍',
    author: '书单达人', views: 890, likes: 22, liked: false,
    createdAt: '2026-05-06 09:00', updatedAt: '2026-05-10 19:48',
    lastReplyAuthor: '初学象棋',
    content: '整理了几本适合入门和进阶的象棋书籍推荐：\n1.《象棋入门》——基础规则与简单战术\n2.《七十二局》——经典古谱精讲\n3.《象棋残局大全》——系统学习残局\n4.《当头炮全攻略》——专项开局训练\n希望对大家有帮助！',
    replies: [
      { id: 51, author: '初学象棋', createdAt: '2026-05-10 19:48', likes: 14, liked: false,
        content: '感谢推荐！《七十二局》已经在看了，确实是经典，每一局都有深度。' }
    ]
  },
  {
    id: 6, pinned: false, category: 'opening',
    title: '顺炮直车对横车——黑方如何应对红方早出直车',
    author: '攻杀流', views: 760, likes: 17, liked: false,
    createdAt: '2026-05-04 16:40', updatedAt: '2026-05-08 10:20',
    lastReplyAuthor: '棋道求索',
    content: '顺炮局面中红方早出直车是常见的积极战法，黑方应对如不慎重容易陷入被动。本帖讨论黑方几种常见应对思路，欢迎交流。',
    replies: [
      { id: 61, author: '棋道求索', createdAt: '2026-05-08 10:20', likes: 8, liked: false,
        content: '黑方横车反击是常见思路，但时机很重要。过早出横车可能被红方"塞象眼"战术限制。' }
    ]
  }
]

export default {
  name: 'Forum',
  computed: {
    ...mapGetters('user', ['isLoggedIn']),
    ...mapState('user', ['userInfo']),
    filteredTopics() {
      let list = this.topics
      if (this.selectedCat !== 'all') {
        list = list.filter(t => t.category === this.selectedCat)
      }
      const pinned = list.filter(t => t.pinned)
      const normal = list.filter(t => !t.pinned)
      if (this.selectedSort === 'latest') {
        normal.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      } else if (this.selectedSort === 'hot') {
        normal.sort((a, b) => (b.views + b.replies.length * 10) - (a.views + a.replies.length * 10))
      }
      return [...pinned, ...normal]
    }
  },
  data() {
    return {
      loading: false,
      topics: JSON.parse(JSON.stringify(mockTopics)),
      currentTopic: null,
      selectedCat: 'all',
      selectedSort: 'latest',
      showNewTopic: false,
      submitting: false,
      replyContent: '',
      newTopicForm: { category: 'general', title: '', content: '' },
      categories: [
        { val: 'all', label: '全部' },
        { val: 'opening', label: '开局研究' },
        { val: 'endgame', label: '残局讨论' },
        { val: 'tournament', label: '赛事讨论' },
        { val: 'player', label: '棋手话题' },
        { val: 'general', label: '综合交流' }
      ],
      postCategories: [
        { val: 'opening', label: '开局研究' },
        { val: 'endgame', label: '残局讨论' },
        { val: 'tournament', label: '赛事讨论' },
        { val: 'player', label: '棋手话题' },
        { val: 'general', label: '综合交流' }
      ],
      sorts: [
        { val: 'latest', label: '最新回复' },
        { val: 'hot', label: '最热话题' }
      ]
    }
  },
  methods: {
    avatarColor(name) { return hashColor(name) },
    catLabel(val) {
      const map = { opening:'开局',endgame:'残局',tournament:'赛事',player:'棋手',general:'综合' }
      return map[val] || val
    },
    openTopic(topic) {
      topic.views++
      this.currentTopic = topic
      this.replyContent = ''
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    backToList() {
      this.currentTopic = null
    },
    likeTopic(topic) {
      if (!this.isLoggedIn) { this.$message.warning('请先登录'); return }
      topic.liked = !topic.liked
      topic.likes += topic.liked ? 1 : -1
    },
    likeReply(reply) {
      if (!this.isLoggedIn) { this.$message.warning('请先登录'); return }
      reply.liked = !reply.liked
      reply.likes += reply.liked ? 1 : -1
    },
    submitReply() {
      if (!this.replyContent.trim()) { this.$message.warning('回复内容不能为空'); return }
      this.submitting = true
      setTimeout(() => {
        const now = new Date()
        const pad = n => String(n).padStart(2,'0')
        const ts = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
        const author = this.userInfo ? (this.userInfo.nickname || this.userInfo.phone) : '匿名用户'
        this.currentTopic.replies.push({
          id: nextId++, author, createdAt: ts, likes: 0, liked: false,
          content: this.replyContent.trim()
        })
        this.currentTopic.lastReplyAuthor = author
        this.currentTopic.updatedAt = ts
        this.replyContent = ''
        this.submitting = false
        this.$message.success('回复成功')
        this.$nextTick(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }))
      }, 600)
    },
    submitNewTopic() {
      if (!this.newTopicForm.title.trim()) { this.$message.warning('请填写话题标题'); return }
      if (!this.newTopicForm.content.trim()) { this.$message.warning('请填写话题内容'); return }
      this.submitting = true
      setTimeout(() => {
        const now = new Date()
        const pad = n => String(n).padStart(2,'0')
        const ts = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
        const author = this.userInfo ? (this.userInfo.nickname || this.userInfo.phone) : '匿名用户'
        this.topics.unshift({
          id: nextId++, pinned: false,
          category: this.newTopicForm.category,
          title: this.newTopicForm.title.trim(),
          author, views: 0, likes: 0, liked: false,
          createdAt: ts, updatedAt: ts,
          lastReplyAuthor: null,
          content: this.newTopicForm.content.trim(),
          replies: []
        })
        this.newTopicForm = { category: 'general', title: '', content: '' }
        this.showNewTopic = false
        this.submitting = false
        this.$message.success('话题发布成功')
      }, 600)
    }
  }
}
</script>

<style scoped>
.forum-page { background: #fff; min-height: calc(100vh - 56px); padding-bottom: 60px; }
.container { max-width: 900px; margin: 0 auto; padding: 0 24px; }
.page-header { padding: 36px 0 20px; border-bottom: 1px solid #e8e8e8; margin-bottom: 24px; }
.page-title { font-size: 22px; font-weight: 700; color: #1a1a1a; font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif; margin: 0 0 6px; }
.page-desc { font-size: 13px; color: #aaa; margin: 0; }

.forum-toolbar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 0; }
.cat-tabs { display: flex; gap: 0; flex: 1; border-bottom: 1px solid #e8e8e8; flex-wrap: wrap; }
.cat-tab { padding: 7px 14px; font-size: 13px; color: #888; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -1px; transition: color 0.15s; }
.cat-tab:hover { color: #333; }
.cat-tab.active { color: #1a1a1a; font-weight: 600; border-bottom-color: #1a1a1a; }
.new-topic-btn { flex-shrink: 0; margin-bottom: 1px; }
.new-topic-link { font-size: 13px; color: #555; flex-shrink: 0; }

.sort-bar { display: flex; gap: 16px; margin: 14px 0; }
.sort-item { font-size: 13px; color: #aaa; cursor: pointer; transition: color 0.1s; }
.sort-item:hover { color: #555; }
.sort-item.active { color: #1a1a1a; font-weight: 600; }

.topic-list { background: #fff; border: 1px solid #e8e8e8; border-radius: 4px; overflow: hidden; }
.topic-row { display: flex; align-items: center; gap: 12px; padding: 14px 18px; border-bottom: 1px solid #f0f0f0; cursor: pointer; transition: background 0.15s; }
.topic-row:last-child { border-bottom: none; }
.topic-row:hover { background: #f5f5f5; }

.topic-avatar { width: 36px; height: 36px; border-radius: 4px; background: #e8e8e8; color: #555; font-size: 14px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.topic-main { flex: 1; min-width: 0; }
.topic-top-row { display: flex; align-items: center; gap: 6px; margin-bottom: 5px; }
.topic-bottom-row { display: flex; align-items: center; gap: 4px; font-size: 12px; color: #aaa; }
.topic-title { font-size: 14px; color: #222; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.topic-author { color: #555; }
.dot { color: #ddd; }
.last-reply { color: #aaa; }
.pin-badge { background: #333; color: #fff; font-size: 11px; padding: 1px 6px; border-radius: 2px; flex-shrink: 0; }
.topic-cat-tag { font-size: 11px; padding: 1px 7px; border-radius: 2px; flex-shrink: 0; color: #666; border: 1px solid #e8e8e8; background: #fafafa; }

.topic-stats { display: flex; gap: 16px; flex-shrink: 0; }
.stat-col { text-align: center; min-width: 36px; }
.stat-num { font-size: 15px; font-weight: 600; color: #333; }
.stat-label { font-size: 11px; color: #aaa; }

.empty-tip { padding: 48px 0; text-align: center; color: #bbb; font-size: 14px; }
.loading-tip { padding: 40px 0; text-align: center; color: #aaa; }

.detail-back { display: inline-block; padding: 6px 0; margin-bottom: 16px; font-size: 13px; color: #555; cursor: pointer; }
.detail-back:hover { color: #1a1a1a; }

.post-card { background: #fff; border: 1px solid #e8e8e8; border-radius: 4px; padding: 20px 24px; margin-bottom: 10px; }
.original-post { border-left: 3px solid #333; }

.post-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.post-avatar { width: 34px; height: 34px; border-radius: 4px; background: #e8e8e8; color: #555; font-size: 14px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.post-avatar.small { width: 28px; height: 28px; font-size: 12px; }
.post-meta { display: flex; flex-direction: column; gap: 2px; flex: 1; }
.post-author { font-size: 13px; font-weight: 600; color: #222; }
.post-time { font-size: 12px; color: #bbb; }
.post-title { font-size: 18px; font-weight: 700; color: #1a1a1a; margin: 0 0 14px; line-height: 1.5; }
.post-content { font-size: 14px; color: #444; line-height: 1.8; white-space: pre-wrap; }
.post-footer { display: flex; align-items: center; gap: 18px; margin-top: 16px; padding-top: 12px; border-top: 1px solid #f0f0f0; font-size: 13px; color: #aaa; }
.stat-item { display: flex; align-items: center; gap: 4px; }
.like-btn { margin-left: auto; cursor: pointer; color: #bbb; font-size: 13px; padding: 3px 12px; border-radius: 2px; border: 1px solid #e8e8e8; transition: all 0.15s; }
.like-btn:hover, .like-btn.liked { color: #333; border-color: #333; }
.like-btn.small { margin-left: auto; }

.replies-section { margin-top: 8px; }
.replies-title { font-size: 14px; font-weight: 600; color: #555; margin-bottom: 12px; padding-left: 4px; }
.empty-replies { text-align: center; padding: 32px 0; color: #bbb; font-size: 13px; }
.reply-card { border-left: 3px solid #e8e8e8; }
.reply-floor { font-size: 12px; color: #bbb; min-width: 24px; }

.reply-box { background: #fff; border: 1px solid #e8e8e8; border-radius: 4px; padding: 20px 24px; margin-top: 10px; }
.reply-box-title { font-size: 14px; font-weight: 600; color: #555; margin-bottom: 14px; }
.login-tip { font-size: 13px; color: #aaa; padding: 12px 0; }
.login-tip a { color: #333; }
.reply-submit-row { margin-top: 10px; text-align: right; }
</style>
