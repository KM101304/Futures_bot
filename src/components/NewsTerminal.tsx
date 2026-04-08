import React from 'react';
import { useAppStore } from '../store';
import { Newspaper, AlertTriangle } from 'lucide-react';

export const NewsTerminal: React.FC = () => {
  const news = useAppStore(state => state.news);

  return (
    <div className="col-span-12 h-full flex flex-col bg-black border border-[#333]">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#333] bg-[#111] shrink-0">
        <h2 className="text-lg font-bold text-white flex items-center gap-3">
          <Newspaper className="w-5 h-5 text-blue-500" />
          GLOBAL NEWS TERMINAL
        </h2>
        <div className="text-xs text-[#777] font-mono">
          {news.length} RAW FEEDS SYNCED
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {news.length === 0 ? (
          <div className="text-center text-[#555] font-mono py-12">FETCHING LIVE FEEDS...</div>
        ) : (
          news.map(item => (
            <div key={item.id} className={`p-4 border ${item.urgency === 'IMMEDIATE' ? 'border-red-500 bg-[#300]' : 'border-[#444] bg-[#111]'} transition-colors`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[#aaa]">{item.source}</span>
                  <span className="text-xs text-[#777] font-mono">{new Date(item.timestamp).toLocaleString()}</span>
                  <span className="text-xs text-[#555] font-mono border-l border-[#444] pl-3">ID: {item.id}</span>
                </div>
                {item.urgency === 'IMMEDIATE' && (
                  <span className="flex items-center gap-1 text-xs font-bold text-red-500 border border-red-500 px-2 py-0.5 blink">
                    <AlertTriangle className="w-3 h-3" /> CRITICAL ALERT
                  </span>
                )}
              </div>
              
              <h3 className={`text-xl font-bold mb-2 ${item.urgency === 'IMMEDIATE' ? 'text-white' : 'text-[#ccc]'}`}>
                {item.headline}
              </h3>
              
              {item.description && (
                <div 
                  className="text-sm text-[#888] font-mono mb-4 leading-relaxed" 
                  dangerouslySetInnerHTML={{ __html: item.description }} 
                />
              )}
              
              <div className="flex items-center justify-between border-t border-[#333] pt-3 mt-3">
                <div className="flex gap-4">
                  <div className="text-xs font-mono">
                    <span className="text-[#555]">SENTIMENT: </span>
                    <span className={item.sentiment < 0 ? 'text-red-500 font-bold' : 'text-emerald-500 font-bold'}>
                      {item.sentiment.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-xs font-mono">
                    <span className="text-[#555]">MKT IMPACT PROB: </span>
                    <span className="text-amber-500 font-bold">{(item.impactScore * 100).toFixed(1)}%</span>
                  </div>
                  {item.relatedGeo && (
                    <div className="text-xs font-mono">
                      <span className="text-[#555]">GEO LOC: </span>
                      <span className="text-white">{item.relatedGeo[1].toFixed(2)}N, {item.relatedGeo[0].toFixed(2)}E</span>
                    </div>
                  )}
                </div>
                {item.url && (
                  <a href={item.url} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase">
                    [Access Raw Feed]
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
