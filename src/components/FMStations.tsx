import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Music, Plus, Search, Radio, Signal } from 'lucide-react';
import { FMStation } from '../types';
import { fetchTable } from '../services/supabase';
import { SEED_DATA } from '../services/seedData';

export default function FMStations() {
  const [stations, setStations] = useState<FMStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const data = await fetchTable('db_fm');
      setStations(data || SEED_DATA.fm);
    } catch (error) {
      console.error('Error fetching FM:', error);
      setStations(SEED_DATA.fm);
    } finally {
      setLoading(false);
    }
  }

  const filtered = stations.filter(s => 
    s.e.toLowerCase().includes(search.toLowerCase()) ||
    s.f.includes(search) ||
    s.z.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6 px-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-display font-medium tracking-tight text-white italic">
            FM <span className="text-indigo-500">Comercial</span>
          </h1>
          <p className="text-muted text-sm font-mono uppercase tracking-widest mt-1">
            ESTACIONES LOCALES Y REGIONALES • WFM
          </p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-500 text-slate-950 px-6 py-3 rounded-xl font-medium hover:bg-opacity-90 transition-all shadow-lg shadow-indigo-500/20">
          <Plus size={20} />
          AÑADIR EMISORA
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
        <input
          type="text"
          placeholder="BUSCAR POR EMISORA, FRECUENCIA O ZONA..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white font-mono focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      <div className="glass-panel overflow-hidden border-none shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-muted">Emisora</th>
                <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-muted">Freq (MHz)</th>
                <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-muted">Zona</th>
                <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-muted">Señal Est.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                        <Music size={14} />
                      </div>
                      <span className="text-white font-display font-bold tracking-tight uppercase">{s.e}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-indigo-500 font-bold">{s.f}</td>
                  <td className="px-6 py-4 text-muted text-xs font-mono uppercase tracking-widest">{s.z}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Signal size={12} className="text-emerald-500" />
                      <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-500 font-bold">{s.s}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
