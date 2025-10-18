'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { authService } from '@/lib/auth-service';
import { walletService } from '@/lib/wallet-service';
import { WalletConnectButton } from '@/components/wallet-connect-button';
import { User } from '@/lib/types';
import { resolveEnsName } from '@/lib/ens-service';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [ensName, setEnsName] = useState<string | null>(null);
  const [nickname, setNickname] = useState('');
  const [savingNick, setSavingNick] = useState(false);
  const [isSwitching, setIsSwitching] = useState<'metamask' | 'coinbase' | 'farcaster' | null>(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      router.push('/sign-in');
      return;
    }
    setUser(currentUser);
    setIsConnected(walletService.isConnected());
    if (currentUser.walletAddress) {
      resolveEnsName(currentUser.walletAddress as `0x${string}`).then(setEnsName).catch(() => {});
    }
  }, [router]);

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await walletService.disconnect();
      
      // Remove wallet address from user
      if (user) {
        const updated = await authService.updateUser({ walletAddress: undefined });
        setUser(updated);
      }
      
      setIsConnected(false);
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleWalletConnect = async (address: string) => {
    if (user) {
      const updated = await authService.updateUser({ walletAddress: address });
      setUser(updated);
      setIsConnected(true);
      try {
        const name = await resolveEnsName(address as `0x${string}`);
        setEnsName(name);
      } catch {}
    }
  };

  const switchProvider = async (provider: 'metamask' | 'coinbase' | 'farcaster') => {
    setIsSwitching(provider);
    try {
      const { address } = await walletService.connect(provider);
      await handleWalletConnect(address);
    } catch (e) {
      console.error('Switch provider error', e);
    } finally {
      setIsSwitching(null);
    }
  };

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
              <p className="text-sm text-muted-foreground">Membro da gennaio 2024</p>
            </div>
          </div>
            
        </CardContent>
      </Card>

      {/* Wallet gestione provider */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Wallet</CardTitle>
          <CardDescription>Connetti/switcha tra MetaMask, Coinbase (Base) e Farcaster</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg border bg-muted/30">
            {isConnected && user.walletAddress ? (
              <div>
                <p className="text-sm">Address</p>
                <p className="text-xs font-mono text-muted-foreground">
                  {user.walletAddress.slice(0, 12)}...{user.walletAddress.slice(-10)}
                </p>
                {ensName && <p className="text-xs text-muted-foreground mt-1">ENS: {ensName}</p>}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nessun wallet connesso</p>
            )}
          </div>

          {/* Nickname prima accesso */}
          <div className="space-y-2">
            <p className="text-sm">Nickname pubblico</p>
            <div className="flex gap-2">
              <input
                className="w-full h-10 rounded-md border px-3 bg-background"
                placeholder={ensName || 'es. alice.eth'}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
              <Button
                onClick={async () => {
                  if (!user) return;
                  setSavingNick(true);
                  try {
                    const updated = await authService.updateUser({ name: nickname || ensName || user.name });
                    setNickname('');
                    setEnsName(updated.name.endsWith('.eth') ? updated.name : ensName);
                  } finally {
                    setSavingNick(false);
                  }
                }}
                disabled={savingNick || (!nickname && !ensName)}
              >
                {savingNick ? 'Salvataggio…' : 'Salva'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Se usi ENS, il tuo nickname può essere il tuo dominio (es. alice.eth).</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Button
              variant={walletService.getCurrentProvider() === 'metamask' ? 'secondary' : 'outline'}
              onClick={() => switchProvider('metamask')}
              disabled={!!isSwitching}
              aria-label="Connetti MetaMask"
            >
              {isSwitching === 'metamask' ? 'Connessione…' : 'MetaMask'}
            </Button>
            <Button
              variant={walletService.getCurrentProvider() === 'coinbase' ? 'secondary' : 'outline'}
              onClick={() => switchProvider('coinbase')}
              disabled={!!isSwitching}
              aria-label="Connetti Coinbase Wallet su Base"
            >
              {isSwitching === 'coinbase' ? 'Connessione…' : 'Coinbase (Base)'}
            </Button>
            <Button
              variant={walletService.getCurrentProvider() === 'farcaster' ? 'secondary' : 'outline'}
              onClick={() => switchProvider('farcaster')}
              disabled={!!isSwitching}
              aria-label="Connetti via WalletConnect (Farcaster)"
            >
              {isSwitching === 'farcaster' ? 'Connessione…' : 'Farcaster (WalletConnect)'}
            </Button>
          </div>

          {isConnected ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleDisconnect} disabled={isDisconnecting} className="flex-1">
                <X className="h-4 w-4" />
                {isDisconnecting ? 'Disconnessione…' : 'Disconnetti'}
              </Button>
            </div>
          ) : (
            <WalletConnectButton onConnect={handleWalletConnect} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

