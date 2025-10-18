'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { authService } from '@/lib/auth-service';
import { walletService } from '@/lib/wallet-service';
import { Wallet } from '@coinbase/onchainkit/wallet';

export default function SignInPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<'metamask' | 'coinbase' | 'farcaster' | null>(null);
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');

  const connectAndSignIn = async (provider: 'metamask' | 'coinbase' | 'farcaster') => {
    setError('');
    setIsLoading(provider);
    try {
      const { address } = await walletService.connect(provider);
      await authService.signInWithWallet(address);
      if (nickname) {
        await authService.updateUser({ name: nickname });
      }
      router.push('/');
      // Apri la dapp/wallet in nuova scheda quando possibile
      if (provider === 'metamask') window.open('https://metamask.app.link/', '_blank');
      if (provider === 'coinbase') window.open('https://go.cb-w.com/', '_blank');
      if (provider === 'farcaster') window.open('https://walletconnect.com/', '_blank');
    } catch (err) {
      setError('Errore durante la connessione del wallet');
      console.error(err);
    } finally {
      setIsLoading(null);
    }
  };

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
              <Label htmlFor="nickname">Nickname</Label>
              <Input id="nickname" placeholder="es. alice.eth" value={nickname} onChange={(e) => setNickname(e.target.value)} />
              <p className="text-xs text-muted-foreground">Se hai ENS, puoi usare il tuo dominio come nickname.</p>
            </div>
            <Wallet />
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <p className="text-sm text-center text-muted-foreground">
              Non hai un wallet?{' '}
              <Link href="/sign-up" className="text-primary hover:underline font-medium">Crea un profilo</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

