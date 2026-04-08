import React, { useState, useEffect } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { 
  Activity, TrendingUp, AlertTriangle, Shield, Zap, 
  BarChart3, Newspaper, DollarSign, Layers, Server, Cpu, RefreshCw, Filter, GitCommit,
  BookOpen
} from 'lucide-react';
import { useAppStore } from '../store';

const initialRiskMetrics = {
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

const initialSystemHealth = {
  dataFeed: 'HEALTHY',
  executionEngine: 'HEALTHY',
  riskEngine: 'HEALTHY',
  kafkaCluster: 'HEALTHY',
  database: 'HEALTHY',
  latency: 87,
  messagesPerSecond: 12453,
  errorRate: 0.002
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const colors: Record<string, string> = {
    HEALTHY: 'bg-emerald-500 text-black border-emerald-500',
    DEGRADED: 'bg-amber-500 text-black border-amber-500',
    OFFLINE: 'bg-red-500 text-black border-red-500',
    BUY: 'bg-emerald-500 text-black border-emerald-500',
    SELL: 'bg-red-500 text-black border-red-500',
    IMMEDIATE: 'bg-red-500 text-black border-red-500',
    SCHEDULED: 'bg-blue-500 text-black border-blue-500',
    EXECUTED: 'bg-emerald-500 text-black border-emerald-500',
  };
  return (
    <span className={`px-2 py-0.5 text-xs font-mono font-bold border ${colors[status] || 'bg-[#333] text-white border-[#444]'}`}>
      {status}
    </span>
  );
};

const MetricCard: React.FC<{ label: string; value: string | number; subValue?: string; trend?: 'up' | 'down' | 'neutral'; icon?: React.ReactNode }> = ({ label, value, subValue, trend, icon }) => (
  <div className="bg-[#111] border border-[#333] p-3">
    <div className="flex items-center justify-between mb-1">
      <span className="text-xs text-[#777] font-mono uppercase">{label}</span>
      {icon && <span className="text-[#aaa]">{icon}</span>}
    </div>
    <div className="flex items-end gap-2">
      <span className="text-lg font-mono font-bold text-white tabular-nums">{value}</span>
      {trend && (
        <span className={`text-xs font-mono ${trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-[#aaa]'}`}>
          {trend === 'up' ? '▲' : trend === 'down' ? '▼' : '●'}
        </span>
      )}
    </div>
    {subValue && <span className="text-xs text-[#777] font-mono">{subValue}</span>}
  </div>
);

export const MainDashboard: React.FC = () => {
  const news = useAppStore(state => state.news);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const data = [];
    for (let i = 0; i < 60; i++) {
      data.push({
        time: `${14 - Math.floor(i / 10)}:${(59 - (i % 10) * 6).toString().padStart(2, '0')}`,
        price: 78 + Math.sin(i * 0.3) * 0.5 + Math.random() * 0.3,
      });
    }
    setChartData(data);
  }, []);

  const formatNumber = (num: number, decimals: number = 2) => num.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  const formatCurrency = (num: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num);

  return (
    <>
        {/* Left Sidebar - System Health */}
        <aside className="col-span-2 space-y-4 overflow-y-auto">
          <div className="bg-[#111] border border-[#333] p-3">
            <h3 className="text-xs font-bold text-[#aaa] mb-3 flex items-center gap-2">
              <Server className="w-4 h-4" />
              SYSTEM HEALTH
            </h3>
            <div className="space-y-2">
              {[
                { name: 'Data Feed', status: initialSystemHealth.dataFeed },
                { name: 'Execution', status: initialSystemHealth.executionEngine },
                { name: 'Risk Engine', status: initialSystemHealth.riskEngine },
                { name: 'Kafka Cluster', status: initialSystemHealth.kafkaCluster },
              ].map(item => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <span className="text-[#777]">{item.name}</span>
                  <StatusBadge status={item.status} />
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Center - Main Dashboard */}
        <section className="col-span-7 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-4 gap-2">
            <MetricCard label="Total Equity" value={formatCurrency(initialRiskMetrics.totalEquity)} trend="up" icon={<DollarSign className="w-4 h-4" />} />
            <MetricCard label="Daily P&L" value={`+${formatCurrency(initialRiskMetrics.dailyPnL)}`} trend="up" icon={<TrendingUp className="w-4 h-4" />} />
            <MetricCard label="Max Drawdown" value={`${initialRiskMetrics.maxDrawdown.toFixed(1)}%`} icon={<AlertTriangle className="w-4 h-4" />} />
            <MetricCard label="Sharpe Ratio" value={initialRiskMetrics.sharpeRatio.toFixed(2)} icon={<Activity className="w-4 h-4" />} />
          </div>

          <div className="bg-[#111] border border-[#333] p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#ccc] flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> WTI CRUDE OIL (CL=F)
              </h3>
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.3} />
                  <XAxis dataKey="time" stroke="#777" fontSize={10} tick={{ fontFamily: 'monospace' }} />
                  <YAxis stroke="#777" fontSize={10} domain={['auto', 'auto']} tick={{ fontFamily: 'monospace' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333', fontFamily: 'monospace' }} labelStyle={{ color: '#aaa' }} />
                  <Area type="monotone" dataKey="price" stroke="#10b981" fill="url(#priceGradient)" strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Right Sidebar - News Feed */}
        <aside className="col-span-3 space-y-4 overflow-y-auto">
          <div className="bg-[#111] border border-[#333]">
            <div className="flex items-center justify-between px-4 py-2 border-b border-[#333]">
              <h3 className="text-sm font-bold text-[#ccc] flex items-center gap-2">
                <Newspaper className="w-4 h-4" /> NEWS WIRE
              </h3>
            </div>
            <div className="p-3 space-y-2 max-h-96 overflow-y-auto">
              {news.map(n => (
                <div key={n.id} className="bg-black border border-[#444] p-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[#777]">{n.source}</span>
                    <StatusBadge status={n.urgency} />
                  </div>
                  <p className="text-xs text-white mb-1">{n.headline}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
    </>
  );
};
