import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

interface AuthContextData {
  user: User | null;
  token: string | null;
  loading: boolean;
  signIn(credentials: { email: string; password: string; expectedRole?: string }): Promise<void>;
  signOut(): Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStorageData() {
      const storageUser = await AsyncStorage.getItem('@ServiTerra:user');
      const storageToken = await AsyncStorage.getItem('@ServiTerra:token');

      if (storageUser && storageToken) {
        setUser(JSON.parse(storageUser));
        setToken(storageToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${storageToken}`;
      }
      setLoading(false);
    }

    loadStorageData();
  }, []);

  const signIn = async ({ email, password, expectedRole }: any) => {
    const response = await api.post('/auth/login', { email, password });

    const { token, user: userData } = response.data;

    // Validación de roles
    if (expectedRole && userData.rol !== expectedRole) {
      throw new Error(`Acceso denegado. Esta cuenta no corresponde al rol de ${expectedRole === 'admin' ? 'Administrador' : 'Encargada'}.`);
    }

    await AsyncStorage.setItem('@ServiTerra:user', JSON.stringify(userData));
    await AsyncStorage.setItem('@ServiTerra:token', token);

    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    setToken(token);
    setUser(userData);
  };

  const signOut = async () => {
    await AsyncStorage.clear();
    setToken(null);
    setUser(null);
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
