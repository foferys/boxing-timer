import dotenv from 'dotenv';
import { analyzeSentiment } from './services/sentimentService.js';
import { generateMotivationalFeedback } from './services/openaiService.js';

// Carica le variabili d'ambiente
dotenv.config();

async function testBackendServices() {
  console.log('🧪 Avvio test dei servizi backend...\n');

  // Test 1: Verifica configurazione
  console.log('1️⃣ Verifica configurazione:');
  console.log('   - OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅ Configurata' : '❌ Non configurata');
  console.log('   - HUGGINGFACE_API_KEY:', process.env.HUGGINGFACE_API_KEY ? '✅ Configurata' : '❌ Non configurata');
  console.log('');

  // Test 2: Test sentiment analysis
  if (process.env.HUGGINGFACE_API_KEY) {
    console.log('2️⃣ Test analisi sentiment:');
    try {
      const testText = "I feel great after my boxing workout!";
      const sentiment = await analyzeSentiment(testText);
      console.log(`   ✅ Sentiment rilevato: ${sentiment}`);
    } catch (error) {
      console.log(`   ❌ Errore sentiment: ${error.message}`);
    }
    console.log('');
  }

  // Test 3: Test OpenAI feedback
  if (process.env.OPENAI_API_KEY) {
    console.log('3️⃣ Test generazione feedback:');
    try {
      const testText = "Ho completato il mio allenamento di boxe!";
      const testSentiment = "positive";
      const feedback = await generateMotivationalFeedback(testText, testSentiment);
      console.log(`   ✅ Feedback generato: ${feedback.substring(0, 50)}...`);
    } catch (error) {
      console.log(`   ❌ Errore feedback: ${error.message}`);
    }
    console.log('');
  }

  // Test 4: Test completo
  if (process.env.OPENAI_API_KEY && process.env.HUGGINGFACE_API_KEY) {
    console.log('4️⃣ Test completo:');
    try {
      const testText = "Mi sento stanco ma soddisfatto del mio allenamento";
      const sentiment = await analyzeSentiment(testText);
      const feedback = await generateMotivationalFeedback(testText, sentiment);
      console.log(`   ✅ Sentiment: ${sentiment}`);
      console.log(`   ✅ Feedback: ${feedback.substring(0, 50)}...`);
    } catch (error) {
      console.log(`   ❌ Errore test completo: ${error.message}`);
    }
  }

  console.log('\n🏁 Test completati!');
}

// Esegui i test se il file viene chiamato direttamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testBackendServices().catch(console.error);
}

export { testBackendServices }; 