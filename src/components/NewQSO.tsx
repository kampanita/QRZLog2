import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Save, Clock, Radio, Antenna, Search, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { saveLog } from '../services/supabase';
import { searchQRZ } from '../services/qrz';
import { QSO } from '../types';

export default function NewQSO() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [history, setHistory] = useState<QSO[]>([]);
  
  const [formData, setFormData] = useState({
    callsign: '',
    rst: '59',
    band: '2m VHF (FM)',
    comment: '',
  });

  useEffect(() => {
    const backup = localStorage.getItem('basauri_logs_backup');
    if (backup) {
      setHistory(JSON.parse(backup).slice(0, 5));
    }
  }, []);

  async function handleQRZSearch() {
    if (!formData.callsign) return;
    setSearching(true);
    try {
      const info = await searchQRZ(formData.callsign);
      if (info) {
        setFormData(prev => ({
          ...prev,
          comment: prev.comment ? `${prev.comment}\n[QRZ] ${info}` : `[QRZ] ${info}`
        }));
      } else {
        window.open(`https://www.qrz.com/db/${formData.callsign}`, '_blank');
      }
    } catch (error) {
      console.error('QRZ Search Error:', error);
    } finally {
      setSearching(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const newLog = {
        ...formData,
        created_at: new Date().toISOString(),
      };
      await saveLog(newLog);
      navigate('/logs');
    } catch (error) {
      console.error('Error saving log:', error);
      alert('Error al guardar el log.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-4xl mx-auto space-y-6 pb-24"
    >
      <div className="px-6 pt-4">
        <h1 className="text-4xl font-display font-medium tracking-tight text-white italic">
          New <span className="text-accent">QSO Entry</span>
        </h1>
        <p className="text-muted text-sm font-mono uppercase tracking-widest mt-1">
          REGISTRO DE CONTACTO EN TIEMPO REAL
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-6">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="glass-panel p-8 space-y-6 border-t-2 border-accent">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-muted">Indicativo (Callsign)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formData.callsign}
                    onChange={(e) => setFormData({ ...formData, callsign: e.target.value.toUpperCase() })}
                    placeholder="EA2XXX"
                    className="flex-1 bg-slate-900/50 border border-white/10 rounded-xl p-4 text-2xl font-display text-white focus:outline-none focus:border-accent uppercase"
                  />
                  <button
                    type="button"
                    onClick={handleQRZSearch}
                    disabled={searching}
                    className="bg-slate-800 text-accent p-4 rounded-xl hover:bg-slate-700 transition-all border border-white/5 flex items-center justify-center min-w-[56px]"
                  >
                    {searching ? <Loader2 className="animate-spin" size={24} /> : <Search size={24} />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-muted">Signal (RST)</label>
                <input
                  type="text"
                  required
                  value={formData.rst}
                  onChange={(e) => setFormData({ ...formData, rst: e.target.value })}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-4 text-2xl font-display text-accent text-center focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase tracking-widest text-muted">Banda / Modo</label>
              <select
                value={formData.band}
                onChange={(e) => setFormData({ ...formData, band: e.target.value })}
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-4 text-white font-mono focus:outline-none focus:border-accent"
              >
                <option>2m VHF (FM)</option>
                <option>70cm UHF (FM)</option>
                <option>HF / DX</option>
                <option>PMR446</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase tracking-widest text-muted">Notas / Comentarios</label>
              <textarea
                rows={4}
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                placeholder="Ubicación, Operador, Condiciones..."
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-4 text-white font-mono focus:outline-none focus:border-accent resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-slate-950 py-5 rounded-xl font-display font-bold text-lg uppercase tracking-widest hover:bg-opacity-90 transition-all shadow-xl shadow-accent/20 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
              GUARDAR QSO
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="glass-panel p-6">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="text-accent" size={20} />
              <h3 className="font-display text-white uppercase tracking-tight">Last Logged</h3>
            </div>
            <div className="space-y-4">
              {history.length > 0 ? history.map((log, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                  <div>
                    <p className="text-white font-display font-bold">{log.callsign}</p>
                    <p className="text-[10px] text-muted font-mono uppercase">{log.band}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-accent font-display">{log.rst}</p>
                    <p className="text-[10px] text-muted font-mono">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              )) : (
                <p className="text-muted text-xs font-mono uppercase text-center py-4">No hay historial reciente</p>
              )}
            </div>
          </div>

          <div className="glass-panel p-6 bg-tertiary/5 border-tertiary/20">
            <div className="flex items-center gap-3 mb-4">
              <Radio className="text-tertiary" size={20} />
              <h3 className="font-display text-white uppercase tracking-tight">Active Band</h3>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5 text-center">
              <p className="text-4xl font-display text-white tracking-tighter">145.500</p>
              <p className="text-[10px] text-tertiary font-mono uppercase tracking-widest mt-1">MHz • FM • V-UHF</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
