import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, Image, StatusBar, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserPlus, ArrowLeft, Save, Store, MapPin, Map } from 'lucide-react-native';
import api from '../services/api';
import { CustomAlert } from '../components/CustomAlert';

export default function RegisterAdminScreen({ navigation, route }: any) {
  const [loading, setLoading] = useState(false);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pension, setPension] = useState('');

  const [ubicacionTexto, setUbicacionTexto] = useState('');
  const [latitud, setLatitud] = useState<number | null>(null);
  const [longitud, setLongitud] = useState<number | null>(null);

  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [alert, setAlert] = useState<{ visible: boolean; title: string; message: string; type: 'success' | 'error' }>({ visible: false, title: '', message: '', type: 'success' });

  useEffect(() => {
    if (route.params?.ubicacionData) {
      const { latitud: lat, longitud: lng, direccion } = route.params.ubicacionData;
      setUbicacionTexto(direccion);
      setLatitud(lat);
      setLongitud(lng);
      navigation.setParams({ ubicacionData: undefined });
    }
  }, [route.params?.ubicacionData]);

  const registrarUsuario = async () => {
    if (!nombre || !email || !password || (!isSuperAdmin && !pension)) {
      setAlert({ visible: true, title: 'Error', message: 'Todos los datos son obligatorios.', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      let pensionId = null;

      if (!isSuperAdmin) {
        const pensionRes = await api.post('/pensiones', { 
          nombre: pension, 
          ubicacion: ubicacionTexto || undefined,
          latitud:  latitud  ?? undefined,
          longitud: longitud ?? undefined,
        });
        pensionId = pensionRes.data.id;
      }

      await api.post('/auth/register', {
        nombre,
        email,
        password,
        pension_id: pensionId,
        rol: isSuperAdmin ? 'admin' : 'encargada'
      });

      setAlert({ visible: true, title: 'Éxito', message: 'Registrado correctamente', type: 'success' });
      setTimeout(() => navigation.goBack(), 1500);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al registrar';
      setAlert({ visible: true, title: 'Error', message: message, type: 'error' });
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
            <Text style={[styles.roleToggleText, !isSuperAdmin && styles.roleToggleTextActive]}>Encargada</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.roleToggleButton, isSuperAdmin && styles.roleToggleActive]} 
            onPress={() => setIsSuperAdmin(true)}
          >
            <Text style={[styles.roleToggleText, isSuperAdmin && styles.roleToggleTextActive]}>Admin</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          {!isSuperAdmin && (
            <>
              <Text style={styles.label}>Nombre de la Pensión</Text>
              <TextInput style={styles.input} value={pension} onChangeText={setPension} placeholder="Ej: Pensión Central" />
              
              <TouchableOpacity
                style={[styles.mapBtn, latitud !== null && styles.mapBtnSelected]}
                onPress={() => navigation.navigate('MapPicker', {
                  coordenadas: latitud !== null ? { lat: latitud, lng: longitud } : null,
                  direccion: ubicacionTexto,
                })}
              >
                <Map size={20} color={latitud !== null ? '#2C5EAD' : '#8E8E93'} />
                <Text style={[styles.mapBtnText, latitud !== null && styles.mapBtnTextSelected]}>
                  {latitud !== null ? 'Ubicación seleccionada' : 'Seleccionar en Mapa'}
                </Text>
              </TouchableOpacity>

              {ubicacionTexto !== '' && (
                <View style={styles.addressPreview}>
                  <MapPin size={14} color="#2C5EAD" />
                  <Text style={styles.addressPreviewText} numberOfLines={2}>{ubicacionTexto}</Text>
                </View>
              )}
            </>
          )}

          <Text style={styles.label}>Nombre Completo</Text>
          <TextInput style={styles.input} value={nombre} onChangeText={setNombre} placeholder="Nombre" />
          
          <Text style={styles.label}>Correo</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="correo@ejemplo.com" />
          
          <Text style={styles.label}>Contraseña</Text>
          <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry placeholder="******" />

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
  roleToggleContainer: { flexDirection: 'row', backgroundColor: '#F2F2F7', borderRadius: 15, padding: 5, marginBottom: 20 },
  roleToggleButton: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
  roleToggleActive: { backgroundColor: '#FFFFFF', elevation: 2 },
  roleToggleText: { fontSize: 14, fontWeight: '600', color: '#8E8E93' },
  roleToggleTextActive: { color: '#1C1C1E', fontWeight: '800' },
  form: { backgroundColor: '#F8F9FA', padding: 20, borderRadius: 25, borderWidth: 1, borderColor: '#E5E5EA' },
  label: { fontSize: 14, fontWeight: '700', marginBottom: 8, color: '#48484A', marginLeft: 5 },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 15, borderWidth: 1, borderColor: '#E5E5EA', fontSize: 16 },
  mapBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', height: 56, borderRadius: 15, marginBottom: 15, borderWidth: 1, borderColor: '#E5E5EA', gap: 10 },
  mapBtnSelected: { borderColor: '#2C5EAD' },
  mapBtnText: { fontSize: 15, fontWeight: '700', color: '#8E8E93' },
  mapBtnTextSelected: { color: '#2C5EAD' },
  addressPreview: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#D1D1D6', gap: 8 },
  addressPreviewText: { flex: 1, fontSize: 13, color: '#3C3C43' },
  saveButton: { backgroundColor: '#2C5EAD', height: 65, borderRadius: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 15 },
  saveText: { color: '#fff', fontWeight: '800', fontSize: 18, marginLeft: 10 },
});
