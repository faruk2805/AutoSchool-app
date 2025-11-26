import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from 'expo-constants';

const { width, height } = Dimensions.get('window');

interface Payment {
  _id: string;
  amount: number;
  purpose: string;
  date: string;
  confirmed: boolean;
  createdAt: string;
  updatedAt: string;
  user: string;
  __v?: number;
}

interface PaymentsData {
  payments: Payment[];
  totalPaid: number;
  remaining: number;
}

interface PaymentsModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
}

export default function PaymentsModal({ visible, onClose, userId }: PaymentsModalProps) {
  const [paymentsData, setPaymentsData] = useState<PaymentsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://192.168.1.9:5000';
  const TOTAL_DUE = 1300;

  useEffect(() => {
    if (visible && userId) {
      fetchPayments();
    }
  }, [visible, userId]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = await AsyncStorage.getItem("userToken");
      
      console.log('Fetching payments from:', `${API_BASE_URL}/api/payments/users/${userId}`);
      
      const response = await fetch(`${API_BASE_URL}/api/payments/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: PaymentsData = await response.json();
      console.log('Payments data received:', data);
      setPaymentsData(data);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('Greška pri učitavanju podataka o uplatama. Provjerite internet konekciju.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('hr-HR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return 'Datum nepoznat';
    }
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} KM`;
  };

  const getPaymentStatus = (payment: Payment) => {
    return payment.confirmed ? 'Potvrđeno' : 'Na čekanju';
  };

  const getStatusColor = (confirmed: boolean) => {
    return confirmed ? '#10B981' : '#F59E0B';
  };

  const getStatusIcon = (confirmed: boolean) => {
    return confirmed ? "checkmark-circle" : "time";
  };

  if (!visible) return null;

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Moja plaćanja</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.modalBody}>
          {loading ? (
            <View style={styles.centerContent}>
              <ActivityIndicator size="large" color="#2086F6" />
              <Text style={styles.loadingText}>Učitavanje podataka...</Text>
            </View>
          ) : error ? (
            <View style={styles.centerContent}>
              <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchPayments}>
                <Text style={styles.retryButtonText}>Pokušaj ponovo</Text>
              </TouchableOpacity>
            </View>
          ) : paymentsData ? (
            <View style={styles.contentContainer}>
              <ScrollView 
                style={styles.scrollView} 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                {/* Ukupni pregled */}
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryTitle}>Pregled uplata</Text>
                  
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Ukupno za uplatu:</Text>
                    <Text style={styles.summaryValue}>{formatCurrency(TOTAL_DUE)}</Text>
                  </View>
                  
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Ukupno uplaćeno:</Text>
                    <Text style={[styles.summaryValue, styles.paidValue]}>
                      {formatCurrency(paymentsData.totalPaid)}
                    </Text>
                  </View>
                  
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Preostalo za uplatu:</Text>
                    <Text style={[
                      styles.summaryValue, 
                      paymentsData.remaining > 0 ? styles.remainingValue : styles.fullyPaidValue
                    ]}>
                      {formatCurrency(paymentsData.remaining)}
                    </Text>
                  </View>
                  
                  {/* Progress bar */}
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBackground}>
                      <View 
                        style={[
                          styles.progressFill,
                          { 
                            width: `${Math.min((paymentsData.totalPaid / TOTAL_DUE) * 100, 100)}%` 
                          }
                        ]} 
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {Math.round((paymentsData.totalPaid / TOTAL_DUE) * 100)}% uplaćeno
                    </Text>
                  </View>

                  {/* Status uplate */}
                  <View style={styles.paymentStatus}>
                    <Ionicons 
                      name={paymentsData.remaining === 0 ? "checkmark-circle" : "information-circle"} 
                      size={16} 
                      color={paymentsData.remaining === 0 ? '#10B981' : '#F59E0B'} 
                    />
                    <Text style={[
                      styles.paymentStatusText,
                      { color: paymentsData.remaining === 0 ? '#10B981' : '#F59E0B' }
                    ]}>
                      {paymentsData.remaining === 0 
                        ? 'Sve uplate su izvršene' 
                        : 'Preostale uplate: ' + formatCurrency(paymentsData.remaining)
                      }
                    </Text>
                  </View>
                </View>

                {/* Lista uplata */}
                <View style={styles.paymentsList}>
                  <Text style={styles.paymentsTitle}>
                    Istorija uplata ({paymentsData.payments.length})
                  </Text>
                  
                  {paymentsData.payments.length === 0 ? (
                    <View style={styles.noPayments}>
                      <Ionicons name="receipt-outline" size={48} color="#9CA3AF" />
                      <Text style={styles.noPaymentsText}>Nema evidentiranih uplata</Text>
                      <Text style={styles.noPaymentsSubtext}>
                        Kontaktirajte administraciju za više informacija
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.paymentsContainer}>
                      {paymentsData.payments
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((payment) => (
                        <View key={payment._id} style={styles.paymentItem}>
                          <View style={styles.paymentLeft}>
                            <Ionicons 
                              name={getStatusIcon(payment.confirmed)} 
                              size={20} 
                              color={getStatusColor(payment.confirmed)} 
                            />
                            <View style={styles.paymentDetails}>
                              <Text style={styles.paymentPurpose}>{payment.purpose}</Text>
                              <View style={styles.paymentMeta}>
                                <Text style={styles.paymentDate}>
                                  {formatDate(payment.date)}
                                </Text>
                                <Text style={[
                                  styles.paymentStatusText,
                                  { color: getStatusColor(payment.confirmed) }
                                ]}>
                                  {getPaymentStatus(payment)}
                                </Text>
                              </View>
                            </View>
                          </View>
                          <View style={styles.paymentRight}>
                            <Text style={styles.paymentAmount}>
                              +{formatCurrency(payment.amount)}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </ScrollView>
            </View>
          ) : (
            <View style={styles.centerContent}>
              <Text style={styles.errorText}>Nema podataka za prikaz</Text>
            </View>
          )}
        </View>
        
        <View style={styles.modalFooter}>
          <TouchableOpacity style={styles.modalButton} onPress={onClose}>
            <Text style={styles.modalButtonText}>Zatvori</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    height: '80%', // Fiksna visina umjesto maxHeight
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    flex: 1, // Ovo će zauzeti preostali prostor
  },
  contentContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#2086F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: '#F8FAFC',
    padding: 20,
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  paidValue: {
    color: '#10B981',
  },
  remainingValue: {
    color: '#EF4444',
  },
  fullyPaidValue: {
    color: '#10B981',
  },
  progressContainer: {
    marginTop: 16,
    marginBottom: 12,
  },
  progressBackground: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  paymentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  paymentStatusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  paymentsList: {
    padding: 16,
    paddingTop: 0,
  },
  paymentsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  paymentsContainer: {
    gap: 8,
  },
  noPayments: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginHorizontal: 8,
  },
  noPaymentsText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
    marginBottom: 8,
    fontWeight: '600',
    textAlign: 'center',
  },
  noPaymentsSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  paymentDetails: {
    marginLeft: 12,
    flex: 1,
  },
  paymentPurpose: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  paymentMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  paymentRight: {
    alignItems: 'flex-end',
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
  modalFooter: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  modalButton: {
    backgroundColor: '#2086F6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: "600",
  },
});