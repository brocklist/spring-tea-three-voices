import { ArrowUpRight, Film, Image as ImageIcon, Quote, Sprout } from 'lucide-react';
import { motion } from 'motion/react';
import { ProductCard } from '../components/market/ProductCard';
import { Hero } from '../components/ui/Hero';
import { SectionHeader } from '../components/ui/SectionHeader';
import { heroAssets, mediaAssets, teaProducts } from '../data/mockData';

const brandStoryCards = [
  {
    id: 'origin',
    label: '板块 1',
    title: '茶园产地',
    subtitle: '山野原生茶园・一方水土养好茶',
    description:
      '实地走访春建乡核心茶山，用实景图文、农户采访、产地气候土壤数据，还原茶园原生生长环境，记录茶山百年沿革与乡土自然故事。',
    url: 'https://mp.weixin.qq.com/s/7gL4rSQSrE0kElfU8ScTUA',
  },
  {
    id: 'craft',
    label: '板块 2',
    title: '制茶工艺',
    subtitle: '古法匠心制茶・坚守手作本味',
    description:
      '完整拆解从采摘到成茶全流程工艺，收录制茶老师傅口述实录、工序实拍、风味品鉴数据，读懂一杯好茶背后代代相传的手工技艺。',
    url: 'https://mp.weixin.qq.com/s/pG3qqR58TAEuDs4GsDPqYg',
  },
  {
    id: 'tea-seat',
    label: '板块 3',
    title: '茶席文化',
    subtitle: '新式乡村茶席・活化乡土茶文化',
    description:
      '记录在地茶会、校园茶实践、大众茶体验活动，以活动纪实、参与者访谈、现场图文，展现传统茶席适配现代生活的全新表达。',
    url: 'https://mp.weixin.qq.com/s/p3OzmonMFNpRQbQdnARd0w',
  },
  {
    id: 'shared-prosperity',
    label: '板块 4',
    title: '共富故事',
    subtitle: '茶产业共富工坊・青年助农纪实',
    description:
      '聚焦大学生实践团队、共富工坊运营、茶农增收真实案例，包含农户收入数据、项目成果报道、青年助农心路采访，讲透茶叶如何带动村民共同致富。',
    url: 'https://mp.weixin.qq.com/s/6pRxteeMdMc9gd6Y2sWR2w',
  },
];

export function MarketPage() {
  return (
    <>
      <Hero
        eyebrow="香途畅鸣｜产销助农"
        title="把春建茶香送到更远的地方"
        description="展示春建茶叶与文创产品，让品牌故事、茶文化内容和消费咨询入口形成完整的产销助农展示链路。"
        imageUrl={heroAssets.market}
        primaryLabel="浏览产品卡片"
        secondaryLabel="查看茶文化内容"
      />

      <section id="primary-section" className="section-shell py-16">
        <SectionHeader
          eyebrow="Product Showcase"
          title="茶叶与衍生产品展示"
          description="集中呈现产品图片、介绍、规格、标签和咨询入口，让春建茶香以更完整的品牌面貌触达消费者。"
        />
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {teaProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div id="market-action-placeholders" className="section-shell grid scroll-mt-24 gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-tea-ink/8 bg-white px-4 py-2 text-sm font-black text-tea-leaf shadow-sm">
              <span className="h-2 w-2 rounded-full bg-tea-gold" />
              Brand Story・春建乡共富茶品牌叙事
            </div>
            <h2 className="mt-6 text-4xl font-black tracking-tight text-tea-ink sm:text-5xl">一叶春茶，铺就乡村共富路</h2>
            <p className="mt-6 max-w-2xl text-lg font-semibold leading-9 text-tea-ink/74">
              以百年茶园底蕴、大学生助农实践、共富工坊运营、一线茶农真实故事四大主线，完整讲述春建乡茶产业从原生山野茶到特色乡村品牌的全过程，诠释茶产业带动乡村振兴的完整路径。
            </p>
            <div className="mt-10 rounded-[2rem] bg-tea-mist p-7 sm:p-9">
              <Quote className="h-10 w-10 text-tea-leaf" />
              <p className="mt-5 text-2xl font-black leading-relaxed text-tea-ink">
                一片茶叶串联起山野、茶农、青年与食客，以茶为媒介，让乡土价值、青年理想、共富愿景在此相遇共生。
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {brandStoryCards.map((item, index) => (
              <motion.a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.42, delay: index * 0.05 }}
                className="group flex min-h-[285px] flex-col rounded-[2rem] border border-tea-ink/8 bg-[#f7fbf3] p-6 transition hover:-translate-y-1 hover:border-tea-leaf/28 hover:bg-tea-mist hover:shadow-soft"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Sprout className="h-7 w-7 text-tea-leaf" />
                    <p className="mt-5 text-sm font-black text-tea-leaf">{item.label}｜{item.title}</p>
                  </div>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-tea-leaf shadow-sm transition group-hover:bg-tea-leaf group-hover:text-white">
                    <ArrowUpRight className="h-5 w-5" />
                  </span>
                </div>
                <h3 className="mt-4 text-2xl font-black leading-snug text-tea-ink">{item.subtitle}</h3>
                <p className="mt-4 flex-1 text-sm font-semibold leading-7 text-tea-ink/66">{item.description}</p>
                <div className="tea-footer mt-6 rounded-2xl px-4 py-3 text-sm font-black text-tea-leaf">点击阅读对应公众号图文</div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      <section id="resource-slots" className="section-shell py-16">
        <SectionHeader
          eyebrow="Tea Culture Media"
          title="视频与茶文化资源"
          description="以茶园影像、制茶工艺和茶文化图文内容增强产品记忆点。"
        />
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {mediaAssets.map((asset) => (
            <article key={asset.id} className="overflow-hidden rounded-3xl bg-white shadow-sm">
              <div className="asset-frame aspect-video">
                <img src={asset.coverUrl} alt={asset.title} className="h-full w-full object-cover" />
                <div className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-full bg-white/86 px-3 py-1 text-xs font-black text-tea-ink backdrop-blur">
                  {asset.type === 'video' ? <Film className="h-3.5 w-3.5" /> : <ImageIcon className="h-3.5 w-3.5" />}
                  {asset.type === 'video' ? '茶园视频' : '图文素材'}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-black text-tea-ink">{asset.title}</h3>
                <p className="mt-3 text-sm leading-6 text-tea-ink/64">{asset.description}</p>
                <div className="tea-footer mt-5 rounded-2xl px-4 py-3 text-sm font-bold text-tea-leaf">
                  {asset.type === 'video' ? '适合承载茶园航拍与制茶过程' : '适合承载品牌故事与茶文化传播'}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
