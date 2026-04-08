import { create } from 'zustand';

export interface NewsItem {
  id: string;
  headline: string;
  description?: string;
  url?: string;
  source: string;
  timestamp: Date;
  sentiment: number;
  urgency: 'IMMEDIATE' | 'SCHEDULED' | 'RUMOR';
  impactScore: number;
  relatedGeo?: [number, number]; // [longitude, latitude]
}

export interface Plane {
  id: string;
  callsign: string;
  origin_country: string;
  coordinates: [number, number]; // [lon, lat]
  velocity: number;
  true_track: number;
  altitude: number;
}

export interface Position {
  id: string;
  symbol: string;
  direction: 'LONG' | 'SHORT';
  size: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  openTime: Date;
}

interface AppState {
  marketData: any[];
  news: NewsItem[];
  planes: Plane[];
  signals: any[];
  positions: Position[];
  activeTab: 'DASHBOARD' | 'MARKETS' | 'NEWS' | 'GEOPOLITICS' | 'SYSTEM';
  setActiveTab: (tab: 'DASHBOARD' | 'MARKETS' | 'NEWS' | 'GEOPOLITICS' | 'SYSTEM') => void;
  updatePlanes: (planes: Plane[]) => void;
  addNews: (items: NewsItem[]) => void;
  executeTrade: (symbol: string, direction: 'LONG' | 'SHORT', size: number, price: number) => void;
  updateMarketPrices: (simulatePrices: boolean) => void; 
}

export const useAppStore = create<AppState>((set) => ({
  marketData: [
    { symbol: 'CL=F', name: 'WTI Crude Oil', price: 78.45 },
    { symbol: 'GC=F', name: 'Gold Futures', price: 2034.50 },
    { symbol: 'NG=F', name: 'Natural Gas', price: 2.87 },
  ],
  news: [],
  planes: [],
  signals: [],
  positions: [],
  activeTab: 'DASHBOARD',
  setActiveTab: (tab) => set({ activeTab: tab }),
  updatePlanes: (planes) => set({ planes }),
  addNews: (newNews) => set((state) => ({ news: [...newNews, ...state.news].slice(0, 100) })),
  executeTrade: (symbol, direction, size, price) => set((state) => ({
    positions: [{
      id: `POS-${Date.now()}`,
      symbol,
      direction,
      size,
      entryPrice: price,
      currentPrice: price,
      pnl: 0,
      pnlPercent: 0,
      openTime: new Date()
    }, ...state.positions]
  })),
  updateMarketPrices: () => set((state) => {
    // Simulating market ticks to drive live P&L
    const newMarketData = state.marketData.map(m => ({
      ...m,
      price: m.price * (1 + (Math.random() * 0.002 - 0.001))
    }));

    const newPositions = state.positions.map(p => {
      const currentMarket = newMarketData.find(m => m.symbol === p.symbol);
      const currentPrice = currentMarket ? currentMarket.price : p.currentPrice;
      const diff = currentPrice - p.entryPrice;
      const pnlRaw = (p.direction === 'LONG' ? diff : -diff) * p.size;
      return {
        ...p,
        currentPrice,
        pnl: pnlRaw,
        pnlPercent: (pnlRaw / (p.entryPrice * p.size)) * 100
      };
    });

    return { marketData: newMarketData, positions: newPositions };
  }),
}));
