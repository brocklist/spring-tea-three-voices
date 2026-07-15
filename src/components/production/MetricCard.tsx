import { Activity, CloudSun, Droplets, ThermometerSun, Wind } from 'lucide-react';
import type { WeatherMetric } from '../../types/domain';

const iconMap = {
  weather: CloudSun,
  temperature: ThermometerSun,
  humidity: Droplets,
  rain: Droplets,
  wind: Wind,
};

interface MetricCardProps {
  metric: WeatherMetric;
}

export function MetricCard({ metric }: MetricCardProps) {
  const Icon = iconMap[metric.id as keyof typeof iconMap] ?? Activity;

  return (
    <article className="tea-card h-full rounded-2xl p-5 transition hover:-translate-y-1 hover:shadow-soft">
      <div className="flex items-center justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-tea-mist text-tea-leaf shadow-sm">
          <Icon className="h-5 w-5" />
        </div>
        <span className="rounded-full bg-tea-spring/18 px-3 py-1 text-xs font-bold text-tea-leaf">{metric.updatedAt}</span>
      </div>
      <h3 className="mt-5 text-sm font-bold text-tea-ink/58">{metric.label}</h3>
      <div className="mt-2 flex items-end gap-1">
        <span className="text-3xl font-black text-tea-ink">{metric.value}</span>
        {metric.unit ? <span className="pb-1 text-sm font-bold text-tea-ink/56">{metric.unit}</span> : null}
      </div>
      <p className="mt-3 text-sm leading-6 text-tea-ink/66">{metric.status}</p>
    </article>
  );
}
