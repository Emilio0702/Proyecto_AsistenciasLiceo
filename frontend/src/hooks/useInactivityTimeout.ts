import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAuth } from '../context/AuthContext';

const TIMEOUT_DURATION = 5 * 60 * 1000; // 5 minutos

export const useInactivityTimeout = (navigation: any) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { signOut } = useAuth();

  const resetTimeout = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      await signOut();
    }, TIMEOUT_DURATION);
  };

  useEffect(() => {
    resetTimeout();
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') resetTimeout();
    });

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      subscription.remove();
    };
  }, []);

  return resetTimeout;
};
