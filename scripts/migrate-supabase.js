import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Old project credentials captured from previous code (fallback if env not provided)
const OLD_SUPABASE_URL = process.env.OLD_SUPABASE_URL || 'https://gipfqsocmpcolksqvblu.supabase.co';
const OLD_SUPABASE_KEY = process.env.OLD_SUPABASE_SERVICE_ROLE_KEY || process.env.OLD_SUPABASE_ANON_KEY || process.env.OLD_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpcGZxc29jbXBjb2xrc3F2Ymx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4MzkxMDYsImV4cCI6MjA3NDQxNTEwNn0.hswi0NZonXq0PB6fvPI2gmJt3TvfLeMWB4g2C9QOuYY';

// New project credentials from .env
const NEW_SUPABASE_URL = process.env.VITE_SUPABASE_URL;
// Preferir service_role para escrita bulk, depois anon, depois publishable
const NEW_SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!NEW_SUPABASE_URL || !NEW_SUPABASE_KEY) {
  console.error('Missing NEW Supabase credentials. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (or SUPABASE_SERVICE_ROLE_KEY) are set in .env');
  process.exit(1);
}

const source = createClient(OLD_SUPABASE_URL, OLD_SUPABASE_KEY);
const dest = createClient(NEW_SUPABASE_URL, NEW_SUPABASE_KEY);

// Tables discovered in the app using supabase.from(...)
const tables = [
  'clients',
  'deals',
  'tasks',
  'news_admin',
  'integrations',
  'site_settings',
];

function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

async function migrateTable(table) {
  console.log(`\nMigrating table: ${table}`);
  const { data, error } = await source.from(table).select('*');
  if (error) {
    console.error(`Error reading from old project [${table}]:`, error.message);
    throw error;
  }
  const rows = data || [];
  console.log(`Found ${rows.length} rows in ${table}`);
  if (rows.length === 0) return;

  const chunks = chunkArray(rows, 500);
  for (let idx = 0; idx < chunks.length; idx++) {
    const chunk = chunks[idx];
    const { error: writeErr } = await dest.from(table).upsert(chunk);
    if (writeErr) {
      console.error(`Error writing to new project [${table}] chunk ${idx + 1}/${chunks.length}:`, writeErr.message);
      throw writeErr;
    }
    console.log(`Inserted chunk ${idx + 1}/${chunks.length} for ${table}`);
  }
}

async function main() {
  console.log('Starting Supabase data migration...');
  console.log('Source:', OLD_SUPABASE_URL);
  console.log('Destination:', NEW_SUPABASE_URL);

  // Order matters if there are foreign keys: clients -> deals -> tasks -> others
  const ordered = ['clients', 'deals', 'tasks', 'news_admin', 'integrations', 'site_settings'];
  for (const table of ordered) {
    try {
      await migrateTable(table);
    } catch (e) {
      console.error(`Failed migrating table ${table}. If you see RLS or permission errors, provide SUPABASE_SERVICE_ROLE_KEY for both projects or temporarily relax RLS policies.`);
      process.exit(1);
    }
  }

  console.log('\nMigration completed successfully.');
}

main().catch((e) => {
  console.error('Migration failed:', e);
  process.exit(1);
});