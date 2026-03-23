import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Database, 
  Palette, 
  Layout, 
  Shield, 
  RefreshCw, 
  Languages, 
  LogOut, 
  Cloud, 
  FileJson,
  Key,
  Monitor,
  HardDrive,
  Code
} from 'lucide-react';
import { Theme, InterfaceMode } from '../types';
import { uploadSeedData } from '../services/supabase';
import { SEED_DATA } from '../services/seedData';

const SB_URL = 'https://svcakitmimdhltwcmadd.supabase.co';
const SB_KEY = 'sb_publishable_uR_yVZpJ2wOkUD0bihyGBg_E__lJACJ';

export default function Settings() {
  const [theme, setTheme] = useState<Theme>((localStorage.getItem('app-theme') as Theme) || 'terminal2026');
  const [interfaceMode, setInterfaceMode] = useState<InterfaceMode>((localStorage.getItem('app-interface') as InterfaceMode) || 'ultra');
  const [sbUrl, setSbUrl] = useState(localStorage.getItem('sb_url') || SB_URL);
  const [sbKey, setSbKey] = useState(localStorage.getItem('sb_key') || SB_KEY);
  const [showSql, setShowSql] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.body.setAttribute('data-interface', interfaceMode);
    localStorage.setItem('app-interface', interfaceMode);
  }, [interfaceMode]);

  function handleSaveConfig() {
    localStorage.setItem('sb_url', sbUrl);
    localStorage.setItem('sb_key', sbKey);
    alert('Configuración guardada. Reinicia la aplicación para aplicar los cambios.');
  }

  async function handleSeedData() {
    if (!confirm('Esto subirá los datos base (Repetidores, PMR, FM, etc.) a Supabase. ¿Continuar?')) return;
    try {
      await uploadSeedData('db_repeaters', SEED_DATA.repeaters);
      await uploadSeedData('db_pmr', SEED_DATA.pmr);
      await uploadSeedData('db_emerg', SEED_DATA.emerg);
      await uploadSeedData('db_fm', SEED_DATA.fm);
      await uploadSeedData('db_hardware', SEED_DATA.hardware);
      alert('Datos base subidos correctamente.');
    } catch (error: any) {
      alert('Error subiendo datos: ' + error.message);
    }
  }

  const THEMES: { id: Theme; label: string; color: string }[] = [
    { id: 'terminal2026', label: 'Ultra 2026', color: 'bg-indigo-400' },
    { id: 'blueprint', label: 'Blueprint', color: 'bg-cyan-500' },
    { id: 'tactical', label: 'Tactical Blue', color: 'bg-slate-500' },
    { id: 'shack', label: 'Vintage Shack', color: 'bg-amber-700' },
    { id: 'lab', label: 'Modern Lab', color: 'bg-blue-600' },
    { id: 'retro', label: 'Retro CRT', color: 'bg-emerald-600' },
    { id: 'nordic', label: 'Nordic Frost', color: 'bg-slate-300' },
    { id: 'vulcan', label: 'Vulcan Forge', color: 'bg-orange-600' },
    { id: 'forest', label: 'Deep Forest', color: 'bg-emerald-800' },
    { id: 'cyber', label: 'Cyber Neon', color: 'bg-fuchsia-600' },
    { id: 'stealth', label: 'Stealth Ops', color: 'bg-slate-900' },
  ];

  const SQL_COMMANDS = `
-- TABLA REPETIDORES
create table if not exists db_repeaters (
  id text primary key,
  loc text, rx text, tx text, off text, t text
);

-- TABLA PMR
create table if not exists db_pmr (
  id text primary key,
  c text, f text, m text, p text, u text
);

-- TABLA EMERG/AIRE
create table if not exists db_emerg (
  id text primary key,
  s text, f text, m text, n text, tx text, type text
);

-- TABLA FM
create table if not exists db_fm (
  id text primary key,
  e text, f text, z text, s text
);

-- TABLA HARDWARE
create table if not exists db_hardware (
  id text primary key,
  r text, s text, u text, m text, tx text
);

-- TABLA CONTEST LOGS
create table if not exists contest_logs (
  id uuid primary key default gen_random_uuid(),
  contest_id text not null,
  date text, time text, callsign text not null,
  band text, s_rst text, s_nr text,
  r_rst text, r_nr text, r_loc text,
  my_call text, my_loc text,
  created_at timestamptz default now()
);
  `.trim();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-4xl mx-auto space-y-8 pb-32 px-6"
    >
      <div className="pt-4">
        <h1 className="text-4xl font-display font-medium tracking-tight text-white italic">
          Terminal <span className="text-accent">Settings</span>
        </h1>
        <p className="text-muted text-sm font-mono uppercase tracking-widest mt-1">
          CONFIGURACIÓN DEL SISTEMA Y PERSONALIZACIÓN
        </p>
      </div>

      {/* Interface Mode */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <Monitor className="text-accent" size={20} />
          <h2 className="text-xl font-display text-white uppercase tracking-tight">Modo de Interfaz</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setInterfaceMode('classic')}
            className={`p-6 rounded-2xl border-2 transition-all text-left space-y-2 ${
              interfaceMode === 'classic' 
                ? 'bg-accent/10 border-accent text-white' 
                : 'glass-panel border-white/5 text-muted hover:border-white/10'
            }`}
          >
            <p className="font-display font-bold uppercase tracking-widest">Estándar</p>
            <p className="text-xs font-mono opacity-60">Interfaz clásica optimizada para rendimiento.</p>
          </button>
          <button
            onClick={() => setInterfaceMode('ultra')}
            className={`p-6 rounded-2xl border-2 transition-all text-left space-y-2 ${
              interfaceMode === 'ultra' 
                ? 'bg-accent/10 border-accent text-white' 
                : 'glass-panel border-white/5 text-muted hover:border-white/10'
            }`}
          >
            <p className="font-display font-bold uppercase tracking-widest text-accent">Ultra 2026</p>
            <p className="text-xs font-mono opacity-60">Efectos visuales avanzados, Glassmorphism y 3D.</p>
          </button>
        </div>
      </section>

      {/* Visual Themes */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <Palette className="text-accent" size={20} />
          <h2 className="text-xl font-display text-white uppercase tracking-tight">Personalización Visual</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${
                theme === t.id 
                  ? 'bg-white/10 border-accent' 
                  : 'glass-panel border-white/5 hover:border-white/10'
              }`}
            >
              <div className={`w-full h-8 rounded-md ${t.color}`} />
              <span className="text-[10px] font-mono uppercase tracking-widest text-center">{t.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Supabase Config */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <Database className="text-accent" size={20} />
          <h2 className="text-xl font-display text-white uppercase tracking-tight">Conexión Supabase</h2>
        </div>
        <div className="glass-panel p-8 space-y-6 border-t-2 border-accent">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase tracking-widest text-muted">Project URL</label>
              <input
                type="text"
                value={sbUrl}
                onChange={(e) => setSbUrl(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-4 text-white font-mono text-sm focus:outline-none focus:border-accent"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase tracking-widest text-muted">API Key</label>
              <input
                type="password"
                value={sbKey}
                onChange={(e) => setSbKey(e.target.value)}
                placeholder="sb_publishable..."
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-4 text-white font-mono text-sm focus:outline-none focus:border-accent"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleSaveConfig}
              className="bg-accent text-slate-950 px-8 py-3 rounded-xl font-display font-bold uppercase tracking-widest hover:bg-opacity-90 transition-all shadow-lg shadow-accent/20"
            >
              Guardar y Conectar
            </button>
          </div>
        </div>
      </section>

      {/* Maintenance & Seed Data & Export */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <RefreshCw className="text-accent" size={20} />
          <h2 className="text-xl font-display text-white uppercase tracking-tight">Servicios de Datos</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel p-6 space-y-4 border-t-2 border-amber-500/50">
            <div className="flex items-center gap-3">
              <HardDrive className="text-amber-500" size={18} />
              <h3 className="font-display text-white uppercase tracking-tight text-sm">Base de Datos</h3>
            </div>
            <p className="text-[10px] text-muted font-mono leading-relaxed">
              Carga los datos iniciales (Repetidores, PMR, etc.) si tu base de datos está vacía.
            </p>
            <button 
              onClick={handleSeedData}
              className="w-full bg-amber-500/10 text-amber-500 border border-amber-500/20 py-3 rounded-xl font-mono text-[10px] uppercase tracking-widest hover:bg-amber-500/20 transition-all font-bold"
            >
              Fusionar Datos Semilla
            </button>
          </div>

          <div className="glass-panel p-6 space-y-4 border-t-2 border-emerald-500/50">
            <div className="flex items-center gap-3">
              <FileJson className="text-emerald-500" size={18} />
              <h3 className="font-display text-white uppercase tracking-tight text-sm">Exportar H8 CSV</h3>
            </div>
            <p className="text-[10px] text-muted font-mono leading-relaxed">
              Exporta todos los logs en formato compatible con Tidradio H8 / CSV.
            </p>
            <button 
              onClick={() => alert('Exportación iniciada...')}
              className="w-full bg-emerald-500 text-slate-950 py-3 rounded-xl font-display font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-900/20"
            >
              Descargar MASTER_H8.csv
            </button>
          </div>

          <div className="glass-panel p-6 space-y-4 border-t-2 border-slate-500/50">
            <div className="flex items-center gap-3">
              <Code className="text-slate-400" size={18} />
              <h3 className="font-display text-white uppercase tracking-tight text-sm">Instalación SQL</h3>
            </div>
            <p className="text-[10px] text-muted font-mono leading-relaxed">
              Comandos SQL para inicializar las tablas necesarias en Supabase.
            </p>
            <button 
              onClick={() => setShowSql(!showSql)}
              className="w-full bg-white/5 text-white border border-white/10 py-3 rounded-xl font-mono text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all font-bold"
            >
              {showSql ? 'Ocultar Comandos' : 'Ver Comandos SQL'}
            </button>
          </div>
        </div>
        
        {showSql && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="glass-panel p-6"
          >
            <textarea 
              readOnly 
              value={SQL_COMMANDS}
              className="w-full h-48 bg-slate-900/50 text-emerald-400 font-mono text-[10px] p-4 rounded-xl border border-white/10 focus:outline-none"
            />
          </motion.div>
        )}
      </section>

      <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
            <LogOut size={24} />
          </div>
          <div>
            <p className="text-white font-display font-bold uppercase tracking-tight">Cerrar Sesión</p>
            <p className="text-[10px] text-muted font-mono uppercase">EA2FKT • Basauri, Bizkaia</p>
          </div>
        </div>
        <button className="text-rose-500 font-mono text-[10px] uppercase tracking-widest border border-rose-500/20 px-6 py-3 rounded-xl hover:bg-rose-500/10 transition-all">
          Desconectar Terminal
        </button>
      </div>
    </motion.div>
  );
}

