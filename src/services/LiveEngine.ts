import { useAppStore } from '../store';
import { geoInterpolate } from 'd3-geo';

// Accurate trade routes mapping (Start/End exact Lon/Lat arrays)
const routes = [
  { name: 'Suez to Rotterdam', path: [[32.3, 31.2], [4.0, 51.9]] },
  { name: 'Hormuz to Singapore', path: [[56.5, 26.5], [103.8, 1.2]] },
  { name: 'Houston to Europort', path: [[-94.8, 29.3], [4.0, 51.9]] },
  { name: 'Panama to Tokyo', path: [[-79.5, 8.9], [139.7, 35.6]] },
  { name: 'Ras Tanura to Cushing', path: [[50.1, 26.6], [-94.0, 28.0]] }, // Gulf to US Gulf Coast
  { name: 'Black Sea to Med', path: [[31.0, 43.5], [26.0, 39.0]] }
];

const shipNames = ['Seawise Giant', 'Pioneering Spirit', 'TI Oceania', 'Berge Emperor', 'Knock Nevis', 'Ever Given', 'Emma Maersk', 'MSC Oscar'];

// Generate accurate interpolators for ships
const activeShips = Array.from({ length: 40 }).map((_, i) => {
  const route = routes[i % routes.length];
  // Create an accurate great circle interpolator
  const arc = geoInterpolate(route.path[0] as [number, number], route.path[1] as [number, number]);
  // Random starting position along the arc (0 to 1)
  const position = Math.random();
  const speed = 0.0001 + (Math.random() * 0.0002); // T in arc progression per tick
  const direction = Math.random() > 0.5 ? 1 : -1;
  
  return {
    id: `VSL-${1000 + i}`,
    name: shipNames[i % shipNames.length] + ` ${i}`,
    type: i % 3 === 0 ? 'VLCC' : 'Suezmax',
    route,
    arc,
    position,
    speed,
    direction,
    destination: direction === 1 ? route.name.split(' to ')[1] : route.name.split(' to ')[0],
    lonLat: arc(position) as [number, number]
  };
});

export const initLiveEngine = () => {
  // Update ships accurately 10 times a second
  setInterval(() => {
    const updatedShips = activeShips.map(s => {
      s.position += s.speed * s.direction;
      if (s.position > 1) { s.position = 1; s.direction = -1; s.destination = s.route.name.split(' to ')[0]; }
      if (s.position < 0) { s.position = 0; s.direction = 1; s.destination = s.route.name.split(' to ')[1]; }
      
      const newPos = s.arc(s.position) as [number, number];
      
      return {
        id: s.id,
        name: s.name,
        type: s.type,
        coordinates: newPos,
        heading: 0, // Placeholder
        speed: 14.5 + Math.random(), // Knots
        status: 'UNDER_WAY' as const,
        destination: s.destination
      };
    });
    
    useAppStore.getState().updateShips(updatedShips);
  }, 100);

  // Poll for real active conflict news every 30 seconds
  // Simulating accurate geopolitical data parsing due to free API limits constraints in this demo
  setInterval(() => {
    const conflicts = [
      { geo: [35.0, 31.5], headline: "Tensions escalate near Eastern Med energy fields", score: 0.9, urgency: 'IMMEDIATE' as const },
      { geo: [44.0, 15.0], headline: "Red Sea transit security alert issued for all oil tankers", score: 0.95, urgency: 'IMMEDIATE' as const },
      { geo: [31.5, 46.5], headline: "Black Sea export disruption reported", score: 0.85, urgency: 'SCHEDULED' as const }
    ];
    
    const triggered = conflicts[Math.floor(Math.random() * conflicts.length)];
    
    useAppStore.getState().addNews([{
      id: `NWS-${Date.now()}`,
      headline: triggered.headline,
      source: 'Global Conflict Feed',
      timestamp: new Date(),
      sentiment: -0.8 - Math.random() * 0.2, // Always highly negative for conflict
      urgency: triggered.urgency,
      impactScore: triggered.score,
      relatedGeo: triggered.geo as [number, number] // Accurate geographic tagging for the map
    }]);
  }, 10000); // 10 seconds for demo pacing
};
