'use client';

/**
 * Servizio per la conversione EUR → Crypto usando CoinGecko API
 * 
 * Features:
 * - Conversione EUR → Crypto in tempo reale
 * - Cache dei prezzi (1 minuto TTL)
 * - Fallback per stablecoin (1:1 con EUR)
 * - Gestione errori con prezzi di fallback
 */

interface PriceCache {
  price: number;
  timestamp: number;
}

interface CoinGeckoResponse {
  [coinId: string]: {
    eur?: number;
  };
}

export class PriceService {
  private cache = new Map<string, PriceCache>();
  private readonly CACHE_TTL = 60000; // 1 minuto
  private readonly COINGECKO_API = 'https://api.coingecko.com/api/v3';

  // Mappa simboli token → CoinGecko IDs
  private readonly coinGeckoIds: Record<string, string> = {
    'ETH': 'ethereum',
    'WETH': 'ethereum',
    'USDC': 'usd-coin',
    'USDT': 'tether',
    'DAI': 'dai',
    'WBTC': 'wrapped-bitcoin',
    'ARB': 'arbitrum',
    'LINK': 'chainlink',
    'UNI': 'uniswap',
  };

  // Stablecoin che hanno parità 1:1 con EUR/USD
  private readonly stablecoins = ['USDC', 'USDT', 'DAI', 'EURC', 'USDC.E'];

  /**
   * Converte un importo in EUR in crypto
   * 
   * @param amountEUR - Importo in EUR
   * @param tokenSymbol - Simbolo del token (es. "USDC", "ETH")
   * @returns Importo in crypto
   */
  async convertEURToCrypto(
    amountEUR: number,
    tokenSymbol: string
  ): Promise<number> {
    // CASO 1: Stablecoin (conversione diretta 1:1)
    if (this.stablecoins.includes(tokenSymbol.toUpperCase())) {
      return amountEUR; // 1 EUR ≈ 1 USDC
    }

    // CASO 2: Token volatili (usa CoinGecko)
    try {
      const priceInEUR = await this.getTokenPriceInEUR(tokenSymbol);
      return amountEUR / priceInEUR;
    } catch (error) {
      console.error(`Errore conversione EUR → ${tokenSymbol}:`, error);
      throw new Error(`Impossibile convertire EUR in ${tokenSymbol}`);
    }
  }

  /**
   * Ottiene il prezzo di un token in EUR
   * 
   * @param tokenSymbol - Simbolo del token
   * @returns Prezzo in EUR
   */
  async getTokenPriceInEUR(tokenSymbol: string): Promise<number> {
    const upperSymbol = tokenSymbol.toUpperCase();

    // Check cache
    const cached = this.cache.get(upperSymbol);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < this.CACHE_TTL) {
      return cached.price;
    }

    try {
      const coinId = this.coinGeckoIds[upperSymbol] || tokenSymbol.toLowerCase();
      
      const response = await fetch(
        `${this.COINGECKO_API}/simple/price?ids=${coinId}&vs_currencies=eur`
      );

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data: CoinGeckoResponse = await response.json();
      const price = data[coinId]?.eur;

      if (!price || price <= 0) {
        throw new Error(`Prezzo non valido per ${tokenSymbol}`);
      }

      // Salva in cache
      this.cache.set(upperSymbol, { price, timestamp: now });

      return price;
    } catch (error) {
      console.error(`Errore fetch prezzo ${tokenSymbol}:`, error);
      
      // Usa fallback se disponibile
      const fallbackPrice = this.getFallbackPrice(upperSymbol);
      if (fallbackPrice > 0) {
        console.warn(`Usando prezzo di fallback per ${tokenSymbol}: ${fallbackPrice} EUR`);
        return fallbackPrice;
      }

      throw error;
    }
  }

  /**
   * Prezzi di fallback approssimativi (da aggiornare manualmente)
   */
  private getFallbackPrice(tokenSymbol: string): number {
    const fallbackPrices: Record<string, number> = {
      'ETH': 2800,
      'WETH': 2800,
      'BTC': 65000,
      'WBTC': 65000,
      'USDC': 0.95,
      'USDT': 0.95,
      'DAI': 0.95,
      'ARB': 0.80,
      'LINK': 12,
      'UNI': 6,
    };

    return fallbackPrices[tokenSymbol] || 0;
  }

  /**
   * Formatta un importo crypto per il display
   */
  formatCryptoAmount(amount: number, tokenSymbol: string): string {
    // Stablecoin: 2 decimali
    if (this.stablecoins.includes(tokenSymbol.toUpperCase())) {
      return amount.toFixed(2);
    }

    // Token volatili: 6 decimali per piccoli importi, 2 per grandi
    if (amount < 1) {
      return amount.toFixed(6);
    } else if (amount < 100) {
      return amount.toFixed(4);
    } else {
      return amount.toFixed(2);
    }
  }

  /**
   * Calcola il valore in EUR di un importo crypto
   */
  async convertCryptoToEUR(
    amount: number,
    tokenSymbol: string
  ): Promise<number> {
    if (this.stablecoins.includes(tokenSymbol.toUpperCase())) {
      return amount;
    }

    const priceInEUR = await this.getTokenPriceInEUR(tokenSymbol);
    return amount * priceInEUR;
  }

  /**
   * Pulisce la cache (utile per testing)
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Ottiene statistiche della cache
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.entries()).map(([token, data]) => ({
        token,
        price: data.price,
        age: Date.now() - data.timestamp,
      })),
    };
  }
}

export const priceService = new PriceService();

