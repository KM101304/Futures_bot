import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Shield, Zap } from 'lucide-react';

export const TradingTicket: React.FC = () => {
  const [symbol, setSymbol] = useState('CL=F');
  const [size, setSize] = useState(1);
  const marketData = useAppStore(state => state.marketData);
  const executeTrade = useAppStore(state => state.executeTrade);
  const positions = useAppStore(state => state.positions);

  const currentPrice = marketData.find(m => m.symbol === symbol)?.price || 0;

  const handleExecute = (direction: 'LONG' | 'SHORT') => {
    executeTrade(symbol, direction, size, currentPrice);
  };

  const formatCurrency = (num: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(num);

  return (
    <div className="bg-black border border-[#333] flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#333] bg-[#111]">
        <h3 className="text-sm font-bold text-[#ccc] flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          RAPIER EXECUTION ENGINE
        </h3>
      </div>
      
      <div className="p-4 space-y-4 flex-1">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[#777] font-bold">ASSET TICKER</label>
          <select 
            className="bg-[#111] border border-[#444] text-white p-2 font-mono outline-none focus:border-emerald-500"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
          >
            {marketData.map(m => (
              <option key={m.symbol} value={m.symbol}>{m.symbol} ({m.name})</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-[#777] font-bold">POSITION SIZE (LOTS)</label>
          <input 
            type="number" 
            min="1"
            className="bg-[#111] border border-[#444] text-white p-2 font-mono outline-none focus:border-amber-500"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
          />
        </div>

        <div className="bg-[#111] border border-[#333] p-3 text-center">
          <div className="text-xs text-[#777] mb-1">MKT PRICE</div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums blink">
            {formatCurrency(currentPrice)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4 max-w-full">
          <button 
            onClick={() => handleExecute('LONG')}
            className="bg-emerald-500 text-black font-bold font-mono py-3 hover:bg-emerald-400 active:bg-emerald-600 transition-colors"
          >
            PUNCH BUY
          </button>
          <button 
            onClick={() => handleExecute('SHORT')}
            className="bg-red-500 text-black font-bold font-mono py-3 hover:bg-red-400 active:bg-red-600 transition-colors"
          >
            STRIKE SELL
          </button>
        </div>
      </div>

      <div className="border-t border-[#333] bg-[#111]">
        <div className="px-4 py-2 border-b border-[#333] flex justify-between items-center">
          <h3 className="text-sm font-bold text-[#ccc] flex items-center gap-2">
            <Shield className="w-4 h-4" /> ACTIVE BOOK
          </h3>
          <span className="text-xs text-[#777]">{positions.length} OPEN</span>
        </div>
        <div className="p-2 space-y-2 max-h-48 overflow-y-auto">
          {positions.map(p => (
            <div key={p.id} className="bg-black border border-[#444] p-2 flex justify-between items-center text-xs">
              <div>
                <div className="font-bold text-white flex gap-2">
                  <span className={p.direction === 'LONG' ? 'text-emerald-500' : 'text-red-500'}>{p.direction}</span>
                  {p.symbol}
                </div>
                <div className="text-[#777]">Entry: {formatCurrency(p.entryPrice)}</div>
              </div>
              <div className="text-right">
                <div className="text-[#aaa]">Sz: {p.size}</div>
                <div className={`font-bold tabular-nums ${p.pnl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {p.pnl >= 0 ? '+' : ''}{formatCurrency(p.pnl)}
                </div>
              </div>
            </div>
          ))}
          {positions.length === 0 && <div className="text-center text-[#555] py-4">NO ACTIVE POSITIONS</div>}
        </div>
      </div>
    </div>
  );
};
