// Servizio gruppi/spese con persistenza su Supabase e fallback locale

import { Group, Expense, Settlement } from './types';
import { authService } from './auth-service';
import { supabase, GroupRow, GroupMemberRow, ExpenseRow, PaymentRow, GroupBalanceRow, GroupStatsRow } from './supabase-client';

function toDate(value: string | Date | undefined): Date {
  if (!value) return new Date();
  return value instanceof Date ? value : new Date(value);
}

async function safe<T>(fn: () => Promise<T>): Promise<{ ok: true; data: T } | { ok: false; error: unknown }> {
  try {
    const data = await fn();
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e };
  }
}

export const groupService = {
  // Lista gruppi con membri (nickname). Totali calcolati da spese e pagamenti.
  async getGroups(): Promise<Group[]> {
    const res = await safe(async () => {
      const { data: groupsData, error } = await supabase.from('groups').select('*');
      if (error) throw error;
      const groups: Group[] = [];
      for (const g of groupsData as GroupRow[]) {
        const { data: membersData } = await supabase
          .from('group_members')
          .select('*')
          .eq('group_id', g.id);
        const members = (membersData as GroupMemberRow[] | null)?.map((m) => ({
          userId: m.nickname,
          name: m.nickname,
          email: '',
          balance: 0,
        })) || [];

        const expenses = await this.getGroupExpenses(String(g.id));
        const payments = await this.getGroupPayments(String(g.id));
        const computedMembers = this.computeBalancesWithPayments({
          id: String(g.id),
          name: g.name,
          currency: g.currency,
          members,
          createdAt: toDate(g.created_at),
          totalOwed: 0,
          totalToReceive: 0,
        }, expenses, payments);

        const totalOwed = computedMembers.filter(m => m.balance < 0).reduce((s, m) => s + Math.abs(m.balance), 0);
        const totalToReceive = computedMembers.filter(m => m.balance > 0).reduce((s, m) => s + m.balance, 0);

        // Persisti i calcoli su Supabase (best-effort)
        await this.persistComputed(String(g.id), g.currency, computedMembers, totalOwed, totalToReceive);

        groups.push({
          id: String(g.id),
          name: g.name,
          currency: g.currency,
          members: computedMembers,
          createdAt: toDate(g.created_at),
          totalOwed: Math.round(totalOwed * 100) / 100,
          totalToReceive: Math.round(totalToReceive * 100) / 100,
        });
      }
      return groups;
    });

    if (res.ok) return res.data;
    return [];
  },

  async getGroup(id: string): Promise<Group | null> {
    const res = await safe(async () => {
      const { data: groupData, error } = await supabase.from('groups').select('*').eq('id', id).single();
      if (error) throw error;
      const { data: membersData } = await supabase.from('group_members').select('*').eq('group_id', id);
      const members = (membersData as GroupMemberRow[] | null)?.map((m) => ({
        userId: m.nickname,
        name: m.nickname,
        email: '',
        balance: 0,
      })) || [];
      const group: Group = {
        id: String(groupData.id),
        name: groupData.name,
        currency: groupData.currency,
        members,
        createdAt: toDate(groupData.created_at),
        totalOwed: 0,
        totalToReceive: 0,
      };

      // calcola con spese + pagamenti
      const expenses = await this.getGroupExpenses(id);
      const payments = await this.getGroupPayments(id);
      const computedMembers = this.computeBalancesWithPayments(group, expenses, payments);
      const totalOwed = computedMembers.filter(m => m.balance < 0).reduce((s, m) => s + Math.abs(m.balance), 0);
      const totalToReceive = computedMembers.filter(m => m.balance > 0).reduce((s, m) => s + m.balance, 0);

      // Persisti su Supabase (best-effort)
      await this.persistComputed(id, group.currency, computedMembers, totalOwed, totalToReceive);

      return { ...group, members: computedMembers, totalOwed, totalToReceive };
    });
    if (res.ok) return res.data;

    // Fallback
    if (typeof window !== 'undefined') {
      const groups = await this.getGroups();
      return groups.find(g => g.id === id) || null;
    }
    return null;
  },

  async createGroup(name: string, currency: string, members: string[]): Promise<Group> {
    // Creator
    const currentUser = authService.getCurrentUser();
    const creatorNickname = currentUser?.name || 'Creator';
    const ownerWallet = currentUser?.walletAddress?.toLowerCase() || '';

    console.log('📝 Creazione gruppo:', { name, currency, creatorNickname, ownerWallet, members });

    const res = await safe(async () => {
      // Inserisci gruppo
      const { data: inserted, error } = await supabase
        .from('groups')
        .insert([{ name, currency, owner_wallet: ownerWallet }])
        .select('*')
        .single();
      
      if (error) {
        console.error('❌ Errore inserimento gruppo:', error);
        throw new Error(`Errore gruppo: ${error.message}`);
      }
      
      console.log('✅ Gruppo creato:', inserted);
      const groupId = String(inserted.id);

      // Inserisci membri
      const nicknames = [creatorNickname, ...members.filter(m => m.trim())];
      const rows: GroupMemberRow[] = nicknames.map((nickname, idx) => ({
        group_id: groupId,
        nickname,
        wallet_address: idx === 0 ? ownerWallet || null : null,
      }));
      
      console.log('📝 Inserimento membri:', rows);
      const { error: memErr } = await supabase.from('group_members').insert(rows);
      if (memErr) {
        console.error('❌ Errore inserimento membri:', memErr);
        throw new Error(`Errore membri: ${memErr.message}`);
      }
      
      console.log('✅ Membri inseriti');
      return groupId;
    });

    if (!res.ok) {
      console.error('❌ Creazione fallita:', res.error);
      const errorMsg = res.error instanceof Error ? res.error.message : 'Creazione gruppo fallita';
      throw new Error(errorMsg);
    }
    const id = res.data;

    const group: Group = {
      id,
      name,
      currency,
      members: [
        { userId: creatorNickname, name: creatorNickname, email: '', balance: 0 },
        ...members.filter(Boolean).map((n) => ({ userId: n.trim(), name: n.trim(), email: '', balance: 0 })),
      ],
      createdAt: new Date(),
      totalOwed: 0,
      totalToReceive: 0,
    };

    return group;
  },

  async getGroupExpenses(groupId: string): Promise<Expense[]> {
    const res = await safe(async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('group_id', groupId)
        .order('date', { ascending: true });
      if (error) throw error;
      const list = (data as ExpenseRow[] | null) || [];
      return list.map((row) => ({
        id: String(row.id),
        groupId,
        description: row.description,
        amount: row.amount,
        paidBy: row.paid_by_nickname,
        splitBetween: row.split_between_nicknames,
        date: toDate(row.date),
      }));
    });

    if (res.ok) return res.data;
    return [];
  },

  async addExpense(groupId: string, expense: Omit<Expense, 'id' | 'groupId' | 'date'> & { date?: Date }): Promise<Expense> {
    const res = await safe(async () => {
      const row: ExpenseRow = {
        group_id: groupId,
        description: expense.description,
        amount: expense.amount,
        paid_by_nickname: expense.paidBy,
        split_between_nicknames: expense.splitBetween,
        date: new Date().toISOString(),
      };
      const { data, error } = await supabase.from('expenses').insert(row).select('*').single();
      if (error) throw error;
      return {
        id: String(data.id),
        groupId,
        description: expense.description,
        amount: expense.amount,
        paidBy: expense.paidBy,
        splitBetween: expense.splitBetween,
        date: new Date(row.date!),
      } as Expense;
    });

    if (res.ok) return res.data;
    throw new Error('Inserimento spesa fallito su Supabase');
  },

  createInviteLink(groupId: string): string {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      const token = btoa(`${groupId}:${Date.now()}`);
      return `${origin}/groups/${groupId}?invite=${token}`;
    }
    return `/groups/${groupId}`;
  },

  // Pagamenti
  async getGroupPayments(groupId: string): Promise<PaymentRow[]> {
    const res = await safe(async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data as PaymentRow[]) || [];
    });
    if (res.ok) return res.data;
    return [];
  },

  async recordPayment(p: Omit<PaymentRow, 'id' | 'created_at'>): Promise<void> {
    await safe(async () => {
      const { error } = await supabase.from('payments').insert(p);
      if (error) throw error;
      return;
    });
  },

  // Calcola i saldi considerando spese e pagamenti registrati
  computeBalances(group: Group, expenses: Expense[]): Group['members'] {
    const balances: Record<string, number> = {};
    for (const m of group.members) balances[m.userId] = 0;

    for (const e of expenses) {
      const perHead = e.amount / e.splitBetween.length;
      // Chi paga riceve credito
      balances[e.paidBy] = (balances[e.paidBy] ?? 0) + e.amount;
      // Chi deve pagare riceve debito
      for (const uid of e.splitBetween) {
        balances[uid] = (balances[uid] ?? 0) - perHead;
      }
    }

    const result = group.members.map(m => ({ ...m, balance: Math.round(balances[m.userId] * 100) / 100 }));
    console.log('💰 Bilanci calcolati:', result);
    return result;
  },

  computeBalancesWithPayments(group: Group, expenses: Expense[], payments: PaymentRow[]): Group['members'] {
    const base = this.computeBalances(group, expenses);
    const map: Record<string, number> = Object.fromEntries(base.map(m => [m.userId, m.balance]));

    for (const p of payments) {
      // p.from_nickname paga p.to_nickname amount_fiat
      map[p.from_nickname] = (map[p.from_nickname] ?? 0) + p.amount_fiat; // diminuisce il debito
      map[p.to_nickname] = (map[p.to_nickname] ?? 0) - p.amount_fiat; // diminuisce il credito
    }

    return base.map(m => ({ ...m, balance: Math.round((map[m.userId] ?? 0) * 100) / 100 }));
  },

  // Genera suggerimenti di rimborso minimi (greedy) tipo Tricount
  computeSettlements(group: Group, expenses: Expense[]): Settlement[] {
    const members = this.computeBalances(group, expenses);
    const debtors = members.filter(m => m.balance < 0).map(m => ({ userId: m.userId, amount: -m.balance }));
    const creditors = members.filter(m => m.balance > 0).map(m => ({ userId: m.userId, amount: m.balance }));

    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const settlements: Settlement[] = [];
    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
      const pay = Math.min(debtors[i].amount, creditors[j].amount);
      settlements.push({ fromUserId: debtors[i].userId, toUserId: creditors[j].userId, amount: Math.round(pay * 100) / 100 });
      debtors[i].amount -= pay;
      creditors[j].amount -= pay;
      if (debtors[i].amount < 0.01) i++;
      if (creditors[j].amount < 0.01) j++;
    }
    return settlements;
  },

  // Variante che considera anche i pagamenti registrati su Supabase
  computeSettlementsWithPayments(group: Group, expenses: Expense[], payments: PaymentRow[]): Settlement[] {
    const members = this.computeBalancesWithPayments(group, expenses, payments);
    const debtors = members.filter(m => m.balance < 0).map(m => ({ userId: m.userId, amount: -m.balance }));
    const creditors = members.filter(m => m.balance > 0).map(m => ({ userId: m.userId, amount: m.balance }));

    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const settlements: Settlement[] = [];
    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
      const pay = Math.min(debtors[i].amount, creditors[j].amount);
      settlements.push({ fromUserId: debtors[i].userId, toUserId: creditors[j].userId, amount: Math.round(pay * 100) / 100 });
      debtors[i].amount -= pay;
      creditors[j].amount -= pay;
      if (debtors[i].amount < 0.01) i++;
      if (creditors[j].amount < 0.01) j++;
    }
    return settlements;
  },

  // Salva i risultati di calcolo su Supabase (tabelle opzionali)
  async persistComputed(
    groupId: string,
    currency: string,
    members: Group['members'],
    totalOwed: number,
    totalToReceive: number,
  ): Promise<void> {
    // Best-effort: non blocca il flusso se fallisce
    try {
      const balanceRows: GroupBalanceRow[] = members.map((m) => ({
        group_id: groupId,
        nickname: m.userId,
        balance: m.balance,
        currency,
      }));
      // Sostituisci tutti i bilanci correnti del gruppo
      await supabase.from('group_balances').delete().eq('group_id', groupId);
      await supabase.from('group_balances').insert(balanceRows);

      const stats: GroupStatsRow = {
        group_id: groupId,
        total_owed: Math.round(totalOwed * 100) / 100,
        total_to_receive: Math.round(totalToReceive * 100) / 100,
        currency,
      };
      // Conserva solo l'ultimo snapshot
      await supabase.from('group_stats').delete().eq('group_id', groupId);
      await supabase.from('group_stats').insert(stats);
    } catch (e) {
      // Silenzioso: l'app continua a funzionare anche senza tabelle
      console.warn('Persistenza calcoli su Supabase non riuscita (ok)', e);
    }
  },

  // Legge il saldo dell'utente per un gruppo dalla tabella group_balances;
  // fallback: ricalcola da expenses/payments se la tabella non esiste/vuota
  async getMyBalanceForGroup(groupId: string, myNickname?: string): Promise<{ receive: number; owe: number; currency: string }> {
    console.log('🔍 getMyBalanceForGroup:', { groupId, myNickname });
    
    // Ottieni valuta del gruppo
    const g = await this.getGroup(groupId);
    const currency = g?.currency || 'EUR';

    if (myNickname) {
      try {
        const { data, error } = await supabase
          .from('group_balances')
          .select('*')
          .eq('group_id', groupId)
          .eq('nickname', myNickname)
          .maybeSingle();
        if (!error && data && typeof (data as GroupBalanceRow).balance === 'number') {
          const bal = (data as GroupBalanceRow).balance;
          console.log('📊 Saldo da Supabase:', { nickname: myNickname, balance: bal, receive: Math.max(0, bal), owe: Math.max(0, -bal) });
          return { receive: Math.max(0, bal), owe: Math.max(0, -bal), currency };
        }
      } catch (e) {
        console.log('⚠️ Fallback a calcolo locale:', e);
      }
    }

    // Fallback locale
    if (g) {
      const expenses = await this.getGroupExpenses(groupId);
      const payments = await this.getGroupPayments(groupId);
      const members = this.computeBalancesWithPayments(g, expenses, payments);
      console.log('👥 Tutti i membri:', members);
      const me = myNickname ? members.find(m => m.userId === myNickname) : undefined;
      const bal = me?.balance ?? 0;
      console.log('📊 Mio saldo calcolato:', { nickname: myNickname, found: !!me, balance: bal, receive: Math.max(0, bal), owe: Math.max(0, -bal) });
      return { receive: Math.max(0, bal), owe: Math.max(0, -bal), currency };
    }
    return { receive: 0, owe: 0, currency };
  },
};

