import { HeartHandshake, Menu, Sprout, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const navItems = [
  { to: '/production', label: '数智茶鸣', subtitle: '智慧生产' },
  { to: '/market', label: '香途畅鸣', subtitle: '产销助农' },
  { to: '/matching', label: '新苗创鸣', subtitle: '校企双选' },
];

interface TopNavProps {
  careMode: boolean;
  onCareModeChange: (enabled: boolean) => void;
}

export function TopNav({ careMode, onCareModeChange }: TopNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { pathname } = useLocation();
  const isProductionDashboard = pathname === '/production' && !careMode;

  const visibleNavItems = careMode ? navItems.slice(0, 1) : navItems;

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      'rounded-full px-4 py-2 text-sm font-semibold transition',
      isProductionDashboard
        ? isActive
          ? 'bg-tea-spring/22 text-white shadow-[0_0_24px_rgba(52,211,153,0.16)]'
          : 'text-white/66 hover:bg-white/10 hover:text-white'
        : isActive
          ? 'bg-tea-ink text-white shadow-soft'
          : 'text-tea-ink/72 hover:bg-white hover:text-tea-ink',
      careMode ? 'text-lg' : '',
    ].join(' ');

  return (
    <header
      className={[
        'sticky top-0 z-50 backdrop-blur-xl',
        isProductionDashboard ? 'border-b border-emerald-200/10 bg-[#061510]/92' : 'border-b border-white/60 bg-[#f7fbf3]/84',
      ].join(' ')}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <NavLink to="/production" className="flex min-w-0 items-center gap-3">
            <span className={['flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-soft', isProductionDashboard ? 'bg-emerald-400/18 text-emerald-200' : 'bg-tea-ink'].join(' ')}>
              <Sprout className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className={['block truncate text-sm font-black tracking-[0.24em]', isProductionDashboard ? 'text-white' : 'text-tea-leaf'].join(' ')}>一页问茶</span>
              <span className={['block text-xs font-semibold', isProductionDashboard ? 'text-white/50' : 'text-tea-ink/58'].join(' ')}>春声三鸣</span>
            </span>
          </NavLink>

          <button
            type="button"
            aria-pressed={careMode}
            onClick={() => onCareModeChange(!careMode)}
            className={[
              'inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-sm font-black transition',
              careMode
                ? 'border-tea-leaf bg-tea-leaf text-white shadow-soft'
                : isProductionDashboard
                  ? 'border-emerald-200/16 bg-white/6 text-emerald-100 hover:bg-white/12'
                  : 'border-tea-leaf/20 bg-white/80 text-tea-leaf hover:bg-tea-mist',
            ].join(' ')}
          >
            <HeartHandshake className="h-4 w-4" />
            <span className="hidden sm:inline">{careMode ? '关怀模式开' : '老年关怀'}</span>
            <span className="sm:hidden">关怀</span>
          </button>
        </div>

        <nav className={['hidden items-center rounded-full border p-1 md:flex', isProductionDashboard ? 'border-white/10 bg-white/5' : 'border-white/70 bg-white/64 shadow-sm'].join(' ')}>
          {visibleNavItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              <span>{item.label}</span>
              <span className="ml-2 text-xs font-medium opacity-70">{item.subtitle}</span>
            </NavLink>
          ))}
        </nav>

        {!careMode ? (
          <button
            type="button"
            className={['inline-flex h-10 w-10 items-center justify-center rounded-xl border md:hidden', isProductionDashboard ? 'border-white/12 bg-white/8 text-white' : 'border-tea-ink/10 bg-white text-tea-ink'].join(' ')}
            onClick={() => setIsOpen((value) => !value)}
            aria-label="切换导航"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        ) : (
          <div className="hidden h-10 w-10 md:block" />
        )}
      </div>

      {isOpen && !careMode ? (
        <nav className={['mx-4 mb-4 grid gap-2 rounded-2xl border p-3 md:hidden', isProductionDashboard ? 'border-white/10 bg-[#0a2119]/96 shadow-[0_20px_48px_rgba(0,0,0,0.32)]' : 'border-white/70 bg-white/88 shadow-soft'].join(' ')}>
          {visibleNavItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass} onClick={() => setIsOpen(false)}>
              {item.label}｜{item.subtitle}
            </NavLink>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
