import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import { useAppStore, Plane, NewsItem } from '../store';
import { ShieldAlert, Crosshair, Navigation, Activity } from 'lucide-react';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export const GeopoliticsMap: React.FC = () => {
  const planes = useAppStore((state) => state.planes);
  const news = useAppStore((state) => state.news);
  
  const [selectedEntity, setSelectedEntity] = useState<Plane | NewsItem | null>(null);

  // Extract recent conflict zones connected to news
  const conflictZones = news.filter(n => n.relatedGeo).slice(0, 50);

  return (
    <div className="w-full h-full bg-black relative border border-[#333] flex overflow-hidden">
      
      {/* HUD Overlay */}
      <div className="absolute top-4 left-4 z-10 bg-black/80 p-3 border border-[#444] pointer-events-none">
        <h3 className="text-sm font-bold text-[#ccc] font-mono flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-500" />
          GLOBAL TACTICAL OVERVIEW
        </h3>
        <div className="text-xs text-[#777] mt-1 font-mono">
          <p>SIGINT TARGETS: {planes.length} AIRCRAFT</p>
          <p>CONFLICT ZONES: {conflictZones.length} HOTSPOTS</p>
        </div>
      </div>

      {/* Main Map */}
      <div className="flex-1 h-full cursor-crosshair">
        <ComposableMap 
          projectionConfig={{ scale: 160 }}
          className="w-full h-full outline-none"
        >
          <ZoomableGroup center={[0, 20]} zoom={1} maxZoom={20}>
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#0a0a0a"
                    stroke="#222"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: { fill: "#1a1a1a", outline: "none" },
                      pressed: { outline: "none" },
                    }}
                  />
                ))
              }
            </Geographies>

            {/* Planes layer */}
            {planes.map((plane) => (
              <Marker 
                key={plane.id} 
                coordinates={plane.coordinates}
                onMouseEnter={() => setSelectedEntity(plane)}
                className="cursor-pointer outline-none"
              >
                {/* Increase hit area for easier hovering via transparent circle */}
                <circle r={5} fill="transparent" />
                <circle 
                  r={selectedEntity && 'callsign' in selectedEntity && selectedEntity.id === plane.id ? 2 : 1} 
                  fill={selectedEntity && 'callsign' in selectedEntity && selectedEntity.id === plane.id ? "#fff" : "#06b6d4"} 
                  className="opacity-80 transition-all" 
                />
              </Marker>
            ))}

            {/* Conflict zones layer */}
            {conflictZones.map((conflict, i) => (
              <Marker 
                key={`conflict-[${i}]-${conflict.id}`} 
                coordinates={conflict.relatedGeo!}
                onMouseEnter={() => setSelectedEntity(conflict)}
                className="cursor-pointer outline-none"
              >
                {/* Increase hit area */}
                <circle r={8} fill="transparent" />
                <circle r={4} fill="#ef4444" className="animate-pulse opacity-40" />
                <circle r={1.5} fill={selectedEntity && !('callsign' in selectedEntity) && selectedEntity.id === conflict.id ? "#fff" : "#ef4444"} />
              </Marker>
            ))}
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* Target Info Panel */}
      {selectedEntity && (
        <div className="w-80 bg-[#111] border-l border-[#333] flex flex-col shrink-0 z-20 shadow-2xl overflow-y-auto">
          <div className="px-4 py-3 border-b border-[#333] bg-black flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#ccc] flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-emerald-500" />
              TARGET ACQUIRED
            </h3>
            <button onClick={() => setSelectedEntity(null)} className="text-[#555] hover:text-white font-bold text-xs">CLOSE</button>
          </div>
          
          <div className="p-4 flex-1 space-y-4">
            {'callsign' in selectedEntity ? (
              // Plane Info
              <>
                <div>
                  <div className="text-xs text-[#777] font-bold mb-1">CALLSIGN / ID</div>
                  <div className="text-xl font-mono font-bold text-white tracking-widest">{selectedEntity.callsign || selectedEntity.id}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-[#777] mb-1">VELOCITY</div>
                    <div className="text-sm font-mono text-emerald-400">{(selectedEntity.velocity * 3.6).toFixed(0)} km/h</div>
                  </div>
                  <div>
                    <div className="text-xs text-[#777] mb-1">ALTITUDE</div>
                    <div className="text-sm font-mono text-emerald-400">{selectedEntity.altitude ? `${(selectedEntity.altitude).toFixed(0)}m` : 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-[#777] mb-1">HEADING</div>
                    <div className="text-sm font-mono text-emerald-400 flex items-center gap-1">
                      <Navigation className="w-3 h-3" style={{ transform: `rotate(${selectedEntity.true_track}deg)` }}/>
                      {selectedEntity.true_track?.toFixed(0)}°
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[#777] mb-1">ORIGIN</div>
                    <div className="text-sm font-mono text-emerald-400 truncate">{selectedEntity.origin_country || 'UNKNOWN'}</div>
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-[#777] font-bold mb-1">COORDINATES</div>
                  <div className="text-xs font-mono text-[#aaa]">
                    {selectedEntity.coordinates[1].toFixed(4)} N, {selectedEntity.coordinates[0].toFixed(4)} E
                  </div>
                </div>
              </>
            ) : (
              // Conflict Info
              <>
                <div className="bg-[#300] border border-red-500 p-2">
                  <div className="text-xs text-red-500 font-bold mb-1 flex items-center gap-1 blink">
                    <Activity className="w-3 h-3" /> THREAT DETECTED
                  </div>
                  <div className="text-sm font-bold text-white leading-tight mb-2">{selectedEntity.headline}</div>
                  {selectedEntity.description && (
                     <div className="text-xs text-[#ebb] line-clamp-3" dangerouslySetInnerHTML={{ __html: selectedEntity.description }} />
                  )}
                </div>
                
                <div>
                  <div className="text-xs text-[#777] font-bold mb-1">SOURCE INTEGRITY</div>
                  <div className="text-sm font-mono text-[#aaa]">{selectedEntity.source}</div>
                </div>
                
                <div>
                  <div className="text-xs text-[#777] font-bold mb-1">TIMESTAMP</div>
                  <div className="text-sm font-mono text-[#aaa]">{new Date(selectedEntity.timestamp).toLocaleString()}</div>
                </div>

                <div>
                  <div className="text-xs text-[#777] font-bold mb-1">SIGNAL GENERATION</div>
                  <div className="text-sm font-mono text-emerald-400">SHORT CRUDE (PROB: {(selectedEntity.impactScore * 100).toFixed(0)}%)</div>
                </div>
                
                <div>
                  <div className="text-xs text-[#777] font-bold mb-1">COORDINATES</div>
                  <div className="text-xs font-mono text-[#aaa]">
                    {selectedEntity.relatedGeo?.[1].toFixed(4)} N, {selectedEntity.relatedGeo?.[0].toFixed(4)} E
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
