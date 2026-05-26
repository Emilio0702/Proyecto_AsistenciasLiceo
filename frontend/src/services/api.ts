import axios from 'axios';
import { Platform } from 'react-native';

// Usar la IP local de tu computadora para que el celular pueda conectarse
const LOCAL_IP = '192.168.1.85'; 
const API_URL = `http://${LOCAL_IP}:3000/api`;

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // Aumentamos el timeout a 10s para redes Wi-Fi lentas
});

export default api;
