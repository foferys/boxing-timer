import { useState, useEffect } from 'react';
import { apiService } from '../services/apiService.js';

/**
 * Hook per gestire la connessione al backend
 */
export function useBackendConnection() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkBackendConnection();
  }, []);

  const checkBackendConnection = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiService.healthCheck();
      
      if (response.status === 'OK') {
        setIsConnected(true);
        console.log('✅ Backend connesso:', response.message);
      } else {
        throw new Error('Risposta non valida dal backend');
      }
    } catch (err) {
      console.error('❌ Errore connessione backend:', err);
      setIsConnected(false);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const retryConnection = () => {
    checkBackendConnection();
  };

  return {
    isConnected,
    isLoading,
    error,
    retryConnection
  };
} 