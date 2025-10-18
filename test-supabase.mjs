// Test rapido connessione Supabase
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Leggi .env.local manualmente
const envFile = readFileSync('.env.local', 'utf-8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('\n🔍 Verifica configurazione Supabase\n');
console.log('URL:', SUPABASE_URL);
console.log('Key:', SUPABASE_ANON_KEY ? `${SUPABASE_ANON_KEY.substring(0, 20)}...` : 'NON CONFIGURATA');

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('\n❌ Variabili d\'ambiente mancanti!\n');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('\n📡 Test connessione al database...\n');

try {
  // Test 1: Verifica tabelle
  const { data: tables, error: tableError } = await supabase
    .from('groups')
    .select('*')
    .limit(1);

  if (tableError) {
    console.error('❌ Errore accesso tabella groups:', tableError.message);
    console.log('\n💡 Suggerimento: Esegui lo script supabase-schema.sql nel SQL Editor di Supabase\n');
    process.exit(1);
  }

  console.log('✅ Connessione OK - Tabella groups accessibile');
  console.log(`   Gruppi nel database: ${tables?.length || 0}`);

  // Test 2: Verifica altre tabelle
  const tablesToCheck = ['group_members', 'expenses', 'payments', 'group_balances', 'group_stats'];
  
  for (const table of tablesToCheck) {
    const { error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`⚠️  Tabella ${table}: ${error.message}`);
    } else {
      console.log(`✅ Tabella ${table}: OK`);
    }
  }

  console.log('\n✨ Supabase configurato correttamente!\n');
  console.log('Ora puoi:');
  console.log('1. Aprire http://localhost:3000');
  console.log('2. Fare login con un wallet');
  console.log('3. Creare un gruppo');
  console.log('4. Aggiungere spese\n');

} catch (error) {
  console.error('\n❌ Errore:', error.message);
  console.log('\n💡 Verifica che:');
  console.log('- Il progetto Supabase sia attivo');
  console.log('- Le credenziali in .env.local siano corrette');
  console.log('- Lo schema sia stato caricato (esegui supabase-schema.sql)\n');
  process.exit(1);
}

