"use client";

import { createConfig, http } from 'wagmi';
import { base, mainnet, arbitrum, arbitrumSepolia } from 'wagmi/chains';
import { coinbaseWallet, metaMask, walletConnect } from 'wagmi/connectors';

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

const connectors = [
  metaMask(),
  coinbaseWallet({ appName: 'Ethton' }),
  ...(walletConnectProjectId ? [walletConnect({ projectId: walletConnectProjectId })] : []),
];

export const wagmiConfig = createConfig({
  chains: [arbitrumSepolia, arbitrum, base, mainnet], // arbitrumSepolia come primo per testing
  connectors,
  transports: {
    [arbitrumSepolia.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
    [mainnet.id]: http(),
  },
});


