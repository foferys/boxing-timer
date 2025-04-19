import { useState, useEffect, useCallback, useRef } from 'react'
import { playSound, speakText, stopSpeaking } from '../utils/audio'

const Timer = ({ round, onRoundComplete, onTerminate }) => {
  const [timeLeft, setTimeLeft] = useState(round.durata)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isRoundComplete, setIsRoundComplete] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const roundRef = useRef(round)
  const audioRef = useRef(null)
  const timerContainerRef = useRef(null)

  // Rileva se il dispositivo è mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Inizializza l'audio
  useEffect(() => {
    audioRef.current = new Audio('/sounds/bell.mp3')
    audioRef.current.load()
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  // Effetto per riavviare il timer quando cambia il round
  useEffect(() => {
    if (round !== roundRef.current) {
      roundRef.current = round
      setTimeLeft(round.durata)
      setIsRunning(true)
      setIsPaused(false)
      setIsRoundComplete(false)
      speakText(round.titolo)  // Annuncia il titolo del round
    }
  }, [round])

  // Effetto per gestire il passaggio al round successivo dopo il ritardo
  useEffect(() => {
    let timeout
    if (isRoundComplete) {
      timeout = setTimeout(() => {
        setIsRoundComplete(false)
        onRoundComplete()
      }, 3000) // 3 secondi di ritardo
    }
    return () => clearTimeout(timeout)
  }, [isRoundComplete, onRoundComplete])

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const startTimer = useCallback(() => {
    setIsRunning(true)
    setIsPaused(false)
    speakText(round.titolo)
  }, [round.titolo])

  const pauseTimer = useCallback(() => {
    setIsPaused(true)
    stopSpeaking()
  }, [])

  const stopTimer = useCallback(() => {
    setIsRunning(false)
    setIsPaused(false)
    setTimeLeft(round.durata)
    setIsRoundComplete(false)
    stopSpeaking()
  }, [round.durata])

  const terminateWorkout = useCallback(() => {
    stopTimer()
    onTerminate()
  }, [stopTimer, onTerminate])

  // Funzione per riprodurre il suono
  const playBellSound = useCallback(() => {
    console.log('Riproduzione suono campanella')
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play()
        .then(() => console.log('Suono campanella riprodotto con successo'))
        .catch(error => console.error('Errore nella riproduzione del suono campanella:', error))
    } else {
      console.error('Audio non inizializzato')
      // Fallback alla funzione playSound
      playSound('bell.mp3')
    }
  }, [])

  // Gestione fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      if (timerContainerRef.current) {
        timerContainerRef.current.requestFullscreen().catch(err => {
          console.error(`Errore nell'attivazione della modalità fullscreen: ${err.message}`)
        })
        setIsFullscreen(true)
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
        setIsFullscreen(false)
      }
    }
  }, [])

  // Ascolta i cambiamenti dello stato fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  useEffect(() => {
    let interval
    if (isRunning && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            playBellSound()
            setIsRoundComplete(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning, isPaused, timeLeft, playBellSound])

  return (
    <div className="timer-container" ref={timerContainerRef}>
      <div className="timer-display">
        <span className="timer-time">{formatTime(timeLeft)}</span>
        <span className="timer-round">{round.titolo}</span>
        {isRoundComplete && <div className="round-complete-message">Round completato!</div>}
      </div>
      
      <div className="timer-controls">
        <button 
          className="btn-start" 
          onClick={startTimer}
          disabled={isRunning && !isPaused}
        >
          {isPaused ? 'Riprendi' : 'Start'}
        </button>
        <button 
          className="btn-pause" 
          onClick={pauseTimer}
          disabled={!isRunning || isPaused}
        >
          Pausa
        </button>
        <button 
          className="btn-stop" 
          onClick={stopTimer}
          disabled={!isRunning && !isPaused}
        >
          Stop
        </button>
        <button 
          className="btn-terminate" 
          onClick={terminateWorkout}
        >
          Termina
        </button>
        {!isMobile && (
          <button 
            className="btn-fullscreen" 
            onClick={toggleFullscreen}
          >
            {isFullscreen ? 'Esci Fullscreen' : 'Fullscreen'}
          </button>
        )}
      </div>
    </div>
  )
}

export default Timer 