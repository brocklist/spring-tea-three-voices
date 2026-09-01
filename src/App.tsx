import { AnimatePresence, LayoutGroup } from 'motion/react';
import { lazy, Suspense, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { TopNav } from './components/layout/TopNav';
import { RouteTransition } from './components/layout/RouteTransition';
import { ProductionPage } from './pages/ProductionPage';
import { MarketPage } from './pages/MarketPage';
import { MatchingPage } from './pages/MatchingPage';
import { assetUrl } from './lib/assetUrl';

const CARE_MODE_KEY = 'spring-tea-elder-care-mode';
const IntroExperience = lazy(() =>
  import('./components/intro/IntroExperience').then(({ IntroExperience: Intro }) => ({ default: Intro })),
);
const StoryExperience = lazy(() =>
  import('./components/story/StoryExperience').then(({ StoryExperience: Story }) => ({ default: Story })),
);

export default function App() {
  const location = useLocation();
  const [careMode, setCareMode] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.localStorage.getItem(CARE_MODE_KEY) === 'true';
  });

  useEffect(() => {
    window.localStorage.setItem(CARE_MODE_KEY, String(careMode));
  }, [careMode]);

  const showImmersiveExperience = (location.pathname === '/' || location.pathname === '/story') && !careMode;

  return (
    <LayoutGroup id="tea-site-motion">
      <div className={['min-h-screen bg-[#f7fbf3] text-tea-ink', careMode ? 'elder-care-mode' : '', showImmersiveExperience ? 'intro-active' : ''].join(' ')}>
        {!showImmersiveExperience ? <TopNav careMode={careMode} onCareModeChange={setCareMode} /> : null}
        <AnimatePresence mode="wait" initial={false}>
          <RouteTransition key={location.pathname}>
          <main>
            {careMode ? (
              <Routes location={location}>
                <Route path="/production" element={<ProductionPage careMode onCareModeChange={setCareMode} />} />
                <Route path="*" element={<Navigate to="/production" replace />} />
              </Routes>
            ) : (
              <Routes location={location}>
                <Route path="/" element={<Suspense fallback={<IntroLoading />}><IntroExperience /></Suspense>} />
                <Route path="/story" element={<Suspense fallback={<IntroLoading />}><StoryExperience /></Suspense>} />
                <Route path="/production" element={<ProductionPage onCareModeChange={setCareMode} />} />
                <Route path="/market" element={<MarketPage />} />
                <Route path="/matching" element={<MatchingPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            )}
          </main>
          </RouteTransition>
        </AnimatePresence>
      </div>
    </LayoutGroup>
  );
}

function IntroLoading() {
  return (
    <div className="intro-loading-screen" aria-label="正在准备首焦动画">
      <img
        className="intro-loading-screen__mountain"
        src={assetUrl('/assets/intro/tea-mountain-hero.png')}
        alt=""
      />
      <div className="intro-loading-screen__shade" />
      <div className="brand-title brand-title--loading" aria-label="一叶问茶·春声三鸣">
        <span>一叶问茶<span className="brand-title__dot">·</span>春声三鸣</span><i aria-hidden="true">春建</i>
      </div>
      <p><span />正在唤醒春山</p>
    </div>
  );
}
