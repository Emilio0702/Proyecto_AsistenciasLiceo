import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';

// Duración del tiempo fuera de la app (5 minutos por defecto)
// Puedes cambiar esto a 1 * 60 * 1000 para probar con 1 minuto
const TIMEOUT_DURATION = 5 * 60 * 1000; 

export const useInactivityTimeout = () => {
  const { signOut, user } = useAuth();

  useEffect(() => {
    // Solo activar si hay un usuario autenticado
    if (!user) return;

    const checkTimeout = async () => {
      try {
        const storedTime = await AsyncStorage.getItem('@ServiTerra:backgroundTime');
        if (storedTime) {
          const elapsed = Date.now() - parseInt(storedTime);
          if (elapsed >= TIMEOUT_DURATION) {
            console.log(`[useInactivityTimeout] Sesión expirada por inactividad (${Math.round(elapsed / 1000)}s)`);
            await signOut();
          }
        }
      } catch (error) {
        console.error('[useInactivityTimeout] Error verificando timeout:', error);
      }
    };

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        // Registramos el momento en que la aplicación pasó a segundo plano
        await AsyncStorage.setItem('@ServiTerra:backgroundTime', Date.now().toString());
      } else if (nextAppState === 'active') {
        // La aplicación regresó al primer plano
        await checkTimeout();
        // Limpiamos el marcador una vez verificado
        await AsyncStorage.removeItem('@ServiTerra:backgroundTime');
      }
    };

    // Verificar inmediatamente al montar (por si la app se cerró completamente)
    checkTimeout();

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [user, signOut]);
};
