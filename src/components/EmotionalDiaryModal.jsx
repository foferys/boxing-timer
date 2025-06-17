import { useState } from 'react'

const EmotionalDiaryModal = ({ onClose }) => {
  const [testo, setTesto] = useState('')
  const [sentiment, setSentiment] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [feedback, setFeedback] = useState('')

  const analizzaSentiment = async () => {
    if (!testo.trim()) {
      setError('Per favore, scrivi come ti senti')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Verifica che la chiave API di Hugging Face sia configurata
      const huggingfaceApiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;
      if (!huggingfaceApiKey) {
        throw new Error('Chiave API Hugging Face non configurata')
      }

      // Prima analizziamo il sentiment
      const sentimentResponse = await fetch(
        "https://api-inference.huggingface.co/models/distilbert/distilbert-base-uncased-finetuned-sst-2-english",
        {
          headers: {
            "Authorization": `Bearer ${huggingfaceApiKey}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({ inputs: testo }),
        }
      )

      const sentimentResult = await sentimentResponse.json()
      console.log('Sentiment result:', sentimentResult)

      if (!sentimentResponse.ok) {
        throw new Error('Errore nell\'analisi del sentiment')
      }

      const sentimentLabel = sentimentResult[0][0].label.toLowerCase()
      setSentiment(sentimentLabel)

      // Ora generiamo una risposta motivazionale personalizzata usando OpenAI
      const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY
      
      console.log('OpenAI API Key presente:', !!openaiApiKey)
      console.log('OpenAI API Key (primi 10 caratteri):', openaiApiKey?.substring(0, 10))
      
      if (!openaiApiKey) {
        throw new Error('Chiave API OpenAI non configurata')
      }

      const prompt = `Sei un coach motivazionale esperto di boxe. L'utente ha appena completato un allenamento di boxe e ha scritto: "${testo}". 
      
      Il sentiment dell'utente è: ${sentimentLabel === 'positive' ? 'positivo' : sentimentLabel === 'negative' ? 'negativo' : 'neutrale'}.

      Genera una risposta motivazionale personalizzata e incoraggiante in italiano (massimo 2-3 frasi) che:
      - Riconosca i sentimenti dell'utente
      - Li motivi a continuare con l'allenamento
      - Sia specifica per il boxe
      - Usi un tono amichevole e supportivo
      - Includa un emoji appropriata alla fine

      Risposta:`

      const feedbackResponse = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          headers: {
            "Authorization": `Bearer ${openaiApiKey}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({
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
          }),
        }
      )

      const feedbackResult = await feedbackResponse.json()
      console.log('OpenAI feedback result:', feedbackResult)
      console.log('OpenAI response status:', feedbackResponse.status)
      console.log('OpenAI response ok:', feedbackResponse.ok)

      if (!feedbackResponse.ok) {
        console.error('Errore OpenAI completo:', feedbackResult)
        throw new Error(`Errore OpenAI: ${feedbackResult.error?.message || 'Errore sconosciuto'}`)
      }

      // Estrai il testo generato dalla risposta di OpenAI
      const generatedText = feedbackResult.choices?.[0]?.message?.content || ''
      setFeedback(generatedText.trim() || 'Ottimo lavoro! Continua così! 💪')

    } catch (err) {
      console.error('Errore:', err)
      
      // In caso di errore, imposta un feedback di fallback basato sul sentiment
      let fallbackFeedback = ''
      if (sentiment) {
        switch (sentiment) {
          case 'positive':
            fallbackFeedback = 'Fantastico! Continua così! Il tuo allenamento ti sta facendo sentire bene! 💪'
            break
          case 'negative':
            fallbackFeedback = 'Non preoccuparti, è normale avere giorni difficili. Ricorda che ogni allenamento ti rende più forte! 🌟'
            break
          default:
            fallbackFeedback = 'Hai completato l\'allenamento! Continua a monitorare come ti senti per migliorare sempre di più! 🎯'
        }
      } else {
        fallbackFeedback = 'Hai completato l\'allenamento! Ogni sessione ti rende più forte! 💪'
      }
      
      setFeedback(fallbackFeedback)
      setError('Errore nell\'analisi. Riprova più tardi.')
    } finally {
      setIsLoading(false)
    }
  }

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