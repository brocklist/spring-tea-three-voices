import type { WeatherMetric } from '../types/domain';

export interface WeatherLocation {
  id: string;
  name: string;
  admin?: string;
  country?: string;
  latitude: number;
  longitude: number;
}

interface GeocodingResponse {
  results?: Array<{
    id: number;
    name: string;
    admin1?: string;
    admin2?: string;
    country?: string;
    latitude: number;
    longitude: number;
  }>;
}

interface ForecastResponse {
  current?: {
    time: string;
    temperature_2m?: number;
    relative_humidity_2m?: number;
    precipitation?: number;
    rain?: number;
    weather_code?: number;
    wind_speed_10m?: number;
  };
  hourly?: {
    time?: string[];
    temperature_2m?: number[];
    relative_humidity_2m?: number[];
    precipitation_probability?: number[];
    wind_speed_10m?: number[];
  };
}

export interface WeatherForecastPoint {
  time: string;
  temperature: number;
  humidity: number;
  rainProbability: number;
  wind: number;
}

export interface WeatherDashboardData {
  metrics: WeatherMetric[];
  forecast: WeatherForecastPoint[];
}

export const defaultWeatherLocation: WeatherLocation = {
  id: 'chunjian-fuyang',
  name: '春建乡',
  admin: '杭州市富阳区',
  country: '中国',
  latitude: 30.06,
  longitude: 119.82,
};

export const presetWeatherLocations: WeatherLocation[] = [
  defaultWeatherLocation,
  { id: 'fuyang', name: '富阳区', admin: '杭州市', country: '中国', latitude: 30.05, longitude: 119.95 },
  { id: 'hangzhou', name: '杭州市', admin: '浙江省', country: '中国', latitude: 30.29, longitude: 120.16 },
];

export async function searchWeatherLocations(query: string): Promise<WeatherLocation[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  const localMatches = presetWeatherLocations.filter((location) =>
    [location.name, location.admin, location.country].filter(Boolean).some((value) => value?.includes(trimmed) || trimmed.includes(location.name)),
  );

  const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
  url.searchParams.set('name', trimmed);
  url.searchParams.set('count', '6');
  url.searchParams.set('language', 'zh');
  url.searchParams.set('format', 'json');

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('地点搜索失败');
  }

  const data = (await response.json()) as GeocodingResponse;
  const remoteMatches =
    data.results?.map((item) => ({
      id: String(item.id),
      name: item.name,
      admin: [item.admin2, item.admin1].filter(Boolean).join(' · '),
      country: item.country,
      latitude: item.latitude,
      longitude: item.longitude,
    })) ?? [];

  const deduped = new Map<string, WeatherLocation>();
  [...localMatches, ...remoteMatches].forEach((location) => {
    deduped.set(`${location.name}-${location.latitude}-${location.longitude}`, location);
  });

  return [...deduped.values()];
}

export async function fetchWeatherMetrics(location: WeatherLocation): Promise<WeatherMetric[]> {
  const dashboard = await fetchWeatherDashboard(location);
  return dashboard.metrics;
}

export async function fetchWeatherDashboard(location: WeatherLocation): Promise<WeatherDashboardData> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(location.latitude));
  url.searchParams.set('longitude', String(location.longitude));
  url.searchParams.set(
    'current',
    ['temperature_2m', 'relative_humidity_2m', 'precipitation', 'rain', 'weather_code', 'wind_speed_10m'].join(','),
  );
  url.searchParams.set(
    'hourly',
    ['temperature_2m', 'relative_humidity_2m', 'precipitation_probability', 'wind_speed_10m'].join(','),
  );
  url.searchParams.set('forecast_days', '2');
  url.searchParams.set('timezone', 'auto');

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('天气获取失败');
  }

  const data = (await response.json()) as ForecastResponse;
  if (!data.current) {
    throw new Error('天气数据为空');
  }

  const current = data.current;
  const updatedAt = formatWeatherTime(current.time);
  const precipitation = current.precipitation ?? current.rain ?? 0;
  const wind = current.wind_speed_10m ?? 0;
  const humidity = current.relative_humidity_2m ?? 0;
  const temperature = current.temperature_2m ?? 0;

  const metrics: WeatherMetric[] = [
    {
      id: 'weather',
      label: '当前天气',
      value: weatherCodeToText(current.weather_code),
      status: buildWeatherStatus(current.weather_code, precipitation),
      updatedAt,
    },
    {
      id: 'temperature',
      label: '环境温度',
      value: temperature.toFixed(1),
      unit: '°C',
      status: buildTemperatureStatus(temperature),
      updatedAt,
    },
    {
      id: 'humidity',
      label: '空气湿度',
      value: Math.round(humidity).toString(),
      unit: '%',
      status: buildHumidityStatus(humidity),
      updatedAt,
    },
    {
      id: 'rain',
      label: '实时降水',
      value: precipitation.toFixed(1),
      unit: 'mm',
      status: precipitation > 0 ? '注意茶园排水与叶面湿度' : '降水较少，适合巡园',
      updatedAt,
    },
    {
      id: 'wind',
      label: '风速',
      value: wind.toFixed(1),
      unit: 'km/h',
      status: wind >= 28 ? '风力偏强，户外作业需谨慎' : '风力平稳，适合户外作业',
      updatedAt,
    },
  ];

  const hourly = data.hourly;
  const hourlyTimes = hourly?.time ?? [];
  const currentTimestamp = new Date(current.time).getTime();
  const startIndex = Math.max(0, hourlyTimes.findIndex((time) => new Date(time).getTime() >= currentTimestamp));
  const forecast = hourlyTimes.slice(startIndex, startIndex + 6).map((time, offset) => {
    const index = startIndex + offset;
    return {
      time: formatWeatherTime(time),
      temperature: hourly?.temperature_2m?.[index] ?? temperature,
      humidity: hourly?.relative_humidity_2m?.[index] ?? humidity,
      rainProbability: hourly?.precipitation_probability?.[index] ?? 0,
      wind: hourly?.wind_speed_10m?.[index] ?? wind,
    };
  });

  return { metrics, forecast };
}

export function formatLocationName(location: WeatherLocation) {
  return [location.name, location.admin].filter(Boolean).join(' · ');
}

function formatWeatherTime(time: string) {
  const date = new Date(time);
  if (Number.isNaN(date.getTime())) {
    return time.slice(11, 16) || '刚刚';
  }

  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function weatherCodeToText(code?: number) {
  if (code === undefined) {
    return '天气更新中';
  }

  if (code === 0) return '晴';
  if ([1, 2].includes(code)) return '少云';
  if (code === 3) return '多云';
  if ([45, 48].includes(code)) return '有雾';
  if ([51, 53, 55, 56, 57].includes(code)) return '毛毛雨';
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return '降雨';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return '降雪';
  if ([95, 96, 99].includes(code)) return '雷雨';
  return '天气变化';
}

function buildWeatherStatus(code: number | undefined, precipitation: number) {
  if (precipitation > 0) {
    return '有降水，注意排湿防病';
  }

  if (code !== undefined && [0, 1, 2].includes(code)) {
    return '天气较好，适合采摘巡园';
  }

  return '天气平稳，注意观察叶面';
}

function buildTemperatureStatus(temperature: number) {
  if (temperature < 8) return '温度偏低，注意防寒';
  if (temperature > 30) return '温度偏高，注意遮阴保水';
  return '温度适宜茶树生长';
}

function buildHumidityStatus(humidity: number) {
  if (humidity >= 85) return '湿度较高，注意通风排湿';
  if (humidity <= 45) return '湿度偏低，关注土壤水分';
  return '湿度适中，适合巡园';
}
