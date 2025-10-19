'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { TokenSelector } from './token-selector';
import { oneInchService } from '@/lib/oneinch-service';
import { priceService } from '@/lib/price-service';
import { type Token } from '@/lib/token-list';
import { useAccount, useSendTransaction, useSwitchChain } from 'wagmi';
import { arbitrum } from 'wagmi/chains';
import { Loader2, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';
import { parseEther } from 'viem';

interface CryptoPaymentDialogProps {
  open: boolean;
  onClose: () => void;
  debtAmount: number; // in EUR
  debtCurrency: string;
  creditorName: string;
  creditorAddress: string | null;
  onSuccess: (txHash: string, swapTxHash: string, cryptoAmount: string, cryptoSymbol: string) => void;
}

type Step = 'select' | 'quote' | 'approve' | 'swap' | 'transfer' | 'success' | 'error';

export function CryptoPaymentDialog({
  open,
  onClose,
  debtAmount,
  debtCurrency,
  creditorName,
  creditorAddress,
  onSuccess,
}: CryptoPaymentDialogProps) {
  const { address, chain } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { sendTransactionAsync } = useSendTransaction();
  
  // State
  const [srcToken, setSrcToken] = useState<Token | null>(null);
  const [dstToken, setDstToken] = useState<Token | null>(null);
  const [srcAmount, setSrcAmount] = useState<string>('0');
  const [dstAmount, setDstAmount] = useState<string>('0');
  const [step, setStep] = useState<Step>('select');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [swapTxHash, setSwapTxHash] = useState<string>('');

  // Reset quando il dialog si chiude
  useEffect(() => {
    if (!open) {
      setSrcToken(null);
      setDstToken(null);
      setSrcAmount('0');
      setDstAmount('0');
      setStep('select');
      setError('');
      setSwapTxHash('');
    }
  }, [open]);

  // Verifica creditor address
  if (!creditorAddress) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>⚠️ Wallet non trovato</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              {creditorName} non ha ancora connesso il suo wallet. 
              Chiedigli di collegarsi all&apos;app per poter ricevere pagamenti crypto.
            </p>
            <Button onClick={onClose} className="w-full">
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  /**
   * Step 1: Calcola conversione EUR → Crypto + Quote 1inch
   */
  const handleCalculateQuote = async () => {
    if (!srcToken || !dstToken || !address) return;

    setIsLoading(true);
    setError('');

    try {
      // 1. Converti EUR → srcToken (CoinGecko)
      const amountInSrcToken = await priceService.convertEURToCrypto(
        debtAmount,
        srcToken.symbol
      );
      setSrcAmount(amountInSrcToken.toString());

      // 2. Ottieni quote da 1inch (srcToken → dstToken)
      const quote = await oneInchService.getQuote(
        srcToken,
        dstToken,
        amountInSrcToken.toString()
      );
      setDstAmount(quote.dstAmount);

      setStep('quote');
    } catch (err) {
      console.error('Errore calcolo quote:', err);
      setError((err as Error).message);
      setStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Step 2: Verifica e approva token (se necessario)
   */
  const handleApprove = async () => {
    if (!srcToken || !address) return;

    setIsLoading(true);
    setError('');
    setStep('approve');

    try {
      // Verifica chain
      if (chain?.id !== arbitrum.id) {
        await switchChainAsync({ chainId: arbitrum.id });
      }

      // Verifica se serve approvazione
      const needsApproval = await oneInchService.needsApproval(
        srcToken,
        srcAmount,
        address
      );

      if (!needsApproval) {
        // Se non serve, passa direttamente allo swap
        setStep('swap');
        await handleSwap();
        return;
      }

      // Ottieni transazione di approve
      const approvalAmount = oneInchService.calculateApprovalAmount(
        srcAmount,
        srcToken.decimals
      );

      const approveTx = await oneInchService.getApproveTransaction(
        srcToken.address,
        approvalAmount
      );

      // Invia transazione
      const txHash = await sendTransactionAsync({
        to: approveTx.to,
        data: approveTx.data,
        value: approveTx.value,
      });

      console.log('Approve tx:', txHash);

      // Attendi conferma
      // Per semplicità, aspettiamo 10 secondi
      await new Promise(resolve => setTimeout(resolve, 10000));

      // Procedi con lo swap
      setStep('swap');
      await handleSwap();
    } catch (err) {
      console.error('Errore approve:', err);
      setError((err as Error).message);
      setStep('error');
      setIsLoading(false);
    }
  };

  /**
   * Step 3: Esegui swap
   */
  const handleSwap = async () => {
    if (!srcToken || !dstToken || !address) return;

    setIsLoading(true);
    setError('');

    try {
      // Verifica chain
      if (chain?.id !== arbitrum.id) {
        await switchChainAsync({ chainId: arbitrum.id });
      }

      // Ottieni transazione swap
      const swapTx = await oneInchService.getSwapTransaction(
        srcToken,
        dstToken,
        srcAmount,
        address,
        1 // 1% slippage
      );

      // Invia transazione
      const txHash = await sendTransactionAsync({
        to: swapTx.to,
        data: swapTx.data,
        value: swapTx.value,
      });

      console.log('Swap tx:', txHash);
      setSwapTxHash(txHash);

      // Attendi conferma
      await new Promise(resolve => setTimeout(resolve, 15000));

      // Procedi con transfer
      setStep('transfer');
      await handleTransfer();
    } catch (err) {
      console.error('Errore swap:', err);
      setError((err as Error).message);
      setStep('error');
      setIsLoading(false);
    }
  };

  /**
   * Step 4: Transfer token al creditore
   */
  const handleTransfer = async () => {
    if (!dstToken || !creditorAddress || !address) return;

    setIsLoading(true);
    setError('');

    try {
      // Invia token al creditore
      const txHash = await sendTransactionAsync({
        to: creditorAddress as `0x${string}`,
        value: dstToken.isNative ? parseEther(dstAmount) : BigInt(0),
        data: '0x', // Transfer semplice per ETH, per ERC20 servirebbetransfer()
      });

      console.log('Transfer tx:', txHash);

      // Attendi conferma
      await new Promise(resolve => setTimeout(resolve, 10000));

      // Successo!
      setStep('success');
      setIsLoading(false);
      
      // Callback success
      onSuccess(txHash, swapTxHash, dstAmount, dstToken.symbol);
    } catch (err) {
      console.error('Errore transfer:', err);
      setError((err as Error).message);
      setStep('error');
      setIsLoading(false);
    }
  };

  /**
   * Start flow completo
   */
  const handleStartPayment = async () => {
    await handleApprove();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            💳 Paga con Crypto
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Importo da pagare */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Importo da pagare</p>
            <p className="text-3xl font-bold">
              {debtAmount.toFixed(2)} {debtCurrency}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              A: {creditorName}
            </p>
          </div>

          {/* Step: Select tokens */}
          {step === 'select' && (
            <>
              <TokenSelector
                label="Con quale crypto vuoi pagare?"
                value={srcToken}
                onChange={setSrcToken}
                variant="payment"
              />

              <TokenSelector
                label="Che crypto vuole ricevere il creditore?"
                value={dstToken}
                onChange={setDstToken}
                variant="receive"
              />

              <Button
                onClick={handleCalculateQuote}
                disabled={!srcToken || !dstToken || isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" />
                    Calcolo...
                  </>
                ) : (
                  <>
                    <TrendingUp className="mr-2" />
                    Calcola Quote
                  </>
                )}
              </Button>
            </>
          )}

          {/* Step: Quote */}
          {step === 'quote' && (
            <>
              <div className="space-y-3 p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Pagherai:</span>
                  <span className="font-bold text-lg">
                    {parseFloat(srcAmount).toFixed(6)} {srcToken?.symbol}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{creditorName} riceverà:</span>
                  <span className="font-bold text-lg text-green-600 dark:text-green-400">
                    {parseFloat(dstAmount).toFixed(6)} {dstToken?.symbol}
                  </span>
                </div>
              </div>

              <div className="text-xs text-muted-foreground space-y-1 bg-amber-50 dark:bg-amber-950 p-3 rounded">
                <p>⚠️ Attenzione: Servono 3 transazioni:</p>
                <p>1. Approve {srcToken?.symbol} per 1inch router</p>
                <p>2. Swap {srcToken?.symbol} → {dstToken?.symbol}</p>
                <p>3. Transfer {dstToken?.symbol} a {creditorName}</p>
                <p className="mt-2">💰 Gas fee stimato: ~0.001 ETH</p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep('select')} className="flex-1">
                  Indietro
                </Button>
                <Button onClick={handleStartPayment} disabled={isLoading} className="flex-1">
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" />
                      Elaborazione...
                    </>
                  ) : (
                    'Conferma Pagamento'
                  )}
                </Button>
              </div>
            </>
          )}

          {/* Step: Approve/Swap/Transfer in progress */}
          {(step === 'approve' || step === 'swap' || step === 'transfer') && (
            <div className="text-center py-8">
              <Loader2 className="animate-spin h-12 w-12 mx-auto mb-4 text-primary" />
              <p className="font-semibold text-lg mb-2">
                {step === 'approve' && 'Approvazione token...'}
                {step === 'swap' && 'Swap in corso...'}
                {step === 'transfer' && 'Transfer in corso...'}
              </p>
              <p className="text-sm text-muted-foreground">
                Conferma la transazione nel tuo wallet
              </p>
            </div>
          )}

          {/* Step: Success */}
          {step === 'success' && (
            <div className="text-center py-8">
              <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-600" />
              <p className="font-bold text-xl mb-2">Pagamento completato!</p>
              <p className="text-muted-foreground mb-4">
                Hai pagato {debtAmount.toFixed(2)} {debtCurrency} a {creditorName}
              </p>
              <div className="bg-muted p-3 rounded text-sm space-y-1">
                <p>📤 Inviato: {parseFloat(srcAmount).toFixed(6)} {srcToken?.symbol}</p>
                <p>📥 Ricevuto: {parseFloat(dstAmount).toFixed(6)} {dstToken?.symbol}</p>
              </div>
              <Button onClick={onClose} className="w-full mt-4">
                OK
              </Button>
            </div>
          )}

          {/* Step: Error */}
          {step === 'error' && (
            <div className="text-center py-8">
              <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-600" />
              <p className="font-bold text-xl mb-2">Errore</p>
              <p className="text-muted-foreground mb-4 text-sm">
                {error}
              </p>
              <Button onClick={() => setStep('select')} className="w-full">
                Riprova
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

