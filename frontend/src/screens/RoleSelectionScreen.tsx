import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image, StatusBar, Platform } from 'react-native';
import { User, ShieldCheck } from 'lucide-react-native';

export default function RoleSelectionScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/serviterra.jpg')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.subtitle}>Gestión de Colaciones</Text>
        </View>

        <Text style={styles.title}>Selecciona tu Rol</Text>
        
        <TouchableOpacity 
          style={styles.card} 
          onPress={() => navigation.navigate('EncargadaLogin')}
        >
          <View style={[styles.iconCircle, { backgroundColor: '#EBF2FA' }]}>
            <User size={40} color="#2C5EAD" />
          </View>
          <Text style={styles.cardText}>Atención / Encargada</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card} 
          onPress={() => navigation.navigate('AdminLogin')}
        >
          <View style={[styles.iconCircle, { backgroundColor: '#F2F2F7' }]}>
            <ShieldCheck size={40} color="#1C1C1E" />
          </View>
          <Text style={styles.cardText}>Administrador</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, justifyContent: 'center', padding: 24 },
  logoContainer: { alignItems: 'center', marginBottom: 50 },
  logo: { width: 250, height: 80 },
  subtitle: { fontSize: 16, color: '#8E8E93', fontWeight: '500', marginTop: -10 },
  title: { fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 30, color: '#1C1C1E' },
  card: { backgroundColor: '#fff', padding: 25, borderRadius: 25, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#F2F2F7', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10 },
  iconCircle: { width: 80, height: 80, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  cardText: { fontSize: 18, fontWeight: '700', color: '#1C1C1E' }
});
