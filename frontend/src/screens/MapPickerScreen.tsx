import React, { useState, useRef, useCallback } from 'react';
import {
  StyleSheet, View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, FlatList, Platform
} from 'react-native';
import MapView, { Marker, Region, UrlTile } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Search, CheckCircle, MapPin, X, Navigation } from 'lucide-react-native';
import * as Location from 'expo-location';

// Punto inicial del mapa: Santiago de Chile
const REGION_INICIAL: Region = {
  latitude: -33.4489,
  longitude: -70.6693,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

interface UbicacionSeleccionada {
  latitud: number;
  longitud: number;
  direccion: string;
}

export default function MapPickerScreen({ navigation, route }: any) {
  // Si venía con coordenadas previas (al editar), las usa como punto inicial
  const coordsPrevias = route.params?.coordenadas || null;

  const [ubicacion, setUbicacion] = useState<UbicacionSeleccionada | null>(
    coordsPrevias
      ? { latitud: coordsPrevias.lat, longitud: coordsPrevias.lng, direccion: route.params?.direccion || '' }
      : null
  );
  const [textoBusqueda, setTextoBusqueda] = useState('');
  const [resultadosBusqueda, setResultadosBusqueda] = useState<any[]>([]);
  const [cargandoBusqueda, setCargandoBusqueda] = useState(false);
  const [cargandoDireccion, setCargandoDireccion] = useState(false);

  const mapRef = useRef<MapView>(null);

  // ---------------------------------------------------------------------------
  // Geocodificación inversa: coordenadas → dirección en texto (Nominatim)
  // ---------------------------------------------------------------------------
  const obtenerDireccion = useCallback(async (lat: number, lng: number) => {
    setCargandoDireccion(true);
    try {
      const respuesta = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=es`,
        { headers: { 'User-Agent': 'ServiTerra-Colacion/1.0' } }
      );
      const datos = await respuesta.json();
      return datos?.display_name || 'Dirección no disponible';
    } catch {
      return 'No se pudo obtener la dirección';
    } finally {
      setCargandoDireccion(false);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Cuando el usuario toca directamente sobre el mapa
  // ---------------------------------------------------------------------------
  const alTocarMapa = useCallback(async (evento: any) => {
    const { latitude, longitude } = evento.nativeEvent.coordinate;
    setResultadosBusqueda([]);
    const direccion = await obtenerDireccion(latitude, longitude);
    setUbicacion({ latitud: latitude, longitud: longitude, direccion });
  }, [obtenerDireccion]);

  // ---------------------------------------------------------------------------
  // Buscar dirección por texto (Nominatim forward geocoding)
  // ---------------------------------------------------------------------------
  const buscarDireccion = async () => {
    if (!textoBusqueda.trim()) return;
    setCargandoBusqueda(true);
    setResultadosBusqueda([]);
    try {
      const respuesta = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(textoBusqueda)}&countrycodes=cl&limit=5&accept-language=es`,
        { headers: { 'User-Agent': 'ServiTerra-Colacion/1.0' } }
      );
      const datos = await respuesta.json();
      if (datos.length === 0) {
        Alert.alert('Sin resultados', 'No se encontraron resultados para esa dirección en Chile.');
      }
      setResultadosBusqueda(datos);
    } catch {
      Alert.alert('Error de conexión', 'Verifica tu conexión a internet e intenta nuevamente.');
    } finally {
      setCargandoBusqueda(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Seleccionar un resultado de la lista de búsqueda
  // ---------------------------------------------------------------------------
  const seleccionarResultado = (resultado: any) => {
    const lat = parseFloat(resultado.lat);
    const lng = parseFloat(resultado.lon);
    setUbicacion({ latitud: lat, longitud: lng, direccion: resultado.display_name });
    setTextoBusqueda('');
    setResultadosBusqueda([]);

    // Mover el mapa al lugar encontrado
    mapRef.current?.animateToRegion(
      { latitude: lat, longitude: lng, latitudeDelta: 0.01, longitudeDelta: 0.01 },
      800
    );
  };

  // ---------------------------------------------------------------------------
  // Usar la ubicación actual del dispositivo como punto de partida
  // ---------------------------------------------------------------------------
  const usarMiUbicacion = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permiso necesario', 
          'Para mostrar tu ubicación actual y encontrar la pensión más rápido, necesitamos acceso a tu GPS.'
        );
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = pos.coords;
      mapRef.current?.animateToRegion(
        { latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 },
        800
      );
      const direccion = await obtenerDireccion(latitude, longitude);
      setUbicacion({ latitud: latitude, longitud: longitude, direccion });
    } catch (error) {
      Alert.alert('Error', 'No logramos obtener tu ubicación actual. Asegúrate de tener el GPS activado.');
    }
  };

  // ---------------------------------------------------------------------------
  // Confirmar selección y volver a la pantalla de registro
  // ---------------------------------------------------------------------------
  const confirmarUbicacion = () => {
    if (!ubicacion) {
      Alert.alert('Atención', 'Toca el mapa para marcar la posición de la pensión.');
      return;
    }
    // Devuelve los datos al RegisterAdminScreen mediante route params
    navigation.navigate('RegisterAdmin', { ubicacionData: ubicacion });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      {/* ─── Encabezado ─────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <ArrowLeft color="#1C1C1E" size={26} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Ubicación de la Pensión</Text>
          <Text style={styles.headerSub}>Toca el mapa o busca una dirección</Text>
        </View>
        {/* Botón "Mi ubicación" */}
        <TouchableOpacity style={styles.myLocationBtn} onPress={usarMiUbicacion}>
          <Navigation size={18} color="#2C5EAD" />
        </TouchableOpacity>
      </View>

      {/* ─── Barra de búsqueda ───────────────────────────────────────────────── */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={17} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar dirección en Chile..."
            placeholderTextColor="#8E8E93"
            value={textoBusqueda}
            onChangeText={setTextoBusqueda}
            onSubmitEditing={buscarDireccion}
            returnKeyType="search"
            selectionColor="#2C5EAD"
            cursorColor="#2C5EAD"
          />
          {textoBusqueda !== '' && (
            <TouchableOpacity onPress={() => { setTextoBusqueda(''); setResultadosBusqueda([]); }}>
              <X size={16} color="#8E8E93" />
            </TouchableOpacity>
          )}
          {cargandoBusqueda
            ? <ActivityIndicator size="small" color="#2C5EAD" style={{ marginLeft: 8 }} />
            : (
              <TouchableOpacity style={styles.searchBtn} onPress={buscarDireccion}>
                <Text style={styles.searchBtnText}>Buscar</Text>
              </TouchableOpacity>
            )
          }
        </View>

        {/* Lista de resultados */}
        {resultadosBusqueda.length > 0 && (
          <View style={styles.resultsBox}>
            <FlatList
              data={resultadosBusqueda}
              keyExtractor={(_, i) => i.toString()}
              scrollEnabled={false}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={[styles.resultItem, index < resultadosBusqueda.length - 1 && styles.resultBorder]}
                  onPress={() => seleccionarResultado(item)}
                  activeOpacity={0.7}
                >
                  <MapPin size={14} color="#2C5EAD" />
                  <Text style={styles.resultText} numberOfLines={2}>{item.display_name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </View>

      {/* ─── Mapa ────────────────────────────────────────────────────────────── */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFillObject}
          initialRegion={
            ubicacion
              ? { latitude: ubicacion.latitud, longitude: ubicacion.longitud, latitudeDelta: 0.01, longitudeDelta: 0.01 }
              : REGION_INICIAL
          }
          onPress={alTocarMapa}
          showsUserLocation
          showsMyLocationButton={false}
          mapType={Platform.OS === 'android' ? 'none' : 'standard'}
        >
          <UrlTile
            urlTemplate="https://a.tile.openstreetmap.de/{z}/{x}/{y}.png"
            maximumZ={19}
            flipY={false}
          />
          {ubicacion && (
            <Marker
              coordinate={{ latitude: ubicacion.latitud, longitude: ubicacion.longitud }}
              title="Ubicación"
              pinColor="#2C5EAD"
            />
          )}
        </MapView>

        {/* Indicador de geocodificación inversa */}
        {cargandoDireccion && (
          <View style={styles.geocodingBadge}>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.geocodingText}>Obteniendo dirección...</Text>
          </View>
        )}
      </View>

      {/* ─── Panel inferior: dirección y botón confirmar ─────────────────────── */}
      <View style={styles.bottomPanel}>
        {ubicacion ? (
          <>
            <View style={styles.addressRow}>
              <MapPin size={16} color="#2C5EAD" />
              <Text style={styles.addressText} numberOfLines={3}>{ubicacion.direccion}</Text>
            </View>
            <TouchableOpacity style={styles.confirmBtn} onPress={confirmarUbicacion} activeOpacity={0.85}>
              <CheckCircle size={22} color="#fff" />
              <Text style={styles.confirmText}>Confirmar esta Ubicación</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.hintRow}>
            <MapPin size={20} color="#8E8E93" />
            <Text style={styles.hintText}>
              Toca sobre el mapa o busca una dirección para marcar el punto exacto de la tienda
            </Text>
          </View>
        )}
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F2F2F7', gap: 12 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#1C1C1E' },
  headerSub: { fontSize: 12, color: '#8E8E93', marginTop: 2 },
  myLocationBtn: { width: 40, height: 40, backgroundColor: '#EBF2FA', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },

  // Buscador
  searchContainer: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#fff', zIndex: 10 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F2F2F7', paddingHorizontal: 12, height: 48, borderRadius: 14, borderWidth: 1, borderColor: '#E5E5EA', gap: 8 },
  searchInput: { flex: 1, fontSize: 15, color: '#1C1C1E' },
  searchBtn: { backgroundColor: '#2C5EAD', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  searchBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  // Resultados
  resultsBox: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#E5E5EA', marginTop: 6, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 },
  resultItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  resultBorder: { borderBottomWidth: 1, borderBottomColor: '#F2F2F7' },
  resultText: { flex: 1, fontSize: 13, color: '#1C1C1E', lineHeight: 18 },

  // Mapa
  mapContainer: { flex: 1, position: 'relative' },
  geocodingBadge: { position: 'absolute', top: 14, alignSelf: 'center', backgroundColor: 'rgba(44,94,173,0.9)', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, gap: 8, elevation: 4 },
  geocodingText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  // Panel inferior
  bottomPanel: { backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#F2F2F7', elevation: 12, shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.08, shadowRadius: 10 },
  addressRow: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#EBF2FA', padding: 12, borderRadius: 14, marginBottom: 14, gap: 10 },
  addressText: { flex: 1, fontSize: 13, color: '#1C1C1E', lineHeight: 18 },
  confirmBtn: { backgroundColor: '#2C5EAD', height: 58, borderRadius: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, elevation: 4 },
  confirmText: { color: '#fff', fontWeight: '800', fontSize: 17 },
  hintRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, gap: 12 },
  hintText: { color: '#8E8E93', fontSize: 14, lineHeight: 20, flex: 1 },
});
