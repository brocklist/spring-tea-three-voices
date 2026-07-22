import { Navigate, Route, Routes } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { TopNav } from './components/layout/TopNav';
import { ProductionPage } from './pages/ProductionPage';
import { MarketPage } from './pages/MarketPage';
import { MatchingPage } from './pages/MatchingPage';

const CARE_MODE_KEY = 'spring-tea-elder-care-mode';

export default function App() {
  const [careMode, setCareMode] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.localStorage.getItem(CARE_MODE_KEY) === 'true';
  });

  useEffect(() => {
    window.localStorage.setItem(CARE_MODE_KEY, String(careMode));
  }, [careMode]);

  return (
    <div className={['min-h-screen bg-[#f7fbf3] text-tea-ink', careMode ? 'elder-care-mode' : ''].join(' ')}>
      <TopNav careMode={careMode} onCareModeChange={setCareMode} />
      <main>
        {careMode ? (
          <Routes>
            <Route path="/production" element={<ProductionPage careMode onCareModeChange={setCareMode} />} />
            <Route path="*" element={<Navigate to="/production" replace />} />
          </Routes>
        ) : (
          <Routes>
            <Route path="/" element={<Navigate to="/production" replace />} />
            <Route path="/production" element={<ProductionPage onCareModeChange={setCareMode} />} />
            <Route path="/market" element={<MarketPage />} />
            <Route path="/matching" element={<MatchingPage />} />
            <Route path="*" element={<Navigate to="/production" replace />} />
          </Routes>
        )}
      </main>
    </div>
  );
}
