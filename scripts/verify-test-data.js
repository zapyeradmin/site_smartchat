import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Faltam variáveis no .env: VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function count(table) {
  const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
  if (error) {
    return { table, error: error.message };
  }
  return { table, count };
}

async function existsSiteSetting(key) {
  const { data, error } = await supabase.from('site_settings').select('key').eq('key', key).limit(1);
  if (error) return { key, error: error.message };
  return { key, exists: (data || []).length > 0 };
}

async function main() {
  console.log('Verificando dados de teste...');
  const tables = ['clients', 'deals', 'tasks', 'news_admin', 'integrations', 'site_settings', 'user_roles'];
  const results = await Promise.all(tables.map(count));
  results.forEach((r) => {
    if (r.error) {
      console.log(`Tabela ${r.table}: erro -> ${r.error}`);
    } else {
      console.log(`Tabela ${r.table}: ${r.count} registros`);
    }
  });

  const settings = await Promise.all([
    existsSiteSetting('site_title'),
    existsSiteSetting('homepage_banner'),
    existsSiteSetting('support_whatsapp'),
  ]);
  settings.forEach((s) => {
    if (s.error) {
      console.log(`Site setting ${s.key}: erro -> ${s.error}`);
    } else {
      console.log(`Site setting ${s.key}: ${s.exists ? 'ok' : 'não encontrado'}`);
    }
  });

  console.log('Verificação concluída.');
}

main().catch((e) => {
  console.error('Falha na verificação:', e?.message || e);
  process.exit(1);
});