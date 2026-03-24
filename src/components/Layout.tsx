import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Radio, 
  History, 
  PlusCircle, 
  Map as MapIcon, 
  Settings, 
  TowerControl as Tower, 
  Mic, 
  LifeBuoy, 
  Music, 
  Cpu,
  Trophy
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', icon: Radio, label: 'Dashboard' },
  { path: '/logs', icon: History, label: 'Logs' },
  { path: '/new', icon: PlusCircle, label: 'New QSO' },
  { path: '/contest', icon: Trophy, label: 'Contest' },
  { path: '/repeaters', icon: Tower, label: 'Repeaters' },
  { path: '/pmr', icon: Mic, label: 'PMR446' },
  { path: '/emerg', icon: LifeBuoy, label: 'Emergencies' },
  { path: '/fm', icon: Music, label: 'FM Radio' },
  { path: '/hardware', icon: Cpu, label: 'Hardware' },
  { path: '/map', icon: MapIcon, label: 'Map' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-72 border-r border-white/5 bg-slate-900/50 backdrop-blur-xl sticky top-0 h-screen">
        <div className="p-8 overflow-y-auto scrollbar-hide">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-slate-950 shadow-[0_0_20px_rgba(172,199,255,0.3)]">
              <Radio size={24} />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold tracking-tighter italic">QRZ<span className="text-accent">Log</span></h1>
              <p className="text-[10px] font-mono text-muted uppercase tracking-widest">v2.8 Terminal</p>
            </div>
          </div>
          
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl font-mono text-[10px] uppercase tracking-widest transition-all ${
                    isActive 
                      ? 'bg-accent/10 text-accent border border-accent/20 shadow-[inset_0_0_10px_rgba(172,199,255,0.05)]' 
                      : 'text-muted hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
        
        <div className="mt-auto p-8 border-t border-white/5">
          <div className="flex items-center gap-3 text-muted">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-widest">System Online</span>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden glass-panel border-none rounded-none sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Radio className="text-accent" size={24} />
          <h1 className="text-xl font-display font-bold tracking-tighter italic">QRZ<span className="text-accent">Log</span></h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted">Online</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden">
        <div className="max-w-7xl mx-auto py-8 md:py-12">
          {children}
        </div>
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-panel border-none rounded-none border-t border-white/5 z-50 px-2 py-2 flex items-center gap-1 overflow-x-auto scrollbar-hide">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all flex-shrink-0 min-w-[3rem] ${
                isActive ? 'text-accent' : 'text-muted'
              }`
            }
          >
            <item.icon size={18} />
            <span className="text-[7px] font-mono uppercase tracking-wider whitespace-nowrap">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
