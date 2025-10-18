# 🔧 Configurazione Variabili d'Ambiente Vercel

## 🔴 Problema: Dati si Azzerano su Vercel

Se i dati funzionano in localhost ma si azzerano su Vercel/Farcaster, **le variabili d'ambiente non sono configurate**.

---

## ✅ Soluzione Passo-Passo

### 1. Apri il Dashboard Vercel

Vai su: https://vercel.com/dashboard

### 2. Seleziona il Progetto

Clicca su **eththon** (o il nome del tuo progetto)

### 3. Vai nelle Impostazioni

- Clicca su **Settings** nel menu in alto
- Nel menu laterale, clicca su **Environment Variables**

### 4. Aggiungi la Prima Variabile

Clicca su **Add New** e inserisci:

```
Key (Nome):
NEXT_PUBLIC_SUPABASE_URL

Value (Valore):
https://dtvajfoarqburjwsynvq.supabase.co

Environment (Ambienti):
✓ Production
✓ Preview
✓ Development
```

Poi clicca **Save**.

### 5. Aggiungi la Seconda Variabile

Clicca di nuovo su **Add New** e inserisci:

```
Key (Nome):
NEXT_PUBLIC_SUPABASE_ANON_KEY

Value (Valore):
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0dmFqZm9hcnFidXJqd3N5bnZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2Nzk3NjEsImV4cCI6MjA3NjI1NTc2MX0.xqcWOq7CTOKyeJVqIeN__gmUJUlClM_OxxxmpNpnM6g

Environment (Ambienti):
✓ Production
✓ Preview
✓ Development
```

Poi clicca **Save**.

### 6. Verifica le Variabili Salvate

Dovresti vedere entrambe le variabili nella lista:
```
NEXT_PUBLIC_SUPABASE_URL          Production, Preview, Development
NEXT_PUBLIC_SUPABASE_ANON_KEY     Production, Preview, Development
```

---

## 🚀 7. Fai il Redeploy (IMPORTANTE!)

**Le variabili NON vengono applicate automaticamente** ai deployment esistenti.  
**DEVI fare un redeploy!**

### Opzione A: Push su GitHub (consigliato)

```bash
git add .
git commit -m "fix: aggiunti log debug supabase"
git push origin main
```

Vercel farà automaticamente il redeploy.

### Opzione B: Redeploy Manuale

1. Vai nella sezione **Deployments**
2. Trova l'ultimo deployment
3. Clicca sui **3 puntini** (•••) a destra
4. Clicca su **Redeploy**
5. Conferma

---

## ✅ 8. Verifica che Funzioni

Dopo 2-3 minuti che il deploy è completato:

### Test 1: Apri la Console

1. Vai su https://eththon.vercel.app
2. Apri la **Console del Browser** (F12 → Console)
3. Dovresti vedere:
   ```
   ✅ Supabase configurato: https://dtvajfoarqburjwsynvq...
   ```

### Test 2: Crea un Gruppo

1. Fai login con il wallet
2. Crea un nuovo gruppo
3. **Ricarica la pagina** (F5)
4. Il gruppo **deve essere ancora lì** ✅

### Test 3: Aggiungi una Spesa

1. Entra nel gruppo
2. Aggiungi una spesa
3. Ricarica la pagina
4. La spesa **deve essere ancora lì** ✅

---

## 🔍 Diagnostica Errori

### Console mostra: "🔴 SUPABASE NON CONFIGURATO!"

**Problema**: Le variabili non sono state configurate correttamente.

**Soluzione**:
1. Verifica che i nomi siano **esatti**: `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Verifica che siano selezionati **tutti e 3 gli ambienti**
3. Fai il **redeploy** (le variabili non si applicano automaticamente)

### I dati si cancellano ancora dopo il refresh

**Problema**: L'app sta usando localStorage invece di Supabase.

**Causa**: Le variabili sono configurate ma il deployment è vecchio.

**Soluzione**:
1. Fai un **nuovo deploy** (push su GitHub o redeploy manuale)
2. Svuota la cache del browser (Ctrl+Shift+R)
3. Riprova

### Errore: "Invalid API key"

**Problema**: La chiave Supabase è sbagliata o scaduta.

**Soluzione**:
1. Vai su https://supabase.com/dashboard
2. Apri il progetto `dtvajfoarqburjwsynvq`
3. Vai in **Settings** → **API**
4. Copia di nuovo l'**anon/public key**
5. Aggiorna la variabile su Vercel
6. Redeploy

### Vercel mostra "Build successful" ma i dati non persistono

**Problema**: Le variabili sono configurate ma il client le legge come vuote.

**Possibili cause**:
- Cache del browser
- Service Worker vecchio
- Deploy non completato

**Soluzione**:
1. Svuota cache: Ctrl+Shift+Delete → Svuota tutto
2. Apri in incognito: Ctrl+Shift+N
3. Controlla la console per il log "✅ Supabase configurato"

---

## 📋 Checklist Finale

Prima di dire "fatto", verifica:

- [ ] Hai aggiunto `NEXT_PUBLIC_SUPABASE_URL` su Vercel
- [ ] Hai aggiunto `NEXT_PUBLIC_SUPABASE_ANON_KEY` su Vercel
- [ ] Hai selezionato **Production, Preview, Development** per entrambe
- [ ] Hai fatto il **redeploy** (push o manuale)
- [ ] La console mostra "✅ Supabase configurato"
- [ ] I gruppi **persistono** dopo il refresh
- [ ] Le spese **persistono** dopo il refresh

---

## 🎯 Perché Succede?

### In Localhost:
- Legge il file `.env.local` con le credenziali
- Si connette a Supabase reale
- I dati vengono salvati nel database

### Su Vercel (PRIMA della configurazione):
- NON ha accesso a `.env.local` (è locale!)
- Le variabili d'ambiente sono **vuote**
- Usa placeholder: `https://placeholder.supabase.co`
- I dati vanno in **localStorage** (temporaneo)
- Ad ogni refresh **si cancellano**

### Su Vercel (DOPO la configurazione):
- Legge le variabili configurate su Vercel
- Si connette a Supabase reale
- I dati vengono salvati nel database
- **Persistono per sempre** ✅

---

## 🆘 Serve Ancora Aiuto?

Se dopo aver seguito tutti i passaggi i dati si cancellano ancora:

1. **Controlla i log di Vercel**:
   - Vai in **Deployments**
   - Clicca sull'ultimo deployment
   - Controlla **Runtime Logs**
   - Cerca errori di Supabase

2. **Controlla Supabase**:
   - Vai su https://supabase.com/dashboard
   - Apri il progetto
   - Vai in **Table Editor**
   - Verifica che le tabelle esistano:
     - `groups`
     - `group_members`
     - `expenses`
     - `payments`

3. **Testa l'API direttamente**:
   ```bash
   curl https://dtvajfoarqburjwsynvq.supabase.co/rest/v1/groups \
     -H "apikey: LA_TUA_ANON_KEY"
   ```

---

## 🎉 Completato!

Una volta configurato, **non dovrai più toccare niente**.  
Tutti i futuri deploy useranno automaticamente le variabili configurate.

**Buon lancio su Farcaster! 🚀**

