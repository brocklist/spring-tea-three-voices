import { Navigate, Route, Routes } from 'react-router-dom';
import { TopNav } from './components/layout/TopNav';
import { ProductionPage } from './pages/ProductionPage';
import { MarketPage } from './pages/MarketPage';
import { MatchingPage } from './pages/MatchingPage';

export default function App() {
  return (
    <div className="min-h-screen bg-[#f7fbf3] text-tea-ink">
      <TopNav />
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/production" replace />} />
          <Route path="/production" element={<ProductionPage />} />
          <Route path="/market" element={<MarketPage />} />
          <Route path="/matching" element={<MatchingPage />} />
          <Route path="*" element={<Navigate to="/production" replace />} />
        </Routes>
      </main>
    </div>
  );
}
