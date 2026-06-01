import axios from 'axios';

// Obtener la URL de la API desde las variables de entorno de Expo (nativas con prefijo EXPO_PUBLIC_)
// Si no está definida, por defecto usa la IP local como fallback en desarrollo local
const DEFAULT_API_URL = 'http://192.168.1.85:3000/api';
const API_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL;

console.log('[API] Inicializado con base URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // Aumentamos el timeout a 10s para redes Wi-Fi lentas
});

export default api;
