export const playSound = (soundFile) => {
  console.log(`Tentativo di riprodurre il suono: ${soundFile}`)
  
  // Prova con diversi percorsi per assicurarsi che funzioni
  const audioPaths = [
    `/sounds/${soundFile}`,
    `sounds/${soundFile}`,
    `./sounds/${soundFile}`,
    `${soundFile}`
  ]
  
  console.log(`Percorsi audio da provare:`, audioPaths)
  
  // Prova il primo percorso
  const audioPath = audioPaths[0]
  console.log(`Tentativo con percorso: ${audioPath}`)
  
  const audio = new Audio(audioPath)
  
  // Aggiungiamo eventi per il debug
  audio.addEventListener('canplaythrough', () => {
    console.log('Audio pronto per la riproduzione')
  })
  
  audio.addEventListener('error', (e) => {
    console.error('Errore nel caricamento dell\'audio:', e)
    
    // Se il primo percorso fallisce, prova con gli altri
    if (audioPaths.length > 1) {
      const nextPath = audioPaths[1]
      console.log(`Tentativo con percorso alternativo: ${nextPath}`)
      audioPaths.shift() // Rimuovi il percorso fallito
      
      const newAudio = new Audio(nextPath)
      newAudio.play()
        .then(() => {
          console.log('Audio riprodotto con successo con percorso alternativo')
        })
        .catch(error => {
          console.error('Errore nella riproduzione del suono con percorso alternativo:', error)
        })
    }
  })
  
  audio.play()
    .then(() => {
      console.log('Audio riprodotto con successo')
    })
    .catch(error => {
      console.error('Errore nella riproduzione del suono:', error)
    })
}

// Configurazione per ElevenLabs API
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY || ''
const ELEVENLABS_VOICE_ID = import.meta.env.VITE_ELEVENLABS_VOICE_ID || 'kqVT88a5QfII1HNAEPTJ' // ID di una voce italiana

// Debug delle variabili d'ambiente
console.log('🔍 Debug variabili d\'ambiente:')
console.log('ELEVENLABS_API_KEY presente:', !!ELEVENLABS_API_KEY)
console.log('ELEVENLABS_API_KEY lunghezza:', ELEVENLABS_API_KEY.length)
console.log('ELEVENLABS_VOICE_ID:', ELEVENLABS_VOICE_ID)
console.log('Tutte le variabili VITE_*:', Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')))

// Funzione per ottenere una voce umana usando ElevenLabs
const speakWithElevenLabs = async (text) => {
  console.log('🎤 Tentativo ElevenLabs per:', text)
  console.log('API Key configurata:', !!ELEVENLABS_API_KEY)
  
  if (!ELEVENLABS_API_KEY) {
    console.warn('❌ API key ElevenLabs non configurata, uso fallback')
    return false
  }

  try {
    console.log('📡 Invio richiesta a ElevenLabs...')
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_multilingual_v2', // Modello multilingue per l'italiano
        voice_settings: {
          stability: 0.5,        // Stabilità della voce (0-1)
          similarity_boost: 0.75, // Similitudine con la voce originale (0-1)
          style: 0.0,            // Stile della voce (0-1)
          use_speaker_boost: true // Migliora la chiarezza
        }
      })
    })

    console.log('📥 Risposta ElevenLabs status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Errore API ElevenLabs:', response.status, errorText)
      throw new Error(`Errore API ElevenLabs: ${response.status} - ${errorText}`)
    }

    const audioBlob = await response.blob()
    console.log('🎵 Audio blob ricevuto, dimensione:', audioBlob.size)
    
    const audioUrl = URL.createObjectURL(audioBlob)
    const audio = new Audio(audioUrl)
    
    console.log('▶️ Avvio riproduzione audio...')
    await audio.play()
    console.log('✅ Audio riprodotto con successo')
    
    // Pulisci l'URL dopo la riproduzione
    audio.addEventListener('ended', () => {
      URL.revokeObjectURL(audioUrl)
      console.log('🧹 URL audio pulito')
    })
    
    return true
  } catch (error) {
    console.error('❌ Errore con ElevenLabs API:', error)
    return false
  }
}

// Funzione per ottenere una voce umana usando OpenAI TTS (alternativa)
const speakWithOpenAI = async (text) => {
  const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || ''
  
  if (!OPENAI_API_KEY) {
    console.warn('API key OpenAI non configurata, uso fallback')
    return false
  }

  try {
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: 'alloy', // Opzioni: alloy, echo, fable, onyx, nova, shimmer
        response_format: 'mp3',
        speed: 1.0
      })
    })

    if (!response.ok) {
      throw new Error(`Errore API OpenAI: ${response.status}`)
    }

    const audioBlob = await response.blob()
    const audioUrl = URL.createObjectURL(audioBlob)
    const audio = new Audio(audioUrl)
    
    await audio.play()
    
    // Pulisci l'URL dopo la riproduzione
    audio.addEventListener('ended', () => {
      URL.revokeObjectURL(audioUrl)
    })
    
    return true
  } catch (error) {
    console.error('Errore con OpenAI TTS API:', error)
    return false
  }
}

export const speakText = async (text) => {
  console.log('🎯 === INIZIO SINTESI VOCALE ===')
  console.log('📝 Testo da pronunciare:', text)
  
  // Prova prima ElevenLabs (migliore qualità)
  console.log('🔄 Tentativo 1: ElevenLabs...')
  const elevenLabsSuccess = await speakWithElevenLabs(text)
  if (elevenLabsSuccess) {
    console.log('✅ Voce riprodotta con ElevenLabs')
    return
  }
  
  // Fallback a OpenAI TTS
  console.log('🔄 Tentativo 2: OpenAI TTS...')
  const openAISuccess = await speakWithOpenAI(text)
  if (openAISuccess) {
    console.log('✅ Voce riprodotta con OpenAI TTS')
    return
  }
  
  // Fallback finale alla sintesi vocale del browser
  console.log('🔄 Tentativo 3: Sintesi vocale browser...')
  if ('speechSynthesis' in window) {
    console.log('🌐 Uso sintesi vocale del browser come fallback')
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'it-IT'  // Imposta la lingua in italiano
    utterance.rate = 0.9      // Velocità leggermente più lenta per maggiore chiarezza
    utterance.pitch = 1       // Tono normale
    utterance.volume = 1      // Volume massimo
    
    // Prova a selezionare una voce italiana se disponibile
    const voices = window.speechSynthesis.getVoices()
    console.log('🎤 Voci disponibili nel browser:', voices.length)
    const italianVoice = voices.find(voice => 
      voice.lang.includes('it') || voice.lang.includes('IT')
    )
    if (italianVoice) {
      utterance.voice = italianVoice
      console.log('🇮🇹 Voce italiana selezionata:', italianVoice.name)
    } else {
      console.log('⚠️ Nessuna voce italiana trovata, uso voce di default')
    }
    
    window.speechSynthesis.speak(utterance)
    console.log('✅ Sintesi vocale browser avviata')
  } else {
    console.warn('❌ La sintesi vocale non è supportata in questo browser')
  }
  
  console.log('🏁 === FINE SINTESI VOCALE ===')
}

export const stopSpeaking = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
} 