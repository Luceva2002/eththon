-- Schema completo per Ethton su Supabase
-- Esegui questo script nella console SQL di Supabase

-- ============================================
-- TABELLE PRINCIPALI
-- ============================================

-- Tabella profili utenti
CREATE TABLE IF NOT EXISTS profiles (
  id BIGSERIAL PRIMARY KEY,
  wallet_address TEXT UNIQUE NOT NULL,
  nickname TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabella gruppi
CREATE TABLE IF NOT EXISTS groups (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  owner_wallet TEXT,
  closed BOOLEAN DEFAULT false,
  closed_at TIMESTAMPTZ,
  nft_token_id TEXT,
  nft_tx_hash TEXT,
  nft_minted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabella membri dei gruppi
CREATE TABLE IF NOT EXISTS group_members (
  id BIGSERIAL PRIMARY KEY,
  group_id TEXT NOT NULL,
  nickname TEXT NOT NULL,
  wallet_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabella spese
CREATE TABLE IF NOT EXISTS expenses (
  id BIGSERIAL PRIMARY KEY,
  group_id TEXT NOT NULL,
  description TEXT NOT NULL,
  amount DOUBLE PRECISION NOT NULL,
  paid_by_nickname TEXT NOT NULL,
  split_between_nicknames TEXT[] NOT NULL,
  date TIMESTAMPTZ DEFAULT now()
);

-- Tabella pagamenti
CREATE TABLE IF NOT EXISTS payments (
  id BIGSERIAL PRIMARY KEY,
  group_id TEXT NOT NULL,
  from_nickname TEXT NOT NULL,
  to_nickname TEXT NOT NULL,
  amount_fiat DOUBLE PRECISION NOT NULL,
  currency TEXT NOT NULL,
  amount_crypto TEXT,
  crypto_symbol TEXT,
  tx_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabella bilanci calcolati (cache)
CREATE TABLE IF NOT EXISTS group_balances (
  id BIGSERIAL PRIMARY KEY,
  group_id TEXT NOT NULL,
  nickname TEXT NOT NULL,
  balance DOUBLE PRECISION NOT NULL,
  currency TEXT NOT NULL,
  computed_at TIMESTAMPTZ DEFAULT now()
);

-- Tabella statistiche gruppo (cache)
CREATE TABLE IF NOT EXISTS group_stats (
  id BIGSERIAL PRIMARY KEY,
  group_id TEXT NOT NULL UNIQUE,
  total_owed DOUBLE PRECISION NOT NULL,
  total_to_receive DOUBLE PRECISION NOT NULL,
  currency TEXT NOT NULL,
  computed_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- INDICI PER PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_expenses_group ON expenses(group_id);
CREATE INDEX IF NOT EXISTS idx_payments_group ON payments(group_id);
CREATE INDEX IF NOT EXISTS idx_group_balances_group ON group_balances(group_id);
CREATE INDEX IF NOT EXISTS idx_group_balances_nickname ON group_balances(group_id, nickname);
CREATE INDEX IF NOT EXISTS idx_groups_closed ON groups(closed);
CREATE INDEX IF NOT EXISTS idx_groups_nft ON groups(nft_token_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Abilita RLS su tutte le tabelle
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_stats ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES: ACCESSO PUBBLICO PER ANON
-- (Per semplicità, permetti tutto al ruolo anon)
-- In produzione, dovresti restringere queste policies
-- ============================================

-- Profiles: tutti possono leggere e scrivere
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;

CREATE POLICY "profiles_select_policy" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_policy" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "profiles_update_policy" ON profiles FOR UPDATE USING (true);

-- Groups: tutti possono leggere e scrivere
DROP POLICY IF EXISTS "groups_select_policy" ON groups;
DROP POLICY IF EXISTS "groups_insert_policy" ON groups;
DROP POLICY IF EXISTS "groups_update_policy" ON groups;

CREATE POLICY "groups_select_policy" ON groups FOR SELECT USING (true);
CREATE POLICY "groups_insert_policy" ON groups FOR INSERT WITH CHECK (true);
CREATE POLICY "groups_update_policy" ON groups FOR UPDATE USING (true);

-- Group members: tutti possono leggere e scrivere
DROP POLICY IF EXISTS "group_members_select_policy" ON group_members;
DROP POLICY IF EXISTS "group_members_insert_policy" ON group_members;

CREATE POLICY "group_members_select_policy" ON group_members FOR SELECT USING (true);
CREATE POLICY "group_members_insert_policy" ON group_members FOR INSERT WITH CHECK (true);

-- Expenses: tutti possono leggere e scrivere
DROP POLICY IF EXISTS "expenses_select_policy" ON expenses;
DROP POLICY IF EXISTS "expenses_insert_policy" ON expenses;

CREATE POLICY "expenses_select_policy" ON expenses FOR SELECT USING (true);
CREATE POLICY "expenses_insert_policy" ON expenses FOR INSERT WITH CHECK (true);

-- Payments: tutti possono leggere e scrivere
DROP POLICY IF EXISTS "payments_select_policy" ON payments;
DROP POLICY IF EXISTS "payments_insert_policy" ON payments;

CREATE POLICY "payments_select_policy" ON payments FOR SELECT USING (true);
CREATE POLICY "payments_insert_policy" ON payments FOR INSERT WITH CHECK (true);

-- Group balances: tutti possono leggere, scrivere e cancellare
DROP POLICY IF EXISTS "group_balances_select_policy" ON group_balances;
DROP POLICY IF EXISTS "group_balances_insert_policy" ON group_balances;
DROP POLICY IF EXISTS "group_balances_delete_policy" ON group_balances;

CREATE POLICY "group_balances_select_policy" ON group_balances FOR SELECT USING (true);
CREATE POLICY "group_balances_insert_policy" ON group_balances FOR INSERT WITH CHECK (true);
CREATE POLICY "group_balances_delete_policy" ON group_balances FOR DELETE USING (true);

-- Group stats: tutti possono leggere, scrivere e cancellare
DROP POLICY IF EXISTS "group_stats_select_policy" ON group_stats;
DROP POLICY IF EXISTS "group_stats_insert_policy" ON group_stats;
DROP POLICY IF EXISTS "group_stats_delete_policy" ON group_stats;

CREATE POLICY "group_stats_select_policy" ON group_stats FOR SELECT USING (true);
CREATE POLICY "group_stats_insert_policy" ON group_stats FOR INSERT WITH CHECK (true);
CREATE POLICY "group_stats_delete_policy" ON group_stats FOR DELETE USING (true);

-- ============================================
-- VERIFICHE
-- ============================================

-- Verifica che le tabelle siano state create
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'groups', 'group_members', 'expenses', 'payments', 'group_balances', 'group_stats');

-- Verifica che RLS sia abilitato
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'groups', 'group_members', 'expenses', 'payments', 'group_balances', 'group_stats');

