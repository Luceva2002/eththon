// Mock group/expense service
// TODO: Replace with real API calls to backend

import { Group, Expense, Settlement } from './types';

// Mock data storage
const mockGroups: Group[] = [
  {
    id: '1',
    name: 'Weekend Trip',
    currency: 'EUR',
    members: [
      { userId: '1', name: 'Mario Rossi', email: 'mario@example.com', balance: 50 },
      { userId: '2', name: 'Luca Bianchi', email: 'luca@example.com', balance: -25 },
      { userId: '3', name: 'Sara Verdi', email: 'sara@example.com', balance: -25 },
    ],
    createdAt: new Date('2024-01-15'),
    totalOwed: 75,
    totalToReceive: 50,
  },
  {
    id: '2',
    name: 'Apartment Rent',
    currency: 'EUR',
    members: [
      { userId: '1', name: 'Mario Rossi', email: 'mario@example.com', balance: -200 },
      { userId: '4', name: 'Anna Neri', email: 'anna@example.com', balance: 200 },
    ],
    createdAt: new Date('2024-01-01'),
    totalOwed: 200,
    totalToReceive: 0,
  },
];

export const groupService = {
  async getGroups(): Promise<Group[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Try to get from localStorage, fallback to mock data
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('groups');
      if (stored) {
        return JSON.parse(stored);
      }
      // Store initial mock data
      localStorage.setItem('groups', JSON.stringify(mockGroups));
    }
    
    return mockGroups;
  },

  async getGroup(id: string): Promise<Group | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const groups = await this.getGroups();
    return groups.find(g => g.id === id) || null;
  },

  async createGroup(name: string, currency: string, members: string[]): Promise<Group> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newGroup: Group = {
      id: Math.random().toString(36).substring(7),
      name,
      currency,
      members: members.map(email => ({
        userId: Math.random().toString(36).substring(7),
        name: email.split('@')[0],
        email,
        balance: 0,
      })),
      createdAt: new Date(),
      totalOwed: 0,
      totalToReceive: 0,
    };
    
    const groups = await this.getGroups();
    const updated = [...groups, newGroup];
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('groups', JSON.stringify(updated));
    }
    
    return newGroup;
  },

  async getGroupExpenses(groupId: string): Promise<Expense[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Persistenza locale per demo
    if (typeof window !== 'undefined') {
      const key = `expenses_${groupId}`;
      const stored = localStorage.getItem(key);
      if (stored) return JSON.parse(stored);
      localStorage.setItem(key, JSON.stringify([]));
      return [] as Expense[];
    }
    return [] as Expense[];
  },

  async addExpense(groupId: string, expense: Omit<Expense, 'id' | 'groupId' | 'date'> & { date?: Date }): Promise<Expense> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const newExpense: Expense = {
      id: Math.random().toString(36).substring(7),
      groupId,
      description: expense.description,
      amount: expense.amount,
      paidBy: expense.paidBy,
      splitBetween: expense.splitBetween,
      date: expense.date ?? new Date(),
    };
    if (typeof window !== 'undefined') {
      const key = `expenses_${groupId}`;
      const stored = localStorage.getItem(key);
      const arr: Expense[] = stored ? JSON.parse(stored) : [];
      arr.push(newExpense);
      localStorage.setItem(key, JSON.stringify(arr));
    }
    return newExpense;
  },

  createInviteLink(groupId: string): string {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      const token = btoa(`${groupId}:${Date.now()}`);
      return `${origin}/groups/${groupId}?invite=${token}`;
    }
    return `/groups/${groupId}`;
  },

  // Calcola i saldi per ogni membro a partire dalle spese
  computeBalances(group: Group, expenses: Expense[]): Group['members'] {
    const balances: Record<string, number> = {};
    for (const m of group.members) balances[m.userId] = 0;

    for (const e of expenses) {
      const perHead = e.amount / e.splitBetween.length;
      // chi paga anticipa l'intera spesa
      balances[e.paidBy] = (balances[e.paidBy] ?? 0) + e.amount;
      // ciascuno deve la sua quota
      for (const uid of e.splitBetween) {
        balances[uid] = (balances[uid] ?? 0) - perHead;
      }
    }

    return group.members.map(m => ({ ...m, balance: Math.round(balances[m.userId] * 100) / 100 }));
  },

  // Genera suggerimenti di rimborso minimi (greedy) tipo Tricount
  computeSettlements(group: Group, expenses: Expense[]): Settlement[] {
    const members = this.computeBalances(group, expenses);
    const debtors = members.filter(m => m.balance < 0).map(m => ({ userId: m.userId, amount: -m.balance }));
    const creditors = members.filter(m => m.balance > 0).map(m => ({ userId: m.userId, amount: m.balance }));

    // ordina per importo
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
};

