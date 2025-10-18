'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { authService } from '@/lib/auth-service';
import { walletService } from '@/lib/wallet-service';
import { useEffect, useState } from 'react';
import { User as UserType } from '@/lib/types';

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    const sync = () => setUser(authService.getCurrentUser());
    sync();
    const i = setInterval(sync, 500);
    return () => clearInterval(i);
  }, []);

  const handleDisconnect = async () => {
    try {
      await walletService.disconnect();
    } finally {
      await authService.signOut();
      setUser(null);
      router.push('/sign-in');
    }
  };

  // Don't show navbar on auth pages
  if (pathname?.startsWith('/sign-')) {
    return null;
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Ethton" width={28} height={28} priority className="rounded-md" />
            <span className="text-xl font-bold text-primary">Ethton</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              <Link href="/profile">
                <Button size="sm" variant="ghost">Profilo</Button>
              </Link>
              <Button size="sm" variant="outline" onClick={handleDisconnect}>
                <Wallet className="h-4 w-4" />
                Disconnetti
              </Button>
            </div>
          ) : (
            <Link href="/sign-in">
              <Button size="sm" variant="secondary">
                <Wallet className="h-4 w-4" />
                Connetti Wallet
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

