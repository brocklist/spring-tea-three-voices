import { Menu, Sprout, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/production', label: '数智茶鸣', subtitle: '智慧生产' },
  { to: '/market', label: '香途畅鸣', subtitle: '产销助农' },
  { to: '/matching', label: '新苗创鸣', subtitle: '校企双选' },
];

export function TopNav() {
  const [isOpen, setIsOpen] = useState(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      'rounded-full px-4 py-2 text-sm font-semibold transition',
      isActive ? 'bg-tea-ink text-white shadow-soft' : 'text-tea-ink/72 hover:bg-white hover:text-tea-ink',
    ].join(' ');

  return (
    <header className="sticky top-0 z-50 border-b border-white/60 bg-[#f7fbf3]/84 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <NavLink to="/production" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-tea-ink text-white shadow-soft">
            <Sprout className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-sm font-black tracking-[0.24em] text-tea-leaf">一页问茶</span>
            <span className="block text-xs font-semibold text-tea-ink/58">春声三鸣</span>
          </span>
        </NavLink>

        <nav className="hidden items-center rounded-full border border-white/70 bg-white/64 p-1 shadow-sm md:flex">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              <span>{item.label}</span>
              <span className="ml-2 text-xs font-medium opacity-70">{item.subtitle}</span>
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-tea-ink/10 bg-white text-tea-ink md:hidden"
          onClick={() => setIsOpen((value) => !value)}
          aria-label="切换导航"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isOpen ? (
        <nav className="mx-4 mb-4 grid gap-2 rounded-2xl border border-white/70 bg-white/88 p-3 shadow-soft md:hidden">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass} onClick={() => setIsOpen(false)}>
              {item.label}｜{item.subtitle}
            </NavLink>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
