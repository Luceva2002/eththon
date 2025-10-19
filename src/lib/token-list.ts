/**
 * Lista token supportati su Arbitrum One
 * 
 * Indirizzi verificati da:
 * - https://bridge.arbitrum.io/
 * - https://tokenlists.org/
 */

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  isNative?: boolean;
  isStablecoin?: boolean;
}

/**
 * Token nativi e wrapped
 */
export const ETH_NATIVE: Token = {
  address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // Convenzione 1inch per ETH nativo
  symbol: 'ETH',
  name: 'Ethereum',
  decimals: 18,
  isNative: true,
  logoURI: 'https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png',
};

export const WETH: Token = {
  address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
  symbol: 'WETH',
  name: 'Wrapped Ether',
  decimals: 18,
  logoURI: 'https://tokens.1inch.io/0x82af49447d8a07e3bd95bd0d56f35241523fbab1.png',
};

/**
 * Stablecoin
 */
export const USDC: Token = {
  address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
  symbol: 'USDC',
  name: 'USD Coin',
  decimals: 6,
  isStablecoin: true,
  logoURI: 'https://tokens.1inch.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png',
};

export const USDC_E: Token = {
  address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
  symbol: 'USDC.e',
  name: 'USD Coin (Bridged)',
  decimals: 6,
  isStablecoin: true,
  logoURI: 'https://tokens.1inch.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png',
};

export const USDT: Token = {
  address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
  symbol: 'USDT',
  name: 'Tether USD',
  decimals: 6,
  isStablecoin: true,
  logoURI: 'https://tokens.1inch.io/0xdac17f958d2ee523a2206206994597c13d831ec7.png',
};

export const DAI: Token = {
  address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
  symbol: 'DAI',
  name: 'Dai Stablecoin',
  decimals: 18,
  isStablecoin: true,
  logoURI: 'https://tokens.1inch.io/0x6b175474e89094c44da98b954eedeac495271d0f.png',
};

/**
 * Altri token popolari
 */
export const ARB: Token = {
  address: '0x912CE59144191C1204E64559FE8253a0e49E6548',
  symbol: 'ARB',
  name: 'Arbitrum',
  decimals: 18,
  logoURI: 'https://tokens.1inch.io/0x912ce59144191c1204e64559fe8253a0e49e6548.png',
};

export const WBTC: Token = {
  address: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
  symbol: 'WBTC',
  name: 'Wrapped BTC',
  decimals: 8,
  logoURI: 'https://tokens.1inch.io/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599.png',
};

export const LINK: Token = {
  address: '0xf97f4df75117a78c1A5a0DBb814Af92458539FB4',
  symbol: 'LINK',
  name: 'ChainLink Token',
  decimals: 18,
  logoURI: 'https://tokens.1inch.io/0x514910771af9ca656af840dff83e8264ecf986ca.png',
};

export const UNI: Token = {
  address: '0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0',
  symbol: 'UNI',
  name: 'Uniswap',
  decimals: 18,
  logoURI: 'https://tokens.1inch.io/0x1f9840a85d5af5bf1d1762f925bdaddc4201f984.png',
};

/**
 * Lista completa di tutti i token supportati
 */
export const ARBITRUM_TOKENS: Token[] = [
  ETH_NATIVE,
  WETH,
  USDC,
  USDC_E,
  USDT,
  DAI,
  ARB,
  WBTC,
  LINK,
  UNI,
];

/**
 * Token suggeriti per i pagamenti (più comuni)
 */
export const SUGGESTED_PAYMENT_TOKENS: Token[] = [
  USDC,
  USDC_E,
  USDT,
  DAI,
  ETH_NATIVE,
  WETH,
];

/**
 * Token suggeriti per ricevere pagamenti
 */
export const SUGGESTED_RECEIVE_TOKENS: Token[] = [
  ETH_NATIVE,
  USDC,
  USDT,
  ARB,
  WETH,
];

/**
 * Helper functions
 */

/**
 * Trova un token per address
 */
export function getTokenByAddress(address: string): Token | undefined {
  return ARBITRUM_TOKENS.find(
    (t) => t.address.toLowerCase() === address.toLowerCase()
  );
}

/**
 * Trova un token per symbol
 */
export function getTokenBySymbol(symbol: string): Token | undefined {
  return ARBITRUM_TOKENS.find(
    (t) => t.symbol.toLowerCase() === symbol.toLowerCase()
  );
}

/**
 * Verifica se un token è una stablecoin
 */
export function isStablecoin(token: Token): boolean {
  return token.isStablecoin || false;
}

/**
 * Verifica se un token è nativo (ETH)
 */
export function isNativeToken(token: Token): boolean {
  return token.isNative || false;
}

/**
 * Formatta l'indirizzo di un token per display
 */
export function formatTokenAddress(address: string): string {
  if (address === ETH_NATIVE.address) {
    return 'Native ETH';
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

