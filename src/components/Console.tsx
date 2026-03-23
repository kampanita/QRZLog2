import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Trash2, Download, Play, Pause } from 'lucide-react';
import { motion } from 'motion/react';

export default function Console() {
  const [logs, setLogs] = useState<{msg: string, type: 'info' | 'error' | 'success', time: string}[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Override console.log to capture system messages if needed
    // But for now, we'll just listen to some custom events or simulate heartbeat
    const interval = setInterval(() => {
      if (!isPaused && Math.random() > 0.7) {
        addLog('SYSLOG: Heartbeat from SDR Engine - Peak detected at 144.800', 'info');
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused]);

  useEffect(() => {
    if (scrollRef.current && !isPaused) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isPaused]);

  function addLog(msg: string, type: 'info' | 'error' | 'success' = 'info') {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-49), { msg, type, time }]);
  }

  function clearLogs() {
    setLogs([]);
  }

  return (
    <div className="glass-panel overflow-hidden border-t-4 border-slate-700 flex flex-col h-[300px]">
      <div className="bg-slate-900/80 px-4 py-2 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-accent" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white">System Debug Console</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsPaused(!isPaused)} className="text-muted hover:text-accent transition-colors">
            {isPaused ? <Play size={14} /> : <Pause size={14} />}
          </button>
          <button onClick={clearLogs} className="text-muted hover:text-rose-500 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 p-4 font-mono text-[10px] space-y-1 overflow-y-auto scrollbar-hide bg-black/40"
      >
        {logs.length === 0 ? (
          <div className="text-muted/30 italic">LOGGING SYSTEM STANDBY...</div>
        ) : logs.map((log, i) => (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            key={i} 
            className="flex gap-3 border-l border-white/5 pl-2"
          >
            <span className="text-muted/50 shrink-0">[{log.time}]</span>
            <span className={
              log.type === 'error' ? 'text-rose-500' : 
              log.type === 'success' ? 'text-emerald-500' : 'text-slate-300'
            }>
              {log.msg}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
