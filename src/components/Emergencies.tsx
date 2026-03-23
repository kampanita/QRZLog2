import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Plus, Search, Trash2, Edit2, X, Save } from 'lucide-react';
import { fetchTable, saveToTable, deleteFromTable } from '../services/supabase';
import { SEED_DATA } from '../services/seedData';

export default function Emergencies() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ s: '', f: '', m: '', n: '', tx: '', type: 'EMERG' });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const dbData = await fetchTable('db_emerg');
      setData(dbData.length > 0 ? dbData : SEED_DATA.emerg);
    } catch (error) {
      console.error('Error loading emergencies:', error);
      setData(SEED_DATA.emerg);
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
      await saveToTable('db_emerg', item);
      await loadData();
      setEditingId(null);
      setShowAddForm(false);
      setFormData({ s: '', f: '', m: '', n: '', tx: '', type: 'EMERG' });
    } catch (error: any) {
      alert('Error guardando: ' + error.message);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este registro?')) return;
    try {
      await deleteFromTable('db_emerg', id);
      await loadData();
    } catch (error: any) {
      alert('Error eliminando: ' + error.message);
    }
  }

  function startEdit(item: any) {
    setEditingId(item.id);
    setFormData({ s: item.s, f: item.f, m: item.m, n: item.n, tx: item.tx, type: item.type });
    setShowAddForm(true);
  }

  const filtered = data.filter(item => 
    item.s.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.f.includes(searchTerm)
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
            Canales de <span className="text-rose-500">Emergencia</span>
          </h1>
          <p className="text-muted text-sm font-mono uppercase tracking-widest mt-1">
            PROTECCIÓN CIVIL • EMERGENCIAS • BANDA AÉREA
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
            onClick={() => { setShowAddForm(!showAddForm); setEditingId(null); setFormData({ s: '', f: '', m: '', n: '', tx: '', type: 'EMERG' }); }}
            className={`p-2 rounded-xl transition-all ${showAddForm ? 'bg-rose-500/10 text-rose-500' : 'bg-rose-600 text-white font-bold'}`}
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
            className="glass-panel p-6 overflow-hidden grid grid-cols-1 md:grid-cols-6 gap-4 border-t-2 border-rose-500"
          >
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-widest text-muted">Servicio</label>
              <input 
                required
                value={formData.s}
                onChange={e => setFormData({...formData, s: e.target.value})}
                className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-2 text-white text-xs focus:border-rose-500 outline-none" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-widest text-muted">Frecuencia</label>
              <input 
                required
                value={formData.f}
                onChange={e => setFormData({...formData, f: e.target.value})}
                className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-2 text-white text-xs focus:border-rose-500 outline-none" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-widest text-muted">Tipo</label>
              <select 
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
                className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-2 text-white text-xs focus:border-rose-500 outline-none"
              >
                <option value="EMERG">EMERGENCIA</option>
                <option value="AIR">BANDA AÉREA</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-widest text-muted">Modo</label>
              <input 
                value={formData.m}
                onChange={e => setFormData({...formData, m: e.target.value})}
                className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-2 text-white text-xs focus:border-rose-500 outline-none" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-widest text-muted">TX State</label>
              <input 
                value={formData.tx}
                onChange={e => setFormData({...formData, tx: e.target.value})}
                className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-2 text-white text-xs focus:border-rose-500 outline-none" 
              />
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-widest text-muted">Notas</label>
                <input 
                  value={formData.n}
                  onChange={e => setFormData({...formData, n: e.target.value})}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-2 text-white text-xs focus:border-rose-500 outline-none" 
                />
              </div>
              <button type="submit" className="bg-rose-600 text-white p-2 rounded-lg font-bold">
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
                <th>Servicio</th>
                <th>Frecuencia (MHz)</th>
                <th>Modo</th>
                <th>Notas</th>
                <th>TX</th>
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
              ) : filtered.map((item, i) => (
                <motion.tr 
                  key={item.id || i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                >
                  <td className="font-display text-white font-medium">{item.s}</td>
                  <td className={`font-mono ${item.type === 'EMERG' ? 'text-rose-500' : 'text-slate-300'}`}>{item.f}</td>
                  <td>
                    <span className="text-[10px] font-mono bg-white/5 border border-white/10 px-2 py-1 rounded text-muted">
                      {item.m}
                    </span>
                  </td>
                  <td className="text-xs text-muted max-w-[200px] truncate">{item.n}</td>
                  <td>
                    <span className={`text-[10px] font-mono px-2 py-1 rounded font-bold ${item.tx === 'TX OK' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-white/5 text-muted'}`}>
                      {item.tx}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => startEdit(item)} className="text-muted hover:text-accent transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="text-muted hover:text-rose-500 transition-colors">
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
