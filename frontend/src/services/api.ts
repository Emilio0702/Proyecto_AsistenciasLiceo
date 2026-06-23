import axios from 'axios';
import { deleteItemAsync } from '../utils/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// URL de la API: Prioriza variable de entorno, luego Railway, luego fallback local
const BASE_URL = (process.env.EXPO_PUBLIC_API_URL || 'https://serviterracolacion-production.up.railway.app').replace(/\/$/, '');
const API_URL = `${BASE_URL}/api/`;

console.log('[API] Inicializado con base URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000, // 15s para dar margen en redes móviles
});

// Interceptor de solicitud para asegurar que la URL no tenga doble slash
api.interceptors.request.use((config) => {
  if (config.url && config.url.startsWith('/')) {
    config.url = config.url.substring(1);
  }
  return config;
});

// Interceptor de respuesta para manejo de errores globales
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const isLoginRequest = error.config && error.config.url && error.config.url.includes('/auth/login');

    // Si el error es 401 (No autorizado) y NO es una petición de login, el token expiró
    if (error.response && error.response.status === 401 && !isLoginRequest) {
      console.warn('[API] Sesión expirada (401). Limpiando storage...');
      
      // Eliminar el token del dispositivo de forma segura usando la utilidad cruzada
      await deleteItemAsync('serviterra_token');
      
      // Aquí podrías forzar una redirección si tuvieras acceso al navigation
    }

    if (error.message === 'Network Error') {
      const fullUrl = error.config?.baseURL ? `${error.config.baseURL}${error.config.url}` : error.config?.url;
      console.error('[API] Error de Red. No se pudo conectar a:', fullUrl);
      // Log detallado para diagnóstico en el dispositivo
      if (error.toJSON) {
        console.error('[API] Detalles técnicos:', JSON.stringify(error.toJSON(), null, 2));
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
