# Eththon - Bill Splitting Platform

Una piattaforma web moderna per la divisione delle spese tra gruppi di amici, costruita con Next.js, TypeScript, Tailwind CSS e shadcn/ui.

## 🚀 Caratteristiche

- ✅ **Autenticazione**: Sistema di login/registrazione con supporto per connessione wallet crypto
- 📊 **Dashboard**: Vista d'insieme di tutti i gruppi con statistiche aggregate
- 👥 **Gestione Gruppi**: Crea e gestisci gruppi per dividere le spese
- 💰 **Tracking Spese**: Monitora chi deve dare e chi deve ricevere denaro
- 🔗 **Integrazione Wallet**: Connetti il tuo wallet crypto (mock per ora)
- 📱 **Responsive**: Design mobile-first con layout adattivo
- ♿ **Accessibile**: Focus sulla navigazione da tastiera e label accessibili

## 🛠️ Stack Tecnologico

- **Framework**: Next.js 15 (App Router)
- **Linguaggio**: TypeScript
- **Styling**: Tailwind CSS 4
- **Componenti UI**: shadcn/ui (Radix UI)
- **Icone**: Lucide React
- **Gestione Stato**: React hooks + localStorage (mock)

## 📁 Struttura del Progetto

```
ethton/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── sign-in/           # Pagina di login
│   │   ├── sign-in/           # Pagina di accesso
│   │   ├── profile/           # Profilo utente
│   │   ├── groups/            # Pagine dei gruppi
│   │   │   ├── new/          # Crea nuovo gruppo
│   │   │   └── [groupId]/    # Dettaglio gruppo
│   │   ├── layout.tsx         # Layout principale
│   │   ├── page.tsx           # Home/Dashboard
│   │   └── globals.css        # Stili globali
│   ├── components/            # Componenti React
│   │   ├── ui/               # Componenti shadcn/ui
│   │   ├── navbar.tsx        # Barra di navigazione
│   │   ├── group-card.tsx    # Card gruppo
│   │   ├── stat-chip.tsx     # Chip statistiche
│   │   ├── wallet-connect-button.tsx
│   │   └── create-group-form.tsx
│   └── lib/                   # Utilities e servizi
│       ├── types.ts          # TypeScript types
│       ├── utils.ts          # Helper functions
│       ├── auth-service.ts   # Servizio autenticazione (mock)
│       ├── wallet-service.ts # Servizio wallet (mock)
│       └── group-service.ts  # Servizio gruppi (mock)
├── public/                    # Asset statici
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Installazione e Avvio

### Prerequisiti

- Node.js 18+ 
- npm o yarn

### Installazione Dipendenze

```bash
cd /Users/body/Desktop/ethton
npm install
```

### Avvio in Modalità Sviluppo

```bash
npm run dev
```

L'applicazione sarà disponibile su [http://localhost:3000](http://localhost:3000)

### Build per Produzione

```bash
npm run build
npm start
```

## 📄 Pagine e Route

| Route | Descrizione | Funzionalità |
|-------|-------------|--------------|
| `/` | Home/Dashboard | Mostra tutti i gruppi dell'utente con statistiche |
| `/sign-in` | Login | Form di accesso con email/password |
| `/sign-in` | Accesso | Connessione wallet e nickname |
| `/profile` | Profilo | Visualizza e gestisci info utente e wallet |
| `/groups/new` | Crea Gruppo | Form per creare un nuovo gruppo |
| `/groups/[id]` | Dettaglio Gruppo | Visualizza membri, spese e saldi |

## 🎨 Componenti Principali

### UI Components (shadcn/ui)
- `Button` - Bottoni con varianti
- `Card` - Container con header/content/footer
- `Input` - Input di testo
- `Label` - Label per form
- `Avatar` - Avatar utente
- `Dialog` - Finestre modali
- `Badge` - Etichette colorate
- `Tabs` - Schede navigabili
- `DropdownMenu` - Menu dropdown

### Custom Components
- `NavBar` - Barra di navigazione con menu utente
- `WalletConnectButton` - Bottone per connettere wallet crypto
- `GroupCard` - Card per visualizzare un gruppo
- `StatChip` - Chip per mostrare statistiche
- `CreateGroupForm` - Form di creazione gruppo

## 🔐 Autenticazione (Mock)

L'autenticazione è attualmente implementata con logica mock:
- Accetta qualsiasi email/password
- I dati sono salvati in localStorage
- La connessione wallet genera un indirizzo mock

**TODO per produzione:**
- Implementare autenticazione reale (NextAuth, Supabase, Auth0, etc.)
- Aggiungere validazione lato server
- Implementare sessioni sicure

## 💳 Wallet Crypto (Mock)

La funzionalità wallet è attualmente mock:
- Genera indirizzi Ethereum casuali
- Simula la connessione con delay
- Stato salvato in localStorage

**TODO per produzione:**
- Integrare Web3 provider reale (ethers.js, wagmi, RainbowKit)
- Supportare MetaMask, WalletConnect, ecc.
- Implementare transazioni on-chain

## 📊 Gestione Dati (Mock)

I dati sono attualmente gestiti con:
- localStorage per persistenza
- Dati mock iniziali
- Operazioni simulate con delay

**TODO per produzione:**
- Implementare API backend (REST o GraphQL)
- Database (PostgreSQL, MongoDB, etc.)
- Autenticazione API
- Validazione e sicurezza

## ♿ Accessibilità

L'applicazione include:
- Label ARIA per tutti gli input
- Navigazione da tastiera completa
- Stati di focus visibili
- Testo alternativo per icone importanti
- Contrasto colori conforme WCAG

## 🎨 Design

- **Layout**: Mobile-first, responsive
- **Colori**: Sistema di design con dark mode
- **Tipografia**: System fonts per performance
- **Spacing**: Sistema di spaziatura consistente
- **Componenti**: shadcn/ui per consistenza

## 🔄 Prossimi Passi

### Backend & Database
- [ ] Creare API backend (Node.js/Express, tRPC, o Prisma)
- [ ] Configurare database
- [ ] Implementare autenticazione reale
- [ ] API per CRUD gruppi e spese

### Funzionalità Spese
- [ ] Form per aggiungere spese
- [ ] Calcolo automatico dei saldi
- [ ] Algoritmo per suggerire pagamenti ottimali
- [ ] Storico transazioni

### Funzionalità Wallet
- [ ] Integrazione Web3 reale
- [ ] Supporto multiple chain
- [ ] Transazioni crypto on-chain
- [ ] Gas estimation

### UX Improvements
- [ ] Notifiche in-app
- [ ] Inviti via email/link
- [ ] Upload immagini/ricevute
- [ ] Grafici e statistiche avanzate
- [ ] Export PDF/Excel

### Testing
- [ ] Unit tests (Jest)
- [ ] Integration tests
- [ ] E2E tests (Playwright)
- [ ] Accessibility tests

## 📝 Note

- **Dati Mock**: Tutti i dati sono attualmente memorizzati in localStorage e verranno resettati alla pulizia del browser
- **Wallet**: La connessione wallet è simulata e non effettua transazioni reali
- **Autenticazione**: L'autenticazione è basica e non sicura per produzione
- **Responsive**: Testato su desktop, tablet e mobile

## 🤝 Contributi

Questo è un progetto scaffold per dimostrare l'architettura. Per estenderlo:

1. Implementare il backend (vedi TODO)
2. Sostituire i mock service con API reali
3. Aggiungere testing
4. Implementare funzionalità crypto reali

## 📄 Licenza

Questo progetto è fornito come scaffold di esempio.

---

**Costruito con** ❤️ **usando Next.js, TypeScript e shadcn/ui**
