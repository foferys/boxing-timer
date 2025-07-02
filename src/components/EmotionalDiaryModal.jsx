import { useState } from 'react'
import { apiService } from '../services/apiService.js'

const EmotionalDiaryModal = ({ onClose }) => {
  // 1. INIZIALIZZAZIONE DEGLI STATI - Gestione dello stato del componente
  const [testo, setTesto] = useState('')                    // Testo inserito dall'utente
  const [sentiment, setSentiment] = useState(null)          // Risultato sentiment dal backend
  const [isLoading, setIsLoading] = useState(false)         // Stato di caricamento
  const [error, setError] = useState(null)                  // Eventuali errori
  const [feedback, setFeedback] = useState('')              // Feedback motivazionale
  const [isFallbackFeedback, setIsFallbackFeedback] = useState(false) // Flag per feedback di fallback

  // 2. FUNZIONE PRINCIPALE - Gestisce l'intero flusso di analisi
  const analizzaSentiment = async () => {
    // 3. VALIDAZIONE INPUT - Controlla che l'utente abbia inserito del testo
    if (!testo.trim()) {
      setError('Per favore, scrivi come ti senti')
      return
    }

    // 4. PREPARAZIONE UI - Resetta stati e mostra loading
    setIsLoading(true)
    setError(null)
    setSentiment(null)
    setFeedback('')
    setIsFallbackFeedback(false)

    try {
      console.log('🔍 Avvio analisi completa del testo...')
      
      // 5. CHIAMATA AL BACKEND - Invia richiesta tramite apiService
      const result = await apiService.analyzeComplete(testo)
      
      console.log('📊 Risultato analisi:', result)
      
      // 6. ELABORAZIONE RISPOSTA - Estrae sentiment e feedback dal risultato
      const { sentiment: sentimentResult, feedback: feedbackResult } = result
      
      // 7. AGGIORNAMENTO UI - Mostra i risultati all'utente
      setSentiment(sentimentResult)
      setFeedback(feedbackResult)
      setIsFallbackFeedback(false)

    } catch (err) {
      // 8. GESTIONE ERRORI - Gestisce errori di rete o del backend
      console.error('❌ Errore nell\'analisi frontend:', err)

      let errorMessage = 'Errore nell\'analisi. Riprova più tardi.'
      let motivationalFeedback = 'Hai completato l\'allenamento! Ogni sessione ti rende più forte! 💪'

      // 9. ANALISI ERRORI BACKEND - Gestisce errori specifici del backend
      if (err.backendResponse) {
        const backendErrorData = err.backendResponse;
        if (backendErrorData.error) {
          errorMessage = backendErrorData.error;
        }
        if (backendErrorData.feedback) {
          motivationalFeedback = backendErrorData.feedback;
          setIsFallbackFeedback(true);
        }
        if (backendErrorData.sentiment) {
          setSentiment(backendErrorData.sentiment);
        }
      } else if (err.message) {
        errorMessage = `Errore: ${err.message}`;
      }
      
      // 10. MOSTRA ERRORI - Aggiorna UI con messaggi di errore
      setError(errorMessage)
      setFeedback(motivationalFeedback)

    } finally {
      // 11. PULIZIA FINALE - Nasconde il loading
      setIsLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content emotional-diary-modal">
        <h2>📝 Diario Emozionale</h2>
        <p className="diary-intro">Come ti sei sentito durante questo allenamento?</p>
        
        <div className="diary-form">
          {/* 12. INPUT UTENTE - Campo di testo per inserire le sensazioni */}
          <textarea
            value={testo}
            onChange={(e) => setTesto(e.target.value)}
            placeholder="Scrivi qui le tue sensazioni..."
            className="diary-textarea"
            rows="4"
          />
          
          {/* 13. MOSTRA ERRORI - Visualizza eventuali messaggi di errore */}
          {error && <p className="error-message">{error}</p>}
          
          {/* 14. PULSANTE ANALISI - Avvia il processo di analisi */}
          <button 
            className="btn-analyze"
            onClick={analizzaSentiment}
            disabled={isLoading}
          >
            {isLoading ? 'Analisi in corso...' : 'Analizza'}
          </button>
        </div>

        {/* 15. RISULTATI - Mostra sentiment e feedback se disponibili */}
        {sentiment && feedback && (
          <div className="sentiment-result">
            {/* 16. BADGE SENTIMENT - Mostra il sentiment con emoji appropriata */}
            <div className={`sentiment-badge ${sentiment}`}>
              {sentiment === 'positive' ? '😊 Positivo' : 
               sentiment === 'negative' ? '😔 Negativo' : 
               '😐 Neutrale'}
            </div>
            {/* 17. TESTO FEEDBACK - Mostra il feedback motivazionale */}
            <p className="feedback-text">{feedback}</p>
            {/* 18. NOTA FALLBACK - Avvisa se il feedback è preimpostato */}
            {isFallbackFeedback && (
              <p className="fallback-notice">Nota: il feedback è preimpostato per un limite API raggiunto.</p>
            )}
          </div>
        )}

        <button className="btn-home" onClick={onClose}>
          Torna alla Home
        </button>
      </div>
    </div>
  )
}

export default EmotionalDiaryModal 