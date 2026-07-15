import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface HeroProps {
  eyebrow: string;
  title: string;
  description: string;
  imageUrl: string;
  primaryLabel: string;
  secondaryLabel: string;
}

export function Hero({ eyebrow, title, description, imageUrl, primaryLabel, secondaryLabel }: HeroProps) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img src={imageUrl} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-tea-ink/88 via-tea-ink/58 to-tea-leaf/36" />
      </div>
      <div className="relative mx-auto grid min-h-[560px] max-w-7xl items-end gap-8 px-4 pb-16 pt-24 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-tea-spring" />
            {eyebrow}
          </div>
          <h1 className="max-w-4xl text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">{title}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/78">{description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#primary-section" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-tea-ink transition hover:bg-tea-mist">
              {primaryLabel}
              <ArrowRight className="h-4 w-4" />
            </a>
            <a href="#resource-slots" className="inline-flex items-center gap-2 rounded-full border border-white/24 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/16">
              {secondaryLabel}
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="glass-panel rounded-3xl p-5"
        >
          <div className="grid grid-cols-3 gap-3 text-center">
            {['智慧监测', '茶品传播', '校企共创'].map((item, index) => (
              <div key={item} className="rounded-2xl border border-white/50 bg-white/78 p-4">
                <div className="text-2xl font-black text-tea-leaf">0{index + 1}</div>
                <div className="mt-1 text-xs font-bold text-tea-ink/64">{item}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
