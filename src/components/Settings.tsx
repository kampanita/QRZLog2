import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Code,
  Trophy,
  Trash2,
  Plus
} from 'lucide-react';
import { Theme, InterfaceMode } from '../types';
import { uploadSeedData, fetchTable, deleteFromTable, saveToTable } from '../services/supabase';
import { SEED_DATA } from '../services/seedData';
import Console from './Console';

const SB_URL = 'https://svcakitmimdhltwcmadd.supabase.co';
const SB_KEY = 'sb_publishable_uR_yVZpJ2wOkUD0bihyGBg_E__lJACJ';

export default function Settings() {
  const [theme, setTheme] = useState<Theme>((localStorage.getItem('app-theme') as Theme) || 'terminal2026');
  const [interfaceMode, setInterfaceMode] = useState<InterfaceMode>((localStorage.getItem('app-interface') as InterfaceMode) || 'ultra');
  const [sbUrl, setSbUrl] = useState(localStorage.getItem('sb_url') || SB_URL);
  const [sbKey, setSbKey] = useState(localStorage.getItem('sb_key') || SB_KEY);
  const [showSql, setShowSql] = useState(false);
  const [contests, setContests] = useState<any[]>([]);
  const [newContestName, setNewContestName] = useState('');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.body.setAttribute('data-interface', interfaceMode);
    localStorage.setItem('app-interface', interfaceMode);
  }, [interfaceMode]);

  useEffect(() => {
    loadContests();
  }, []);

  async function loadContests() {
    try {
      const data = await fetchTable('db_contests');
      setContests(data || []);
    } catch (e) {
      console.error('Error loading contests:', e);
    }
  }

  async function handleAddContest() {
    if (!newContestName) return;
    try {
      const id = newContestName.toUpperCase().replace(/\s+/g, '-');
      await saveToTable('db_contests', { id, name: newContestName, created_at: new Date().toISOString() });
      setNewContestName('');
      loadContests();
    } catch (e) {
      alert('Error creando concurso');
    }
  }

  async function handleDeleteContest(id: string) {
    if (!confirm('¿Eliminar concurso? (Esto no borrará los logs asociados)')) return;
    try {
      await deleteFromTable('db_contests', id);
      loadContests();
    } catch (e) {
      alert('Error eliminando');
    }
  }

  function handleSaveConfig() {
    localStorage.setItem('sb_url', sbUrl);
    localStorage.setItem('sb_key', sbKey);
    alert('Configuración guardada. Reinicia la aplicación para aplicar los cambios.');
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
    { id: 'forest', label: 'Deep Forest', color: 'bg-green-800' },
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

-- TABLA CONCURSOS
create table if not exists db_contests (
  id text primary key,
  name text,
  created_at timestamptz default now()
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

      <div className="grid grid-cols-1 gap-6">
        <Console />
      </div>

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

      {/* Contest Management */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <Trophy className="text-amber-500" size={20} />
          <h2 className="text-xl font-display text-white uppercase tracking-tight">Gestión de Concursos</h2>
        </div>
        <div className="glass-panel p-8 space-y-6">
          <div className="flex gap-4">
            <input 
              type="text" 
              placeholder="NOMBRE DEL CONCURSO (EJ: BASAURI PRO)"
              value={newContestName}
              onChange={e => setNewContestName(e.target.value)}
              className="flex-1 bg-slate-900/50 border border-white/10 rounded-xl p-4 text-white font-mono text-sm focus:border-amber-500 outline-none"
            />
            <button 
              onClick={handleAddContest}
              className="bg-amber-500 text-slate-950 px-6 py-4 rounded-xl font-display font-bold uppercase tracking-widest hover:bg-amber-400 shadow-lg shadow-amber-900/20"
            >
              <Plus size={20} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[200px] overflow-y-auto scrollbar-hide">
            {contests.map(c => (
              <div key={c.id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex justify-between items-center group">
                <div>
                  <p className="text-[10px] text-muted font-mono uppercase">{c.id}</p>
                  <p className="text-white font-display font-bold uppercase">{c.name}</p>
                </div>
                <button onClick={() => handleDeleteContest(c.id)} className="text-muted hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

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
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-4 text-white font-mono text-sm focus:outline-none focus:border-accent"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleSaveConfig}
              className="bg-accent text-slate-950 px-8 py-3 rounded-xl font-display font-bold uppercase tracking-widest hover:bg-opacity-90 shadow-lg shadow-accent/20"
            >
              Guardar y Conectar
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <RefreshCw className="text-accent" size={20} />
          <h2 className="text-xl font-display text-white uppercase tracking-tight">Servicios de Datos</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel p-6 space-y-4 border-t-2 border-amber-500/50">
            <h3 className="font-display text-white uppercase tracking-tight text-sm">Base de Datos (Seed)</h3>
            <p className="text-[10px] text-muted font-mono leading-relaxed">Fusiona los datos base. Se usa upsert para evitar duplicados.</p>
            <div className="space-y-2">
              <button onClick={async () => { try { await uploadSeedData('db_repeaters', SEED_DATA.repeaters); alert('Repetidores OK'); } catch(e:any) { alert(e.message); } }} className="w-full bg-amber-500/10 text-amber-500 border border-amber-500/20 py-2 rounded-xl font-mono text-[10px] font-bold">FUSIONAR REPETIDORES</button>
              <button onClick={async () => { try { await uploadSeedData('db_pmr', SEED_DATA.pmr); alert('PMR OK'); } catch(e:any) { alert(e.message); } }} className="w-full bg-amber-500/10 text-amber-500 border border-amber-500/20 py-2 rounded-xl font-mono text-[10px] font-bold">FUSIONAR PMR</button>
              <button onClick={async () => { try { await uploadSeedData('db_emerg', SEED_DATA.emerg); alert('Emergencias OK'); } catch(e:any) { alert(e.message); } }} className="w-full bg-amber-500/10 text-amber-500 border border-amber-500/20 py-2 rounded-xl font-mono text-[10px] font-bold">FUSIONAR EMERGENCIAS</button>
              <button onClick={async () => { try { await uploadSeedData('db_fm', SEED_DATA.fm); alert('FM OK'); } catch(e:any) { alert(e.message); } }} className="w-full bg-amber-500/10 text-amber-500 border border-amber-500/20 py-2 rounded-xl font-mono text-[10px] font-bold">FUSIONAR FM</button>
              <button onClick={async () => { try { await uploadSeedData('db_hardware', SEED_DATA.hardware); alert('Hardware OK'); } catch(e:any) { alert(e.message); } }} className="w-full bg-amber-500/10 text-amber-500 border border-amber-500/20 py-2 rounded-xl font-mono text-[10px] font-bold">FUSIONAR HARDWARE</button>
            </div>
          </div>

          <div className="glass-panel p-6 space-y-4 border-t-2 border-emerald-500/50">
            <h3 className="font-display text-white uppercase tracking-tight text-sm">Exportar H8 CSV</h3>
            <button className="w-full bg-emerald-500 text-slate-950 py-3 rounded-xl font-display font-bold text-[10px]">REESTABLECER EXPORTACIÓN</button>
          </div>

          <div className="glass-panel p-6 space-y-4 border-t-2 border-slate-500/50 col-span-2">
            <div className="flex justify-between items-center">
              <h3 className="font-display text-white uppercase tracking-tight text-sm">Instalación SQL</h3>
              <button onClick={() => setShowSql(!showSql)} className="text-xs font-mono text-accent">{showSql ? 'CERRAR' : 'VER CÓDIGO'}</button>
            </div>
            {showSql && (
              <textarea readOnly value={SQL_COMMANDS} className="w-full h-48 bg-black/40 text-emerald-400 font-mono text-[10px] p-4 rounded-xl border border-white/5" />
            )}
          </div>
        </div>
      </section>
    </motion.div>
  );
}

