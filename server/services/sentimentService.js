import dotenv from 'dotenv';
import { HfInference } from '@huggingface/inference';

// Carica le variabili d'ambiente
dotenv.config();

// Inizializza il client Hugging Face solo se la chiave API è presente
let hf = null;

if (process.env.HUGGINGFACE_API_KEY) {
  hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
}

// Modello per l'analisi del sentiment
const SENTIMENT_MODEL = "distilbert/distilbert-base-uncased-finetuned-sst-2-english";

/**
 * Analizza il sentiment di un testo usando Hugging Face
 * @param {string} text - Il testo da analizzare
 * @returns {Promise<string>} - Il sentiment (positive, negative, neutral)
 */
export async function analyzeSentiment(text) {
  try {
    // Verifica che la chiave API sia configurata
    if (!process.env.HUGGINGFACE_API_KEY) {
      throw new Error('Chiave API Hugging Face non configurata nel backend');
    }

    if (!hf) {
      throw new Error('Client Hugging Face non inizializzato');
    }

    console.log('🔍 Analizzando sentiment per:', text.substring(0, 50) + '...');

    // Chiamata all'API di Hugging Face
    const result = await hf.textClassification({
      model: SENTIMENT_MODEL,
      inputs: text,
    });

    console.log('📊 Risultato sentiment:', result);

    if (!result || !Array.isArray(result) || result.length === 0) {
      throw new Error('Risposta non valida dall\'API Hugging Face');
    }

    // Estrai il sentiment dal risultato
    const sentimentData = result[0];
    const sentimentLabel = sentimentData.label.toLowerCase();

    // Mappa i sentimenti in italiano
    const sentimentMap = {
      'positive': 'positive',
      'negative': 'negative',
      'neutral': 'neutral'
    };

    const mappedSentiment = sentimentMap[sentimentLabel] || 'neutral';

    console.log(`✅ Sentiment rilevato: ${mappedSentiment}`);
    return mappedSentiment;

  } catch (error) {
    console.error('❌ Errore nell\'analisi del sentiment:', error);
    
    // Se è un errore di autenticazione, fornisci un messaggio più chiaro
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      throw new Error('Chiave API Hugging Face non valida o scaduta');
    }
    
    // Se è un errore di rete, fornisci un messaggio appropriato
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      throw new Error('Impossibile connettersi al servizio di analisi sentiment');
    }
    
    throw new Error(`Errore nell'analisi del sentiment: ${error.message}`);
  }
}

/**
 * Funzione di utilità per testare il servizio
 */
export async function testSentimentService() {
  try {
    if (!process.env.HUGGINGFACE_API_KEY) {
      console.log('⚠️ Hugging Face API Key non configurata - test saltato');
      return null;
    }

    const testText = "I feel great after my boxing workout!";
    const result = await analyzeSentiment(testText);
    console.log('🧪 Test sentiment service:', result);
    return result;
  } catch (error) {
    console.error('❌ Test sentiment service fallito:', error);
    throw error;
  }
} 