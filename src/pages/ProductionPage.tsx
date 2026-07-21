import { Activity, BrainCircuit, CloudSun, DatabaseZap, LayoutPanelTop, Leaf, MapPinned, Radar, RotateCcw, ScanSearch, ShieldCheck, Sprout, Waves } from 'lucide-react';
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FloatingDashboardWindow, type DashboardPanelId, type DashboardWindowPosition } from '../components/production/FloatingDashboardWindow';
import { KnowledgeHubPanel } from '../components/production/KnowledgeHubPanel';
import { MetricCard } from '../components/production/MetricCard';
import { PestDetectionPanel } from '../components/production/PestDetectionPanel';
import { SensorGauge } from '../components/production/SensorGauge';
import { WeatherLocationSelector } from '../components/production/WeatherLocationSelector';
import { heroAssets, knowledgeArticles, sensorMetrics, teaGardenZones, weatherMetrics } from '../data/mockData';
import { defaultWeatherLocation, fetchWeatherDashboard, formatLocationName, type WeatherForecastPoint, type WeatherLocation } from '../lib/weather';
import type { TeaGardenZone, WeatherMetric } from '../types/domain';

const ThreeTeaGardenScene = lazy(() =>
  import('../components/production/ThreeTeaGardenScene').then(({ ThreeTeaGardenScene: Scene }) => ({ default: Scene })),
);

const operationHighlights = [
  { label: '今日作业窗口', value: '06:30 - 10:30', note: '适宜采摘与巡园', icon: CloudSun },
  { label: '重点巡护片区', value: '东坡 3 号', note: '叶面湿度偏高', icon: Radar },
  { label: '综合生长态势', value: '良好', note: '春梢长势稳定', icon: Activity },
];

const elderPlantingTips = [
  { title: '今天适合做什么？', body: '上午天气较稳，适合采摘、巡园和查看新梢长势。下午如果湿度升高，优先做好通风排湿。' },
  { title: '重点看哪里？', body: '先看叶片背面和茶垄低洼处，发现斑点、卷叶或虫咬痕迹时，及时记录并隔离观察。' },
  { title: '浇水与施肥', body: '土壤湿度处在适宜范围，今天不建议大量补水。春梢生长期可少量多次补充有机肥。' },
];

interface DashboardWindowState {
  open: boolean;
  minimized: boolean;
  position: DashboardWindowPosition;
}

type DashboardWindowStates = Record<DashboardPanelId, DashboardWindowState>;
const dashboardPanels: DashboardPanelId[] = ['overview', 'weather', 'sensors', 'zone', 'leaf', 'knowledge'];

function getWindowWidth(panel: DashboardPanelId, viewportWidth: number) {
  const compact = viewportWidth <= 1023;
  const preferredWidth = panel === 'zone' || panel === 'leaf' || panel === 'knowledge' ? (compact ? 400 : 560) : (compact ? 336 : 352);
  return Math.min(preferredWidth, viewportWidth - 24);
}

function createWindowStates(): DashboardWindowStates {
  const viewportWidth = typeof window === 'undefined' ? 1440 : window.innerWidth;
  const compact = viewportWidth <= 1023;
  const right = (panel: DashboardPanelId) => Math.max(12, viewportWidth - getWindowWidth(panel, viewportWidth) - 16);

  return {
    overview: { open: true, minimized: false, position: { x: 16, y: compact ? 76 : 88 } },
    weather: { open: !compact, minimized: false, position: { x: right('weather'), y: compact ? 108 : 88 } },
    sensors: { open: false, minimized: false, position: { x: compact ? 16 : 38, y: compact ? 146 : 162 } },
    zone: { open: false, minimized: false, position: { x: compact ? 16 : 72, y: compact ? 180 : 138 } },
    leaf: { open: false, minimized: false, position: { x: right('leaf'), y: compact ? 212 : 132 } },
    knowledge: { open: false, minimized: false, position: { x: right('knowledge'), y: compact ? 244 : 164 } },
  };
}

interface ProductionPageProps {
  careMode?: boolean;
}

export function ProductionPage({ careMode = false }: ProductionPageProps) {
  const [weatherLocation, setWeatherLocation] = useState<WeatherLocation>(defaultWeatherLocation);
  const [liveWeatherMetrics, setLiveWeatherMetrics] = useState<WeatherMetric[]>(weatherMetrics);
  const [weatherForecast, setWeatherForecast] = useState<WeatherForecastPoint[]>([]);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string>();
  const [selectedZoneId, setSelectedZoneId] = useState(teaGardenZones[0].id);
  const [focusedZoneId, setFocusedZoneId] = useState<string>();
  const [windowStates, setWindowStates] = useState<DashboardWindowStates>(createWindowStates);
  const [windowOrder, setWindowOrder] = useState<DashboardPanelId[]>(dashboardPanels);
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
          setWeatherForecast(dashboard.forecast);
          lastSuccessfulWeatherLocation.current = weatherLocation;
        }
      } catch {
        if (!ignore) {
          const fallbackLocation = lastSuccessfulWeatherLocation.current;
          setWeatherError(`实时天气暂时不可用，已恢复至${formatLocationName(fallbackLocation)}的最近一次数据`);
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

  const selectedZone = teaGardenZones.find((zone) => zone.id === selectedZoneId) ?? teaGardenZones[0];
  const openPanels = useMemo(() => Object.fromEntries(
    Object.entries(windowStates).map(([panel, state]) => [panel, state.open]),
  ) as Record<DashboardPanelId, boolean>, [windowStates]);
  const bringToFront = useCallback((panel: DashboardPanelId) => {
    setWindowOrder((current) => [...current.filter((item) => item !== panel), panel]);
  }, []);
  const windowProps = (panel: DashboardPanelId) => ({
    isOpen: windowStates[panel].open,
    minimized: windowStates[panel].minimized,
    position: windowStates[panel].position,
    zIndex: 12 + windowOrder.indexOf(panel),
    onClose: () => closePanel(panel),
    onMinimize: () => minimizePanel(panel),
    onFocus: () => focusWindow(panel),
    onPositionChange: (position: DashboardWindowPosition) => updateWindowPosition(panel, position),
  });

  function closePanel(panel: DashboardPanelId) {
    setWindowStates((current) => ({ ...current, [panel]: { ...current[panel], open: false } }));
  }

  function minimizePanel(panel: DashboardPanelId) {
    setWindowStates((current) => ({ ...current, [panel]: { ...current[panel], minimized: !current[panel].minimized } }));
  }

  function openPanel(panel: DashboardPanelId) {
    setWindowStates((current) => ({ ...current, [panel]: { ...current[panel], open: true, minimized: false } }));
    bringToFront(panel);
  }

  function selectZone(zoneId: string) {
    setSelectedZoneId(zoneId);
    setFocusedZoneId(zoneId);
    setWindowStates((current) => ({ ...current, zone: { ...current.zone, open: true, minimized: false } }));
    bringToFront('zone');
  }

  function focusWindow(panel: DashboardPanelId) {
    bringToFront(panel);
  }

  function updateWindowPosition(panel: DashboardPanelId, position: DashboardWindowPosition) {
    setWindowStates((current) => ({ ...current, [panel]: { ...current[panel], position } }));
  }

  function resetWindowLayout() {
    setWindowStates(createWindowStates());
    setWindowOrder(dashboardPanels);
  }

  function resetScene() {
    setSelectedZoneId(teaGardenZones[0].id);
    setFocusedZoneId(undefined);
    setSceneResetToken((token) => token + 1);
    setWindowStates((current) => ({ ...current, overview: { ...current.overview, open: true, minimized: false } }));
  }

  return (
    <main className="production-dashboard production-twin">
      <div className="twin-canvas-shell">
        <Suspense fallback={<MapLoadingFallback />}>
          <ThreeTeaGardenScene zones={teaGardenZones} selectedZoneId={selectedZoneId} focusedZoneId={focusedZoneId} resetToken={sceneResetToken} onZoneSelect={selectZone} />
        </Suspense>
      </div>
      <div className="twin-map-vignette" />
      <div className="twin-map-atmosphere" />
      <div className="twin-map-scan" />

      <header className="twin-topbar">
        <div className="flex min-w-0 items-center gap-3">
          <span className="twin-topbar__mark"><Sprout className="h-4 w-4" /></span>
          <div className="min-w-0">
            <p className="twin-topbar__eyebrow">Chunjian digital twin</p>
            <h1 className="truncate text-lg font-black text-white sm:text-xl">春建乡智慧茶园数字孪生</h1>
          </div>
        </div>
        <div className="twin-topbar__meta">
          <span className="twin-live-status"><span />监测在线</span>
          <TwinClock />
          <button type="button" onClick={resetWindowLayout} className="twin-reset" title="Restore window layout" aria-label="Restore window layout">
            <LayoutPanelTop className="h-4 w-4" />
          </button>
          <button type="button" onClick={resetScene} className="twin-reset" title="回到默认视角" aria-label="回到默认视角">
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </header>

      <FloatingDashboardWindow
        id="overview"
        title="今日茶园态势"
        eyebrow="Production overview"
        icon={Activity}
        {...windowProps('overview')}
      >
        <p className="text-sm font-semibold leading-6 text-emerald-50/66">天气、土壤与叶面风险共同形成今日生产建议。</p>
        <div className="mt-4 grid gap-2">
          {operationHighlights.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="twin-stat-row">
                <Icon className="h-4 w-4 text-emerald-300" />
                <div className="min-w-0 flex-1">
                  <p>{item.label}</p>
                  <strong>{item.value}</strong>
                </div>
                <span>{item.note}</span>
              </div>
            );
          })}
        </div>
        <div className="twin-window__footnote"><MapPinned className="h-4 w-4" />点击地图监测点查看对应片区</div>
      </FloatingDashboardWindow>

      <FloatingDashboardWindow
        id="zone"
        title={selectedZone.name}
        eyebrow="Selected tea garden zone"
        icon={MapPinned}
        {...windowProps('zone')}
      >
        <ZoneDetail zone={selectedZone} />
      </FloatingDashboardWindow>

      <FloatingDashboardWindow
        id="sensors"
        title="茶园传感器"
        eyebrow="Live sensor network"
        icon={Waves}
        {...windowProps('sensors')}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {sensorMetrics.map((metric) => <SensorGauge key={metric.id} metric={metric} />)}
        </div>
      </FloatingDashboardWindow>

      <FloatingDashboardWindow
        id="weather"
        title="实时天气"
        eyebrow="Open-Meteo live data"
        icon={CloudSun}
        {...windowProps('weather')}
      >
        <WeatherLocationSelector compact location={weatherLocation} loading={weatherLoading} error={weatherError} onChange={setWeatherLocation} />
        <div className="mt-3 grid grid-cols-2 gap-3">
          {liveWeatherMetrics.map((metric, index) => (
            <div key={metric.id} className={index === liveWeatherMetrics.length - 1 ? 'col-span-2' : ''}>
              <MetricCard metric={metric} />
            </div>
          ))}
        </div>
        <WeatherTrend forecast={weatherForecast} />
      </FloatingDashboardWindow>

      <FloatingDashboardWindow
        id="leaf"
        title="叶片健康识别"
        eyebrow="Leaf health intelligence"
        icon={ScanSearch}
        {...windowProps('leaf')}
      >
        <PestDetectionPanel />
      </FloatingDashboardWindow>

      <FloatingDashboardWindow
        id="knowledge"
        title="农业知识辅助"
        eyebrow="Agronomy knowledge hub"
        icon={BrainCircuit}
        {...windowProps('knowledge')}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {knowledgeArticles.map((article, index) => (
            <article key={article.id} className="dashboard-article rounded-xl p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-300/10 text-emerald-200">
                  {index === 0 ? <Leaf className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                </span>
                <p className="text-sm font-bold text-emerald-200">{article.category}</p>
              </div>
              <h3 className="mt-4 text-lg font-black text-white">{article.title}</h3>
              <p className="mt-2 text-sm leading-6 text-emerald-50/68">{article.summary}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {article.tags.map((tag) => <span key={tag} className="twin-tag">{tag}</span>)}
              </div>
            </article>
          ))}
        </div>
        <KnowledgeHubPanel />
      </FloatingDashboardWindow>

      <nav className="twin-toolbar" aria-label="数字孪生工具栏">
        <ToolbarButton icon={Activity} label="今日态势" active={openPanels.overview} onClick={() => openPanel('overview')} />
        <ToolbarButton icon={CloudSun} label="实时天气" active={openPanels.weather} onClick={() => openPanel('weather')} />
        <ToolbarButton icon={Waves} label="传感器" active={openPanels.sensors} onClick={() => openPanel('sensors')} />
        <ToolbarButton icon={ScanSearch} label="叶片识别" active={openPanels.leaf} onClick={() => openPanel('leaf')} />
        <ToolbarButton icon={BrainCircuit} label="农业知识" active={openPanels.knowledge} onClick={() => openPanel('knowledge')} />
        <span className="twin-toolbar__divider" />
        <span className="twin-toolbar__hint"><DatabaseZap className="h-3.5 w-3.5" />数据实时联动</span>
      </nav>
    </main>
  );
}

function ToolbarButton({ icon: Icon, label, active, onClick }: { icon: typeof Activity; label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`twin-toolbar__button ${active ? 'is-active' : ''}`} aria-pressed={active} title={label}>
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}

function TwinClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <>
      <span className="hidden md:inline">{now.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit', weekday: 'short' })}</span>
      <time>{now.toLocaleTimeString('zh-CN', { hour12: false })}</time>
    </>
  );
}

function WeatherTrend({ forecast }: { forecast: WeatherForecastPoint[] }) {
  if (forecast.length === 0) {
    return null;
  }

  return (
    <section className="twin-weather-trend" aria-label="Next six hours weather trend">
      <div className="twin-weather-trend__header">
        <span>Next 6h</span>
        <span>rain probability / wind</span>
      </div>
      <div className="twin-weather-trend__grid">
        {forecast.map((point) => (
          <div key={point.time} className="twin-weather-trend__item">
            <time>{point.time}</time>
            <strong>{Math.round(point.temperature)}°</strong>
            <span>{point.rainProbability}% rain</span>
            <i style={{ height: `${Math.max(18, Math.min(100, point.rainProbability + point.wind * 1.8))}%` }} />
          </div>
        ))}
      </div>
    </section>
  );
}

function ZoneDetail({ zone }: { zone: TeaGardenZone }) {
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-2xl font-black text-white">{zone.name}</h3>
          <p className="mt-2 text-sm font-semibold text-emerald-50/62">{zone.action}</p>
        </div>
        <span className="rounded-full border border-emerald-200/18 bg-emerald-300/8 px-3 py-1 text-xs font-black text-emerald-100">{zone.status}</span>
      </div>
      <p className="mt-4 rounded-xl border border-amber-200/15 bg-amber-100/5 px-3 py-2 text-sm font-bold text-amber-100/92">{zone.risk}</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <ZoneMetric label="管理面积" value={zone.area} />
        <ZoneMetric label="环境温度" value={zone.temperature} />
        <ZoneMetric label="空气湿度" value={zone.humidity} />
        <ZoneMetric label="土壤湿度" value={zone.soilMoisture} />
      </div>
    </div>
  );
}

function ZoneMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="twin-zone-metric">
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  );
}

function MapLoadingFallback() {
  return (
    <div className="twin-map-loading">
      <img src="/assets/production/chunjian-digital-twin-map-v1.png" alt="春建乡茶园地图加载中" />
      <span>正在构建茶园数字孪生模型</span>
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
            <p className="mt-4 text-2xl font-semibold leading-relaxed text-white/76">下面几个数字用于判断茶树是否舒服。保持土壤微酸、湿度适中、光照不过强，春梢长势会更稳定。</p>
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
