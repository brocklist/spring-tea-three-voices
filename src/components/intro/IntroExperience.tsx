import { ArrowDown, ChevronDown } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { IntroStage } from './IntroParticleScene';

const IntroParticleScene = lazy(() =>
  import('./IntroParticleScene').then(({ IntroParticleScene: Scene }) => ({ default: Scene })),
);

const stageCopy: Record<Exclude<IntroStage, 'loading' | 'exiting' | 'complete'>, { index: string; title: string; description: string }> = {
  leaf: { index: '01', title: '一叶初生', description: '山野的风、春日的水，在一片茶叶中相遇。' },
  mountain: { index: '02', title: '山野成形', description: '一片叶连接茶山，也连接春建乡的产业脉络。' },
  ready: { index: '03', title: '数智茶鸣', description: '走入茶园数字孪生世界，看见一叶茶背后的实时生长。' },
};

const INTRO_DURATION = 9;
const LEAF_READY_AT = 4;
const MOUNTAIN_START_AT = 5.2;
const READY_AT = 8;
const EXIT_ACCELERATION_MS = 900;

function stageForElapsed(elapsed: number): IntroStage {
  if (elapsed < 0.8) return 'loading';
  if (elapsed < MOUNTAIN_START_AT) return 'leaf';
  if (elapsed < READY_AT) return 'mountain';
  return 'ready';
}

export function IntroExperience() {
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const [elapsed, setElapsed] = useState(reducedMotion ? INTRO_DURATION : 0);
  const [assetsReady, setAssetsReady] = useState(Boolean(reducedMotion));
  const [fallback, setFallback] = useState(Boolean(reducedMotion));
  const [stage, setStage] = useState<IntroStage>(reducedMotion ? 'ready' : 'loading');
  const [mountainEnabled, setMountainEnabled] = useState(Boolean(reducedMotion));
  const [exiting, setExiting] = useState(false);
  const animationFrame = useRef<number>();
  const startedAt = useRef<number>();
  const acceleratedAt = useRef<number>();
  const acceleratedFrom = useRef(0);
  const productionPreloaded = useRef(false);
  const elapsedRef = useRef(elapsed);
  const exitStarted = useRef(false);
  const exitTimeout = useRef<number>();

  const preloadProduction = useCallback(() => {
    if (productionPreloaded.current) return;
    productionPreloaded.current = true;
    void import('../production/ThreeTeaGardenScene');
    const mapImage = new Image();
    mapImage.src = '/assets/production/chunjian-digital-twin-map-v2.png';
  }, []);

  const handleSceneReady = useCallback(() => setAssetsReady(true), []);
  const handleSceneFailure = useCallback(() => {
    setFallback(true);
    setAssetsReady(true);
    setElapsed(INTRO_DURATION);
    setStage('ready');
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
      if (exitTimeout.current) window.clearTimeout(exitTimeout.current);
    };
  }, []);

  useEffect(() => {
    if (reducedMotion || fallback || !assetsReady) return;
    function tick(now: number) {
      startedAt.current ??= now;
      let nextElapsed = (now - startedAt.current) / 1000;
      if (acceleratedAt.current) {
        const acceleration = Math.min(1, (now - acceleratedAt.current) / EXIT_ACCELERATION_MS);
        nextElapsed = acceleratedFrom.current + (INTRO_DURATION - acceleratedFrom.current) * (1 - ((1 - acceleration) ** 3));
      }
      const elapsedLimit = mountainEnabled || acceleratedAt.current ? INTRO_DURATION : MOUNTAIN_START_AT;
      const limitedElapsed = Math.min(elapsedLimit, nextElapsed);
      setElapsed(limitedElapsed);
      elapsedRef.current = limitedElapsed;
      if (limitedElapsed < elapsedLimit && !exiting) animationFrame.current = requestAnimationFrame(tick);
    }
    animationFrame.current = requestAnimationFrame(tick);
    return () => {
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
    };
  }, [assetsReady, exiting, fallback, mountainEnabled, reducedMotion]);

  useEffect(() => {
    elapsedRef.current = elapsed;
    if (!exiting) {
      setStage(!mountainEnabled && elapsed >= LEAF_READY_AT ? 'leaf' : stageForElapsed(elapsed));
    }
    if (elapsed >= 7.2) preloadProduction();
  }, [elapsed, exiting, mountainEnabled, preloadProduction]);

  const beginExit = useCallback((immediate = false) => {
    if (exitStarted.current) return;
    const currentElapsed = elapsedRef.current;
    if (!immediate && currentElapsed < READY_AT && !reducedMotion) {
      if (acceleratedAt.current) return;
      acceleratedAt.current = performance.now();
      acceleratedFrom.current = currentElapsed;
      return;
    }
    exitStarted.current = true;
    setStage('exiting');
    setExiting(true);
    preloadProduction();
    exitTimeout.current = window.setTimeout(() => {
      navigate('/production', { replace: true, state: { fromIntro: true } });
    }, reducedMotion ? 100 : 620);
  }, [navigate, preloadProduction, reducedMotion]);

  useEffect(() => {
    if (acceleratedAt.current && elapsed >= INTRO_DURATION - 0.02 && !exiting) beginExit(true);
  }, [beginExit, elapsed, exiting]);

  useEffect(() => {
    function onWheel(event: WheelEvent) {
      if (event.deltaY > 12 && stage === 'ready') beginExit(true);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (['Enter', ' ', 'ArrowDown', 'PageDown'].includes(event.key)) {
        event.preventDefault();
        if (stage === 'ready') beginExit(true);
      }
    }
    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [beginExit, stage]);

  const handlePrimaryAction = useCallback(() => {
    if (stage === 'leaf' && elapsedRef.current >= LEAF_READY_AT && !mountainEnabled) {
      startedAt.current = performance.now() - elapsedRef.current * 1000;
      setMountainEnabled(true);
      return;
    }

    if (stage === 'ready') beginExit(true);
  }, [beginExit, mountainEnabled, stage]);

  const visibleStage = stage === 'loading' || stage === 'exiting' || stage === 'complete' ? undefined : stageCopy[stage];
  const progress = Math.min(100, Math.max(0, (elapsed / INTRO_DURATION) * 100));
  const primaryLabel = stage === 'ready'
    ? '进入数智茶鸣'
    : stage === 'mountain'
      ? '山野成形中'
      : stage === 'leaf' && elapsed >= LEAF_READY_AT
        ? '显现春山'
        : '正在汇聚';
  const primaryDisabled = stage === 'loading' || stage === 'mountain' || (stage === 'leaf' && elapsed < LEAF_READY_AT);

  return (
    <main className={`intro-experience${exiting ? ' is-exiting' : ''}${fallback ? ' is-fallback' : ''}`} aria-label="一叶问茶首焦动画">
      <div className="intro-experience__visual" aria-hidden="true">
        {fallback ? <img src="/assets/intro/intro-fallback.png" alt="" /> : null}
        <Suspense fallback={null}>
          {!fallback ? (
            <IntroParticleScene
              elapsed={elapsed}
              exiting={exiting}
              reducedMotion={Boolean(reducedMotion)}
              onReady={handleSceneReady}
              onFailure={handleSceneFailure}
            />
          ) : null}
        </Suspense>
      </div>
      <div className="intro-experience__vignette" aria-hidden="true" />
      <div className="intro-experience__grain" aria-hidden="true" />

      <header className="intro-experience__header">
        <motion.div
          layoutId="tea-brand-title"
          className="brand-title brand-title--intro"
        >
          <span>一叶问茶<span className="brand-title__dot">·</span>春声三鸣</span><i aria-hidden="true">春建</i>
        </motion.div>
        <button type="button" className="intro-experience__skip" onClick={() => beginExit(elapsedRef.current >= READY_AT)}>
          跳过动画
          <ArrowDown className="h-4 w-4" />
        </button>
      </header>

      <section className="intro-experience__copy" aria-live="polite">
        {visibleStage ? (
          <motion.div
            key={visibleStage.index}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <span>{visibleStage.index}</span>
            <h1>{visibleStage.title}</h1>
            <p>{visibleStage.description}</p>
          </motion.div>
        ) : (
          <div className="intro-experience__loading"><i />{assetsReady ? '正在进入茶园' : '正在唤醒春山'}</div>
        )}
      </section>

      <footer className="intro-experience__footer">
        <div className="intro-experience__progress" aria-hidden="true"><i style={{ width: `${progress}%` }} /></div>
        <button type="button" onClick={handlePrimaryAction} disabled={primaryDisabled} className={stage === 'ready' ? 'is-ready' : ''}>
          <ChevronDown className="h-5 w-5" />
          <span>{primaryLabel}</span>
        </button>
      </footer>
    </main>
  );
}
