import type {
  KnowledgeArticle,
  MediaAsset,
  PestDetectionResult,
  SensorMetric,
  StudentProject,
  TeaGardenResource,
  TeaProduct,
  WeatherMetric,
} from '../types/domain';

export const heroAssets = {
  production:
    'https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?auto=format&fit=crop&w=1800&q=85',
  market:
    'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&w=1800&q=85',
  matching:
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1800&q=85',
};

export const weatherMetrics: WeatherMetric[] = [
  { id: 'weather', label: '茶园天气', value: '多云转晴', status: '适宜采摘', updatedAt: '09:30' },
  { id: 'temperature', label: '环境温度', value: '23.8', unit: '°C', status: '春梢生长活跃', updatedAt: '09:30' },
  { id: 'humidity', label: '空气湿度', value: '72', unit: '%', status: '叶面湿度偏高', updatedAt: '09:30' },
  { id: 'rain', label: '近 6h 降雨', value: '1.8', unit: 'mm', status: '无需补水', updatedAt: '09:30' },
  { id: 'wind', label: '平均风力', value: '2', unit: '级', status: '适宜无人机巡田', updatedAt: '09:30' },
];

export const sensorMetrics: SensorMetric[] = [
  { id: 'soil-ph', label: '土壤 pH', value: 5.7, unit: '', range: '5.0 - 6.5', trend: 'stable' },
  { id: 'soil-moisture', label: '土壤湿度', value: 64, unit: '%', range: '55% - 75%', trend: 'up' },
  { id: 'canopy-temp', label: '冠层温度', value: 22.4, unit: '°C', range: '18°C - 26°C', trend: 'stable' },
  { id: 'light', label: '光照强度', value: 681, unit: 'lux', range: '500 - 900 lux', trend: 'down' },
];

export const mockDetectionResult: PestDetectionResult = {
  pestType: '疑似茶炭疽病早期',
  confidence: 86,
  summary: '叶片边缘出现不规则褐斑，纹理与知识库中茶炭疽病早期样本相近。',
  suggestion: '建议隔离观察同片区茶树，保持通风排湿，并联系农技人员确认后再进行针对性防治。',
};

export const knowledgeArticles: KnowledgeArticle[] = [
  {
    id: 'spring-pruning',
    title: '春梢萌发期轻修剪建议',
    category: '种植管理',
    summary: '根据树势与采摘节奏控制修剪强度，保留新梢恢复空间。',
    tags: ['春茶', '修剪', '树势'],
  },
  {
    id: 'fertilizer',
    title: '有机肥与速效肥协同方案',
    category: '施肥建议',
    summary: '以有机肥改善土壤结构，辅以少量速效氮肥支持春梢生长。',
    tags: ['施肥', '土壤', '春梢'],
  },
  {
    id: 'pest-control',
    title: '高湿天气病害预警清单',
    category: '病虫害防治',
    summary: '连续阴雨后重点巡查叶斑、炭疽、茶尺蠖等风险点。',
    tags: ['病虫害', '预警', '巡田'],
  },
];

export const teaProducts: TeaProduct[] = [
  {
    id: 'lychee-longjing-cider',
    name: '荔枝龙井西打酒',
    grade: '2025 旅游商品铜奖',
    imageUrl: '/assets/products/荔枝龙井西打酒.webp',
    intro:
      '融合荔枝与龙井：荔枝的甜对应郁达夫笔下柔情，龙井的清冽代表文人风骨，气泡如同友人谈笑时光。',
    spec: '文创饮品 / 果香气泡 / 微醺茶酒',
    tags: ['获奖商品', '郁达夫 IP', '助农文创'],
    actionLabel: '预留咨询入口',
    actionUrl: '#market-action-placeholders',
  },
  {
    id: 'xiaoguan-tea-gift-box',
    name: '小罐茶礼盒',
    grade: '达夫的朋友们 IP 系列',
    imageUrl: '/assets/products/小罐茶礼盒.webp',
    intro:
      '采用创新理念整合国内茶行业优质资源，坚持原产地原料、大师工艺、大师监制，并以小罐保鲜技术呈现茶礼质感。',
    spec: '茶礼盒 / 小罐保鲜 / 大师监制',
    tags: ['礼盒', '原产地原料', '大师工艺'],
    actionLabel: '预留购买按钮',
    actionUrl: '#market-action-placeholders',
  },
  {
    id: 'osmanthus-longjing-tea',
    name: '桂花龙井茶叶',
    grade: '杭州双物产融合',
    imageUrl: '/assets/products/桂花龙井茶叶.webp',
    intro:
      '融合杭州金桂与龙井，桂花香甜包裹龙井鲜醇，花香与茶韵相融，带来穿越古今的味觉体验。',
    spec: '桂花龙井 / 花香茶韵 / 茶叶产品',
    tags: ['桂花', '龙井', '茶文化'],
    actionLabel: '预留咨询入口',
    actionUrl: '#market-action-placeholders',
  },
  {
    id: 'longjing-steam-eye-mask',
    name: '龙井茶香蒸汽热敷眼罩',
    grade: '茶旅融合生活文创',
    imageUrl: '/assets/products/龙井茶香蒸汽热敷眼罩.webp',
    intro:
      '把龙井茶天然精粹融入日用产品，以温润蒸汽缓解眼部疲劳，茶香安神舒缓，延展富春山水与茶文化氛围。',
    spec: '蒸汽热敷 / 龙井茶香 / 日用文创',
    tags: ['生活文创', '茶旅融合', '舒缓体验'],
    actionLabel: '预留购买按钮',
    actionUrl: '#market-action-placeholders',
  },
];

export const mediaAssets: MediaAsset[] = [
  {
    id: 'drone',
    type: 'video',
    title: '茶园航拍视频位',
    coverUrl: 'https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?auto=format&fit=crop&w=1200&q=82',
    url: '/assets/placeholders/chunjian-drone.mp4',
    description: '预留春建乡茶园航拍、晨雾、采茶队伍等视频素材。',
  },
  {
    id: 'craft',
    type: 'image',
    title: '手工制茶图文位',
    coverUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=1200&q=82',
    url: '/assets/placeholders/tea-craft.jpg',
    description: '展示摊青、杀青、揉捻、干燥等工序，可替换为真实素材。',
  },
  {
    id: 'culture',
    type: 'image',
    title: '茶文化传播素材位',
    coverUrl: 'https://images.unsplash.com/photo-1523920290228-4f321a939b4c?auto=format&fit=crop&w=1200&q=82',
    url: '/assets/placeholders/tea-culture.jpg',
    description: '预留品牌故事、节庆活动、非遗体验和茶席影像。',
  },
];

export const defaultStudentProjects: StudentProject[] = [
  {
    id: 'student-001',
    projectName: '春建茶园直播共创计划',
    teamIntro: '由电商、视觉设计和农学专业学生组成，擅长短视频策划。',
    direction: '直播带货与品牌内容',
    requiredResources: '稳定直播场景、产品样品、茶农访谈素材。',
    cooperationMode: '联合运营，按活动或销售结果结算。',
    contact: 'team@example.com',
    tags: ['直播带货', '品牌策划', '茶产品设计'],
    createdAt: '2026-07-04',
  },
  {
    id: 'student-002',
    projectName: '一日茶山研学课程',
    teamIntro: '教育学与文旅策划学生团队，拥有研学课程设计经验。',
    direction: '茶文化研学',
    requiredResources: '安全茶园动线、制茶体验空间、讲解员支持。',
    cooperationMode: '课程共创，按场次分成。',
    contact: 'study@example.com',
    tags: ['研学活动', '文旅', '品牌策划'],
    createdAt: '2026-07-04',
  },
];

export const defaultGardenResources: TeaGardenResource[] = [
  {
    id: 'garden-001',
    gardenName: '春建青芽共富茶园',
    location: '杭州市富阳区春建乡',
    resources: '茶园拍摄场地、初制加工空间、春茶样品、茶农访谈资源。',
    supportedDirections: '直播带货、品牌策划、茶产品设计、数字农业展示。',
    cooperationTerms: '优先支持能形成可落地销售或传播成果的团队。',
    contact: 'garden@example.com',
    tags: ['直播带货', '品牌策划', '茶产品设计', '数字农业'],
    createdAt: '2026-07-04',
  },
  {
    id: 'garden-002',
    gardenName: '云径研学茶谷',
    location: '春建乡山地茶园片区',
    resources: '观景茶垄、室内茶席、研学接待点、乡村导览资源。',
    supportedDirections: '研学活动、文旅路线、茶文化传播。',
    cooperationTerms: '需要提交安全预案和活动流程。',
    contact: 'culture@example.com',
    tags: ['研学活动', '文旅', '茶文化传播'],
    createdAt: '2026-07-04',
  },
];

export const matchTags = ['文旅', '直播带货', '茶产品设计', '研学活动', '品牌策划', '数字农业', '茶文化传播'];
