"use client";

import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
});

export async function resolveEnsName(address: `0x${string}`): Promise<string | null> {
  try {
    const name = await client.getEnsName({ address });
    return name ?? null;
  } catch {
    return null;
  }
}

export async function resolveEnsAddress(name: string): Promise<`0x${string}` | null> {
  try {
    const address = await client.getEnsAddress({ name });
    return address ?? null;
  } catch {
    return null;
  }
}


