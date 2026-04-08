import { create } from 'zustand';

interface NewsItem {
  id: string;
  headline: string;
  source: string;
  timestamp: Date;
  sentiment: number;
  urgency: 'IMMEDIATE' | 'SCHEDULED' | 'RUMOR';
  impactScore: number;
  relatedGeo?: [number, number]; // [longitude, latitude]
}

interface Ship {
  id: string;
  name: string;
  type: string;
  coordinates: [number, number]; // [lon, lat]
  heading: number;
  speed: number;
  status: 'UNDER_WAY' | 'MOORED' | 'AT_ANCHOR';
  destination: string;
}

interface AppState {
  marketData: any[];
  news: NewsItem[];
  ships: Ship[];
  signals: any[];
  activeTab: 'DASHBOARD' | 'MARKETS' | 'NEWS' | 'GEOPOLITICS' | 'SYSTEM';
  setActiveTab: (tab: 'DASHBOARD' | 'MARKETS' | 'NEWS' | 'GEOPOLITICS' | 'SYSTEM') => void;
  updateShips: (ships: Ship[]) => void;
  addNews: (items: NewsItem[]) => void;
}

export const useAppStore = create<AppState>((set) => ({
  marketData: [],
  news: [],
  ships: [],
  signals: [],
  activeTab: 'DASHBOARD',
  setActiveTab: (tab) => set({ activeTab: tab }),
  updateShips: (ships) => set({ ships }),
  addNews: (newNews) => set((state) => ({ news: [...newNews, ...state.news].slice(0, 100) })),
}));
