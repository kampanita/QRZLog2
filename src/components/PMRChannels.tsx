import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Radio, Plus, Search, Trash2, Edit2, X, Save } from 'lucide-react';
import { fetchTable, saveToTable, deleteFromTable } from '../services/supabase';
import { SEED_DATA } from '../services/seedData';

export default function PMRChannels() {
  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ c: '', f: '', m: '', p: '', u: '' });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const data = await fetchTable('db_pmr');
      setChannels(data.length > 0 ? data : SEED_DATA.pmr);
    } catch (error) {
      console.error('Error loading channels:', error);
      setChannels(SEED_DATA.pmr);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      const item = { 
        ...formData, 
        id: editingId || 'id-' + Math.random().toString(36).substr(2, 9) 
      };
      await saveToTable('db_pmr', item);
      await loadData();
      setEditingId(null);
      setShowAddForm(false);
      setFormData({ c: '', f: '', m: '', p: '', u: '' });
    } catch (error: any) {
      alert('Error guardando: ' + error.message);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este canal?')) return;
    try {
      await deleteFromTable('db_pmr', id);
      await loadData();
    } catch (error: any) {
      alert('Error eliminando: ' + error.message);
    }
  }

  function startEdit(c: any) {
    setEditingId(c.id);
    setFormData({ c: c.c, f: c.f, m: c.m, p: c.p, u: c.u });
    setShowAddForm(true);
  }

  const filtered = channels.filter(c => 
    c.c.toString().includes(searchTerm) ||
    c.f.includes(searchTerm) ||
    c.u.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full flex flex-col space-y-6 px-6"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pt-4">
        <div>
          <h1 className="text-4xl font-display font-medium tracking-tight text-white italic">
            Canales <span className="text-accent">PMR446</span>
          </h1>
          <p className="text-muted text-sm font-mono uppercase tracking-widest mt-1">
            USO LIBRE • 446.0 - 446.2 MHZ • SIN LICENCIA
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input
              type="text"
              placeholder="BUSCAR..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white text-xs font-mono focus:outline-none focus:border-accent"
            />
          </div>
          <button 
            onClick={() => { setShowAddForm(!showAddForm); setEditingId(null); setFormData({ c: '', f: '', m: '', p: '', u: '' }); }}
            className={`p-2 rounded-xl transition-all ${showAddForm ? 'bg-rose-500/10 text-rose-500' : 'bg-accent text-slate-950 font-bold'}`}
          >
            {showAddForm ? <X size={20} /> : <Plus size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleSave}
            className="glass-panel p-6 overflow-hidden grid grid-cols-1 md:grid-cols-5 gap-4"
          >
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-widest text-muted">Canal</label>
              <input 
                required
                value={formData.c}
                onChange={e => setFormData({...formData, c: e.target.value})}
                className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-2 text-white text-xs focus:border-accent outline-none" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-widest text-muted">Frecuencia</label>
              <input 
                required
                value={formData.f}
                onChange={e => setFormData({...formData, f: e.target.value})}
                className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-2 text-white text-xs focus:border-accent outline-none" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-widest text-muted">Modo</label>
              <input 
                value={formData.m}
                onChange={e => setFormData({...formData, m: e.target.value})}
                className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-2 text-white text-xs focus:border-accent outline-none" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-widest text-muted">Potencia</label>
              <input 
                value={formData.p}
                onChange={e => setFormData({...formData, p: e.target.value})}
                className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-2 text-white text-xs focus:border-accent outline-none" 
              />
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-widest text-muted">Uso Común</label>
                <input 
                  value={formData.u}
                  onChange={e => setFormData({...formData, u: e.target.value})}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-2 text-white text-xs focus:border-accent outline-none" 
                />
              </div>
              <button type="submit" className="bg-accent text-slate-950 p-2 rounded-lg font-bold">
                <Save size={20} />
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="flex-1 glass-panel overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="table-tactical">
            <thead>
              <tr>
                <th>Canal</th>
                <th>Frecuencia (MHz)</th>
                <th>Modo</th>
                <th>Potencia</th>
                <th>Uso Común</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-20 text-muted font-mono animate-pulse">
                    CARGANDO DATOS DEL SISTEMA...
                  </td>
                </tr>
              ) : filtered.map((c, i) => (
                <motion.tr 
                  key={c.id || i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                >
                  <td className="font-display text-white font-medium">CH {c.c}</td>
                  <td className="font-mono text-accent">{c.f}</td>
                  <td>
                    <span className="text-[10px] font-mono bg-white/5 border border-white/10 px-2 py-1 rounded text-muted">
                      {c.m}
                    </span>
                  </td>
                  <td className="text-tertiary font-bold">{c.p}</td>
                  <td className="text-xs italic text-muted">{c.u}</td>
                  <td className="text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => startEdit(c)} className="text-muted hover:text-accent transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="text-muted hover:text-rose-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
