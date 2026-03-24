import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Trash2, Download, Play, Pause } from 'lucide-react';
import { motion } from 'motion/react';
import { LogEntry, onSysLog, getSysLogBuffer, sysLog } from '../services/syslog';

export default function Console() {
  const [logs, setLogs] = useState<LogEntry[]>(getSysLogBuffer);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(isPaused);

  useEffect(() => { pausedRef.current = isPaused; }, [isPaused]);

  useEffect(() => {
    sysLog('System Ready. Debug Console active.', 'success');

    const unsub = onSysLog((entry) => {
      setLogs(prev => [...prev.slice(-99), entry]);
    });

    // Heartbeat every 30s
    const hb = setInterval(() => {
      sysLog('HEARTBEAT: System OK — SDR engine idle', 'info');
    }, 30000);

    return () => { unsub(); clearInterval(hb); };
  }, []);

  useEffect(() => {
    if (scrollRef.current && !isPaused) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isPaused]);

  function clearLogs() {
    setLogs([]);
  }

  function downloadLogs() {
    const text = logs.map(l => `[${l.time}] [${l.type.toUpperCase()}] ${l.msg}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `qrzlog-console-${new Date().toISOString().slice(0, 10)}.log`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const typeColor: Record<string, string> = {
    info: 'text-sky-400',
    error: 'text-rose-500',
    success: 'text-emerald-400',
    warn: 'text-amber-400',
  };

  return (
    <div className="glass-panel overflow-hidden border-t-4 border-slate-700 flex flex-col h-[300px]">
      <div className="bg-slate-900/80 px-4 py-2 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-accent" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white">Debug Console</span>
          <span className="text-[9px] font-mono text-muted ml-2">{logs.length} entries</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={downloadLogs} className="text-muted hover:text-accent transition-colors" title="Download logs">
            <Download size={14} />
          </button>
          <button onClick={() => setIsPaused(!isPaused)} className="text-muted hover:text-accent transition-colors" title={isPaused ? 'Resume' : 'Pause'}>
            {isPaused ? <Play size={14} /> : <Pause size={14} />}
          </button>
          <button onClick={clearLogs} className="text-muted hover:text-rose-500 transition-colors" title="Clear">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 p-4 font-mono text-[10px] space-y-1 overflow-y-auto scrollbar-hide bg-black/40"
      >
        {logs.length === 0 ? (
          <div className="text-muted/30 italic">&gt; LOGGING SYSTEM STANDBY...</div>
        ) : logs.map((log, i) => (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            key={i} 
            className="flex gap-3 border-l-2 border-white/5 pl-2"
          >
            <span className="text-muted/50 shrink-0">[{log.time}]</span>
            <span className={typeColor[log.type] || 'text-slate-300'}>
              &gt; {log.msg}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
