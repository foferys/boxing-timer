import { useState } from 'react'
import './App.css'
import Timer from './components/Timer'
import NewWorkoutModal from './components/NewWorkoutModal'
import CongratulationModal from './components/CongratulationModal'
import useLocalStorage from './hooks/useLocalStorage'

function App() {
  const [allenamenti, setAllenamenti] = useLocalStorage('allenamenti', [])
  const [modalAperto, setModalAperto] = useState(false)
  const [allenamentoAttivo, setAllenamentoAttivo] = useState(null)
  const [roundAttivo, setRoundAttivo] = useState(0)
  const [allenamentoDaModificare, setAllenamentoDaModificare] = useState(null)
  const [erroreImportazione, setErroreImportazione] = useState(null)
  const [mostraCongratulazioni, setMostraCongratulazioni] = useState(false)

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
      setMostraCongratulazioni(true)
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
                      <h3>{allenamento.nome}</h3>
                      <p>{allenamento.rounds.length} rounds</p>
                      <div className="workout-actions">
                        <button 
                          className="btn-start"
                          onClick={() => handleStartAllenamento(allenamento)}
                        >
                          Inizia
                        </button>
                        <button 
                          className="btn-edit"
                          onClick={() => handleEditAllenamento(allenamento)}
                        >
                          Modifica
                        </button>
                        <button 
                          className="btn-delete"
                          onClick={() => handleDeleteAllenamento(allenamento)}
                        >
                          Elimina
                        </button>
                      </div>
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

      {mostraCongratulazioni && (
        <CongratulationModal onClose={() => setMostraCongratulazioni(false)} />
      )}
    </div>
  )
}

export default App
