'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { Wallet } from '@coinbase/onchainkit/wallet';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { authService } from '@/lib/auth-service';
import { User } from '@/lib/types';
import { resolveEnsName } from '@/lib/ens-service';

export default function ProfilePage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [user, setUser] = useState<User | null>(null);
  const [ensName, setEnsName] = useState<string | null>(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      router.push('/sign-in');
      return;
    }
    setUser(currentUser);
  }, [router]);

  // Resolve ENS name when address changes
  useEffect(() => {
    if (address) {
      resolveEnsName(address).then(setEnsName).catch(() => setEnsName(null));
    }
  }, [address]);

  // Update user wallet address when connected
  useEffect(() => {
    if (isConnected && address) {
      const currentUser = authService.getCurrentUser();
      if (currentUser && currentUser.walletAddress !== address) {
        authService.updateUser({ walletAddress: address }).then(setUser);
      }
    }
  }, [isConnected, address]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Profilo</h1>

      {/* User Info Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Informazioni account</CardTitle>
          <CardDescription>
            I tuoi dati personali e impostazioni
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-2xl">
                {user.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold">{user.name}</h3>
              <p className="text-sm text-muted-foreground">
                {ensName || (address && `${address.slice(0, 6)}...${address.slice(-4)}`)}
              </p>
            </div>
          </div>

          {isConnected && address && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Wallet Address</p>
              <p className="text-sm text-muted-foreground font-mono break-all">
                {address}
              </p>
              {ensName && (
                <p className="text-sm text-primary font-medium">
                  ENS: {ensName}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Wallet Connection Card */}
      <Card>
        <CardHeader>
          <CardTitle>Wallet</CardTitle>
          <CardDescription>
            Gestisci la connessione del tuo wallet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Wallet />
        </CardContent>
      </Card>
    </div>
  );
}
