# Configurazione Sintesi Vocale Umana

Questo documento spiega come configurare le API per ottenere una voce umana e naturale invece della sintesi vocale robotica del browser.

## 🎯 Opzioni Disponibili

### 1. ElevenLabs API (RACCOMANDATO)
**Qualità**: Eccellente - voci molto umane e naturali  
**Costo**: Gratuito fino a 10.000 caratteri/mese, poi a pagamento  
**Lingue**: Supporta perfettamente l'italiano  

#### Setup ElevenLabs:
1. Vai su [elevenlabs.io](https://elevenlabs.io/) e crea un account
2. Vai su "Profile" → "API Key" e copia la tua chiave API
3. Crea un file `.env` nella root del progetto
4. Aggiungi: `VITE_ELEVENLABS_API_KEY=la_tua_chiave_api`

#### Voci Italiane Consigliate:
- **Antoni** (ID: `21m00Tcm4TlvDq8ikWAM`) - Voce maschile italiana
- **Bella** (ID: `EXAVITQu4vr4xnSDxMaL`) - Voce femminile italiana
- **Adam** (ID: `pNInz6obpgDQGcFmaJgB`) - Voce maschile neutrale

Per cambiare voce, aggiungi al `.env`:
```
VITE_ELEVENLABS_VOICE_ID=ID_DELLA_VOCE_SCELTA
```

### 2. OpenAI TTS API (ALTERNATIVA)
**Qualità**: Molto buona  
**Costo**: Molto economico ($0.015 per 1.000 caratteri)  
**Lingue**: Supporta l'italiano  

#### Setup OpenAI:
1. Vai su [platform.openai.com](https://platform.openai.com/) e crea un account
2. Vai su "API Keys" e genera una nuova chiave
3. Aggiungi al file `.env`: `VITE_OPENAI_API_KEY=la_tua_chiave_api`

#### Voci Disponibili:
- **alloy** - Voce neutrale
- **echo** - Voce maschile
- **fable** - Voce femminile
- **onyx** - Voce maschile profonda
- **nova** - Voce femminile chiara
- **shimmer** - Voce femminile calda

### 3. Fallback Browser (GRATUITO)
Se non configuri nessuna API, l'app userà automaticamente la sintesi vocale del browser.

## 📁 Configurazione File

Crea un file `.env` nella root del progetto:

```env
# ElevenLabs (Raccomandato)
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
VITE_ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM

# OpenAI (Alternativa)
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

## 🔧 Come Funziona

L'app prova le API in questo ordine:
1. **ElevenLabs** (migliore qualità)
2. **OpenAI TTS** (buona qualità)
3. **Sintesi vocale browser** (fallback gratuito)

## 💰 Costi Stimati

### ElevenLabs:
- **Gratuito**: 10.000 caratteri/mese
- **Piano Starter**: $5/mese per 30.000 caratteri
- **Piano Creator**: $22/mese per 250.000 caratteri

### OpenAI:
- **$0.015** per 1.000 caratteri
- Un allenamento tipico costa circa $0.01-0.05

## 🎵 Personalizzazione Voce

### ElevenLabs - Parametri Avanzati:
Puoi modificare i parametri nel file `src/utils/audio.js`:

```javascript
voice_settings: {
  stability: 0.5,        // Stabilità (0-1) - più alto = più stabile
  similarity_boost: 0.75, // Similitudine (0-1) - più alto = più simile all'originale
  style: 0.0,            // Stile (0-1) - più alto = più espressivo
  use_speaker_boost: true // Migliora chiarezza
}
```

### OpenAI - Velocità:
Modifica il parametro `speed` nel file `src/utils/audio.js`:
```javascript
speed: 1.0  // 0.25 = molto lento, 4.0 = molto veloce
```

## 🚀 Test Rapido

1. Configura una delle API sopra
2. Riavvia l'app: `npm run dev`
3. Crea un allenamento e avvialo
4. Dopo 4 secondi dovresti sentire la voce umana annunciare il round

## ❓ Problemi Comuni

**"API key non configurata"**
- Verifica che il file `.env` sia nella root del progetto
- Riavvia l'app dopo aver aggiunto le variabili d'ambiente

**"Errore API"**
- Verifica che la chiave API sia corretta
- Controlla i crediti/limiti del tuo account

**"Voce robotica"**
- L'app sta usando il fallback del browser
- Configura una delle API sopra per una voce migliore

## 🎯 Raccomandazione

Per iniziare, ti consiglio **ElevenLabs** con il piano gratuito:
- Ottieni la migliore qualità
- 10.000 caratteri sono sufficienti per molti allenamenti
- Facile da configurare 