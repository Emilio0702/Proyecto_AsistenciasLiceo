import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, Animated } from 'react-native';
import { LogOut } from 'lucide-react-native';

interface LogoutModalProps {
  visible: boolean;
  nombreUsuario: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function LogoutModal({ visible, nombreUsuario, onClose, onConfirm }: LogoutModalProps) {
  const logoutSlide = useRef(new Animated.Value(300)).current;
  const logoutBackdrop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(logoutBackdrop, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(logoutSlide, { toValue: 0, tension: 65, friction: 10, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(logoutBackdrop, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(logoutSlide, { toValue: 300, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, logoutBackdrop, logoutSlide]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(logoutBackdrop, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(logoutSlide, { toValue: 300, duration: 200, useNativeDriver: true }),
    ]).start(() => onClose());
  };

  const handleConfirm = () => {
    Animated.parallel([
      Animated.timing(logoutBackdrop, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(logoutSlide, { toValue: 300, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      onClose();
      setTimeout(() => { onConfirm(); }, 50);
    });
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <Animated.View style={[styles.logoutBackdrop, { opacity: logoutBackdrop }]}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={handleClose} />
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
        <TouchableOpacity style={styles.logoutConfirmBtn} onPress={handleConfirm} activeOpacity={0.85}>
          <LogOut size={20} color="#fff" />
          <Text style={styles.logoutConfirmText}>Sí, cerrar sesión</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutCancelBtn} onPress={handleClose} activeOpacity={0.85}>
          <Text style={styles.logoutCancelText}>Cancelar</Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  logoutBackdrop: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: 'rgba(0,0,0,0.45)' 
  },
  logoutSheet: { 
    position: 'absolute', 
    bottom: 0, left: 0, right: 0, 
    backgroundColor: '#fff', 
    borderTopLeftRadius: 28, 
    borderTopRightRadius: 28, 
    padding: 28, 
    paddingBottom: 40, 
    alignItems: 'center', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: -4 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 20, 
    elevation: 20 
  },
  logoutHandle: { 
    width: 40, 
    height: 4, 
    borderRadius: 2, 
    backgroundColor: '#E5E5EA', 
    marginBottom: 24 
  },
  logoutIconWrap: { 
    width: 64, 
    height: 64, 
    borderRadius: 20, 
    backgroundColor: '#FFF2F2', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 16 
  },
  logoutTitle: { 
    fontSize: 22, 
    fontWeight: '800', 
    color: '#1C1C1E', 
    marginBottom: 8 
  },
  logoutSubtitle: { 
    fontSize: 15, 
    color: '#8E8E93', 
    textAlign: 'center', 
    marginBottom: 28, 
    lineHeight: 22 
  },
  logoutConfirmBtn: { 
    width: '100%', 
    height: 56, 
    borderRadius: 16, 
    backgroundColor: '#FF3B30', 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 12, 
    elevation: 3 
  },
  logoutConfirmText: { 
    color: '#fff', 
    fontSize: 17, 
    fontWeight: '800', 
    marginLeft: 10 
  },
  logoutCancelBtn: { 
    width: '100%', 
    height: 56, 
    borderRadius: 16, 
    backgroundColor: '#F2F2F7', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  logoutCancelText: { 
    color: '#1C1C1E', 
    fontSize: 17, 
    fontWeight: '700' 
  },
});
