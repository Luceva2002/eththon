"use client";

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Supabase non configurato: aggiungi NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export type ProfileRow = {
  id?: string;
  wallet_address: string;
  nickname: string;
  created_at?: string;
  updated_at?: string;
};

export type GroupRow = {
  id?: string;
  name: string;
  currency: string;
  owner_wallet: string;
  created_at?: string;
};

export type GroupMemberRow = {
  id?: string;
  group_id: string;
  nickname: string;
  wallet_address?: string | null;
  created_at?: string;
};

export type ExpenseRow = {
  id?: string;
  group_id: string;
  description: string;
  amount: number;
  paid_by_nickname: string;
  split_between_nicknames: string[];
  date?: string;
};

export type PaymentRow = {
  id?: string;
  group_id: string;
  from_nickname: string;
  to_nickname: string;
  amount_fiat: number;
  currency: string;
  amount_crypto?: string | null;
  crypto_symbol?: string | null;
  tx_hash?: string | null;
  created_at?: string;
};


// Computed balances per membro e statistiche di gruppo (opzionali)
export type GroupBalanceRow = {
  id?: string;
  group_id: string;
  nickname: string;
  balance: number;
  currency: string;
  computed_at?: string;
};

export type GroupStatsRow = {
  id?: string;
  group_id: string;
  total_owed: number;
  total_to_receive: number;
  currency: string;
  computed_at?: string;
};


