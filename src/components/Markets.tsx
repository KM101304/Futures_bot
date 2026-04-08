import React from 'react';
import { useAppStore } from '../store';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import { TradingTicket } from './TradingTicket';

export const Markets: React.FC = () => {
  const marketData = useAppStore(state => state.marketData);

  const formatCurrency = (num: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(num);

  return (
    <div className="col-span-12 grid grid-cols-12 gap-4 h-full">
      <div className="col-span-9 bg-black border border-[#333] flex flex-col h-full">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#333] bg-[#111] shrink-0">
          <h2 className="text-lg font-bold text-white flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-emerald-500" />
            MARKETS SCANNER
          </h2>
          <div className="text-xs text-[#777] font-mono">
            {marketData.length} ACTIVE PAIRS
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <table className="w-full text-left font-mono">
            <thead>
              <tr className="text-[#777] text-xs border-b border-[#444]">
                <th className="pb-3 px-4">TICKER</th>
                <th className="pb-3 px-4 text-right">PRICE (USD)</th>
                <th className="pb-3 px-4 text-center">TREND</th>
              </tr>
            </thead>
            <tbody>
              {marketData.map(m => {
                // A very pseudo trend calculation just for visual activity
                const trend = Math.random() > 0.5 ? 'up' : 'down';
                return (
                  <tr key={m.symbol} className="border-b border-[#222] hover:bg-[#111]">
                    <td className="py-4 px-4">
                      <div className="font-bold text-lg text-white">{m.symbol}</div>
                      <div className="text-xs text-[#777]">{m.name}</div>
                    </td>
                    <td className="py-4 px-4 text-right text-lg text-amber-500">
                      {formatCurrency(m.price)}
                    </td>
                    <td className="py-4 px-4 flex justify-center">
                      {trend === 'up' ? <TrendingUp className="w-5 h-5 text-emerald-500" /> : <TrendingDown className="w-5 h-5 text-red-500" />}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="col-span-3 h-full">
        <TradingTicket />
      </div>
    </div>
  );
};
