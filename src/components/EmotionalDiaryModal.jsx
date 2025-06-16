import { useState } from 'react'

const EmotionalDiaryModal = ({ onClose }) => {
  const [testo, setTesto] = useState('')
  const [sentiment, setSentiment] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const analizzaSentiment = async () => {
    if (!testo.trim()) {
      setError('Per favore, scrivi come ti senti')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english",
        {
          headers: {
            "Authorization": "Bearer hf_xxx", // TODO: Sostituire con la tua API key
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({ inputs: testo }),
        }
      )

      if (!response.ok) {
        throw new Error('Errore nell\'analisi del sentiment')
      }

      const result = await response.json()
      const sentimentLabel = result[0][0].label.toLowerCase()
      setSentiment(sentimentLabel)

      // Feedback personalizzato basato sul sentiment
      let feedback = ''
      switch (sentimentLabel) {
        case 'positive':
          feedback = 'Fantastico! Continua così! Il tuo allenamento ti sta facendo sentire bene! 💪'
          break
        case 'negative':
          feedback = 'Non preoccuparti, è normale avere giorni difficili. Ricorda che ogni allenamento ti rende più forte! 🌟'
          break
        default:
          feedback = 'Hai completato l\'allenamento! Continua a monitorare come ti senti per migliorare sempre di più! 🎯'
      }
      setFeedback(feedback)
    } catch (err) {
      setError('Errore nell\'analisi del sentiment. Riprova più tardi.')
      console.error('Errore:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const [feedback, setFeedback] = useState('')

  return (
    <div className="modal-overlay">
      <div className="modal-content emotional-diary-modal">
        <h2>📝 Diario Emozionale</h2>
        <p className="diary-intro">Come ti sei sentito durante questo allenamento?</p>
        
        <div className="diary-form">
          <textarea
            value={testo}
            onChange={(e) => setTesto(e.target.value)}
            placeholder="Scrivi qui le tue sensazioni..."
            className="diary-textarea"
            rows="4"
          />
          
          {error && <p className="error-message">{error}</p>}
          
          <button 
            className="btn-analyze"
            onClick={analizzaSentiment}
            disabled={isLoading}
          >
            {isLoading ? 'Analisi in corso...' : 'Analizza'}
          </button>
        </div>

        {sentiment && (
          <div className="sentiment-result">
            <div className={`sentiment-badge ${sentiment}`}>
              {sentiment === 'positive' ? '😊 Positivo' : 
               sentiment === 'negative' ? '😔 Negativo' : 
               '😐 Neutrale'}
            </div>
            <p className="feedback-text">{feedback}</p>
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