import dotenv from 'dotenv';

// Carica le variabili d'ambiente
dotenv.config();

async function testServerConfiguration() {
  console.log('🧪 Test configurazione server...\n');

  // Test 1: Verifica configurazione base
  console.log('1️⃣ Verifica configurazione base:');
  console.log('   - PORT:', process.env.PORT || '3001 (default)');
  console.log('   - FRONTEND_URL:', process.env.FRONTEND_URL || 'http://localhost:5173 (default)');
  console.log('   - NODE_ENV:', process.env.NODE_ENV || 'development (default)');
  console.log('');

  // Test 2: Verifica dipendenze
  console.log('2️⃣ Verifica dipendenze:');
  try {
    const express = await import('express');
    console.log('   ✅ Express importato correttamente');
  } catch (error) {
    console.log('   ❌ Errore import Express:', error.message);
  }

  try {
    const cors = await import('cors');
    console.log('   ✅ CORS importato correttamente');
  } catch (error) {
    console.log('   ❌ Errore import CORS:', error.message);
  }

  try {
    const dotenv = await import('dotenv');
    console.log('   ✅ dotenv importato correttamente');
  } catch (error) {
    console.log('   ❌ Errore import dotenv:', error.message);
  }
  console.log('');

  // Test 3: Verifica servizi (senza chiavi API)
  console.log('3️⃣ Verifica servizi (senza chiavi API):');
  
  try {
    const { analyzeSentiment } = await import('./services/sentimentService.js');
    console.log('   ✅ Servizio sentiment caricato');
  } catch (error) {
    console.log('   ❌ Errore caricamento servizio sentiment:', error.message);
  }

  try {
    const { generateMotivationalFeedback } = await import('./services/openaiService.js');
    console.log('   ✅ Servizio OpenAI caricato');
  } catch (error) {
    console.log('   ❌ Errore caricamento servizio OpenAI:', error.message);
  }
  console.log('');

  // Test 4: Verifica configurazione chiavi API
  console.log('4️⃣ Verifica configurazione chiavi API:');
  console.log('   - OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅ Configurata' : '❌ Non configurata');
  console.log('   - HUGGINGFACE_API_KEY:', process.env.HUGGINGFACE_API_KEY ? '✅ Configurata' : '❌ Non configurata');
  console.log('');

  if (!process.env.OPENAI_API_KEY || !process.env.HUGGINGFACE_API_KEY) {
    console.log('📝 Per testare completamente il backend, configura le chiavi API nel file .env');
    console.log('   Vedi il file SETUP.md per le istruzioni');
  }

  console.log('🏁 Test configurazione completati!');
  console.log('\n🚀 Per avviare il server: npm run dev:backend');
  console.log('🌐 Per avviare frontend + backend: npm run dev');
}

// Esegui i test se il file viene chiamato direttamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testServerConfiguration().catch(console.error);
}

export { testServerConfiguration }; 