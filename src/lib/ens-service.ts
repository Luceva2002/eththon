"use client";

import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

// Usa endpoint pubblico compatibile con CORS (Cloudflare)
const client = createPublicClient({
  chain: mainnet,
  transport: http('https://cloudflare-eth.com'),
});

export async function resolveEnsName(address: `0x${string}`): Promise<string | null> {
  try {
    const name = await client.getEnsName({ address });
    return name ?? null;
  } catch (e) {
    // Evita errori rumorosi in console su contesti senza rete/API key
    return null;
  }
}

export async function resolveEnsAddress(name: string): Promise<`0x${string}` | null> {
  try {
    const address = await client.getEnsAddress({ name });
    return address ?? null;
  } catch (e) {
    return null;
  }
}


