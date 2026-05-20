// 棋谱库 mock 数据：书级别
// 每本书包含多局（games），每局有 moves

const MOCK_MOVES_A = [
  { notation: '炮二平五' }, { notation: '炮８平５' },
  { notation: '马二进三' }, { notation: '马８进７' },
  { notation: '车一平二' }, { notation: '车９平８' },
  { notation: '兵七进一' }, { notation: '卒７进１' },
  { notation: '马八进七' }, { notation: '马２进３' },
  { notation: '车二进六' }, { notation: '车８进２' }
]

const MOCK_MOVES_B = [
  { notation: '兵七进一' }, { notation: '卒７进１' },
  { notation: '马八进七' }, { notation: '马２进３' },
  { notation: '炮八平九' }, { notation: '炮８平９' },
  { notation: '车九平八' }, { notation: '车９平８' },
  { notation: '马七进六' }, { notation: '马３进４' }
]

const MOCK_MOVES_C = [
  { notation: '炮二平五' }, { notation: '马８进７' },
  { notation: '马二进三' }, { notation: '车９平８' },
  { notation: '车一平二' }, { notation: '兵３进１' },
  { notation: '兵三进一' }, { notation: '马２进３' },
  { notation: '马三进四' }, { notation: '炮８平６' }
]

const MOCK_MOVES_D = [
  { notation: '相三进五' }, { notation: '炮８平５' },
  { notation: '马二进三' }, { notation: '马８进７' },
  { notation: '车一平二' }, { notation: '车９平８' },
  { notation: '马八进七' }, { notation: '马２进１' },
  { notation: '炮二平一' }, { notation: '马１进３' }
]

export const MANUAL_BOOKS = [
  {
    id: 1,
    title: '橘中秘',
    dynasty: '明代',
    author: '朱晋桢',
    difficulty: 3,
    labels: ['开局', '炮局', '名谱'],
    desc: '明代象棋名著，以炮局为核心，系统论述进攻战术，为历代棋手必读之谱。',
    games: [
      { id: 101, title: '炮局第一', difficulty: 3, moves: MOCK_MOVES_A },
      { id: 102, title: '出车取士局', difficulty: 2, moves: MOCK_MOVES_B },
      { id: 103, title: '马兵胜单车', difficulty: 2, moves: MOCK_MOVES_C },
      { id: 104, title: '当头炮正变', difficulty: 4, moves: MOCK_MOVES_D },
      { id: 105, title: '顺炮横车局', difficulty: 3, moves: MOCK_MOVES_A },
      { id: 106, title: '列炮局', difficulty: 3, moves: MOCK_MOVES_B }
    ]
  },
  {
    id: 2,
    title: '梅花谱',
    dynasty: '清代',
    author: '张乔栋',
    difficulty: 4,
    labels: ['屏风马', '防御', '名谱'],
    desc: '清代乾隆年间名著，系统论述屏风马布局，奠定防御性布局理论基础。',
    games: [
      { id: 201, title: '屏风马对进三兵', difficulty: 4, moves: MOCK_MOVES_A },
      { id: 202, title: '反宫马布局', difficulty: 3, moves: MOCK_MOVES_B },
      { id: 203, title: '屏风马对中炮', difficulty: 4, moves: MOCK_MOVES_C },
      { id: 204, title: '屏风马左马盘河', difficulty: 5, moves: MOCK_MOVES_D }
    ]
  },
  {
    id: 3,
    title: '适情雅趣',
    dynasty: '明代',
    author: '颜丙',
    difficulty: 2,
    labels: ['开局', '飞象局'],
    desc: '明代棋谱，广泛收录各类开局变化，尤以飞象局与当头炮系列最为详尽。',
    games: [
      { id: 301, title: '当头炮进三兵', difficulty: 2, moves: MOCK_MOVES_A },
      { id: 302, title: '飞象局精要', difficulty: 2, moves: MOCK_MOVES_B },
      { id: 303, title: '仙人指路开局', difficulty: 1, moves: MOCK_MOVES_C }
    ]
  },
  {
    id: 4,
    title: '韬略元机',
    dynasty: '清代',
    author: '张志',
    difficulty: 3,
    labels: ['顺炮', '五七炮'],
    desc: '清代棋谱，重点研究顺炮与五七炮等进攻性布局，战术变化丰富。',
    games: [
      { id: 401, title: '顺炮横车对直车', difficulty: 3, moves: MOCK_MOVES_A },
      { id: 402, title: '五七炮对屏风马', difficulty: 3, moves: MOCK_MOVES_B },
      { id: 403, title: '顺炮缓开车', difficulty: 2, moves: MOCK_MOVES_C }
    ]
  },
  {
    id: 5,
    title: '渊深海阔',
    dynasty: '清代',
    author: '佚名',
    difficulty: 4,
    labels: ['残局', '车马炮'],
    desc: '清代残局名谱，汇集各类车马炮残局精华，是研习残局必备读本。',
    games: [
      { id: 501, title: '仙人指路变局', difficulty: 4, moves: MOCK_MOVES_A },
      { id: 502, title: '车马炮胜单车', difficulty: 3, moves: MOCK_MOVES_B },
      { id: 503, title: '双车错绝杀', difficulty: 5, moves: MOCK_MOVES_C },
      { id: 504, title: '马炮胜单缺象', difficulty: 4, moves: MOCK_MOVES_D }
    ]
  },
  {
    id: 6,
    title: '七星聚会',
    dynasty: '古代',
    author: '佚名',
    difficulty: 5,
    labels: ['残局', '马后炮'],
    desc: '古典残局谱，以七子归位为核心战术，马后炮绝杀技法精妙绝伦。',
    games: [
      { id: 601, title: '马后炮绝杀', difficulty: 5, moves: MOCK_MOVES_A },
      { id: 602, title: '七星连珠', difficulty: 5, moves: MOCK_MOVES_B }
    ]
  },
  {
    id: 7,
    title: '竹香斋象戏谱',
    dynasty: '清代',
    author: '张志',
    difficulty: 3,
    labels: ['全局', '开中残'],
    desc: '清代全局型棋谱，贯通开局、中局、残局三阶段，是综合提升棋力的实战教材。',
    games: [
      { id: 701, title: '当头炮正变第一局', difficulty: 3, moves: MOCK_MOVES_A },
      { id: 702, title: '当头炮正变第二局', difficulty: 3, moves: MOCK_MOVES_B },
      { id: 703, title: '顺炮直车对缓开车', difficulty: 4, moves: MOCK_MOVES_C }
    ]
  },
  {
    id: 8,
    title: '百局象棋谱',
    dynasty: '宋代',
    author: '晁补之',
    difficulty: 2,
    labels: ['古典', '入门'],
    desc: '宋代最早象棋谱之一，收录百局经典残局，是研究古代象棋发展的珍贵史料。',
    games: [
      { id: 801, title: '第一局', difficulty: 1, moves: MOCK_MOVES_A },
      { id: 802, title: '第二局', difficulty: 1, moves: MOCK_MOVES_B },
      { id: 803, title: '第三局', difficulty: 2, moves: MOCK_MOVES_C },
      { id: 804, title: '第四局', difficulty: 2, moves: MOCK_MOVES_D },
      { id: 805, title: '第五局', difficulty: 2, moves: MOCK_MOVES_A }
    ]
  },
  {
    id: 9,
    title: '金鹏十八变',
    dynasty: '明代',
    author: '佚名',
    difficulty: 5,
    labels: ['残局', '高难'],
    desc: '明代残局名谱，收录十八种极难残局变化，为高段棋手研习提高之谱。',
    games: [
      { id: 901, title: '金鹏变一', difficulty: 5, moves: MOCK_MOVES_A },
      { id: 902, title: '金鹏变二', difficulty: 5, moves: MOCK_MOVES_B },
      { id: 903, title: '金鹏变三', difficulty: 5, moves: MOCK_MOVES_C }
    ]
  },
  {
    id: 10,
    title: '象棋残局大全',
    dynasty: '近现代',
    author: '谢侠逊',
    difficulty: 3,
    labels: ['残局', '实用'],
    desc: '近现代残局集大成之作，涵盖单兵类、多兵类各类残局，实用价值极高。',
    games: [
      { id: 1001, title: '车兵胜车', difficulty: 2, moves: MOCK_MOVES_A },
      { id: 1002, title: '马兵胜马', difficulty: 3, moves: MOCK_MOVES_B },
      { id: 1003, title: '炮兵胜炮', difficulty: 3, moves: MOCK_MOVES_C },
      { id: 1004, title: '车马胜车炮', difficulty: 4, moves: MOCK_MOVES_D }
    ]
  },
  {
    id: 11,
    title: '弈墨',
    dynasty: '清代',
    author: '钱长泽',
    difficulty: 4,
    labels: ['全局', '中局'],
    desc: '清代中局战术名谱，精研中局搏杀技巧，收录大量实战对局分析。',
    games: [
      { id: 1101, title: '中炮对屏风马实战一', difficulty: 4, moves: MOCK_MOVES_A },
      { id: 1102, title: '中炮对屏风马实战二', difficulty: 4, moves: MOCK_MOVES_B },
      { id: 1103, title: '飞刀战术', difficulty: 5, moves: MOCK_MOVES_C }
    ]
  },
  {
    id: 12,
    title: '烂柯神机',
    dynasty: '明代',
    author: '徐芝',
    difficulty: 4,
    labels: ['残局', '马炮'],
    desc: '明代残局名谱，以马炮配合为核心，深入研究马炮协同作战的精妙变化。',
    games: [
      { id: 1201, title: '马炮胜车', difficulty: 4, moves: MOCK_MOVES_A },
      { id: 1202, title: '马炮联攻', difficulty: 4, moves: MOCK_MOVES_B },
      { id: 1203, title: '炮马兵胜车', difficulty: 3, moves: MOCK_MOVES_C }
    ]
  }
]
