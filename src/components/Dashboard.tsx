import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Radio, Antenna, History, PlusCircle, Sun, Wind, Activity, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchLogs } from '../services/supabase';
import { QSO } from '../types';

export default function Dashboard() {
  const [logs, setLogs] = useState<QSO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  async function loadLogs() {
    try {
      setLoading(true);
      const data = await fetchLogs();
      setLogs(data?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
      const backup = localStorage.getItem('basauri_logs_backup');
      if (backup) {
        setLogs(JSON.parse(backup).slice(0, 5));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-8 pb-24"
    >
      {/* Hero Section */}
      <section className="relative h-32 md:h-40 rounded-3xl overflow-hidden glass-panel border-none">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-transparent to-tertiary/20" />
        <div className="relative h-full flex flex-col justify-center px-8 md:px-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <span className="text-emerald-500 font-mono text-[10px] uppercase tracking-widest font-bold">ON AIR • LIVE SYSTEM</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-medium text-white tracking-tighter italic mb-1">
            145.500 <span className="text-accent">MHz</span>
          </h1>
          <p className="text-muted font-mono text-xs uppercase tracking-[0.2em]">
            VHF • FM • BASAURI TERMINAL • <span className="text-tertiary">IN83NE</span>
          </p>
        </div>
      </section>

      {/* Dashboard Stats Bento */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-6">
        <div className="md:col-span-2 glass-panel p-8 flex flex-col justify-between group hover:border-accent/30 transition-all">
          <div className="flex justify-between items-start mb-8">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
              <History size={28} />
            </div>
            <Link to="/logs" className="text-muted hover:text-white transition-colors">
              <PlusCircle size={20} />
            </Link>
          </div>
          <div>
            <p className="text-muted text-xs font-mono uppercase tracking-widest mb-1">Total QSOs Logged</p>
            <p className="text-5xl font-display text-white tracking-tighter">{logs.length}+</p>
          </div>
        </div>

        <div className="glass-panel p-8 flex flex-col justify-between group hover:border-tertiary/30 transition-all">
          <div className="w-14 h-14 rounded-2xl bg-tertiary/10 flex items-center justify-center text-tertiary mb-8 group-hover:scale-110 transition-transform">
            <Radio size={28} />
          </div>
          <div>
            <p className="text-muted text-xs font-mono uppercase tracking-widest mb-1">Active Band</p>
            <p className="text-3xl font-display text-white tracking-tight">2m VHF</p>
          </div>
        </div>

        <div className="glass-panel p-8 flex flex-col justify-between group hover:border-emerald-500/30 transition-all">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-8 group-hover:scale-110 transition-transform">
            <Antenna size={28} />
          </div>
          <div>
            <p className="text-muted text-xs font-mono uppercase tracking-widest mb-1">Mode</p>
            <p className="text-3xl font-display text-white tracking-tight">NFM</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-6">
        {/* Recent Logs Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-display text-white italic tracking-tight uppercase">Recent <span className="text-accent">Logs</span></h2>
            <Link to="/logs" className="text-muted text-xs font-mono uppercase tracking-widest hover:text-accent transition-colors">View All</Link>
          </div>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-muted font-mono uppercase tracking-widest">Cargando logs...</p>
              </div>
            ) : logs.length > 0 ? (
              logs.map((log) => (
                <div key={log.id} className="glass-panel p-5 flex items-center justify-between group hover:bg-white/5 transition-all">
                  <div className="flex items-center gap-6">
                    <div className="text-center min-w-[60px]">
                      <p className="text-3xl font-display text-accent">{log.rst}</p>
                      <p className="text-[10px] text-muted font-mono uppercase tracking-widest">RST</p>
                    </div>
                    <div>
                      <h3 className="text-xl font-display text-white tracking-tight uppercase">{log.callsign}</h3>
                      <p className="text-muted text-xs font-mono uppercase tracking-widest">{log.band}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-mono text-sm">{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="text-muted text-[10px] font-mono uppercase tracking-widest">UTC TIME</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 glass-panel border-dashed">
                <p className="text-muted font-mono uppercase tracking-widest">No hay logs recientes</p>
              </div>
            )}
          </div>
          
          <Link to="/new" className="block">
            <button className="w-full glass-panel p-6 border-dashed border-accent/30 text-accent hover:bg-accent/5 transition-all flex items-center justify-center gap-3 group">
              <PlusCircle className="group-hover:rotate-90 transition-transform" size={24} />
              <span className="font-display font-bold uppercase tracking-widest">New QSO Entry</span>
            </button>
          </Link>
        </div>

        {/* Solar Indices & Propagation */}
        <div className="space-y-6">
          <h2 className="text-2xl font-display text-white italic tracking-tight uppercase">Solar <span className="text-tertiary">Indices</span></h2>
          <div className="glass-panel p-8 space-y-8 border-t-2 border-tertiary">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Sun size={24} />
              </div>
              <div>
                <p className="text-muted text-[10px] font-mono uppercase tracking-widest">Propagation</p>
                <p className="text-xl font-display text-white uppercase tracking-tight">Fair / Good</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted mb-1">
                  <Activity size={14} />
                  <span className="text-[10px] font-mono uppercase tracking-widest">SFI</span>
                </div>
                <p className="text-2xl font-display text-white">142</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted mb-1">
                  <Wind size={14} />
                  <span className="text-[10px] font-mono uppercase tracking-widest">SN</span>
                </div>
                <p className="text-2xl font-display text-white">84</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted mb-1">
                  <Zap size={14} />
                  <span className="text-[10px] font-mono uppercase tracking-widest">A-Idx</span>
                </div>
                <p className="text-2xl font-display text-white">12</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted mb-1">
                  <Activity size={14} />
                  <span className="text-[10px] font-mono uppercase tracking-widest">K-Idx</span>
                </div>
                <p className="text-2xl font-display text-white">2</p>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5">
              <p className="text-[10px] font-mono text-muted uppercase tracking-widest mb-4">Band Conditions</p>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono text-white">80m-40m</span>
                  <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-500 px-2 py-0.5 rounded uppercase font-bold">Good</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono text-white">20m-15m</span>
                  <span className="text-[10px] font-mono bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded uppercase font-bold">Fair</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono text-white">10m-6m</span>
                  <span className="text-[10px] font-mono bg-rose-500/20 text-rose-500 px-2 py-0.5 rounded uppercase font-bold">Poor</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
