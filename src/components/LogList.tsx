import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, History, PlusCircle, Radio, Antenna, Trash2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchLogs, deleteLog } from '../services/supabase';
import { QSO } from '../types';

export default function LogList() {
  const [logs, setLogs] = useState<QSO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadLogs();
  }, []);

  async function loadLogs() {
    try {
      setLoading(true);
      const data = await fetchLogs();
      setLogs(data || []);
      // Backup to local storage
      localStorage.setItem('basauri_logs_backup', JSON.stringify(data));
    } catch (error) {
      console.error('Error fetching logs:', error);
      // Fallback to local storage
      const backup = localStorage.getItem('basauri_logs_backup');
      if (backup) {
        setLogs(JSON.parse(backup));
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este QSO permanentemente?')) return;
    try {
      await deleteLog(id);
      const updatedLogs = logs.filter(l => l.id !== id);
      setLogs(updatedLogs);
      localStorage.setItem('basauri_logs_backup', JSON.stringify(updatedLogs));
    } catch (error) {
      console.error('Error deleting log:', error);
      alert('Error al eliminar el log.');
    }
  }

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.callsign.toLowerCase().includes(search.toLowerCase()) ||
                         (log.comment && log.comment.toLowerCase().includes(search.toLowerCase()));
    const matchesFilter = filter === 'all' || log.band.toLowerCase().includes(filter.toLowerCase());
    return matchesSearch && matchesFilter;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6 pb-24"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 pt-4">
        <div>
          <h1 className="text-4xl font-display font-medium tracking-tight text-white italic">
            Terminal <span className="text-accent">Logbook</span>
          </h1>
          <p className="text-muted text-sm font-mono uppercase tracking-widest mt-1">
            {logs.length} QSO REGISTRADOS
          </p>
        </div>
        <Link
          to="/new"
          className="flex items-center gap-2 bg-accent text-slate-950 px-6 py-3 rounded-xl font-medium hover:bg-opacity-90 transition-all shadow-lg shadow-accent/20"
        >
          <PlusCircle size={20} />
          NUEVO QSO
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 px-6">
        <div className="glass-panel p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
            <History size={24} />
          </div>
          <div>
            <p className="text-muted text-[10px] font-mono uppercase tracking-widest">Total Logs</p>
            <p className="text-2xl font-display text-white">{logs.length}</p>
          </div>
        </div>
        <div className="glass-panel p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary">
            <Radio size={24} />
          </div>
          <div>
            <p className="text-muted text-[10px] font-mono uppercase tracking-widest">DXCC Count</p>
            <p className="text-2xl font-display text-white">
              {new Set(logs.map(l => l.callsign.substring(0, 2))).size}
            </p>
          </div>
        </div>
        <div className="glass-panel p-4 flex items-center gap-4 hidden md:flex">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <Antenna size={24} />
          </div>
          <div>
            <p className="text-muted text-[10px] font-mono uppercase tracking-widest">Live Updates</p>
            <p className="text-2xl font-display text-white">ENABLED</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 px-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
          <input
            type="text"
            placeholder="BUSCAR EN LOGBOOK (INDICATIVO, NOTAS...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white font-mono focus:outline-none focus:border-accent transition-colors"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {['all', '2m', '70cm', 'HF'].map((b) => (
            <button
              key={b}
              onClick={() => setFilter(b)}
              className={`px-6 py-4 rounded-xl font-mono text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${
                filter === b ? 'bg-accent text-slate-950' : 'glass-panel text-muted hover:text-white'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-[2px]">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted font-mono uppercase tracking-widest">Sincronizando con la nube...</p>
          </div>
        ) : filteredLogs.length > 0 ? (
          filteredLogs.map((log) => (
            <motion.div
              key={log.id}
              layout
              className="bg-slate-900/40 hover:bg-slate-800/60 transition-colors px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 group cursor-pointer border-b border-white/5"
            >
              <div className="flex items-center gap-6">
                <div className="text-center min-w-[80px]">
                  <p className="text-muted text-[10px] font-mono uppercase tracking-widest mb-1">Signal</p>
                  <p className="text-3xl font-display text-accent">{log.rst}</p>
                </div>
                <div className="h-12 w-px bg-white/10 hidden md:block" />
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-2xl font-display text-white tracking-tight uppercase">{log.callsign}</h3>
                    <span className="bg-slate-800 text-muted text-[10px] font-mono px-2 py-0.5 rounded uppercase tracking-widest">
                      {log.band}
                    </span>
                  </div>
                  <p className="text-muted text-xs font-mono uppercase tracking-widest">
                    {new Date(log.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="flex-1 md:px-8">
                <p className="text-muted text-sm line-clamp-1 italic">
                  {log.comment || 'Sin notas adicionales'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`https://www.qrz.com/db/${log.callsign}`, '_blank');
                  }}
                  className="p-3 rounded-lg hover:bg-white/5 text-muted hover:text-accent transition-all"
                  title="Ver en QRZ.com"
                >
                  <ExternalLink size={18} />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(log.id);
                  }}
                  className="p-3 rounded-lg hover:bg-rose-500/10 text-muted hover:text-rose-500 transition-all"
                  title="Eliminar"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-12 glass-panel border-dashed mx-6">
            <p className="text-muted font-mono uppercase tracking-widest">No se encontraron registros</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
