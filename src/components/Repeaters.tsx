import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TowerControl as Tower, Plus, Search, Trash2, Edit2, X, Save } from 'lucide-react';
import { fetchTable, saveToTable, deleteFromTable } from '../services/supabase';
import { SEED_DATA } from '../services/seedData';

export default function Repeaters() {
  const [repeaters, setRepeaters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ loc: '', rx: '', tx: '', off: '', t: '' });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const data = await fetchTable('db_repeaters');
      setRepeaters(data.length > 0 ? data : SEED_DATA.repeaters);
    } catch (error) {
      console.error('Error loading repeaters:', error);
      setRepeaters(SEED_DATA.repeaters);
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
      await saveToTable('db_repeaters', item);
      await loadData();
      setEditingId(null);
      setShowAddForm(false);
      setFormData({ loc: '', rx: '', tx: '', off: '', t: '' });
    } catch (error: any) {
      alert('Error guardando: ' + error.message);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este repetidor?')) return;
    try {
      await deleteFromTable('db_repeaters', id);
      await loadData();
    } catch (error: any) {
      alert('Error eliminando: ' + error.message);
    }
  }

  function startEdit(r: any) {
    setEditingId(r.id);
    setFormData({ loc: r.loc, rx: r.rx, tx: r.tx, off: r.off, t: r.t });
    setShowAddForm(true);
  }

  const filtered = repeaters.filter(r => 
    r.loc.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.rx.includes(searchTerm)
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
            Red de <span className="text-accent">Repetidores</span>
          </h1>
          <p className="text-muted text-sm font-mono uppercase tracking-widest mt-1">
            VHF / UHF / DIGITAL - COBERTURA IARU REGION 1
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
            onClick={() => { setShowAddForm(!showAddForm); setEditingId(null); setFormData({ loc: '', rx: '', tx: '', off: '', t: '' }); }}
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
              <label className="text-[10px] font-mono uppercase tracking-widest text-muted">Ubicación</label>
              <input 
                required
                value={formData.loc}
                onChange={e => setFormData({...formData, loc: e.target.value})}
                className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-2 text-white text-xs focus:border-accent outline-none" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-widest text-muted">RX (FREQ)</label>
              <input 
                required
                value={formData.rx}
                onChange={e => setFormData({...formData, rx: e.target.value})}
                className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-2 text-white text-xs focus:border-accent outline-none" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-widest text-muted">TX (FREQ)</label>
              <input 
                value={formData.tx}
                onChange={e => setFormData({...formData, tx: e.target.value})}
                className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-2 text-white text-xs focus:border-accent outline-none" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-widest text-muted">Desplazamiento</label>
              <input 
                value={formData.off}
                onChange={e => setFormData({...formData, off: e.target.value})}
                className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-2 text-white text-xs focus:border-accent outline-none" 
              />
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-widest text-muted">Tono</label>
                <input 
                  value={formData.t}
                  onChange={e => setFormData({...formData, t: e.target.value})}
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
                <th>Ubicación</th>
                <th>RX (MHz)</th>
                <th>TX (MHz)</th>
                <th>Offset</th>
                <th>Tono</th>
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
              ) : filtered.map((r, i) => (
                <motion.tr 
                  key={r.id || i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                >
                  <td className="font-display text-white font-medium">{r.loc}</td>
                  <td className="font-mono text-accent">{r.rx}</td>
                  <td className="font-mono text-muted">{r.tx}</td>
                  <td className="text-tertiary font-bold">{r.off}</td>
                  <td>
                    <span className="text-[10px] font-mono bg-white/5 border border-white/10 px-2 py-1 rounded text-muted">
                      {r.t}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => startEdit(r)} className="text-muted hover:text-accent transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(r.id)} className="text-muted hover:text-rose-500 transition-colors">
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
