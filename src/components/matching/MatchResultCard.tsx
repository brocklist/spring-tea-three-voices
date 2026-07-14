import { Link2, MapPin, Sparkles } from 'lucide-react';
import type { MatchResult } from '../../types/domain';

interface MatchResultCardProps {
  result: MatchResult;
}

export function MatchResultCard({ result }: MatchResultCardProps) {
  return (
    <article className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-tea-spring/18 px-3 py-1 text-xs font-black text-tea-leaf">
            <Sparkles className="h-3.5 w-3.5" />
            匹配分 {result.score}
          </div>
          <h3 className="mt-4 text-xl font-black text-tea-ink">{result.project.projectName}</h3>
          <p className="mt-1 text-sm font-bold text-tea-ink/56">推荐茶园：{result.garden.gardenName}</p>
        </div>
        <div className="rounded-2xl bg-tea-mist px-4 py-3 text-sm font-bold text-tea-ink/64">
          <MapPin className="mr-1 inline h-4 w-4 text-tea-leaf" />
          {result.garden.location}
        </div>
      </div>
      <p className="mt-5 text-sm leading-6 text-tea-ink/68">{result.reason}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {result.matchedTags.map((tag) => (
          <span key={tag} className="rounded-full bg-tea-ink px-3 py-1 text-xs font-bold text-white">
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-5 grid gap-3 rounded-2xl bg-[#f7fbf3] p-4 text-sm leading-6 text-tea-ink/66 sm:grid-cols-2">
        <p>
          <Link2 className="mr-2 inline h-4 w-4 text-tea-leaf" />
          项目需求：{result.project.requiredResources}
        </p>
        <p>茶园资源：{result.garden.resources}</p>
      </div>
    </article>
  );
}
