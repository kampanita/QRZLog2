export interface QSO {
  id: string;
  callsign: string;
  rst: string;
  band: string;
  comment?: string;
  created_at: string;
  date?: string;
}

export interface ContestQSO {
  id: string;
  contest_id: string;
  date: string;
  time: string;
  callsign: string;
  band: string;
  s_rst: string;
  s_nr: string;
  r_rst: string;
  r_nr: string;
  r_loc: string;
  my_call: string;
  my_loc: string;
  created_at: string;
}

export interface Repeater {
  id: string;
  loc: string;
  rx: string;
  tx: string;
  off: string;
  t: string;
}

export interface PMRChannel {
  id: string;
  c: string;
  f: string;
  m: string;
  p: string;
  u: string;
}

export interface EmergencyFreq {
  id: string;
  s: string;
  f: string;
  m: string;
  n: string;
  tx: string;
  type: 'EMERG' | 'AIR';
}

export interface FMStation {
  id: string;
  e: string;
  f: string;
  z: string;
  s: string;
}

export interface HardwareRange {
  id: string;
  r: string;
  s: string;
  u: string;
  m: string;
  tx: string;
}

export type Theme = 'tactical' | 'shack' | 'lab' | 'retro' | 'nordic' | 'vulcan' | 'blueprint' | 'forest' | 'cyber' | 'stealth';
export type InterfaceMode = 'classic' | 'ultra';
