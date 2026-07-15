import { Activity, BrainCircuit, CloudSun, DatabaseZap, Leaf, Radar, ShieldCheck, Waves } from 'lucide-react';
import { motion } from 'motion/react';
import { MetricCard } from '../components/production/MetricCard';
import { PestDetectionPanel } from '../components/production/PestDetectionPanel';
import { SensorGauge } from '../components/production/SensorGauge';
import { Hero } from '../components/ui/Hero';
import { SectionHeader } from '../components/ui/SectionHeader';
import { heroAssets, knowledgeArticles, sensorMetrics, weatherMetrics } from '../data/mockData';

const operationHighlights = [
  { label: '今日作业窗口', value: '06:30 - 10:30', note: '适宜采摘与巡园', icon: CloudSun },
  { label: '重点巡护片区', value: '东坡 3 号', note: '叶面湿度偏高', icon: Radar },
  { label: '综合生长态势', value: '良好', note: '春梢长势稳定', icon: Activity },
];

export function ProductionPage() {
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
              description="天气、温湿度、降雨与风力数据集中展示，为采摘排班、病害预防和无人机巡田提供判断依据。"
            />
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {weatherMetrics.map((metric) => (
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
      </section>
    </>
  );
}
