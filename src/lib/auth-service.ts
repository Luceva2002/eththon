// Mock authentication service
// TODO: Replace with real authentication (e.g., NextAuth, Supabase, etc.)

import { User } from './types';

// Simulated user storage (in-memory for demo)
let currentUser: User | null = null;

export const authService = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async signIn(email: string, _password: string): Promise<User> {
    // Mock authentication - accepts any email/password
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    
    const user: User = {
      id: Math.random().toString(36).substring(7),
      name: email.split('@')[0],
      email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
    };
    
    currentUser = user;
    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
    
    return user;
  },

  async signUp(name: string, email: string, password: string, walletAddress?: string): Promise<User> {
    // Mock registration - accepts any credentials
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    
    const user: User = {
      id: Math.random().toString(36).substring(7),
      name,
      email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      walletAddress,
    };
    
    currentUser = user;
    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
    
    return user;
  },

  async signOut(): Promise<void> {
    currentUser = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
  },

  getCurrentUser(): User | null {
    if (currentUser) return currentUser;
    
    // Try to restore from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user');
      if (stored) {
        currentUser = JSON.parse(stored);
        return currentUser;
      }
    }
    
    return null;
  },

  async updateUser(updates: Partial<User>): Promise<User> {
    if (!currentUser) throw new Error('No user logged in');
    
    currentUser = { ...currentUser, ...updates };
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(currentUser));
    }
    
    return currentUser;
  },
};

