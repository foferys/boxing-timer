import React from 'react'

const CongratulationModal = ({ onClose }) => {
  const frasiMotivanti = [
    "Hai completato un allenamento incredibile! Continua così! 💪",
    "Fantastico lavoro! Sei sempre più forte! 🏆",
    "Allenamento completato con successo! Sei un campione! 🥊",
    "Grande performance! Il tuo impegno sta dando i suoi frutti! 🌟",
    "Complimenti! Ogni allenamento ti rende più forte! 💫"
  ]

  const fraseCasuale = frasiMotivanti[Math.floor(Math.random() * frasiMotivanti.length)]

  return (
    <div className="modal-overlay">
      <div className="modal-content congratulation-modal">
        <h2>🎉 Complimenti! 🎉</h2>
        <p className="motivation-text">{fraseCasuale}</p>
        <button className="btn-home" onClick={onClose}>
          Torna alla Home
        </button>
      </div>
    </div>
  )
}

export default CongratulationModal 