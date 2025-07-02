// Configurazione del backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

/**
 * Classe per gestire le chiamate API al backend
 */
class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Metodo generico per le chiamate HTTP
   */
  async request(endpoint, options = {}) {
    // 19. COSTRUZIONE URL - Crea l'URL completo per la richiesta
    const url = `${this.baseURL}${endpoint}`;
    
    // 20. CONFIGURAZIONE HEADERS - Imposta headers per JSON
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    };

    try {
      // 21. INVIO RICHIESTA - Fa la chiamata HTTP al backend
      const response = await fetch(url, defaultOptions);
      
      // 22. CONTROLLO RISPOSTA - Verifica se la risposta è valida
      if (!response.ok) {
        console.error('API Service: Risposta non OK dal backend.', response);
        const errorData = await response.json().catch(e => {
          console.error('API Service: Errore nel parsing della risposta JSON:', e);
          return {};
        });
        console.error('API Service: Dati errore backend:', errorData);

        // 23. GESTIONE ERRORI HTTP - Crea errore con dettagli del backend
        const error = new Error(errorData.error || `Errore HTTP: ${response.status}`);
        error.status = response.status;
        error.backendResponse = errorData;
        throw error;
      }
      
      // 24. PARSING RISPOSTA - Converte la risposta JSON in oggetto JavaScript
      return await response.json();
    } catch (error) {
      console.error('API Service: Errore nella chiamata API (catch block): ', error);
      throw error;
    }
  }

  /**
   * Analizza il sentiment di un testo
   */
  async analyzeSentiment(text) {
    // 25. CHIAMATA SENTIMENT - Invia richiesta POST al backend per sentiment
    return this.request('/sentiment', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  /**
   * Genera feedback motivazionale
   */
  async generateFeedback(text, sentiment) {
    // 26. CHIAMATA FEEDBACK - Invia richiesta POST al backend per feedback
    return this.request('/feedback', {
      method: 'POST',
      body: JSON.stringify({ text, sentiment }),
    });
  }

  /**
   * Analisi completa: sentiment + feedback
   */
  async analyzeComplete(text) {
    // 27. CHIAMATA COMPLETA - Invia richiesta POST per analisi completa
    return this.request('/analyze', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  /**
   * Health check del backend
   */
  async healthCheck() {
    // 28. HEALTH CHECK - Verifica se il backend è attivo
    return this.request('/health');
  }
}

// Esporta un'istanza singleton
export const apiService = new ApiService();

// Esporta anche la classe per eventuali estensioni
export default ApiService; 