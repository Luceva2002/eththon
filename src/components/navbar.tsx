"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Wallet } from "@coinbase/onchainkit/wallet";
import { Button } from "@/components/ui/button";
import { authService } from "@/lib/auth-service";
import { useEffect, useState } from "react";
import { User as UserType } from "@/lib/types";

export function NavBar() {
  const pathname = usePathname();
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    const sync = () => setUser(authService.getCurrentUser());
    sync();
    const i = setInterval(sync, 500);
    return () => clearInterval(i);
  }, []);

  // Don't show navbar on auth pages
  if (pathname?.startsWith("/sign-")) {
    return null;
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="SplitCast"
              width={28}
              height={28}
              priority
              className="rounded-md"
            />
            <span className="text-xl font-bold text-primary">SplitCast</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              <Link href="/profile">
                <Button size="sm" variant="ghost">
                  Profilo
                </Button>
              </Link>
              <Wallet />
            </div>
          ) : (
            <Button size="sm" variant="secondary" asChild>
              <Link href="/sign-in">
                {/* Wallet qui è un'icona, non un button interattivo */}
                <span className="inline-flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Connetti Wallet
                </span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
