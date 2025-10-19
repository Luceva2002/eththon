-- Migrazione: Aggiungi colonne per chiusura gruppo
-- Esegui questo script nella console SQL di Supabase

-- Aggiungi colonne closed e closed_at alla tabella groups
ALTER TABLE groups 
ADD COLUMN IF NOT EXISTS closed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ;

-- Crea un indice per query più veloci sui gruppi chiusi
CREATE INDEX IF NOT EXISTS idx_groups_closed ON groups(closed);

-- Verifica che le colonne siano state aggiunte
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'groups' 
AND column_name IN ('closed', 'closed_at');

