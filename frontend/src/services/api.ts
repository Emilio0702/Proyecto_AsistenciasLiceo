import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// URL de la API: Prioriza variable de entorno, luego Railway, luego fallback local
const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'https://serviterracolacion-production.up.railway.app') + '/api';

console.log('[API] Inicializado con base URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000, // 15s para dar margen en redes móviles
});

// Interceptor de respuesta para manejo de errores globales
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const isLoginRequest = error.config && error.config.url && error.config.url.includes('/auth/login');

    // Si el error es 401 (No autorizado) y NO es una petición de login, el token expiró
    if (error.response && error.response.status === 401 && !isLoginRequest) {
      console.warn('[API] Sesión expirada (401). Limpiando storage...');
      
      await AsyncStorage.removeItem('@ServiTerra:user');
      await SecureStore.deleteItemAsync('serviterra_token');
      
      // Aquí podrías forzar una redirección si tuvieras acceso al navigation
    }

    if (error.message === 'Network Error') {
      console.error('[API] Error de Conexión. URL inalcanzable:', error.config?.url);
    }
    
    return Promise.reject(error);
  }
);

export default api;
