import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image, Modal, StatusBar, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Truck, ArrowLeft, Save, User, QrCode, X } from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import api from '../services/api';
import { cleanRut, formatRut, validateRut } from '../utils/rut';

export default function RegisterCamioneroScreen({ navigation, route }: any) {
  const [loading, setLoading] = useState(false);
  const [rut, setRut] = useState(route.params?.rut ? formatRut(route.params.rut) : '');
  const [nombre, setNombre] = useState('');
  const [patente, setPatente] = useState('');
  const [telefono, setTelefono] = useState('');
  
  const [isScannerVisible, setIsScannerVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setIsScannerVisible(false);
    
    // Lógica para parsear Cédula de Identidad Chilena (RUT y Nombre)
    // Ejemplo de URL: https://www.registrocivil.cl/ConsultaCedula/consulta?rut=12345678-9&serie=...
    try {
      if (data.includes('registrocivil.cl')) {
        const urlParams = new URLSearchParams(data.split('?')[1]);
        const rutExtraido = urlParams.get('rut');
        if (rutExtraido) setRut(formatRut(rutExtraido));
        Alert.alert('Cédula detectada', `Se ha extraído el RUT: ${rutExtraido ? formatRut(rutExtraido) : ''}. Por favor completa el nombre.`);
      } else {
        // Intento de extraer RUT de texto plano o formato genérico
        const match = data.match(/(\d{7,8})-([\dkK])/);
        if (match) {
          setRut(formatRut(match[0]));
          Alert.alert('RUT detectado', `Se ha extraído: ${formatRut(match[0])}`);
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
        Alert.alert('Permiso denegado', 'Se necesita permiso de cámara para escanear la cédula.');
        return;
      }
    }
    setIsScannerVisible(true);
  };

  const registrarCamionero = async () => {
    if (!rut || !nombre) {
      Alert.alert('Error', 'RUT y Nombre son obligatorios');
      return;
    }

    const rutCleaned = cleanRut(rut);
    if (!validateRut(rutCleaned)) {
      Alert.alert('Error', 'El RUT ingresado no es válido (dígito verificador incorrecto).');
      return;
    }

    setLoading(true);
    try {
      const rutFormatted = formatRut(rutCleaned);
      await api.post('/camioneros', { rut: rutFormatted, nombre, patente, telefono });
      Alert.alert('Éxito', 'Camionero registrado correctamente');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Error al registrar');
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
        <Text style={styles.headerTitle}>Nuevo Camionero</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.logoBox}>
          <Image source={require('../../assets/serviterra.jpg')} style={styles.logo} resizeMode="contain" />
        </View>

        <TouchableOpacity style={styles.scanDocBtn} onPress={openScanner}>
          <QrCode color="#fff" size={24} />
          <Text style={styles.scanDocText}>Escanear Cédula para autocompletar</Text>
        </TouchableOpacity>

        <View style={styles.form}>
          <View style={styles.sectionHeader}>
            <User size={20} color="#2C5EAD" />
            <Text style={styles.sectionTitle}>Datos del Camionero</Text>
          </View>

          <Text style={styles.label}>RUT</Text>
          <TextInput 
            style={styles.input} 
            value={rut} 
            onChangeText={(text) => {
              const cleaned = text.replace(/[^0-9kK]/gi, '').toUpperCase();
              setRut(cleaned);
            }} 
            onBlur={() => setRut((current) => formatRut(cleanRut(current)))}
            placeholder="Ej: 12345678-9" 
            autoCapitalize="characters"
            autoComplete="off"
            textContentType="none"
            spellCheck={false}
            maxLength={12}
            selectionColor="#2C5EAD"
            cursorColor="#2C5EAD"
          />
          
          <Text style={styles.label}>Nombre Completo</Text>
          <TextInput 
            style={styles.input} 
            value={nombre} 
            onChangeText={setNombre} 
            placeholder="Nombre del conductor" 
            selectionColor="#2C5EAD"
            cursorColor="#2C5EAD"
          />
          
          <Text style={styles.label}>Patente del Camión</Text>
          <TextInput 
            style={styles.input} 
            value={patente} 
            onChangeText={setPatente} 
            placeholder="Ej: ABCD-12 o AB-1234" 
            autoCapitalize="characters"
            selectionColor="#2C5EAD"
            cursorColor="#2C5EAD"
          />
          
          <Text style={styles.label}>Teléfono de Contacto</Text>
          <TextInput 
            style={styles.input} 
            value={telefono} 
            onChangeText={setTelefono} 
            keyboardType="phone-pad" 
            placeholder="Ej: +569..."
            selectionColor="#2C5EAD"
            cursorColor="#2C5EAD"
          />

          <TouchableOpacity style={styles.saveButton} onPress={registrarCamionero} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : (
              <>
                <Truck size={22} color="#fff" />
                <Text style={styles.saveText}>Registrar Camionero</Text>
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
