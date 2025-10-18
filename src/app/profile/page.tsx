'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wallet, Mail, User as UserIcon, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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

          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-primary/10">
                <UserIcon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Nome</p>
                <p className="font-medium">{user.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Connection Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Wallet Crypto</CardTitle>
              <CardDescription>
                Connetti il tuo wallet per pagamenti in criptovaluta
              </CardDescription>
            </div>
            {isConnected ? (
              <Badge variant="default" className="gap-1">
                <Check className="h-3 w-3" />
                Connesso
              </Badge>
            ) : (
              <Badge variant="outline">Non connesso</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/30">
            <Wallet className="h-8 w-8 text-primary" />
            <div className="flex-1">
              {isConnected && user.walletAddress ? (
                <>
                  <p className="text-sm font-medium mb-1">Indirizzo wallet</p>
                  <p className="text-xs font-mono text-muted-foreground">
                    {user.walletAddress.slice(0, 12)}...{user.walletAddress.slice(-10)}
                  </p>
                  {ensName && (
                    <p className="text-xs text-muted-foreground mt-1">ENS: {ensName}</p>
                  )}
                </>
              ) : (
                <>
                  <p className="text-sm font-medium mb-1">Nessun wallet connesso</p>
                  <p className="text-xs text-muted-foreground">
                    Connetti un wallet per abilitare i pagamenti crypto
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {isConnected ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleDisconnect}
                  disabled={isDisconnecting}
                  className="flex-1"
                >
                  <X className="h-4 w-4" />
                  {isDisconnecting ? 'Disconnessione...' : 'Disconnetti'}
                </Button>
                <Button variant="secondary" disabled className="flex-1">
                  Riconnetti
                </Button>
              </>
            ) : (
              <WalletConnectButton 
                onConnect={handleWalletConnect}
                variant="default"
                size="default"
              />
            )}
          </div>

          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Informazioni</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• I pagamenti crypto sono attualmente in versione demo</li>
              <li>• Puoi connettere/disconnettere il wallet in qualsiasi momento</li>
              <li>• Il tuo indirizzo wallet è visibile solo a te</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Preferences Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Preferenze</CardTitle>
          <CardDescription>
            Personalizza la tua esperienza
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Valuta predefinita</p>
                <p className="text-sm text-muted-foreground">EUR</p>
              </div>
              <Button variant="outline" size="sm">Modifica</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notifiche</p>
                <p className="text-sm text-muted-foreground">Attive</p>
              </div>
              <Button variant="outline" size="sm">Gestisci</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

