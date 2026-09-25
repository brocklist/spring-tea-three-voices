import { MapPin, Search } from 'lucide-react';
import { FormEvent, useState } from 'react';
import {
  formatLocationName,
  presetWeatherLocations,
  searchWeatherLocations,
  type WeatherLocation,
} from '../../lib/weather';

interface WeatherLocationSelectorProps {
  location: WeatherLocation;
  loading?: boolean;
  error?: string;
  compact?: boolean;
  onChange: (location: WeatherLocation) => void;
}

export function WeatherLocationSelector({ location, loading = false, error, compact = false, onChange }: WeatherLocationSelectorProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<WeatherLocation[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string>();
  const [isExpanded, setIsExpanded] = useState(!compact);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearching(true);
    setSearchError(undefined);

    try {
      const locations = await searchWeatherLocations(query);
      setResults(locations);
      if (locations.length === 0) {
        setSearchError('没有找到地点，请换个名称试试');
      }
    } catch {
      setSearchError('地点搜索失败，请稍后再试');
    } finally {
      setSearching(false);
    }
  }

  function chooseLocation(nextLocation: WeatherLocation) {
    onChange(nextLocation);
    setResults([]);
    setQuery('');
    setSearchError(undefined);
    if (compact) {
      setIsExpanded(false);
    }
  }

  return (
    <div className="tea-card rounded-[1.75rem] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-tea-mist px-3 py-1 text-xs font-black text-tea-leaf">
            <MapPin className="h-3.5 w-3.5" />
            天气地点
          </div>
          <p className="mt-3 text-2xl font-black text-tea-ink">{formatLocationName(location)}</p>
          <p className="mt-1 text-sm font-semibold text-tea-ink/58">{loading ? '正在更新实时天气' : error ? '天气获取失败' : '实时天气已更新'}</p>
        </div>
        {compact ? (
          <button
            type="button"
            onClick={() => setIsExpanded((value) => !value)}
            aria-expanded={isExpanded}
            className="rounded-xl border border-tea-leaf/20 bg-white/80 px-3 py-2 text-xs font-black text-tea-leaf transition hover:bg-tea-mist"
          >
            {isExpanded ? '收起地点' : '切换地点'}
          </button>
        ) : null}
      </div>

      {isExpanded ? <>
      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3 sm:flex-row">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="搜索天气地点"
          placeholder="输入地点，如 富阳、杭州、春建乡"
          className="min-h-12 flex-1 rounded-2xl border border-tea-ink/10 bg-[#f7fbf3] px-4 text-base font-semibold outline-none transition focus:border-tea-leaf focus:bg-white"
        />
        <button
          type="submit"
          disabled={searching || !query.trim()}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-tea-ink px-5 text-base font-black text-white transition hover:bg-tea-leaf disabled:cursor-not-allowed disabled:bg-tea-ink/30"
        >
          <Search className="h-4 w-4" />
          {searching ? '搜索中' : '搜索'}
        </button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        {presetWeatherLocations.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => chooseLocation(item)}
            className="rounded-full bg-tea-mist px-4 py-2 text-sm font-black text-tea-ink/70 transition hover:bg-tea-spring/24"
          >
            {item.name}
          </button>
        ))}
      </div>

      {results.length > 0 ? (
        <div className="mt-4 grid gap-2">
          {results.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => chooseLocation(item)}
              className="tea-footer rounded-2xl px-4 py-3 text-left transition hover:bg-tea-mist"
            >
              <span className="block text-base font-black text-tea-ink">{item.name}</span>
              <span className="mt-1 block text-sm font-semibold text-tea-ink/58">
                {[item.admin, item.country].filter(Boolean).join(' · ')}
              </span>
            </button>
          ))}
        </div>
      ) : null}

      </> : null}

      {searchError || error ? <p className="mt-3 text-sm font-bold text-tea-clay">{searchError ?? error}</p> : null}
      <p className="mt-4 text-xs font-semibold text-tea-ink/42">
        天气数据由{' '}
        <a className="font-bold text-tea-leaf underline-offset-4 hover:underline" href="https://open-meteo.com/" target="_blank" rel="noreferrer">
          Open-Meteo
        </a>{' '}
        提供
      </p>
    </div>
  );
}
