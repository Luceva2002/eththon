// Mock wallet connection service
// TODO: Replace with real Web3 provider (e.g., ethers.js, wagmi, RainbowKit)

import { WalletConnection } from './types';

export const walletService = {
  async connect(): Promise<WalletConnection> {
    // Mock wallet connection
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate connection time
    
    // Generate a mock Ethereum address
    const mockAddress = '0x' + Array.from({ length: 40 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    
    const connection: WalletConnection = {
      address: mockAddress,
      provider: 'MetaMask (Mock)',
      connected: true,
    };
    
    // Store connection state
    if (typeof window !== 'undefined') {
      localStorage.setItem('walletConnection', JSON.stringify(connection));
    }
    
    return connection;
  },

  async disconnect(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('walletConnection');
    }
  },

  getConnection(): WalletConnection | null {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('walletConnection');
      if (stored) {
        return JSON.parse(stored);
      }
    }
    return null;
  },

  isConnected(): boolean {
    const connection = this.getConnection();
    return connection?.connected ?? false;
  },
};

