import React, { useEffect } from 'react';
import { Activity, Clock, Play, Pause, StopCircle, Server, Cpu, Shield, Globe2, BarChart3, Newspaper } from 'lucide-react';
import { useAppStore } from './store';
import { initLiveEngine } from './services/LiveEngine';
import { GeopoliticsMap } from './components/GeopoliticsMap';
// We will stub the Dashboard and News for now if they are just the old content, but let's 
// just place placeholders to prove the tabs work perfectly for content.
// Actually, let's keep the dashboard logic in a separate component.
import { MainDashboard } from './components/MainDashboard';

const App: React.FC = () => {
  const activeTab = useAppStore(state => state.activeTab);
  const setActiveTab = useAppStore(state => state.setActiveTab);

  useEffect(() => {
    initLiveEngine();
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono flex flex-col">
      {/* Header */}
      <header className="border-b border-[#333] bg-black shrink-0">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-500 flex items-center justify-center">
                <Activity className="w-5 h-5 text-black" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">COMMTRADER PRO</h1>
                <p className="text-xs text-[#777]">NEWS-DRIVEN COMMODITIES BOT v2.5.0</p>
              </div>
            </div>
            <div className="h-8 w-px bg-[#333]" />
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 blink" />
              <span className="text-xs text-[#aaa]">LIVE TRADING</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#111] border border-[#333]">
              <Clock className="w-4 h-4 text-[#777]" />
              <span className="text-sm">{formatTime(new Date())} EST</span>
            </div>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <nav className="flex border-t border-[#333]">
          {(['DASHBOARD', 'MARKETS', 'NEWS', 'GEOPOLITICS', 'SYSTEM'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-bold tracking-wide border-r border-[#333] transition-colors ${
                activeTab === tab
                  ? 'bg-[#ff8c0015] text-amber-500 border-b-2 border-b-amber-500'
                  : 'text-[#777] hover:text-[#ccc] hover:bg-[#111]'
              }`}
            >
              <div className="flex items-center gap-2">
                {tab === 'GEOPOLITICS' && <Globe2 className="w-4 h-4" />}
                {tab === 'DASHBOARD' && <BarChart3 className="w-4 h-4" />}
                {tab === 'NEWS' && <Newspaper className="w-4 h-4" />}
                {tab}
              </div>
            </button>
          ))}
        </nav>
      </header>

      {/* Main Content Area - Render based on routing */}
      <main className="flex-1 p-4 grid grid-cols-12 gap-4 min-h-0 overflow-hidden">
        {activeTab === 'GEOPOLITICS' ? (
          <section className="col-span-12 h-full">
             <GeopoliticsMap />
          </section>
        ) : (
          <MainDashboard />
        )}
      </main>

      {/* Footer Status Bar */}
      <footer className="shrink-0 bg-black border-t border-[#333] px-4 py-1">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <span className="text-[#777]">SESSION: {new Date().toLocaleDateString()}</span>
            <span className="text-[#777]">|</span>
            <span className="text-[#777]">TRADES: 47</span>
            <span className="text-[#777]">|</span>
            <span className="text-[#777]">WIN RATE: 68.1%</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[#777]">DATA AGE: <span className="text-emerald-400">12ms</span></span>
            <span className="text-[#777]">|</span>
            <span className="text-[#777]">NEXT EIA: <span className="text-amber-400">14:30 EST</span></span>
            <span className="text-[#777]">|</span>
            <span className="text-[#777]">RISK MODE: <span className="text-emerald-400">NORMAL</span></span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
