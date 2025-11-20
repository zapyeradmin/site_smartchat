import fs from 'fs';
import path from 'path';

const migrationsDir = path.resolve('supabase', 'migrations');
const outputDir = path.resolve('scripts');
const outputFile = path.join(outputDir, 'combined-schema.sql');

function isSqlFile(file) {
  return file.toLowerCase().endsWith('.sql');
}

function main() {
  if (!fs.existsSync(migrationsDir)) {
    console.error(`Migrations directory not found: ${migrationsDir}`);
    process.exit(1);
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const files = fs.readdirSync(migrationsDir)
    .filter(isSqlFile)
    .sort();

  if (files.length === 0) {
    console.error('No .sql migration files found to combine.');
    process.exit(1);
  }

  let combined = '-- Combined Supabase schema generated from supabase/migrations\n\n';

  for (const file of files) {
    const fullPath = path.join(migrationsDir, file);
    const content = fs.readFileSync(fullPath, 'utf8');
    combined += `-- ===============================================\n`;
    combined += `-- Migration: ${file}\n`;
    combined += `-- ===============================================\n`;
    combined += content.trim() + '\n\n';
  }

  fs.writeFileSync(outputFile, combined, 'utf8');
  console.log(`Combined schema written to: ${outputFile}`);
}

main();