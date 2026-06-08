import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, Keyboard, Modal, Image, StatusBar, Platform, FlatList, Animated, ScrollView, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { User, ClipboardCheck, LayoutGrid, QrCode, X, LogOut, UserPlus, Clock, MapPin, Printer, Download, Store } from 'lucide-react-native';
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
  const nombrePension = user?.pension_nombre || 'ServiTerra';
  const ubicacionPension = user?.pension_ubicacion || '';
  const role = user?.rol || 'encargada';
  
  // Hook de inactividad
  useInactivityTimeout(navigation);

  // Estados principales
  const [rut, setRut] = useState('');
  const [loading, setLoading] = useState(false);
  const [trabajador, setTrabajador] = useState<any>(null);
  const [isScannerVisible, setIsScannerVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  // Historial
  const [historial, setHistorial] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const PER_PAGE = 5;

  // Servicio y Voucher
  const [tipoServicio, setTipoServicio] = useState(TIPOS_SERVICIO[0]);
  const [voucherData, setVoucherData] = useState<any>(null);
  const [showVoucher, setShowVoucher] = useState(false);
  
  // Alertas
  const [alert, setAlert] = useState<{ visible: boolean; title: string; message: string; type: 'success' | 'error' }>({ visible: false, title: '', message: '', type: 'success' });

  // Funciones de utilidad
  const handleOpenVoucherFromHistory = (item: any) => {
    setVoucherData({
      ...item,
      fecha_f: item.fecha_registro,
      hora_f: item.hora_registro
    });
    setShowVoucher(true);
  };

  const fetchHistorial = async (pageNumber: number) => {
    if (loadingHistory || !user?.pension_id) return;
    setLoadingHistory(true);
    try {
      const response = await api.get(`/colaciones?pension_id=${user.pension_id}&limit=${PER_PAGE}&offset=${pageNumber * PER_PAGE}`);
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

  useEffect(() => {
    fetchHistorial(0);
  }, []);

  // Logout modal logic
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
    buscarTrabajador(rutFormateado);
  };

  const formatRutInput = (text: string) => {
    const sanitized = text.replace(/[^0-9kK]/g, '').toUpperCase().slice(0, 9);
    setRut(sanitized);
  };

  const buscarTrabajador = async (rutABuscar?: string) => {
    const rutFinal = cleanRut(rutABuscar || rut);
    if (!rutFinal || rutFinal.length < 8) return;

    if (!validateRut(rutFinal)) {
      setAlert({ visible: true, title: 'Error', message: 'El RUT ingresado no es válido.', type: 'error' });
      return;
    }

    setLoading(true); setTrabajador(null); Keyboard.dismiss();
    try {
      const response = await api.get(`/trabajadores/${rutFinal}`);
      setTrabajador(response.data); setRut(formatRut(response.data.rut));
    } catch (error: any) {
      setAlert({ visible: true, title: 'Atención', message: 'Trabajador no encontrado en la base de datos.', type: 'error' });
    } finally { setLoading(false); }
  };

  const registrarColacion = async () => {
    if (!trabajador || !user) return;
    setLoading(true);
    try {
      const response = await api.post('/colaciones', { 
        trabajador_id: trabajador.id, 
        pension_id: user.pension_id, 
        usuario_id: user.id,
        tipo_servicio: tipoServicio 
      });
      
      setVoucherData({
        ...response.data.registro,
        trabajador_nombre: trabajador.nombre,
        trabajador_rut: trabajador.rut,
        empresa: trabajador.empresa,
        pension_nombre: user.pension_nombre,
        tipo_servicio: tipoServicio
      });
      setShowVoucher(true);

      setTrabajador(null); setRut('');
      fetchHistorial(0);
    } catch (error: any) {
      setAlert({ visible: true, title: 'Error', message: error.response?.data?.message || 'No se pudo completar el registro.', type: 'error' });
    } finally { setLoading(false); }
  };

  const generateVoucherHTML = () => {
    if (!voucherData) return '';
    return `
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica', sans-serif; padding: 30px; color: #1C1C1E; }
            .header { text-align: center; margin-bottom: 25px; border-bottom: 2px solid #2C5EAD; padding-bottom: 15px; }
            .brand-text { font-size: 28px; font-weight: 900; color: #2C5EAD; letter-spacing: -1px; margin: 0; }
            .brand-sub { font-size: 14px; font-weight: 600; color: #8E8E93; margin-top: -5px; }
            h1 { color: #1C1C1E; margin: 15px 0 0 0; font-size: 20px; text-transform: uppercase; letter-spacing: 1px; }
            .details { margin-top: 20px; background: #f2f2f7; padding: 25px; border-radius: 15px; border: 1px solid #e5e5ea; }
            .item { margin-bottom: 12px; font-size: 15px; border-bottom: 1px solid #d1d1d6; padding-bottom: 8px; display: flex; justify-content: space-between; }
            .item:last-child { border-bottom: none; }
            .item strong { color: #8E8E93; font-weight: 600; text-transform: uppercase; font-size: 11px; }
            .item span { font-weight: 700; color: #1C1C1E; text-align: right; }
            .signature-section { margin-top: 60px; display: flex; flex-direction: column; align-items: center; }
            .signature-line { width: 220px; border-top: 1.5px solid #1C1C1E; margin-bottom: 8px; }
            .signature-text { font-size: 12px; font-weight: 700; color: #1C1C1E; }
            .signature-rut { font-size: 11px; color: #8E8E93; }
            .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #aeaeb2; }
          </style>
        </head>
        <body>
          <div class="header">
            <p class="brand-text">SERVITERRA</p>
            <p class="brand-sub">Gestión de Colaciones</p>
            <h1>Voucher de Servicio</h1>
          </div>
          <div class="details">
            <div class="item"><strong>Trabajador</strong> <span>${voucherData.trabajador_nombre}</span></div>
            <div class="item"><strong>RUT</strong> <span>${voucherData.trabajador_rut || voucherData.rut}</span></div>
            <div class="item"><strong>Empresa</strong> <span>${voucherData.empresa || voucherData.trabajador_empresa || 'No especificada'}</span></div>
            <div class="item"><strong>Servicio</strong> <span>${voucherData.tipo_servicio}</span></div>
            <div class="item"><strong>Pensión</strong> <span>${voucherData.pension_nombre}</span></div>
            <div class="item"><strong>Fecha</strong> <span>${voucherData.fecha_f || voucherData.fecha_registro || voucherData.fecha}</span></div>
            <div class="item"><strong>Hora</strong> <span>${voucherData.hora_f || voucherData.hora_registro || voucherData.hora} hrs</span></div>
          </div>
          <div class="signature-section">
            <div class="signature-line"></div>
            <p class="signature-text">Firma del Transportista</p>
            <p class="signature-rut">RUT: ${voucherData.trabajador_rut || voucherData.rut}</p>
          </div>
          <div class="footer">
            <p>Este comprobante certifica la recepción del servicio mencionado.<br>Copia para control administrativo ServiTerra.</p>
          </div>
        </body>
      </html>
    `;
  };

  const handlePrint = async () => {
    try {
        await Print.printAsync({ html: generateVoucherHTML() });
    } catch (error) {
        setAlert({ visible: true, title: 'Error', message: 'No se pudo iniciar la impresión.', type: 'error' });
    }
  };

  const handleShare = async () => {
    try {
        const { uri } = await Print.printToFileAsync({ html: generateVoucherHTML() });
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf', dialogTitle: 'Descargar Voucher' });
    } catch (error) {
        setAlert({ visible: true, title: 'Error', message: 'No se pudo generar el archivo PDF.', type: 'error' });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <View style={styles.headerLogoSection}>
          <Image source={require('../../assets/serviterra.jpg')} style={styles.logo} resizeMode="contain" />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Store size={16} color="#2C5EAD" />
            <Text style={styles.local}>{nombrePension}</Text>
          </View>
          {ubicacionPension !== '' && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <MapPin size={12} color="#8E8E93" />
              <Text style={styles.locationLabel} numberOfLines={1}>{ubicacionPension}</Text>
            </View>
          )}
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
        
        <TouchableOpacity style={styles.btnSearch} onPress={() => buscarTrabajador()} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Buscar Trabajador</Text>}
        </TouchableOpacity>

        {trabajador && (
          <View style={styles.card}>
            <View style={styles.userIconCircle}>
              <User size={40} color="#2C5EAD" />
            </View>
            <Text style={styles.name}>{trabajador.nombre}</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>RUT:</Text>
              <Text style={styles.infoValue}>{trabajador.rut}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Patente:</Text>
              <Text style={styles.infoValue}>{trabajador.patente}</Text>
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
              <TouchableOpacity style={styles.recordCard} onPress={() => handleOpenVoucherFromHistory(item)} activeOpacity={0.7}>
                <View style={styles.recordHeader}>
                  <Text style={styles.trabajadorName}>{item.trabajador_nombre}</Text>
                  <Text style={styles.timeText}>{item.tipo_servicio}</Text>
                </View>
                <View style={styles.locationRow}>
                  <MapPin size={14} color="#2C5EAD" />
                  <Text style={styles.locationText} numberOfLines={2}>{item.pension_nombre}</Text>
                </View>
                <View style={styles.registeredRow}>
                  <Clock size={13} color="#8E8E93" />
                  <Text style={styles.registeredText}>
                    {item.fecha_f || item.fecha_registro || item.fecha} {item.hora_f || item.hora_registro || item.hora} hrs
                  </Text>
                </View>
              </TouchableOpacity>
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

      <Modal visible={showVoucher} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
            <View style={styles.voucherCard}>
                <View style={styles.voucherHeader}>
                  <Text style={styles.voucherBrand}>SERVITERRA</Text>
                  <Text style={styles.voucherTitle}>Comprobante de Servicio</Text>
                </View>
                
                {voucherData && (
                    <View style={styles.voucherBody}>
                        <View style={styles.voucherRow}>
                          <Text style={styles.voucherLabel}>TRABAJADOR</Text>
                          <Text style={styles.voucherValue}>{voucherData.trabajador_nombre}</Text>
                        </View>
                        <View style={styles.voucherRow}>
                          <Text style={styles.voucherLabel}>RUT</Text>
                          <Text style={styles.voucherValue}>{voucherData.trabajador_rut || voucherData.rut}</Text>
                        </View>
                        <View style={styles.voucherRow}>
                          <Text style={styles.voucherLabel}>EMPRESA</Text>
                          <Text style={styles.voucherValue}>{voucherData.empresa || voucherData.trabajador_empresa || 'No especificada'}</Text>
                        </View>
                        <View style={styles.voucherRow}>
                          <Text style={styles.voucherLabel}>SERVICIO</Text>
                          <Text style={[styles.voucherValue, {color: '#2C5EAD'}]}>{voucherData.tipo_servicio}</Text>
                        </View>
                        <View style={styles.voucherRow}>
                          <Text style={styles.voucherLabel}>PENSIÓN</Text>
                          <Text style={styles.voucherValue}>{voucherData.pension_nombre}</Text>
                        </View>
                        <View style={styles.voucherRow}>
                          <Text style={styles.voucherLabel}>FECHA</Text>
                          <Text style={styles.voucherValue}>{voucherData.fecha_f || voucherData.fecha_registro || voucherData.fecha}</Text>
                        </View>
                        <View style={styles.voucherRow}>
                          <Text style={styles.voucherLabel}>HORA</Text>
                          <Text style={styles.voucherValue}>{voucherData.hora_f || voucherData.hora_registro || voucherData.hora} hrs</Text>
                        </View>

                        <View style={styles.voucherSignatureArea}>
                          <View style={styles.signatureLine} />
                          <Text style={styles.signatureText}>Firma Transportista</Text>
                        </View>
                    </View>
                )}
                
                <View style={styles.voucherActions}>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#F2F2F7' }]} onPress={() => setShowVoucher(false)}>
                        <X color="#8E8E93" size={20} />
                        <Text style={[styles.actionBtnText, { color: '#8E8E93' }]}>Cerrar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#EBF2FA' }]} onPress={handleShare}>
                        <Download color="#2C5EAD" size={20} />
                        <Text style={[styles.actionBtnText, { color: '#2C5EAD' }]}>PDF</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#2C5EAD' }]} onPress={handlePrint}>
                        <Printer color="#fff" size={20} />
                        <Text style={[styles.actionBtnText, { color: '#fff' }]}>Imprimir</Text>
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
          <Text style={styles.logoutSubtitle}>Hola <Text style={{ fontWeight: '800', color: '#1C1C1E' }}>{nombreUsuario}</Text>, ¿seguro que quieres salir de <Text style={{ fontWeight: '800', color: '#2C5EAD' }}>{nombrePension}</Text>?</Text>
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
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    minHeight: 90, 
    paddingTop: 10,
    paddingBottom: 10,
    alignItems: 'center', 
    borderBottomWidth: 1, 
    borderBottomColor: '#D1D1D6', 
    backgroundColor: '#FFFFFF', 
    elevation: 3 
  },
  headerLogoSection: { flex: 1, justifyContent: 'center', marginRight: 10 },
  logo: { width: 150, height: 40 },
  local: { color: '#2C5EAD', fontWeight: '800', fontSize: 13 },
  locationLabel: { fontSize: 11, color: '#8E8E93', fontWeight: '600', flex: 1 },
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
  trabajadorName: { fontSize: 16, fontWeight: '700', color: '#1C1C1E' },
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
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  voucherCard: { backgroundColor: '#fff', borderRadius: 24, width: '100%', maxWidth: 400, overflow: 'hidden', elevation: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 15 },
  voucherHeader: { backgroundColor: '#F8F9FA', padding: 20, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  voucherBrand: { fontSize: 24, fontWeight: '900', color: '#2C5EAD', letterSpacing: 1 },
  voucherTitle: { fontSize: 14, fontWeight: '700', color: '#8E8E93', textTransform: 'uppercase', marginTop: 4 },
  voucherBody: { padding: 24 },
  voucherRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14, borderBottomWidth: 1, borderBottomColor: '#F2F2F7', paddingBottom: 8 },
  voucherLabel: { fontSize: 11, fontWeight: '800', color: '#AEAEB2', width: '30%' },
  voucherValue: { fontSize: 15, fontWeight: '700', color: '#1C1C1E', flex: 1, textAlign: 'right' },
  voucherSignatureArea: { marginTop: 30, alignItems: 'center', paddingTop: 20 },
  signatureLine: { width: 180, height: 1.5, backgroundColor: '#1C1C1E', marginBottom: 8 },
  signatureText: { fontSize: 12, fontWeight: '600', color: '#8E8E93' },
  voucherActions: { flexDirection: 'row', gap: 10, padding: 20, backgroundColor: '#F8F9FA' },
  actionBtn: { flex: 1, height: 50, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  actionBtnText: { fontSize: 14, fontWeight: '800' },
  label: { fontSize: 14, fontWeight: '700', marginBottom: 8, color: '#48484A', alignSelf: 'flex-start' },
  pickerContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15, alignSelf: 'flex-start' },
  pickerItem: { backgroundColor: '#F2F2F7', padding: 10, borderRadius: 10, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: '#E5E5EA' },
  pickerItemActive: { backgroundColor: '#2C5EAD', borderColor: '#2C5EAD' },
  pickerItemText: { color: '#48484A' },
  pickerItemTextActive: { color: '#fff', fontWeight: 'bold' },
});