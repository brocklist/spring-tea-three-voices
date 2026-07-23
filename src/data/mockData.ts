import type {
  ExternalKnowledgeSource,
  KnowledgeArticle,
  MediaAsset,
  PestDetectionResult,
  SensorMetric,
  StudentProject,
  TeaGardenZone,
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

export const teaGardenZones: TeaGardenZone[] = [
  {
    id: 'dongpo-3',
    name: '东坡 3 号',
    position: [3.1, 0.48, -1.8],
    cardOffset: [-1.15, 0.18],
    cameraPose: { position: [5.7, 4.25, 3.1], target: [2.4, 0.18, -1.45], fov: 34 },
    markerTone: 'gold',
    status: '重点巡护',
    risk: '叶面湿度偏高',
    area: '28.6 亩',
    temperature: '22.8°C',
    humidity: '84%',
    soilMoisture: '67%',
    action: '午后复查叶背与低洼茶垄，保持通风排湿。',
  },
  {
    id: 'qingya-1',
    name: '青芽 1 号',
    position: [-1.9, 0.35, -0.15],
    cardOffset: [-0.5, 0.35],
    cameraPose: { position: [2.35, 4.4, 5.9], target: [-1.55, 0.16, -0.1], fov: 35 },
    markerTone: 'mint',
    status: '生长稳定',
    risk: '适宜采摘',
    area: '35.2 亩',
    temperature: '23.4°C',
    humidity: '71%',
    soilMoisture: '64%',
    action: '按照春茶采摘窗口安排作业，注意轻采轻放。',
  },
  {
    id: 'yunjing-2',
    name: '云径 2 号',
    position: [3.15, 0.22, 1.85],
    cardOffset: [-1.2, -0.12],
    cameraPose: { position: [5.55, 3.9, 5.2], target: [2.75, 0.12, 1.65], fov: 35 },
    markerTone: 'cyan',
    status: '水分适宜',
    risk: '巡园正常',
    area: '19.8 亩',
    temperature: '22.1°C',
    humidity: '69%',
    soilMoisture: '61%',
    action: '保持常规巡园频率，关注傍晚湿度变化。',
  },
  {
    id: 'beipo-1',
    name: '北坡 1 号',
    position: [-3.25, 0.28, 2.1],
    cardOffset: [0.38, 0.22],
    cameraPose: { position: [-5.7, 4.25, 5.35], target: [-2.85, 0.16, 1.65], fov: 35 },
    markerTone: 'mint',
    status: '光照平稳',
    risk: '轻度关注',
    area: '24.1 亩',
    temperature: '21.7°C',
    humidity: '75%',
    soilMoisture: '58%',
    action: '继续观察新梢叶色，避免午间集中灌溉。',
  },
  {
    id: 'nangu-1',
    name: '南谷 1 号',
    position: [0.25, 0.2, 2.8],
    cardOffset: [-0.9, 0.16],
    cameraPose: { position: [3.9, 4.3, 6.25], target: [0.2, 0.14, 2.35], fov: 34 },
    markerTone: 'cyan',
    status: '常规巡护',
    risk: '长势均衡',
    area: '22.4 亩',
    temperature: '22.5°C',
    humidity: '73%',
    soilMoisture: '63%',
    action: '维持日常巡园与采摘节奏，傍晚重点观察空气湿度变化。',
  },
];

export const mockDetectionResult: PestDetectionResult = {
  pestType: '疑似茶炭疽病早期',
  confidence: 86,
  summary: '叶片边缘出现不规则褐斑，纹理与知识库中茶炭疽病早期样本相近。',
  suggestion: '建议隔离观察同片区茶树，保持通风排湿，并联系农技人员确认后再进行针对性防治。',
  severity: '中等风险',
  leafPart: '叶缘与叶尖',
  analysisPoints: ['病斑边缘不规则', '叶面湿度偏高时更易扩散', '建议复核同片区茶树叶片'],
};

export const leafDetectionDemos: PestDetectionResult[] = [
  {
    imageUrl: '/assets/leaf-demos/anthracnose-photo.png',
    pestType: '茶炭疽病疑似样本',
    confidence: 88,
    severity: '中等风险',
    leafPart: '叶缘、叶尖',
    summary: '示意图中叶缘出现褐色不规则病斑，中心颜色较深，边缘向外扩散，符合高湿天气后茶炭疽病早期巡查特征。',
    suggestion: '建议先隔离观察同片区茶树，清理重病叶，保持茶垄通风排湿；如病斑继续扩大，应联系农技人员确认后再做针对性防治。',
    analysisPoints: ['褐斑集中在叶缘和叶尖', '病斑形状不规则', '高湿天气后需要加密巡园'],
  },
  {
    imageUrl: '/assets/leaf-demos/leafhopper-photo.jpg',
    pestType: '茶小绿叶蝉危害疑似样本',
    confidence: 82,
    severity: '轻中度风险',
    leafPart: '嫩梢、叶脉附近',
    summary: '示意图中嫩叶有细小失绿点和轻微卷曲，叶脉附近呈现针刺状斑点，接近茶小绿叶蝉取食后的典型表现。',
    suggestion: '建议重点检查嫩梢背面和茶蓬表层，结合黄板或田间虫口密度判断；轻度发生时优先采用物理诱捕和修剪清园。',
    analysisPoints: ['叶面有点状失绿', '嫩梢边缘轻微卷曲', '应检查叶背是否有活动虫体'],
  },
  {
    imageUrl: '/assets/leaf-demos/healthy-leaf-photo.jpg',
    pestType: '健康嫩叶样本',
    confidence: 94,
    severity: '低风险',
    leafPart: '整片叶面',
    summary: '示意图中叶色均匀、叶脉清晰，没有明显褐斑、虫咬缺口或卷曲萎蔫表现，整体处于健康状态。',
    suggestion: '建议保持常规巡园频率，关注天气变化和土壤湿度；春梢生长期继续做好轻采轻养与适度施肥。',
    analysisPoints: ['叶色均匀鲜绿', '叶脉清晰完整', '未发现明显病斑或虫咬痕迹'],
  },
];

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

export const externalKnowledgeSources: ExternalKnowledgeSource[] = [
  {
    id: 'moa-tea-season-guide',
    title: '夏秋季茶园生产管理及防灾减灾技术指导意见',
    organization: '农业农村部种植业管理司 / 全国农业技术推广服务中心',
    category: '茶园管理',
    url: 'https://zzys.moa.gov.cn/gzdt/202206/t20220621_6403020.htm',
    summary: '覆盖茶树修剪、追肥、控草、浅耕、病虫害防控、洪涝和干旱应对，适合转化为季节性农事任务清单。',
    sourceType: 'official',
    tags: ['修剪', '施肥', '病虫害', '防灾减灾'],
    updateHint: '适合按季节复核',
  },
  {
    id: 'natesc-portal',
    title: '全国农业技术推广服务中心',
    organization: '全国农业技术推广服务中心',
    category: '农技推广',
    url: 'https://www.natesc.org.cn/',
    summary: '提供农事指导、植检植保、技术模式、农技大数据等入口，后续可作为政策和农技资料索引来源。',
    sourceType: 'extension',
    tags: ['农事指导', '植检植保', '技术模式', '农技大数据'],
    updateHint: '适合长期订阅',
  },
  {
    id: 'china-tea-society-science',
    title: '中国茶叶学会科技普及',
    organization: '中国茶叶学会',
    category: '茶叶科普',
    url: 'https://www.chinatss.cn/technology',
    summary: '聚合茶树栽培、茶叶加工、茶健康与茶科技传播内容，适合面向消费者和学生团队做知识转译。',
    sourceType: 'research',
    tags: ['茶科普', '茶科技', '加工', '传播'],
    updateHint: '适合内容运营引用',
  },
  {
    id: 'tbrs-tea-pest',
    title: '茶树病虫害防治资料库',
    organization: '农业部茶及饮料作物改良场',
    category: '病虫害防治',
    url: 'https://www.tbrs.gov.tw/ws.php?id=1542',
    summary: '包含茶树病虫害、安全用药、非农药资材与防治时机等专题资料，可作为叶片识别结果的延伸阅读入口。',
    sourceType: 'extension',
    tags: ['病虫害', '安全用药', '绿色防控', '叶片识别'],
    updateHint: '适合病害识别联动',
  },
];

export const teaProducts: TeaProduct[] = [
  {
    id: 'lychee-longjing-cider',
    name: '荔枝龙井西打酒',
    grade: '2025 旅游商品铜奖',
    imageUrl: '/assets/products/lychee-longjing-cider.webp',
    intro:
      '融合荔枝与龙井：荔枝的甜对应郁达夫笔下柔情，龙井的清冽代表文人风骨，气泡如同友人谈笑时光。',
    spec: '文创饮品 / 果香气泡 / 微醺茶酒',
    tags: ['获奖商品', '郁达夫 IP', '助农文创'],
    actionLabel: '咨询合作',
    actionUrl: '#market-action-placeholders',
  },
  {
    id: 'xiaoguan-tea-gift-box',
    name: '小罐茶礼盒',
    grade: '达夫的朋友们 IP 系列',
    imageUrl: '/assets/products/xiaoguan-tea-gift-box.webp',
    intro:
      '采用创新理念整合国内茶行业优质资源，坚持原产地原料、大师工艺、大师监制，并以小罐保鲜技术呈现茶礼质感。',
    spec: '茶礼盒 / 小罐保鲜 / 大师监制',
    tags: ['礼盒', '原产地原料', '大师工艺'],
    actionLabel: '了解购买',
    actionUrl: '#market-action-placeholders',
  },
  {
    id: 'osmanthus-longjing-tea',
    name: '桂花龙井茶叶',
    grade: '杭州双物产融合',
    imageUrl: '/assets/products/osmanthus-longjing-tea.webp',
    intro:
      '融合杭州金桂与龙井，桂花香甜包裹龙井鲜醇，花香与茶韵相融，带来穿越古今的味觉体验。',
    spec: '桂花龙井 / 花香茶韵 / 茶叶产品',
    tags: ['桂花', '龙井', '茶文化'],
    actionLabel: '咨询合作',
    actionUrl: '#market-action-placeholders',
  },
  {
    id: 'longjing-steam-eye-mask',
    name: '龙井茶香蒸汽热敷眼罩',
    grade: '茶旅融合生活文创',
    imageUrl: '/assets/products/longjing-steam-eye-mask.webp',
    intro:
      '把龙井茶天然精粹融入日用产品，以温润蒸汽缓解眼部疲劳，茶香安神舒缓，延展富春山水与茶文化氛围。',
    spec: '蒸汽热敷 / 龙井茶香 / 日用文创',
    tags: ['生活文创', '茶旅融合', '舒缓体验'],
    actionLabel: '了解购买',
    actionUrl: '#market-action-placeholders',
  },
];

export const mediaAssets: MediaAsset[] = [
  {
    id: 'drone',
    type: 'video',
    title: '茶园航拍影像',
    coverUrl: 'https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?auto=format&fit=crop&w=1200&q=82',
    url: '/assets/placeholders/chunjian-drone.mp4',
    description: '呈现春建乡茶园航拍、晨雾与采茶队伍等影像素材。',
  },
  {
    id: 'craft',
    type: 'image',
    title: '手工制茶图文',
    coverUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=1200&q=82',
    url: '/assets/placeholders/tea-craft.jpg',
    description: '展示摊青、杀青、揉捻、干燥等工序，可替换为真实素材。',
  },
  {
    id: 'culture',
    type: 'image',
    title: '茶文化传播素材',
    coverUrl: 'https://images.unsplash.com/photo-1523920290228-4f321a939b4c?auto=format&fit=crop&w=1200&q=82',
    url: '/assets/placeholders/tea-culture.jpg',
    description: '串联品牌故事、节庆活动、非遗体验和茶席影像。',
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
