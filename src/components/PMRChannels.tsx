import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mic, Plus, Search, Radio, Activity } from 'lucide-react';
import { PMRChannel } from '../types';
import { fetchTable } from '../services/supabase';
import { SEED_DATA } from '../services/seedData';

export default function PMRChannels() {
  const [channels, setChannels] = useState<PMRChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const data = await fetchTable('db_pmr');
      setChannels(data || SEED_DATA.pmr);
    } catch (error) {
      console.error('Error fetching PMR:', error);
      setChannels(SEED_DATA.pmr);
    } finally {
      setLoading(false);
    }
  }

  const filtered = channels.filter(c => 
    c.c.includes(search) ||
    c.f.includes(search) ||
    c.u.toLowerCase().includes(search.toLowerCase())
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
            Canales <span className="text-emerald-500">PMR446</span>
          </h1>
          <p className="text-muted text-sm font-mono uppercase tracking-widest mt-1">
            USO LIBRE • NFM MODULACIÓN • SIN LICENCIA
          </p>
        </div>
        <button className="flex items-center gap-2 bg-emerald-500 text-slate-950 px-6 py-3 rounded-xl font-medium hover:bg-opacity-90 transition-all shadow-lg shadow-emerald-500/20">
          <Plus size={20} />
          AÑADIR CANAL
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
        <input
          type="text"
          placeholder="BUSCAR POR CANAL, FRECUENCIA O USO..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white font-mono focus:outline-none focus:border-emerald-500 transition-colors"
        />
      </div>

      <div className="glass-panel overflow-hidden border-none shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-muted">Canal</th>
                <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-muted">Frecuencia (MHz)</th>
                <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-muted">Modo</th>
                <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-muted">Potencia</th>
                <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-muted">Uso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <Mic size={14} />
                      </div>
                      <span className="text-white font-display font-bold tracking-tight uppercase">CH {c.c}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-emerald-500 font-bold">{c.f}</td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-800 text-muted text-[10px] font-mono px-2 py-0.5 rounded uppercase tracking-widest">
                      {c.m}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-muted text-xs uppercase tracking-widest">{c.p}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-mono uppercase tracking-widest font-bold ${c.u === 'EMERGENCIA' ? 'text-rose-500' : 'text-muted'}`}>
                      {c.u}
                    </span>
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
