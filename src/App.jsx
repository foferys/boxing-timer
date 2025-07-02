import { useState, useEffect } from 'react'
import './App.css'
import Timer from './components/Timer'
import NewWorkoutModal from './components/NewWorkoutModal'
import EmotionalDiaryModal from './components/EmotionalDiaryModal'
import useLocalStorage from './hooks/useLocalStorage'
import { useBackendConnection } from './hooks/useBackendConnection'
// Import della libreria jsPDF per la generazione di PDF lato client
// jsPDF è una libreria JavaScript che permette di creare PDF direttamente nel browser
// senza bisogno di chiamate al server, rendendo l'esportazione veloce e offline
import jsPDF from 'jspdf'

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

  // Funzione per esportare un singolo allenamento in PDF
  // Questa funzione utilizza jsPDF per creare un documento PDF formattato
  // con tutte le informazioni dell'allenamento selezionato
  const handleExportWorkoutPDF = (allenamento) => {
    // Crea una nuova istanza di jsPDF per generare il documento
    // jsPDF crea un PDF in formato A4 (210x297mm) per default
    const doc = new jsPDF()
    
    // Configurazione dei colori del tema per mantenere coerenza visiva
    // I colori sono definiti come array RGB [R, G, B] per jsPDF
    const titleColor = [245, 177, 19] // Colore arancione del tema (#f5b113)
    const subtitleColor = [51, 51, 51] // Grigio scuro per i sottotitoli
    const textColor = [102, 102, 102] // Grigio medio per il testo normale
    
    // SEZIONE 1: HEADER DEL PDF
    // Titolo principale dell'applicazione
    doc.setFontSize(24) // Dimensione font grande per il titolo
    doc.setTextColor(...titleColor) // Applica il colore arancione del tema
    doc.text('Boxing Timer - Allenamento', 20, 30) // Posizione (x=20, y=30)
    
    // Nome dell'allenamento specifico
    doc.setFontSize(18) // Dimensione font media per il nome
    doc.setTextColor(...subtitleColor) // Colore grigio scuro
    doc.text(allenamento.nome, 20, 50) // Posizione sotto il titolo
    
    // SEZIONE 2: INFORMAZIONI GENERALI DELL'ALLENAMENTO
    doc.setFontSize(12) // Dimensione font normale per le informazioni
    doc.setTextColor(...textColor) // Colore grigio medio
    doc.text(`Numero totale di rounds: ${allenamento.rounds.length}`, 20, 70)
    
    // Calcola la durata totale dell'allenamento sommando tutti i rounds
    // reduce() itera su ogni round e somma le durate
    const durataTotale = allenamento.rounds.reduce((totale, round) => totale + round.durata, 0)
    // Converte i secondi totali in formato MM:SS per una migliore leggibilità
    const minutiTotali = Math.floor(durataTotale / 60)
    const secondiTotali = durataTotale % 60
    // padStart(2, '0') assicura che i secondi abbiano sempre 2 cifre (es: 05 invece di 5)
    doc.text(`Durata totale: ${minutiTotali}:${secondiTotali.toString().padStart(2, '0')}`, 20, 80)
    
    // Data di creazione del PDF in formato italiano
    // toLocaleDateString() formatta la data secondo le convenzioni italiane
    const dataCreazione = new Date().toLocaleDateString('it-IT', {
      year: 'numeric', // Anno numerico (es: 2024)
      month: 'long',   // Mese per esteso (es: gennaio)
      day: 'numeric'   // Giorno numerico
    })
    doc.text(`Generato il: ${dataCreazione}`, 20, 90)
    
    // SEZIONE 3: DETTAGLIO DEI ROUNDS
    // Titolo della sezione rounds
    doc.setFontSize(16) // Dimensione font media per il titolo sezione
    doc.setTextColor(...titleColor) // Colore arancione per il titolo
    doc.text('Dettaglio Rounds', 20, 110)
    
    // Variabile per tracciare la posizione verticale nel PDF
    // Inizia a 130 per lasciare spazio al titolo della sezione
    let yPosition = 130
    
    // Itera su ogni round dell'allenamento
    allenamento.rounds.forEach((round, index) => {
      // CONTROLLO PAGINA: Se siamo troppo in basso nella pagina, crea una nuova pagina
      // jsPDF ha coordinate Y che aumentano verso il basso, 250 è circa il limite
      if (yPosition > 250) {
        doc.addPage() // Aggiunge una nuova pagina al PDF
        yPosition = 30 // Riporta la posizione Y all'inizio della nuova pagina
      }
      
      // Titolo del round con numero progressivo
      doc.setFontSize(14) // Dimensione font media per i titoli dei round
      doc.setTextColor(...subtitleColor) // Colore grigio scuro
      doc.text(`Round ${index + 1}: ${round.titolo}`, 20, yPosition)
      
      // Durata del singolo round
      doc.setFontSize(12) // Dimensione font normale
      doc.setTextColor(...textColor) // Colore grigio medio
      // Converte la durata in secondi in formato MM:SS
      const minuti = Math.floor(round.durata / 60)
      const secondi = round.durata % 60
      // Posizione indentata (x=30) per mostrare la gerarchia
      doc.text(`Durata: ${minuti}:${secondi.toString().padStart(2, '0')}`, 30, yPosition + 10)
      
      // Incrementa la posizione Y per il prossimo round
      // 25 pixel di spazio tra ogni round per una buona leggibilità
      yPosition += 25
    })
    
    // SEZIONE 4: FOOTER DEL PDF
    // Informazioni di copyright/crediti in fondo al PDF
    doc.setFontSize(10) // Dimensione font piccola per il footer
    doc.setTextColor(...textColor) // Colore grigio medio
    doc.text('Boxing Timer - Generato automaticamente', 20, 280)
    
    // SALVATAGGIO DEL PDF
    // Crea un nome file sicuro rimuovendo caratteri speciali dal nome dell'allenamento
    // replace(/[^a-zA-Z0-9]/g, '_') sostituisce tutti i caratteri non alfanumerici con underscore
    const fileName = `${allenamento.nome.replace(/[^a-zA-Z0-9]/g, '_')}_allenamento.pdf`
    // doc.save() scarica automaticamente il PDF nel browser dell'utente
    doc.save(fileName)
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
                    Crea Allenamento
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
                              {/* Pulsante per esportare l'allenamento in formato PDF
                                  Utilizza jsPDF per generare un documento formattato con tutti i dettagli */}
                              <button 
                                className="menu-item menu-item-pdf"
                                onClick={() => handleExportWorkoutPDF(allenamento)}
                              >
                                <span className="menu-icon">📄</span> Esporta PDF
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
