# 🚀 Guida Deploy Smart Contract GroupNFT

## Metodo 1: Remix IDE (Raccomandato per principianti)

### Step 1: Prepara l'ambiente
1. Vai su https://remix.ethereum.org
2. Crea un nuovo workspace o usa quello di default

### Step 2: Carica il contratto
1. Nel File Explorer, crea un nuovo file: `GroupNFT.sol`
2. Copia il contenuto del file `GroupNFT.sol` dalla root del progetto
3. Incolla nel file su Remix

### Step 3: Compila
1. Click sull'icona "Solidity Compiler" (a sinistra)
2. Seleziona compiler version: `0.8.20` o superiore
3. Click "Compile GroupNFT.sol"
4. Verifica che non ci siano errori (✓ verde)

### Step 4: Configura MetaMask per Arbitrum
1. Apri MetaMask
2. Click sulla rete corrente → "Add Network" → "Add a network manually"
3. Inserisci questi dati:
   ```
   Network Name: Arbitrum One
   RPC URL: https://arb1.arbitrum.io/rpc
   Chain ID: 42161
   Currency Symbol: ETH
   Block Explorer URL: https://arbiscan.io
   ```
4. Salva e seleziona Arbitrum One

### Step 5: Ottieni ETH su Arbitrum
**Hai bisogno di ~0.002 ETH per il gas!**

Opzioni:
- **Bridge da Ethereum**: https://bridge.arbitrum.io/
- **Compra su Exchange**: Coinbase, Binance, Kraken (ritira su Arbitrum)
- **Faucet** (solo testnet): Se vuoi testare prima su Arbitrum Sepolia

### Step 6: Deploy il contratto
1. Click su "Deploy & Run Transactions" (icona a sinistra)
2. Environment: Seleziona `Injected Provider - MetaMask`
3. Verifica che MetaMask mostri "Arbitrum One" e "Connected"
4. Contract: Seleziona `GroupNFT` dal dropdown
5. Click sul bottone arancione "Deploy"
6. **MetaMask si aprirà** → Verifica gas fee → "Confirm"
7. Attendi 5-10 secondi per la conferma

### Step 7: Salva il Contract Address
1. Dopo il deploy, vedrai il contratto sotto "Deployed Contracts"
2. Click sull'icona 📋 per copiare l'indirizzo
3. **SALVA QUESTO INDIRIZZO!** Es: `0x1234567890abcdef1234567890abcdef12345678`

### Step 8: Aggiorna il frontend
1. Apri il file `src/lib/nft-contract.ts`
2. Sostituisci questa riga:
   ```typescript
   export const GROUP_NFT_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000' as const;
   ```
   Con:
   ```typescript
   export const GROUP_NFT_CONTRACT_ADDRESS = '0xTUO_INDIRIZZO_DEPLOYATO' as const;
   ```
3. Salva il file

### Step 9: Verifica su Arbiscan (Opzionale ma consigliato)
1. Vai su https://arbiscan.io/
2. Cerca il tuo contract address
3. Vedrai la transazione di deploy
4. Click su "Contract" tab
5. Click "Verify and Publish" per verificare il codice sorgente

---

## Metodo 2: Hardhat (Per sviluppatori esperti)

### Setup
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npm install @openzeppelin/contracts
npx hardhat init
```

### Configura Hardhat
Crea `hardhat.config.js`:
```javascript
require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    arbitrum: {
      url: "https://arb1.arbitrum.io/rpc",
      accounts: [process.env.PRIVATE_KEY], // Aggiungi in .env
      chainId: 42161,
    },
  },
  etherscan: {
    apiKey: {
      arbitrumOne: process.env.ARBISCAN_API_KEY, // Per verify
    },
  },
};
```

### Crea script deploy
Crea `scripts/deploy.js`:
```javascript
async function main() {
  const GroupNFT = await ethers.getContractFactory("GroupNFT");
  const groupNFT = await GroupNFT.deploy();
  await groupNFT.waitForDeployment();

  console.log("GroupNFT deployed to:", await groupNFT.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

### Deploy
```bash
npx hardhat run scripts/deploy.js --network arbitrum
```

### Verifica
```bash
npx hardhat verify --network arbitrum TUO_CONTRACT_ADDRESS
```

---

## 🔧 Troubleshooting

### "Insufficient funds"
- Hai bisogno di ETH su Arbitrum per il gas
- Usa il bridge: https://bridge.arbitrum.io/

### "Chain ID mismatch"
- Verifica che MetaMask sia connesso ad Arbitrum One (42161)
- Non Arbitrum Goerli o Sepolia

### "Compiler version error"
- Usa Solidity 0.8.20 o superiore
- Verifica che OpenZeppelin contracts siano compatibili

### "Failed to compile"
- Remix importerà automaticamente OpenZeppelin
- Attendi che il download finisca (status bar in basso)

---

## ✅ Checklist Pre-Deploy

- [ ] Ho ETH su Arbitrum One (~0.002 ETH)
- [ ] MetaMask configurato per Arbitrum One
- [ ] Contratto compilato senza errori
- [ ] Network selezionato: Arbitrum One (42161)
- [ ] Pronto a salvare il contract address

---

## 📊 Gas Fees Stimati

- Deploy contratto: ~0.0015-0.002 ETH
- Mint NFT: ~0.0008-0.001 ETH per NFT

**Totale per test**: ~0.003 ETH (~$10-15 a seconda del prezzo ETH)

---

## 🎯 Dopo il Deploy

1. ✅ Copia contract address
2. ✅ Aggiorna `src/lib/nft-contract.ts`
3. ✅ Test minting un NFT
4. ✅ Verifica su Arbiscan
5. ✅ (Opzionale) Verifica source code su Arbiscan

---

## 🆘 Supporto

- Remix Docs: https://remix-ide.readthedocs.io/
- Arbitrum Docs: https://docs.arbitrum.io/
- OpenZeppelin: https://docs.openzeppelin.com/
