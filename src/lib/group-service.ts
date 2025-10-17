// Mock group/expense service
// TODO: Replace with real API calls to backend

import { Group, Expense } from './types';

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
    
    // Mock expenses
    return [
      {
        id: '1',
        groupId,
        description: 'Hotel booking',
        amount: 150,
        paidBy: '1',
        splitBetween: ['1', '2', '3'],
        date: new Date('2024-01-20'),
      },
      {
        id: '2',
        groupId,
        description: 'Dinner',
        amount: 75,
        paidBy: '2',
        splitBetween: ['1', '2', '3'],
        date: new Date('2024-01-21'),
      },
    ];
  },
};

