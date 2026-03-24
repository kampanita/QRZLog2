import { createClient } from '@supabase/supabase-js';

const SB_URL = 'https://svcakitmimdhltwcmadd.supabase.co';
const SB_KEY = 'sb_publishable_uR_yVZpJ2wOkUD0bihyGBg_E__lJACJ';

export const supabase = createClient(SB_URL, SB_KEY);

export async function fetchLogs() {
  const { data, error } = await supabase
    .from('logs')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function saveLog(log: any) {
  const { id, ...data } = log;
  if (id && !id.startsWith('local_')) {
    const { error } = await supabase.from('logs').update(data).eq('id', id);
    if (error) throw error;
    return log;
  } else {
    const { data: inserted, error } = await supabase.from('logs').insert([data]).select();
    if (error) throw error;
    return inserted[0];
  }
}

export async function deleteLog(id: string) {
  const { error } = await supabase.from('logs').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchTable(tableName: string) {
  const { data, error } = await supabase.from(tableName).select('*');
  if (error) throw error;
  return data;
}

export async function saveToTable(tableName: string, item: any) {
  const { data: upserted, error } = await supabase.from(tableName).upsert([item]).select();
  if (error) throw error;
  return upserted ? upserted[0] : item;
}

export async function deleteFromTable(tableName: string, id: string) {
  const { error } = await supabase.from(tableName).delete().eq('id', id);
  if (error) throw error;
}

export async function fetchContestLogs(contestId?: string) {
  let query = supabase.from('contest_logs').select('*').order('created_at', { ascending: false });
  if (contestId) {
    query = query.eq('contest_id', contestId);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function saveContestLog(log: any) {
  const { data, error } = await supabase.from('contest_logs').insert([log]).select();
  if (error) throw error;
  return data[0];
}

export async function deleteContestLog(id: string) {
  const { error } = await supabase.from('contest_logs').delete().eq('id', id);
  if (error) throw error;
}

export async function uploadSeedData(tableName: string, seed: any[]) {
  const { error } = await supabase.from(tableName).upsert(seed, { onConflict: 'id' });
  if (error) throw error;
}
