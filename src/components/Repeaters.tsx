import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { TowerControl as Tower, Plus, Search, MapPin, Radio, Activity } from 'lucide-react';
import { Repeater } from '../types';

const SEED_REPEATERS: Repeater[] = [
  { id: '1', loc: 'R0 GANEKOGORTA', rx: '145.600', tx: '145.000', off: '-0.600', t: '123.0' },
  { id: '2', loc: 'R1 SOLLUBE', rx: '145.625', tx: '145.025', off: '-0.600', t: 'NONE' },
  { id: '3', loc: 'R2 LA GARBEA', rx: '145.650', tx: '145.050', off: '-0.600', t: '123.0' },
  { id: '4', loc: 'R3 PAGASARRI', rx: '145.675', tx: '145.075', off: '-0.600', t: '82.5' },
  { id: '5', loc: 'R4 VALLE DE MENA', rx: '145.700', tx: '145.100', off: '-0.600', t: '123.0' },
  { id: '6', loc: 'R5 EIBAR', rx: '145.725', tx: '145.125', off: '-0.600', t: '77.0' },
  { id: '7', loc: 'R6 MONTE OIZ', rx: '145.750', tx: '145.150', off: '-0.600', t: '82.5' },
  { id: '8', loc: 'R7 KARRANTZA', rx: '145.775', tx: '145.175', off: '-0.600', t: '123.0' },
  { id: '9', loc: 'U78 PAGASARRI', rx: '438.850', tx: '431.250', off: '-7.600', t: '123.0' },
  { id: '10', loc: 'U82 GANEKOGORTA', rx: '438.950', tx: '431.350', off: '-7.600', t: '123.0' },
  { id: '11', loc: 'U84 OIZ UHF', rx: '439.000', tx: '431.400', off: '-7.600', t: '82.5' },
  { id: '12', loc: 'U86 SOLLUBE UHF', rx: '439.050', tx: '431.450', off: '-7.600', t: '123.0' },
  { id: '13', loc: 'ED2ZAA DMR BILBAO', rx: '438.225', tx: '430.625', off: '-7.600', t: 'CC 1' },
  { id: '14', loc: 'ED2ZAB DMR SOLLUBE', rx: '438.525', tx: '430.925', off: '-7.600', t: 'CC 1' }
];

export default function Repeaters() {
  const [repeaters, setRepeaters] = useState<Repeater[]>(SEED_REPEATERS);
  const [search, setSearch] = useState('');

  const filtered = repeaters.filter(r => 
    r.loc.toLowerCase().includes(search.toLowerCase()) ||
    r.rx.includes(search)
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
            Repetidores <span className="text-accent">Bizkaia</span>
          </h1>
          <p className="text-muted text-sm font-mono uppercase tracking-widest mt-1">
            INFRAESTRUCTURA DE RED LOCAL • V-UHF
          </p>
        </div>
        <button className="flex items-center gap-2 bg-accent text-slate-950 px-6 py-3 rounded-xl font-medium hover:bg-opacity-90 transition-all shadow-lg shadow-accent/20">
          <Plus size={20} />
          AÑADIR REPETIDOR
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
        <input
          type="text"
          placeholder="BUSCAR POR UBICACIÓN O FRECUENCIA..."
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
                <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-muted">ID / Ubicación</th>
                <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-muted">RX (MHz)</th>
                <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-muted">TX (MHz)</th>
                <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-muted">Offset</th>
                <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-muted">Tono</th>
                <th className="px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-muted">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                        <MapPin size={14} />
                      </div>
                      <span className="text-white font-display font-bold tracking-tight uppercase">{r.loc}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-accent font-bold">{r.rx}</td>
                  <td className="px-6 py-4 font-mono text-muted">{r.tx}</td>
                  <td className="px-6 py-4 font-mono text-tertiary font-bold">{r.off}</td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-800 text-muted text-[10px] font-mono px-2 py-0.5 rounded uppercase tracking-widest">
                      {r.t}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-500 font-bold">TX OK</span>
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
