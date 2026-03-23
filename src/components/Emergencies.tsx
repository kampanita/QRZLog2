import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { LifeBuoy, Plus, Search, Plane, AlertTriangle, Radio } from 'lucide-react';
import { EmergencyFreq } from '../types';
import { fetchTable } from '../services/supabase';
import { SEED_DATA } from '../services/seedData';

export default function Emergencies() {
  const [freqs, setFreqs] = useState<EmergencyFreq[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const data = await fetchTable('db_emerg');
      setFreqs(data || SEED_DATA.emerg);
    } catch (error) {
      console.error('Error fetching Emergencies:', error);
      setFreqs(SEED_DATA.emerg);
    } finally {
      setLoading(false);
    }
  }

  const filtered = freqs.filter(f => 
    f.s.toLowerCase().includes(search.toLowerCase()) ||
    f.f.includes(search) ||
    f.n.toLowerCase().includes(search.toLowerCase())
  );

  const emerg = filtered.filter(f => f.type === 'EMERG');
  const air = filtered.filter(f => f.type === 'AIR');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-12 px-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-display font-medium tracking-tight text-white italic">
            Frecuencias <span className="text-rose-500">Críticas</span>
          </h1>
          <p className="text-muted text-sm font-mono uppercase tracking-widest mt-1">
            RED DE EMERGENCIAS • AUXILIO • BANDA AÉREA
          </p>
        </div>
        <button className="flex items-center gap-2 bg-rose-500 text-slate-950 px-6 py-3 rounded-xl font-medium hover:bg-opacity-90 transition-all shadow-lg shadow-rose-500/20">
          <Plus size={20} />
          AÑADIR FRECUENCIA
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
        <input
          type="text"
          placeholder="BUSCAR POR SERVICIO, FRECUENCIA O NOTAS..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white font-mono focus:outline-none focus:border-rose-500 transition-colors"
        />
      </div>

      {/* Emergencies Table */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-2">
          <AlertTriangle className="text-rose-500" size={20} />
          <h2 className="text-xl font-display text-white uppercase tracking-tight">Emergencias & Auxilio</h2>
        </div>
        <div className="glass-panel overflow-hidden border-none shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/5">
                  <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-muted">Servicio</th>
                  <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-muted">Frecuencia</th>
                  <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-muted">Modo</th>
                  <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-muted">Notas</th>
                  <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-muted">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {emerg.map((f) => (
                  <tr key={f.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500">
                          <LifeBuoy size={14} />
                        </div>
                        <span className="text-white font-display font-bold tracking-tight uppercase">{f.s}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-rose-500 font-bold">{f.f}</td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-800 text-muted text-[10px] font-mono px-2 py-0.5 rounded uppercase tracking-widest">
                        {f.m}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted text-xs font-mono uppercase tracking-widest">{f.n}</td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-rose-500 font-bold">{f.tx}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Air Band Table */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-2">
          <Plane className="text-sky-500" size={20} />
          <h2 className="text-xl font-display text-white uppercase tracking-tight">Banda Aérea (AM)</h2>
        </div>
        <div className="glass-panel overflow-hidden border-none shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/5">
                  <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-muted">Servicio</th>
                  <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-muted">Frecuencia</th>
                  <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-muted">Modo</th>
                  <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-muted">Función</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {air.map((f) => (
                  <tr key={f.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-500">
                          <Plane size={14} />
                        </div>
                        <span className="text-white font-display font-bold tracking-tight uppercase">{f.s}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-sky-500 font-bold">{f.f}</td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-800 text-muted text-[10px] font-mono px-2 py-0.5 rounded uppercase tracking-widest">
                        {f.m}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted text-xs font-mono uppercase tracking-widest">{f.n}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
