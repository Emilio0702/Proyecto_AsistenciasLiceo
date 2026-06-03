import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, TextInput, Image, Linking, Alert, StatusBar, Platform, ScrollView, Modal, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Clock, Store, Search, UserPlus, Truck, Download, LogOut, Settings, ChevronRight, Filter, X, Utensils } from 'lucide-react-native';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const serviterraLogo = require('../../assets/serviterra.jpg');

export default function AdminHomeScreen({ navigation }: any) {
  const { user, signOut } = useAuth();
  const nombreUsuario = user?.nombre || 'Admin';
  const [registros, setRegistros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(0);
  const [searchText, setSearchText] = useState('');
  
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [tiendas, setTiendas] = useState<any[]>([]);
  const [selectedTienda, setSelectedTienda] = useState('');
  const [activeDateFilter, setActiveDateFilter] = useState('');
  
  const PER_PAGE = 10;

  useEffect(() => {
    fetchTiendas();
  }, []);

  const fetchTiendas = async () => {
    try {
      const response = await api.get('/tiendas');
      setTiendas(response.data);
    } catch (error) {
      console.error('Error fetching tiendas:', error);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchRegistros(0);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchText, fechaInicio, fechaFin, selectedTienda]);

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
      const tiendaQuery = selectedTienda ? `&tienda_id=${selectedTienda}` : '';
      const response = await api.get(`/colaciones?limit=${PER_PAGE}&offset=${pageNumber * PER_PAGE}&search=${searchText}&fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}${tiendaQuery}`);
      const newData = response.data.data || [];
      if (pageNumber === 0) setRegistros(newData);
      else setRegistros([...(registros || []), ...newData]);
      setTotalRecords(response.data.total || 0);
      setPage(pageNumber);
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
              onPress={() => navigation.navigate('RegisterCamionero')}
              activeOpacity={0.7}
            >
              <View style={[styles.miniIcon, {backgroundColor: '#EBF2FA'}]}>
                <Truck size={24} color="#2C5EAD" />
              </View>
              <View style={styles.manageTextContainer}>
                <Text style={styles.manageText}>Nuevo Camionero</Text>
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
              <Filter size={18} color={isFilterExpanded ? "#2C5EAD" : "#8E8E93"} />
              <Text style={[styles.filterToggleText, isFilterExpanded && { color: "#2C5EAD", fontWeight: '700' }]}>Filtros</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.searchBar}>
            <Search size={18} color="#8E8E93" />
            <TextInput 
              style={styles.searchInput} 
              placeholder="Buscar por rut, patente, camionero o tienda..." 
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

              <Text style={[styles.filterLabel, { marginTop: 15 }]}>Filtrar por Tienda</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tiendasScroll} contentContainerStyle={{ gap: 10 }}>
                <TouchableOpacity 
                  style={[styles.quickFilterBtn, selectedTienda === '' && styles.quickFilterBtnActive]} 
                  onPress={() => setSelectedTienda('')}
                >
                  <Text style={[styles.quickFilterText, selectedTienda === '' && styles.quickFilterTextActive]}>Todas</Text>
                </TouchableOpacity>
                {tiendas.map((t: any) => (
                  <TouchableOpacity 
                    key={t.id.toString()}
                    style={[styles.quickFilterBtn, selectedTienda === t.id.toString() && styles.quickFilterBtnActive]} 
                    onPress={() => setSelectedTienda(t.id.toString())}
                  >
                    <Text style={[styles.quickFilterText, selectedTienda === t.id.toString() && styles.quickFilterTextActive]}>{t.nombre}</Text>
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
              {(fechaInicio !== '' || fechaFin !== '' || selectedTienda !== '' || activeDateFilter !== '') && (
                <TouchableOpacity style={styles.clearFiltersBtn} onPress={() => { setDateFilter('todos'); setSelectedTienda(''); }}>
                  <Text style={styles.clearFiltersText}>Limpiar todos los filtros</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {loading && (registros?.length || 0) === 0 ? (
            <ActivityIndicator size="large" color="#2C5EAD" style={{ marginTop: 20 }} />
          ) : (
            (registros || []).map((item: any) => (
              <View key={item.id.toString()} style={styles.recordCard}>
                <View style={styles.recordHeader}>
                  <View style={styles.userRow}>
                    <View style={styles.avatarMini}><User size={14} color="#2C5EAD" /></View>
                    <Text style={styles.camioneroName}>{item.camionero_nombre}</Text>
                  </View>
                  <View style={[styles.statusTag, {backgroundColor: '#EBF2FA'}]}>
                    <Text style={[styles.statusText, {color: '#2C5EAD'}]}>{item.tipo_servicio}</Text>
                  </View>
                </View>
                <View style={styles.recordFooter}>
                  <View style={styles.footerItem}>
                    <Store size={14} color="#8E8E93" />
                    <Text style={styles.footerText} numberOfLines={2}>{item.tienda_nombre}</Text>
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
              </View>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { 
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
  tiendasScroll: { flexDirection: 'row', paddingVertical: 2 },
  dateInputsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dateInput: { flex: 0.48, backgroundColor: '#fff', height: 45, borderRadius: 10, paddingHorizontal: 10, borderWidth: 1, borderColor: '#E5E5EA', fontSize: 14 },
  clearFiltersBtn: { marginTop: 15, alignSelf: 'flex-end' },
  clearFiltersText: { color: '#FF3B30', fontSize: 13, fontWeight: '700' },
  recordCard: { backgroundColor: '#fff', padding: 18, borderRadius: 22, marginBottom: 12, borderWidth: 1, borderColor: '#F2F2F7', elevation: 1 },
  recordHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  userRow: { flexDirection: 'row', alignItems: 'center' },
  avatarMini: { width: 28, height: 28, borderRadius: 10, backgroundColor: '#EBF2FA', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  camioneroName: { fontWeight: '700', fontSize: 16, color: '#1C1C1E' },
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
});
