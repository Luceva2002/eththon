"use client";

// Implementazione reale con Wagmi
import { WalletConnection } from './types';
import { wagmiConfig } from '@/lib/wagmi-config';
import { base } from 'wagmi/chains';
import { connect as wagmiConnect, disconnect as wagmiDisconnect, getAccount, getConnections, switchChain } from 'wagmi/actions';

type WalletProviderType = 'metamask' | 'coinbase' | 'farcaster';

function providerLabel(provider: WalletProviderType): string {
  if (provider === 'metamask') return 'MetaMask';
  if (provider === 'coinbase') return 'Coinbase Wallet';
  return 'Farcaster (WalletConnect)';
}

function getConnectorByProvider(provider: WalletProviderType) {
  const connectors = wagmiConfig.connectors ?? [];
  if (provider === 'metamask') return connectors.find(c => c.id === 'metaMask' || c.name.toLowerCase().includes('metamask'));
  if (provider === 'coinbase') return connectors.find(c => c.id === 'coinbaseWallet' || c.name.toLowerCase().includes('coinbase'));
  return connectors.find(c => c.id === 'walletConnect' || c.name.toLowerCase().includes('walletconnect'));
}

export const walletService = {
  async connect(provider: WalletProviderType = 'metamask'): Promise<WalletConnection> {
    const connector = getConnectorByProvider(provider);
    if (!connector) throw new Error(`Connector non trovato per ${provider}`);

    // Connetti e forza/suggerisci chain Base
    await wagmiConnect(wagmiConfig, { connector, chainId: base.id }).catch(async (err) => {
      // Se il connector non supporta chainId diretto, prova switch dopo
      console.warn('Fallback connect senza chainId:', err);
      await wagmiConnect(wagmiConfig, { connector });
    });

    try {
      await switchChain(wagmiConfig, { chainId: base.id });
    } catch {
      // Ignora se l'utente rifiuta o la chain non è disponibile
    }

    const account = getAccount(wagmiConfig);
    if (!account.address) throw new Error('Connessione wallet fallita');

    return {
      address: account.address,
      provider: providerLabel(provider),
      connected: account.status === 'connected',
    };
  },

  async disconnect(): Promise<void> {
    const connections = getConnections(wagmiConfig);
    for (const c of connections) {
      try {
        await wagmiDisconnect(wagmiConfig, { connector: c.connector });
      } catch (e) {
        console.warn('Errore durante disconnect:', e);
      }
    }
  },

  getConnection(): WalletConnection | null {
    const account = getAccount(wagmiConfig);
    if (account?.address) {
      return {
        address: account.address,
        provider: 'Wallet',
        connected: account.status === 'connected',
      };
    }
    return null;
  },

  isConnected(): boolean {
    const account = getAccount(wagmiConfig);
    return account.status === 'connected';
  },

  getCurrentProvider(): WalletProviderType | null {
    const connections = getConnections(wagmiConfig);
    const active = connections[0];
    if (!active) return null;
    const id = active.connector?.id?.toLowerCase?.() || active.connector?.name?.toLowerCase?.() || '';
    if (id.includes('meta')) return 'metamask';
    if (id.includes('coinbase')) return 'coinbase';
    if (id.includes('walletconnect')) return 'farcaster';
    return null;
  },
};

