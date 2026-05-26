import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image, Modal, StatusBar, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserPlus, ArrowLeft, Save, Store, QrCode, X } from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import api from '../services/api';

export default function RegisterAdminScreen({ navigation }: any) {
  const [loading, setLoading] = useState(false);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tienda, setTienda] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const [isScannerVisible, setIsScannerVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setIsScannerVisible(false);
    try {
      if (data.includes('registrocivil.cl')) {
        const urlParams = new URLSearchParams(data.split('?')[1]);
        const rutExtraido = urlParams.get('rut');
        // El nombre no suele venir en el QR del registro civil, pero el RUT sí.
        Alert.alert('Cédula detectada', `RUT extraído: ${rutExtraido}. El correo se ha pre-completado sugeridamente.`);
        if (rutExtraido) {
          // Opcional: sugerir un email basado en el RUT o simplemente informar
          setEmail(rutExtraido.replace('-', '') + '@serviterra.com');
        }
      } else {
        const match = data.match(/(\d{7,8})-([\dkK])/);
        if (match) {
          Alert.alert('RUT detectado', `RUT extraído: ${match[0]}`);
          setEmail(match[0].replace('-', '') + '@serviterra.com');
        }
      }
    } catch (e) {
      console.error('Error parseando QR:', e);
    }
  };

  const openScanner = async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert('Permiso denegado', 'Se necesita permiso de cámara.');
        return;
      }
    }
    setIsScannerVisible(true);
  };

  const registrarUsuario = async () => {
    if (!nombre || !email || !password || (!isSuperAdmin && !tienda)) {
      Alert.alert('Error', 'Todos los datos son obligatorios según el rol.');
      return;
    }

    setLoading(true);
    try {
      let tiendaId = null;

      if (!isSuperAdmin) {
        const tiendaRes = await api.post('/tiendas', { 
          nombre: tienda, 
          ubicacion: ubicacion 
        });
        tiendaId = tiendaRes.data.id;
      }

      await api.post('/auth/register', {
        nombre,
        email,
        password,
        tienda_id: tiendaId,
        rol: isSuperAdmin ? 'admin' : 'encargada'
      });

      Alert.alert('Éxito', `${isSuperAdmin ? 'Administrador' : 'Encargada y Tienda'} registrado(s) correctamente`);
      navigation.goBack();
    } catch (error: any) {
      console.error(error);
      const message = error.response?.data?.message || 'Error al registrar';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}>
          <ArrowLeft color="#1C1C1E" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Registrar Personal</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.logoBox}>
          <Image source={require('../../assets/serviterra.jpg')} style={styles.logo} resizeMode="contain" />
        </View>

        <View style={styles.roleToggleContainer}>
          <TouchableOpacity 
            style={[styles.roleToggleButton, !isSuperAdmin && styles.roleToggleActive]} 
            onPress={() => setIsSuperAdmin(false)}
          >
            <Text style={[styles.roleToggleText, !isSuperAdmin && styles.roleToggleTextActive]}>Encargada de Tienda</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.roleToggleButton, isSuperAdmin && styles.roleToggleActive]} 
            onPress={() => setIsSuperAdmin(true)}
          >
            <Text style={[styles.roleToggleText, isSuperAdmin && styles.roleToggleTextActive]}>Administrador</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.scanDocBtn} onPress={openScanner}>
          <QrCode color="#fff" size={24} />
          <Text style={styles.scanDocText}>Escanear Cédula {isSuperAdmin ? 'del Admin' : 'de la Encargada'}</Text>
        </TouchableOpacity>

        <View style={styles.form}>
          {!isSuperAdmin && (
            <>
              <View style={styles.sectionHeader}>
                <Store size={20} color="#2C5EAD" />
                <Text style={styles.sectionTitle}>Datos de la Tienda</Text>
              </View>
              
              <Text style={styles.label}>Nombre de la Tienda</Text>
              <TextInput style={styles.input} value={tienda} onChangeText={setTienda} placeholder="Ej: Tienda Central" />
              
              <Text style={styles.label}>Ubicación / Ciudad</Text>
              <TextInput style={styles.input} value={ubicacion} onChangeText={setUbicacion} placeholder="Ej: Santiago" />
            </>
          )}

          <View style={[styles.sectionHeader, { marginTop: 10 }]}>
            <UserPlus size={20} color="#2C5EAD" />
            <Text style={styles.sectionTitle}>Datos {isSuperAdmin ? 'del Administrador' : 'de la Encargada'}</Text>
          </View>

          <Text style={styles.label}>Nombre Completo</Text>
          <TextInput style={styles.input} value={nombre} onChangeText={setNombre} placeholder="Nombre de la encargada" />
          
          <Text style={styles.label}>Correo Electrónico</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="correo@ejemplo.com" />
          
          <Text style={styles.label}>Contraseña de Acceso</Text>
          <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry placeholder="Mínimo 6 caracteres" />

          <TouchableOpacity style={styles.saveButton} onPress={registrarUsuario} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : (
              <>
                <Save size={22} color="#fff" />
                <Text style={styles.saveText}>Guardar Registro</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={isScannerVisible} animationType="slide">
        <CameraView style={StyleSheet.absoluteFillObject} onBarcodeScanned={handleBarCodeScanned} barcodeScannerSettings={{barcodeTypes: ["qr", "pdf417"]}}>
          <View style={styles.scannerOverlay}>
            <TouchableOpacity style={styles.closeScanner} onPress={() => setIsScannerVisible(false)}>
              <X color="#fff" size={36} />
            </TouchableOpacity>
            <View style={styles.scannerFrame} />
            <Text style={styles.scannerText}>Escanea el código de la Cédula</Text>
            <Text style={styles.scannerSub}>QR o PDF417 (reverso)</Text>
          </View>
        </CameraView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F2F2F7' },
  backBtn: { width: 44, height: 44, justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', marginLeft: 15, color: '#1C1C1E' },
  scroll: { padding: 24 },
  logoBox: { alignItems: 'center', marginBottom: 20 },
  logo: { width: 180, height: 60 },
  roleToggleContainer: { flexDirection: 'row', backgroundColor: '#F2F2F7', borderRadius: 15, padding: 5, marginBottom: 20 },
  roleToggleButton: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
  roleToggleActive: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  roleToggleText: { fontSize: 14, fontWeight: '600', color: '#8E8E93' },
  roleToggleTextActive: { color: '#1C1C1E', fontWeight: '800' },
  scanDocBtn: { backgroundColor: '#1C1C1E', padding: 18, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  scanDocText: { color: '#fff', fontWeight: '800', marginLeft: 10 },
  form: { backgroundColor: '#F8F9FA', padding: 20, borderRadius: 25, borderWidth: 1, borderColor: '#E5E5EA' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginLeft: 10, color: '#1C1C1E' },
  label: { fontSize: 14, fontWeight: '700', marginBottom: 8, color: '#48484A', marginLeft: 5 },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 15, borderWidth: 1, borderColor: '#E5E5EA', fontSize: 16, color: '#1C1C1E' },
  saveButton: { backgroundColor: '#2C5EAD', height: 65, borderRadius: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 15, elevation: 4 },
  saveText: { color: '#fff', fontWeight: '800', fontSize: 18, marginLeft: 10 },
  scannerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  closeScanner: { position: 'absolute', top: 50, right: 30 },
  scannerFrame: { width: 300, height: 200, borderWidth: 4, borderColor: '#2C5EAD', borderRadius: 20 },
  scannerText: { color: '#fff', fontSize: 18, marginTop: 40, fontWeight: '800' },
  scannerSub: { color: '#EBF2FA', fontSize: 14, marginTop: 5 }
});
