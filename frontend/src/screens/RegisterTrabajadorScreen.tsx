import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, Image, Modal, StatusBar, ScrollView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Truck, ArrowLeft, User, QrCode, X, Building2, Phone, Car } from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import api from '../services/api';
import { cleanRut, formatRut, validateRut } from '../utils/rut';
import { CustomAlert } from '../components/CustomAlert';

const EMPRESAS = ['Transportes Morgado', 'Serviterra Ltda', 'Aridos Serviterra'];

export default function RegisterTrabajadorScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [rut, setRut] = useState(route.params?.rut ? formatRut(route.params.rut) : '');
  const [nombre, setNombre] = useState('');
  const [patente, setPatente] = useState('');
  const [telefono, setTelefono] = useState('');
  const [empresa, setEmpresa] = useState(EMPRESAS[0]);
  
  const [isScannerVisible, setIsScannerVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [alert, setAlert] = useState<{ visible: boolean; title: string; message: string; type: 'success' | 'error' }>({ visible: false, title: '', message: '', type: 'success' });

  const openScanner = async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        setAlert({ visible: true, title: 'Permiso denegado', message: 'Se necesita permiso de cámara.', type: 'error' });
        return;
      }
    }
    setIsScannerVisible(true);
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setIsScannerVisible(false);
    const match = data.match(/(\d{7,8})-([\dkK])/);
    const rutFormateado = formatRut(match ? match[0] : data);
    setRut(rutFormateado);
  };

  const registrarTrabajador = async () => {
    // Validaciones específicas
    if (!rut) {
      setAlert({ visible: true, title: 'Falta información', message: 'El RUT es obligatorio.', type: 'error' });
      return;
    }
    if (!nombre) {
      setAlert({ visible: true, title: 'Falta información', message: 'El nombre es obligatorio.', type: 'error' });
      return;
    }
    if (!empresa) {
      setAlert({ visible: true, title: 'Falta información', message: 'La empresa es obligatoria.', type: 'error' });
      return;
    }

    const rutCleaned = cleanRut(rut);
    if (!validateRut(rutCleaned)) {
      setAlert({ visible: true, title: 'Error', message: 'El RUT ingresado no es válido.', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const rutFormatted = formatRut(rutCleaned);
      await api.post('/trabajadores', { rut: rutFormatted, nombre, patente, telefono, empresa });
      setAlert({ visible: true, title: 'Éxito', message: 'Trabajador registrado correctamente', type: 'success' });
      setTimeout(() => navigation.goBack(), 1500);
    } catch (error: any) {
      console.log("Error al registrar trabajador:", error.response?.data || error.message);
      setAlert({ visible: true, title: 'Error', message: error.response?.data?.message || 'Error al registrar', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft color="#1C1C1E" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nuevo Trabajador</Text>
      </View>
      
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.logoBox}>
          <Image source={require('../../assets/serviterra.jpg')} style={styles.logo} resizeMode="contain" />
        </View>

        <View style={styles.form}>
          <View style={styles.sectionHeader}>
            <User size={20} color="#2C5EAD" />
            <Text style={styles.sectionTitle}>Datos del Trabajador</Text>
          </View>

          <Text style={styles.label}>Empresa</Text>
          <View style={styles.pickerContainer}>
            {EMPRESAS.map((e) => (
              <TouchableOpacity key={e} style={[styles.pickerItem, empresa === e && styles.pickerItemActive]} onPress={() => setEmpresa(e)}>
                <Text style={[styles.pickerItemText, empresa === e && styles.pickerItemTextActive]}>{e}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>RUT</Text>
          <TextInput style={styles.input} value={rut} onChangeText={setRut} placeholder="Ej: 12.345.678-9" autoCapitalize="characters" />
          
          <Text style={styles.label}>Nombre Completo</Text>
          <TextInput style={styles.input} value={nombre} onChangeText={setNombre} placeholder="Nombre" />
          
          <Text style={styles.label}>Patente</Text>
          <TextInput style={styles.input} value={patente} onChangeText={setPatente} placeholder="Ej: ABCD-12" autoCapitalize="characters" />
          
          <Text style={styles.label}>Teléfono</Text>
          <TextInput style={styles.input} value={telefono} onChangeText={setTelefono} keyboardType="phone-pad" placeholder="+569..." />

          <TouchableOpacity style={styles.saveButton} onPress={registrarTrabajador} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : (
              <>
                <Truck size={22} color="#fff" />
                <Text style={styles.saveText}>Registrar Trabajador</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <CustomAlert 
        visible={alert.visible} 
        title={alert.title} 
        message={alert.message} 
        type={alert.type} 
        onClose={() => setAlert({ ...alert, visible: false })} 
      />
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
  scanDocBtn: { backgroundColor: '#1C1C1E', padding: 18, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  scanDocText: { color: '#fff', fontWeight: '800', marginLeft: 10 },
  form: { backgroundColor: '#F8F9FA', padding: 20, borderRadius: 25, borderWidth: 1, borderColor: '#E5E5EA' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginLeft: 10, color: '#1C1C1E' },
  label: { fontSize: 14, fontWeight: '700', marginBottom: 8, color: '#48484A', marginLeft: 5 },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 15, borderWidth: 1, borderColor: '#E5E5EA', fontSize: 16 },
  saveButton: { backgroundColor: '#2C5EAD', height: 65, borderRadius: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 15 },
  saveText: { color: '#fff', fontWeight: '800', fontSize: 18, marginLeft: 10 },
  pickerContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 },
  pickerItem: { backgroundColor: '#fff', padding: 10, borderRadius: 10, marginRight: 10, marginBottom: 10, borderWidth: 1, borderColor: '#E5E5EA' },
  pickerItemActive: { backgroundColor: '#2C5EAD', borderColor: '#2C5EAD' },
  pickerItemText: { color: '#48484A' },
  pickerItemTextActive: { color: '#fff', fontWeight: 'bold' },
  scannerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  closeScanner: { position: 'absolute', top: 50, right: 30 },
  scannerFrame: { width: 300, height: 200, borderWidth: 4, borderColor: '#2C5EAD', borderRadius: 20 },
  scannerText: { color: '#fff', fontSize: 18, marginTop: 40, fontWeight: '800' },
});
