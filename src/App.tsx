import React, { useState, useEffect } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { 
  Activity, TrendingUp, AlertTriangle, Shield, Zap, 
  Clock, BarChart3, Newspaper, Play, Pause, StopCircle,
  DollarSign, Layers, Server, Cpu, RefreshCw, Filter, GitCommit,
  BookOpen
} from 'lucide-react';

// Types
interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  bid: number;
  ask: number;
  sector: 'ENERGY' | 'METALS' | 'AGRICULTURE';
}

interface NewsItem {
  id: string;
  headline: string;
  source: string;
  timestamp: Date;
  sentiment: number;
  urgency: 'IMMEDIATE' | 'SCHEDULED' | 'RUMOR';
  commodity: string;
  impactScore: number;
}

interface TradingSignal {
  id: string;
  symbol: string;
  direction: 'BUY' | 'SELL';
  strength: number;
  timestamp: Date;
  reason: string;
  status: 'PENDING' | 'EXECUTED' | 'REJECTED';
  positionSize: number;
  entryPrice?: number;
}

interface Position {
  symbol: string;
  direction: 'LONG' | 'SHORT';
  size: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  openTime: Date;
}

interface RiskMetrics {
  totalEquity: number;
  dailyPnL: number;
  dailyPnLPercent: number;
  maxDrawdown: number;
  sharpeRatio: number;
  var95: number;
  exposure: { ENERGY: number; METALS: number; AGRICULTURE: number };
  correlation: number;
  latency: number;
}

interface SystemHealth {
  dataFeed: 'HEALTHY' | 'DEGRADED' | 'OFFLINE';
  executionEngine: 'HEALTHY' | 'DEGRADED' | 'OFFLINE';
  riskEngine: 'HEALTHY' | 'DEGRADED' | 'OFFLINE';
  kafkaCluster: 'HEALTHY' | 'DEGRADED' | 'OFFLINE';
  database: 'HEALTHY' | 'DEGRADED' | 'OFFLINE';
  lastHeartbeat: Date;
  messagesPerSecond: number;
  errorRate: number;
  latency: number;
}

// Mock Data Generators
const generateMarketData = (): MarketData[] => [
  { symbol: 'CL=F', name: 'WTI Crude Oil', price: 78.45, change: 1.23, changePercent: 1.59, volume: 245678, high: 79.12, low: 77.89, bid: 78.43, ask: 78.47, sector: 'ENERGY' },
  { symbol: 'GC=F', name: 'Gold Futures', price: 2034.50, change: -12.30, changePercent: -0.60, volume: 189234, high: 2048.00, low: 2028.50, bid: 2034.20, ask: 2034.80, sector: 'METALS' },
  { symbol: 'NG=F', name: 'Natural Gas', price: 2.87, change: 0.15, changePercent: 5.51, volume: 312456, high: 2.92, low: 2.78, bid: 2.86, ask: 2.88, sector: 'ENERGY' },
  { symbol: 'ZC=F', name: 'Corn Futures', price: 478.25, change: -3.50, changePercent: -0.73, volume: 98765, high: 482.00, low: 476.50, bid: 478.00, ask: 478.50, sector: 'AGRICULTURE' },
  { symbol: 'SI=F', name: 'Silver Futures', price: 24.67, change: 0.34, changePercent: 1.40, volume: 145678, high: 24.89, low: 24.23, bid: 24.65, ask: 24.69, sector: 'METALS' },
  { symbol: 'HG=F', name: 'Copper Futures', price: 3.82, change: -0.05, changePercent: -1.29, volume: 87654, high: 3.88, low: 3.79, bid: 3.81, ask: 3.83, sector: 'METALS' },
];

const generateNewsItems = (): NewsItem[] => [
  { id: '1', headline: 'EIA Reports Unexpected Draw in Crude Oil Inventories -2.5M vs +0.5M Expected', source: 'Bloomberg', timestamp: new Date(Date.now() - 120000), sentiment: 0.82, urgency: 'IMMEDIATE', commodity: 'WTI_CRUDE', impactScore: 0.91 },
  { id: '2', headline: 'Fed Chair Powell Signals Potential Rate Pause at Next FOMC Meeting', source: 'Reuters', timestamp: new Date(Date.now() - 300000), sentiment: 0.45, urgency: 'SCHEDULED', commodity: 'GOLD', impactScore: 0.67 },
  { id: '3', headline: 'OPEC+ Sources Discuss Production Cut Extension Amid Price Concerns', source: 'Wall Street Journal', timestamp: new Date(Date.now() - 480000), sentiment: 0.71, urgency: 'RUMOR', commodity: 'BRENT', impactScore: 0.54 },
  { id: '4', headline: 'USDA Lowers Corn Yield Forecast Due to Drought Conditions in Midwest', source: 'USDA', timestamp: new Date(Date.now() - 600000), sentiment: -0.63, urgency: 'IMMEDIATE', commodity: 'CORN', impactScore: 0.78 },
  { id: '5', headline: 'China Manufacturing PMI Beats Expectations, Boosts Industrial Metals Outlook', source: 'Refinitiv', timestamp: new Date(Date.now() - 900000), sentiment: 0.58, urgency: 'SCHEDULED', commodity: 'COPPER', impactScore: 0.62 },
];

const generateSignals = (): TradingSignal[] => [
  { id: 'SIG-001', symbol: 'CL=F', direction: 'BUY', strength: 0.87, timestamp: new Date(Date.now() - 60000), reason: 'Inventory surprise + bullish breakout + high sentiment', status: 'EXECUTED', positionSize: 15, entryPrice: 77.85 },
  { id: 'SIG-002', symbol: 'NG=F', direction: 'BUY', strength: 0.72, timestamp: new Date(Date.now() - 180000), reason: 'Weather forecast + technical support bounce', status: 'EXECUTED', positionSize: 25, entryPrice: 2.79 },
  { id: 'SIG-003', symbol: 'ZC=F', direction: 'SELL', strength: 0.65, timestamp: new Date(Date.now() - 300000), reason: 'USDA yield revision + bearish momentum', status: 'PENDING', positionSize: 20 },
  { id: 'SIG-004', symbol: 'GC=F', direction: 'SELL', strength: 0.58, timestamp: new Date(Date.now() - 420000), reason: 'Dollar strength + reduced safe haven demand', status: 'REJECTED', positionSize: 10 },
];

const generatePositions = (): Position[] => [
  { symbol: 'CL=F', direction: 'LONG', size: 15, entryPrice: 77.85, currentPrice: 78.45, pnl: 900, pnlPercent: 0.77, openTime: new Date(Date.now() - 3600000) },
  { symbol: 'NG=F', direction: 'LONG', size: 25, entryPrice: 2.79, currentPrice: 2.87, pnl: 200, pnlPercent: 2.87, openTime: new Date(Date.now() - 7200000) },
  { symbol: 'SI=F', direction: 'SHORT', size: 30, entryPrice: 25.12, currentPrice: 24.67, pnl: 135, pnlPercent: 1.79, openTime: new Date(Date.now() - 14400000) },
];

const initialRiskMetrics: RiskMetrics = {
  totalEquity: 1000000,
  dailyPnL: 12450,
  dailyPnLPercent: 1.25,
  maxDrawdown: -3.2,
  sharpeRatio: 1.87,
  var95: 18500,
  exposure: { ENERGY: 28, METALS: 15, AGRICULTURE: 8 },
  correlation: 0.42,
  latency: 87,
};

const initialSystemHealth: SystemHealth = {
  dataFeed: 'HEALTHY',
  executionEngine: 'HEALTHY',
  riskEngine: 'HEALTHY',
  kafkaCluster: 'HEALTHY',
  database: 'HEALTHY',
  lastHeartbeat: new Date(),
  messagesPerSecond: 12453,
  errorRate: 0.002,
  latency: 87,
};

// Helper Components
const StatusBadge: React.FC<{ status: 'HEALTHY' | 'DEGRADED' | 'OFFLINE' | 'BUY' | 'SELL' | 'IMMEDIATE' | 'SCHEDULED' | 'RUMOR' | 'PENDING' | 'EXECUTED' | 'REJECTED' }> = ({ status }) => {
  const colors: Record<string, string> = {
    HEALTHY: 'bg-emerald-500 text-black text-emerald-400 border-emerald-500',
    DEGRADED: 'bg-amber-500 text-black text-amber-400 border-amber-500',
    OFFLINE: 'bg-red-500 text-black text-red-400 border-red-500',
    BUY: 'bg-emerald-500 text-black text-emerald-400 border-emerald-500',
    SELL: 'bg-red-500 text-black text-red-400 border-red-500',
    IMMEDIATE: 'bg-red-500 text-black text-red-400 border-red-500',
    SCHEDULED: 'bg-blue-500 text-black text-blue-400 border-blue-500',
    RUMOR: 'bg-amber-500 text-black text-amber-400 border-amber-500',
    PENDING: 'bg-amber-500 text-black text-amber-400 border-amber-500',
    EXECUTED: 'bg-emerald-500 text-black text-emerald-400 border-emerald-500',
    REJECTED: 'bg-red-500 text-black text-red-400 border-red-500',
  };
  
  return (
    <span className={`px-2 py-0.5 text-xs font-mono font-bold border ${colors[status] || 'bg-[#333] text-white text-[#aaa]'}`}>
      {status}
    </span>
  );
};

const MetricCard: React.FC<{ label: string; value: string | number; subValue?: string; trend?: 'up' | 'down' | 'neutral'; icon?: React.ReactNode }> = ({ label, value, subValue, trend, icon }) => (
  <div className="bg-black border border-[#333] p-3">
    <div className="flex items-center justify-between mb-1">
      <span className="text-xs text-[#777] font-mono uppercase">{label}</span>
      {icon && <span className="text-gray-600">{icon}</span>}
    </div>
    <div className="flex items-end gap-2">
      <span className="text-lg font-mono font-bold text-white">{value}</span>
      {trend && (
        <span className={`text-xs font-mono ${trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-[#aaa]'}`}>
          {trend === 'up' ? '▲' : trend === 'down' ? '▼' : '●'}
        </span>
      )}
    </div>
    {subValue && <span className="text-xs text-gray-600 font-mono">{subValue}</span>}
  </div>
);

// Main App Component
const App: React.FC = () => {
  const [isRunning, setIsRunning] = useState(true);
  const [marketData, setMarketData] = useState<MarketData[]>(generateMarketData());
  const newsItems = generateNewsItems();
  const signals = generateSignals();
  const positions = generatePositions();
  const riskMetrics = initialRiskMetrics;
  const [systemHealth, setSystemHealth] = useState<SystemHealth>(initialSystemHealth);
  const [selectedTab, setSelectedTab] = useState<'DASHBOARD' | 'MARKETS' | 'NEWS' | 'SIGNALS' | 'RISK' | 'SYSTEM'>('DASHBOARD');
  const [chartData, setChartData] = useState<any[]>([]);

  // Generate chart data
  useEffect(() => {
    const data = [];
    for (let i = 0; i < 60; i++) {
      data.push({
        time: `${14 - Math.floor(i / 10)}:${(59 - (i % 10) * 6).toString().padStart(2, '0')}`,
        price: 78 + Math.sin(i * 0.3) * 0.5 + Math.random() * 0.3,
        volume: Math.floor(Math.random() * 1000) + 500,
        sentiment: 0.5 + Math.sin(i * 0.2) * 0.3,
      });
    }
    setChartData(data);
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    if (!isRunning) return;
    
    const interval = setInterval(() => {
      setMarketData(prev => prev.map(item => ({
        ...item,
        price: item.price + (Math.random() - 0.5) * 0.1,
        change: item.change + (Math.random() - 0.5) * 0.05,
        changePercent: item.changePercent + (Math.random() - 0.5) * 0.1,
      })));
      
      setSystemHealth(prev => ({
        ...prev,
        lastHeartbeat: new Date(),
        messagesPerSecond: prev.messagesPerSecond + Math.floor(Math.random() * 100) - 50,
        latency: Math.max(50, prev.latency + Math.floor(Math.random() * 20) - 10),
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatNumber = (num: number, decimals: number = 2) => {
    return num.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      {/* Header */}
      <header className="border-b border-[#333] bg-black">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-500 flex items-center justify-center">
                <Activity className="w-5 h-5 text-black" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">COMMTRADER PRO</h1>
                <p className="text-xs text-[#777]">NEWS-DRIVEN COMMODITIES BOT v2.4.1</p>
              </div>
            </div>
            <div className="h-8 w-px bg-[#222]" />
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2  ${isRunning ? 'bg-emerald-500 blink' : 'bg-red-500'}`} />
              <span className="text-xs text-[#aaa]">{isRunning ? 'LIVE TRADING' : 'PAUSED'}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#111] border border-[#444]">
              <Clock className="w-4 h-4 text-[#777]" />
              <span className="text-sm">{formatTime(new Date())} EST</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`p-2 border ${isRunning ? 'border-amber-500 text-amber-500 hover:bg-amber-500/10' : 'border-emerald-500 text-emerald-500 hover:bg-emerald-500/10'}`}
              >
                {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              <button className="p-2 border border-red-500 text-red-500 hover:bg-red-500/10">
                <StopCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <nav className="flex border-t border-[#333]">
          {(['DASHBOARD', 'MARKETS', 'NEWS', 'SIGNALS', 'RISK', 'SYSTEM'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-2 text-xs font-bold tracking-wide border-r border-[#333] transition-colors ${
                selectedTab === tab
                  ? 'bg-amber-500/10 text-amber-500 border-b-2 border-b-amber-500'
                  : 'text-[#777] hover:text-[#ccc] hover:bg-[#111]'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </header>

      {/* Main Content */}
      <main className="p-4 grid grid-cols-12 gap-4">
        {/* Left Sidebar - System Health */}
        <aside className="col-span-2 space-y-4">
          <div className="bg-black border border-[#333] p-3">
            <h3 className="text-xs font-bold text-[#aaa] mb-3 flex items-center gap-2">
              <Server className="w-4 h-4" />
              SYSTEM HEALTH
            </h3>
            <div className="space-y-2">
              {[
                { name: 'Data Feed', status: systemHealth.dataFeed },
                { name: 'Execution', status: systemHealth.executionEngine },
                { name: 'Risk Engine', status: systemHealth.riskEngine },
                { name: 'Kafka Cluster', status: systemHealth.kafkaCluster },
                { name: 'Database', status: systemHealth.database },
              ].map(item => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <span className="text-[#777]">{item.name}</span>
                  <StatusBadge status={item.status} />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-black border border-[#333] p-3">
            <h3 className="text-xs font-bold text-[#aaa] mb-3 flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              PERFORMANCE
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#777]">Msg/sec</span>
                <span className="text-white">{formatNumber(systemHealth.messagesPerSecond, 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#777]">Latency P99</span>
                <span className={`${systemHealth.latency < 150 ? 'text-emerald-400' : 'text-amber-400'}`}>{systemHealth.latency}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#777]">Error Rate</span>
                <span className="text-white">{(systemHealth.errorRate * 100).toFixed(3)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#777]">Uptime</span>
                <span className="text-emerald-400">99.97%</span>
              </div>
            </div>
          </div>

          <div className="bg-black border border-[#333] p-3">
            <h3 className="text-xs font-bold text-[#aaa] mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              CIRCUIT BREAKERS
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#777]">Daily DD Limit</span>
                <span className="text-emerald-400">ACTIVE</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#777]">Position Limits</span>
                <span className="text-emerald-400">OK</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#777]">Latency Monitor</span>
                <span className="text-emerald-400">OK</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#777]">FOMC Blackout</span>
                <span className="text-[#aaa]">INACTIVE</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Center - Main Dashboard */}
        <section className="col-span-7 space-y-4">
          {/* Risk Metrics Row */}
          <div className="grid grid-cols-6 gap-2">
            <MetricCard
              label="Total Equity"
              value={formatCurrency(riskMetrics.totalEquity)}
              trend="up"
              icon={<DollarSign className="w-4 h-4" />}
            />
            <MetricCard
              label="Daily P&L"
              value={`${riskMetrics.dailyPnL >= 0 ? '+' : ''}${formatCurrency(riskMetrics.dailyPnL)}`}
              subValue={`${riskMetrics.dailyPnLPercent >= 0 ? '+' : ''}${riskMetrics.dailyPnLPercent.toFixed(2)}%`}
              trend={riskMetrics.dailyPnL >= 0 ? 'up' : 'down'}
              icon={<TrendingUp className="w-4 h-4" />}
            />
            <MetricCard
              label="Max Drawdown"
              value={`${riskMetrics.maxDrawdown.toFixed(1)}%`}
              trend="neutral"
              icon={<AlertTriangle className="w-4 h-4" />}
            />
            <MetricCard
              label="Sharpe Ratio"
              value={riskMetrics.sharpeRatio.toFixed(2)}
              trend={riskMetrics.sharpeRatio > 1.5 ? 'up' : 'neutral'}
              icon={<Activity className="w-4 h-4" />}
            />
            <MetricCard
              label="VaR (95%)"
              value={formatCurrency(riskMetrics.var95)}
              icon={<Shield className="w-4 h-4" />}
            />
            <MetricCard
              label="Latency"
              value={`${riskMetrics.latency}ms`}
              trend={riskMetrics.latency < 150 ? 'up' : 'down'}
              icon={<Zap className="w-4 h-4" />}
            />
          </div>

          {/* Price Chart */}
          <div className="bg-black border border-[#333] p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#ccc] flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                WTI CRUDE OIL (CL=F) - REAL-TIME
              </h3>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#777]">Last:</span>
                <span className="text-emerald-400 font-bold">$78.45</span>
                <span className="text-emerald-400">+1.59%</span>
              </div>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis dataKey="time" stroke="#6b7280" fontSize={10} tick={{ fontFamily: 'monospace' }} />
                  <YAxis stroke="#6b7280" fontSize={10} domain={['auto', 'auto']} tick={{ fontFamily: 'monospace' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', fontFamily: 'monospace' }}
                    labelStyle={{ color: '#9ca3af' }}
                  />
                  <Area type="monotone" dataKey="price" stroke="#10b981" fill="url(#priceGradient)" strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Order Book & Market Data Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Order Book */}
            <div className="bg-black border border-[#333]">
              <div className="flex items-center justify-between px-4 py-2 border-b border-[#333]">
                <h3 className="text-sm font-bold text-[#ccc] flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  ORDER BOOK - CL=F
                </h3>
                <span className="text-xs text-[#777]">Depth: 20</span>
              </div>
              <div className="p-3">
                <div className="grid grid-cols-3 text-xs text-[#777] mb-2">
                  <span className="text-right">BID</span>
                  <span className="text-center">SIZE</span>
                  <span className="text-left">ASK</span>
                </div>
                {/* Asks (sellers) */}
                {[
                  { price: 78.49, size: 45 },
                  { price: 78.48, size: 120 },
                  { price: 78.47, size: 85 },
                  { price: 78.46, size: 200 },
                  { price: 78.45, size: 150 },
                ].map((ask, i) => (
                  <div key={`ask-${i}`} className="grid grid-cols-3 text-xs mb-1 relative">
                    <div className="absolute right-0 top-0 bottom-0 bg-red-500/10" style={{ width: `${(ask.size / 200) * 100}%` }} />
                    <span className="text-right text-gray-600 relative z-10"></span>
                    <span className="text-center text-[#aaa] relative z-10">{ask.size}</span>
                    <span className="text-left text-red-400 relative z-10">${ask.price.toFixed(2)}</span>
                  </div>
                ))}
                {/* Spread */}
                <div className="text-center text-xs text-[#aaa] py-2 border-y border-[#333] my-2">
                  SPREAD: $0.04 (0.05%)
                </div>
                {/* Bids (buyers) */}
                {[
                  { price: 78.43, size: 180 },
                  { price: 78.42, size: 95 },
                  { price: 78.41, size: 220 },
                  { price: 78.40, size: 150 },
                  { price: 78.39, size: 75 },
                ].map((bid, i) => (
                  <div key={`bid-${i}`} className="grid grid-cols-3 text-xs mb-1 relative">
                    <div className="absolute left-0 top-0 bottom-0 bg-emerald-500/10" style={{ width: `${(bid.size / 220) * 100}%` }} />
                    <span className="text-right text-emerald-400 relative z-10">${bid.price.toFixed(2)}</span>
                    <span className="text-center text-[#aaa] relative z-10">{bid.size}</span>
                    <span className="text-left text-gray-600 relative z-10"></span>
                  </div>
                ))}
              </div>
            </div>

            {/* Market Depth Chart */}
            <div className="bg-black border border-[#333] p-4">
              <h3 className="text-sm font-bold text-[#ccc] mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                MARKET DEPTH
              </h3>
              <div className="h-32 flex items-end justify-between gap-1">
                {Array.from({ length: 20 }, (_, i) => {
                  const bidHeight = 20 + Math.random() * 80;
                  const askHeight = 20 + Math.random() * 80;
                  return (
                    <div key={i} className="flex-1 flex flex-col gap-px">
                      <div className="bg-red-500/40" style={{ height: `${askHeight * 0.3}%` }} />
                      <div className="bg-gray-700" style={{ height: '20%' }} />
                      <div className="bg-emerald-500/40" style={{ height: `${bidHeight * 0.3}%` }} />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-xs text-[#777] mt-2">
                <span>BID</span>
                <span>ASK</span>
              </div>
            </div>
          </div>

          {/* Market Data Table */}
          <div className="bg-black border border-[#333]">
            <div className="flex items-center justify-between px-4 py-2 border-b border-[#333]">
              <h3 className="text-sm font-bold text-[#ccc] flex items-center gap-2">
                <Layers className="w-4 h-4" />
                LIVE MARKET DATA
              </h3>
              <div className="flex items-center gap-2">
                <button className="p-1 hover:bg-[#222]"><RefreshCw className="w-4 h-4 text-[#777]" /></button>
                <button className="p-1 hover:bg-[#222]"><Filter className="w-4 h-4 text-[#777]" /></button>
              </div>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[#777] border-b border-[#333]">
                  <th className="text-left px-4 py-2 font-medium">SYMBOL</th>
                  <th className="text-right px-4 py-2 font-medium">LAST</th>
                  <th className="text-right px-4 py-2 font-medium">CHANGE</th>
                  <th className="text-right px-4 py-2 font-medium">BID</th>
                  <th className="text-right px-4 py-2 font-medium">ASK</th>
                  <th className="text-right px-4 py-2 font-medium">VOLUME</th>
                  <th className="text-center px-4 py-2 font-medium">SECTOR</th>
                </tr>
              </thead>
              <tbody>
                {marketData.map(item => (
                  <tr key={item.symbol} className="border-b border-[#333] hover:bg-black">
                    <td className="px-4 py-2">
                      <div className="font-bold text-white">{item.symbol}</div>
                      <div className="text-[#777]">{item.name}</div>
                    </td>
                    <td className="px-4 py-2 text-right font-bold">${formatNumber(item.price, 2)}</td>
                    <td className={`px-4 py-2 text-right font-bold ${item.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {item.change >= 0 ? '+' : ''}{formatNumber(item.change, 2)} ({item.changePercent >= 0 ? '+' : ''}{formatNumber(item.changePercent, 2)}%)
                    </td>
                    <td className="px-4 py-2 text-right text-[#aaa]">${formatNumber(item.bid, 2)}</td>
                    <td className="px-4 py-2 text-right text-[#aaa]">${formatNumber(item.ask, 2)}</td>
                    <td className="px-4 py-2 text-right text-[#aaa]">{formatNumber(item.volume, 0)}</td>
                    <td className="px-4 py-2 text-center">
                      <span className={`px-2 py-0.5 text-xs font-bold ${
                        item.sector === 'ENERGY' ? 'bg-amber-500 text-black text-amber-400' :
                        item.sector === 'METALS' ? 'bg-blue-500 text-black text-blue-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {item.sector}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Right Sidebar - News & Signals */}
        <aside className="col-span-3 space-y-4">
          {/* Active Positions */}
          <div className="bg-black border border-[#333]">
            <div className="flex items-center justify-between px-4 py-2 border-b border-[#333]">
              <h3 className="text-sm font-bold text-[#ccc] flex items-center gap-2">
                <Layers className="w-4 h-4" />
                ACTIVE POSITIONS
              </h3>
              <span className="text-xs text-[#777]">{positions.length} open</span>
            </div>
            <div className="p-3 space-y-2">
              {positions.map(pos => (
                <div key={pos.symbol} className="bg-black border border-[#333] p-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white">{pos.symbol}</span>
                    <span className={`text-xs font-bold ${pos.direction === 'LONG' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {pos.direction}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#aaa]">
                    <span>Size: {pos.size}</span>
                    <span>Entry: ${formatNumber(pos.entryPrice)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-[#777]">Current: ${formatNumber(pos.currentPrice)}</span>
                    <span className={`text-xs font-bold ${pos.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {pos.pnl >= 0 ? '+' : ''}{formatCurrency(pos.pnl)} ({pos.pnlPercent >= 0 ? '+' : ''}{pos.pnlPercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Signals */}
          <div className="bg-black border border-[#333]">
            <div className="flex items-center justify-between px-4 py-2 border-b border-[#333]">
              <h3 className="text-sm font-bold text-[#ccc] flex items-center gap-2">
                <Zap className="w-4 h-4" />
                TRADING SIGNALS
              </h3>
              <span className="text-xs text-[#777]">Last 5min</span>
            </div>
            <div className="p-3 space-y-2">
              {signals.map(signal => (
                <div key={signal.id} className="bg-black border border-[#333] p-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={signal.direction} />
                      <span className="font-bold text-white">{signal.symbol}</span>
                    </div>
                    <StatusBadge status={signal.status} />
                  </div>
                  <div className="text-xs text-[#aaa] mb-1">
                    Strength: <span className="text-white font-bold">{(signal.strength * 100).toFixed(0)}%</span>
                  </div>
                  <div className="text-xs text-[#777] truncate">{signal.reason}</div>
                  <div className="text-xs text-gray-600 mt-1">{formatTime(signal.timestamp)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Live News Feed */}
          <div className="bg-black border border-[#333]">
            <div className="flex items-center justify-between px-4 py-2 border-b border-[#333]">
              <h3 className="text-sm font-bold text-[#ccc] flex items-center gap-2">
                <Newspaper className="w-4 h-4" />
                NEWS WIRE
              </h3>
              <span className="text-xs text-[#777]">Real-time</span>
            </div>
            <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
              {newsItems.map(news => (
                <div key={news.id} className="bg-black border border-[#333] p-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[#777]">{news.source}</span>
                    <StatusBadge status={news.urgency} />
                  </div>
                  <p className="text-xs text-white mb-1 line-clamp-2">{news.headline}</p>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-[#777]">Sentiment:</span>
                      <span className={`font-bold ${news.sentiment > 0.3 ? 'text-emerald-400' : news.sentiment < -0.3 ? 'text-red-400' : 'text-[#aaa]'}`}>
                        {news.sentiment > 0 ? '+' : ''}{news.sentiment.toFixed(2)}
                      </span>
                    </div>
                    <span className="text-[#777]">{formatTime(news.timestamp)}</span>
                  </div>
                  <div className="mt-1">
                    <div className="h-1 bg-gray-700  overflow-hidden">
                      <div
                        className={`h-full ${news.impactScore > 0.7 ? 'bg-red-500' : news.impactScore > 0.4 ? 'bg-amber-500' : 'bg-blue-500'}`}
                        style={{ width: `${news.impactScore * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-[#777] mt-0.5">Impact: {(news.impactScore * 100).toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sector Exposure */}
          <div className="bg-black border border-[#333] p-3">
            <h3 className="text-xs font-bold text-[#aaa] mb-3 flex items-center gap-2">
              <PieChartIcon />
              SECTOR EXPOSURE
            </h3>
            <div className="space-y-2">
              {Object.entries(riskMetrics.exposure).map(([sector, value]) => (
                <div key={sector} className="flex items-center gap-2">
                  <span className="text-xs text-[#777] w-20">{sector}</span>
                  <div className="flex-1 h-2 bg-[#222]  overflow-hidden">
                    <div
                      className={`h-full ${
                        sector === 'ENERGY' ? 'bg-amber-500' :
                        sector === 'METALS' ? 'bg-blue-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${(value / 30) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-white w-8 text-right">{value}%</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-[#333]">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#777]">Portfolio Correlation</span>
                <span className={`${riskMetrics.correlation < 0.5 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {riskMetrics.correlation.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Trade Log */}
          <div className="bg-black border border-[#333]">
            <div className="flex items-center justify-between px-4 py-2 border-b border-[#333]">
              <h3 className="text-sm font-bold text-[#ccc] flex items-center gap-2">
                <GitCommit className="w-4 h-4" />
                TRADE LOG
              </h3>
              <span className="text-xs text-[#777]">Today</span>
            </div>
            <div className="p-3 space-y-1 max-h-48 overflow-y-auto text-xs">
              {[
                { time: '14:32:15', symbol: 'CL=F', action: 'BUY', size: 15, price: 77.85, status: 'FILLED' },
                { time: '14:28:42', symbol: 'NG=F', action: 'BUY', size: 25, price: 2.79, status: 'FILLED' },
                { time: '14:15:08', symbol: 'SI=F', action: 'SELL', size: 30, price: 25.12, status: 'FILLED' },
                { time: '13:58:33', symbol: 'GC=F', action: 'SELL', size: 10, price: 2041.00, status: 'REJECTED' },
                { time: '13:45:21', symbol: 'HG=F', action: 'BUY', size: 20, price: 3.85, status: 'FILLED' },
                { time: '13:22:17', symbol: 'ZC=F', action: 'SELL', size: 15, price: 481.50, status: 'FILLED' },
                { time: '12:58:44', symbol: 'CL=F', action: 'SELL', size: 10, price: 77.20, status: 'FILLED' },
              ].map((trade, i) => (
                <div key={i} className="flex items-center justify-between py-1 border-b border-[#333] last:border-0">
                  <span className="text-[#777] w-14">{trade.time}</span>
                  <span className="font-bold text-white w-12">{trade.symbol}</span>
                  <span className={`w-10 ${trade.action === 'BUY' ? 'text-emerald-400' : 'text-red-400'}`}>{trade.action}</span>
                  <span className="text-[#aaa] w-8 text-right">{trade.size}</span>
                  <span className="text-[#aaa] w-16 text-right">${trade.price}</span>
                  <span className={`w-14 ${trade.status === 'FILLED' ? 'text-emerald-400' : 'text-red-400'}`}>{trade.status}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>

      {/* Footer Status Bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-black border-t border-[#333] px-4 py-1">
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

// Simple Pie Chart Icon
const PieChartIcon: React.FC = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
  </svg>
);

export default App;
