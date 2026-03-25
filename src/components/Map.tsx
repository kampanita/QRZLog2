import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { Sun, Zap, Layers, Clock } from 'lucide-react';
import { fetchLogs } from '../services/supabase';
import { sysLog } from '../services/syslog';

// Detailed coastline polygons [lon, lat] for equirectangular projection
const WORLD: [number, number][][] = [
  // Europe mainland
  [[-10,36],[-9,38],[-9,40],[-8,42],[-9,43],[-8,44],[-2,43],[0,43],[3,43],[5,43],[3,42],[0,41],[-1,39],[0,38],[-1,37],[-5,36],[-10,36]],
  // Iberia
  [[-10,36],[-7,37],[-6,37],[-5,36],[-2,37],[0,38],[-1,39],[0,41],[3,42],[3,43],[0,43],[-2,43],[-8,44],[-9,43],[-8,42],[-9,40],[-9,38],[-10,36]],
  // France-Germany-Poland
  [[-5,48],[-4,48],[-1,46],[2,46],[5,44],[7,44],[7,47],[6,49],[8,49],[8,48],[10,48],[12,47],[14,48],[15,49],[14,51],[15,54],[14,54],[10,54],[9,54],[7,54],[6,53],[4,51],[3,51],[2,51],[1,51],[0,50],[-1,49],[-2,48],[-5,48]],
  // Scandinavia
  [[5,58],[5,60],[6,62],[7,63],[11,64],[14,66],[15,67],[16,69],[18,70],[20,70],[22,70],[25,71],[27,70],[30,70],[30,67],[27,66],[25,65],[24,64],[22,63],[20,63],[18,62],[18,60],[17,59],[16,57],[13,56],[12,56],[11,58],[8,58],[5,58]],
  // British Isles
  [[-6,50],[-5,50],[-3,51],[0,51],[2,52],[2,53],[0,54],[-3,54],[-3,56],[-5,56],[-5,58],[-6,58],[-7,57],[-8,55],[-10,52],[-10,51],[-6,50]],
  [[-8,52],[-6,52],[-6,54],[-8,54],[-10,53],[-10,52],[-8,52]],
  // Italy
  [[7,44],[8,44],[10,44],[11,44],[12,42],[13,41],[15,40],[16,39],[16,38],[15,38],[13,38],[12,38],[12,37],[15,37],[15,36],[13,37],[11,37],[9,39],[7,44]],
  // Greece-Turkey
  [[20,40],[22,40],[24,38],[26,38],[26,40],[28,41],[29,41],[30,37],[28,37],[26,36],[24,35],[23,35],[22,37],[20,38],[20,40]],
  [[26,41],[28,41],[30,41],[33,42],[36,42],[36,37],[35,36],[33,36],[30,37],[28,37],[26,38],[26,41]],
  // Africa
  [[-17,15],[-17,21],[-13,24],[-10,28],[-5,30],[-2,35],[0,36],[5,36],[10,37],[11,33],[12,33],[15,30],[20,32],[25,32],[30,31],[33,30],[35,30],[37,28],[40,22],[42,18],[44,12],[48,8],[50,5],[50,2],[45,0],[42,-2],[40,-5],[40,-11],[35,-15],[33,-20],[30,-27],[28,-33],[27,-34],[22,-35],[18,-34],[15,-30],[12,-18],[10,-10],[10,-5],[8,5],[5,5],[3,6],[-5,5],[-8,5],[-13,10],[-17,12],[-17,15]],
  // Asia main
  [[30,35],[33,36],[35,36],[36,37],[36,42],[40,42],[42,42],[45,40],[50,38],[52,37],[55,25],[60,25],[62,22],[65,25],[68,24],[70,22],[72,22],[75,20],[77,15],[78,10],[80,8],[80,13],[82,17],[85,22],[88,22],[90,22],[92,20],[95,18],[98,16],[100,14],[102,10],[104,2],[104,8],[106,10],[108,12],[108,16],[110,18],[110,20],[108,22],[107,16],[105,10],[104,2],[103,2],[100,4],[97,6],[94,7],[93,16],[92,20],[90,22],[87,27],[85,28],[82,27],[80,28],[77,30],[75,35],[70,37],[65,40],[60,42],[55,45],[50,45],[40,42],[35,42],[33,42],[30,42],[30,35]],
  // Russia-Siberia
  [[30,60],[40,60],[50,55],[60,55],[70,58],[80,60],[90,60],[100,58],[110,55],[120,53],[130,50],[135,50],[140,45],[142,47],[145,50],[150,53],[155,55],[160,58],[165,60],[170,60],[175,63],[180,65],[180,70],[170,70],[160,69],[150,68],[140,65],[130,60],[120,58],[110,60],[100,65],[90,70],[80,70],[70,70],[60,68],[50,65],[40,65],[30,65],[30,60]],
  // India
  [[68,24],[70,22],[72,22],[75,15],[77,8],[80,8],[80,13],[78,15],[75,20],[72,22],[68,24]],
  // SE Asia
  [[98,16],[100,14],[102,10],[103,2],[104,2],[105,10],[107,16],[108,18],[108,22],[106,22],[104,16],[103,10],[102,5],[100,2],[100,8],[98,16]],
  // Japan
  [[130,31],[131,33],[132,34],[134,35],[136,35],[137,37],[138,38],[140,40],[141,42],[142,43],[141,45],[140,43],[139,38],[137,35],[135,34],[132,33],[130,31]],
  // North America
  [[-170,65],[-168,66],[-165,65],[-162,64],[-160,63],[-155,60],[-150,60],[-145,60],[-140,60],[-137,59],[-135,57],[-133,55],[-130,55],[-128,52],[-125,50],[-124,46],[-124,42],[-122,38],[-120,35],[-118,34],[-117,33],[-115,30],[-110,28],[-105,25],[-100,22],[-97,20],[-95,18],[-92,16],[-90,16],[-88,15],[-85,12],[-83,10],[-80,8],[-78,8],[-77,9],[-82,10],[-84,11],[-87,14],[-88,16],[-91,18],[-95,20],[-97,22],[-97,26],[-95,28],[-93,30],[-90,29],[-88,30],[-85,30],[-82,28],[-80,25],[-80,28],[-82,30],[-84,32],[-82,35],[-78,35],[-76,37],[-74,40],[-72,41],[-71,42],[-70,43],[-67,45],[-65,47],[-62,46],[-60,47],[-57,48],[-55,47],[-53,47],[-55,50],[-58,52],[-60,53],[-62,54],[-65,55],[-70,55],[-72,58],[-75,60],[-78,62],[-80,63],[-85,65],[-90,68],[-95,70],[-100,70],[-105,68],[-110,65],[-115,68],[-120,70],[-125,70],[-130,70],[-135,68],[-140,70],[-145,70],[-150,68],[-155,65],[-160,63],[-165,65],[-170,65]],
  // Central America
  [[-118,34],[-115,30],[-112,28],[-110,25],[-107,23],[-105,21],[-103,20],[-100,18],[-97,16],[-95,16],[-92,15],[-90,15],[-88,14],[-86,14],[-84,11],[-83,10],[-82,9],[-80,8],[-78,8],[-77,9],[-82,10],[-84,11],[-87,14],[-88,16],[-91,18],[-95,20],[-97,22],[-100,22],[-105,25],[-110,28],[-115,30],[-118,34]],
  // South America
  [[-80,8],[-78,6],[-75,5],[-70,5],[-68,6],[-65,5],[-60,5],[-55,3],[-50,0],[-48,-2],[-45,-3],[-42,-3],[-40,-5],[-38,-8],[-35,-10],[-35,-15],[-38,-18],[-40,-20],[-42,-23],[-43,-23],[-45,-25],[-48,-28],[-50,-30],[-52,-33],[-53,-34],[-55,-35],[-58,-38],[-62,-39],[-65,-42],[-67,-45],[-68,-47],[-68,-50],[-70,-52],[-72,-50],[-73,-47],[-75,-45],[-72,-42],[-70,-40],[-71,-35],[-71,-30],[-71,-25],[-70,-20],[-70,-15],[-75,-12],[-77,-10],[-78,-5],[-80,-2],[-80,2],[-78,5],[-80,8]],
  // Australia
  [[115,-35],[117,-35],[120,-35],[122,-34],[125,-33],[128,-32],[130,-30],[132,-28],[135,-25],[137,-22],[138,-18],[140,-15],[142,-12],[145,-15],[148,-18],[150,-22],[153,-25],[153,-28],[152,-32],[150,-35],[148,-38],[146,-39],[143,-39],[140,-38],[137,-36],[135,-35],[130,-33],[125,-33],[122,-34],[120,-35],[115,-35]],
  // New Zealand
  [[165,-47],[168,-47],[172,-44],[175,-42],[176,-39],[178,-37],[176,-37],[175,-39],[172,-42],[170,-44],[168,-46],[165,-47]],
  // Indonesia
  [[95,6],[100,2],[103,0],[105,-5],[107,-7],[110,-8],[115,-8],[118,-9],[120,-10],[125,-8],[130,-5],[135,-3],[140,-3],[140,-8],[135,-8],[130,-10],[125,-10],[120,-10],[115,-8],[110,-8],[107,-7],[105,-6],[103,-1],[100,0],[95,5],[95,6]],
  // Greenland
  [[-55,60],[-50,62],[-45,62],[-42,64],[-38,66],[-35,68],[-30,70],[-25,72],[-20,74],[-22,76],[-25,78],[-30,80],[-35,82],[-42,82],[-48,80],[-52,78],[-55,75],[-58,72],[-60,68],[-58,65],[-55,60]],
  // Iceland
  [[-25,64],[-22,64],[-18,65],[-14,66],[-14,65],[-18,63],[-22,63],[-25,64]],
  // Madagascar
  [[43,-12],[45,-14],[48,-18],[50,-22],[48,-25],[45,-25],[44,-22],[43,-18],[43,-15],[43,-12]],
  // Philippines
  [[117,7],[118,10],[120,12],[122,14],[124,15],[125,13],[124,10],[122,8],[120,7],[117,7]],
  // Korea
  [[126,34],[127,35],[128,36],[129,38],[128,39],[127,38],[126,37],[126,34]],
  // Taiwan
  [[120,22],[121,23],[122,25],[121,25],[120,24],[120,22]],
];

function locatorToLatLon(loc: string): [number, number] | null {
  if (!loc || loc.length < 4) return null;
  const L = loc.toUpperCase();
  const a = L.charCodeAt(0) - 65, b = L.charCodeAt(1) - 65;
  if (a < 0 || a > 17 || b < 0 || b > 17) return null;
  const n2 = parseInt(L[2]), n3 = parseInt(L[3]);
  if (isNaN(n2) || isNaN(n3)) return null;
  const lon = a * 20 - 180 + n2 * 2 + 1;
  const lat = b * 10 - 90 + n3 + 0.5;
  return [lat, lon];
}

function getSolarPosition() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const doy = Math.floor((now.getTime() - start.getTime()) / 86400000);
  const decl = -23.45 * Math.cos((2 * Math.PI / 365) * (doy + 10));
  const utcH = now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;
  const subSunLon = (12 - utcH) * 15;
  return { decl, subSunLon };
}

function isNightAt(lat: number, lon: number, decl: number, subSunLon: number): number {
  const latR = lat * Math.PI / 180;
  const declR = decl * Math.PI / 180;
  const ha = (lon - subSunLon) * Math.PI / 180;
  const sinAlt = Math.sin(latR) * Math.sin(declR) + Math.cos(latR) * Math.cos(declR) * Math.cos(ha);
  if (sinAlt > 0.1) return 0;
  if (sinAlt < -0.1) return 1;
  return 0.5 - sinAlt * 5;
}

export default function Map() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [solarData, setSolarData] = useState({ sfi: '--', sn: '--', a: '--', k: '--', muf: '--', xray: '--', conditions: [] as {band: string, status: string}[] });
  const [activeTab, setActiveTab] = useState<'map' | 'propagation' | 'stations'>('map');

  useEffect(() => {
    loadRecentLogs();
    fetchSolarData();
    const timer = setInterval(loadRecentLogs, 30000);
    const solarTimer = setInterval(fetchSolarData, 300000);
    return () => { clearInterval(timer); clearInterval(solarTimer); };
  }, []);

  async function fetchSolarData() {
    const SOLAR_URL = 'https://www.hamqsl.com/solarxml.php';
    const CACHE_KEY = 'qrzlog_solar_cache';
    const SB_URL = 'https://svcakitmimdhltwcmadd.supabase.co';

    try {
      const res = await fetch(`${SB_URL}/functions/v1/solar-proxy`);
      if (res.ok) {
        const json = await res.json();
        const parsed = parseSolarJson(json);
        if (parsed) {
          setSolarData(parsed);
          localStorage.setItem(CACHE_KEY, JSON.stringify({ ...parsed, ts: Date.now() }));
          sysLog(`Solar data OK via Edge Function`, 'success');
          return;
        }
      }
    } catch (e) {
      sysLog('Solar Edge Function failed, trying fallbacks...', 'warn');
    }

    const xmlStrategies: Array<{ name: string; fn: () => Promise<string | null> }> = [
      {
        name: 'allorigins',
        fn: async () => {
          const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(SOLAR_URL)}`);
          if (!res.ok) return null;
          const json = await res.json();
          return json?.contents || null;
        }
      },
      {
        name: 'corsproxy',
        fn: async () => {
          const res = await fetch(`https://corsproxy.io/?${encodeURIComponent(SOLAR_URL)}`);
          if (!res.ok) return null;
          return await res.text();
        }
      },
    ];

    for (const { name, fn } of xmlStrategies) {
      try {
        const xml = await fn();
        if (!xml || xml.length < 100 || !xml.includes('solardata')) continue;
        const parsed = parseSolarXml(xml);
        if (parsed) {
          setSolarData(parsed);
          localStorage.setItem(CACHE_KEY, JSON.stringify({ ...parsed, ts: Date.now() }));
          sysLog(`Solar data OK via ${name}`, 'success');
          return;
        }
      } catch (e) {
        sysLog(`Solar proxy ${name} failed`, 'warn');
      }
    }

    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const data = JSON.parse(cached);
        if (Date.now() - data.ts < 6 * 3600 * 1000) {
          const { ts, ...rest } = data;
          setSolarData(rest);
          sysLog('Solar data loaded from cache', 'warn');
          return;
        }
      }
    } catch {}
    sysLog('All solar data sources failed', 'error');
  }

  function parseSolarJson(json: any) {
    try {
      const sd = json?.solar?.solardata || json?.solardata || json;
      if (!sd) return null;
      const val = (key: string) => { const v = sd[key]; if (v == null) return '--'; return typeof v === 'string' ? v.trim() : String(v); };
      const conditions: {band: string, status: string}[] = [];
      const dayBands = ['80m-40m', '30m-20m', '17m-15m', '12m-10m'];
      const bands = sd.calculatedconditions?.band;
      if (Array.isArray(bands)) {
        dayBands.forEach((name, i) => {
          const status = typeof bands[i] === 'string' ? bands[i].trim() : (bands[i] || 'N/A');
          conditions.push({ band: name, status: String(status) });
        });
      }
      if (conditions.length === 0) dayBands.forEach(b => conditions.push({ band: b, status: 'N/A' }));
      return { sfi: val('solarflux'), sn: val('sunspots'), a: val('aindex'), k: val('kindex'), muf: val('muf') !== '--' ? val('muf') : val('calculatedmuf'), xray: val('xray'), conditions };
    } catch { return null; }
  }

  function parseSolarXml(xml: string) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');
    const solardata = doc.querySelector('solardata');
    if (!solardata) return null;
    const get = (tag: string) => solardata.querySelector(tag)?.textContent?.trim() || '--';
    const conditions: {band: string, status: string}[] = [];
    const dayNodes = solardata.querySelectorAll('calculatedconditions band[time="day"]');
    dayNodes.forEach((node) => {
      const name = node.getAttribute('name') || '';
      const status = node.textContent?.trim() || '';
      if (name && status) conditions.push({ band: name, status });
    });
    if (conditions.length === 0) ['80m-40m', '30m-20m', '17m-15m', '12m-10m'].forEach(b => conditions.push({ band: b, status: 'N/A' }));
    return { sfi: get('solarflux'), sn: get('sunspots'), a: get('aindex'), k: get('kindex'), muf: get('muf') !== '--' ? get('muf') : get('calculatedmuf'), xray: get('xray'), conditions };
  }

  async function loadRecentLogs() {
    try {
      const data = await fetchLogs();
      setLogs(data?.slice(0, 10) || []);
    } catch (e) {}
  }

  const drawMap = useCallback((canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    const { decl, subSunLon } = getSolarPosition();

    const lonToX = (lon: number) => ((lon + 180) / 360) * W;
    const latToY = (lat: number) => ((90 - lat) / 180) * H;

    // Ocean background
    ctx.fillStyle = '#0a1628';
    ctx.fillRect(0, 0, W, H);

    // Day/Night shading per-column
    const colStep = Math.max(1, Math.floor(W / 360));
    for (let px = 0; px < W; px += colStep) {
      const lon = (px / W) * 360 - 180;
      for (let py = 0; py < H; py += colStep) {
        const lat = 90 - (py / H) * 180;
        const night = isNightAt(lat, lon, decl, subSunLon);
        if (night > 0.02) {
          ctx.fillStyle = `rgba(0, 0, 20, ${night * 0.55})`;
          ctx.fillRect(px, py, colStep, colStep);
        }
      }
    }

    // Grid lines
    ctx.strokeStyle = 'rgba(14, 165, 233, 0.08)';
    ctx.lineWidth = 0.5;
    for (let lat = -60; lat <= 60; lat += 30) {
      ctx.beginPath(); ctx.moveTo(0, latToY(lat)); ctx.lineTo(W, latToY(lat)); ctx.stroke();
    }
    for (let lon = -150; lon <= 150; lon += 30) {
      ctx.beginPath(); ctx.moveTo(lonToX(lon), 0); ctx.lineTo(lonToX(lon), H); ctx.stroke();
    }
    // Equator
    ctx.strokeStyle = 'rgba(14, 165, 233, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, latToY(0)); ctx.lineTo(W, latToY(0)); ctx.stroke();

    // Coastlines — filled land + outline
    WORLD.forEach(poly => {
      if (poly.length < 3) return;
      ctx.beginPath();
      ctx.moveTo(lonToX(poly[0][0]), latToY(poly[0][1]));
      for (let i = 1; i < poly.length; i++) ctx.lineTo(lonToX(poly[i][0]), latToY(poly[i][1]));
      ctx.closePath();
      ctx.fillStyle = 'rgba(14, 165, 233, 0.08)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.5)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    });

    // Solar Terminator curve
    ctx.beginPath();
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 8;
    let first = true;
    for (let lon = -180; lon <= 180; lon += 1) {
      const declR = decl * Math.PI / 180;
      const ha = (lon - subSunLon) * Math.PI / 180;
      const termLat = Math.atan2(-Math.cos(ha), Math.tan(declR)) * 180 / Math.PI;
      const x = lonToX(lon); const y = latToY(termLat);
      if (first) { ctx.moveTo(x, y); first = false; } else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Grey line band
    for (const offset of [5, 10, 15]) {
      ctx.beginPath();
      ctx.strokeStyle = `rgba(251, 191, 36, ${0.08 - offset * 0.004})`;
      ctx.lineWidth = 1;
      let f = true;
      for (let lon = -180; lon <= 180; lon += 2) {
        const declR = decl * Math.PI / 180;
        const ha = (lon - subSunLon) * Math.PI / 180;
        const termLat = Math.atan2(-Math.cos(ha), Math.tan(declR)) * 180 / Math.PI + offset;
        const x = lonToX(lon); const y = latToY(termLat);
        if (f) { ctx.moveTo(x, y); f = false; } else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.beginPath(); f = true;
      for (let lon = -180; lon <= 180; lon += 2) {
        const declR = decl * Math.PI / 180;
        const ha = (lon - subSunLon) * Math.PI / 180;
        const termLat = Math.atan2(-Math.cos(ha), Math.tan(declR)) * 180 / Math.PI - offset;
        const x = lonToX(lon); const y = latToY(termLat);
        if (f) { ctx.moveTo(x, y); f = false; } else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Sub-solar point
    const sunX = lonToX(subSunLon); const sunY = latToY(decl);
    const sunGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 20);
    sunGrad.addColorStop(0, 'rgba(251, 191, 36, 0.8)');
    sunGrad.addColorStop(0.5, 'rgba(251, 191, 36, 0.2)');
    sunGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath(); ctx.arc(sunX, sunY, 20, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath(); ctx.arc(sunX, sunY, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(251, 191, 36, 0.7)';
    ctx.font = `${Math.max(9, W * 0.012)}px monospace`;
    ctx.textAlign = 'left';
    ctx.fillText('\u2600 SUB-SOLAR', sunX + 10, sunY - 8);

    // Home QTH EA2
    const homeLat = 43.3, homeLon = -2.9;
    const hx = lonToX(homeLon), hy = latToY(homeLat);
    const pulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.003);
    ctx.strokeStyle = `rgba(16, 185, 129, ${0.3 + pulse * 0.4})`;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(hx, hy, 6 + pulse * 4, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#10b981';
    ctx.beginPath(); ctx.arc(hx, hy, 4, 0, Math.PI * 2); ctx.fill();
    ctx.font = `bold ${Math.max(10, W * 0.014)}px monospace`;
    ctx.fillText('EA2 QTH', hx + 10, hy - 6);
    ctx.font = `${Math.max(8, W * 0.01)}px monospace`;
    ctx.fillStyle = 'rgba(16, 185, 129, 0.6)';
    ctx.fillText('IN83', hx + 10, hy + 8);

    // QSO contacts
    logs.forEach(log => {
      const ll = locatorToLatLon(log.locator || log.grid || '');
      if (!ll) return;
      const [lat, lon] = ll;
      const qx = lonToX(lon), qy = latToY(lat);
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.moveTo(hx, hy); ctx.lineTo(qx, qy); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath(); ctx.arc(qx, qy, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
      ctx.beginPath(); ctx.arc(qx, qy, 6, 0, Math.PI * 2); ctx.fill();
      if (log.callsign) {
        ctx.fillStyle = 'rgba(245, 158, 11, 0.8)';
        ctx.font = `${Math.max(8, W * 0.01)}px monospace`;
        ctx.textAlign = 'left';
        ctx.fillText(log.callsign, qx + 6, qy - 4);
      }
    });

    // Grey Line label
    ctx.fillStyle = 'rgba(251, 191, 36, 0.5)';
    ctx.font = `${Math.max(9, W * 0.011)}px monospace`;
    ctx.textAlign = 'left';
    const glLon = subSunLon + 90 > 180 ? subSunLon + 90 - 360 : subSunLon + 90;
    const declR2 = decl * Math.PI / 180;
    const haGL = (glLon - subSunLon) * Math.PI / 180;
    const glLat = Math.atan2(-Math.cos(haGL), Math.tan(declR2)) * 180 / Math.PI;
    ctx.fillText('GREY LINE', lonToX(glLon) + 5, latToY(glLat) - 5);

    // UTC Clock overlay
    const now = new Date();
    const utcStr = now.toISOString().slice(11, 19) + ' UTC';
    const clockW = Math.max(130, W * 0.15);
    const clockH = Math.max(28, H * 0.06);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(W - clockW - 10, 10, clockW, clockH);
    ctx.strokeStyle = 'rgba(14, 165, 233, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(W - clockW - 10, 10, clockW, clockH);
    ctx.fillStyle = '#0ea5e9';
    ctx.font = `bold ${Math.max(12, W * 0.016)}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(utcStr, W - clockW / 2 - 10, 10 + clockH * 0.7);
    ctx.textAlign = 'left';

    // DAY / NIGHT labels
    const dayLabelLat = decl > 0 ? decl + 20 : decl - 20;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.font = `bold ${Math.max(14, W * 0.025)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('DAY', lonToX(subSunLon), latToY(dayLabelLat));
    const nightLon = subSunLon > 0 ? subSunLon - 180 : subSunLon + 180;
    ctx.fillText('NIGHT', lonToX(nightLon), latToY(-dayLabelLat));
    ctx.textAlign = 'left';
  }, [logs]);

  useEffect(() => {
    if (!canvasRef.current || activeTab !== 'map') return;
    const canvas = canvasRef.current;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      drawMap(canvas);
    };

    resize();
    const redrawTimer = setInterval(() => drawMap(canvas), 30000);
    window.addEventListener('resize', resize);
    return () => { clearInterval(redrawTimer); window.removeEventListener('resize', resize); };
  }, [activeTab, drawMap]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col space-y-6 px-6 relative">
      <div className="flex justify-between items-end pt-4">
        <div>
          <h1 className="text-4xl font-display font-medium tracking-tight text-white italic">
            Visual <span className="text-accent">Spectrum Map</span>
          </h1>
          <p className="text-muted text-sm font-mono uppercase tracking-widest mt-1">
            TERMINAL DE PROPAGACIÓN Y GEOFÍSICA IONOSFÉRICA
          </p>
        </div>
        <div className="flex gap-2 bg-slate-900/50 p-1 rounded-xl border border-white/5">
          {(['map', 'propagation', 'stations'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-[10px] font-mono uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-accent text-slate-950 font-bold' : 'text-muted hover:text-white'}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 glass-panel relative overflow-hidden flex flex-col md:flex-row gap-6 p-6">
        <div className="w-full md:w-80 space-y-6 shrink-0 z-10">
          <div className="glass-panel p-6 border-l-4 border-amber-500 bg-amber-500/5">
            <div className="flex items-center gap-3 mb-4">
              <Sun className="text-amber-500 animate-pulse" size={20} />
              <h3 className="font-display text-white uppercase tracking-tight font-bold">Resumen Solar</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-[9px] text-muted font-mono uppercase">SFI (H8)</p><p className="text-2xl font-display text-white">{solarData.sfi}</p></div>
              <div><p className="text-[9px] text-muted font-mono uppercase">Sunspots</p><p className="text-2xl font-display text-white">{solarData.sn}</p></div>
              <div><p className="text-[9px] text-muted font-mono uppercase">A-Index</p><p className={`text-2xl font-display ${Number(solarData.a) <= 10 ? 'text-emerald-400' : Number(solarData.a) <= 30 ? 'text-amber-400' : 'text-rose-400'}`}>{solarData.a}</p></div>
              <div><p className="text-[9px] text-muted font-mono uppercase">K-Index</p><p className={`text-2xl font-display ${Number(solarData.k) <= 3 ? 'text-emerald-400' : Number(solarData.k) <= 5 ? 'text-amber-400' : 'text-rose-400'}`}>{solarData.k}</p></div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-4">
              <div><p className="text-[9px] text-muted font-mono uppercase">X-Ray</p><p className="text-lg font-display text-amber-400">{solarData.xray}</p></div>
              <div><p className="text-[9px] text-muted font-mono uppercase">MUF</p><p className="text-lg font-display text-cyan-400">{solarData.muf} MHz</p></div>
            </div>
          </div>

          <div className="glass-panel p-6 space-y-4 border-l-4 border-cyan-500">
            <h3 className="text-xs font-display text-white uppercase tracking-widest mb-2 flex items-center gap-2">
              <Layers size={14} className="text-cyan-500" /> Band Conditions (Day)
            </h3>
            {(solarData.conditions.length > 0 ? solarData.conditions : [
              { band: '80m-40m', status: 'N/A' }, { band: '30m-20m', status: 'N/A' },
              { band: '17m-15m', status: 'N/A' }, { band: '12m-10m', status: 'N/A' },
            ]).map(item => {
              const c = item.status.toLowerCase().includes('good') ? 'text-emerald-400' :
                        item.status.toLowerCase().includes('fair') ? 'text-amber-400' :
                        item.status.toLowerCase().includes('poor') ? 'text-rose-400' :
                        item.status.toLowerCase().includes('excell') ? 'text-cyan-400 font-bold' : 'text-muted';
              return (
                <div key={item.band} className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-[10px] font-mono text-muted">{item.band}</span>
                  <span className={`text-[10px] font-mono font-bold ${c}`}>{item.status.toUpperCase()}</span>
                </div>
              );
            })}
          </div>

          <div className="glass-panel p-4 border-l-4 border-emerald-500 bg-emerald-500/5">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={14} className="text-emerald-400" />
              <span className="text-[9px] font-mono text-muted uppercase">QSOs plotted</span>
            </div>
            <p className="text-2xl font-display text-white">{logs.filter(l => locatorToLatLon(l.locator || l.grid || '')).length}</p>
            <p className="text-[9px] font-mono text-muted">of {logs.length} recent contacts</p>
          </div>
        </div>

        <div className="flex-1 relative min-h-[400px]">
          {activeTab === 'map' ? (
            <canvas ref={canvasRef} className="w-full h-full rounded-xl" style={{ imageRendering: 'auto' }} />
          ) : activeTab === 'propagation' ? (
            <div className="h-full flex flex-col justify-center items-center text-center space-y-6">
              <div className="relative w-full max-w-lg aspect-video glass-panel p-8 border-t-2 border-accent flex flex-col justify-center">
                <Zap className="text-accent absolute -top-4 left-1/2 -translate-x-1/2" size={32} />
                <h2 className="text-2xl font-display text-white mb-2 italic">Ionospheric Analysis</h2>
                <p className="text-muted font-mono text-[10px] uppercase tracking-widest leading-relaxed">
                  Datos en tiempo real desde HamQSL.com<br/>
                  MUF (Maximum Usable Freq): <span className="text-accent">{solarData.muf} MHz</span><br/>
                  X-Ray Flux: <span className="text-amber-500">{solarData.xray}</span><br/>
                  Solar Flux Index: <span className="text-accent">{solarData.sfi}</span><br/>
                  K-Index: <span className={`${Number(solarData.k) <= 3 ? 'text-emerald-400' : 'text-rose-400'}`}>{solarData.k} {Number(solarData.k) <= 3 ? '(Estable)' : '(Perturbado)'}</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full overflow-y-auto pr-4 scrollbar-hide space-y-3">
              <h3 className="text-[10px] font-mono text-muted uppercase tracking-[0.3em] mb-4">Ultimos Reportes de Banda</h3>
              {logs.map((L) => (
                <div key={L.id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-4 group hover:border-accent/50 transition-all">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-[10px] font-bold">
                    {L.band?.replace('MHz','').trim()}
                  </div>
                  <div>
                    <p className="text-white font-bold font-display uppercase tracking-tighter">{L.callsign}</p>
                    <p className="text-muted text-[10px] font-mono">{new Date(L.created_at).toLocaleTimeString()}</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-accent font-display text-xl">{L.rst}</p>
                    <p className="text-[9px] text-muted font-mono uppercase">SIGNAL</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="absolute bottom-10 right-10">
          <div className="glass-panel p-4 flex items-center gap-4 bg-slate-950/80">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[9px] font-mono text-white opacity-80 uppercase tracking-widest">Global Synch Active</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

