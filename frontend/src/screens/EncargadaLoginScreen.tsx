import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Truck, ArrowLeft, Store } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';

export default function EncargadaLoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      await signIn({ email, password, expectedRole: 'encargada' });
    } catch (error: any) {
      console.error(error);
      const message = error.message || error.response?.data?.message || 'Hubo un problema al conectar con el servidor';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}>
          <ArrowLeft color="#1C1C1E" size={28} />
        </TouchableOpacity>
        <View style={styles.roleTag}>
          <Text style={styles.roleTagText}>
            Acceso: Encargado(a)
          </Text>
        </View>
      </View>

      <View style={styles.innerContainer}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/serviterra.jpg')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.subtitle}>Registro de Colaciones Tienda</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico de la tienda"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity 
            style={[styles.button, { backgroundColor: '#2C5EAD' }]} 
            onPress={handleLogin} 
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Iniciar Sesión en Tienda</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Store size={14} color="#8E8E93" />
          <Text style={styles.footerText}>Sistema de Registro ServiTerra</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', paddingTop: Platform.OS === 'android' ? 10 : 0 },
  header: { 
    paddingHorizontal: 20, 
    height: 60,
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  backButton: { 
    width: 44, 
    height: 44, 
    justifyContent: 'center', 
    alignItems: 'flex-start',
  },
  roleTag: { 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 8,
    backgroundColor: '#EBF2FA',
  },
  roleTagText: {
    fontSize: 14, 
    fontWeight: '700', 
    color: '#2C5EAD', 
  },
  innerContainer: { flex: 1, justifyContent: 'center', paddingHorizontal: 30 },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logo: { width: 220, height: 70 },
  subtitle: { fontSize: 16, color: '#8E8E93', fontWeight: '500', marginTop: -5 },
  form: { width: '100%', marginBottom: 30 },
  input: { backgroundColor: '#F2F2F7', height: 60, borderRadius: 18, paddingHorizontal: 20, fontSize: 16, marginBottom: 16, color: '#1C1C1E', borderWidth: 1, borderColor: '#E5E5EA' },
  button: { height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginTop: 10, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  footerText: { fontSize: 12, color: '#8E8E93', marginLeft: 6, fontWeight: '500' }
});