# 🏆 Eththon — ETH Rome 2025 (Arbitrum & 1inch Bounty Winners!)

> *Splitwise incontra Farcaster, ma nel Web3. Progetto vincitore dei premi bounty di Arbitrum e 1inch all'hackathon di Roma.*

## 🍕 L'Esperienza: 48 Ore di Codice, Caffeina e Web3

Questo progetto non è solo una repository, è il risultato di un fine settimana di fuoco all'**ETH Rome 2025**. L'obiettivo era ambizioso: prendere la comodità di un'app per dividere le spese (alla Splitwise), unirla alle dinamiche social decentralizzate (alla Farcaster) e far girare il tutto su architettura Web3, senza però rinunciare a un'esperienza utente fluida e moderna.

Dopo 48 ore insonni passate a debuggare componenti, integrare smart contract e perfezionare la UI, abbiamo presentato **Eththon**. Il nostro focus sull'ottimizzazione ci ha premiato: abbiamo conquistato le **bounty ufficiali di Arbitrum e 1inch**! 🚀 

Per un'app che deve dividere conti e micro-spese, integrare un Layer 2 come Arbitrum (per abbattere drasticamente le gas fee) e un aggregatore come 1inch (per gestire i cambi token in modo efficiente) è stata la carta vincente. Questa repository contiene lo scaffold del progetto che ci ha portato alla vittoria di questi premi.

---

## 💻 Il Progetto

Una piattaforma web moderna per la divisione delle spese tra gruppi di amici, costruita con Next.js, TypeScript, Tailwind CSS e shadcn/ui. 

### 🚀 Caratteristiche Principali
* ✅ **Autenticazione Ibrida**: Sistema di login tradizionale affiancato al supporto per connessione wallet crypto.
* 📊 **Dashboard Intelligente**: Vista d'insieme di tutti i gruppi con statistiche aggregate e bilanci.
* 👥 **Gestione Gruppi**: Creazione e amministrazione di gruppi per dividere le spese in modo equo.
* 💰 **Tracking Spese**: Monitoraggio in tempo reale di chi deve dare e chi deve ricevere fondi.
* 🔗 **Integrazione Wallet**: Connessione diretta del wallet crypto (attualmente implementata in mock per la demo).
* 📱 **Responsive Design**: UI mobile-first adattiva, perfetta per gestire i conti direttamente dallo smartphone dopo una cena.
* ♿ **Accessibilità**: Focus sulla navigazione da tastiera e supporto screen reader tramite label accessibili.

---

## 🛠️ Stack Tecnologico

* **Framework:** Next.js 15 (App Router)
* **Linguaggio:** TypeScript
* **Styling:** Tailwind CSS 4
* **Componenti UI:** shadcn/ui (Radix UI)
* **Iconografia:** Lucide React
* **Gestione Stato:** React hooks + localStorage (Mock state management)
* **Web3 Integration (Hackathon Focus):** Arbitrum (L2 Scaling), 1inch (DEX Aggregator)

---

## 🚀 Installazione e Avvio

### Prerequisiti
* Node.js 18+ 
* npm o yarn

### Setup
```bash
# Clona il progetto e naviga nella cartella
cd ethton

# Installa le dipendenze
npm install

# Avvia il server di sviluppo
npm run dev
