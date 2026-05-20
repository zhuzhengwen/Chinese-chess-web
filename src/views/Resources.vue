<template>
  <div class="resources-page">
    <div class="toolbar">
      <div class="search-bar">
        <input v-model="keyword" type="text" placeholder="搜索资讯标题、来源…" class="search-input" @input="page = 1; activeId = null" />
        <button v-if="keyword" class="clear-btn" @click="keyword = ''; page = 1">✕</button>
      </div>
      <div class="cat-tabs">
        <button
          v-for="cat in categories" :key="cat.val"
          :class="['cat-tab', { active: selectedCat === cat.val }]"
          @click="selectedCat = cat.val; page = 1; activeId = null"
        >{{ cat.label }}</button>
      </div>
    </div>

    <div class="list-wrap">
      <div
        v-for="item in pagedList"
        :key="item.id"
        class="news-item"
        :class="{ expanded: activeId === item.id }"
      >
        <!-- 新闻行 -->
        <div class="news-row" @click="toggleItem(item.id)">
          <div class="row-left">
            <span class="cat-tag" :class="catColor(item.category)">{{ item.category }}</span>
            <span class="news-title">{{ item.title }}</span>
          </div>
          <div class="row-right">
            <span class="news-source">{{ item.source }}</span>
            <span class="news-date">{{ item.date }}</span>
            <span class="expand-icon">{{ activeId === item.id ? '▲' : '▼' }}</span>
          </div>
        </div>

        <!-- 展开：正文 -->
        <div v-if="activeId === item.id" class="news-detail">
          <p class="news-summary">{{ item.summary }}</p>
          <div v-if="item.content" class="news-content" v-html="item.content"></div>
        </div>
      </div>

      <div v-if="!filteredList.length" class="empty-tip">暂无相关资讯</div>
    </div>

    <div class="pagination-wrap">
      <span class="total-count">共 {{ filteredList.length }} 条<template v-if="keyword"> · 搜索"{{ keyword }}"</template></span>
      <template v-if="filteredList.length > pageSize">
        <button class="page-btn" :disabled="page === 1" @click="page--">‹ 上一页</button>
        <span class="page-info">{{ page }} / {{ totalPages }}</span>
        <button class="page-btn" :disabled="page === totalPages" @click="page++">下一页 ›</button>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ResourcesPage',
  data() {
    return {
      selectedCat: 'all',
      activeId: null,
      keyword: '',
      page: 1,
      pageSize: 15,
      categories: [
        { val: 'all', label: '全部' },
        { val: '赛事', label: '赛事' },
        { val: '棋手', label: '棋手' },
        { val: '文化', label: '文化' },
        { val: '技术', label: '技术' }
      ],
      allNews: [
        {
          id: 1, category: '赛事',
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
      ]
    }
  },
  computed: {
    filteredList() {
      let res = this.selectedCat === 'all' ? this.allNews : this.allNews.filter(n => n.category === this.selectedCat)
      const kw = this.keyword.trim().toLowerCase()
      if (kw) res = res.filter(n => n.title.toLowerCase().includes(kw) || (n.source && n.source.includes(kw)))
      return res
    },
    totalPages() { return Math.max(1, Math.ceil(this.filteredList.length / this.pageSize)) },
    pagedList() {
      const s = (this.page - 1) * this.pageSize
      return this.filteredList.slice(s, s + this.pageSize)
    }
  },
  methods: {
    toggleItem(id) { this.activeId = this.activeId === id ? null : id },
    catColor(cat) {
      return { '赛事': 'c-match', '棋手': 'c-player', '文化': 'c-culture', '技术': 'c-tech' }[cat] || ''
    }
  }
}
</script>

<style scoped>
.resources-page { display: flex; flex-direction: column; gap: 0; padding-bottom: 40px; }

.toolbar { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; flex-wrap: wrap; }
.search-bar { position: relative; flex: 1; min-width: 160px; max-width: 280px; }
.search-input { width: 100%; height: 38px; padding: 0 32px 0 12px; font-size: 14px; color: #333; border: 1px solid #d6eaf5; background: #fff; outline: none; transition: border-color 0.15s; }
.search-input:focus { border-color: #2a9fd6; }
.search-input::placeholder { color: #ccc; }
.clear-btn { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; color: #bbb; cursor: pointer; font-size: 13px; padding: 0; }
.clear-btn:hover { color: #888; }

.cat-tabs { display: flex; overflow: hidden; border: 1px solid #d6eaf5; }
.cat-tab { padding: 0 14px; height: 38px; font-size: 12px; color: #999; cursor: pointer; border: none; background: #fff; transition: all 0.12s; }
.cat-tab + .cat-tab { border-left: 1px solid #d6eaf5; }
.cat-tab:hover:not(.active) { background: #e8f4fb; color: #2a9fd6; }
.cat-tab.active { background: #2a9fd6; color: #fff; font-weight: 600; }

.list-wrap {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 0;
  overflow: hidden;
}

.news-item { border-bottom: 1px solid #f4f4f4; }
.news-item:last-child { border-bottom: none; }

.news-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  cursor: pointer;
  transition: background 0.12s;
  gap: 16px;
}
.news-row:hover { background: #fafafa; }
.news-item.expanded > .news-row { background: #f7f9ff; }

.row-left { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }

.cat-tag {
  flex-shrink: 0;
  font-size: 11px;
  padding: 1px 7px;
  border-radius: 0;
  font-weight: 500;
}
.c-match   { background: #e6f4ff; color: #2a9fd6; }
.c-player  { background: #f6ffed; color: #389e0d; }
.c-culture { background: #fff7e6; color: #d46b08; }
.c-tech    { background: #f9f0ff; color: #722ed1; }

.news-title {
  font-size: 15px;
  font-weight: 500;
  color: #888;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.12s;
}
.news-item.expanded .news-title { color: #2a9fd6; }

.row-right { display: flex; align-items: center; gap: 16px; flex-shrink: 0; }
.news-source { font-size: 12px; color: #999; }
.news-date { font-size: 12px; color: #bbb; min-width: 72px; text-align: right; }
.expand-icon { font-size: 10px; color: #ccc; width: 14px; text-align: center; }

/* 展开正文 */
.news-detail {
  padding: 16px 20px 20px 20px;
  border-top: 1px solid #f0f0f0;
  background: #fafbff;
}
.news-summary {
  font-size: 14px;
  color: #555;
  line-height: 1.9;
  margin: 0 0 10px;
}
.news-content { font-size: 14px; color: #555; line-height: 1.9; }
.news-content >>> p { margin-bottom: 10px; }

.empty-tip { color: #ccc; font-size: 14px; padding: 60px; text-align: center; }

.pagination-wrap { display: flex; align-items: center; gap: 16px; padding: 16px 0 4px; }
.total-count { font-size: 13px; color: #bbb; margin-right: auto; }
.page-btn {
  padding: 6px 16px; border: 1px solid #e0e0e0; border-radius: 0;
  background: #fff; font-size: 13px; color: #555; cursor: pointer; transition: all 0.15s;
}
.page-btn:hover:not(:disabled) { border-color: #2a9fd6; color: #2a9fd6; }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.page-info { font-size: 13px; color: #999; }
</style>

