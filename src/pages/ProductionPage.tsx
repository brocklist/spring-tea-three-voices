import { Activity, BrainCircuit, CloudSun, DatabaseZap, Leaf, Radar, ShieldCheck, Waves } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { MetricCard } from '../components/production/MetricCard';
import { KnowledgeHubPanel } from '../components/production/KnowledgeHubPanel';
import { PestDetectionPanel } from '../components/production/PestDetectionPanel';
import { SensorGauge } from '../components/production/SensorGauge';
import { WeatherLocationSelector } from '../components/production/WeatherLocationSelector';
import { Hero } from '../components/ui/Hero';
import { SectionHeader } from '../components/ui/SectionHeader';
import { heroAssets, knowledgeArticles, sensorMetrics, weatherMetrics } from '../data/mockData';
import { defaultWeatherLocation, fetchWeatherMetrics, formatLocationName, type WeatherLocation } from '../lib/weather';
import type { WeatherMetric } from '../types/domain';

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

  useEffect(() => {
    let ignore = false;

    async function loadWeather() {
      setWeatherLoading(true);
      setWeatherError(undefined);

      try {
        const metrics = await fetchWeatherMetrics(weatherLocation);
        if (!ignore) {
          setLiveWeatherMetrics(metrics);
        }
      } catch {
        if (!ignore) {
          setWeatherError('实时天气暂时不可用，已保留最近一次数据');
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

  return (
    <>
      <Hero
        eyebrow="数智茶鸣｜智慧生产"
        title="让春建茶园会感知、会预警、会生长"
        description="围绕气象环境、土壤传感、叶片图像识别与农技知识服务，构建面向茶农和茶园管理者的智慧生产驾驶舱。"
        imageUrl={heroAssets.production}
        primaryLabel="查看茶园态势"
        secondaryLabel="进入智能识别"
      />

      <section id="primary-section" className="section-shell py-16">
        <div className="grid gap-8 xl:grid-cols-[0.78fr_1.22fr]">
          <div className="tea-card rounded-[2rem] p-6 lg:p-7">
            <div className="inline-flex items-center gap-2 rounded-full bg-tea-mist px-3 py-1 text-xs font-black text-tea-leaf">
              <Waves className="h-3.5 w-3.5" />
              春建茶园态势
            </div>
            <h2 className="mt-5 text-3xl font-black tracking-tight text-tea-ink sm:text-4xl">一屏掌握今日茶园生产节奏</h2>
            <p className="mt-4 text-base leading-7 text-tea-ink/66">
              结合天气变化、土壤状态、叶面风险和农事建议，帮助茶农更快判断采摘、巡园、排湿、施肥等关键动作。
            </p>
            <div className="mt-7 grid gap-3">
              {operationHighlights.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="tea-footer flex items-center gap-4 rounded-2xl p-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-tea-leaf shadow-sm">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-tea-ink/42">{item.label}</p>
                      <p className="mt-1 text-xl font-black text-tea-ink">{item.value}</p>
                    </div>
                    <p className="hidden text-sm font-bold text-tea-leaf sm:block">{item.note}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <SectionHeader
              eyebrow="Field Climate"
              title="气象与茶园环境监测"
              description={`实时天气来自用户选择的地点：${formatLocationName(weatherLocation)}。天气、温湿度、降雨与风力数据集中展示，为采摘排班和病害预防提供判断依据。`}
            />
            <div className="mt-6">
              <WeatherLocationSelector
                location={weatherLocation}
                loading={weatherLoading}
                error={weatherError}
                onChange={setWeatherLocation}
              />
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {liveWeatherMetrics.map((metric) => (
                <MetricCard key={metric.id} metric={metric} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell pb-16">
        <div className="tech-panel overflow-hidden rounded-[2rem] p-6 sm:p-8 lg:p-9">
          <div className="pointer-events-none absolute" />
          <div className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3 py-1 text-xs font-bold text-tea-spring">
                <DatabaseZap className="h-4 w-4" />
                Tea Garden Sensor Hub
              </div>
              <h2 className="mt-5 text-3xl font-black text-white sm:text-4xl">茶园传感器驾驶舱</h2>
              <p className="mt-4 text-base leading-7 text-white/70">
                土壤酸碱度、湿度、冠层温度、光照强度以卡片化方式呈现，方便快速判断茶树生长环境是否处在适宜区间。
              </p>
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/8 p-4 text-white">
                  <BrainCircuit className="h-5 w-5 text-tea-spring" />
                  <p className="mt-3 text-sm font-bold text-white/58">智能分析</p>
                  <p className="mt-1 text-lg font-black">识别异常趋势</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/8 p-4 text-white">
                  <Leaf className="h-5 w-5 text-tea-spring" />
                  <p className="mt-3 text-sm font-bold text-white/58">农事响应</p>
                  <p className="mt-1 text-lg font-black">辅助巡园决策</p>
                </div>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {sensorMetrics.map((metric) => (
                <SensorGauge key={metric.id} metric={metric} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell pb-16">
        <SectionHeader
          eyebrow="Leaf Health"
          title="叶片健康识别"
          description="上传茶叶叶片图片后，系统展示识别类型、置信度、简要说明与处理建议，辅助茶农快速形成巡护判断。"
        />
        <div className="mt-8">
          <PestDetectionPanel />
        </div>
      </section>

      <section id="resource-slots" className="section-shell pb-20">
        <SectionHeader
          eyebrow="Agronomy Guide"
          title="农业知识辅助"
          description="围绕种植管理、施肥建议和病虫害防治整理农技内容，为茶园日常管护提供清晰参考。"
        />
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {knowledgeArticles.map((article, index) => (
            <motion.article
              key={article.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.42, delay: index * 0.06 }}
              className="rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-soft"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-tea-mist text-tea-leaf">
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
    </>
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
