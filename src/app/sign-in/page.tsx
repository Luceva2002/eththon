'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { authService } from '@/lib/auth-service';
import { walletService } from '@/lib/wallet-service';

export default function SignInPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<'metamask' | 'coinbase' | 'farcaster' | null>(null);
  const [error, setError] = useState('');

  const connectAndSignIn = async (provider: 'metamask' | 'coinbase' | 'farcaster') => {
    setError('');
    setIsLoading(provider);
    try {
      const { address } = await walletService.connect(provider);
      await authService.signInWithWallet(address);
      router.push('/');
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

          <CardContent className="space-y-3">
            <Button className="w-full" variant="secondary" onClick={() => connectAndSignIn('metamask')} disabled={isLoading !== null}>
              {isLoading === 'metamask' ? 'Connessione MetaMask...' : 'Accedi con MetaMask'}
            </Button>

            <Button className="w-full" variant="outline" onClick={() => connectAndSignIn('coinbase')} disabled={isLoading !== null}>
              {isLoading === 'coinbase' ? 'Connessione Coinbase...' : 'Accedi con Coinbase Wallet'}
            </Button>

            <Button className="w-full" variant="outline" onClick={() => connectAndSignIn('farcaster')} disabled={isLoading !== null}>
              {isLoading === 'farcaster' ? 'Connessione Farcaster...' : 'Accedi con Farcaster (WalletConnect)'}
            </Button>

            {error && <p className="text-sm text-red-600">{error}</p>}
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

