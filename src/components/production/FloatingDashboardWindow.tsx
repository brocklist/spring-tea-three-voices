import { Minus, X } from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';

export type DashboardPanelId = 'overview' | 'weather' | 'sensors' | 'zone' | 'leaf' | 'knowledge';

interface FloatingDashboardWindowProps {
  id: DashboardPanelId;
  title: string;
  eyebrow: string;
  icon: ComponentType<{ className?: string }>;
  position: 'left' | 'right' | 'right-large' | 'left-large';
  isOpen: boolean;
  minimized: boolean;
  onClose: () => void;
  onMinimize: () => void;
  children: ReactNode;
}

export function FloatingDashboardWindow({
  id,
  title,
  eyebrow,
  icon: Icon,
  position,
  isOpen,
  minimized,
  onClose,
  onMinimize,
  children,
}: FloatingDashboardWindowProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <section className={`twin-window twin-window--${position} ${minimized ? 'is-minimized' : ''}`} aria-label={title} data-panel={id}>
      <header className="twin-window__header">
        <div className="min-w-0 flex items-center gap-3">
          <span className="twin-window__icon"><Icon className="h-4 w-4" /></span>
          <div className="min-w-0">
            <p className="twin-window__eyebrow">{eyebrow}</p>
            <h2 className="truncate text-base font-black text-white">{title}</h2>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button type="button" onClick={onMinimize} className="twin-window__control" title={minimized ? `展开${title}` : `最小化${title}`} aria-label={minimized ? `展开${title}` : `最小化${title}`}>
            <Minus className="h-4 w-4" />
          </button>
          <button type="button" onClick={onClose} className="twin-window__control" title={`关闭${title}`} aria-label={`关闭${title}`}>
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>
      {!minimized ? <div className="twin-window__body">{children}</div> : null}
    </section>
  );
}
