import React from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { useAppStore } from '../store';
import { ShieldAlert, Ship } from 'lucide-react';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export const GeopoliticsMap: React.FC = () => {
  const ships = useAppStore((state) => state.ships);
  const news = useAppStore((state) => state.news);

  // Extract recent conflict zones connected to news
  const conflictZones = news.filter(n => n.relatedGeo).slice(0, 5);

  return (
    <div className="w-full h-full bg-black relative border border-[#333]">
      <div className="absolute top-4 left-4 z-10 bg-black/80 p-3 border border-[#444]">
        <h3 className="text-sm font-bold text-gray-300 font-mono flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-500" />
          GLOBAL TACTICAL OVERVIEW
        </h3>
        <div className="text-xs text-gray-500 mt-1 font-mono">
          <p>ACTIVE TANKERS: {ships.length}</p>
          <p>CONFLICT ZONES: {conflictZones.length}</p>
        </div>
      </div>
      
      <ComposableMap 
        projectionConfig={{ scale: 140 }}
        className="w-full h-full outline-none"
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#111"
                stroke="#333"
                strokeWidth={0.5}
                style={{
                  default: { outline: "none" },
                  hover: { fill: "#222", outline: "none" },
                  pressed: { outline: "none" },
                }}
              />
            ))
          }
        </Geographies>

        {/* Render Accurate Shipping Routes & Ships */}
        {ships.map((ship) => (
          <Marker key={ship.id} coordinates={ship.coordinates}>
             {/* Neon cyan oil tanker */}
            <circle r={2.5} fill="#06b6d4" className="opacity-80" />
            <text
              textAnchor="middle"
              y={-8}
              style={{ fontFamily: 'monospace', fontSize: "6px", fill: "#06b6d4", opacity: 0.7 }}
            >
              {ship.id}
            </text>
          </Marker>
        ))}

        {/* Render Red Hot Conflict Zones */}
        {conflictZones.map((conflict, i) => (
          <Marker key={`conflict-${i}`} coordinates={conflict.relatedGeo!}>
            <circle r={10} fill="#ef4444" className="animate-ping opacity-30" />
            <circle r={4} fill="#ef4444" />
            <text
              textAnchor="middle"
              y={12}
              style={{ fontFamily: 'monospace', fontSize: "6px", fill: "#ef4444" }}
            >
              {conflict.urgency}
            </text>
          </Marker>
        ))}
      </ComposableMap>
    </div>
  );
};
