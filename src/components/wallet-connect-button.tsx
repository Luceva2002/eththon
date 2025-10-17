'use client';

import { useState } from 'react';
import { Wallet, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { walletService } from '@/lib/wallet-service';
import { authService } from '@/lib/auth-service';

interface WalletConnectButtonProps {
  onConnect?: (address: string) => void;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg';
}

export function WalletConnectButton({ 
  onConnect, 
  variant = 'default',
  size = 'default' 
}: WalletConnectButtonProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(walletService.isConnected());

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const connection = await walletService.connect();
      setIsConnected(true);
      
      // Update user with wallet address
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        await authService.updateUser({ walletAddress: connection.address });
      }
      
      onConnect?.(connection.address);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  if (isConnected) {
    return (
      <Button variant="outline" size={size} disabled>
        <Check className="h-4 w-4" />
        Wallet Connesso
      </Button>
    );
  }

  return (
    <Button 
      variant={variant} 
      size={size}
      onClick={handleConnect}
      disabled={isConnecting}
    >
      <Wallet className="h-4 w-4" />
      {isConnecting ? 'Connessione...' : 'Connetti Wallet'}
    </Button>
  );
}

