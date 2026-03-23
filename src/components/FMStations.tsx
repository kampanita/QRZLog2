import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Radio, Plus, Search, Trash2, Edit2, X, Save } from 'lucide-react';
import { fetchTable, saveToTable, deleteFromTable } from '../services/supabase';
import { SEED_DATA } from '../services/seedData';

export default function FMStations() {
  const [stations, setStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ e: '', f: '', z: '', s: '' });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const data = await fetchTable('db_fm');
      setStations(data.length > 0 ? data : SEED_DATA.fm);
    } catch (error) {
      console.error('Error loading stations:', error);
      setStations(SEED_DATA.fm);
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
      await saveToTable('db_fm', item);
      await loadData();
      setEditingId(null);
      setShowAddForm(false);
      setFormData({ e: '', f: '', z: '', s: '' });
    } catch (error: any) {
      alert('Error guardando: ' + error.message);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta emisora?')) return;
    try {
      await deleteFromTable('db_fm', id);
      await loadData();
    } catch (error: any) {
      alert('Error eliminando: ' + error.message);
    }
  }

  function startEdit(s: any) {
    setEditingId(s.id);
    setFormData({ e: s.e, f: s.f, z: s.z, s: s.s });
    setShowAddForm(true);
  }

  const filtered = stations.filter(s => 
    s.e.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.f.includes(searchTerm) ||
    s.z.toLowerCase().includes(searchTerm.toLowerCase())
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
            FM <span className="text-indigo-400">Comercial</span>
          </h1>
          <p className="text-muted text-sm font-mono uppercase tracking-widest mt-1">
            87.5 - 108.0 MHZ • BANDA DE DIFUSIÓN FM
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
            onClick={() => { setShowAddForm(!showAddForm); setEditingId(null); setFormData({ e: '', f: '', z: '', s: '' }); }}
            className={`p-2 rounded-xl transition-all ${showAddForm ? 'bg-rose-500/10 text-rose-500' : 'bg-indigo-600 text-white font-bold'}`}
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
            className="glass-panel p-6 overflow-hidden grid grid-cols-1 md:grid-cols-4 gap-4 border-t-2 border-indigo-500"
          >
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-widest text-muted">Emisora</label>
              <input 
                required
                value={formData.e}
                onChange={e => setFormData({...formData, e: e.target.value})}
                className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-2 text-white text-xs focus:border-indigo-500 outline-none" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-widest text-muted">Frecuencia</label>
              <input 
                required
                value={formData.f}
                onChange={e => setFormData({...formData, f: e.target.value})}
                className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-2 text-white text-xs focus:border-indigo-500 outline-none" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-widest text-muted">Zona</label>
              <input 
                value={formData.z}
                onChange={e => setFormData({...formData, z: e.target.value})}
                className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-2 text-white text-xs focus:border-indigo-500 outline-none" 
              />
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-widest text-muted">Señal Est.</label>
                <input 
                  value={formData.s}
                  onChange={e => setFormData({...formData, s: e.target.value})}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-2 text-white text-xs focus:border-indigo-500 outline-none" 
                />
              </div>
              <button type="submit" className="bg-indigo-600 text-white p-2 rounded-lg font-bold">
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
                <th>Emisora</th>
                <th>Frecuencia (MHz)</th>
                <th>Zona</th>
                <th>Señal Est.</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-20 text-muted font-mono animate-pulse">
                    CARGANDO DATOS DEL SISTEMA...
                  </td>
                </tr>
              ) : filtered.map((s, i) => (
                <motion.tr 
                  key={s.id || i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                >
                  <td className="font-display text-white font-medium">{s.e}</td>
                  <td className="font-mono text-indigo-400">{s.f}</td>
                  <td className="text-muted text-xs truncate max-w-[200px]">{s.z}</td>
                  <td className="text-emerald-500 font-bold underline decoration-indigo-500/20 underline-offset-4">{s.s}</td>
                  <td className="text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => startEdit(s)} className="text-muted hover:text-accent transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(s.id)} className="text-muted hover:text-rose-500 transition-colors">
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
