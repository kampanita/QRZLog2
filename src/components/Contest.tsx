import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, Plus, Search, MapPin, Radio, Activity, Save, Trash2, FileOutput } from 'lucide-react';
import { ContestQSO } from '../types';
import { fetchContestLogs, saveContestLog, deleteContestLog } from '../services/supabase';
import { exportToEDI } from '../utils/export';

export default function Contest() {
  const [logs, setLogs] = useState<ContestQSO[]>([]);
  const [contestId, setContestId] = useState(localStorage.getItem('current_contest_id') || 'V-UHF-CONTEST');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    callsign: '',
    band: '144 MHz',
    s_rst: '59',
    s_nr: '001',
    r_rst: '59',
    r_nr: '',
    r_loc: '',
    my_call: 'EA2FKT',
    my_loc: 'IN83NE'
  });

  useEffect(() => {
    loadContestLogs();
  }, [contestId]);

  async function loadContestLogs() {
    try {
      setLoading(true);
      const data = await fetchContestLogs(contestId);
      setLogs(data || []);
      
      // Update next serial number
      if (data && data.length > 0) {
        const maxSerial = Math.max(...data.map(q => parseInt(q.s_nr)));
        setFormData(prev => ({ ...prev, s_nr: (maxSerial + 1).toString().padStart(3, '0') }));
      } else {
        setFormData(prev => ({ ...prev, s_nr: '001' }));
      }
    } catch (error) {
      console.error('Error loading contest logs:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const qso = {
        ...formData,
        contest_id: contestId,
        date: new Date().toISOString().slice(2, 10).replace(/-/g, ''),
        time: new Date().toLocaleTimeString('es-ES', { hour12: false }).replace(/:/g, '').slice(0, 4),
        created_at: new Date().toISOString()
      };
      const saved = await saveContestLog(qso);
      setLogs([saved, ...logs]);
      setFormData(prev => ({
        ...prev,
        callsign: '',
        r_nr: '',
        r_loc: '',
        s_nr: (parseInt(prev.s_nr) + 1).toString().padStart(3, '0')
      }));
    } catch (error) {
      console.error('Error saving contest log:', error);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8 px-6 pb-24"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-display font-medium tracking-tight text-white italic">
            Modo <span className="text-amber-500">Concurso</span>
          </h1>
          <p className="text-muted text-sm font-mono uppercase tracking-widest mt-1">
            OPERACIÓN V-UHF • GESTIÓN DE SERIES Y LOCATORS
          </p>
        </div>
        <div className="flex gap-2">
          <input 
            type="text" 
            value={contestId}
            onChange={(e) => setContestId(e.target.value)}
            className="bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2 text-white font-mono text-xs uppercase focus:border-amber-500 outline-none"
          />
          <button 
            onClick={() => exportToEDI(logs, contestId, formData.my_call, formData.my_loc, formData.band)}
            className="flex items-center gap-2 bg-amber-500 text-slate-950 px-6 py-3 rounded-xl font-medium hover:bg-opacity-90 transition-all shadow-lg shadow-amber-500/20"
          >
            <FileOutput size={18} />
            EXPORTAR EDI
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel p-8 space-y-6 border-t-2 border-amber-500">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-6 space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-muted">Indicativo Corresponsal</label>
            <input
              type="text"
              required
              value={formData.callsign}
              onChange={(e) => setFormData({ ...formData, callsign: e.target.value.toUpperCase() })}
              placeholder="EA2XXX"
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-4 text-2xl font-display text-white focus:outline-none focus:border-amber-500 uppercase"
            />
          </div>
          <div className="md:col-span-6 space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-muted">Banda</label>
            <select
              value={formData.band}
              onChange={(e) => setFormData({ ...formData, band: e.target.value })}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-4 text-white font-mono h-[64px] focus:outline-none focus:border-amber-500"
            >
              <option>144 MHz</option>
              <option>432 MHz</option>
              <option>1296 MHz</option>
            </select>
          </div>

          <div className="md:col-span-3 space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-amber-500">Sent RST</label>
            <input
              type="text"
              value={formData.s_rst}
              onChange={(e) => setFormData({ ...formData, s_rst: e.target.value })}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-4 text-xl font-display text-white text-center focus:outline-none focus:border-amber-500"
            />
          </div>
          <div className="md:col-span-3 space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-amber-500">Sent Serial</label>
            <input
              type="text"
              readOnly
              value={formData.s_nr}
              className="w-full bg-slate-800/50 border border-white/5 rounded-xl p-4 text-xl font-display text-muted text-center focus:outline-none"
            />
          </div>
          <div className="md:col-span-3 space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-accent">Rcvd RST</label>
            <input
              type="text"
              value={formData.r_rst}
              onChange={(e) => setFormData({ ...formData, r_rst: e.target.value })}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-4 text-xl font-display text-white text-center focus:outline-none focus:border-amber-500"
            />
          </div>
          <div className="md:col-span-3 space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-accent">Rcvd Serial</label>
            <input
              type="text"
              required
              value={formData.r_nr}
              onChange={(e) => setFormData({ ...formData, r_nr: e.target.value })}
              placeholder="000"
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-4 text-xl font-display text-white text-center focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="md:col-span-6 space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-accent">Rcvd Locator</label>
            <input
              type="text"
              required
              value={formData.r_loc}
              onChange={(e) => setFormData({ ...formData, r_loc: e.target.value.toUpperCase() })}
              placeholder="IN83XX"
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-4 text-xl font-display text-white focus:outline-none focus:border-amber-500 uppercase"
            />
          </div>
          <div className="md:col-span-6 flex items-end">
            <button
              type="submit"
              className="w-full bg-amber-600 text-slate-950 py-4 rounded-xl font-display font-bold text-lg uppercase tracking-widest hover:bg-amber-500 transition-all shadow-xl shadow-amber-900/20 flex items-center justify-center gap-3"
            >
              <Save size={24} />
              REGISTRAR QSO CONCURSO
            </button>
          </div>
        </div>
      </form>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <Trophy className="text-amber-500" size={20} />
            <h2 className="text-xl font-display text-white uppercase tracking-tight">QSOs Concurso</h2>
          </div>
          <span className="text-[10px] font-mono text-muted uppercase tracking-widest">{logs.length} CONTACTOS</span>
        </div>
        
        <div className="space-y-[2px]">
          {logs.map((q) => (
            <div key={q.id} className="bg-slate-900/40 hover:bg-slate-800/60 transition-colors px-6 py-4 flex items-center justify-between group border-b border-white/5">
              <div className="flex items-center gap-6">
                <div className="text-center min-w-[60px]">
                  <p className="text-xs font-mono text-muted uppercase mb-1">Serial</p>
                  <p className="text-xl font-display text-amber-500">{q.s_nr}</p>
                </div>
                <div>
                  <h3 className="text-xl font-display text-white tracking-tight uppercase">{q.callsign}</h3>
                  <p className="text-muted text-[10px] font-mono uppercase tracking-widest">{q.r_loc} • {q.band}</p>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-xs font-mono text-muted uppercase mb-1">Rcvd S/R</p>
                  <p className="text-lg font-display text-accent">{q.r_rst} / {q.r_nr}</p>
                </div>
                <button 
                  onClick={() => deleteContestLog(q.id).then(() => setLogs(logs.filter(l => l.id !== q.id)))}
                  className="p-2 text-muted hover:text-rose-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
