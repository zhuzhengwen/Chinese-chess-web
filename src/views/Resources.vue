<template>
  <div class="resources-page">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">资源</h1>
        <p class="page-desc">中国象棋最新资讯，赛事动态、棋界要闻一站汇聚</p>
      </div>

      <div class="main-layout">
        <!-- 左侧新闻主区 -->
        <div class="news-main">
          <!-- 分类标签 -->
          <div class="cat-tabs">
            <span
              v-for="cat in categories"
              :key="cat.val"
              class="cat-tab"
              :class="{ active: selectedCat === cat.val }"
              @click="selectedCat = cat.val"
            >{{ cat.label }}</span>
          </div>

          <div v-if="loading" class="loading-tip">加载中…</div>
          <div v-else>
            <!-- 置顶大图新闻 -->
            <div v-if="topNews" class="top-news" @click="openNews(topNews)">
              <div class="top-news-img">
                <div class="img-placeholder">
                  <span class="img-char">{{ topNews.source.charAt(0) }}</span>
                </div>
                <span class="top-badge">头条</span>
              </div>
              <div class="top-news-body">
                <div class="news-cat-tag">{{ topNews.category }}</div>
                <h2 class="top-news-title">{{ topNews.title }}</h2>
                <p class="top-news-summary">{{ topNews.summary }}</p>
                <div class="news-meta">
                  <span class="news-source">{{ topNews.source }}</span>
                  <span class="meta-sep">·</span>
                  <span class="news-date">{{ topNews.date }}</span>
                </div>
              </div>
            </div>

            <!-- 新闻列表 -->
            <div class="news-list">
              <div
                v-for="item in filteredList"
                :key="item.id"
                class="news-row"
                @click="openNews(item)"
              >
                <div class="news-index">{{ item.id }}</div>
                <div class="news-body">
                  <div class="news-row-head">
                    <span class="news-cat-tag small">{{ item.category }}</span>
                    <h3 class="news-row-title">{{ item.title }}</h3>
                  </div>
                  <p class="news-row-summary">{{ item.summary }}</p>
                  <div class="news-meta">
                    <span class="news-source">{{ item.source }}</span>
                    <span class="meta-sep">·</span>
                    <span class="news-date">{{ item.date }}</span>
                  </div>
                </div>
                <div class="news-thumb">
                  <div class="thumb-placeholder">
                    <span>{{ item.title.charAt(0) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="!filteredList.length" class="empty-tip">暂无相关资讯</div>

            <!-- 加载更多 -->
            <div class="load-more-wrap">
              <button class="load-more-btn" @click="loadMore" :disabled="loadingMore">
                {{ loadingMore ? '加载中…' : '加载更多' }}
              </button>
            </div>
          </div>
        </div>

        <!-- 右侧边栏 -->
        <aside class="news-aside">
          <!-- 热点排行 -->
          <div class="aside-block">
            <div class="aside-title">热点排行</div>
            <div
              v-for="(item, idx) in hotList"
              :key="item.id"
              class="hot-row"
              @click="openNews(item)"
            >
              <span class="hot-rank" :class="idx < 3 ? 'top3' : ''">{{ idx + 1 }}</span>
              <span class="hot-title">{{ item.title }}</span>
            </div>
          </div>

          <!-- 近期赛事 -->
          <div class="aside-block">
            <div class="aside-title">近期赛事</div>
            <div v-for="evt in events" :key="evt.id" class="event-row">
              <div class="event-date">
                <div class="event-month">{{ evt.month }}</div>
                <div class="event-day">{{ evt.day }}</div>
              </div>
              <div class="event-info">
                <div class="event-name">{{ evt.name }}</div>
                <div class="event-loc">{{ evt.location }}</div>
              </div>
              <span class="event-status" :class="'status-' + evt.status">
                {{ statusLabel(evt.status) }}
              </span>
            </div>
          </div>

          <!-- 官方链接 -->
          <div class="aside-block">
            <div class="aside-title">官方资源</div>
            <div class="link-list">
              <div v-for="link in officialLinks" :key="link.name" class="link-row">
                <span class="link-dot"></span>
                <span class="link-name">{{ link.name }}</span>
                <span class="link-tag">{{ link.tag }}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>

    <!-- 新闻详情弹窗 -->
    <el-dialog
      :visible.sync="detailVisible"
      :title="currentNews ? currentNews.title : ''"
      width="680px"
      top="60px"
    >
      <div v-if="currentNews" class="news-detail">
        <div class="detail-meta">
          <span class="news-cat-tag">{{ currentNews.category }}</span>
          <span class="news-source">{{ currentNews.source }}</span>
          <span class="meta-sep">·</span>
          <span class="news-date">{{ currentNews.date }}</span>
        </div>
        <div class="detail-body" v-html="currentNews.content || currentNews.summary"></div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'ResourcesPage',
  data() {
    return {
      loading: false, loadingMore: false,
      selectedCat: 'all',
      detailVisible: false, currentNews: null,
      categories: [
        { val: 'all', label: '全部' },
        { val: '赛事', label: '赛事' },
        { val: '棋手', label: '棋手' },
        { val: '文化', label: '文化' },
        { val: '技术', label: '技术' }
      ],
      allNews: [
        {
          id: 1, category: '赛事', isTop: true,
          title: '第四十届全国象棋个人锦标赛落幕 王天一成功卫冕冠军',
          summary: '经过14天激烈角逐，第四十届全国象棋个人锦标赛在广州圆满落幕。卫冕冠军王天一以11胜2平1负的成绩夺得冠军，谢靖、郑惟桐分列二三位。本届赛事共吸引来自全国32个省市自治区的128名顶级棋手参赛，创历届参赛人数新高。',
          source: '中国象棋协会', date: '2024-07-30',
          content: '<p>经过14天激烈角逐，第四十届全国象棋个人锦标赛在广州圆满落幕。</p><p>卫冕冠军王天一以11胜2平1负的成绩夺得冠军，谢靖、郑惟桐分列二三位。本届赛事共吸引来自全国32个省市自治区的128名顶级棋手参赛，创历届参赛人数新高。</p><p>王天一赛后表示："每一届全国赛都是对自己的挑战，能够连续卫冕，感谢团队的支持。"</p>'
        },
        {
          id: 2, category: '赛事',
          title: '象棋甲级联赛2024赛季总决赛：广东恒大VS浙江波尔',
          summary: '象棋甲级联赛2024赛季总决赛将于11月15日在杭州拉开帷幕，广东恒大队与浙江波尔队强强对决，争夺本赛季总冠军。两队均拥有多名特级大师，总决赛将是一场高水平的巅峰对决。',
          source: '象棋联赛官网', date: '2024-11-10'
        },
        {
          id: 3, category: '棋手',
          title: '许银川专访：象棋是一门艺术，需要用一生去追求',
          summary: '近日，象棋特级大师许银川接受本报专访，谈及从艺近四十年的心路历程。他表示，象棋不仅是竞技运动，更是中华文化的精髓体现，年轻棋手应当在技术训练之外，深入学习古谱，领悟棋道之美。',
          source: '体育周报', date: '2024-11-05'
        },
        {
          id: 4, category: '文化',
          title: '《橘中秘》成书500周年纪念活动在苏州举办',
          summary: '明代象棋名著《橘中秘》成书500周年纪念活动近日在苏州隆重举办。活动包括古谱展览、学术研讨、名家表演赛等多个环节，吸引了来自海内外的象棋爱好者和文化学者参与。',
          source: '文化中国', date: '2024-10-28'
        },
        {
          id: 5, category: '技术',
          title: '人工智能助力象棋训练：AI引擎让古谱分析更精准',
          summary: '近年来，AI技术在象棋领域的应用日趋成熟。多款专业象棋AI引擎已能对古典棋谱进行深度分析，找出最优变化和被古人遗漏的精妙招法。本文将介绍几款主流象棋AI工具及其在古谱研究中的应用。',
          source: '科技象棋', date: '2024-10-20'
        },
        {
          id: 6, category: '赛事',
          title: '2024年亚洲象棋锦标赛：中国队包揽金牌',
          summary: '2024年亚洲象棋锦标赛在马来西亚吉隆坡落幕，中国队在男子个人、女子个人、男子团体和女子团体四个项目上全部夺金，展现了中国象棋的绝对统治力。',
          source: '亚洲象棋联合会', date: '2024-10-15'
        },
        {
          id: 7, category: '棋手',
          title: '90后棋手崛起：中国象棋进入新旧更迭关键期',
          summary: '随着王天一、谢靖、郑惟桐等90后棋手逐渐成为主力，中国象棋正在经历新旧更迭的重要时期。老一辈名将许银川、吕钦虽已渐退幕后，但仍不时亮相，为年轻棋手树立榜样。',
          source: '棋界观察', date: '2024-10-08'
        },
        {
          id: 8, category: '文化',
          title: '象棋进校园：全国已有超过两千所中小学开展象棋课',
          summary: '据中国象棋协会统计，截至2024年，全国已有超过2000所中小学将象棋纳入校本课程，参与学生人数突破50万。象棋进校园活动有效推动了传统文化的传承与普及。',
          source: '中国教育报', date: '2024-09-25'
        },
        {
          id: 9, category: '技术',
          title: '残局研究新突破：计算机证明马炮胜单车的最短步数',
          summary: '中国象棋研究院与某高校合作，利用高性能计算机对"马炮胜单车"残局进行了穷举计算，确定了在最佳应对下的最短取胜步数，为残局理论研究提供了重要的数据基础。',
          source: '象棋研究', date: '2024-09-18'
        },
        {
          id: 10, category: '赛事',
          title: '第十四届全运会象棋项目：陕西赛区完赛',
          summary: '第十四届全国运动会象棋项目在陕西西安圆满收官，来自全国各省市的顶级棋手同场竞技，共产生男子、女子、团体三项冠军，为全运会增添了浓厚的文化色彩。',
          source: '全运会官网', date: '2024-09-10'
        }
      ],
      hotList: [],
      events: [
        { id: 1, name: '全国象棋甲级联赛总决赛', location: '浙江杭州', month: '11月', day: '15', status: 'upcoming' },
        { id: 2, name: '2024年象棋世界冠军赛', location: '北京', month: '12月', day: '01', status: 'upcoming' },
        { id: 3, name: '第四十届全国个人锦标赛', location: '广东广州', month: '07月', day: '30', status: 'ended' },
        { id: 4, name: '亚洲象棋锦标赛', location: '马来西亚', month: '10月', day: '15', status: 'ended' }
      ],
      officialLinks: [
        { name: '中国象棋协会', tag: '官网' },
        { name: '象棋世界', tag: '门户' },
        { name: '弈客象棋', tag: '对战' },
        { name: '全国象棋等级分', tag: '数据' },
        { name: '象棋巫师', tag: '软件' }
      ]
    }
  },
  computed: {
    topNews() {
      const list = this.selectedCat === 'all'
        ? this.allNews
        : this.allNews.filter(n => n.category === this.selectedCat)
      return list.find(n => n.isTop) || list[0] || null
    },
    filteredList() {
      const list = this.selectedCat === 'all'
        ? this.allNews
        : this.allNews.filter(n => n.category === this.selectedCat)
      const top = this.topNews
      return list.filter(n => n !== top)
    }
  },
  created() {
    this.hotList = [...this.allNews].sort(() => Math.random() - 0.5).slice(0, 6)
  },
  methods: {
    openNews(item) {
      this.currentNews = item
      this.detailVisible = true
    },
    loadMore() {
      this.loadingMore = true
      setTimeout(() => { this.loadingMore = false }, 800)
    },
    statusLabel(s) {
      return { upcoming: '即将', ongoing: '进行中', ended: '已结束' }[s] || s
    }
  }
}
</script>

<style scoped>
.resources-page { background: #faf8f5; min-height: calc(100vh - 56px); padding-bottom: 60px; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 32px; }

.page-header { padding: 36px 0 24px; border-bottom: 1px solid #ece8e0; margin-bottom: 28px; }
.page-title {
  font-size: 22px; font-weight: 700; color: #1a1a1a; margin-bottom: 4px;
  font-family: 'STKaiti','KaiTi',serif; letter-spacing: 2px;
}
.page-desc { font-size: 13px; color: #aaa; }

/* 主体布局 */
.main-layout { display: flex; gap: 32px; align-items: flex-start; }
.news-main { flex: 1; min-width: 0; }
.news-aside { width: 260px; flex-shrink: 0; display: flex; flex-direction: column; gap: 20px; }

/* 分类标签 */
.cat-tabs { display: flex; gap: 6px; margin-bottom: 20px; flex-wrap: wrap; }
.cat-tab {
  padding: 4px 14px; font-size: 13px; color: #666;
  border: 1px solid #e0dbd0; border-radius: 2px; cursor: pointer;
  background: #fff; transition: all 0.15s;
}
.cat-tab:hover { border-color: #8B1A1A; color: #8B1A1A; }
.cat-tab.active { background: #8B1A1A; border-color: #8B1A1A; color: #fff; }

.loading-tip { color: #bbb; font-size: 14px; padding: 40px 0; }

/* 头条大图 */
.top-news {
  display: flex; gap: 20px; padding: 20px;
  background: #fff; border: 1px solid #ece8e0; border-radius: 4px;
  margin-bottom: 2px; cursor: pointer; transition: background 0.1s;
}
.top-news:hover { background: #fdf8f4; }
.top-news-img { position: relative; flex-shrink: 0; }
.img-placeholder {
  width: 200px; height: 130px; border-radius: 4px;
  background: linear-gradient(135deg, #c8a060, #8B4a10);
  display: flex; align-items: center; justify-content: center;
}
.img-char {
  font-size: 48px; font-weight: 800; color: rgba(255,255,255,0.4);
  font-family: 'STKaiti','KaiTi',serif;
}
.top-badge {
  position: absolute; top: 8px; left: 8px;
  background: #8B1A1A; color: #fff;
  font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 2px;
}
.top-news-body { flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
.top-news-title {
  font-size: 18px; font-weight: 700; color: #1a1a1a;
  line-height: 1.5; margin: 8px 0 10px;
}
.top-news-summary { font-size: 13px; color: #777; line-height: 1.8; flex: 1; }

/* 新闻类别标签 */
.news-cat-tag {
  display: inline-block; font-size: 11px; color: #8B1A1A;
  border: 1px solid rgba(139,26,26,0.3); padding: 1px 6px; border-radius: 2px;
  margin-right: 8px; font-weight: 500;
}
.news-cat-tag.small { font-size: 10px; }

.news-meta { display: flex; align-items: center; gap: 4px; font-size: 12px; margin-top: 8px; }
.news-source { color: #8B1A1A; font-weight: 500; }
.meta-sep { color: #ddd; }
.news-date { color: #bbb; }

/* 新闻列表 */
.news-list { }
.news-row {
  display: flex; align-items: flex-start; gap: 14px;
  padding: 18px 16px; background: #fff;
  border: 1px solid #ece8e0; border-top: none;
  cursor: pointer; transition: background 0.1s;
}
.news-row:first-child { border-top: 1px solid #ece8e0; }
.news-row:hover { background: #fdf8f4; }

.news-index {
  flex-shrink: 0; width: 24px; height: 24px; border-radius: 2px;
  background: #f0ebe0; color: #aaa;
  font-size: 12px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  margin-top: 2px;
}
.news-body { flex: 1; min-width: 0; }
.news-row-head { display: flex; align-items: flex-start; gap: 6px; margin-bottom: 6px; flex-wrap: wrap; }
.news-row-title { font-size: 15px; font-weight: 600; color: #1a1a1a; line-height: 1.4; }
.news-row-summary {
  font-size: 12px; color: #888; line-height: 1.7;
  overflow: hidden; display: -webkit-box;
  -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  margin-bottom: 6px;
}

.news-thumb { flex-shrink: 0; }
.thumb-placeholder {
  width: 72px; height: 54px; border-radius: 3px;
  background: linear-gradient(135deg, #e8d4a0, #c8a060);
  display: flex; align-items: center; justify-content: center;
}
.thumb-placeholder span {
  font-size: 20px; font-weight: 800; color: rgba(255,255,255,0.5);
  font-family: 'STKaiti','KaiTi',serif;
}

/* 加载更多 */
.load-more-wrap { text-align: center; padding: 24px 0; }
.load-more-btn {
  padding: 8px 32px; border: 1px solid #e0dbd0;
  background: #fff; color: #666; border-radius: 2px;
  font-size: 13px; cursor: pointer; transition: all 0.15s;
}
.load-more-btn:hover { border-color: #8B1A1A; color: #8B1A1A; }
.load-more-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.empty-tip { color: #ccc; font-size: 14px; padding: 40px 0; text-align: center; }

/* 侧边栏通用 */
.aside-block {
  background: #fff; border: 1px solid #ece8e0;
  border-radius: 4px; overflow: hidden;
}
.aside-title {
  font-size: 13px; font-weight: 700; color: #555;
  padding: 12px 16px; border-bottom: 1px solid #f0ebe0;
  background: #fdfaf6;
  font-family: 'STKaiti','KaiTi',serif; letter-spacing: 1px;
}

/* 热点排行 */
.hot-row {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 10px 16px; border-bottom: 1px solid #f8f4ee;
  cursor: pointer; transition: background 0.1s;
}
.hot-row:last-child { border-bottom: none; }
.hot-row:hover { background: #fdf8f4; }
.hot-rank {
  flex-shrink: 0; width: 18px; height: 18px; border-radius: 2px;
  background: #f0ebe0; color: #bbb;
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center; margin-top: 1px;
}
.hot-rank.top3 { background: #8B1A1A; color: #fff; }
.hot-title {
  font-size: 12px; color: #444; line-height: 1.5;
  overflow: hidden; display: -webkit-box;
  -webkit-line-clamp: 2; -webkit-box-orient: vertical;
}

/* 近期赛事 */
.event-row {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 16px; border-bottom: 1px solid #f8f4ee;
}
.event-row:last-child { border-bottom: none; }
.event-date {
  flex-shrink: 0; width: 40px; text-align: center;
  border: 1px solid #e8d4b0; border-radius: 3px; overflow: hidden;
}
.event-month {
  background: #8B1A1A; color: #fff;
  font-size: 9px; padding: 2px 0; font-family: 'STKaiti','KaiTi',serif;
}
.event-day {
  font-size: 16px; font-weight: 700; color: #1a1a1a;
  padding: 2px 0; background: #fff9f0;
}
.event-info { flex: 1; min-width: 0; }
.event-name { font-size: 12px; font-weight: 600; color: #1a1a1a; margin-bottom: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.event-loc { font-size: 11px; color: #bbb; }
.event-status {
  flex-shrink: 0; font-size: 10px; font-weight: 600;
  padding: 2px 6px; border-radius: 2px;
}
.status-upcoming { background: #fdf0f0; color: #8B1A1A; }
.status-ongoing { background: #f0f8f0; color: #1a7a1a; }
.status-ended { background: #f5f5f5; color: #aaa; }

/* 官方链接 */
.link-list { padding: 4px 0; }
.link-row {
  display: flex; align-items: center; gap: 8px;
  padding: 9px 16px; border-bottom: 1px solid #f8f4ee;
  cursor: pointer; transition: background 0.1s;
}
.link-row:last-child { border-bottom: none; }
.link-row:hover { background: #fdf8f4; }
.link-dot { width: 5px; height: 5px; border-radius: 50%; background: #8B1A1A; flex-shrink: 0; }
.link-name { flex: 1; font-size: 13px; color: #444; }
.link-tag {
  font-size: 10px; color: #bbb;
  border: 1px solid #e8e8e8; padding: 1px 5px; border-radius: 2px;
}

/* 详情弹窗 */
.news-detail { }
.detail-meta { display: flex; align-items: center; gap: 6px; margin-bottom: 16px; }
.detail-body { font-size: 14px; color: #555; line-height: 1.9; }
.detail-body >>> p { margin-bottom: 12px; }

@media (max-width: 900px) {
  .main-layout { flex-direction: column; }
  .news-aside { width: 100%; }
  .top-news { flex-direction: column; }
  .img-placeholder { width: 100%; height: 160px; }
}
</style>
