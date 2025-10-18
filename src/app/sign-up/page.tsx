'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import { Wallet } from '@coinbase/onchainkit/wallet';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/lib/auth-service';

export default function SignUpPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [error, setError] = useState('');
  const [nickname, setNickname] = useState('');
  const [hasSignedUp, setHasSignedUp] = useState(false);

  // Auto-redirect when wallet is connected and user has signed up
  useEffect(() => {
    if (isConnected && address && hasSignedUp) {
      router.push('/');
    }
  }, [isConnected, address, hasSignedUp, router]);

  // Sign up when wallet connects
  useEffect(() => {
    if (isConnected && address && !hasSignedUp) {
      (async () => {
        try {
          await authService.signInWithWallet(address);
          if (nickname.trim()) {
            await authService.updateUser({ name: nickname });
          }
          setHasSignedUp(true);
        } catch (err) {
          setError('Errore durante la registrazione');
          console.error(err);
        }
      })();
    }
  }, [isConnected, address, nickname, hasSignedUp]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Ethton</h1>
          <p className="text-muted-foreground">
            Crea il tuo account per iniziare
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Registrati</CardTitle>
            <CardDescription>Crea il tuo profilo collegando un wallet</CardDescription>
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
              <p className="text-xs text-muted-foreground">Usa il tuo ENS se disponibile, sarà mostrato al posto dell&apos;indirizzo.</p>
            </div>

            <Wallet />

            {error && <p className="text-sm text-red-600">{error}</p>}
          </CardContent>

          <CardFooter className="flex flex-col gap-2">
            <p className="text-sm text-center text-muted-foreground">
              Hai già un profilo?{' '}
              <Link href="/sign-in" className="text-primary hover:underline font-medium">Accedi</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
