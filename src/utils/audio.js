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

export const speakText = (text) => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'it-IT'  // Imposta la lingua in italiano
    utterance.rate = 1        // Velocità normale
    utterance.pitch = 1       // Tono normale
    window.speechSynthesis.speak(utterance)
  } else {
    console.warn('La sintesi vocale non è supportata in questo browser')
  }
}

export const stopSpeaking = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
} 