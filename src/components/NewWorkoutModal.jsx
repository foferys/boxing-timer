import { useState, useEffect } from 'react'

const NewWorkoutModal = ({ onClose, onSave, allenamentoDaModificare = null }) => {
  const [nomeAllenamento, setNomeAllenamento] = useState('')
  const [rounds, setRounds] = useState([
    { titolo: '', durata: 60, suono: 'bell.mp3' }
  ])
  const [menuAperto, setMenuAperto] = useState(null) // Indice del round con menu aperto

  // Inizializza i dati se stiamo modificando un allenamento esistente
  useEffect(() => {
    if (allenamentoDaModificare) {
      setNomeAllenamento(allenamentoDaModificare.nome)
      setRounds(allenamentoDaModificare.rounds)
    }
  }, [allenamentoDaModificare])

  const handleAddRound = () => {
    setRounds([...rounds, { titolo: '', durata: 60, suono: 'bell.mp3' }])
  }

  const handleRoundChange = (index, field, value) => {
    const newRounds = [...rounds]
    newRounds[index] = { ...newRounds[index], [field]: value }
    setRounds(newRounds)
  }

  const handleRemoveRound = (index) => {
    setRounds(rounds.filter((_, i) => i !== index))
    setMenuAperto(null) // Chiudi il menu dopo la rimozione
  }

  // Nuova funzione per duplicare un round
  const handleDuplicateRound = (index) => {
    const roundToDuplicate = rounds[index]
    const newRound = { ...roundToDuplicate, titolo: `${roundToDuplicate.titolo} (copia)` }
    
    // Inserisci il nuovo round subito dopo quello duplicato
    const newRounds = [
      ...rounds.slice(0, index + 1),
      newRound,
      ...rounds.slice(index + 1)
    ]
    
    setRounds(newRounds)
    setMenuAperto(null) // Chiudi il menu dopo la duplicazione
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!nomeAllenamento.trim()) {
      alert('Inserisci un nome per l\'allenamento')
      return
    }
    if (rounds.some(round => !round.titolo.trim())) {
      alert('Inserisci un titolo per tutti i round')
      return
    }
    onSave({ nome: nomeAllenamento, rounds }, allenamentoDaModificare)
    onClose()
  }

  // Funzione per aprire/chiudere il menu
  const toggleMenu = (index) => {
    setMenuAperto(menuAperto === index ? null : index)
  }

  // Chiudi il menu quando si clicca fuori
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuAperto !== null && !event.target.closest('.round-menu')) {
        setMenuAperto(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuAperto])

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{allenamentoDaModificare ? 'Modifica Allenamento' : 'Nuovo Allenamento'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nome">Nome Allenamento</label>
            <input
              type="text"
              id="nome"
              value={nomeAllenamento}
              onChange={(e) => setNomeAllenamento(e.target.value)}
              placeholder="Es: Cardio Boxe"
            />
          </div>

          <div className="rounds-container">
            <h3>Rounds</h3>
            {rounds.map((round, index) => (
              <div key={index} className="round-item">
                <div className="round-header">
                  <h4>Round {index + 1}</h4>
                  <div className="round-menu-container">
                    <button 
                      type="button" 
                      className="btn-menu-toggle"
                      onClick={() => toggleMenu(index)}
                      aria-label="Menu opzioni"
                    >
                      <span className="dots">⋮</span>
                    </button>
                    {menuAperto === index && (
                      <div className="round-menu">
                        <button 
                          type="button" 
                          className="menu-item"
                          onClick={() => handleDuplicateRound(index)}
                        >
                          <span className="menu-icon">📋</span> Duplica
                        </button>
                        <button 
                          type="button" 
                          className="menu-item menu-item-danger"
                          onClick={() => handleRemoveRound(index)}
                        >
                          <span className="menu-icon">🗑️</span> Rimuovi
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor={`titolo-${index}`}>Titolo Round</label>
                  <input
                    type="text"
                    id={`titolo-${index}`}
                    value={round.titolo}
                    onChange={(e) => handleRoundChange(index, 'titolo', e.target.value)}
                    placeholder="Es: Jab diretto"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor={`durata-${index}`}>Durata (secondi)</label>
                  <input
                    type="number"
                    id={`durata-${index}`}
                    value={round.durata}
                    onChange={(e) => handleRoundChange(index, 'durata', parseInt(e.target.value))}
                    min="10"
                    max="1800"
                  />
                </div>
              </div>
            ))}
            <button 
              type="button" 
              className="btn-add-round"
              onClick={handleAddRound}
            >
              Aggiungi Round
            </button>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Annulla
            </button>
            <button type="submit" className="btn-save">
              {allenamentoDaModificare ? 'Aggiorna' : 'Salva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NewWorkoutModal 