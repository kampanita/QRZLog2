import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as THREE from 'three';
import { MapPin, Globe, Radio, Activity, Sun, Zap, Info, Layers } from 'lucide-react';
import { fetchLogs } from '../services/supabase';

export default function Map() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [solarData, setSolarData] = useState({ sfi: '--', sn: '--', a: '--', k: '--', muf: '--', xray: '--', conditions: [] as {band: string, status: string}[] });
  const [activeTab, setActiveTab] = useState<'globe' | 'propagation' | 'stations'>('globe');

  useEffect(() => {
    loadRecentLogs();
    fetchSolarData();
    const timer = setInterval(loadRecentLogs, 30000);
    const solarTimer = setInterval(fetchSolarData, 300000);
    return () => { clearInterval(timer); clearInterval(solarTimer); };
  }, []);

  async function fetchSolarData() {
    try {
      const res = await fetch('https://api.allorigins.win/get?url=' + encodeURIComponent('https://www.hamqsl.com/solarxml.php'));
      const json = await res.json();
      if (json.contents) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(json.contents, 'text/xml');
        const solardata = doc.querySelector('solardata');
        if (solardata) {
          const get = (tag: string) => solardata.querySelector(tag)?.textContent || '--';
          const conditions: {band: string, status: string}[] = [];

          const bandTags = ['80m-40m', '30m-20m', '17m-15m', '12m-10m', '6m'];
          const dayNodes = solardata.querySelectorAll('calculatedconditions band[time="day"]');
          dayNodes.forEach((node) => {
            const name = node.getAttribute('name') || '';
            const status = node.textContent || '';
            if (name && status) conditions.push({ band: name, status });
          });

          if (conditions.length === 0) {
            bandTags.forEach(b => conditions.push({ band: b, status: 'N/A' }));
          }

          setSolarData({
            sfi: get('solarflux'),
            sn: get('sunspots'),
            a: get('aindex'),
            k: get('kindex'),
            muf: get('muf') || get('calculatedmuf') || '--',
            xray: get('xray') || '--',
            conditions
          });
        }
      }
    } catch (e) {
      console.error('Solar data fetch failed:', e);
    }
  }

  async function loadRecentLogs() {
    try {
      const data = await fetchLogs();
      setLogs(data?.slice(0, 10) || []);
    } catch (e) {}
  }

  useEffect(() => {
    if (!canvasRef.current || activeTab !== 'globe') return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, canvasRef.current.clientWidth / canvasRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true, antialias: true });
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // Main Sphere
    const geometry = new THREE.SphereGeometry(5, 64, 64);
    const material = new THREE.MeshPhongMaterial({ 
      color: 0x1e293b,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.2,
      shininess: 50,
      transparent: true,
      opacity: 0.9
    });
    const globe = new THREE.Mesh(geometry, material);
    globeGroup.add(globe);

    // Wireframe Overlay
    const wireGeom = new THREE.SphereGeometry(5.05, 40, 40);
    const wireMat = new THREE.MeshBasicMaterial({ 
      color: 0x0ea5e9, 
      wireframe: true, 
      transparent: true, 
      opacity: 0.1 
    });
    const wireGlobe = new THREE.Mesh(wireGeom, wireMat);
    globeGroup.add(wireGlobe);

    // Atmosphere Glow
    const atmosGeom = new THREE.SphereGeometry(6, 64, 64);
    const atmosMat = new THREE.MeshBasicMaterial({
      color: 0x0ea5e9,
      transparent: true,
      opacity: 0.05,
      side: THREE.BackSide
    });
    const atmos = new THREE.Mesh(atmosGeom, atmosMat);
    globeGroup.add(atmos);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(15, 15, 15);
    scene.add(pointLight);

    camera.position.z = 15;

    const animate = () => {
      const frame = requestAnimationFrame(animate);
      globeGroup.rotation.y += 0.001;
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!canvasRef.current) return;
      camera.aspect = canvasRef.current.clientWidth / canvasRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeTab]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full flex flex-col space-y-6 px-6 relative"
    >
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
          {(['globe', 'propagation', 'stations'] as const).map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-[10px] font-mono uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-accent text-slate-950 font-bold' : 'text-muted hover:text-white'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 glass-panel relative overflow-hidden flex flex-col md:flex-row gap-6 p-6">
        
        {/* Left Side: Stats */}
        <div className="w-full md:w-80 space-y-6 shrink-0 z-10">
          <div className="glass-panel p-6 border-l-4 border-amber-500 bg-amber-500/5">
            <div className="flex items-center gap-3 mb-4">
              <Sun className="text-amber-500 animate-pulse" size={20} />
              <h3 className="font-display text-white uppercase tracking-tight font-bold">Resumen Solar</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[9px] text-muted font-mono uppercase">SFI (H8)</p>
                <p className="text-2xl font-display text-white">{solarData.sfi}</p>
              </div>
              <div>
                <p className="text-[9px] text-muted font-mono uppercase">Sunspots</p>
                <p className="text-2xl font-display text-white">{solarData.sn}</p>
              </div>
              <div>
                <p className="text-[9px] text-muted font-mono uppercase">A-Index</p>
                <p className={`text-2xl font-display ${Number(solarData.a) <= 10 ? 'text-emerald-400' : Number(solarData.a) <= 30 ? 'text-amber-400' : 'text-rose-400'}`}>{solarData.a}</p>
              </div>
              <div>
                <p className="text-[9px] text-muted font-mono uppercase">K-Index</p>
                <p className={`text-2xl font-display ${Number(solarData.k) <= 3 ? 'text-emerald-400' : Number(solarData.k) <= 5 ? 'text-amber-400' : 'text-rose-400'}`}>{solarData.k}</p>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 space-y-4 border-l-4 border-cyan-500">
            <h3 className="text-xs font-display text-white uppercase tracking-widest mb-2 flex items-center gap-2">
              <Layers size={14} className="text-cyan-500" />
              Band Conditions
            </h3>
            {(solarData.conditions.length > 0 ? solarData.conditions : [
              { band: '80m-40m', status: 'N/A' },
              { band: '30m-20m', status: 'N/A' },
              { band: '17m-15m', status: 'N/A' },
              { band: '12m-10m', status: 'N/A' },
              { band: '6m-VHF', status: 'N/A' }
            ]).map(item => {
              const c = item.status.toLowerCase().includes('good') ? 'text-emerald-400' : 
                        item.status.toLowerCase().includes('fair') ? 'text-amber-400' : 
                        item.status.toLowerCase().includes('poor') ? 'text-rose-400' : 
                        item.status.toLowerCase().includes('excell') ? 'text-cyan-400 font-bold' : 'text-muted';
              return (
              <div key={item.band} className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-[10px] font-mono text-muted">{item.band}</span>
                <span className={`text-[10px] font-mono ${c}`}>{item.status.toUpperCase()}</span>
              </div>
              );
            })}
          </div>
        </div>

        {/* Center: Globe View */}
        <div className="flex-1 relative min-h-[400px]">
          {activeTab === 'globe' ? (
            <canvas ref={canvasRef} className="w-full h-full cursor-move" />
          ) : activeTab === 'propagation' ? (
            <div className="h-full flex flex-col justify-center items-center text-center space-y-6">
               <div className="relative w-full max-w-lg aspect-video glass-panel p-8 border-t-2 border-accent flex flex-col justify-center">
                 <Zap className="text-accent absolute -top-4 left-1/2 -translate-x-1/2" size={32} />
                 <h2 className="text-2xl font-display text-white mb-2 italic">Ionospheric Analysis</h2>
                 <p className="text-muted font-mono text-[10px] uppercase tracking-widest leading-relaxed">
                   Datos en tiempo real desde HamQSL.com <br/>
                   MUF (Maximum Usable Freq): <span className="text-accent">{solarData.muf} MHz</span> <br/>
                   X-Ray Flux: <span className="text-amber-500">{solarData.xray}</span> <br/>
                   Solar Flux Index: <span className="text-accent">{solarData.sfi}</span> <br/>
                   K-Index: <span className={`${Number(solarData.k) <= 3 ? 'text-emerald-400' : 'text-rose-400'}`}>{solarData.k} {Number(solarData.k) <= 3 ? '(Estable)' : '(Perturbado)'}</span>
                 </p>
               </div>
            </div>
          ) : (
            <div className="h-full overflow-y-auto pr-4 scrollbar-hide space-y-3">
              <h3 className="text-[10px] font-mono text-muted uppercase tracking-[0.3em] mb-4">Ultimos Reportes de Banda</h3>
              {logs.map((L, i) => (
                <div key={L.id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-4 group hover:border-accent/50 transition-all">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-[10px] font-bold">
                    {L.band.replace('MHz','').trim()}
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

        {/* Legend / Status Overlay */}
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
