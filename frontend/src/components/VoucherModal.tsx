import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal } from 'react-native';
import { X, Download, Printer } from 'lucide-react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

interface VoucherModalProps {
  visible: boolean;
  voucherData: any;
  onClose: () => void;
  setAlert: (alert: { visible: boolean; title: string; message: string; type: 'success' | 'error' }) => void;
}

export function VoucherModal({ visible, voucherData, onClose, setAlert }: VoucherModalProps) {
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
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
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
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#F2F2F7' }]} onPress={onClose}>
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
  );
}

const styles = StyleSheet.create({
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.6)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  voucherCard: { 
    backgroundColor: '#fff', 
    borderRadius: 24, 
    width: '100%', 
    maxWidth: 400, 
    overflow: 'hidden', 
    elevation: 20, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 10 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 15 
  },
  voucherHeader: { 
    backgroundColor: '#F8F9FA', 
    padding: 20, 
    alignItems: 'center', 
    borderBottomWidth: 1, 
    borderBottomColor: '#E5E5EA' 
  },
  voucherBrand: { 
    fontSize: 24, 
    fontWeight: '900', 
    color: '#2C5EAD', 
    letterSpacing: 1 
  },
  voucherTitle: { 
    fontSize: 14, 
    fontWeight: '700', 
    color: '#8E8E93', 
    textTransform: 'uppercase', 
    marginTop: 4 
  },
  voucherBody: { 
    padding: 24 
  },
  voucherRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 14, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F2F2F7', 
    paddingBottom: 8 
  },
  voucherLabel: { 
    fontSize: 11, 
    fontWeight: '800', 
    color: '#AEAEB2', 
    width: '30%' 
  },
  voucherValue: { 
    fontSize: 15, 
    fontWeight: '700', 
    color: '#1C1C1E', 
    flex: 1, 
    textAlign: 'right' 
  },
  voucherSignatureArea: { 
    marginTop: 30, 
    alignItems: 'center', 
    paddingTop: 20 
  },
  signatureLine: { 
    width: 180, 
    height: 1.5, 
    backgroundColor: '#1C1C1E', 
    marginBottom: 8 
  },
  signatureText: { 
    fontSize: 12, 
    fontWeight: '600', 
    color: '#8E8E93' 
  },
  voucherActions: { 
    flexDirection: 'row', 
    gap: 10, 
    padding: 20, 
    backgroundColor: '#F8F9FA' 
  },
  actionBtn: { 
    flex: 1, 
    height: 50, 
    borderRadius: 14, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 6 
  },
  actionBtnText: { 
    fontSize: 14, 
    fontWeight: '800' 
  },
});
