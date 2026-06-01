import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity, Alert,
  ActivityIndicator, Image, StatusBar, Platform,
  Animated, Easing, KeyboardAvoidingView, ScrollView, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Store, Eye, EyeOff, AlertCircle, Mail, Lock } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function EncargadaLoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetPasswordConfirm, setResetPasswordConfirm] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<'email' | 'password' | 'resetEmail' | 'resetPassword' | 'resetConfirm' | null>(null);
  const { signIn } = useAuth();

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const errorOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.out(Easing.exp),
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
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
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const clearErrors = () => {
    setErrorMsg('');
    setEmailError(false);
    setPasswordError(false);
  };

  const openResetModal = () => {
    setResetEmail(email);
    setResetPassword('');
    setResetPasswordConfirm('');
    setShowResetModal(true);
  };

  const closeResetModal = () => {
    setShowResetModal(false);
  };

  const handleResetPassword = async () => {
    if (!resetEmail || !resetPassword || !resetPasswordConfirm) {
      Alert.alert('Completa los datos', 'Ingresa tu correo y la nueva contraseña dos veces.');
      return;
    }

    if (resetPassword.length < 6) {
      Alert.alert('Contraseña muy corta', 'La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (resetPassword !== resetPasswordConfirm) {
      Alert.alert('Contraseñas distintas', 'Las contraseñas nuevas no coinciden.');
      return;
    }

    setResetLoading(true);
    try {
      await api.post('/auth/reset-password', {
        email: resetEmail.trim(),
        password: resetPassword,
      });

      Alert.alert('Contraseña actualizada', 'Ya puedes iniciar sesión con la nueva contraseña.');
      setShowResetModal(false);
      setResetPassword('');
      setResetPasswordConfirm('');
    } catch (error: any) {
      const raw = error?.response?.data?.message || error?.message || 'No se pudo restablecer la contraseña.';
      Alert.alert('Error', raw);
    } finally {
      setResetLoading(false);
    }
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
      await signIn({ email, password, expectedRole: 'encargada' });
    } catch (error: any) {
      const raw = error?.response?.data?.message || error?.message || '';
      let friendlyMessage = 'Hubo un problema al conectar con el servidor.';

      if (raw.toLowerCase().includes('contraseña') || raw.toLowerCase().includes('password') || raw.toLowerCase().includes('incorrecta') || raw.toLowerCase().includes('invalid')) {
        friendlyMessage = 'Contraseña incorrecta. Por favor intenta de nuevo.';
        showError(friendlyMessage, false, true);
      } else if (raw.toLowerCase().includes('usuario') || raw.toLowerCase().includes('correo') || raw.toLowerCase().includes('email') || raw.toLowerCase().includes('no encontrado') || raw.toLowerCase().includes('not found')) {
        friendlyMessage = 'No encontramos una cuenta con ese correo.';
        showError(friendlyMessage, true, false);
      } else if (raw.toLowerCase().includes('rol') || raw.toLowerCase().includes('acceso') || raw.toLowerCase().includes('permiso')) {
        friendlyMessage = 'Esta cuenta no tiene acceso de encargada.';
        showError(friendlyMessage, false, false);
      } else if (raw !== '') {
        friendlyMessage = raw;
        showError(friendlyMessage, false, false);
      } else {
        showError(friendlyMessage, false, false);
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
              <Text style={styles.roleTagText}>Acceso: Encargado(a)</Text>
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
              <Text style={styles.subtitle}>Registro de Colaciones Tienda</Text>
            </View>

            <TouchableOpacity
              style={styles.recoveryCard}
              onPress={openResetModal}
              activeOpacity={0.85}
            >
              <View style={styles.recoveryDot} />
              <View style={{ flex: 1 }}>
                <Text style={styles.recoveryTitle}>¿Olvidaste tu contraseña?</Text>
                <Text style={styles.recoveryText}>Toca aquí para crear una nueva y seguir ingresando.</Text>
              </View>
            </TouchableOpacity>

            <Animated.View style={[styles.form, { transform: [{ translateX: shakeAnim }] }]}>

              {/* Mensaje de error global */}
              {errorMsg !== '' && (
                <Animated.View style={[styles.errorBanner, { opacity: errorOpacity }]}>
                  <AlertCircle size={18} color="#FF3B30" />
                  <Text style={styles.errorBannerText}>{errorMsg}</Text>
                </Animated.View>
              )}

              {/* Campo email */}
              <View style={[styles.inputWrapper, emailError && styles.inputWrapperError]}>
                <Mail size={18} color={emailError ? '#FF3B30' : '#8E8E93'} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, focusedField === 'email' && styles.inputFocused]}
                  placeholder="Correo electrónico de la tienda"
                  placeholderTextColor="#AEAEB2"
                  value={email}
                  onChangeText={(v) => { setEmail(v); if (emailError) clearErrors(); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  selectionColor="#2C5EAD"
                  cursorColor="#2C5EAD"
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField((current) => current === 'email' ? null : current)}
                />
              </View>
              {emailError && <Text style={styles.fieldError}>✗ Revisa el correo ingresado</Text>}

              {/* Campo contraseña */}
              <View style={[styles.inputWrapper, passwordError && styles.inputWrapperError]}>
                <Lock size={18} color={passwordError ? '#FF3B30' : '#8E8E93'} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, focusedField === 'password' && styles.inputFocused]}
                  placeholder="Contraseña"
                  placeholderTextColor="#AEAEB2"
                  value={password}
                  onChangeText={(v) => { setPassword(v); if (passwordError) clearErrors(); }}
                  secureTextEntry={!showPassword}
                  selectionColor="#2C5EAD"
                  cursorColor="#2C5EAD"
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField((current) => current === 'password' ? null : current)}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  {showPassword
                    ? <EyeOff size={20} color="#8E8E93" />
                    : <Eye size={20} color="#8E8E93" />
                  }
                </TouchableOpacity>
              </View>
              {passwordError && <Text style={styles.fieldError}>✗ Revisa la contraseña ingresada</Text>}

              <TouchableOpacity onPress={openResetModal} style={styles.forgotPasswordBtn} activeOpacity={0.8}>
                <Text style={styles.forgotPasswordText}>Olvidé mi contraseña</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#2C5EAD' }, loading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.buttonText}>Iniciar Sesión en Tienda</Text>
                }
              </TouchableOpacity>
            </Animated.View>

            <Modal visible={showResetModal} transparent animationType="fade" onRequestClose={closeResetModal}>
              <View style={styles.modalBackdrop}>
                <View style={styles.modalCard}>
                  <Text style={styles.modalTitle}>Restablecer contraseña</Text>
                  <Text style={styles.modalBody}>
                    No se puede ver la contraseña anterior por seguridad. Puedes crear una nueva para esta cuenta.
                  </Text>

                  <TextInput
                    style={[styles.modalInput, focusedField === 'resetEmail' && styles.inputFocused]}
                    placeholder="Correo de la cuenta"
                    placeholderTextColor="#AEAEB2"
                    value={resetEmail}
                    onChangeText={setResetEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    selectionColor="#2C5EAD"
                    cursorColor="#2C5EAD"
                    onFocus={() => setFocusedField('resetEmail')}
                    onBlur={() => setFocusedField((current) => current === 'resetEmail' ? null : current)}
                  />
                  <TextInput
                    style={[styles.modalInput, focusedField === 'resetPassword' && styles.inputFocused]}
                    placeholder="Nueva contraseña"
                    placeholderTextColor="#AEAEB2"
                    value={resetPassword}
                    onChangeText={setResetPassword}
                    secureTextEntry
                    selectionColor="#2C5EAD"
                    cursorColor="#2C5EAD"
                    onFocus={() => setFocusedField('resetPassword')}
                    onBlur={() => setFocusedField((current) => current === 'resetPassword' ? null : current)}
                  />
                  <TextInput
                    style={[styles.modalInput, focusedField === 'resetConfirm' && styles.inputFocused]}
                    placeholder="Repite la nueva contraseña"
                    placeholderTextColor="#AEAEB2"
                    value={resetPasswordConfirm}
                    onChangeText={setResetPasswordConfirm}
                    secureTextEntry
                    selectionColor="#2C5EAD"
                    cursorColor="#2C5EAD"
                    onFocus={() => setFocusedField('resetConfirm')}
                    onBlur={() => setFocusedField((current) => current === 'resetConfirm' ? null : current)}
                  />

                  <TouchableOpacity style={[styles.modalPrimaryBtn, resetLoading && styles.buttonDisabled]} onPress={handleResetPassword} disabled={resetLoading} activeOpacity={0.85}>
                    {resetLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalPrimaryText}>Restablecer contraseña</Text>}
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalSecondaryBtn} onPress={closeResetModal} activeOpacity={0.85}>
                    <Text style={styles.modalSecondaryText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            <View style={styles.footer}>
              <Store size={14} color="#8E8E93" />
              <Text style={styles.footerText}>Sistema de Registro ServiTerra</Text>
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
    paddingHorizontal: 20,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
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
  backButton: {
    width: 44, height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  roleTag: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#EBF2FA',
  },
  roleTagText: { fontSize: 14, fontWeight: '700', color: '#2C5EAD' },
  innerContainer: { flex: 1, justifyContent: 'center', paddingHorizontal: 30, paddingBottom: 20 },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logo: { width: 220, height: 70 },
  subtitle: { fontSize: 16, color: '#8E8E93', fontWeight: '500', marginTop: -5 },
  recoveryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#EEF5FF',
    borderWidth: 1,
    borderColor: '#CFE0FF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 18,
  },
  recoveryDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#2C5EAD' },
  recoveryTitle: { fontSize: 15, fontWeight: '800', color: '#1C1C1E' },
  recoveryText: { fontSize: 13, color: '#4A4A4A', marginTop: 2, lineHeight: 18 },
  form: { width: '100%', marginBottom: 30 },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF2F2',
    borderWidth: 1,
    borderColor: '#FFCDD2',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  errorBannerText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    height: 60,
    borderRadius: 18,
    paddingHorizontal: 16,
    marginBottom: 4,
    borderWidth: 1.5,
    borderColor: '#E5E5EA',
  },
  inputWrapperFocused: {
    borderColor: '#2C5EAD',
    backgroundColor: '#FFFFFF',
  },
  inputWrapperError: {
    borderColor: '#FF3B30',
    backgroundColor: '#FFF8F8',
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: '#1C1C1E' },
  inputFocused: { borderColor: '#2C5EAD', backgroundColor: '#FFFFFF' },
  eyeBtn: { padding: 4 },
  fieldError: {
    color: '#FF3B30',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 6,
  },
  forgotPasswordBtn: { alignSelf: 'flex-end', marginTop: 4, marginBottom: 8 },
  forgotPasswordText: { color: '#2C5EAD', fontSize: 13, fontWeight: '700' },
  button: {
    height: 60, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
    marginTop: 16, elevation: 4,
    shadowColor: '#2C5EAD',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  footerText: { fontSize: 12, color: '#8E8E93', marginLeft: 6, fontWeight: '500' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 24 },
  modalCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#E5E5EA' },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#1C1C1E', marginBottom: 8 },
  modalBody: { fontSize: 14, lineHeight: 20, color: '#636366', marginBottom: 16 },
  modalInput: { backgroundColor: '#F2F2F7', height: 54, borderRadius: 16, borderWidth: 1.5, borderColor: '#E5E5EA', paddingHorizontal: 14, marginBottom: 12, fontSize: 16, color: '#1C1C1E' },
  modalPrimaryBtn: { height: 54, borderRadius: 16, backgroundColor: '#2C5EAD', justifyContent: 'center', alignItems: 'center', marginTop: 4 },
  modalPrimaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  modalSecondaryBtn: { height: 48, justifyContent: 'center', alignItems: 'center', marginTop: 6 },
  modalSecondaryText: { color: '#2C5EAD', fontSize: 15, fontWeight: '700' },
});