'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
    const i = setInterval(sync, 500); // semplice polling per riflettere login/logout immediato
    return () => clearInterval(i);
  }, []);

  const handleDisconnect = async () => {
    try {
      await walletService.disconnect();
    } finally {
      await authService.signOut();
      setUser(null);
      router.refresh();
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
            <span className="text-xl font-bold text-primary">Splitcast</span>
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
                Disconnetti Wallet
              </Button>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="secondary">
                  <Wallet className="h-4 w-4" />
                  Connetti Wallet
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={async () => {
                  try {
                    const { address } = await walletService.connect('metamask');
                    await authService.signInWithWallet(address);
                    setUser(authService.getCurrentUser());
                  } catch (e) {
                    console.error(e);
                  }
                }} className="cursor-pointer">
                  MetaMask
                </DropdownMenuItem>
                <DropdownMenuItem onClick={async () => {
                  try {
                    const { address } = await walletService.connect('coinbase');
                    await authService.signInWithWallet(address);
                    setUser(authService.getCurrentUser());
                  } catch (e) {
                    console.error(e);
                  }
                }} className="cursor-pointer">
                  Coinbase Wallet
                </DropdownMenuItem>
                <DropdownMenuItem onClick={async () => {
                  try {
                    const { address } = await walletService.connect('farcaster');
                    await authService.signInWithWallet(address);
                    setUser(authService.getCurrentUser());
                  } catch (e) {
                    console.error(e);
                  }
                }} className="cursor-pointer">
                  Farcaster (WalletConnect)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </nav>
  );
}

