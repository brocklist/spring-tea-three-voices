import { AnimatePresence, motion, useDragControls } from 'motion/react';
import { Minus, X } from 'lucide-react';
import type { ComponentType, PointerEvent, ReactNode } from 'react';

export type DashboardPanelId = 'overview' | 'weather' | 'sensors' | 'zone' | 'leaf' | 'knowledge';

export interface DashboardWindowPosition {
  x: number;
  y: number;
}

interface FloatingDashboardWindowProps {
  id: DashboardPanelId;
  title: string;
  eyebrow: string;
  icon: ComponentType<{ className?: string }>;
  isOpen: boolean;
  minimized: boolean;
  position: DashboardWindowPosition;
  zIndex: number;
  onClose: () => void;
  onMinimize: () => void;
  onFocus: () => void;
  onPositionChange: (position: DashboardWindowPosition) => void;
  children: ReactNode;
}

const edgeGap = 12;

export function FloatingDashboardWindow({
  id,
  title,
  eyebrow,
  icon: Icon,
  isOpen,
  minimized,
  position,
  zIndex,
  onClose,
  onMinimize,
  onFocus,
  onPositionChange,
  children,
}: FloatingDashboardWindowProps) {
  const dragControls = useDragControls();

  function startDragging(event: PointerEvent<HTMLElement>) {
    onFocus();
    dragControls.start(event);
  }

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.section
          className={`twin-window ${minimized ? 'is-minimized' : ''}`}
          aria-label={title}
          data-panel={id}
          style={{ zIndex }}
          initial={{ opacity: 0, scale: 0.94, y: position.y + 10, x: position.x }}
          animate={{ opacity: 1, scale: 1, x: position.x, y: position.y }}
          exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.16 } }}
          transition={{ type: 'spring', stiffness: 330, damping: 29, mass: 0.72 }}
          drag
          dragControls={dragControls}
          dragListener={false}
          dragMomentum={false}
          onPointerDown={onFocus}
          onDragEnd={(event, info) => {
            const windowElement = event.currentTarget as HTMLElement;
            const dashboard = windowElement.closest<HTMLElement>('.production-twin');
            const bounds = dashboard?.getBoundingClientRect();
            const rect = windowElement.getBoundingClientRect();
            const maxX = Math.max(edgeGap, (bounds?.width ?? window.innerWidth) - rect.width - edgeGap);
            const maxY = Math.max(edgeGap, (bounds?.height ?? window.innerHeight) - rect.height - edgeGap);

            onPositionChange({
              x: Math.min(maxX, Math.max(edgeGap, position.x + info.offset.x)),
              y: Math.min(maxY, Math.max(edgeGap, position.y + info.offset.y)),
            });
          }}
        >
          <header className="twin-window__header" onPointerDown={startDragging}>
            <div className="min-w-0 flex items-center gap-3">
              <span className="twin-window__icon"><Icon className="h-4 w-4" /></span>
              <div className="min-w-0">
                <p className="twin-window__eyebrow">{eyebrow}</p>
                <h2 className="truncate text-base font-black text-white">{title}</h2>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1" onPointerDown={(event) => event.stopPropagation()}>
              <button type="button" onClick={onMinimize} className="twin-window__control" title={minimized ? `展开${title}` : `最小化${title}`} aria-label={minimized ? `展开${title}` : `最小化${title}`}>
                <Minus className="h-4 w-4" />
              </button>
              <button type="button" onClick={onClose} className="twin-window__control" title={`关闭${title}`} aria-label={`关闭${title}`}>
                <X className="h-4 w-4" />
              </button>
            </div>
          </header>
          {!minimized ? <div className="twin-window__body">{children}</div> : null}
        </motion.section>
      ) : null}
    </AnimatePresence>
  );
}
