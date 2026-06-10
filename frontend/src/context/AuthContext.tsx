import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

interface User {
  id: number;
  email: string;
  nombre: string;
  rol: string;
  pension_id: number | null;
  pension_nombre: string | null;
  pension_ubicacion: string | null;
}

interface SignInCredentials {
  email: string;
  password: string;
  expectedRole?: string;
}

interface AuthContextData {
  user: User | null;
  token: string | null;
  loading: boolean;
  signIn(credentials: SignInCredentials): Promise<void>;
  signOut(): Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStorageData() {
      try {
        const storageUser = await AsyncStorage.getItem('@ServiTerra:user');
        const storageToken = await SecureStore.getItemAsync('@ServiTerra:token');

        if (storageUser && storageToken) {
          setUser(JSON.parse(storageUser));
          setToken(storageToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${storageToken}`;
        }
      } catch (error) {
        console.error('[AuthContext] Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStorageData();
  }, []);

  const signIn = async ({ email, password, expectedRole }: SignInCredentials) => {
    const response = await api.post('/auth/login', { email, password });

    const { token: authToken, user: userData } = response.data;

    // Validación de roles
    if (expectedRole && userData.rol !== expectedRole) {
      throw new Error(`Acceso denegado. Esta cuenta no corresponde al rol de ${expectedRole === 'admin' ? 'Administrador' : 'Encargada'}.`);
    }

    await AsyncStorage.setItem('@ServiTerra:user', JSON.stringify(userData));
    await SecureStore.setItemAsync('@ServiTerra:token', authToken);

    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    
    setToken(authToken);
    setUser(userData);
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('@ServiTerra:user');
      await SecureStore.deleteItemAsync('@ServiTerra:token');
      
      delete api.defaults.headers.common['Authorization'];
      
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('[AuthContext] Error al cerrar sesión:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}
