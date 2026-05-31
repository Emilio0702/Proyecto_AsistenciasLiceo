import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  ActivityIndicator, Image, StatusBar, Platform,
  Animated, Easing, KeyboardAvoidingView, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShieldCheck, ArrowLeft, Eye, EyeOff, AlertCircle, Mail, Lock } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';

export default function AdminLoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const { signIn } = useAuth();

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const errorOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 500, useNativeDriver: true,
        easing: Easing.out(Easing.exp),
      }),
      Animated.timing(slideAnim, {
        toValue: 0, duration: 500, useNativeDriver: true,
        easing: Easing.out(Easing.exp),
      }),
    ]).start();
  }, []);

  const triggerShake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const showError = (msg: string, isEmail = false, isPassword = false) => {
    setErrorMsg(msg);
    setEmailError(isEmail);
    setPasswordError(isPassword);
    triggerShake();
    errorOpacity.setValue(0);
    Animated.timing(errorOpacity, {
      toValue: 1, duration: 300, useNativeDriver: true,
    }).start();
  };

  const clearErrors = () => {
    setErrorMsg('');
    setEmailError(false);
    setPasswordError(false);
  };

  const handleLogin = async () => {
    clearErrors();

    if (!email && !password) {
      showError('Por favor completa todos los campos.', true, true);
      return;
    }
    if (!email) {
      showError('El correo electrónico es requerido.', true, false);
      return;
    }
    if (!password) {
      showError('La contraseña es requerida.', false, true);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showError('Ingresa un correo electrónico válido.', true, false);
      return;
    }

    setLoading(true);
    try {
      await signIn({ email, password, expectedRole: 'admin' });
    } catch (error: any) {
      const raw = error?.response?.data?.message || error?.message || '';
      let msg = 'Hubo un problema al conectar con el servidor.';

      if (raw.toLowerCase().includes('contraseña') || raw.toLowerCase().includes('password') || raw.toLowerCase().includes('incorrecta') || raw.toLowerCase().includes('invalid')) {
        msg = 'Contraseña incorrecta. Por favor intenta de nuevo.';
        showError(msg, false, true);
      } else if (raw.toLowerCase().includes('usuario') || raw.toLowerCase().includes('correo') || raw.toLowerCase().includes('email') || raw.toLowerCase().includes('no encontrado') || raw.toLowerCase().includes('not found')) {
        msg = 'No encontramos una cuenta administrador con ese correo.';
        showError(msg, true, false);
      } else if (raw.toLowerCase().includes('rol') || raw.toLowerCase().includes('acceso') || raw.toLowerCase().includes('permiso')) {
        msg = 'Esta cuenta no tiene permisos de administrador.';
        showError(msg, false, false);
      } else if (raw !== '') {
        showError(raw, false, false);
      } else {
        showError(msg, false, false);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">

          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            >
              <ArrowLeft color="#1C1C1E" size={28} />
            </TouchableOpacity>
            <View style={styles.roleTag}>
              <Text style={styles.roleTagText}>Acceso: Administrador</Text>
            </View>
          </View>

          <Animated.View
            style={[
              styles.innerContainer,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/serviterra.jpg')}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.subtitle}>Panel Administrativo Central</Text>
            </View>

            <Animated.View style={[styles.form, { transform: [{ translateX: shakeAnim }] }]}>

              {errorMsg !== '' && (
                <Animated.View style={[styles.errorBanner, { opacity: errorOpacity }]}>
                  <AlertCircle size={18} color="#FF3B30" />
                  <Text style={styles.errorBannerText}>{errorMsg}</Text>
                </Animated.View>
              )}

              <View style={[styles.inputWrapper, emailError && styles.inputWrapperError]}>
                <Mail size={18} color={emailError ? '#FF3B30' : '#8E8E93'} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Correo administrativo"
                  placeholderTextColor="#AEAEB2"
                  value={email}
                  onChangeText={(v) => { setEmail(v); if (emailError) clearErrors(); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {emailError && <Text style={styles.fieldError}>✗ Revisa el correo ingresado</Text>}

              <View style={[styles.inputWrapper, passwordError && styles.inputWrapperError]}>
                <Lock size={18} color={passwordError ? '#FF3B30' : '#8E8E93'} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Contraseña"
                  placeholderTextColor="#AEAEB2"
                  value={password}
                  onChangeText={(v) => { setPassword(v); if (passwordError) clearErrors(); }}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  {showPassword
                    ? <EyeOff size={20} color="#8E8E93" />
                    : <Eye size={20} color="#8E8E93" />
                  }
                </TouchableOpacity>
              </View>
              {passwordError && <Text style={styles.fieldError}>✗ Revisa la contraseña ingresada</Text>}

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.buttonText}>Acceder al Panel</Text>
                }
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.footer}>
              <ShieldCheck size={14} color="#8E8E93" />
              <Text style={styles.footerText}>Acceso Restringido - ServiTerra</Text>
            </View>
          </Animated.View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', paddingTop: Platform.OS === 'android' ? 10 : 0 },
  header: {
    paddingHorizontal: 20, height: 60,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', width: '100%',
    borderBottomWidth: 1, 
    borderBottomColor: '#D1D1D6',
    backgroundColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    zIndex: 10,
  },
  backButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'flex-start' },
  roleTag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#F2F2F7' },
  roleTagText: { fontSize: 14, fontWeight: '700', color: '#1C1C1E' },
  innerContainer: { flex: 1, justifyContent: 'center', paddingHorizontal: 30, paddingBottom: 20 },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logo: { width: 220, height: 70 },
  subtitle: { fontSize: 16, color: '#8E8E93', fontWeight: '500', marginTop: -5 },
  form: { width: '100%', marginBottom: 30 },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF2F2', borderWidth: 1, borderColor: '#FFCDD2',
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 16,
  },
  errorBannerText: { color: '#FF3B30', fontSize: 14, fontWeight: '600', marginLeft: 8, flex: 1 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F2F2F7', height: 60, borderRadius: 18,
    paddingHorizontal: 16, marginBottom: 4, borderWidth: 1.5, borderColor: '#E5E5EA',
  },
  inputWrapperError: { borderColor: '#FF3B30', backgroundColor: '#FFF8F8' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: '#1C1C1E' },
  eyeBtn: { padding: 4 },
  fieldError: { color: '#FF3B30', fontSize: 12, fontWeight: '600', marginBottom: 12, marginLeft: 6 },
  button: {
    height: 60, borderRadius: 18, backgroundColor: '#1C1C1E',
    justifyContent: 'center', alignItems: 'center', marginTop: 16,
    elevation: 4, shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  footerText: { fontSize: 12, color: '#8E8E93', marginLeft: 6, fontWeight: '500' },
});