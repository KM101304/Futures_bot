import { useAppStore } from '../store';

// Helper to deduce coordinate based on text footprint
const deduceGeo = (text: string): [number, number] => {
  const t = text.toLowerCase();
  if (t.includes('ukraine') || t.includes('kyiv') || t.includes('russia')) return [35.0, 48.0]; // Eastern Europe
  if (t.includes('gaza') || t.includes('israel') || t.includes('hamas')) return [34.7, 31.5]; // Levant
  if (t.includes('sudan') || t.includes('khartoum')) return [32.5, 15.6]; // Sudan
  if (t.includes('taiwan') || t.includes('china') || t.includes('beijing')) return [120.9, 23.6]; // South China Sea
  if (t.includes('korea')) return [127.0, 37.5]; // Korean Peninsula
  if (t.includes('yemen') || t.includes('houthi') || t.includes('red sea')) return [45.0, 15.5]; // Yemen
  // Random global scatter for general conflicts
  return [(Math.random() * 360 - 180), (Math.random() * 140 - 70)]; 
};

export const initLiveEngine = () => {
  setInterval(() => {
    useAppStore.getState().updateMarketPrices(true);
  }, 1000);

  // 1. REAL DATA: OpenSky Network Flights (GLOBAL Scope)
  const fetchFlights = async () => {
    try {
      // Removing bounding box to get global data. 
      const res = await fetch('https://opensky-network.org/api/states/all');
      if (!res.ok) throw new Error('OpenSky rate limited or unavailable');
      const data = await res.json();
      
      const states = data.states || [];
      // Pick 800 random global flights to prevent map overload but show global scale
      const shuffled = states.sort(() => 0.5 - Math.random());
      const planes = shuffled.slice(0, 800).map((s: any) => {
        if (s[5] !== null && s[6] !== null) {
          return {
            id: s[0],
            callsign: s[1]?.trim() || 'UNKNOWN',
            origin_country: s[2],
            coordinates: [s[5], s[6]] as [number, number],
            velocity: s[9] || 0,
            true_track: s[10] || 0,
            altitude: s[13] || 0
          };
        }
        return null;
      }).filter(Boolean);

      useAppStore.getState().updatePlanes(planes as any);
    } catch (err) {
      console.warn("OpenSky API error:", err);
    }
  };

  // 2. REAL DATA: Global World News via RSS-to-JSON
  const fetchNews = async () => {
    try {
      const res = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://feeds.bbci.co.uk/news/world/rss.xml');
      const data = await res.json();
      
      if (data.items && data.items.length > 0) {
        const newsItems = data.items.map((item: any, idx: number) => {
          const content = `${item.title} ${item.description}`.toLowerCase();
          const isConflict = /war|strike|army|military|tension|bomb|missile|attack|clash|rebel|troop/i.test(content);
          
          return {
            id: `BBC-${Date.now()}-${idx}`,
            headline: item.title,
            description: item.description,
            url: item.link,
            source: 'BBC Live Wire',
            timestamp: new Date(item.pubDate),
            sentiment: isConflict ? -0.9 : 0.2,
            urgency: isConflict ? 'IMMEDIATE' : 'SCHEDULED',
            impactScore: isConflict ? 0.95 : 0.3,
            relatedGeo: isConflict ? deduceGeo(content) : undefined
          };
        });

        useAppStore.getState().addNews(newsItems);
      }
    } catch (err) {
      console.warn("News RSS Fetch error:", err);
    }
  };

  fetchFlights();
  fetchNews();

  setInterval(fetchFlights, 20000);
  setInterval(fetchNews, 60000);
};
