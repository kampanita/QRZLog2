import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Plus, Search, MapPin, Radio, Activity, Save, Trash2, FileOutput, Loader2, MapPinned, RotateCcw } from 'lucide-react';
import { ContestQSO } from '../types';
import { fetchContestLogs, saveContestLog, deleteContestLog, fetchTable, saveToTable, deleteFromTable } from '../services/supabase';
import { exportToEDI } from '../utils/export';

export default function Contest() {
  const [logs, setLogs] = useState<ContestQSO[]>([]);
  const [contests, setContests] = useState<any[]>([]);
  const [contestId, setContestId] = useState(localStorage.getItem('current_contest_id') || 'V-UHF-CONTEST');
  const [loading, setLoading] = useState(false);
  const [geoQuery, setGeoQuery] = useState('');
  const [geoResults, setGeoResults] = useState<any[]>([]);
  const [isSearchingGeo, setIsSearchingGeo] = useState(false);
  
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
    loadContests();
    loadContestLogs();
  }, [contestId]);

  async function loadContests() {
    try {
      const data = await fetchTable('db_contests');
      setContests(data || []);
    } catch (e) {}
  }

  async function loadContestLogs() {
    try {
      setLoading(true);
      const data = await fetchContestLogs(contestId);
      setLogs(data || []);
      
      if (data && data.length > 0) {
        const maxSerial = Math.max(...data.map(q => parseInt(q.s_nr) || 0));
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

  async function handleGeoSearch() {
    if (!geoQuery) return;
    setIsSearchingGeo(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(geoQuery)}&countrycodes=es&limit=3`);
      const data = await res.json();
      setGeoResults(data);
    } catch (e) {
      console.error('Geo search failed');
    } finally {
      setIsSearchingGeo(false);
    }
  }

  function latLonToQTH(lat: number, lon: number) {
    let lonOff = lon + 180; let latOff = lat + 90;
    const l1 = String.fromCharCode(65 + Math.floor(lonOff / 20));
    const l2 = String.fromCharCode(65 + Math.floor(latOff / 10));
    lonOff %= 20; latOff %= 10;
    const n1 = Math.floor(lonOff / 2).toString();
    const n2 = Math.floor(latOff / 1).toString();
    lonOff %= 2; latOff %= 1;
    const l3 = String.fromCharCode(97 + Math.floor(lonOff * 12));
    const l4 = String.fromCharCode(97 + Math.floor(latOff * 24));
    return (l1 + l2 + n1 + n2 + l3 + l4).toUpperCase();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Dupe check
    const isDup = logs.find(q => q.callsign === formData.callsign && q.band === formData.band);
    if (isDup && !confirm('¡AVISO! Ya tienes este indicativo en esta banda. ¿Duplicar?')) return;

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
      setGeoQuery('');
      setGeoResults([]);
    } catch (error) {
      console.error('Error saving contest log:', error);
    }
  }

  function selectContest(id: string) {
    setContestId(id);
    localStorage.setItem('current_contest_id', id);
  }

  async function handleNewContest() {
    const name = prompt('Identificador del Concurso (ej: V-UHF-FEBRERO-24):');
    if (!name || !name.trim()) return;
    const id = name.trim().toUpperCase().replace(/\s+/g, '-');
    try {
      await saveToTable('db_contests', { id, name: name.trim(), created_at: new Date().toISOString() });
      await loadContests();
      selectContest(id);
    } catch (e) {
      alert('Error creando concurso');
    }
  }

  async function handleDeleteContest() {
    if (!contestId) return alert('Selecciona un concurso primero.');
    if (!confirm(`¿Eliminar el concurso "${contestId}" y todos sus QSOs?`)) return;
    try {
      // Delete all contest logs for this contest
      const contestLogs = await fetchContestLogs(contestId);
      if (contestLogs) {
        for (const log of contestLogs) {
          await deleteContestLog(log.id);
        }
      }
      // Delete the contest itself
      await deleteFromTable('db_contests', contestId);
      await loadContests();
      setContestId('');
      setLogs([]);
      localStorage.removeItem('current_contest_id');
    } catch (e) {
      alert('Error eliminando concurso');
    }
  }

  function handleResetSerial() {
    if (confirm('¿Resetear serie a 001?')) {
      setFormData(prev => ({ ...prev, s_nr: '001' }));
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-8 px-6 pb-24 h-full flex flex-col overflow-y-auto scrollbar-hide"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4">
        <div>
          <h1 className="text-4xl font-display font-medium tracking-tight text-white italic">
            Contest <span className="text-amber-500">Terminal</span>
          </h1>
          <p className="text-muted text-sm font-mono uppercase tracking-widest mt-1">
            {contestId} • {logs.length} QSOs REGISTRADOS
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <select 
            value={contestId}
            onChange={(e) => selectContest(e.target.value)}
            className="bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-white font-mono text-xs uppercase focus:border-amber-500 outline-none"
          >
            <option value="">-- Seleccionar --</option>
            {contests.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button 
            onClick={handleNewContest}
            className="flex items-center gap-2 bg-amber-500 text-slate-950 px-4 py-2 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/10"
          >
            <Plus size={16} />
            NUEVO
          </button>
          <button 
            onClick={handleDeleteContest}
            className="flex items-center gap-2 bg-rose-600 text-white px-4 py-2 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-rose-500 transition-all"
          >
            <Trash2 size={16} />
          </button>
          <button 
            onClick={() => exportToEDI(logs, contestId, formData.my_call, formData.my_loc, formData.band)}
            className="flex items-center gap-2 bg-white/5 border border-white/10 text-muted px-4 py-2 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:text-white hover:border-white/20 transition-all"
          >
            <FileOutput size={16} />
            EDI
          </button>
          <button 
            onClick={handleResetSerial}
            className="flex items-center gap-2 bg-white/5 border border-white/10 text-muted px-4 py-2 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:text-rose-500 hover:border-rose-500/20 transition-all"
          >
            <RotateCcw size={16} />
            RESET
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-12">
          <form onSubmit={handleSubmit} className="glass-panel p-8 space-y-6 border-t-4 border-amber-500">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-8 space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-muted">Corresponsal</label>
                <div className="flex gap-4">
                  <input
                    type="text"
                    required
                    autoFocus
                    value={formData.callsign}
                    onChange={(e) => setFormData({ ...formData, callsign: e.target.value.toUpperCase() })}
                    placeholder="INDICATIVO"
                    className="flex-1 bg-slate-950 border border-white/10 rounded-xl p-4 text-3xl font-display text-white focus:border-amber-500 outline-none uppercase tracking-tighter"
                  />
                  <select
                    value={formData.band}
                    onChange={(e) => setFormData({ ...formData, band: e.target.value })}
                    className="bg-slate-950 border border-white/10 rounded-xl px-4 text-white font-mono text-xs focus:border-amber-500 outline-none"
                  >
                    <option>144 MHz</option>
                    <option>432 MHz</option>
                    <option>1.2 GHz</option>
                  </select>
                </div>
              </div>

              <div className="md:col-span-4 space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-muted">Búsqueda Locator (Nominatim)</label>
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="POBLACIÓN..."
                    value={geoQuery}
                    onChange={e => setGeoQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleGeoSearch())}
                    className="w-full bg-slate-900 border border-white/5 rounded-xl p-4 text-white text-xs font-mono focus:border-accent outline-none pr-12"
                  />
                  <button type="button" onClick={handleGeoSearch} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-accent">
                    {isSearchingGeo ? <Loader2 className="animate-spin" size={16}/> : <Search size={16} />}
                  </button>
                </div>
                <AnimatePresence>
                  {geoResults.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="absolute z-50 mt-2 w-[300px] glass-panel p-2 shadow-2xl space-y-1">
                      {geoResults.map((r, i) => {
                        const qth = latLonToQTH(parseFloat(r.lat), parseFloat(r.lon));
                        return (
                          <div 
                            key={i} 
                            onClick={() => { setFormData({...formData, r_loc: qth}); setGeoResults([]); setGeoQuery(r.display_name.split(',')[0]); }}
                            className="p-2 hover:bg-white/5 rounded cursor-pointer flex justify-between items-center"
                          >
                            <span className="text-[10px] text-white truncate max-w-[200px]">{r.display_name}</span>
                            <span className="text-[10px] font-mono font-bold text-amber-500">{qth}</span>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-mono text-muted uppercase">My RST</label>
                <input value={formData.s_rst} onChange={e => setFormData({ ...formData, s_rst: e.target.value })} className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white text-center font-display text-xl" />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-mono text-muted uppercase">My Nr</label>
                <input readOnly value={formData.s_nr} className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-muted text-center font-display text-xl" />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-mono text-accent uppercase">His RST</label>
                <input value={formData.r_rst} onChange={e => setFormData({ ...formData, r_rst: e.target.value })} className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white text-center font-display text-xl focus:border-amber-500 outline-none" />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-mono text-accent uppercase">His Nr</label>
                <input required placeholder="000" value={formData.r_nr} onChange={e => setFormData({ ...formData, r_nr: e.target.value.padStart(3,'0') })} className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white text-center font-display text-xl focus:border-amber-500 outline-none" />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-mono text-accent uppercase">His Loc</label>
                <input required placeholder="IN83XX" value={formData.r_loc} onChange={e => setFormData({ ...formData, r_loc: e.target.value.toUpperCase() })} className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white text-center font-display text-xl focus:border-amber-500 outline-none uppercase" />
              </div>
              
              <div className="md:col-span-2 flex items-end">
                <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 p-3 rounded-xl font-display font-bold text-lg transition-all shadow-lg shadow-amber-900/20">
                  SAVE
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Contest Config */}
        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-panel p-4 flex items-center gap-4">
            <div className="flex-1 space-y-1">
              <label className="text-[9px] font-mono uppercase tracking-widest text-muted">Indicativo Operación</label>
              <input 
                type="text"
                value={formData.my_call}
                onChange={e => setFormData({...formData, my_call: e.target.value.toUpperCase()})}
                className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-2 text-white text-xs font-mono uppercase focus:border-amber-500 outline-none"
              />
            </div>
          </div>
          <div className="glass-panel p-4 flex items-center gap-4">
            <div className="flex-1 space-y-1">
              <label className="text-[9px] font-mono uppercase tracking-widest text-muted">Mi Locator</label>
              <input 
                type="text"
                value={formData.my_loc}
                onChange={e => setFormData({...formData, my_loc: e.target.value.toUpperCase()})}
                className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-2 text-white text-xs font-mono uppercase focus:border-amber-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* List Column */}
        <div className="lg:col-span-12 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-white uppercase tracking-widest text-xs flex items-center gap-2">
              <Activity className="text-amber-500" size={14}/>
              LOGS DEL CONTEST activo
            </h3>
          </div>
          <div className="glass-panel overflow-hidden">
            <table className="table-tactical">
              <thead>
                <tr>
                  <th>Nr</th>
                  <th>Callsign</th>
                  <th>Freq</th>
                  <th>Rcvd</th>
                  <th>Locator</th>
                  <th className="text-right px-6">X</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((q, i) => (
                  <tr key={q.id || i}>
                    <td className="font-mono text-amber-500">{q.s_nr}</td>
                    <td className="font-display text-white font-bold">{q.callsign}</td>
                    <td className="text-[10px] font-mono text-muted">{q.band}</td>
                    <td className="font-mono text-accent">{q.r_rst} / {q.r_nr}</td>
                    <td className="font-mono text-white">{q.r_loc}</td>
                    <td className="text-right px-4">
                      <button onClick={() => deleteContestLog(q.id).then(loadContestLogs)} className="text-muted hover:text-rose-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </td>
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
