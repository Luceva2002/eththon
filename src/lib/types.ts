// Core types for the application

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  walletAddress?: string;
}

export interface Group {
  id: string;
  name: string;
  currency: string;
  members: GroupMember[];
  createdAt: Date;
  totalOwed: number;
  totalToReceive: number;
}

export interface GroupMember {
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  balance: number; // positive = owed to them, negative = they owe
}

export interface Expense {
  id: string;
  groupId: string;
  description: string;
  amount: number;
  paidBy: string;
  splitBetween: string[];
  date: Date;
}

export interface WalletConnection {
  address: string;
  provider: string;
  connected: boolean;
}

