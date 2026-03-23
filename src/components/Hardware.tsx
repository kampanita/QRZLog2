import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Cpu, Plus, Search, Zap, Activity } from 'lucide-react';
import { HardwareRange } from '../types';
import { fetchTable } from '../services/supabase';
import { SEED_DATA } from '../services/seedData';

export default function Hardware() {
  const [ranges, setRanges] = useState<HardwareRange[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const data = await fetchTable('db_hardware');
      setRanges(data || SEED_DATA.hardware);
    } catch (error) {
      console.error('Error fetching Hardware:', error);
      setRanges(SEED_DATA.hardware);
    } finally {
      setLoading(false);
    }
  }

  const filtered = ranges.filter(r => 
    r.s.toLowerCase().includes(search.toLowerCase()) ||
    r.r.includes(search) ||
    r.u.toLowerCase().includes(search.toLowerCase())
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
            Espectro <span className="text-accent">Tidradio H8</span>
          </h1>
          <p className="text-muted text-sm font-mono uppercase tracking-widest mt-1">
            IARU REGIÓN 1 • RANGOS DE OPERACIÓN HARDWARE
          </p>
        </div>
        <button className="flex items-center gap-2 bg-accent text-slate-950 px-6 py-3 rounded-xl font-medium hover:bg-opacity-90 transition-all shadow-lg shadow-accent/20">
          <Plus size={20} />
          AÑADIR RANGO
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
        <input
          type="text"
          placeholder="BUSCAR POR SUB-BANDA, RANGO O USO..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white font-mono focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      <div className="glass-panel overflow-hidden border-none shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-muted">Rango (MHz)</th>
                <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-muted">Sub-Banda</th>
                <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-muted">Uso / Notas</th>
                <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-muted">Modo</th>
                <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-muted">TX</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 font-mono text-white font-bold">{r.r}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                        <Zap size={14} />
                      </div>
                      <span className="text-accent font-display font-bold tracking-tight uppercase">{r.s}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted text-xs font-mono uppercase tracking-widest italic">{r.u}</td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-800 text-muted text-[10px] font-mono px-2 py-0.5 rounded uppercase tracking-widest">
                      {r.m}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-mono uppercase tracking-widest font-bold ${r.tx === 'TX OK' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {r.tx}
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
