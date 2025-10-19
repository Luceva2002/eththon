'use client';

import { useEffect } from 'react';
import sdk from '@farcaster/frame-sdk';

/**
 * Componente che notifica a Farcaster che l'app è pronta
 * Deve essere chiamato dopo che l'app è completamente caricata
 */
export function FarcasterReady() {
  useEffect(() => {
    const notifyReady = async () => {
      try {
        // Verifica se siamo in un contesto Farcaster
        const context = await sdk.context;
        
        if (context) {
          console.log('🟣 Farcaster context detected:', context);
          
          // Notifica che l'app è pronta
          await sdk.actions.ready();
          console.log('✅ Farcaster SDK: ready() called');
        } else {
          console.log('ℹ️ Not running in Farcaster context');
        }
      } catch {
        // Non siamo in Farcaster, ignora l'errore
        console.log('ℹ️ Farcaster SDK not available (running outside Farcaster)');
      }
    };

    // Chiama ready dopo un breve delay per assicurarci che l'app sia renderizzata
    const timer = setTimeout(() => {
      notifyReady();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Non renderizza nulla
  return null;
}

