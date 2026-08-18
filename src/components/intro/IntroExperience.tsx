import { ArrowDown, ChevronDown } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type EngineStage = 'loading' | 'leaf' | 'mountain' | 'ready' | 'exiting';
type EngineEvent = {
  channel?: string;
  type?: string;
  stage?: EngineStage;
  progress?: number;
};

const stageCopy: Record<Exclude<EngineStage, 'loading' | 'exiting'>, { index: string; title: string; description: string }> = {
  leaf: { index: '01', title: '一叶初生', description: '山野的风、春日的水，在一片茶叶中相遇。' },
  mountain: { index: '02', title: '山野成形', description: '一片叶连接茶山，也连接春建乡的产业脉络。' },
  ready: { index: '03', title: '数智茶鸣', description: '走入茶园数字孪生世界，看见一叶茶背后的实时生长。' },
};

export function IntroExperience() {
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const engineFrame = useRef<HTMLIFrameElement>(null);
  const exitStarted = useRef(false);
  const exitTimeout = useRef<number>();
  const productionPreloaded = useRef(false);
  const [engineReady, setEngineReady] = useState(Boolean(reducedMotion));
  const [stage, setStage] = useState<EngineStage>(reducedMotion ? 'ready' : 'loading');
  const [progress, setProgress] = useState(reducedMotion ? 1 : 0);
  const [leafReady, setLeafReady] = useState(Boolean(reducedMotion));
  const [engineFailed, setEngineFailed] = useState(Boolean(reducedMotion));
  const [exiting, setExiting] = useState(false);
  const engineUrl = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('vj')
    ? '/generative-engine/index.html?vj=1'
    : '/generative-engine/index.html';

  const preloadProduction = useCallback(() => {
    if (productionPreloaded.current) return;
    productionPreloaded.current = true;
    void import('../production/ThreeTeaGardenScene');
    const mapImage = new Image();
    mapImage.src = '/assets/production/chunjian-digital-twin-map-v2.png';
  }, []);

  const sendToEngine = useCallback((type: string, payload: Record<string, unknown> = {}) => {
    engineFrame.current?.contentWindow?.postMessage({
      channel: 'tea-generative-engine',
      type,
      ...payload,
    }, window.location.origin);
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onMessage(event: MessageEvent<EngineEvent>) {
      if (
        event.origin !== window.location.origin
        || event.source !== engineFrame.current?.contentWindow
        || event.data?.channel !== 'tea-generative-engine'
      ) return;

      const { type, stage: nextStage, progress: nextProgress } = event.data;
      if (type === 'ENGINE_READY') setEngineReady(true);
      if (type === 'STAGE_CHANGE' && nextStage) setStage(nextStage);
      if (type === 'PROGRESS' && typeof nextProgress === 'number') setProgress(nextProgress);
      if (type === 'LEAF_READY') setLeafReady(true);
      if (type === 'ENGINE_ERROR') {
        setEngineFailed(true);
        setStage('ready');
        setProgress(1);
      }
    }

    window.addEventListener('message', onMessage);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('message', onMessage);
      if (exitTimeout.current) window.clearTimeout(exitTimeout.current);
      sendToEngine('PAUSE');
    };
  }, [sendToEngine]);

  useEffect(() => {
    if (reducedMotion || engineReady || engineFailed) return;
    const startupTimeout = window.setTimeout(() => {
      setEngineFailed(true);
      setStage('ready');
      setProgress(1);
    }, 12_000);
    return () => window.clearTimeout(startupTimeout);
  }, [engineFailed, engineReady, reducedMotion]);

  const beginExit = useCallback(() => {
    if (exitStarted.current) return;
    exitStarted.current = true;
    setStage('exiting');
    setExiting(true);
    sendToEngine('PAUSE');
    preloadProduction();
    exitTimeout.current = window.setTimeout(() => {
      navigate('/production', { replace: true, state: { fromIntro: true } });
    }, reducedMotion ? 100 : 620);
  }, [navigate, preloadProduction, reducedMotion, sendToEngine]);

  const handlePrimaryAction = useCallback(() => {
    if (stage === 'leaf' && leafReady) {
      setLeafReady(false);
      sendToEngine('ADVANCE_MOUNTAIN');
      return;
    }
    if (stage === 'ready') beginExit();
  }, [beginExit, leafReady, sendToEngine, stage]);

  const visibleStage = stage === 'loading' || stage === 'exiting' ? undefined : stageCopy[stage];
  const primaryLabel = stage === 'ready'
    ? '进入数智茶鸣'
    : stage === 'mountain'
      ? '山野成形中'
      : stage === 'leaf' && leafReady
        ? '显现春山'
        : '正在汇聚';
  const primaryDisabled = stage === 'loading' || stage === 'mountain' || (stage === 'leaf' && !leafReady);

  return (
    <main className={`intro-experience${exiting ? ' is-exiting' : ''}${engineFailed ? ' is-fallback' : ''}`} aria-label="一叶问茶首焦动画">
      <div className="intro-experience__visual" aria-hidden="true">
        {engineFailed ? <img src="/assets/intro/intro-fallback.png" alt="" /> : null}
        {!engineFailed ? (
          <iframe
            ref={engineFrame}
            title="一叶问茶生成艺术引擎"
            src={engineUrl}
            allow="fullscreen"
          />
        ) : null}
      </div>
      <div className="intro-experience__vignette" aria-hidden="true" />
      <div className="intro-experience__grain" aria-hidden="true" />

      <header className="intro-experience__header">
        <motion.div layoutId="tea-brand-title" className="brand-title brand-title--intro">
          <span>一叶问茶<span className="brand-title__dot">·</span>春声三鸣</span><i aria-hidden="true">春建</i>
        </motion.div>
        <button type="button" className="intro-experience__skip" onClick={beginExit}>
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
          <div className="intro-experience__loading"><i />{engineFailed ? '已切换为静态首焦' : '正在唤醒春山'}</div>
        )}
      </section>

      <footer className="intro-experience__footer">
        <div className="intro-experience__progress" aria-hidden="true"><i style={{ width: `${Math.round(Math.min(1, Math.max(0, progress)) * 100)}%` }} /></div>
        <button type="button" onClick={handlePrimaryAction} disabled={primaryDisabled} className={stage === 'ready' ? 'is-ready' : ''}>
          <ChevronDown className="h-5 w-5" />
          <span>{primaryLabel}</span>
        </button>
      </footer>
    </main>
  );
}
