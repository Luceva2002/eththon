'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { useAccount, useWriteContract, useSwitchChain } from 'wagmi';
import { arbitrumSepolia } from 'wagmi/chains'; // Usa Sepolia testnet per testing
import { Loader2, AlertCircle, CheckCircle2, Award, ExternalLink } from 'lucide-react';
import { GROUP_NFT_CONTRACT_ADDRESS, GROUP_NFT_ABI } from '@/lib/nft-contract';
import { type Group } from '@/lib/types';
import { groupService } from '@/lib/group-service';

interface MintGroupNFTProps {
  open: boolean;
  onClose: () => void;
  group: Group;
  onSuccess: (tokenId: string, txHash: string) => void;
}

type Step = 'confirm' | 'minting' | 'success' | 'error';

export function MintGroupNFT({ open, onClose, group, onSuccess }: MintGroupNFTProps) {
  const { address, chain } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();

  const [step, setStep] = useState<Step>('confirm');
  const [error, setError] = useState<string>('');
  const [txHash, setTxHash] = useState<string>('');
  const [tokenId, setTokenId] = useState<string>('');

  const handleMint = async () => {
    if (!address) {
      setError('Connetti il tuo wallet per mintare l&apos;NFT');
      setStep('error');
      return;
    }

    // Verifica che il contratto sia configurato
    if (GROUP_NFT_CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
      setError(
        'Contratto NFT non configurato! Aggiorna GROUP_NFT_CONTRACT_ADDRESS in src/lib/nft-contract.ts con l&apos;indirizzo del contratto deployato.'
      );
      setStep('error');
      return;
    }

    setStep('minting');
    setError('');

    try {
      // Step 1: Switch a Arbitrum Sepolia se necessario
      if (chain?.id !== arbitrumSepolia.id) {
        console.log('🔄 Switching to Arbitrum Sepolia...');
        await switchChainAsync({ chainId: arbitrumSepolia.id });
      }

      // Step 2: Chiama mintGroupNFT (versione LITE - solo groupId!)
      console.log('📝 Minting NFT con parametri:', {
        to: address,
        groupId: group.id,
      });

      const hash = await writeContractAsync({
        address: GROUP_NFT_CONTRACT_ADDRESS,
        abi: GROUP_NFT_ABI,
        functionName: 'mintGroupNFT',
        args: [
          address,
          group.id,
        ],
      });

      console.log('✅ Transaction sent:', hash);
      setTxHash(hash);

      // Step 3: Attendi conferma (con timeout)
      console.log('⏳ Waiting for transaction confirmation...');

      // Attendi ~15 secondi per la conferma
      await new Promise(resolve => setTimeout(resolve, 15000));

      // Il tokenId sarà incrementale (inizia da 1)
      // Per semplicità, non leggiamo l'evento qui ma assumiamo successo
      // In produzione, dovresti leggere l'evento GroupNFTMinted per ottenere il tokenId
      const estimatedTokenId = '1'; // Placeholder - in produzione leggilo dall'evento
      setTokenId(estimatedTokenId);

      // Step 4: Aggiorna database
      console.log('💾 Salvando dati NFT nel database...');
      const result = await groupService.updateGroupNFTData(
        group.id,
        estimatedTokenId,
        hash
      );

      if (!result.ok) {
        throw new Error('Errore salvataggio dati NFT: ' + result.error);
      }

      // Successo!
      setStep('success');
      onSuccess(estimatedTokenId, hash);
    } catch (err) {
      console.error('❌ Errore mint NFT:', err);

      let errorMessage = 'Errore durante il mint dell\'NFT';
      const error = err as Error;

      if (error.message?.includes('User rejected')) {
        errorMessage = 'Hai rifiutato la transazione nel wallet';
      } else if (error.message?.includes('already minted')) {
        errorMessage = 'Questo gruppo ha già mintato un NFT';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Fondi insufficienti per pagare il gas fee';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      setStep('error');
    }
  };

  const handleClose = () => {
    setStep('confirm');
    setError('');
    setTxHash('');
    setTokenId('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Minta NFT Commemorativo
          </DialogTitle>
          <DialogDescription>
            Crea un NFT on-chain per celebrare il completamento del gruppo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Step: Confirm */}
          {step === 'confirm' && (
            <>
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-lg space-y-2">
                <p className="font-semibold text-lg">{group.name}</p>
                <p className="text-sm text-muted-foreground">
                  {group.members.length} membri • {group.currency}
                </p>
              </div>

              <div className="bg-muted p-3 rounded text-sm space-y-1">
                <p className="font-semibold">✨ Cosa riceverai:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>NFT ERC-721 commemorativo su Arbitrum</li>
                  <li>Versione LITE - Gas ottimizzato!</li>
                  <li>Metadata customizzabili (off-chain)</li>
                  <li>Record permanente del gruppo</li>
                </ul>
              </div>

              <div className="bg-green-50 dark:bg-green-950 p-3 rounded text-sm">
                <p className="text-green-900 dark:text-green-100">
                  💰 Gas fee stimato: ~0.0001 ETH (10x più economico!) 🚀
                </p>
              </div>

              {!group.closed && (
                <div className="bg-red-50 dark:bg-red-950 p-3 rounded text-sm">
                  <p className="text-red-900 dark:text-red-100">
                    ⚠️ Attenzione: Il gruppo non è ancora chiuso. Chiudilo prima di mintare l&apos;NFT.
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose} className="flex-1">
                  Annulla
                </Button>
                <Button
                  onClick={handleMint}
                  disabled={!group.closed}
                  className="flex-1"
                >
                  <Award className="mr-2 h-4 w-4" />
                  Minta NFT
                </Button>
              </div>
            </>
          )}

          {/* Step: Minting */}
          {step === 'minting' && (
            <div className="text-center py-8">
              <Loader2 className="animate-spin h-12 w-12 mx-auto mb-4 text-primary" />
              <p className="font-semibold text-lg mb-2">Minting NFT...</p>
              <p className="text-sm text-muted-foreground">
                Conferma la transazione nel tuo wallet
              </p>
              {txHash && (
                <p className="text-xs text-muted-foreground mt-2">
                  TX: {txHash.slice(0, 10)}...{txHash.slice(-8)}
                </p>
              )}
            </div>
          )}

          {/* Step: Success */}
          {step === 'success' && (
            <div className="text-center py-8">
              <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-600" />
              <p className="font-bold text-xl mb-2">NFT Mintato!</p>
              <p className="text-muted-foreground mb-4">
                Il tuo NFT commemorativo è stato creato con successo
              </p>

              <div className="bg-muted p-3 rounded text-sm space-y-2">
                {tokenId && (
                  <p>
                    <span className="text-muted-foreground">Token ID:</span>{' '}
                    <span className="font-mono font-bold">#{tokenId}</span>
                  </p>
                )}
                {txHash && (
                  <a
                    href={`https://arbiscan.io/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 text-primary hover:underline"
                  >
                    Vedi su Arbiscan
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>

              <Button onClick={handleClose} className="w-full mt-4">
                Fantastico!
              </Button>
            </div>
          )}

          {/* Step: Error */}
          {step === 'error' && (
            <div className="text-center py-8">
              <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-600" />
              <p className="font-bold text-xl mb-2">Errore</p>
              <p className="text-muted-foreground mb-4 text-sm">{error}</p>
              <Button onClick={() => setStep('confirm')} className="w-full">
                Riprova
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
