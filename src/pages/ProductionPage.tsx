import { Activity, BrainCircuit, CloudSun, DatabaseZap, Leaf, MapPinned, Radar, ShieldCheck, Sprout, Waves } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { MetricCard } from '../components/production/MetricCard';
import { KnowledgeHubPanel } from '../components/production/KnowledgeHubPanel';
import { PestDetectionPanel } from '../components/production/PestDetectionPanel';
import { SensorGauge } from '../components/production/SensorGauge';
import { WeatherLocationSelector } from '../components/production/WeatherLocationSelector';
import { heroAssets, knowledgeArticles, sensorMetrics, teaGardenZones, weatherMetrics } from '../data/mockData';
import { defaultWeatherLocation, fetchWeatherMetrics, formatLocationName, type WeatherLocation } from '../lib/weather';
import type { TeaGardenZone, WeatherMetric } from '../types/domain';

const operationHighlights = [
  { label: '今日作业窗口', value: '06:30 - 10:30', note: '适宜采摘与巡园', icon: CloudSun },
  { label: '重点巡护片区', value: '东坡 3 号', note: '叶面湿度偏高', icon: Radar },
  { label: '综合生长态势', value: '良好', note: '春梢长势稳定', icon: Activity },
];

interface ProductionPageProps {
  careMode?: boolean;
}

const elderPlantingTips = [
  {
    title: '今天适合做什么',
    body: '上午天气较稳，适合采摘、巡园和查看新梢长势。下午如果湿度升高，优先做好通风排湿。',
  },
  {
    title: '重点看哪里',
    body: '先看叶片背面和茶垄低洼处，发现褐斑、卷叶或虫咬痕迹时，及时记录并隔离观察。',
  },
  {
    title: '浇水与施肥',
    body: '土壤湿度处在适宜范围，今天不建议大量补水。春梢生长期可少量多次补充有机肥。',
  },
];

export function ProductionPage({ careMode = false }: ProductionPageProps) {
  const [weatherLocation, setWeatherLocation] = useState<WeatherLocation>(defaultWeatherLocation);
  const [liveWeatherMetrics, setLiveWeatherMetrics] = useState<WeatherMetric[]>(weatherMetrics);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string>();
  const [selectedZoneId, setSelectedZoneId] = useState(teaGardenZones[0].id);
  const [now, setNow] = useState(() => new Date());
  const lastSuccessfulWeatherLocation = useRef(defaultWeatherLocation);

  useEffect(() => {
    let ignore = false;

    async function loadWeather() {
      setWeatherLoading(true);
      setWeatherError(undefined);

      try {
        const metrics = await fetchWeatherMetrics(weatherLocation);
        if (!ignore) {
          setLiveWeatherMetrics(metrics);
          lastSuccessfulWeatherLocation.current = weatherLocation;
        }
      } catch {
        if (!ignore) {
          const fallbackLocation = lastSuccessfulWeatherLocation.current;
          setWeatherError(`实时天气暂时不可用，已恢复至${formatLocationName(fallbackLocation)}的最近一次数据`);
          setWeatherLocation((currentLocation) =>
            currentLocation.id === weatherLocation.id ? fallbackLocation : currentLocation,
          );
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

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

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

  return (
    <div className="production-dashboard">
      <main className="dashboard-shell">
        <header className="flex flex-col gap-4 border-b border-emerald-100/10 pb-5 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center">
          <div className="flex items-center gap-3 text-sm font-bold text-emerald-100/62">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-200/16 bg-emerald-300/8 text-emerald-200">
              <Sprout className="h-4 w-4" />
            </span>
            <span>数智茶鸣｜智慧生产</span>
          </div>
          <div className="text-left lg:text-center">
            <p className="dashboard-kicker">Chunjian smart tea garden</p>
            <h1 className="mt-1 text-2xl font-black tracking-wide text-white sm:text-3xl">春建乡智慧茶园生产驾驶舱</h1>
          </div>
          <div className="text-left text-sm font-bold text-emerald-50/62 lg:text-right">
            <p>{now.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' })}</p>
            <p className="mt-1 text-lg tracking-[0.12em] text-emerald-100">{now.toLocaleTimeString('zh-CN', { hour12: false })}</p>
          </div>
        </header>

        <section id="primary-section" className="pt-6">
          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-[minmax(245px,0.78fr)_minmax(460px,1.35fr)_minmax(285px,0.86fr)]">
            <aside className="grid content-start gap-5 lg:order-2 xl:order-none">
              <article className="dashboard-panel rounded-2xl p-5">
                <p className="dashboard-kicker">Production overview</p>
                <h2 className="mt-3 text-2xl font-black text-white">今日茶园态势</h2>
                <p className="mt-3 text-sm leading-6 text-emerald-50/62">天气、土壤与叶面风险共同形成今日生产建议。</p>
                <div className="mt-5 grid gap-2">
                  {operationHighlights.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="flex items-center gap-3 border-t border-white/7 py-3 first:border-t-0 first:pt-0">
                        <Icon className="h-4 w-4 shrink-0 text-emerald-300" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-emerald-50/46">{item.label}</p>
                          <p className="mt-1 text-lg font-black text-white">{item.value}</p>
                        </div>
                        <span className="text-right text-xs font-bold leading-5 text-emerald-200/76">{item.note}</span>
                      </div>
                    );
                  })}
                </div>
              </article>

              <ZoneDetail zone={selectedZone} />
            </aside>

            <div className="lg:order-1 lg:col-span-2 xl:order-none xl:col-span-1">
              <GardenRadar selectedZoneId={selectedZone.id} onZoneChange={setSelectedZoneId} />
            </div>

            <aside className="grid content-start gap-5 lg:order-3 xl:order-none">
              <WeatherLocationSelector
                compact
                location={weatherLocation}
                loading={weatherLoading}
                error={weatherError}
                onChange={setWeatherLocation}
              />
              <div className="grid grid-cols-2 gap-3">
                {liveWeatherMetrics.map((metric, index) => (
                  <div key={metric.id} className={index === liveWeatherMetrics.length - 1 ? 'col-span-2' : ''}>
                    <MetricCard metric={metric} />
                  </div>
                ))}
              </div>
            </aside>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {sensorMetrics.map((metric) => (
              <SensorGauge key={metric.id} metric={metric} />
            ))}
          </div>
        </section>

        <section className="mt-10">
          <DashboardSectionHeader
            eyebrow="Leaf health intelligence"
            title="叶片健康识别"
            description="上传样本或进入演示识别，快速查看病害类型、置信度、重点部位与处理建议。"
          />
          <div className="mt-5">
            <PestDetectionPanel />
          </div>
        </section>

        <section id="resource-slots" className="mt-12">
          <DashboardSectionHeader
            eyebrow="Agronomy knowledge hub"
            title="农业知识辅助"
            description="将种植管理、病虫害防治与权威农技来源集中为可继续扩展的茶园知识入口。"
          />
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {knowledgeArticles.map((article, index) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.42, delay: index * 0.06 }}
                className="dashboard-article rounded-2xl p-5 transition hover:-translate-y-1"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-tea-mist text-tea-leaf">
                  {index === 0 ? <Leaf className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
                </div>
                <p className="mt-5 text-sm font-bold text-tea-leaf">{article.category}</p>
                <h3 className="mt-2 text-xl font-black text-tea-ink">{article.title}</h3>
                <p className="mt-3 text-sm leading-6 text-tea-ink/66">{article.summary}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-tea-mist px-3 py-1 text-xs font-bold text-tea-ink/58">
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.article>
            ))}
          </div>
          <KnowledgeHubPanel />
        </section>
      </main>
    </div>
  );
}

function DashboardSectionHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="dashboard-panel rounded-2xl px-5 py-5 sm:flex sm:items-end sm:justify-between sm:gap-8">
      <div>
        <p className="dashboard-kicker">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">{title}</h2>
      </div>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50/62 sm:mt-0">{description}</p>
    </div>
  );
}

function GardenRadar({ selectedZoneId, onZoneChange }: { selectedZoneId: string; onZoneChange: (zoneId: string) => void }) {
  return (
    <article className="dashboard-panel rounded-2xl p-3 sm:p-4">
      <div className="mb-3 flex items-center justify-between gap-3 px-1">
        <div>
          <p className="dashboard-kicker">Garden zone radar</p>
          <h2 className="mt-1 text-lg font-black text-white">茶园片区实时态势</h2>
        </div>
        <span className="inline-flex items-center gap-2 text-xs font-bold text-emerald-100/58"><span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.9)]" />监测在线</span>
      </div>
      <div className="garden-radar rounded-xl">
        <div className="radar-crosshair absolute inset-0" />
        <div className="radar-scan" />
        <div className="radar-center"><Radar className="h-7 w-7" /></div>
        {teaGardenZones.map((zone) => (
          <button
            key={zone.id}
            type="button"
            onClick={() => onZoneChange(zone.id)}
            className={['radar-marker', zone.id === selectedZoneId ? 'is-selected' : ''].join(' ')}
            style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
            aria-pressed={zone.id === selectedZoneId}
            aria-label={`查看${zone.name}片区详情`}
          >
            <span className="radar-marker-dot"><MapPinned className="h-3.5 w-3.5" /></span>
            <span className="radar-marker-label text-left"><span className="block text-xs font-black">{zone.name}</span><span className="mt-0.5 block text-[10px] font-bold text-emerald-100/60">{zone.status}</span></span>
          </button>
        ))}
      </div>
    </article>
  );
}

function ZoneDetail({ zone }: { zone: TeaGardenZone }) {
  return (
    <article className="dashboard-panel rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="dashboard-kicker">Selected zone</p>
          <h2 className="mt-2 text-2xl font-black text-white">{zone.name}</h2>
        </div>
        <span className="rounded-full border border-emerald-200/18 bg-emerald-300/8 px-3 py-1 text-xs font-black text-emerald-100">{zone.status}</span>
      </div>
      <p className="mt-4 rounded-xl border border-amber-200/12 bg-amber-100/5 px-3 py-2 text-sm font-bold text-amber-100/88">{zone.risk}</p>
      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <ZoneMetric label="管理面积" value={zone.area} />
        <ZoneMetric label="环境温度" value={zone.temperature} />
        <ZoneMetric label="空气湿度" value={zone.humidity} />
        <ZoneMetric label="土壤湿度" value={zone.soilMoisture} />
      </div>
      <div className="mt-5 border-t border-white/8 pt-4">
        <p className="text-xs font-bold text-emerald-100/42">建议动作</p>
        <p className="mt-2 text-sm font-semibold leading-6 text-emerald-50/78">{zone.action}</p>
      </div>
    </article>
  );
}

function ZoneMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.035] p-3">
      <p className="text-xs font-bold text-emerald-50/44">{label}</p>
      <p className="mt-2 text-lg font-black text-white">{value}</p>
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
            <div className="inline-flex rounded-full bg-white/14 px-5 py-2 text-xl font-black text-white backdrop-blur">
              老年关怀模式
            </div>
            <h1 className="mt-6 text-4xl font-black leading-tight text-white sm:text-6xl">春建茶园今日信息</h1>
            <p className="mt-5 max-w-3xl text-2xl font-semibold leading-relaxed text-white/82">
              只保留天气、种植建议和巡园提醒。当前地点：{formatLocationName(weatherLocation)}。
            </p>
          </div>
        </div>
      </section>

      <section id="primary-section" className="section-shell py-10 sm:py-14">
        <WeatherLocationSelector
          location={weatherLocation}
          loading={weatherLoading}
          error={weatherError}
          onChange={onWeatherLocationChange}
        />
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
            <p className="mt-4 text-2xl font-semibold leading-relaxed text-white/76">
              下面几个数字用于判断茶树是否舒服。保持土壤微酸、湿度适中、光照不过强，春梢长势会更稳定。
            </p>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {sensorMetrics.slice(0, 4).map((metric) => (
                <div key={metric.id} className="rounded-3xl border border-white/12 bg-white/10 p-5 text-white">
                  <p className="text-xl font-bold text-white/70">{metric.label}</p>
                  <p className="mt-3 text-5xl font-black">
                    {metric.value}
                    <span className="ml-1 text-2xl text-white/62">{metric.unit}</span>
                  </p>
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
