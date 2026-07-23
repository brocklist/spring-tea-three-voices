import {
  Activity,
  AlertTriangle,
  BookOpenCheck,
  ChevronRight,
  CloudSun,
  Droplets,
  HeartHandshake,
  Leaf,
  MapPin,
  Radar,
  RotateCcw,
  ShieldCheck,
  Sprout,
  ThermometerSun,
  Waves,
  Wind,
  type LucideIcon,
} from 'lucide-react';
import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { PestDetectionPanel } from '../components/production/PestDetectionPanel';
import { SensorGauge } from '../components/production/SensorGauge';
import { WeatherLocationSelector } from '../components/production/WeatherLocationSelector';
import {
  externalKnowledgeSources,
  heroAssets,
  knowledgeArticles,
  leafDetectionDemos,
  sensorMetrics,
  teaGardenZones,
  weatherMetrics,
} from '../data/mockData';
import {
  defaultWeatherLocation,
  fetchWeatherDashboard,
  formatLocationName,
  type WeatherLocation,
} from '../lib/weather';
import type { WeatherMetric } from '../types/domain';

const ThreeTeaGardenScene = lazy(() =>
  import('../components/production/ThreeTeaGardenScene').then(({ ThreeTeaGardenScene: Scene }) => ({ default: Scene })),
);

const operationAdvice = [
  {
    title: '今天适合做什么',
    detail: '上午适合轻采春梢、巡园和记录新梢长势；午后湿度升高时优先通风排湿。',
    icon: Sprout,
    tone: 'gold',
  },
  {
    title: '今天重点检查哪里',
    detail: '重点观察叶片背面、茶垄低洼处与东坡片区的叶面湿度变化。',
    icon: Radar,
    tone: 'orange',
  },
  {
    title: '需要灌溉或施肥吗',
    detail: '土壤水分处于适宜范围，暂不建议大量补水；春梢期可少量补充有机肥。',
    icon: Droplets,
    tone: 'ivory',
  },
];

const elderPlantingTips = [
  { title: '今天适合做什么？', body: '上午天气较稳，适合采摘、巡园和查看新梢长势。下午如果湿度升高，优先做好通风排湿。' },
  { title: '重点看哪里？', body: '先看叶片背面和茶垄低洼处，发现斑点、卷叶或虫咬痕迹时，及时记录并隔离观察。' },
  { title: '浇水与施肥', body: '土壤湿度处在适宜范围，今天不建议大量补水。春梢生长期可少量多次补充有机肥。' },
];

interface ProductionPageProps {
  careMode?: boolean;
  onCareModeChange?: (enabled: boolean) => void;
}

export function ProductionPage({ careMode = false, onCareModeChange }: ProductionPageProps) {
  const [weatherLocation, setWeatherLocation] = useState<WeatherLocation>(defaultWeatherLocation);
  const [liveWeatherMetrics, setLiveWeatherMetrics] = useState<WeatherMetric[]>(weatherMetrics);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string>();
  const [selectedZoneId, setSelectedZoneId] = useState(teaGardenZones[0].id);
  const [focusedZoneId, setFocusedZoneId] = useState<string>();
  const [sceneResetToken, setSceneResetToken] = useState(0);
  const lastSuccessfulWeatherLocation = useRef(defaultWeatherLocation);

  useEffect(() => {
    let ignore = false;

    async function loadWeather() {
      setWeatherLoading(true);
      setWeatherError(undefined);

      try {
        const dashboard = await fetchWeatherDashboard(weatherLocation);
        if (!ignore) {
          setLiveWeatherMetrics(dashboard.metrics);
          lastSuccessfulWeatherLocation.current = weatherLocation;
        }
      } catch {
        if (!ignore) {
          const fallbackLocation = lastSuccessfulWeatherLocation.current;
          setWeatherError(`实时天气暂时不可用，已恢复至${formatLocationName(fallbackLocation)}的最近一次数据。`);
          setWeatherLocation((currentLocation) => currentLocation.id === weatherLocation.id ? fallbackLocation : currentLocation);
        }
      } finally {
        if (!ignore) {
          setWeatherLoading(false);
        }
      }
    }

    loadWeather();
    const timer = window.setInterval(loadWeather, 10 * 60 * 1000);
    return () => {
      ignore = true;
      window.clearInterval(timer);
    };
  }, [weatherLocation]);

  if (careMode) {
    return (
      <ElderCareProductionPage
        weatherLocation={weatherLocation}
        weatherMetrics={liveWeatherMetrics}
        weatherLoading={weatherLoading}
        weatherError={weatherError}
        onWeatherLocationChange={setWeatherLocation}
      />
    );
  }

  const weather = liveWeatherMetrics.find((metric) => metric.id === 'weather') ?? liveWeatherMetrics[0];
  const environmentMetrics = liveWeatherMetrics.filter((metric) => metric.id !== 'weather');

  function selectZone(zoneId: string) {
    setSelectedZoneId(zoneId);
    setFocusedZoneId(zoneId);
  }

  function resetScene() {
    setSelectedZoneId(teaGardenZones[0].id);
    setFocusedZoneId(undefined);
    setSceneResetToken((token) => token + 1);
  }

  return (
    <main className="production-dashboard production-command">
      <div className="command-grid">
        <aside className="command-column command-column--left">
          <DashboardPanel number="01" title="实时茶园天气查询" subtitle="春建乡 · 富阳 · 杭州" icon={CloudSun} priority="primary" tone="gold">
            <WeatherLocationSelector compact location={weatherLocation} loading={weatherLoading} error={weatherError} onChange={setWeatherLocation} />
            <div className="command-weather-summary">
              <div className="command-weather-summary__condition">
                <CloudSun className="h-10 w-10" />
                <strong>{weather?.value ?? '多云'}</strong>
              </div>
              <div className="command-weather-summary__metrics">
                {environmentMetrics.map((metric) => <WeatherMetricRow key={metric.id} metric={metric} />)}
              </div>
            </div>
            <div className="command-reminders" aria-label="生产提醒">
              <span>生产提醒</span>
              <p>适宜采摘与巡园</p>
              <p>低洼地块注意排湿</p>
              <p>风力较小，适合户外作业</p>
            </div>
          </DashboardPanel>

          <DashboardPanel number="02" title="今日茶园生产态势" icon={Activity}>
            <div className="command-status-grid">
              <StatusTile label="今日作业窗口" value="适宜采摘" icon={Leaf} />
              <StatusTile label="重点巡护片区" value="东坡低洼区" icon={MapPin} tone="orange" />
              <StatusTile label="综合生长态势" value="总体良好" icon={Sprout} tone="gold" />
            </div>
          </DashboardPanel>

          <DashboardPanel number="03" title="老年关怀模式" icon={HeartHandshake}>
            <button type="button" className="command-care-toggle" onClick={() => onCareModeChange?.(true)}>
              <span className="command-care-toggle__icon"><HeartHandshake className="h-5 w-5" /></span>
              <span><strong>一键开启</strong><small>放大字体、简化信息、保留关键提醒</small></span>
              <span className="command-care-toggle__switch" aria-hidden="true"><i /></span>
            </button>
          </DashboardPanel>
        </aside>

        <section className="command-map-panel command-map-panel--primary" aria-label="春建乡茶园数字孪生地图">
          <div className="command-map-panel__heading">
            <span className="command-map-panel__eyebrow"><Waves className="h-4 w-4" /> 茶园数字孪生地图</span>
            <button type="button" onClick={resetScene} className="command-map-panel__reset"><RotateCcw className="h-4 w-4" /> 重置地图</button>
          </div>
          <div className="command-map-panel__scene">
            <Suspense fallback={<MapLoadingFallback />}>
              <ThreeTeaGardenScene
                zones={teaGardenZones}
                selectedZoneId={selectedZoneId}
                focusedZoneId={focusedZoneId}
                resetToken={sceneResetToken}
                onZoneSelect={selectZone}
              />
            </Suspense>
          </div>
          <div className="command-map-panel__veil" />
          <div className="command-map-panel__footer">
            <span><i /> 实时点位在线</span>
            <span>拖动旋转地图，点击数据卡片查看片区状态</span>
          </div>
        </section>

        <aside className="command-column command-column--right">
          <DashboardPanel number="04" title="茶园环境监测驾驶舱" icon={Waves} priority="primary" tone="ivory">
            <div className="command-gauge-grid">
              {sensorMetrics.map((metric) => <SensorGauge key={metric.id} metric={metric} variant="dashboard" />)}
            </div>
          </DashboardPanel>

          <DashboardPanel number="05" title="智能农事建议" icon={Sprout} priority="primary" tone="orange">
            <div className="command-advice-list">
              {operationAdvice.map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.title} className={`command-advice command-advice--${item.tone}`}>
                    <span><Icon className="h-4 w-4" /></span>
                    <div><h3>{item.title}</h3><p>{item.detail}</p></div>
                    <ChevronRight className="h-4 w-4" />
                  </article>
                );
              })}
            </div>
          </DashboardPanel>

          <DashboardPanel number="06" title="茶叶病虫害图片识别" icon={AlertTriangle} tone="orange">
            <PestDetectionPanel variant="dashboard" />
          </DashboardPanel>
        </aside>

        <section className="command-bottom command-bottom--knowledge">
          <DashboardPanel number="07" title="农业知识辅助" icon={BookOpenCheck} tone="ivory">
            <div className="command-knowledge-layout">
              <div className="command-article-strip">
                {knowledgeArticles.map((article) => (
                  <article key={article.id} className="command-article-card">
                    <span>{article.category}</span>
                    <h3>{article.title}</h3>
                    <p>{article.summary}</p>
                    <button type="button">查看详情 <ChevronRight className="h-3.5 w-3.5" /></button>
                  </article>
                ))}
              </div>
              <nav className="command-source-list" aria-label="官方资源导航">
                <p>官方资源导航</p>
                {externalKnowledgeSources.map((source) => (
                  <a key={source.id} href={source.url} target="_blank" rel="noreferrer"><span>{source.organization}</span><ChevronRight className="h-3.5 w-3.5" /></a>
                ))}
              </nav>
            </div>
          </DashboardPanel>
        </section>

        <section className="command-bottom command-bottom--overview">
          <DashboardPanel number="08" title="平台总览" subtitle="演示数据" icon={ShieldCheck} tone="gold">
            <div className="command-audience-list">
              <span>茶农</span><i>›</i><span>茶企</span><i>›</i><span>消费者</span><i>›</i><span>高校学生团队</span>
            </div>
            <div className="command-platform-stats">
              <PlatformStat label="接入茶园" value={String(teaGardenZones.length)} />
              <PlatformStat label="资料来源" value={String(externalKnowledgeSources.length)} />
              <PlatformStat label="识别样本" value={String(leafDetectionDemos.length)} />
              <PlatformStat label="核心模块" value="3" />
            </div>
          </DashboardPanel>
        </section>
      </div>
    </main>
  );
}

function DashboardPanel({
  number,
  title,
  subtitle,
  icon: Icon,
  children,
  priority = 'standard',
  tone = 'ivory',
}: {
  number: string;
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  children: ReactNode;
  priority?: 'primary' | 'standard';
  tone?: 'gold' | 'orange' | 'ivory' | 'mint';
}) {
  return (
    <section className={`command-panel command-panel--${priority} command-panel--${tone}`}>
      <header className="command-panel__header">
        <span className="command-panel__number">{number}</span>
        <Icon className="h-4 w-4" />
        <div><h2>{title}</h2>{subtitle ? <p>{subtitle}</p> : null}</div>
      </header>
      <div className="command-panel__body">{children}</div>
    </section>
  );
}

function WeatherMetricRow({ metric }: { metric: WeatherMetric }) {
  const iconMap: Record<string, LucideIcon> = {
    temperature: ThermometerSun,
    humidity: Droplets,
    rain: CloudSun,
    wind: Wind,
  };
  const Icon = iconMap[metric.id] ?? Activity;

  return (
    <div className="command-weather-row">
      <span><Icon className="h-3.5 w-3.5" /> {metric.label}</span>
      <strong>{metric.value}{metric.unit}</strong>
    </div>
  );
}

function StatusTile({ label, value, icon: Icon, tone = 'mint' }: { label: string; value: string; icon: LucideIcon; tone?: 'mint' | 'orange' | 'gold' | 'ivory' }) {
  return (
    <article className={`command-status-tile command-status-tile--${tone}`}>
      <Icon className="h-6 w-6" />
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function PlatformStat({ label, value }: { label: string; value: string }) {
  return <div><dt>{label}</dt><dd>{value}</dd></div>;
}

function MapLoadingFallback() {
  return (
    <div className="command-map-loading">
      <img src="/assets/production/chunjian-digital-twin-map-v1.png" alt="春建乡茶园数字孪生地图加载中" />
      <span>正在构建茶园数字孪生地图</span>
    </div>
  );
}

function ElderCareProductionPage({
  weatherLocation,
  weatherMetrics,
  weatherLoading,
  weatherError,
  onWeatherLocationChange,
}: {
  weatherLocation: WeatherLocation;
  weatherMetrics: WeatherMetric[];
  weatherLoading: boolean;
  weatherError?: string;
  onWeatherLocationChange: (location: WeatherLocation) => void;
}) {
  return (
    <div className="bg-[#f7fbf3]">
      <section className="relative overflow-hidden bg-tea-ink">
        <div className="absolute inset-0">
          <img src={heroAssets.production} alt="" className="h-full w-full object-cover opacity-42" />
          <div className="absolute inset-0 bg-gradient-to-br from-tea-ink via-tea-ink/86 to-tea-leaf/72" />
        </div>
        <div className="section-shell relative py-14 sm:py-20">
          <div className="max-w-4xl">
            <div className="inline-flex rounded-full bg-white/14 px-5 py-2 text-xl font-black text-white backdrop-blur">老年关怀模式</div>
            <h1 className="mt-6 text-4xl font-black leading-tight text-white sm:text-6xl">春建茶园今日信息</h1>
            <p className="mt-5 max-w-3xl text-2xl font-semibold leading-relaxed text-white/82">只保留天气、种植建议和巡园提醒。当前地点：{formatLocationName(weatherLocation)}。</p>
          </div>
        </div>
      </section>

      <section id="primary-section" className="section-shell py-10 sm:py-14">
        <WeatherLocationSelector location={weatherLocation} loading={weatherLoading} error={weatherError} onChange={onWeatherLocationChange} />
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {weatherMetrics.map((metric) => (
            <article key={metric.id} className="tea-card rounded-[1.75rem] p-6">
              <p className="text-2xl font-black text-tea-leaf">{metric.label}</p>
              <div className="mt-4 flex items-end gap-2">
                <span className="text-5xl font-black text-tea-ink">{metric.value}</span>
                {metric.unit ? <span className="pb-2 text-2xl font-black text-tea-ink/62">{metric.unit}</span> : null}
              </div>
              <div className="tea-footer mt-5 rounded-2xl px-5 py-4">
                <p className="text-xl font-bold leading-relaxed text-tea-ink">{metric.status}</p>
                <p className="mt-1 text-lg font-semibold text-tea-ink/58">更新时间：{metric.updatedAt}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell pb-14">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="tea-card rounded-[2rem] p-7">
            <h2 className="text-4xl font-black text-tea-ink">今日种植提醒</h2>
            <div className="mt-6 grid gap-4">
              {elderPlantingTips.map((tip) => (
                <div key={tip.title} className="tea-footer rounded-3xl p-5">
                  <h3 className="text-2xl font-black text-tea-leaf">{tip.title}</h3>
                  <p className="mt-3 text-2xl font-semibold leading-relaxed text-tea-ink/78">{tip.body}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="tech-panel rounded-[2rem] p-7">
            <h2 className="text-4xl font-black text-white">茶园环境</h2>
            <p className="mt-4 text-2xl font-semibold leading-relaxed text-white/76">下面几个数字用于判断茶树是否舒适。保持土壤微酸、湿度适中、光照不过强，春梢长势会更稳定。</p>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {sensorMetrics.slice(0, 4).map((metric) => (
                <div key={metric.id} className="rounded-3xl border border-white/12 bg-white/10 p-5 text-white">
                  <p className="text-xl font-bold text-white/70">{metric.label}</p>
                  <p className="mt-3 text-5xl font-black">{metric.value}<span className="ml-1 text-2xl text-white/62">{metric.unit}</span></p>
                  <p className="mt-4 text-xl font-semibold text-tea-spring">适宜区间：{metric.range}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
