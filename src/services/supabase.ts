import { createClient } from '@supabase/supabase-js';
import { sysLog } from './syslog';

const SB_URL = 'https://svcakitmimdhltwcmadd.supabase.co';
const SB_KEY = 'sb_publishable_uR_yVZpJ2wOkUD0bihyGBg_E__lJACJ';

export const supabase = createClient(SB_URL, SB_KEY);
sysLog(`Supabase init: ${SB_URL}`, 'info');

export async function fetchLogs() {
  const { data, error } = await supabase
    .from('logs')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { sysLog(`Cloud Sync Error (logs): ${error.message}`, 'error'); throw error; }
  sysLog(`Logs fetched: ${data?.length || 0} records`, 'info');
  return data;
}

export async function saveLog(log: any) {
  const { id, ...data } = log;
  if (id && !id.startsWith('local_')) {
    const { error } = await supabase.from('logs').update(data).eq('id', id);
    if (error) { sysLog(`Log update error: ${error.message}`, 'error'); throw error; }
    sysLog(`Log updated: ${data.callsign}`, 'success');
    return log;
  } else {
    const { data: inserted, error } = await supabase.from('logs').insert([data]).select();
    if (error) { sysLog(`Log insert error: ${error.message}`, 'error'); throw error; }
    sysLog(`Log created: ${data.callsign}`, 'success');
    return inserted[0];
  }
}

export async function deleteLog(id: string) {
  const { error } = await supabase.from('logs').delete().eq('id', id);
  if (error) { sysLog(`Delete Error: ${error.message}`, 'error'); throw error; }
  sysLog(`Log deleted: ${id}`, 'warn');
}

export async function fetchTable(tableName: string) {
  const { data, error } = await supabase.from(tableName).select('*');
  if (error) { sysLog(`Fetch ${tableName} error: ${error.message}`, 'error'); throw error; }
  sysLog(`Synced ${tableName}: ${data?.length || 0} rows`, 'info');
  return data;
}

export async function saveToTable(tableName: string, item: any) {
  const { data: upserted, error } = await supabase.from(tableName).upsert([item]).select();
  if (error) { sysLog(`Upsert ${tableName} error: ${error.message}`, 'error'); throw error; }
  sysLog(`Resource ${tableName} upserted.`, 'success');
  return upserted ? upserted[0] : item;
}

export async function deleteFromTable(tableName: string, id: string) {
  const { error } = await supabase.from(tableName).delete().eq('id', id);
  if (error) { sysLog(`Delete ${tableName} error: ${error.message}`, 'error'); throw error; }
  sysLog(`Resource ${tableName}/${id} deleted.`, 'warn');
}

export async function fetchContestLogs(contestId?: string) {
  let query = supabase.from('contest_logs').select('*').order('created_at', { ascending: false });
  if (contestId) {
    query = query.eq('contest_id', contestId);
  }
  const { data, error } = await query;
  if (error) { sysLog(`Contest logs fetch error: ${error.message}`, 'error'); throw error; }
  return data;
}

export async function saveContestLog(log: any) {
  const { data, error } = await supabase.from('contest_logs').insert([log]).select();
  if (error) { sysLog(`Contest log error: ${error.message}`, 'error'); throw error; }
  sysLog(`Contest QSO logged: ${log.callsign}`, 'success');
  return data[0];
}

export async function deleteContestLog(id: string) {
  const { error } = await supabase.from('contest_logs').delete().eq('id', id);
  if (error) { sysLog(`Contest log delete error: ${error.message}`, 'error'); throw error; }
  sysLog(`Contest log deleted: ${id}`, 'warn');
}

export async function uploadSeedData(tableName: string, seed: any[]) {
  const { error } = await supabase.from(tableName).upsert(seed, { onConflict: 'id' });
  if (error) { sysLog(`Seeding Failed ${tableName}: ${error.message}`, 'error'); throw error; }
  sysLog(`Seeding OK: ${tableName} (${seed.length} items)`, 'success');
}
