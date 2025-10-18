'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { Wallet } from '@coinbase/onchainkit/wallet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { authService } from '@/lib/auth-service';
import { supabase } from '@/lib/supabase-client';

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

  // Explicit sign-in handler triggered by the form/button
  const handleSignIn = async () => {
    setError('');
    if (!nickname.trim()) {
      setError('Il nickname è obbligatorio');
      return;
    }
    if (!isConnected || !address) {
      setError('Connetti prima il wallet');
      return;
    }

    // Check nickname uniqueness (case-insensitive)
    try {
      const { data: existing, error: selectError } = await supabase
        .from('profiles')
        .select('wallet_address')
        .ilike('nickname', nickname.trim())
        .limit(1);

      if (selectError) {
        console.warn('Supabase check error:', selectError.message);
      }

      if (existing && existing.length > 0) {
        const existingWallet = existing[0].wallet_address?.toLowerCase();
        if (existingWallet && existingWallet !== address.toLowerCase()) {
          setError('Nickname già in uso da un altro wallet, scegli un altro nickname');
          return;
        }
      }
    } catch (e) {
      console.warn('Supabase not available or check failed:', e);
    }

    try {
      await authService.signInWithWallet(address);
      await authService.updateUser({ name: nickname.trim() });
      setHasSignedIn(true);
    } catch (err) {
      setError('Errore durante il login');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">SplitCast</h1>
          <p className="text-muted-foreground">Gestisci le spese di gruppo in modo semplice</p>
        </div>

        <Card >
          <CardHeader>
            <CardTitle className="flex justify-start">Accedi</CardTitle>
            <CardDescription className="flex justify-start">Connettiti con il tuo wallet</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="flex justify-start" htmlFor="nickname">Nickname <span className="text-red-500">*</span></Label>
              <Input
                id="nickname"
                placeholder="es. alice.eth"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Wallet />
              </div>
              <div>
                <button
                  type="button"
                  onClick={handleSignIn}
                  className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md disabled:opacity-50"
                  disabled={!nickname.trim() || !isConnected}
                >
                  Accedi
                </button>
              </div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </CardContent>

          <CardFooter className="flex flex-col gap-2">
            <p className="text-sm text-start text-muted-foreground">
              Usa il tuo wallet preferito per accedere
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

