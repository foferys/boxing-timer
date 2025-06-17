import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { analyzeSentiment } from './services/sentimentService.js';
import { generateMotivationalFeedback } from './services/openaiService.js';

// Carica le variabili d'ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Route di health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend Boxing Timer funzionante!' });
});

// Route per l'analisi del sentiment
app.post('/api/sentiment', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || !text.trim()) {
      return res.status(400).json({ 
        error: 'Il testo è obbligatorio per l\'analisi del sentiment' 
      });
    }

    const sentiment = await analyzeSentiment(text);
    res.json({ sentiment });
  } catch (error) {
    console.error('Errore nell\'analisi del sentiment:', error);
    res.status(500).json({ 
      error: 'Errore interno del server durante l\'analisi del sentiment',
      details: error.message 
    });
  }
});

// Route per la generazione di feedback motivazionale
app.post('/api/feedback', async (req, res) => {
  try {
    const { text, sentiment } = req.body;
    
    if (!text || !text.trim()) {
      return res.status(400).json({ 
        error: 'Il testo è obbligatorio per generare il feedback' 
      });
    }

    const feedback = await generateMotivationalFeedback(text, sentiment);
    res.json({ feedback });
  } catch (error) {
    // Gestione fallback per qualsiasi errore OpenAI
    let fallbackFeedback = '';
    switch ((req.body.sentiment || '').toLowerCase()) {
      case 'positive':
        fallbackFeedback = 'Fantastico! Continua così! Il tuo allenamento ti sta facendo sentire bene! 💪';
        break;
      case 'negative':
        fallbackFeedback = 'Non preoccuparti, è normale avere giorni difficili. Ricorda che ogni allenamento ti rende più forte! 🌟';
        break;
      default:
        fallbackFeedback = 'Hai completato l\'allenamento! Continua a monitorare come ti senti per migliorare sempre di più! 🎯';
    }
    return res.status(429).json({
      error: error.message || 'Errore con l\'API OpenAI',
      feedback: fallbackFeedback
    });
  }
});

// Route combinata per analisi sentiment + feedback
app.post('/api/analyze', async (req, res) => {
  try {
    // 29. RICEZIONE RICHIESTA - Il backend riceve la richiesta dal frontend
    const { text } = req.body;
    
    // 30. VALIDAZIONE INPUT - Controlla che il testo sia presente
    if (!text || !text.trim()) {
      return res.status(400).json({ 
        error: 'Il testo è obbligatorio per l\'analisi' 
      });
    }

    // 31. ANALISI SENTIMENT - Chiama il servizio Hugging Face per sentiment
    const sentiment = await analyzeSentiment(text);
    
    // 32. GENERAZIONE FEEDBACK - Chiama OpenAI per generare feedback motivazionale
    try {
      const feedback = await generateMotivationalFeedback(text, sentiment);
      // 33. RISPOSTA SUCCESSO - Invia sentiment e feedback al frontend
      res.json({ sentiment, feedback });
    } catch (error) {
      // 34. GESTIONE FALLBACK - Se OpenAI fallisce, usa feedback preimpostato
      let fallbackFeedback = '';
      switch ((sentiment || '').toLowerCase()) {
        case 'positive':
          fallbackFeedback = 'Fantastico! Continua così! Il tuo allenamento ti sta facendo sentire bene! 💪';
          break;
        case 'negative':
          fallbackFeedback = 'Non preoccuparti, è normale avere giorni difficili. Ricorda che ogni allenamento ti rende più forte! 🌟';
          break;
        default:
          fallbackFeedback = 'Hai completato l\'allenamento! Continua a monitorare come ti senti per migliorare sempre di più! 🎯';
      }
      // 35. RISPOSTA FALLBACK - Invia sentiment + feedback preimpostato
      return res.status(429).json({
        error: error.message || 'Errore con l\'API OpenAI',
        sentiment,
        feedback: fallbackFeedback
      });
    }
  } catch (error) {
    // 36. GESTIONE ERRORI GENERALI - Errore nell'analisi sentiment
    console.error('Errore nell\'analisi completa:', error);
    res.status(500).json({ 
      error: 'Errore interno del server durante l\'analisi',
      details: error.message 
    });
  }
});

// Gestione errori 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route non trovata' });
});

// Middleware per la gestione degli errori
app.use((error, req, res, next) => {
  console.error('Errore non gestito:', error);
  res.status(500).json({ 
    error: 'Errore interno del server',
    details: error.message 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server backend avviato sulla porta ${PORT}`);
  console.log(`📡 Health check disponibile su: http://localhost:${PORT}/api/health`);
}); 