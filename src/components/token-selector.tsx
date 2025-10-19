'use client';

import { type Token, ARBITRUM_TOKENS, SUGGESTED_PAYMENT_TOKENS, SUGGESTED_RECEIVE_TOKENS } from '@/lib/token-list';
import { Label } from './ui/label';

interface TokenSelectorProps {
  label: string;
  value: Token | null;
  onChange: (token: Token) => void;
  variant?: 'payment' | 'receive' | 'all';
  disabled?: boolean;
}

/**
 * Componente per selezionare un token
 * 
 * Varianti:
 * - payment: Mostra token suggeriti per pagamenti (stablecoin + ETH)
 * - receive: Mostra token suggeriti per ricevere (ETH + stablecoin + ARB)
 * - all: Mostra tutti i token disponibili
 */
export function TokenSelector({ 
  label, 
  value, 
  onChange, 
  variant = 'all',
  disabled = false 
}: TokenSelectorProps) {
  // Seleziona la lista di token in base alla variante
  const getTokenList = (): Token[] => {
    switch (variant) {
      case 'payment':
        return SUGGESTED_PAYMENT_TOKENS;
      case 'receive':
        return SUGGESTED_RECEIVE_TOKENS;
      case 'all':
      default:
        return ARBITRUM_TOKENS;
    }
  };

  const tokenList = getTokenList();

  return (
    <div className="space-y-2">
      <Label className="text-base font-semibold">{label}</Label>
      <select
        value={value?.address || ''}
        onChange={(e) => {
          const token = ARBITRUM_TOKENS.find((t) => t.address === e.target.value);
          if (token) onChange(token);
        }}
        disabled={disabled}
        className="w-full h-12 rounded-md border border-input px-3 bg-background text-base focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="">Seleziona un token</option>
        {tokenList.map((token) => (
          <option key={token.address} value={token.address}>
            {token.symbol} - {token.name}
            {token.isStablecoin && ' 💵'}
            {token.isNative && ' ⚡'}
          </option>
        ))}
      </select>

      {/* Preview del token selezionato */}
      {value && (
        <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
          {value.logoURI && (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={value.logoURI} 
              alt={value.symbol}
              className="w-8 h-8 rounded-full"
              onError={(e) => {
                // Fallback se l'immagine non carica
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold">{value.symbol}</p>
              {value.isStablecoin && (
                <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded">
                  Stablecoin
                </span>
              )}
              {value.isNative && (
                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                  Native
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{value.name}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Decimals</p>
            <p className="text-sm font-mono">{value.decimals}</p>
          </div>
        </div>
      )}

      {/* Hint in base alla variante */}
      {!value && variant === 'payment' && (
        <p className="text-xs text-muted-foreground">
          💡 Scegli con quale crypto vuoi pagare. Stablecoin consigliate per minori fee.
        </p>
      )}
      {!value && variant === 'receive' && (
        <p className="text-xs text-muted-foreground">
          💡 Scegli quale crypto vuoi ricevere.
        </p>
      )}
    </div>
  );
}

