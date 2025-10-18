'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { Wallet } from '@coinbase/onchainkit/wallet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { authService } from '@/lib/auth-service';

export default function SignInPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [hasSignedIn, setHasSignedIn] = useState(false);

  // Auto-redirect when wallet is connected and user has signed in
  useEffect(() => {
    if (isConnected && address && hasSignedIn) {
      router.push('/');
    }
  }, [isConnected, address, hasSignedIn, router]);

  // Sign in when wallet connects
  useEffect(() => {
    if (isConnected && address && !hasSignedIn) {
      (async () => {
        try {
          await authService.signInWithWallet(address);
          if (nickname.trim()) {
            await authService.updateUser({ name: nickname });
          }
          setHasSignedIn(true);
        } catch (err) {
          setError('Errore durante il login');
          console.error(err);
        }
      })();
    }
  }, [isConnected, address, nickname, hasSignedIn]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Ethton</h1>
          <p className="text-muted-foreground">Gestisci le spese di gruppo in modo semplice</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Accedi</CardTitle>
            <CardDescription>Connettiti con il tuo wallet</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nickname">Nickname (opzionale)</Label>
              <Input
                id="nickname"
                placeholder="es. alice.eth"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                disabled={isConnected}
              />
              <p className="text-xs text-muted-foreground">Se hai ENS, puoi usare il tuo dominio come nickname.</p>
            </div>

            <Wallet />

            {error && <p className="text-sm text-red-600">{error}</p>}
          </CardContent>

          <CardFooter className="flex flex-col gap-2">
            <p className="text-sm text-center text-muted-foreground">
              Usa il tuo wallet preferito per accedere
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

