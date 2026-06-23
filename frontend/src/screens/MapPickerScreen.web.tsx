import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MapPin } from 'lucide-react-native';

export default function MapPickerScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ─── Encabezado ─────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <ArrowLeft color="#1C1C1E" size={26} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Ubicación de la Pensión</Text>
          <Text style={styles.headerSub}>Versión Web</Text>
        </View>
      </View>

      {/* ─── Contenido Fallback Web ─────────────────────────────────────────── */}
      <View style={styles.content}>
        <MapPin size={60} color="#8E8E93" style={{ marginBottom: 20 }} />
        <Text style={styles.title}>Mapa no disponible en Web</Text>
        <Text style={styles.subtitle}>
          El selector interactivo de mapas utiliza librerías nativas de iOS y Android.
          Para usar esta función y registrar pensiones con GPS, debes descargar la aplicación móvil.
        </Text>
        
        <TouchableOpacity style={styles.goBackBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.goBackText}>Volver atrás</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F2F2F7', backgroundColor: '#fff' },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#1C1C1E' },
  headerSub: { fontSize: 12, color: '#8E8E93', marginTop: 2 },
  
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  title: { fontSize: 22, fontWeight: '800', color: '#1C1C1E', marginBottom: 15, textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#48484A', textAlign: 'center', lineHeight: 22, marginBottom: 40 },
  
  goBackBtn: { backgroundColor: '#2C5EAD', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 15, width: '100%', alignItems: 'center' },
  goBackText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
