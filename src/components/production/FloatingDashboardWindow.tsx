import { AnimatePresence, motion, useDragControls, useMotionValue } from 'motion/react';
import { Minus, X } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState, type ComponentType, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';

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

function clampPosition(position: DashboardWindowPosition, element: HTMLElement | null) {
  const dashboard = element?.closest<HTMLElement>('.production-twin');
  const bounds = dashboard?.getBoundingClientRect();
  const rect = element?.getBoundingClientRect();
  const maxX = Math.max(edgeGap, (bounds?.width ?? window.innerWidth) - (rect?.width ?? 0) - edgeGap);
  const maxY = Math.max(edgeGap, (bounds?.height ?? window.innerHeight) - (rect?.height ?? 0) - edgeGap);

  return {
    x: Math.min(maxX, Math.max(edgeGap, position.x)),
    y: Math.min(maxY, Math.max(edgeGap, position.y)),
  };
}

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
  const elementRef = useRef<HTMLElement>(null);
  const x = useMotionValue(position.x);
  const y = useMotionValue(position.y);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!isDragging) {
      x.set(position.x);
      y.set(position.y);
    }
  }, [isDragging, position.x, position.y, x, y]);

  useLayoutEffect(() => {
    if (!isOpen || !elementRef.current) {
      return undefined;
    }

    const syncPosition = () => {
      const next = clampPosition({ x: x.get(), y: y.get() }, elementRef.current);
      x.set(next.x);
      y.set(next.y);
      if (next.x !== position.x || next.y !== position.y) {
        onPositionChange(next);
      }
    };

    const dashboard = elementRef.current.closest<HTMLElement>('.production-twin');
    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(syncPosition);
    if (dashboard) {
      observer?.observe(dashboard);
    }
    observer?.observe(elementRef.current);
    window.addEventListener('resize', syncPosition);
    syncPosition();

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', syncPosition);
    };
  }, [isOpen, minimized, onPositionChange, position.x, position.y, x, y]);

  function moveBy(xOffset: number, yOffset: number) {
    const next = clampPosition({ x: x.get() + xOffset, y: y.get() + yOffset }, elementRef.current);
    x.set(next.x);
    y.set(next.y);
    onPositionChange(next);
  }

  function startDragging(event: PointerEvent<HTMLElement>) {
    dragControls.start(event);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    const step = event.shiftKey ? 40 : 12;
    const movements: Record<string, [number, number]> = {
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
    };
    const movement = movements[event.key];
    if (!movement) {
      return;
    }

    event.preventDefault();
    onFocus();
    moveBy(...movement);
  }

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.section
          ref={elementRef}
          className={`twin-window ${minimized ? 'is-minimized' : ''} ${isDragging ? 'is-dragging' : ''}`}
          aria-label={title}
          data-panel={id}
          style={{ x, y, zIndex }}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.14 } }}
          transition={{ opacity: { duration: 0.16 }, scale: { type: 'spring', stiffness: 360, damping: 28 } }}
          drag
          dragControls={dragControls}
          dragListener={false}
          dragElastic={0}
          dragMomentum={false}
          onPointerDown={onFocus}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => {
            setIsDragging(false);
            const next = clampPosition({ x: x.get(), y: y.get() }, elementRef.current);
            x.set(next.x);
            y.set(next.y);
            onPositionChange(next);
          }}
        >
          <header className="twin-window__header" tabIndex={0} onPointerDown={startDragging} onKeyDown={handleKeyDown} aria-label={`Move ${title} window`}>
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
