import dotenv from 'dotenv';
import OpenAI from 'openai';

// Carica le variabili d'ambiente
dotenv.config();

// Inizializza il client OpenAI solo se la chiave API è presente
let openai = null;

if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

/**
 * Genera feedback motivazionale personalizzato usando OpenAI
 * @param {string} text - Il testo dell'utente
 * @param {string} sentiment - Il sentiment rilevato
 * @returns {Promise<string>} - Il feedback motivazionale generato
 */
export async function generateMotivationalFeedback(text, sentiment) {
  try {
    // Verifica che la chiave API sia configurata
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('Chiave API OpenAI non configurata nel backend');
    }

    if (!openai) {
      throw new Error('Client OpenAI non inizializzato');
    }

    console.log('🤖 Generando feedback per sentiment:', sentiment);

    // Crea il prompt personalizzato basato sul sentiment
    const sentimentText = sentiment === 'positive' ? 'positivo' : 
                         sentiment === 'negative' ? 'negativo' : 'neutrale';

    const prompt = `Sei un coach motivazionale esperto di boxe. L'utente ha appena completato un allenamento di boxe e ha scritto: "${text}". 
    
    Il sentiment dell'utente è: ${sentimentText}.

    Genera una risposta motivazionale personalizzata e incoraggiante in italiano (massimo 2-3 frasi) che:
    - Riconosca i sentimenti dell'utente
    - Li motivi a continuare con l'allenamento
    - Sia specifica per il boxe
    - Usi un tono amichevole e supportivo
    - Includa un emoji appropriata alla fine

    Risposta:`;

    // Chiamata all'API di OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Sei un coach motivazionale esperto di boxe che aiuta gli atleti a mantenere la motivazione e l'entusiasmo per l'allenamento."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 150,
      temperature: 0.7,
      top_p: 0.9
    });

    console.log('📝 Risposta OpenAI ricevuta');

    if (!completion.choices || completion.choices.length === 0) {
      throw new Error('Nessuna risposta ricevuta da OpenAI');
    }

    const feedback = completion.choices[0].message.content.trim();
    
    console.log('✅ Feedback generato:', feedback.substring(0, 50) + '...');
    return feedback;

  } catch (error) {
    console.error('❌ Errore nella generazione del feedback:', error);
    
    // Se è un errore di autenticazione, fornisci un messaggio più chiaro
    if (error.status === 401) {
      throw new Error('Chiave API OpenAI non valida o scaduta');
    }
    
    // Se è un errore di quota, fornisci un messaggio appropriato
    if (error.status === 429) {
      throw new Error('Limite di richieste API OpenAI raggiunto. Riprova più tardi.');
    }
    
    // Se è un errore di rete, fornisci un messaggio appropriato
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      throw new Error('Impossibile connettersi al servizio OpenAI');
    }
    
    throw new Error(`Errore nella generazione del feedback: ${error.message}`);
  }
}

/**
 * Funzione di utilità per testare il servizio
 */
export async function testOpenAIService() {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.log('⚠️ OpenAI API Key non configurata - test saltato');
      return null;
    }

    const testText = "Ho completato il mio allenamento di boxe!";
    const testSentiment = "positive";
    const result = await generateMotivationalFeedback(testText, testSentiment);
    console.log('🧪 Test OpenAI service:', result);
    return result;
  } catch (error) {
    console.error('❌ Test OpenAI service fallito:', error);
    throw error;
  }
} 