export type Trend = 'up' | 'down' | 'stable';

export interface WeatherMetric {
  id: string;
  label: string;
  value: string;
  unit?: string;
  status: string;
  updatedAt: string;
}

export interface SensorMetric {
  id: string;
  label: string;
  value: number;
  unit: string;
  range: string;
  trend: Trend;
}

export interface TeaGardenZone {
  id: string;
  name: string;
  position: [number, number, number];
  focusOffset: [number, number, number];
  markerTone: 'mint' | 'cyan' | 'gold';
  status: string;
  risk: string;
  area: string;
  temperature: string;
  humidity: string;
  soilMoisture: string;
  action: string;
}

export interface PestDetectionResult {
  imageUrl?: string;
  pestType: string;
  confidence: number;
  summary: string;
  suggestion: string;
  severity?: string;
  leafPart?: string;
  analysisPoints?: string[];
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  summary: string;
  tags: string[];
}

export interface ExternalKnowledgeSource {
  id: string;
  title: string;
  organization: string;
  category: string;
  url: string;
  summary: string;
  sourceType: 'official' | 'research' | 'extension';
  tags: string[];
  updateHint: string;
}

export interface TeaProduct {
  id: string;
  name: string;
  grade: string;
  imageUrl: string;
  intro: string;
  spec: string;
  tags: string[];
  actionLabel: string;
  actionUrl: string;
}

export interface MediaAsset {
  id: string;
  type: 'image' | 'video';
  title: string;
  coverUrl: string;
  url: string;
  description: string;
}

export interface StudentProject {
  id: string;
  projectName: string;
  teamIntro: string;
  direction: string;
  requiredResources: string;
  cooperationMode: string;
  contact: string;
  tags: string[];
  attachmentName?: string;
  createdAt: string;
}

export interface TeaGardenResource {
  id: string;
  gardenName: string;
  location: string;
  resources: string;
  supportedDirections: string;
  cooperationTerms: string;
  contact: string;
  tags: string[];
  mediaName?: string;
  createdAt: string;
}

export interface MatchResult {
  id: string;
  project: StudentProject;
  garden: TeaGardenResource;
  matchedTags: string[];
  score: number;
  reason: string;
}
