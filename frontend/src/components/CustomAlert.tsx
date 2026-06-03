import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { AlertCircle, CheckCircle, X } from 'lucide-react-native';

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export const CustomAlert: React.FC<CustomAlertProps> = ({ visible, title, message, type, onClose }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={[styles.iconBox, { backgroundColor: type === 'success' ? '#E7F9ED' : '#FFF2F2' }]}>
            {type === 'success' ? <CheckCircle size={32} color="#34C759" /> : <AlertCircle size={32} color="#FF3B30" />}
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <TouchableOpacity style={[styles.button, { backgroundColor: type === 'success' ? '#34C759' : '#FF3B30' }]} onPress={onClose}>
            <Text style={styles.buttonText}>Aceptar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: { backgroundColor: '#fff', padding: 25, borderRadius: 25, width: '100%', alignItems: 'center', elevation: 5 },
  iconBox: { width: 64, height: 64, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  title: { fontSize: 20, fontWeight: '800', color: '#1C1C1E', marginBottom: 10 },
  message: { fontSize: 16, color: '#48484A', textAlign: 'center', marginBottom: 25 },
  button: { width: '100%', padding: 15, borderRadius: 15, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
