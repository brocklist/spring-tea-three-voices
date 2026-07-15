import { Film, Image as ImageIcon, Quote, Sprout } from 'lucide-react';
import { motion } from 'motion/react';
import { ProductCard } from '../components/market/ProductCard';
import { Hero } from '../components/ui/Hero';
import { SectionHeader } from '../components/ui/SectionHeader';
import { heroAssets, mediaAssets, teaProducts } from '../data/mockData';

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

      <section id="primary-section" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Product Showcase" title="茶叶与衍生产品展示" description="集中呈现产品图片、介绍、规格、标签和咨询入口，让春建茶香以更完整的品牌面貌触达消费者。" />
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {teaProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div id="market-action-placeholders" className="mx-auto grid max-w-7xl scroll-mt-24 gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <SectionHeader eyebrow="Brand Story" title="春建乡茶品牌故事" description="以春建乡茶园历史、共富工坊、大学生实践和茶农故事串联产品价值与乡村振兴叙事。" />
            <div className="mt-8 rounded-3xl bg-tea-mist p-6">
              <Quote className="h-8 w-8 text-tea-leaf" />
              <p className="mt-4 text-xl font-black leading-9 text-tea-ink">从一片春茶到一个乡村品牌，让茶农、学生团队、消费者和合作方在同一条香途中相遇。</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {['茶园产地', '制茶工艺', '茶席文化', '共富故事'].map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.42, delay: index * 0.05 }}
                className="rounded-3xl border border-tea-ink/8 bg-[#f7fbf3] p-6"
              >
                <Sprout className="h-6 w-6 text-tea-leaf" />
                <h3 className="mt-5 text-xl font-black text-tea-ink">{item}</h3>
                <p className="mt-3 text-sm leading-6 text-tea-ink/62">用图文内容承接真实故事、采访节选、数据成果与活动报道。</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="resource-slots" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Tea Culture Media" title="视频与茶文化资源" description="以茶园影像、制茶工艺和茶文化图文内容增强产品记忆点。" />
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {mediaAssets.map((asset) => (
            <article key={asset.id} className="overflow-hidden rounded-3xl bg-white shadow-sm">
              <div className="asset-frame aspect-video">
                <img src={asset.coverUrl} alt={asset.title} className="h-full w-full object-cover" />
                <div className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-full bg-white/86 px-3 py-1 text-xs font-black text-tea-ink backdrop-blur">
                  {asset.type === 'video' ? <Film className="h-3.5 w-3.5" /> : <ImageIcon className="h-3.5 w-3.5" />}
                  {asset.type === 'video' ? 'Video URL' : 'Image URL'}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-black text-tea-ink">{asset.title}</h3>
                <p className="mt-3 text-sm leading-6 text-tea-ink/64">{asset.description}</p>
                <code className="mt-4 block truncate rounded-xl bg-tea-mist px-3 py-2 text-xs font-semibold text-tea-ink/58">{asset.url}</code>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
