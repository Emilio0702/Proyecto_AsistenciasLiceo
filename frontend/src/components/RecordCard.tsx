import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { User, Store, Clock } from 'lucide-react-native';

interface RecordCardProps {
  item: any;
  onPress: () => void;
}

export function RecordCard({ item, onPress }: RecordCardProps) {
  return (
    <TouchableOpacity style={styles.recordCard} onPress={onPress} activeOpacity={0.7}>
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
  );
}

const styles = StyleSheet.create({
  recordCard: { 
    backgroundColor: '#fff', 
    padding: 18, 
    borderRadius: 22, 
    marginBottom: 12, 
    borderWidth: 1, 
    borderColor: '#F2F2F7', 
    elevation: 1 
  },
  recordHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  userRow: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  avatarMini: { 
    width: 28, 
    height: 28, 
    borderRadius: 10, 
    backgroundColor: '#EBF2FA', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 10 
  },
  trabajadorName: { 
    fontWeight: '700', 
    fontSize: 16, 
    color: '#1C1C1E' 
  },
  statusTag: { 
    paddingHorizontal: 10, 
    paddingVertical: 5, 
    borderRadius: 8 
  },
  statusText: { 
    fontSize: 10, 
    fontWeight: '900' 
  },
  recordFooter: { 
    flexDirection: 'row', 
    borderTopWidth: 1, 
    borderTopColor: '#F2F2F7', 
    paddingTop: 12, 
    gap: 12 
  },
  footerItem: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  footerText: { 
    flex: 1, 
    fontSize: 13, 
    color: '#8E8E93', 
    marginLeft: 6, 
    fontWeight: '600' 
  },
  footerTextTime: { 
    fontSize: 13, 
    color: '#8E8E93', 
    marginLeft: 6, 
    fontWeight: '700' 
  },
  footerTextDate: { 
    fontSize: 12, 
    color: '#AEAEB2', 
    marginLeft: 6, 
    fontWeight: '600' 
  },
});
