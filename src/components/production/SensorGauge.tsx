import { ArrowDown, ArrowRight, ArrowUp } from 'lucide-react';
import type { CSSProperties } from 'react';
import type { SensorMetric } from '../../types/domain';

interface SensorGaugeProps {
  metric: SensorMetric;
  variant?: 'default' | 'dashboard';
}

function getPercent(metric: SensorMetric) {
  if (metric.id === 'soil-ph') {
    return (metric.value / 8) * 100;
  }

  if (metric.id === 'canopy-temp') {
    return (metric.value / 32) * 100;
  }

  if (metric.id === 'light') {
    return (metric.value / 900) * 100;
  }

  return Math.min(metric.value, 100);
}

export function SensorGauge({ metric, variant = 'default' }: SensorGaugeProps) {
  const percent = Math.max(0, Math.min(getPercent(metric), 100));
  const TrendIcon = metric.trend === 'up' ? ArrowUp : metric.trend === 'down' ? ArrowDown : ArrowRight;
  const unitLabel = metric.unit || (metric.id === 'soil-ph' ? 'pH' : '');

  if (variant === 'dashboard') {
    return (
      <article className="command-gauge">
        <h3>{metric.label}</h3>
        <div className="command-gauge__arc" style={{ '--gauge-value': `${percent}%` } as CSSProperties}>
          <div>
            <strong>{metric.value}</strong>
            <span>{unitLabel}</span>
          </div>
        </div>
        <p>适宜范围：{metric.range}</p>
        <span className="command-gauge__state"><TrendIcon className="h-3.5 w-3.5" /> 适宜</span>
      </article>
    );
  }

  return (
    <article className="rounded-2xl border border-white/10 bg-white/8 p-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:bg-white/12">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white/70">{metric.label}</h3>
        <TrendIcon className="h-4 w-4 text-tea-spring" />
      </div>
      <div className="mt-3 flex items-end gap-1">
        <span className="text-4xl font-black">{metric.value}</span>
        <span className="pb-1 text-sm font-bold text-white/58">{metric.unit}</span>
      </div>
      <div className="mt-5 h-2 rounded-full bg-white/12">
        <div className="h-2 rounded-full bg-gradient-to-r from-tea-sky via-tea-spring to-tea-gold" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-3 text-xs font-semibold text-white/54">适宜区间：{metric.range}</p>
    </article>
  );
}
