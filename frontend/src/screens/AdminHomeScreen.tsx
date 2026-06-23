import React, { useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, RefreshControl, TextInput, Image, Linking, Alert, StatusBar, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, UserPlus, Truck, Download, LogOut, Settings, ChevronRight, Filter, X, Calendar } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CustomAlert } from '../components/CustomAlert';
import { useAdminRecords } from '../hooks/useAdminRecords';
import { RecordCard } from '../components/RecordCard';
import { VoucherModal } from '../components/VoucherModal';
import { LogoutModal } from '../components/LogoutModal';

const serviterraLogo = require('../../assets/serviterra.jpg');

export default function AdminHomeScreen({ navigation }: any) {
  const { user, signOut } = useAuth();
  const nombreUsuario = user?.nombre || 'Admin';
  
  const {
    registros, loading, totalRecords,
    searchText, setSearchText,
    fechaInicio, setFechaInicio,
    fechaFin, setFechaFin,
    pensiones,
    selectedPension, setSelectedPension,
    activeDateFilter, setDateFilter,
    clearFilters, loadMore, fetchRegistros
  } = useAdminRecords();

  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [showPickerInicio, setShowPickerInicio] = useState(false);
  const [showPickerFin, setShowPickerFin] = useState(false);
  
  const [voucherData, setVoucherData] = useState<any>(null);
  const [showVoucher, setShowVoucher] = useState(false);
  const [alert, setAlert] = useState<{ visible: boolean; title: string; message: string; type: 'success' | 'error' }>({ visible: false, title: '', message: '', type: 'success' });

  const [showLogoutModal, setShowLogoutModal] = useState(false);

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

  const handleLogout = async () => {
    await signOut();
  };

  const getStatsLabel = () => {
    if (activeDateFilter === 'hoy') return 'Servicios de Hoy';
    if (activeDateFilter === 'mes') return 'Servicios del Mes';
    if (activeDateFilter === 'año') return 'Servicios del Año';
    if (fechaInicio || fechaFin) return 'Servicios en el rango';
    return 'Servicios Totales';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Image source={serviterraLogo} style={styles.logo} resizeMode="contain" />
          <TouchableOpacity onPress={() => setShowLogoutModal(true)} style={styles.logoutBtn}>
            <LogOut color="#FF3B30" size={24} />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>Panel Administrativo</Text>
        <Text style={styles.headerSub}>Bienvenido, {nombreUsuario}</Text>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={loading && registros.length === 0} onRefresh={() => fetchRegistros(0)} colors={['#2C5EAD']} />}
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
            <Text style={styles.statLab}>{getStatsLabel()}</Text>
          </View>
          <TouchableOpacity style={styles.excelBtn} onPress={handleDownloadExcel}>
            <Download color="#fff" size={20} />
            <Text style={styles.excelText}>Exportar Excel</Text>
          </TouchableOpacity>
        </View>

        {/* LISTADO DE REGISTROS */}
        <View style={styles.historySection}>
          <View style={styles.historyHeaderRow}>
            <Text style={styles.historyTitle}>Servicios entregados</Text>
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
                <TouchableOpacity style={[styles.quickFilterBtn, activeDateFilter === 'hoy' && styles.quickFilterBtnActive]} onPress={() => setDateFilter('hoy')}>
                  <Text style={[styles.quickFilterText, activeDateFilter === 'hoy' && styles.quickFilterTextActive]}>Hoy</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.quickFilterBtn, activeDateFilter === 'mes' && styles.quickFilterBtnActive]} onPress={() => setDateFilter('mes')}>
                  <Text style={[styles.quickFilterText, activeDateFilter === 'mes' && styles.quickFilterTextActive]}>Mes</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.quickFilterBtn, activeDateFilter === 'año' && styles.quickFilterBtnActive]} onPress={() => setDateFilter('año')}>
                  <Text style={[styles.quickFilterText, activeDateFilter === 'año' && styles.quickFilterTextActive]}>Año</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.quickFilterBtn, activeDateFilter === 'todos' && styles.quickFilterBtnActive]} onPress={() => setDateFilter('todos')}>
                  <Text style={[styles.quickFilterText, activeDateFilter === 'todos' && styles.quickFilterTextActive]}>Todo</Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.filterLabel, { marginTop: 15 }]}>Filtrar por Pensión</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pensionesScroll} contentContainerStyle={{ gap: 10 }}>
                <TouchableOpacity style={[styles.quickFilterBtn, selectedPension === '' && styles.quickFilterBtnActive]} onPress={() => setSelectedPension('')}>
                  <Text style={[styles.quickFilterText, selectedPension === '' && styles.quickFilterTextActive]}>Todas</Text>
                </TouchableOpacity>
                {pensiones.map((p: any) => (
                  <TouchableOpacity key={p.id.toString()} style={[styles.quickFilterBtn, selectedPension === p.id.toString() && styles.quickFilterBtnActive]} onPress={() => setSelectedPension(p.id.toString())}>
                    <Text style={[styles.quickFilterText, selectedPension === p.id.toString() && styles.quickFilterTextActive]}>{p.nombre}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={[styles.filterLabel, { marginTop: 15 }]}>Rango de Fecha Personalizado</Text>
              <View style={styles.dateInputsRow}>
                <TouchableOpacity style={styles.dateSelector} onPress={() => setShowPickerInicio(true)}>
                  <Calendar size={16} color="#2C5EAD" />
                  <Text style={[styles.dateSelectorText, !fechaInicio && { color: '#8E8E93' }]}>{fechaInicio || 'Fecha Inicial'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.dateSelector} onPress={() => setShowPickerFin(true)}>
                  <Calendar size={16} color="#2C5EAD" />
                  <Text style={[styles.dateSelectorText, !fechaFin && { color: '#8E8E93' }]}>{fechaFin || 'Fecha Final'}</Text>
                </TouchableOpacity>
              </View>

              {showPickerInicio && (
                <DateTimePicker
                  value={fechaInicio ? new Date(fechaInicio + 'T12:00:00') : new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    setShowPickerInicio(false);
                    if (event.type === 'set' && selectedDate) {
                      setFechaInicio(selectedDate.toISOString().split('T')[0]);
                      setDateFilter('');
                    }
                  }}
                />
              )}

              {showPickerFin && (
                <DateTimePicker
                  value={fechaFin ? new Date(fechaFin + 'T12:00:00') : new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    setShowPickerFin(false);
                    if (event.type === 'set' && selectedDate) {
                      setFechaFin(selectedDate.toISOString().split('T')[0]);
                      setDateFilter('');
                    }
                  }}
                />
              )}

              {(fechaInicio !== '' || fechaFin !== '' || selectedPension !== '' || activeDateFilter !== '') && (
                <TouchableOpacity style={styles.clearFiltersBtn} onPress={clearFilters}>
                  <Text style={styles.clearFiltersText}>Limpiar todos los filtros</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {loading && registros.length === 0 ? (
            <ActivityIndicator size="large" color="#2C5EAD" style={{ marginTop: 20 }} />
          ) : (
            registros.map((item: any) => (
              <RecordCard 
                key={item.id.toString()} 
                item={item} 
                onPress={() => handleOpenVoucherFromHistory(item)} 
              />
            ))
          )}

          {registros.length < totalRecords && !loading && (
            <TouchableOpacity style={{ alignSelf: 'center', marginTop: 15 }} onPress={loadMore}>
              <Text style={{ color: '#2C5EAD', fontWeight: 'bold' }}>Cargar más ({registros.length} de {totalRecords})</Text>
            </TouchableOpacity>
          )}

          {registros.length === 0 && !loading && (
            <Text style={styles.emptyText}>No se encontraron registros.</Text>
          )}
        </View>
      </ScrollView>

      <VoucherModal 
        visible={showVoucher}
        voucherData={voucherData}
        onClose={() => setShowVoucher(false)}
        setAlert={setAlert}
      />

      <LogoutModal 
        visible={showLogoutModal}
        nombreUsuario={nombreUsuario}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />

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
  dateInputsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  dateSelector: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    height: 48, 
    borderRadius: 12, 
    paddingHorizontal: 12, 
    borderWidth: 1, 
    borderColor: '#E5E5EA',
    gap: 8
  },
  dateSelectorText: { fontSize: 14, color: '#1C1C1E', fontWeight: '600' },
  clearFiltersBtn: { marginTop: 15, alignSelf: 'flex-end' },
  clearFiltersText: { color: '#FF3B30', fontSize: 13, fontWeight: '700' },
  emptyText: { textAlign: 'center', color: '#8E8E93', marginTop: 30, fontSize: 15 },
});