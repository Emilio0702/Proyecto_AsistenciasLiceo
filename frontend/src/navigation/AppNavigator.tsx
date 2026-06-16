import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';

import EncargadaLoginScreen from '../screens/EncargadaLoginScreen';
import AdminLoginScreen from '../screens/AdminLoginScreen';
import RoleSelectionScreen from '../screens/RoleSelectionScreen';
import HomeScreen from '../screens/HomeScreen';
import AdminHomeScreen from '../screens/AdminHomeScreen';
import RegisterTrabajadorScreen from '../screens/RegisterTrabajadorScreen';
import RegisterAdminScreen from '../screens/RegisterAdminScreen';
import MapPickerScreen from '../screens/MapPickerScreen';
import { useAuth } from '../context/AuthContext';
import { useInactivityTimeout } from '../hooks/useInactivityTimeout';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { user, loading } = useAuth();
  
  // Hook de inactividad global
  useInactivityTimeout();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2C5EAD" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // Rutas para usuarios autenticados
          <>
            {user.rol === 'admin' ? (
              <>
                <Stack.Screen name="AdminHome" component={AdminHomeScreen} />
                <Stack.Screen name="RegisterTrabajador" component={RegisterTrabajadorScreen} />
                <Stack.Screen name="RegisterAdmin" component={RegisterAdminScreen} />
                <Stack.Screen name="MapPicker" component={MapPickerScreen} />
                <Stack.Screen name="Home" component={HomeScreen} />
              </>
            ) : (
              <>
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="MapPicker" component={MapPickerScreen} />
              </>
            )}
          </>
        ) : (
          // Rutas para usuarios NO autenticados
          <>
            <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
            <Stack.Screen name="EncargadaLogin" component={EncargadaLoginScreen} />
            <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
