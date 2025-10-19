# 📋 Istruzioni Migrazione Database

## ⚠️ IMPORTANTE: Esegui questa migrazione prima di usare la funzione "Chiudi Gruppo"

La funzione di chiusura gruppo richiede due nuove colonne nella tabella `groups` di Supabase.

## 🔧 Come eseguire la migrazione

### Opzione 1: Da Supabase Dashboard (Consigliata)

1. Vai su [Supabase Dashboard](https://supabase.com/dashboard)
2. Seleziona il tuo progetto
3. Vai su **SQL Editor** (icona </> nella sidebar)
4. Clicca su **New Query**
5. Copia e incolla il contenuto del file `supabase-migration-add-closed.sql`
6. Clicca su **Run** (o premi `Ctrl+Enter` / `Cmd+Enter`)
7. Verifica che l'output mostri 2 righe con le colonne `closed` e `closed_at`

### Opzione 2: Da CLI Supabase

```bash
# Se hai Supabase CLI installato
supabase db push --file supabase-migration-add-closed.sql
```

## ✅ Verifica della migrazione

Dopo aver eseguito la migrazione, verifica che sia andata a buon fine:

```sql
-- Esegui questa query in SQL Editor
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'groups' 
AND column_name IN ('closed', 'closed_at');
```

Dovresti vedere 2 righe:
- `closed` → `boolean` → `false`
- `closed_at` → `timestamp with time zone` → `null`

## 🎯 Cosa fa questa migrazione

- ✅ Aggiunge colonna `closed` (boolean, default: false)
- ✅ Aggiunge colonna `closed_at` (timestamp, default: null)
- ✅ Crea indice `idx_groups_closed` per performance
- ✅ Non modifica dati esistenti (tutti i gruppi rimangono aperti)

## 🔄 Setup completo per nuovi database

Se stai creando un database da zero, usa invece il file `supabase-schema.sql` che include già queste colonne.

---

## 📝 Note

- La migrazione è **sicura** e non modifica i dati esistenti
- I gruppi esistenti avranno automaticamente `closed = false`
- Puoi eseguire la migrazione più volte senza problemi (usa `IF NOT EXISTS`)

