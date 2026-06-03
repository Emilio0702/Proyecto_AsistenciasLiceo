import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, Keyboard, Modal, Image, StatusBar, Platform, FlatList, Animated, ScrollView, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { User, ClipboardCheck, LayoutGrid, QrCode, X, LogOut, UserPlus, Clock, MapPin, Printer } from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import api from '../services/api';
import { useInactivityTimeout } from '../hooks/useInactivityTimeout';
import { useAuth } from '../context/AuthContext';
import { cleanRut, formatRut, validateRut } from '../utils/rut';
import { CustomAlert } from '../components/CustomAlert';

const TIPOS_SERVICIO = ['Desayuno', 'Almuerzo', 'Cena', 'Hospedaje'];

export default function HomeScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const nombreUsuario = user?.nombre || 'Usuario';
  const nombreLocal = user?.tienda_nombre || 'ServiTerra';
  const role = user?.rol || 'encargada';
  
  useInactivityTimeout(navigation);

  const [rut, setRut] = useState('');
  const [loading, setLoading] = useState(false);
  const [camionero, setCamionero] = useState<any>(null);
  const [isScannerVisible, setIsScannerVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const [historial, setHistorial] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const PER_PAGE = 5;

  const [tipoServicio, setTipoServicio] = useState(TIPOS_SERVICIO[0]);
  const [voucherData, setVoucherData] = useState<any>(null);
  const [showVoucher, setShowVoucher] = useState(false);
  
  const [alert, setAlert] = useState<{ visible: boolean; title: string; message: string; type: 'success' | 'error' }>({ visible: false, title: '', message: '', type: 'success' });

  const formatFechaRegistro = (fecha: any) => {
    if (!fecha) return '--/--/----';
    const raw = String(fecha);
    const isoDate = raw.length >= 10 ? raw.substring(0, 10) : raw;
    const [year, month, day] = isoDate.split('-');
    if (!year || !month || !day) return isoDate;
    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    fetchHistorial(0);
  }, []);

  const fetchHistorial = async (pageNumber: number) => {
    if (loadingHistory || !user?.tienda_id) return;
    setLoadingHistory(true);
    try {
      const response = await api.get(`/colaciones?tienda_id=${user.tienda_id}&limit=${PER_PAGE}&offset=${pageNumber * PER_PAGE}`);
      const newData = response.data.data || [];
      if (pageNumber === 0) setHistorial(newData);
      else setHistorial([...(historial || []), ...newData]);
      setTotalRecords(response.data.total || 0);
      setPage(pageNumber);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoadingHistory(false);
    }
  };

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const logoutSlide = useRef(new Animated.Value(300)).current;
  const logoutBackdrop = useRef(new Animated.Value(0)).current;

  const openLogoutModal = () => {
    setShowLogoutModal(true);
    Animated.parallel([
      Animated.timing(logoutBackdrop, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.spring(logoutSlide, { toValue: 0, tension: 65, friction: 10, useNativeDriver: true }),
    ]).start();
  };

  const closeLogoutModal = () => {
    Animated.parallel([
      Animated.timing(logoutBackdrop, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(logoutSlide, { toValue: 300, duration: 200, useNativeDriver: true }),
    ]).start(() => setShowLogoutModal(false));
  };

  const handleLogout = async () => {
    closeLogoutModal();
    setTimeout(async () => { await signOut(); }, 220);
  };

  const openScanner = async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        setAlert({ visible: true, title: 'Permiso denegado', message: 'Se necesita permiso de cámara para escanear el RUT.', type: 'error' });
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
    buscarCamionero(rutFormateado);
  };

  const formatRutInput = (text: string) => {
    const sanitized = text.replace(/[^0-9kK]/g, '').toUpperCase().slice(0, 9);
    setRut(sanitized);
  };

  const buscarCamionero = async (rutABuscar?: string) => {
    const rutFinal = cleanRut(rutABuscar || rut);
    if (!rutFinal || rutFinal.length < 8) return;

    if (!validateRut(rutFinal)) {
      setAlert({ visible: true, title: 'Error', message: 'El RUT ingresado no es válido.', type: 'error' });
      return;
    }

    setLoading(true); setCamionero(null); Keyboard.dismiss();
    try {
      const response = await api.get(`/camioneros/${rutFinal}`);
      setCamionero(response.data); setRut(formatRut(response.data.rut));
    } catch (error: any) {
      setAlert({ visible: true, title: 'Atención', message: 'Camionero no encontrado en la base de datos.', type: 'error' });
    } finally { setLoading(false); }
  };

  const registrarColacion = async () => {
    if (!camionero || !user) return;
    setLoading(true);
    try {
      const response = await api.post('/colaciones', { 
        camionero_id: camionero.id, 
        tienda_id: user.tienda_id, 
        usuario_id: user.id,
        tipo_servicio: tipoServicio 
      });
      
      setVoucherData({
        ...response.data.registro,
        camionero_nombre: camionero.nombre,
        empresa: camionero.empresa,
        tienda_nombre: user.tienda_nombre,
        tipo_servicio: tipoServicio
      });
      setShowVoucher(true);

      setCamionero(null); setRut('');
      fetchHistorial(0);
    } catch (error: any) {
      setAlert({ visible: true, title: 'Error', message: error.response?.data?.message || 'No se pudo completar el registro.', type: 'error' });
    } finally { setLoading(false); }
  };

  const generateVoucherHTML = () => {
    return `
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2C5EAD; padding-bottom: 20px; }
            .logo { width: 150px; margin-bottom: 10px; }
            h1 { color: #2C5EAD; margin: 0; font-size: 24px; }
            .details { margin-top: 30px; background: #f9f9f9; padding: 20px; border-radius: 10px; }
            .item { margin-bottom: 15px; font-size: 16px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
            .item strong { color: #555; width: 120px; display: inline-block; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #888; }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="https://serviterra.cl/wp-content/uploads/2021/04/logo-serviterra.png" class="logo" />
            <h1>Comprobante de Servicio</h1>
          </div>
          <div class="details">
            <div class="item"><strong>Camionero:</strong> ${voucherData.camionero_nombre}</div>
            <div class="item"><strong>Empresa:</strong> ${voucherData.empresa}</div>
            <div class="item"><strong>Servicio:</strong> ${voucherData.tipo_servicio}</div>
            <div class="item"><strong>Local:</strong> ${voucherData.tienda_nombre}</div>
            <div class="item"><strong>Fecha:</strong> ${voucherData.fecha}</div>
            <div class="item"><strong>Hora:</strong> ${voucherData.hora}</div>
          </div>
          <div class="footer">
            <p>Documento generado automáticamente por sistema de registro de colaciones.</p>
          </div>
        </body>
      </html>
    `;
  };

  const handlePrint = async () => {
    await Print.printAsync({ html: generateVoucherHTML() });
  };

  const handleShare = async () => {
    const { uri } = await Print.printToFileAsync({ html: generateVoucherHTML() });
    await Sharing.shareAsync(uri);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <View style={styles.headerLogoSection}>
          <Image source={require('../../assets/serviterra.jpg')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.local}>{nombreLocal}</Text>
        </View>
        <TouchableOpacity onPress={openLogoutModal} style={styles.logoutBtn} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <LogOut color="#FF3B30" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody} keyboardShouldPersistTaps="handled">
        <Text style={styles.welcome}>Hola, {nombreUsuario}</Text>
        <Text style={styles.instructions}>Ingresa el RUT o escanea el código QR</Text>
        
        <View style={styles.searchBox}>
          <TextInput 
            style={styles.input} 
            placeholder="RUT: 12.345.678-9" 
            value={rut} 
            onChangeText={formatRutInput}
            onBlur={() => setRut((current) => formatRut(cleanRut(current)))}
            placeholderTextColor="#8E8E93"
            autoCapitalize="characters"
            autoCorrect={false}
            autoComplete="off"
            textContentType="none"
            spellCheck={false}
            maxLength={12}
            selectionColor="#2C5EAD"
            cursorColor="#2C5EAD"
          />
          <TouchableOpacity style={styles.qrBtn} onPress={() => openScanner()} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <QrCode color="#2C5EAD" size={28} />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.btnSearch} onPress={() => buscarCamionero()} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Buscar Camionero</Text>}
        </TouchableOpacity>

        {camionero && (
          <View style={styles.card}>
            <View style={styles.userIconCircle}>
              <User size={40} color="#2C5EAD" />
            </View>
            <Text style={styles.name}>{camionero.nombre}</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>RUT:</Text>
              <Text style={styles.infoValue}>{camionero.rut}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Patente:</Text>
              <Text style={styles.infoValue}>{camionero.patente}</Text>
            </View>
            
            <Text style={styles.label}>Seleccionar Servicio:</Text>
            <View style={styles.pickerContainer}>
                {TIPOS_SERVICIO.map((t) => (
                <TouchableOpacity key={t} style={[styles.pickerItem, tipoServicio === t && styles.pickerItemActive]} onPress={() => setTipoServicio(t)}>
                    <Text style={[styles.pickerItemText, tipoServicio === t && styles.pickerItemTextActive]}>{t}</Text>
                </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity style={styles.btnConfirm} onPress={registrarColacion} disabled={loading}>
              <ClipboardCheck color="#fff" size={24} />
              <Text style={styles.btnConfirmText}>Registrar {tipoServicio}</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: '800', marginBottom: 10 }}>Servicios entregados recientemente</Text>
          <FlatList
            data={historial}
            scrollEnabled={false}
            keyExtractor={(item: any) => item.id.toString()}
            renderItem={({ item }: any) => (
              <View style={styles.recordCard}>
                <View style={styles.recordHeader}>
                  <Text style={styles.camioneroName}>{item.camionero_nombre}</Text>
                  <Text style={styles.timeText}>{item.tipo_servicio}</Text>
                </View>
                <View style={styles.locationRow}>
                  <MapPin size={14} color="#2C5EAD" />
                  <Text style={styles.locationText} numberOfLines={2}>{item.tienda_nombre}</Text>
                </View>
                <View style={styles.registeredRow}>
                  <Clock size={13} color="#8E8E93" />
                  <Text style={styles.registeredText}>
                    {item.fecha_registro} {item.hora_registro} hrs
                  </Text>
                </View>
              </View>
            )}
          />
        </View>
      </ScrollView>

      {role === 'admin' && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.nav} onPress={() => navigation.navigate('AdminHome')}>
            <LayoutGrid color="#2C5EAD" size={28} />
            <Text style={styles.navText}>Panel Admin</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.nav} onPress={() => navigation.navigate('RegisterAdmin')}>
            <UserPlus color="#8E8E93" size={28} />
            <Text style={styles.navTextGray}>Nueva Encargada</Text>
          </TouchableOpacity>
        </View>
      )}

      <CustomAlert 
        visible={alert.visible} 
        title={alert.title} 
        message={alert.message} 
        type={alert.type} 
        onClose={() => setAlert({ ...alert, visible: false })} 
      />

      <Modal visible={showVoucher} animationType="fade" transparent>
        <View style={[styles.modalOverlay, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <View style={styles.voucherCard}>
                <Text style={styles.voucherTitle}>Comprobante de Registro</Text>
                {voucherData && (
                    <View style={styles.voucherBody}>
                        <Text style={styles.voucherText}>Camionero: {voucherData.camionero_nombre}</Text>
                        <Text style={styles.voucherText}>Empresa: {voucherData.empresa}</Text>
                        <Text style={styles.voucherText}>Servicio: {voucherData.tipo_servicio}</Text>
                        <Text style={styles.voucherText}>Local: {voucherData.tienda_nombre}</Text>
                        <Text style={styles.voucherText}>Fecha: {voucherData.fecha}</Text>
                        <Text style={styles.voucherText}>Hora: {voucherData.hora}</Text>
                    </View>
                )}
                <View style={{ flexDirection: 'row', width: '100%', gap: 10, marginTop: 20 }}>
                    <TouchableOpacity style={[styles.closeVoucher, { flex: 1, backgroundColor: '#8E8E93' }]} onPress={() => setShowVoucher(false)}>
                        <Text style={styles.closeVoucherText}>Cerrar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.closeVoucher, { flex: 1, backgroundColor: '#2C5EAD' }]} onPress={handleShare}>
                        <Text style={styles.closeVoucherText}>Descargar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.closeVoucher, { flex: 1, backgroundColor: '#34C759' }]} onPress={handlePrint}>
                        <Text style={styles.closeVoucherText}>Imprimir</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
      </Modal>

      <Modal visible={showLogoutModal} transparent animationType="none" onRequestClose={closeLogoutModal}>
        <Animated.View style={[styles.logoutBackdrop, { opacity: logoutBackdrop }]}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={closeLogoutModal} />
        </Animated.View>
        <Animated.View style={[styles.logoutSheet, { transform: [{ translateY: logoutSlide }], paddingBottom: insets.bottom + 28 }]}>
          <View style={styles.logoutHandle} />
          <View style={styles.logoutIconWrap}>
            <LogOut size={32} color="#FF3B30" />
          </View>
          <Text style={styles.logoutTitle}>¿Cerrar sesión?</Text>
          <Text style={styles.logoutSubtitle}>Hola <Text style={{ fontWeight: '800', color: '#1C1C1E' }}>{nombreUsuario}</Text>, ¿seguro que quieres salir de <Text style={{ fontWeight: '800', color: '#2C5EAD' }}>{nombreLocal}</Text>?</Text>
          <TouchableOpacity style={styles.logoutConfirmBtn} onPress={handleLogout} activeOpacity={0.85}>
            <LogOut size={20} color="#fff" />
            <Text style={styles.logoutConfirmText}>Sí, cerrar sesión</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutCancelBtn} onPress={closeLogoutModal} activeOpacity={0.85}>
            <Text style={styles.logoutCancelText}>Cancelar</Text>
          </TouchableOpacity>
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, height: 70, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#D1D1D6', backgroundColor: '#FFFFFF', elevation: 3 },
  headerLogoSection: { height: '100%', justifyContent: 'center', paddingTop: 5 },
  logo: { width: 150, height: 40 },
  local: { color: '#2C5EAD', fontWeight: '800', fontSize: 13, marginTop: -5 },
  logoutBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'flex-end' },
  scrollBody: { padding: 24 },
  welcome: { fontSize: 26, fontWeight: '800', color: '#1C1C1E' },
  instructions: { fontSize: 16, color: '#8E8E93', marginBottom: 25, marginTop: 5 },
  searchBox: { flexDirection: 'row', backgroundColor: '#F2F2F7', paddingHorizontal: 20, height: 70, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: '#E5E5EA' },
  input: { flex: 1, fontSize: 18, color: '#1C1C1E', fontWeight: '500' },
  qrBtn: { padding: 5 },
  btnSearch: { backgroundColor: '#1C1C1E', height: 70, borderRadius: 20, marginTop: 15, alignItems: 'center', justifyContent: 'center', elevation: 2 },
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  card: { backgroundColor: '#fff', padding: 25, borderRadius: 30, marginTop: 30, alignItems: 'center', borderWidth: 1, borderColor: '#F2F2F7', elevation: 4 },
  userIconCircle: { width: 70, height: 70, borderRadius: 25, backgroundColor: '#EBF2FA', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  name: { fontSize: 22, fontWeight: '800', color: '#1C1C1E', marginBottom: 15 },
  infoRow: { flexDirection: 'row', marginBottom: 5 },
  infoLabel: { color: '#8E8E93', fontSize: 14, width: 70 },
  infoValue: { color: '#1C1C1E', fontSize: 14, fontWeight: '600' },
  btnConfirm: { backgroundColor: '#34C759', height: 65, borderRadius: 20, marginTop: 25, flexDirection: 'row', width: '100%', justifyContent: 'center', alignItems: 'center' },
  btnConfirmText: { color: '#fff', fontWeight: '800', fontSize: 18, marginLeft: 12 },
  recordCard: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#F2F2F7' },
  recordHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  camioneroName: { fontSize: 16, fontWeight: '700', color: '#1C1C1E' },
  timeText: { fontSize: 14, color: '#2C5EAD', fontWeight: '700' },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 },
  locationText: { flex: 1, fontSize: 13, color: '#8E8E93', fontWeight: '600' },
  registeredRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 },
  registeredText: { flex: 1, fontSize: 12, color: '#8E8E93', fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'space-around', padding: 15, borderTopWidth: 1, borderColor: '#F2F2F7', backgroundColor: '#F9F9F9' },
  nav: { alignItems: 'center' },
  navText: { fontSize: 12, fontWeight: '700', color: '#2C5EAD', marginTop: 4 },
  navTextGray: { fontSize: 12, fontWeight: '600', color: '#8E8E93', marginTop: 4 },
  scannerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  closeScanner: { position: 'absolute', top: 50, right: 30 },
  scannerFrame: { width: 280, height: 280, borderWidth: 4, borderColor: '#2C5EAD', borderRadius: 40 },
  scannerText: { color: '#fff', fontSize: 18, marginTop: 40, fontWeight: '800' },
  logoutBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  logoutSheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 20 },
  logoutHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E5E5EA', marginBottom: 24 },
  logoutIconWrap: { width: 64, height: 64, borderRadius: 20, backgroundColor: '#FFF2F2', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  logoutTitle: { fontSize: 22, fontWeight: '800', color: '#1C1C1E', marginBottom: 8 },
  logoutSubtitle: { fontSize: 15, color: '#8E8E93', textAlign: 'center', marginBottom: 28, lineHeight: 22 },
  logoutConfirmBtn: { width: '100%', height: 56, borderRadius: 16, backgroundColor: '#FF3B30', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 12, elevation: 3 },
  logoutConfirmText: { color: '#fff', fontSize: 17, fontWeight: '800', marginLeft: 10 },
  logoutCancelBtn: { width: '100%', height: 56, borderRadius: 16, backgroundColor: '#F2F2F7', justifyContent: 'center', alignItems: 'center' },
  logoutCancelText: { color: '#1C1C1E', fontSize: 17, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  voucherCard: { backgroundColor: '#fff', padding: 25, borderRadius: 20, width: '100%', alignItems: 'center' },
  voucherTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  voucherBody: { width: '100%', marginBottom: 20 },
  voucherText: { fontSize: 16, marginBottom: 5 },
  closeVoucher: { backgroundColor: '#2C5EAD', padding: 15, borderRadius: 20, width: '100%', alignItems: 'center' },
  closeVoucherText: { color: '#fff', fontWeight: 'bold' },
  label: { fontSize: 14, fontWeight: '700', marginBottom: 8, color: '#48484A', alignSelf: 'flex-start' },
  pickerContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15, alignSelf: 'flex-start' },
  pickerItem: { backgroundColor: '#F2F2F7', padding: 10, borderRadius: 10, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: '#E5E5EA' },
  pickerItemActive: { backgroundColor: '#2C5EAD', borderColor: '#2C5EAD' },
  pickerItemText: { color: '#48484A' },
  pickerItemTextActive: { color: '#fff', fontWeight: 'bold' },
});
