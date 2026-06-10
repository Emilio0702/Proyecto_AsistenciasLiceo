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
    // Si el error es 401 (No autorizado), probablemente el token expiró
    if (error.response && error.response.status === 401) {
      console.warn('[API] Sesión expirada o no autorizada (401). Limpiando storage...');
      
      // Limpiar storage de forma manual para forzar logout en la UI (el AuthContext reaccionará si intentamos usarlo)
      await AsyncStorage.removeItem('@ServiTerra:user');
      await SecureStore.deleteItemAsync('@ServiTerra:token');
      
      // Opcional: Podrías emitir un evento o usar un callback para que AppNavigator redirija al login
    }

    if (error.message === 'Network Error') {
      console.error('[API] Error de Red. Verifica conexión a internet o disponibilidad del servidor.');
    }
    
    return Promise.reject(error);
  }
);

export default api;
