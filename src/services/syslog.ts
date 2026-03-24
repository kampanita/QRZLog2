export type LogType = 'info' | 'error' | 'success' | 'warn';
export interface LogEntry {
  msg: string;
  type: LogType;
  time: string;
}

type Listener = (entry: LogEntry) => void;

const listeners = new Set<Listener>();
const buffer: LogEntry[] = [];
const MAX_BUFFER = 100;

export function sysLog(msg: string, type: LogType = 'info') {
  const entry: LogEntry = {
    msg,
    type,
    time: new Date().toLocaleTimeString(),
  };
  buffer.push(entry);
  if (buffer.length > MAX_BUFFER) buffer.shift();
  listeners.forEach(fn => fn(entry));
}

export function onSysLog(fn: Listener): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

export function getSysLogBuffer(): LogEntry[] {
  return [...buffer];
}
