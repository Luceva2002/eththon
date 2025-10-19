-- Migrazione: Aggiungi colonne per chiusura gruppo e NFT
-- Esegui questo script nella console SQL di Supabase

-- Aggiungi colonne closed e closed_at alla tabella groups
ALTER TABLE groups 
ADD COLUMN IF NOT EXISTS closed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS nft_token_id TEXT,
ADD COLUMN IF NOT EXISTS nft_tx_hash TEXT,
ADD COLUMN IF NOT EXISTS nft_minted_at TIMESTAMPTZ;

-- Crea un indice per query più veloci sui gruppi chiusi
CREATE INDEX IF NOT EXISTS idx_groups_closed ON groups(closed);
CREATE INDEX IF NOT EXISTS idx_groups_nft ON groups(nft_token_id);

-- Verifica che le colonne siano state aggiunte
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'groups' 
AND column_name IN ('closed', 'closed_at', 'nft_token_id', 'nft_tx_hash', 'nft_minted_at');

