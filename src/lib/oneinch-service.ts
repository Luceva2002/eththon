'use client';

import { parseUnits, formatUnits, type Hex } from 'viem';
import { type Token, getTokenByAddress, isNativeToken } from './token-list';

/**
 * Servizio per interagire con le API 1inch tramite proxy Next.js
 * 
 * Features:
 * - Check allowance token
 * - Ottieni transazione di approve
 * - Ottieni quote swap
 * - Ottieni transazione swap
 */

export interface SwapQuote {
  dstAmount: string; // Amount in formato umano
  dstAmountWei: string; // Amount in wei
  estimatedGas: string;
}

export interface SwapTransaction {
  to: Hex;
  data: Hex;
  value: bigint;
  gas?: string;
}

export interface ApproveTransaction {
  to: Hex;
  data: Hex;
  value: bigint;
}

export class OneInchService {
  private readonly baseUrl = '/api/1inch'; // API Routes proxy

  /**
   * Verifica l'allowance di un token per il router 1inch
   */
  async checkAllowance(
    tokenAddress: string,
    walletAddress: string
  ): Promise<bigint> {
    try {
      const params = new URLSearchParams({
        tokenAddress,
        walletAddress,
      });

      const response = await fetch(`${this.baseUrl}/allowance?${params}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Errore check allowance');
      }

      const data = await response.json();
      return BigInt(data.allowance || '0');
    } catch (error) {
      console.error('Errore checkAllowance:', error);
      throw error;
    }
  }

  /**
   * Ottiene i dati della transazione di approve
   */
  async getApproveTransaction(
    tokenAddress: string,
    amount?: string
  ): Promise<ApproveTransaction> {
    try {
      const params = new URLSearchParams({ tokenAddress });
      
      if (amount) {
        params.append('amount', amount);
      }

      const response = await fetch(`${this.baseUrl}/approve?${params}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Errore approve transaction');
      }

      const data = await response.json();

      return {
        to: data.to as Hex,
        data: data.data as Hex,
        value: BigInt(data.value || 0),
      };
    } catch (error) {
      console.error('Errore getApproveTransaction:', error);
      throw error;
    }
  }

  /**
   * Ottiene una quote per lo swap (senza eseguirlo)
   * 
   * @param srcToken - Token source
   * @param dstToken - Token destination
   * @param amount - Amount in formato umano (es. "100" per 100 USDC)
   * @returns Quote con amount destination
   */
  async getQuote(
    srcToken: Token,
    dstToken: Token,
    amount: string
  ): Promise<SwapQuote> {
    try {
      // Converti amount in wei
      const amountInWei = parseUnits(amount, srcToken.decimals);

      const params = new URLSearchParams({
        src: srcToken.address,
        dst: dstToken.address,
        amount: amountInWei.toString(),
      });

      const response = await fetch(`${this.baseUrl}/quote?${params}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Errore quote');
      }

      const data = await response.json();

      // Converti dstAmount da wei a formato umano
      const dstAmountFormatted = formatUnits(
        BigInt(data.dstAmount),
        dstToken.decimals
      );

      return {
        dstAmount: dstAmountFormatted,
        dstAmountWei: data.dstAmount,
        estimatedGas: data.gas || data.estimatedGas || '0',
      };
    } catch (error) {
      console.error('Errore getQuote:', error);
      throw error;
    }
  }

  /**
   * Ottiene i dati della transazione di swap
   * 
   * @param srcToken - Token source
   * @param dstToken - Token destination
   * @param amount - Amount in formato umano
   * @param walletAddress - Indirizzo wallet che esegue lo swap
   * @param slippage - Slippage tollerato (default: 1%)
   * @returns Dati transazione
   */
  async getSwapTransaction(
    srcToken: Token,
    dstToken: Token,
    amount: string,
    walletAddress: string,
    slippage: number = 1
  ): Promise<SwapTransaction> {
    try {
      // Converti amount in wei
      const amountInWei = parseUnits(amount, srcToken.decimals);

      const params = new URLSearchParams({
        src: srcToken.address,
        dst: dstToken.address,
        amount: amountInWei.toString(),
        from: walletAddress,
        slippage: slippage.toString(),
        disableEstimate: 'false',
        allowPartialFill: 'false',
      });

      const response = await fetch(`${this.baseUrl}/swap?${params}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Errore swap');
      }

      const data = await response.json();

      return {
        to: data.tx.to as Hex,
        data: data.tx.data as Hex,
        value: BigInt(data.tx.value || 0),
        gas: data.tx.gas,
      };
    } catch (error) {
      console.error('Errore getSwapTransaction:', error);
      throw error;
    }
  }

  /**
   * Verifica se un token necessita di approvazione
   * 
   * @param token - Token da verificare
   * @param amount - Amount richiesto
   * @param walletAddress - Wallet address
   * @returns true se serve approvazione
   */
  async needsApproval(
    token: Token,
    amount: string,
    walletAddress: string
  ): Promise<boolean> {
    // ETH nativo non necessita approvazione
    if (isNativeToken(token)) {
      return false;
    }

    const amountInWei = parseUnits(amount, token.decimals);
    const allowance = await this.checkAllowance(token.address, walletAddress);

    return allowance < amountInWei;
  }

  /**
   * Calcola l'amount esatto da approvare (con buffer del 10%)
   */
  calculateApprovalAmount(amount: string, decimals: number): string {
    const amountInWei = parseUnits(amount, decimals);
    // Aggiungi 10% di buffer per evitare problemi con slippage
    const amountWithBuffer = (amountInWei * BigInt(110)) / BigInt(100);
    return amountWithBuffer.toString();
  }

  /**
   * Formatta un amount per il display
   */
  formatAmount(amount: string, token: Token): string {
    const num = parseFloat(amount);

    if (token.isStablecoin) {
      return num.toFixed(2);
    }

    if (num < 0.000001) {
      return num.toFixed(8);
    } else if (num < 0.01) {
      return num.toFixed(6);
    } else if (num < 1) {
      return num.toFixed(4);
    } else {
      return num.toFixed(4);
    }
  }

  /**
   * Trova un token dalla lista
   */
  getToken(addressOrSymbol: string): Token | undefined {
    return getTokenByAddress(addressOrSymbol);
  }
}

export const oneInchService = new OneInchService();

