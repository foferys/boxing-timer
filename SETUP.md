# 🥊 Boxing Timer - Setup Backend

Questo progetto ora utilizza un backend Node.js/Express per proteggere le chiavi API e gestire le logiche lato server.

## 📋 Prerequisiti

- Node.js (versione 18.0.0 o superiore)
- npm o yarn
- Chiavi API per OpenAI e Hugging Face

## 🔧 Configurazione

### 1. Installazione Dipendenze

```bash
npm install
```

### 2. Configurazione Variabili d'Ambiente

Copia il file di esempio e configuralo:

```bash
cp env.example .env
```

Modifica il file `.env` con le tue chiavi API:

```env
# Configurazione Backend
PORT=3001
FRONTEND_URL=http://localhost:5173

# Chiavi API (obbligatorie)
OPENAI_API_KEY=your_openai_api_key_here
HUGGINGFACE_API_KEY=your_huggingface_api_key_here

# Configurazione ambiente
NODE_ENV=development
```

### 3. Ottenere le Chiavi API

#### OpenAI API Key
1. Vai su [OpenAI Platform](https://platform.openai.com/)
2. Crea un account o accedi
3. Vai su "API Keys"
4. Crea una nuova chiave API
5. Copia la chiave nel file `.env`

#### Hugging Face API Key
1. Vai su [Hugging Face](https://huggingface.co/)
2. Crea un account o accedi
3. Vai su "Settings" > "Access Tokens"
4. Crea un nuovo token
5. Copia il token nel file `.env`

## 🚀 Avvio del Progetto

### Sviluppo (Frontend + Backend)

```bash
npm run dev
```

Questo comando avvierà:
- Frontend React su `http://localhost:5173`
- Backend Express su `http://localhost:3001`

### Solo Backend

```bash
npm run dev:backend
```

### Solo Frontend

```bash
npm run dev:frontend
```

## 🧪 Test del Backend

Per verificare che il backend funzioni correttamente:

```bash
node server/test.js
```

Questo test verificherà:
- Configurazione delle chiavi API
- Connessione a Hugging Face per l'analisi sentiment
- Connessione a OpenAI per la generazione feedback
- Test completo del flusso

## 📡 API Endpoints

Il backend espone i seguenti endpoint:

### Health Check
```
GET /api/health
```

### Analisi Sentiment
```
POST /api/sentiment
Body: { "text": "testo da analizzare" }
```

### Generazione Feedback
```
POST /api/feedback
Body: { "text": "testo utente", "sentiment": "positive" }
```

### Analisi Completa
```
POST /api/analyze
Body: { "text": "testo da analizzare" }
```

## 🔒 Sicurezza

- Le chiavi API sono ora protette nel backend
- Il frontend non ha più accesso diretto alle chiavi API
- Tutte le chiamate API passano attraverso il backend
- CORS configurato per permettere solo chiamate dal frontend

## 🐛 Risoluzione Problemi

### Errore "Chiave API non configurata"
- Verifica che il file `.env` esista
- Controlla che le chiavi API siano corrette
- Riavvia il server dopo aver modificato `.env`

### Errore di Connessione
- Verifica che il backend sia in esecuzione sulla porta 3001
- Controlla che il frontend sia in esecuzione sulla porta 5173
- Verifica la configurazione CORS

### Errore API
- Controlla che le chiavi API siano valide
- Verifica i limiti di quota delle API
- Controlla i log del server per dettagli

## 📁 Struttura del Progetto

```
boxing-timer/
├── src/                    # Frontend React
│   ├── components/         # Componenti React
│   ├── services/          # Servizi API frontend
│   └── ...
├── server/                # Backend Node.js/Express
│   ├── services/          # Servizi API backend
│   ├── index.js           # Server principale
│   └── test.js            # Test del backend
├── .env                   # Variabili d'ambiente (da creare)
├── env.example            # Esempio configurazione
└── package.json           # Dipendenze e script
```

## 🎯 Prossimi Passi

1. Configura le chiavi API nel file `.env`
2. Avvia il progetto con `npm run dev`
3. Testa il backend con `node server/test.js`
4. Usa l'applicazione normalmente - ora è più sicura! 🛡️ 