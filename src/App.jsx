import { useState, useEffect } from 'react'
import './App.css'
import Timer from './components/Timer'
import NewWorkoutModal from './components/NewWorkoutModal'
import EmotionalDiaryModal from './components/EmotionalDiaryModal'
import useLocalStorage from './hooks/useLocalStorage'
import { useBackendConnection } from './hooks/useBackendConnection'

function App() {
  const [allenamenti, setAllenamenti] = useLocalStorage('allenamenti', [])
  const [modalAperto, setModalAperto] = useState(false)
  const [allenamentoAttivo, setAllenamentoAttivo] = useState(null)
  const [roundAttivo, setRoundAttivo] = useState(0)
  const [allenamentoDaModificare, setAllenamentoDaModificare] = useState(null)
  const [erroreImportazione, setErroreImportazione] = useState(null)
  const [mostraDiarioEmozionale, setMostraDiarioEmozionale] = useState(false)
  // Stato per gestire quale menu è aperto (null = nessun menu aperto, index = indice del menu aperto)
  const [menuAperto, setMenuAperto] = useState(null)

  // Hook per la connessione al backend
  const { isConnected, isLoading: backendLoading, error: backendError, retryConnection } = useBackendConnection()

  // Effetto per chiudere il menu quando si clicca fuori
  // Questo effetto aggiunge un listener globale per il click del mouse
  // e chiude il menu se il click avviene fuori dal contenitore del menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuAperto !== null && !event.target.closest('.workout-menu-container')) {
        setMenuAperto(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuAperto])

  const handleSaveAllenamento = (nuovoAllenamento, allenamentoDaModificare = null) => {
    if (allenamentoDaModificare) {
      // Modifica di un allenamento esistente
      setAllenamenti(allenamenti.map(a => 
        a === allenamentoDaModificare ? nuovoAllenamento : a
      ))
    } else {
      // Creazione di un nuovo allenamento
      setAllenamenti([...allenamenti, nuovoAllenamento])
    }
  }

  const handleStartAllenamento = (allenamento) => {
    setAllenamentoAttivo(allenamento)
    setRoundAttivo(0)
  }

  const handleRoundComplete = () => {
    if (roundAttivo < allenamentoAttivo.rounds.length - 1) {
      setRoundAttivo(roundAttivo + 1)
    } else {
      // Allenamento completato naturalmente
      setAllenamentoAttivo(null)
      setRoundAttivo(0)
      setMostraDiarioEmozionale(true)
    }
  }

  const handleTerminateWorkout = () => {
    // Termina l'allenamento senza mostrare congratulazioni
    setAllenamentoAttivo(null)
    setRoundAttivo(0)
  }

  const handleEditAllenamento = (allenamento) => {
    setAllenamentoDaModificare(allenamento)
    setModalAperto(true)
  }

  const handleDeleteAllenamento = (allenamento) => {
    if (window.confirm('Sei sicuro di voler eliminare questo allenamento?')) {
      setAllenamenti(allenamenti.filter(a => a !== allenamento))
    }
  }

  const handleCloseModal = () => {
    setModalAperto(false)
    setAllenamentoDaModificare(null)
  }

  // Funzione per esportare i dati
  const handleExportData = () => {
    const dataStr = JSON.stringify(allenamenti, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = 'allenamenti_boxing.json'
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  // Funzione per importare i dati
  const handleImportData = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result)
          
          // Validazione base dei dati importati
          if (!Array.isArray(importedData)) {
            throw new Error('Il file importato non contiene un array valido di allenamenti')
          }
          
          // Verifica che ogni elemento abbia la struttura corretta
          const isValid = importedData.every(item => 
            item && 
            typeof item === 'object' && 
            'nome' in item && 
            'rounds' in item && 
            Array.isArray(item.rounds)
          )
          
          if (!isValid) {
            throw new Error('La struttura dei dati importati non è valida')
          }
          
          // Aggiungi gli allenamenti importati a quelli esistenti
          setAllenamenti(prevAllenamenti => [...prevAllenamenti, ...importedData])
          setErroreImportazione(null)
        } catch (error) {
          console.error('Errore durante l\'importazione:', error)
          setErroreImportazione('Errore durante l\'importazione: ' + error.message)
        }
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="app-container">
      <header>
        <h1>Boxing Timer</h1>
        <div className="backend-status">
          {backendLoading ? (
            <span className="status-indicator loading">🔄 Connessione...</span>
          ) : isConnected ? (
            <span className="status-indicator connected">✅ Backend connesso</span>
          ) : (
            <div className="status-indicator error">
              <span>❌ Backend non disponibile</span>
              <button onClick={retryConnection} className="retry-btn">
                Riprova
              </button>
            </div>
          )}
        </div>
      </header>
      
      <main className="main-content">
        {allenamentoAttivo ? (
          <Timer 
            round={allenamentoAttivo.rounds[roundAttivo]}
            onRoundComplete={handleRoundComplete}
            onTerminate={handleTerminateWorkout}
          />
        ) : (
          <div className="workouts-container">
            <h2>I tuoi allenamenti</h2>
            
            {erroreImportazione && (
              <div className="error-message">
                {erroreImportazione}
              </div>
            )}
            
            {allenamenti.length === 0 ? (
              <div className="empty-state">
                <p className="no-workouts">Nessun allenamento creato</p>
                <button 
                  className="btn-new-workout"
                  onClick={() => setModalAperto(true)}
                >
                  Crea il tuo primo allenamento
                </button>
              </div>
            ) : (
              <>
                <div className="workout-actions-top">
                  <button 
                    className="btn-new-workout"
                    onClick={() => setModalAperto(true)}
                  >
                    Nuovo Allenamento
                  </button>
                  
                  <div className="import-export-buttons">
                    <button 
                      className="btn-export"
                      onClick={handleExportData}
                    >
                      Esporta All.
                    </button>
                    <label className="btn-import">
                      Importa All.
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportData}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                </div>
                
                <div className="workouts-list">
                  {allenamenti.map((allenamento, index) => (
                    <div key={index} className="workout-card">
                      <div className="workout-card-header">
                        <h3>{allenamento.nome}</h3>
                        <div className="workout-menu-container">
                          <button 
                            type="button" 
                            className="btn-menu-toggle"
                            onClick={() => setMenuAperto(menuAperto === index ? null : index)}
                            aria-label="Menu opzioni"
                          >
                            <span className="dots">⋮</span>
                          </button>
                          {menuAperto === index && (
                            <div className="workout-menu">
                              <button 
                                className="menu-item"
                                onClick={() => handleEditAllenamento(allenamento)}
                              >
                                <span className="menu-icon">✏️</span> Modifica
                              </button>
                              <button 
                                className="menu-item menu-item-danger"
                                onClick={() => handleDeleteAllenamento(allenamento)}
                              >
                                <span className="menu-icon">🗑️</span> Elimina
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <p>{allenamento.rounds.length} rounds</p>
                      <button 
                        className="btn-start"
                        onClick={() => handleStartAllenamento(allenamento)}
                      >
                        Inizia
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {modalAperto && (
        <NewWorkoutModal
          onClose={handleCloseModal}
          onSave={handleSaveAllenamento}
          allenamentoDaModificare={allenamentoDaModificare}
        />
      )}

      {mostraDiarioEmozionale && (
        <EmotionalDiaryModal onClose={() => setMostraDiarioEmozionale(false)} />
      )}
    </div>
  )
}

export default App
