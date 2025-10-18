# 🚀 Deploy su Vercel - Setup Completo

## Problema risolto

L'errore `Supabase non configurato` durante il build è stato risolto. Ora devi solo configurare le variabili d'ambiente su Vercel.

## 📝 Step by Step

### 1. Vai nel tuo progetto Vercel

Apri: https://vercel.com/dashboard

### 2. Vai in Settings → Environment Variables

- Clicca sul tuo progetto `eththon`
- Nel menu laterale, clicca su **Settings**
- Poi clicca su **Environment Variables**

### 3. Aggiungi le variabili

Aggiungi queste DUE variabili:

#### Variabile 1: NEXT_PUBLIC_SUPABASE_URL
```
Nome: NEXT_PUBLIC_SUPABASE_URL
Valore: https://dtvajfoarqburjwsynvq.supabase.co
Environments: Production, Preview, Development (✓ tutti e tre)
```

#### Variabile 2: NEXT_PUBLIC_SUPABASE_ANON_KEY
```
Nome: NEXT_PUBLIC_SUPABASE_ANON_KEY
Valore: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0dmFqZm9hcnFidXJqd3N5bnZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2Nzk3NjEsImV4cCI6MjA3NjI1NTc2MX0.xqcWOq7CTOKyeJVqIeN__gmUJUlClM_OxxxmpNpnM6g
Environments: Production, Preview, Development (✓ tutti e tre)
```

### 4. Fai il Redeploy

**IMPORTANTE**: Dopo aver salvato le variabili, devi rifare il deploy!

Hai 2 opzioni:

#### Opzione A: Redeploy automatico (push su GitHub)
```bash
git add .
git commit -m "fix: configurazione supabase per vercel"
git push origin main
```

#### Opzione B: Redeploy manuale dal dashboard
1. Vai in **Deployments**
2. Clicca sui 3 puntini dell'ultimo deployment
3. Clicca su **Redeploy**

### 5. Verifica che funzioni

Dopo il deploy:
1. Apri il link del tuo sito (es. `https://eththon.vercel.app`)
2. Apri la console browser (F12)
3. Prova a fare login e creare un gruppo
4. Non dovrebbero esserci errori di Supabase

## 📸 Screenshot dei passaggi

1. **Settings → Environment Variables**
   ![Vercel Settings](https://vercel.com/_next/image?url=%2Fdocs-proxy%2Fstatic%2Fdocs%2Fplatform%2Fenv-vars-menu.png)

2. **Add New Variable**
   - Clicca su "Add New"
   - Inserisci Nome e Valore
   - Seleziona tutti gli environments
   - Clicca "Save"

## ⚠️ Note importanti

- Le variabili d'ambiente **DEVONO** iniziare con `NEXT_PUBLIC_` per essere accessibili lato client
- Non committare mai `.env.local` su Git (è già in `.gitignore`)
- Le variabili configurate su Vercel sovrascrivono quelle locali durante il deploy

## 🔍 Troubleshooting

### Build fallisce ancora?
- Verifica che i nomi delle variabili siano **esattamente** corretti
- Controlla di aver selezionato tutti e 3 gli environments
- Prova a cancellare e ricreare le variabili

### Le variabili non vengono lette?
- Fai un nuovo deploy (non basta salvarle)
- Controlla nei **Deployment Logs** se le variabili sono presenti

### Errori a runtime dopo il deploy?
- Apri la console browser e cerca errori
- Verifica che le tabelle su Supabase esistano
- Controlla le RLS policies

## ✅ Checklist finale

Prima di fare il deploy, assicurati che:
- [ ] Le variabili d'ambiente siano configurate su Vercel
- [ ] Le tabelle su Supabase esistano (esegui `supabase-schema.sql`)
- [ ] Le RLS policies permettano accesso al role `anon`
- [ ] Il build locale funzioni: `npm run build`
- [ ] Non ci siano errori TypeScript o ESLint bloccanti

## 🎉 Deploy completato!

Una volta configurato tutto, il tuo sito sarà live su Vercel con:
- ✅ Supabase configurato
- ✅ Autenticazione wallet funzionante
- ✅ Creazione gruppi e spese
- ✅ Calcoli bilanci persistiti su DB

