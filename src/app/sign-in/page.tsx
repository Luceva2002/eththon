'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
// import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { authService } from '@/lib/auth-service';
import { walletService } from '@/lib/wallet-service';
import { Wallet } from '@coinbase/onchainkit/wallet';

export default function SignInPage() {
  const router = useRouter();
  // const [isLoading, setIsLoading] = useState<'metamask' | 'coinbase' | 'farcaster' | null>(null);
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mantieni funzione disponibile se si reinseriranno i bottoni provider
  // const connectAndSignIn = async (provider: 'metamask' | 'coinbase' | 'farcaster') => { ... };

  const handleSubmit = async () => {
    setError('');
    setIsSubmitting(true);
    try {
      const conn = walletService.getConnection();
      if (!conn || !conn.address) {
        setError('Connetti prima un wallet');
        return;
      }
      await authService.signInWithWallet(conn.address);
      if (nickname) {
        await authService.updateUser({ name: nickname });
      }
      router.push('/');
    } catch (e) {
      console.error(e);
      setError('Errore durante il login');
    } finally {
      setIsSubmitting(false);
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
              <br />
              <br />
              <Input id="nickname" placeholder="es. alice.eth" value={nickname} onChange={(e) => setNickname(e.target.value)} />
            </div>
            <Wallet />
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button className="w-full" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Accesso...' : 'Continua'}
            </Button>
            {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

