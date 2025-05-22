# Boxing Timer App

Un'applicazione React moderna per programmare e gestire sessioni di allenamento al sacco personalizzate. Questa app ti permette di creare e personalizzare i tuoi round di allenamento, impostando durate specifiche per lavoro, riposo e round.

## 🥊 Caratteristiche

- Timer personalizzabile per round di allenamento
- Impostazioni flessibili per:
  - Durata del round
  - Tempo di riposo
  - Numero di round
  - Tempo di preparazione
- Interfaccia utente intuitiva e reattiva
- Suoni di notifica per l'inizio e la fine dei round
- Modalità schermo intero per una migliore esperienza di allenamento

## 🚀 Come Iniziare

### Prerequisiti

- Node.js (versione 14.0.0 o superiore)
- npm o yarn

### Installazione

1. Clona il repository:
```bash
git clone https://github.com/tuousername/boxing-timer.git
cd boxing-timer
```

2. Installa le dipendenze:
```bash
npm install
# oppure
yarn install
```

3. Avvia l'applicazione in modalità sviluppo:
```bash
npm run dev
# oppure
yarn dev
```

## 🛠️ Come Fare Fork

1. Vai alla pagina del repository su GitHub
2. Clicca sul pulsante "Fork" in alto a destra
3. Clona il tuo fork:
```bash
git clone https://github.com/tuousername/boxing-timer.git
```
4. Aggiungi il repository originale come upstream:
```bash
git remote add upstream https://github.com/original-owner/boxing-timer.git
```

## 💻 Esempio di Utilizzo

```jsx
// Esempio di configurazione di un allenamento
const workoutConfig = {
  roundDuration: 180, // 3 minuti
  restDuration: 60,   // 1 minuto
  numberOfRounds: 12,
  preparationTime: 10 // 10 secondi
};

// Avvia l'allenamento
startWorkout(workoutConfig);
```

## 🤝 Contribuire

Le contribuzioni sono benvenute! Per contribuire:

1. Fai fork del progetto
2. Crea un branch per la tua feature (`git checkout -b feature/AmazingFeature`)
3. Committa le tue modifiche (`git commit -m 'Aggiungi qualche AmazingFeature'`)
4. Pusha al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📝 Licenza

Questo progetto è distribuito con licenza MIT. Vedi il file `LICENSE` per maggiori informazioni.

## 📧 Contatti

Per domande o suggerimenti, non esitare ad aprire una issue o una pull request.

### 👨‍💻 Sviluppatore

- **Gianpiero Ferraro** - [@foferys](https://github.com/foferys)
- 💻 Appassionato di Tecnologia e Programmazione
- 🌐 [LinkedIn](https://www.linkedin.com/in/gianpiero-ferraro/)
- 📸 [Instagram](https://www.instagram.com/gianpieroferraro.ph/?hl=it)

---

Sviluppato da [@foferys](https://github.com/foferys) per gli appassionati di boxe.

