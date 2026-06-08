import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, TextInput, Image, Linking, Alert, StatusBar, Platform, ScrollView, Modal, Animated } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { User, Clock, Store, Search, UserPlus, Truck, Download, LogOut, Settings, ChevronRight, Filter, X, Utensils, Printer } from 'lucide-react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CustomAlert } from '../components/CustomAlert';

const serviterraLogo = require('../../assets/serviterra.jpg');

export default function AdminHomeScreen({ navigation }: any) {
  const { user, signOut } = useAuth();
  const { top: topInset, bottom: bottomInset } = useSafeAreaInsets();
  const nombreUsuario = user?.nombre || 'Admin';
  
  const [registros, setRegistros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(0);
  const [searchText, setSearchText] = useState('');
  
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [pensiones, setPensiones] = useState<any[]>([]);
  const [selectedPension, setSelectedPension] = useState('');
  const [activeDateFilter, setActiveDateFilter] = useState('');
  
  const [voucherData, setVoucherData] = useState<any>(null);
  const [showVoucher, setShowVoucher] = useState(false);
  const [alert, setAlert] = useState<{ visible: boolean; title: string; message: string; type: 'success' | 'error' }>({ visible: false, title: '', message: '', type: 'success' });

  const PER_PAGE = 10;

  // Logout modal
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

  const handleLogout = () => {
    closeLogoutModal();
    setTimeout(async () => { await signOut(); }, 220);
  };

  useEffect(() => {
    fetchPensiones();
  }, []);

  const fetchPensiones = async () => {
    try {
      const response = await api.get('/pensiones');
      setPensiones(response.data);
    } catch (error) {
      console.error('Error fetching pensiones:', error);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchRegistros(0);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchText, fechaInicio, fechaFin, selectedPension]);

  const setDateFilter = (filterType: string) => {
    setActiveDateFilter(filterType);
    const today = new Date();
    
    if (filterType === 'hoy') {
      const todayStr = today.toISOString().split('T')[0];
      setFechaInicio(todayStr);
      setFechaFin(todayStr);
    } else if (filterType === 'mes') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
      setFechaInicio(firstDay);
      setFechaFin(lastDay);
    } else if (filterType === 'año') {
      const firstDay = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
      const lastDay = new Date(today.getFullYear(), 11, 31).toISOString().split('T')[0];
      setFechaInicio(firstDay);
      setFechaFin(lastDay);
    } else {
      setFechaInicio('');
      setFechaFin('');
    }
  };

  const fetchRegistros = async (pageNumber: number) => {
    if (pageNumber === 0) setLoading(true);
    try {
      const pensionQuery = selectedPension ? `&pension_id=${selectedPension}` : '';
      const response = await api.get(`/colaciones?limit=${PER_PAGE}&offset=${pageNumber * PER_PAGE}&search=${searchText}&fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}${pensionQuery}`);
      const newData = response.data.data || [];
      if (pageNumber === 0) setRegistros(newData);
      else setRegistros([...(registros || []), ...newData]);
      setTotalRecords(response.data.total || 0);
      pageNumber === 0 ? setPage(0) : setPage(pageNumber);
    } catch (error) {
      console.error(error);
    } finally {
      if (pageNumber === 0) setLoading(false);
    }
  };

  const handleDownloadExcel = () => {
    const url = `${api.defaults.baseURL}/colaciones/reporte/excel`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'No se pudo abrir el enlace de descarga.');
    });
  };

  const handleOpenVoucherFromHistory = (item: any) => {
    setVoucherData({
      ...item,
      fecha_f: item.fecha_registro,
      hora_f: item.hora_registro
    });
    setShowVoucher(true);
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
            <div class="item"><strong>RUT</strong> <span>${voucherData.trabajador_rut}</span></div>
            <div class="item"><strong>Empresa</strong> <span>${voucherData.trabajador_empresa || 'No especificada'}</span></div>
            <div class="item"><strong>Servicio</strong> <span>${voucherData.tipo_servicio}</span></div>
            <div class="item"><strong>Pensión</strong> <span>${voucherData.pension_nombre}</span></div>
            <div class="item"><strong>Fecha</strong> <span>${voucherData.fecha_f}</span></div>
            <div class="item"><strong>Hora</strong> <span>${voucherData.hora_f} hrs</span></div>
          </div>
          <div class="signature-section">
            <div class="signature-line"></div>
            <p class="signature-text">Firma del Trabajador</p>
            <p class="signature-rut">RUT: ${voucherData.trabajador_rut}</p>
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
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Image source={serviterraLogo} style={styles.logo} resizeMode="contain" />
          <TouchableOpacity onPress={openLogoutModal} style={styles.logoutBtn}>
            <LogOut color="#FF3B30" size={24} />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>Panel Administrativo</Text>
        <Text style={styles.headerSub}>Bienvenido, {nombreUsuario}</Text>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => fetchRegistros(0)} colors={['#2C5EAD']} />}
      >
        {/* SECCIÓN DE GESTIÓN RÁPIDA */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Settings size={20} color="#1C1C1E" />
            <Text style={styles.sectionTitle}>Gestión de Personal</Text>
          </View>
          
          <View style={styles.managementGrid}>
            <TouchableOpacity 
              style={styles.manageCard} 
              onPress={() => navigation.navigate('RegisterTrabajador')}
              activeOpacity={0.7}
            >
              <View style={[styles.miniIcon, {backgroundColor: '#EBF2FA'}]}>
                <Truck size={24} color="#2C5EAD" />
              </View>
              <View style={styles.manageTextContainer}>
                <Text style={styles.manageText}>Nuevo Trabajador</Text>
                <Text style={styles.manageSubtext}>Registrar conductor y patente</Text>
              </View>
              <ChevronRight size={20} color="#C7C7CC" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.manageCard} 
              onPress={() => navigation.navigate('RegisterAdmin')}
              activeOpacity={0.7}
            >
              <View style={[styles.miniIcon, {backgroundColor: '#F2F2F7'}]}>
                <UserPlus size={24} color="#1C1C1E" />
              </View>
              <View style={styles.manageTextContainer}>
                <Text style={styles.manageText}>Nuevo Personal</Text>
                <Text style={styles.manageSubtext}>Registrar Encargada o Admin</Text>
              </View>
              <ChevronRight size={20} color="#C7C7CC" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ESTADÍSTICAS Y REPORTES */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{totalRecords}</Text>
            <Text style={styles.statLab}>Servicios Entregados Totales</Text>
          </View>
          <TouchableOpacity style={styles.excelBtn} onPress={handleDownloadExcel}>
            <Download color="#fff" size={20} />
            <Text style={styles.excelText}>Exportar Excel</Text>
          </TouchableOpacity>
        </View>

        {/* LISTADO DE REGISTROS */}
        <View style={styles.historySection}>
          <View style={styles.historyHeaderRow}>
            <Text style={styles.historyTitle}>Servicios entregados recientemente</Text>
            <TouchableOpacity style={styles.filterToggleBtn} onPress={() => setIsFilterExpanded(!isFilterExpanded)}>
              <Filter size={20} color={isFilterExpanded ? "#2C5EAD" : "#8E8E93"} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.searchBar}>
            <Search size={18} color="#8E8E93" />
            <TextInput 
              style={styles.searchInput} 
              placeholder="Buscar por rut, patente o trabajador..." 
              value={searchText} 
              onChangeText={setSearchText} 
              selectionColor="#2C5EAD"
              cursorColor="#2C5EAD"
            />
            {searchText !== '' && (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <X size={18} color="#8E8E93" />
              </TouchableOpacity>
            )}
          </View>

          {isFilterExpanded && (
            <View style={styles.filterExpandedContainer}>
              <Text style={styles.filterLabel}>Rango Rápido</Text>
              <View style={styles.quickFiltersRow}>
                <TouchableOpacity 
                  style={[styles.quickFilterBtn, activeDateFilter === 'hoy' && styles.quickFilterBtnActive]} 
                  onPress={() => setDateFilter('hoy')}
                >
                  <Text style={[styles.quickFilterText, activeDateFilter === 'hoy' && styles.quickFilterTextActive]}>Hoy</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.quickFilterBtn, activeDateFilter === 'mes' && styles.quickFilterBtnActive]} 
                  onPress={() => setDateFilter('mes')}
                >
                  <Text style={[styles.quickFilterText, activeDateFilter === 'mes' && styles.quickFilterTextActive]}>Mes</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.quickFilterBtn, activeDateFilter === 'año' && styles.quickFilterBtnActive]} 
                  onPress={() => setDateFilter('año')}
                >
                  <Text style={[styles.quickFilterText, activeDateFilter === 'año' && styles.quickFilterTextActive]}>Año</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.quickFilterBtn, activeDateFilter === 'todos' && styles.quickFilterBtnActive]} 
                  onPress={() => setDateFilter('todos')}
                >
                  <Text style={[styles.quickFilterText, activeDateFilter === 'todos' && styles.quickFilterTextActive]}>Todo</Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.filterLabel, { marginTop: 15 }]}>Filtrar por Pensión</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pensionesScroll} contentContainerStyle={{ gap: 10 }}>
                <TouchableOpacity 
                  style={[styles.quickFilterBtn, selectedPension === '' && styles.quickFilterBtnActive]} 
                  onPress={() => setSelectedPension('')}
                >
                  <Text style={[styles.quickFilterText, selectedPension === '' && styles.quickFilterTextActive]}>Todas</Text>
                </TouchableOpacity>
                {pensiones.map((p: any) => (
                  <TouchableOpacity 
                    key={p.id.toString()}
                    style={[styles.quickFilterBtn, selectedPension === p.id.toString() && styles.quickFilterBtnActive]} 
                    onPress={() => setSelectedPension(p.id.toString())}
                  >
                    <Text style={[styles.quickFilterText, selectedPension === p.id.toString() && styles.quickFilterTextActive]}>{p.nombre}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={[styles.filterLabel, { marginTop: 15 }]}>Personalizado (YYYY-MM-DD)</Text>
              <View style={styles.dateInputsRow}>
                <TextInput 
                  style={styles.dateInput} 
                  placeholder="Desde: 2026-01-01" 
                  value={fechaInicio} 
                  onChangeText={(val: string) => { setFechaInicio(val); setActiveDateFilter(''); }} 
                  selectionColor="#2C5EAD"
                  cursorColor="#2C5EAD"
                />
                <TextInput 
                  style={styles.dateInput} 
                  placeholder="Hasta: 2026-12-31" 
                  value={fechaFin} 
                  onChangeText={(val: string) => { setFechaFin(val); setActiveDateFilter(''); }} 
                  selectionColor="#2C5EAD"
                  cursorColor="#2C5EAD"
                />
              </View>
              {(fechaInicio !== '' || fechaFin !== '' || selectedPension !== '' || activeDateFilter !== '') && (
                <TouchableOpacity style={styles.clearFiltersBtn} onPress={() => { setDateFilter('todos'); setSelectedPension(''); }}>
                  <Text style={styles.clearFiltersText}>Limpiar todos los filtros</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {loading && (registros?.length || 0) === 0 ? (
            <ActivityIndicator size="large" color="#2C5EAD" style={{ marginTop: 20 }} />
          ) : (
            (registros || []).map((item: any) => (
              <TouchableOpacity key={item.id.toString()} style={styles.recordCard} onPress={() => handleOpenVoucherFromHistory(item)} activeOpacity={0.7}>
                <View style={styles.recordHeader}>
                  <View style={styles.userRow}>
                    <View style={styles.avatarMini}><User size={14} color="#2C5EAD" /></View>
                    <Text style={styles.trabajadorName}>{item.trabajador_nombre}</Text>
                  </View>
                  <View style={[styles.statusTag, {backgroundColor: '#EBF2FA'}]}>
                    <Text style={[styles.statusText, {color: '#2C5EAD'}]}>{item.tipo_servicio}</Text>
                  </View>
                </View>
                <View style={styles.recordFooter}>
                  <View style={styles.footerItem}>
                    <Store size={14} color="#8E8E93" />
                    <Text style={styles.footerText} numberOfLines={2}>{item.pension_nombre}</Text>
                  </View>
                  <View style={styles.footerItem}>
                    <Clock size={14} color="#8E8E93" />
                    <Text style={styles.footerTextTime}>
                      {item.hora_registro || item.hora?.substring(0, 5)} hrs
                    </Text>
                    <Text style={styles.footerTextDate}>
                      {item.fecha_registro || item.fecha?.substring(0, 10)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}

          {(registros?.length || 0) < totalRecords && !loading && (
            <TouchableOpacity style={{ alignSelf: 'center', marginTop: 15 }} onPress={() => fetchRegistros(page + 1)}>
              <Text style={{ color: '#2C5EAD', fontWeight: 'bold' }}>Cargar más ({(registros?.length || 0)} de {totalRecords})</Text>
            </TouchableOpacity>
          )}

          {(registros?.length || 0) === 0 && !loading && (
            <Text style={styles.emptyText}>No se encontraron registros.</Text>
          )}
        </View>
      </ScrollView>

      {/* Modal Voucher */}
      <Modal visible={showVoucher} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
            <View style={styles.voucherCard}>
                <View style={styles.voucherHeader}>
                  <Text style={styles.voucherBrand}>SERVITERRA</Text>
                  <Text style={styles.voucherTitle}>Comprobante Administrativo</Text>
                </View>
                
                {voucherData && (
                    <View style={styles.voucherBody}>
                        <View style={styles.voucherRow}>
                          <Text style={styles.voucherLabel}>TRABAJADOR</Text>
                          <Text style={styles.voucherValue}>{voucherData.trabajador_nombre}</Text>
                        </View>
                        <View style={styles.voucherRow}>
                          <Text style={styles.voucherLabel}>RUT</Text>
                          <Text style={styles.voucherValue}>{voucherData.trabajador_rut}</Text>
                        </View>
                        <View style={styles.voucherRow}>
                          <Text style={styles.voucherLabel}>EMPRESA</Text>
                          <Text style={styles.voucherValue}>{voucherData.trabajador_empresa || 'No especificada'}</Text>
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
                          <Text style={styles.voucherValue}>{voucherData.fecha_f}</Text>
                        </View>
                        <View style={styles.voucherRow}>
                          <Text style={styles.voucherLabel}>HORA</Text>
                          <Text style={styles.voucherValue}>{voucherData.hora_f} hrs</Text>
                        </View>

                        <View style={styles.voucherSignatureArea}>
                          <View style={styles.signatureLine} />
                          <Text style={styles.signatureText}>Firma del Trabajador</Text>
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

      {/* Modal logout animado */}
      <Modal visible={showLogoutModal} transparent animationType="none" onRequestClose={closeLogoutModal}>
        <Animated.View style={[styles.logoutBackdrop, { opacity: logoutBackdrop }]}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={closeLogoutModal} />
        </Animated.View>
        <Animated.View style={[styles.logoutSheet, { transform: [{ translateY: logoutSlide }] }]}>
          <View style={styles.logoutHandle} />
          <View style={styles.logoutIconWrap}>
            <LogOut size={32} color="#FF3B30" />
          </View>
          <Text style={styles.logoutTitle}>¿Cerrar sesión?</Text>
          <Text style={styles.logoutSubtitle}>
            Hola <Text style={{ fontWeight: '800', color: '#1C1C1E' }}>{nombreUsuario}</Text>,{' '}
            ¿seguro que quieres salir del panel administrativo?
          </Text>
          <TouchableOpacity style={styles.logoutConfirmBtn} onPress={handleLogout} activeOpacity={0.85}>
            <LogOut size={20} color="#fff" />
            <Text style={styles.logoutConfirmText}>Sí, cerrar sesión</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutCancelBtn} onPress={closeLogoutModal} activeOpacity={0.85}>
            <Text style={styles.logoutCancelText}>Cancelar</Text>
          </TouchableOpacity>
        </Animated.View>
      </Modal>

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
  header: { 
    paddingTop: 10,
    paddingHorizontal: 24, 
    paddingBottom: 20, 
    borderBottomWidth: 1, 
    borderBottomColor: '#D1D1D6',
    backgroundColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  logo: { width: 130, height: 45 },
  logoutBtn: { padding: 8 },
  headerTitle: { fontSize: 26, fontWeight: '900', color: '#1C1C1E' },
  headerSub: { fontSize: 15, color: '#2C5EAD', fontWeight: '700', marginTop: 2 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 24 },
  section: { marginBottom: 30 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1C1C1E', marginLeft: 10 },
  managementGrid: { gap: 12 },
  manageCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    padding: 18, 
    borderRadius: 22, 
    borderWidth: 1, 
    borderColor: '#F2F2F7',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10
  },
  miniIcon: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  manageTextContainer: { flex: 1 },
  manageText: { fontSize: 17, fontWeight: '700', color: '#1C1C1E' },
  manageSubtext: { fontSize: 13, color: '#8E8E93', marginTop: 2 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 35 },
  statBox: { flex: 0.43, backgroundColor: '#EBF2FA', padding: 18, borderRadius: 22, justifyContent: 'center' },
  statVal: { fontSize: 26, fontWeight: '900', color: '#2C5EAD' },
  statLab: { fontSize: 12, color: '#2C5EAD', fontWeight: '700', marginTop: 2 },
  excelBtn: { flex: 0.52, backgroundColor: '#34C759', borderRadius: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, elevation: 4 },
  excelText: { color: '#fff', fontWeight: '800', marginLeft: 10, fontSize: 15 },
  historySection: { marginBottom: 20 },
  historyHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  historyTitle: { fontSize: 18, fontWeight: '800', color: '#1C1C1E' },
  filterToggleBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F2F2F7', 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    gap: 4
  },
  filterToggleText: { fontSize: 13, color: '#48484A', fontWeight: '700' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F2F2F7', paddingHorizontal: 15, height: 55, borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: '#E5E5EA' },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: '#1C1C1E' },
  filterExpandedContainer: { backgroundColor: '#F8F9FA', padding: 15, borderRadius: 16, marginBottom: 15, borderWidth: 1, borderColor: '#E5E5EA' },
  filterLabel: { fontSize: 13, fontWeight: '700', color: '#8E8E93', marginBottom: 10 },
  quickFiltersRow: { flexDirection: 'row', justifyContent: 'space-between' },
  quickFilterBtn: { flex: 1, backgroundColor: '#fff', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 10, borderWidth: 1, borderColor: '#E5E5EA', alignItems: 'center', marginRight: 5 },
  quickFilterBtnActive: { backgroundColor: '#2C5EAD', borderColor: '#2C5EAD' },
  quickFilterText: { fontSize: 13, fontWeight: '600', color: '#1C1C1E' },
  quickFilterTextActive: { color: '#fff' },
  pensionesScroll: { flexDirection: 'row', paddingVertical: 2 },
  dateInputsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dateInput: { flex: 0.48, backgroundColor: '#fff', height: 45, borderRadius: 10, paddingHorizontal: 10, borderWidth: 1, borderColor: '#E5E5EA', fontSize: 14 },
  clearFiltersBtn: { marginTop: 15, alignSelf: 'flex-end' },
  clearFiltersText: { color: '#FF3B30', fontSize: 13, fontWeight: '700' },
  recordCard: { backgroundColor: '#fff', padding: 18, borderRadius: 22, marginBottom: 12, borderWidth: 1, borderColor: '#F2F2F7', elevation: 1 },
  recordHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  userRow: { flexDirection: 'row', alignItems: 'center' },
  avatarMini: { width: 28, height: 28, borderRadius: 10, backgroundColor: '#EBF2FA', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  trabajadorName: { fontWeight: '700', fontSize: 16, color: '#1C1C1E' },
  statusTag: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '900' },
  recordFooter: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#F2F2F7', paddingTop: 12, gap: 12 },
  footerItem: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  footerText: { flex: 1, fontSize: 13, color: '#8E8E93', marginLeft: 6, fontWeight: '600' },
  footerTextTime: { fontSize: 13, color: '#8E8E93', marginLeft: 6, fontWeight: '700' },
  footerTextDate: { fontSize: 12, color: '#AEAEB2', marginLeft: 6, fontWeight: '600' },
  emptyText: { textAlign: 'center', color: '#8E8E93', marginTop: 30, fontSize: 15 },
  // Logout modal
  logoutBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  logoutSheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28, paddingBottom: 40, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 20 },
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
});