<template>
  <div class="forum-page">

    <div class="forum-layout">

      <!-- ───────── 主内容 ───────── -->
      <div class="forum-main">

        <!-- 工具栏：搜索 + 分类标签（与 Resources / Tournament 一致） -->
        <div class="toolbar">
          <div class="search-bar">
            <input
              v-model="keyword"
              type="text"
              placeholder="搜索话题标题、作者…"
              class="search-input"
              @input="currentTopic = null"
            />
            <button v-if="keyword" class="clear-btn" @click="keyword = ''">✕</button>
          </div>
          <div class="cat-tabs">
            <button
              v-for="cat in categories"
              :key="cat.val"
              :class="['cat-tab', { active: selectedCat === cat.val }]"
              @click="selectedCat = cat.val; currentTopic = null"
            >{{ cat.label }}</button>
          </div>
          <div class="toolbar-right">
            <div class="sort-tabs">
              <span
                v-for="s in sorts"
                :key="s.val"
                :class="['sort-tab', { active: selectedSort === s.val }]"
                @click="selectedSort = s.val"
              >{{ s.label }}</span>
            </div>
            <button v-if="isLoggedIn" class="new-topic-btn" @click="showNewTopic = true">+ 发起话题</button>
            <router-link v-else to="/login" class="new-topic-btn">登录后发帖</router-link>
          </div>
        </div>

        <!-- ── 帖子详情 ── -->
        <div v-if="currentTopic" class="topic-detail">
          <div class="detail-back" @click="backToList">← 返回列表</div>

          <!-- 原帖 -->
          <div class="post-card original-post">
            <div class="post-header">
              <div class="post-avatar" :style="{ background: avatarBg(currentTopic.author) }">
                {{ currentTopic.author.charAt(0) }}
              </div>
              <div class="post-meta">
                <span class="post-author">{{ currentTopic.author }}</span>
                <span class="post-time">{{ currentTopic.createdAt }}</span>
              </div>
              <span class="cat-badge" :class="currentTopic.category">{{ catLabel(currentTopic.category) }}</span>
            </div>
            <h2 class="post-title">{{ currentTopic.title }}</h2>
            <div class="post-content">{{ currentTopic.content }}</div>

            <!-- 附件棋谱 -->
            <div v-if="currentTopic.attachment" class="manual-card">
              <div class="manual-card-header" @click="currentTopic.attachment._open = !currentTopic.attachment._open">
                <span class="manual-card-icon">♟</span>
                <span class="manual-card-title">{{ currentTopic.attachment.title || '附件棋谱' }}</span>
                <span class="manual-card-count">{{ currentTopic.attachment.moves.length }} 步</span>
                <span class="manual-card-toggle">{{ currentTopic.attachment._open ? '收起 ▲' : '展开 ▼' }}</span>
              </div>
              <div v-if="currentTopic.attachment._open" class="manual-card-body">
                <div class="moves-grid">
                  <div
                    v-for="(move, i) in currentTopic.attachment.moves"
                    :key="i"
                    :class="['move-item', i % 2 === 0 ? 'red' : 'black']"
                  >
                    <span class="move-num">{{ Math.floor(i / 2) + 1 }}{{ i % 2 === 0 ? '.' : '…' }}</span>
                    <span class="move-text">{{ move }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="post-footer">
              <span class="footer-stat">{{ currentTopic.views }} 浏览</span>
              <span class="footer-stat">{{ currentTopic.replies.length }} 回复</span>
              <span :class="['like-btn', { liked: currentTopic.liked }]" @click="likeTopic(currentTopic)">
                ♥ {{ currentTopic.likes }}
              </span>
            </div>
          </div>

          <!-- 回复列表 -->
          <div class="replies-section">
            <div class="section-title">全部回复（{{ currentTopic.replies.length }}）</div>
            <div class="list-wrap">
              <div v-if="currentTopic.replies.length === 0" class="empty-tip">暂无回复，来说第一句吧</div>
              <div
                v-for="(reply, idx) in currentTopic.replies"
                :key="reply.id"
                class="reply-row"
              >
                <span class="floor-num">#{{ idx + 1 }}</span>
                <div class="post-avatar small" :style="{ background: avatarBg(reply.author) }">
                  {{ reply.author.charAt(0) }}
                </div>
                <div class="reply-body">
                  <div class="reply-head">
                    <span class="post-author">{{ reply.author }}</span>
                    <span class="post-time">{{ reply.createdAt }}</span>
                    <span :class="['like-btn', 'small', { liked: reply.liked }]" @click="likeReply(reply)">
                      ♥ {{ reply.likes }}
                    </span>
                  </div>
                  <div class="post-content">{{ reply.content }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 发表回复 -->
          <div class="reply-box">
            <div class="section-title">发表回复</div>
            <div v-if="!isLoggedIn" class="login-tip">
              请 <router-link to="/login">登录</router-link> 后发表回复
            </div>
            <template v-else>
              <textarea
                v-model="replyContent"
                rows="4"
                placeholder="写下你的回复…"
                maxlength="2000"
                class="reply-textarea"
              />
              <div class="reply-submit-row">
                <button class="btn-confirm" :disabled="submitting" @click="submitReply">
                  {{ submitting ? '提交中…' : '发表回复' }}
                </button>
              </div>
            </template>
          </div>
        </div>

        <!-- ── 话题列表 ── -->
        <div v-else>
          <div v-if="loading" class="loading-tip">加载中…</div>
          <div v-else class="list-wrap">
            <div
              v-for="topic in filteredTopics"
              :key="topic.id"
              class="topic-row"
              @click="openTopic(topic)"
            >
              <div class="topic-avatar" :style="{ background: avatarBg(topic.author) }">
                {{ topic.author.charAt(0) }}
              </div>
              <div class="topic-body">
                <div class="topic-title-row">
                  <span v-if="topic.pinned" class="pin-badge">置顶</span>
                  <span class="topic-title">{{ topic.title }}</span>
                  <span v-if="topic.attachment" class="attach-badge" title="含附件棋谱">♟ 棋谱</span>
                </div>
                <div class="topic-meta-row">
                  <span class="meta-item">{{ topic.author }}</span>
                  <span class="meta-sep">·</span>
                  <span class="meta-item">{{ topic.views }} 浏览</span>
                  <span class="meta-sep">·</span>
                  <span class="meta-item">{{ topic.replies.length }} 回复</span>
                  <template v-if="topic.lastReplyAuthor">
                    <span class="meta-sep">·</span>
                    <span class="meta-item">最后回复：{{ topic.lastReplyAuthor }}</span>
                  </template>
                  <span class="meta-sep">·</span>
                  <span class="meta-item">{{ topic.updatedAt }}</span>
                </div>
              </div>
              <span class="cat-badge" :class="topic.category">{{ catLabel(topic.category) }}</span>
            </div>
            <div v-if="filteredTopics.length === 0" class="empty-tip">暂无话题，快来发起讨论吧</div>
          </div>

          <!-- 分页 -->
          <div class="pagination-wrap">
            <span class="total-count">共 {{ filteredTopics.length }} 个话题</span>
          </div>
        </div>

      </div>

    </div>

    <!-- ── 发起话题弹窗 ── -->
    <div v-if="showNewTopic" class="dialog-mask" @click.self="showNewTopic = false">
      <div class="dialog">
        <div class="dialog-header">
          <span>发起话题</span>
          <button class="dialog-close" @click="showNewTopic = false">✕</button>
        </div>
        <div class="dialog-body">
          <div class="form-field">
            <label>分类</label>
            <select v-model="newTopicForm.category">
              <option v-for="cat in postCategories" :key="cat.val" :value="cat.val">{{ cat.label }}</option>
            </select>
          </div>
          <div class="form-field">
            <label>标题</label>
            <input v-model="newTopicForm.title" type="text" maxlength="60" placeholder="请输入话题标题" />
          </div>
          <div class="form-field">
            <label>内容</label>
            <textarea v-model="newTopicForm.content" rows="5" maxlength="5000" placeholder="详细描述你的话题内容…" />
          </div>

          <!-- 附件棋谱 -->
          <div class="attach-toggle" @click="newTopicForm.attachEnabled = !newTopicForm.attachEnabled">
            <span class="attach-icon">♟</span>
            <span class="attach-label">{{ newTopicForm.attachEnabled ? '取消附件棋谱' : '添加附件棋谱' }}</span>
            <span class="attach-arrow">{{ newTopicForm.attachEnabled ? '▲' : '▼' }}</span>
          </div>

          <template v-if="newTopicForm.attachEnabled">
            <div class="attach-box">
              <div class="form-field">
                <label>棋谱名称</label>
                <input v-model="newTopicForm.attachTitle" type="text" maxlength="40" placeholder="例：当头炮对屏风马·第三局" />
              </div>
              <div class="form-field">
                <label>棋步记录 <span class="label-hint">每行一步，红黑交替，例：炮二平五 / 炮８平５</span></label>
                <textarea
                  v-model="newTopicForm.attachMoves"
                  rows="6"
                  placeholder="炮二平五&#10;炮８平５&#10;马二进三&#10;马８进７&#10;…"
                  class="moves-textarea"
                />
              </div>
              <div class="attach-preview" v-if="parsedMoves.length">
                <span class="preview-label">已录入 {{ parsedMoves.length }} 步</span>
                <div class="preview-moves">
                  <span
                    v-for="(m, i) in parsedMoves.slice(0, 10)"
                    :key="i"
                    :class="['preview-move', i % 2 === 0 ? 'red' : 'black']"
                  >{{ m }}</span>
                  <span v-if="parsedMoves.length > 10" class="preview-more">…共 {{ parsedMoves.length }} 步</span>
                </div>
              </div>
            </div>
          </template>
        </div>
        <div class="dialog-footer">
          <button class="btn-cancel" @click="showNewTopic = false">取消</button>
          <button class="btn-confirm" :disabled="submitting" @click="submitNewTopic">
            {{ submitting ? '发布中…' : '发布' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

const AVATAR_COLORS = ['#2a9fd6','#2980b9','#27ae60','#8e44ad','#d35400','#16a085','#2c3e50','#8B1A1A']
function avatarBg(name) {
  if (!name) return AVATAR_COLORS[0]
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}

let nextId = 100

export default {
  name: 'Forum',
  computed: {
    ...mapGetters('user', ['isLoggedIn']),
    ...mapState('user', ['userInfo']),
    currentUsername() {
      return this.userInfo ? (this.userInfo.nickname || this.userInfo.phone) : ''
    },
    parsedMoves() {
      return this.newTopicForm.attachMoves
        .split('\n')
        .map(s => s.trim())
        .filter(s => s.length > 0)
    },
    filteredTopics() {
      let list = this.topics
      if (this.selectedCat !== 'all') list = list.filter(t => t.category === this.selectedCat)
      const kw = this.keyword.trim().toLowerCase()
      if (kw) list = list.filter(t => t.title.toLowerCase().includes(kw) || t.author.toLowerCase().includes(kw))
      const pinned = list.filter(t => t.pinned)
      const normal = list.filter(t => !t.pinned)
      if (this.selectedSort === 'hot') normal.sort((a, b) => (b.views + b.replies.length * 10) - (a.views + a.replies.length * 10))
      else normal.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      return [...pinned, ...normal]
    },
  },
  data() {
    return {
      loading: false,
      topics: [],
      currentTopic: null,
      selectedCat: 'all',
      selectedSort: 'latest',
      keyword: '',
      showNewTopic: false,
      submitting: false,
      replyContent: '',
      newTopicForm: { category: 'general', title: '', content: '', attachEnabled: false, attachTitle: '', attachMoves: '' },
      categories: [
        { val: 'all',        label: '全部' },
        { val: 'opening',    label: '开局研究' },
        { val: 'endgame',    label: '残局讨论' },
        { val: 'tournament', label: '赛事讨论' },
        { val: 'player',     label: '棋手话题' },
        { val: 'general',    label: '综合交流' }
      ],
      postCategories: [
        { val: 'opening',    label: '开局研究' },
        { val: 'endgame',    label: '残局讨论' },
        { val: 'tournament', label: '赛事讨论' },
        { val: 'player',     label: '棋手话题' },
        { val: 'general',    label: '综合交流' }
      ],
      sorts: [
        { val: 'latest', label: '最新回复' },
        { val: 'hot',    label: '最热话题' }
      ]
    }
  },
  methods: {
    avatarBg,
    catLabel(val) {
      return { opening:'开局', endgame:'残局', tournament:'赛事', player:'棋手', general:'综合' }[val] || val
    },
    openTopic(topic) {
      topic.views++
      this.currentTopic = topic
      this.replyContent = ''
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    backToList() { this.currentTopic = null },
    likeTopic(topic) {
      if (!this.isLoggedIn) { this.$message && this.$message.warning('请先登录'); return }
      topic.liked = !topic.liked
      topic.likes += topic.liked ? 1 : -1
    },
    likeReply(reply) {
      if (!this.isLoggedIn) { this.$message && this.$message.warning('请先登录'); return }
      reply.liked = !reply.liked
      reply.likes += reply.liked ? 1 : -1
    },
    submitReply() {
      if (!this.replyContent.trim()) { this.$message && this.$message.warning('回复内容不能为空'); return }
      this.submitting = true
      setTimeout(() => {
        const ts = this.nowTs()
        const author = this.userInfo ? (this.userInfo.nickname || this.userInfo.phone) : '匿名用户'
        this.currentTopic.replies.push({ id: nextId++, author, createdAt: ts, likes: 0, liked: false, content: this.replyContent.trim() })
        this.currentTopic.lastReplyAuthor = author
        this.currentTopic.updatedAt = ts
        this.replyContent = ''
        this.submitting = false
        this.$message && this.$message.success('回复成功')
        this.$nextTick(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }))
      }, 600)
    },
    submitNewTopic() {
      if (!this.newTopicForm.title.trim()) { this.$message && this.$message.warning('请填写话题标题'); return }
      if (!this.newTopicForm.content.trim()) { this.$message && this.$message.warning('请填写话题内容'); return }
      this.submitting = true
      setTimeout(() => {
        const ts = this.nowTs()
        const author = this.userInfo ? (this.userInfo.nickname || this.userInfo.phone) : '匿名用户'
        const attachment = (this.newTopicForm.attachEnabled && this.parsedMoves.length)
          ? { title: this.newTopicForm.attachTitle.trim() || '附件棋谱', moves: this.parsedMoves, _open: false }
          : null
        this.topics.unshift({
          id: nextId++, pinned: false,
          category: this.newTopicForm.category,
          title: this.newTopicForm.title.trim(),
          author, views: 0, likes: 0, liked: false,
          createdAt: ts, updatedAt: ts, lastReplyAuthor: null,
          content: this.newTopicForm.content.trim(),
          attachment,
          replies: []
        })
        this.newTopicForm = { category: 'general', title: '', content: '', attachEnabled: false, attachTitle: '', attachMoves: '' }
        this.showNewTopic = false
        this.submitting = false
        this.$message && this.$message.success('话题发布成功')
      }, 600)
    },
    nowTs() {
      const now = new Date()
      const p = n => String(n).padStart(2, '0')
      return `${now.getFullYear()}-${p(now.getMonth()+1)}-${p(now.getDate())} ${p(now.getHours())}:${p(now.getMinutes())}`
    }
  }
}
</script>

<style scoped>
/* ── 页面结构 ── */
.forum-page { padding-bottom: 48px; }

/* 主布局 */
.forum-layout {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}
.forum-main { flex: 1; min-width: 0; }

/* ── 工具栏（与 Resources / Tournament 完全一致） ── */
.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.search-bar {
  position: relative;
  min-width: 160px;
  max-width: 240px;
}
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
  right: 10px; top: 50%;
  transform: translateY(-50%);
  background: none; border: none;
  color: #bbb; cursor: pointer; font-size: 13px; padding: 0;
}
.clear-btn:hover { color: #888; }

/* 分类标签（与 Resources cat-tabs 完全一致） */
.cat-tabs {
  display: flex;
  overflow: hidden;
  border: 1px solid #d6eaf5;
}
.cat-tab {
  padding: 0 14px;
  height: 38px;
  font-size: 12px;
  color: #999;
  cursor: pointer;
  border: none;
  background: #fff;
  transition: all 0.12s;
}
.cat-tab + .cat-tab { border-left: 1px solid #d6eaf5; }
.cat-tab:hover:not(.active) { background: #e8f4fb; color: #2a9fd6; }
.cat-tab.active { background: #2a9fd6; color: #fff; font-weight: 600; }

/* 排序 + 发帖按钮 */
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}
.sort-tabs { display: flex; gap: 0; }
.sort-tab {
  font-size: 12px; color: #999; cursor: pointer;
  padding: 2px 8px 2px 0; background: none; border: none;
  transition: color 0.12s;
}
.sort-tab:hover   { color: #2a9fd6; }
.sort-tab.active  { color: #2a9fd6; font-weight: 600; }
.new-topic-btn {
  height: 38px; padding: 0 16px;
  background: #2a9fd6; color: #fff;
  border: none; font-size: 13px; font-weight: 500;
  cursor: pointer; transition: background 0.15s;
  text-decoration: none; display: inline-flex; align-items: center;
}
.new-topic-btn:hover { background: #1a8ac0; }

/* ── 话题列表（与 Resources list-wrap 完全一致） ── */
.list-wrap {
  background: #fff;
  border: 1px solid #e8e8e8;
  overflow: hidden;
}
.topic-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 16px;
  border-bottom: 1px solid #f4f4f4;
  cursor: pointer;
  transition: background 0.1s;
}
.topic-row:last-child { border-bottom: none; }
.topic-row:hover { background: #fafafa; }
.topic-row:hover .topic-title { color: #2a9fd6; }

.topic-avatar {
  width: 30px; height: 30px; border-radius: 50%;
  color: #fff; font-size: 12px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.topic-body { flex: 1; min-width: 0; }
.topic-title-row {
  display: flex; align-items: center; gap: 6px; margin-bottom: 3px;
}
.topic-title {
  font-size: 14px; font-weight: 500; color: #333;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  transition: color 0.12s;
}
.pin-badge {
  background: #2a9fd6; color: #fff;
  font-size: 10px; padding: 1px 5px; flex-shrink: 0;
}
.topic-meta-row {
  display: flex; align-items: center; flex-wrap: wrap;
  font-size: 12px;
}
.meta-item { color: #bbb; }
.meta-sep  { color: #e0e0e0; margin: 0 4px; }

/* 分类徽章（与 Resources cat-tag 完全一致） */
.cat-badge {
  font-size: 11px; padding: 2px 7px; flex-shrink: 0; font-weight: 500;
}
.cat-badge.opening    { background: #e6f4ff; color: #2a9fd6;  border: 1px solid #b8dff2; }
.cat-badge.endgame    { background: #f0faf2; color: #52b26b;  border: 1px solid #c3e8cc; }
.cat-badge.tournament { background: #fdf8e8; color: #e6a817;  border: 1px solid #f5dfa0; }
.cat-badge.player     { background: #f5f0ff; color: #7c3aed;  border: 1px solid #ddd6fe; }
.cat-badge.general    { background: #f5f5f5; color: #888;     border: 1px solid #e0e0e0; }

.empty-tip    { padding: 48px 0; text-align: center; color: #ccc; font-size: 14px; }
.loading-tip  { padding: 40px 0; text-align: center; color: #bbb; font-size: 14px; }

/* 分页 */
.pagination-wrap {
  display: flex; align-items: center; gap: 16px; padding: 14px 0 4px;
}
.total-count { font-size: 13px; color: #bbb; }

/* ── 帖子详情 ── */
.topic-detail { display: flex; flex-direction: column; gap: 12px; }
.detail-back {
  font-size: 13px; color: #999; cursor: pointer;
  padding: 4px 0 6px; display: inline-block; transition: color 0.12s;
}
.detail-back:hover { color: #2a9fd6; }

.post-card {
  background: #fff;
  border: 1px solid #e8e8e8;
  padding: 20px;
}
.original-post { border-left: 3px solid #8B1A1A; }

.post-header {
  display: flex; align-items: center; gap: 10px; margin-bottom: 14px;
}
.post-avatar {
  width: 32px; height: 32px; border-radius: 50%;
  color: #fff; font-size: 13px; font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.post-avatar.small { width: 26px; height: 26px; font-size: 11px; }
.post-meta { flex: 1; display: flex; flex-direction: column; gap: 1px; }
.post-author { font-size: 13px; font-weight: 600; color: #222; }
.post-time   { font-size: 11px; color: #bbb; }
.post-title  { font-size: 18px; font-weight: 700; color: #111; margin: 0 0 14px; line-height: 1.5; }
.post-content {
  font-size: 14px; color: #444; line-height: 1.85; white-space: pre-wrap;
}
.post-footer {
  display: flex; align-items: center; gap: 16px;
  margin-top: 16px; padding-top: 12px; border-top: 1px solid #f4f4f4;
  font-size: 12px; color: #bbb;
}
.like-btn {
  margin-left: auto; cursor: pointer; color: #bbb; font-size: 12px;
  padding: 3px 10px; border: 1px solid #e8e8e8; background: none;
  transition: all 0.15s;
}
.like-btn:hover, .like-btn.liked { color: #8B1A1A; border-color: #8B1A1A; }
.like-btn.small { margin-left: auto; }

/* 回复区 */
.section-title {
  font-size: 14px; font-weight: 700; color: #333;
  margin-bottom: 10px; padding-left: 10px; position: relative;
}
.section-title::before {
  content: ''; position: absolute; left: 0; top: 50%;
  transform: translateY(-50%); width: 3px; height: 14px; background: #8B1A1A;
}
.replies-section { display: flex; flex-direction: column; gap: 0; }

.reply-row {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 14px 16px; border-bottom: 1px solid #f4f4f4;
}
.reply-row:last-child { border-bottom: none; }
.floor-num { font-size: 11px; color: #ccc; min-width: 22px; padding-top: 2px; }
.reply-body { flex: 1; }
.reply-head {
  display: flex; align-items: center; gap: 8px; margin-bottom: 8px;
}

/* 发表回复 */
.reply-box {
  background: #fff; border: 1px solid #e8e8e8; padding: 20px;
}
.reply-textarea {
  width: 100%; padding: 10px 12px;
  font-size: 14px; color: #333;
  border: 1px solid #e0e0e0; background: #fafafa;
  outline: none; resize: vertical; font-family: inherit;
  transition: border-color 0.15s; box-sizing: border-box;
}
.reply-textarea:focus { border-color: #2a9fd6; background: #fff; }
.login-tip { font-size: 13px; color: #aaa; padding: 8px 0; }
.login-tip a { color: #2a9fd6; }
.reply-submit-row { margin-top: 10px; text-align: right; }


/* ── 附件棋谱（弹窗内） ── */
.attach-toggle {
  display: flex; align-items: center; gap: 8px;
  padding: 9px 12px; border: 1px dashed #d6eaf5;
  cursor: pointer; background: #f8fbff; transition: all 0.12s;
  font-size: 13px; color: #2a9fd6;
  user-select: none;
}
.attach-toggle:hover { background: #e8f4fb; border-color: #2a9fd6; }
.attach-icon  { font-size: 15px; }
.attach-label { flex: 1; font-weight: 500; }
.attach-arrow { font-size: 10px; color: #aaa; }

.attach-box {
  border: 1px solid #d6eaf5; padding: 14px;
  background: #f8fbff; display: flex; flex-direction: column; gap: 12px;
}
.label-hint { font-size: 11px; color: #bbb; font-weight: normal; margin-left: 4px; }
.moves-textarea {
  font-family: 'Courier New', Consolas, monospace;
  font-size: 13px; line-height: 1.8;
}
.attach-preview {
  display: flex; flex-direction: column; gap: 6px;
}
.preview-label { font-size: 11px; color: #888; }
.preview-moves { display: flex; flex-wrap: wrap; gap: 4px; }
.preview-move {
  font-size: 12px; padding: 2px 8px; border: 1px solid;
}
.preview-move.red   { color: #c0392b; border-color: #f5b8b2; background: #fdf0ef; }
.preview-move.black { color: #333;    border-color: #ddd;    background: #f5f5f5; }
.preview-more { font-size: 12px; color: #bbb; align-self: center; }

/* 话题列表附件标记 */
.attach-badge {
  flex-shrink: 0; font-size: 11px; padding: 1px 7px;
  background: #f0faf2; color: #52b26b; border: 1px solid #c3e8cc;
}

/* 帖子详情中的棋谱卡片 */
.manual-card {
  margin-top: 16px;
  border: 1px solid #d6eaf5; overflow: hidden;
}
.manual-card-header {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 14px; background: #f0f8fd;
  cursor: pointer; user-select: none;
  transition: background 0.12s;
}
.manual-card-header:hover { background: #e8f4fb; }
.manual-card-icon  { font-size: 16px; }
.manual-card-title { flex: 1; font-size: 14px; font-weight: 600; color: #1a1a1a; }
.manual-card-count { font-size: 12px; color: #2a9fd6; }
.manual-card-toggle { font-size: 11px; color: #aaa; margin-left: 8px; }

.manual-card-body { padding: 14px; background: #fff; }
.moves-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
}
.move-item {
  display: flex; align-items: center; gap: 4px;
  padding: 5px 8px; font-size: 13px;
  border: 1px solid #f0f0f0;
}
.move-item.red   { background: #fdf0ef; }
.move-item.black { background: #f5f5f5; }
.move-num  { font-size: 10px; color: #bbb; min-width: 20px; }
.move-text { font-weight: 500; color: #222; }

/* ── 发帖弹窗（与其他弹窗完全一致） ── */
.dialog-mask {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.3);
  z-index: 2000;
  display: flex; align-items: center; justify-content: center;
}
.dialog {
  width: 520px; background: #fff;
  border: 1px solid #d6eaf5;
  display: flex; flex-direction: column;
  max-height: 90vh;
}
.dialog-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 20px; border-bottom: 1px solid #f0f0f0;
  font-size: 15px; font-weight: 600; color: #111;
}
.dialog-close {
  background: none; border: none; color: #bbb; font-size: 14px; cursor: pointer; padding: 0;
}
.dialog-close:hover { color: #555; }
.dialog-body {
  padding: 20px; display: flex; flex-direction: column; gap: 14px; overflow-y: auto;
}
.form-field { display: flex; flex-direction: column; gap: 5px; }
.form-field label { font-size: 12px; color: #888; font-weight: 500; }
.form-field input,
.form-field select,
.form-field textarea {
  width: 100%; padding: 8px 10px;
  font-size: 13px; color: #333;
  border: 1px solid #e0e0e0; background: #fff; outline: none;
  transition: border-color 0.15s; font-family: inherit; box-sizing: border-box;
}
.form-field input:focus,
.form-field select:focus,
.form-field textarea:focus { border-color: #2a9fd6; }
.form-field textarea { resize: vertical; }
.dialog-footer {
  display: flex; justify-content: flex-end; gap: 10px;
  padding: 14px 20px; border-top: 1px solid #f0f0f0;
}
.btn-cancel {
  padding: 7px 20px; border: 1px solid #e0e0e0;
  background: #fff; font-size: 13px; color: #555; cursor: pointer;
}
.btn-cancel:hover { background: #f5f5f5; }
.btn-confirm {
  padding: 7px 20px; border: none;
  background: #2a9fd6; color: #fff;
  font-size: 13px; font-weight: 500; cursor: pointer;
  transition: background 0.15s; font-family: inherit;
}
.btn-confirm:hover:not(:disabled) { background: #1a8ac0; }
.btn-confirm:disabled { opacity: 0.4; cursor: not-allowed; }

@media (max-width: 768px) {
  .forum-sidebar { display: none; }
  .cat-tabs { display: none; }
  .toolbar-right { margin-left: 0; }
}
</style>
