import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
  FlatList
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserData {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: string;
  token?: string;
}

interface Vehicle {
  _id: string;
  make: string;
  model: string;
  plate: string;
  year: number;
  instructor: string;
  currentOdometer: number;
  createdAt: string;
  updatedAt: string;
}

interface MileageRecord {
  _id: string;
  startOdometer: number;
  endOdometer: number;
  date: string;
  notes?: string;
  vehicleId: string;
  createdAt: string;
}

const API_BASE_URL = 'http://192.168.1.9:5000';

export default function VoziloScreen() {
  const [user, setUser] = useState<UserData | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [currentVehicle, setCurrentVehicle] = useState<Vehicle | null>(null);
  const [mileageRecords, setMileageRecords] = useState<MileageRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMileage, setIsLoadingMileage] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [newMileage, setNewMileage] = useState({
    startOdometer: '',
    endOdometer: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const router = useRouter();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      
      if (userData) {
        const parsedUser = JSON.parse(userData);
        const userWithId = {
          ...parsedUser,
          _id: parsedUser._id || parsedUser.id,
          name: parsedUser.name || 'Instruktor',
          email: parsedUser.email || 'email@primjer.com',
          role: parsedUser.role || 'instructor'
        };
        
        setUser(userWithId);
        await loadVehicles(userWithId._id);
      } else {
        Alert.alert('Greška', 'Nema podataka o korisniku');
        router.replace('/login');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Greška', 'Došlo je do greške pri učitavanju podataka');
    } finally {
      setIsLoading(false);
    }
  };

  const loadVehicles = async (userId: string) => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const parsedUser = userData ? JSON.parse(userData) : null;
      const token = parsedUser?.token;

      if (!token) {
        Alert.alert('Greška', 'Niste prijavljeni');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/vehicles`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const vehiclesData = await response.json();
        console.log('✅ Vozila učitana:', vehiclesData);
        
        setVehicles(vehiclesData);
        if (vehiclesData.length > 0) {
          setCurrentVehicle(vehiclesData[0]);
          await loadMileageRecords(vehiclesData[0]._id, token);
        }
      } else {
        const errorText = await response.text();
        console.log('❌ Greška pri učitavanju vozila:', errorText);
        Alert.alert('Greška', 'Neuspješno učitavanje vozila');
      }
    } catch (error) {
      console.error('Error loading vehicles:', error);
      Alert.alert('Greška', 'Problem s mrežom. Provjerite internet vezu.');
    }
  };

  const loadMileageRecords = async (vehicleId: string, token: string) => {
    try {
      setIsLoadingMileage(true);
      console.log('📊 Učitavam kilometražu za vozilo:', vehicleId);

      const response = await fetch(`${API_BASE_URL}/api/vehicles/${vehicleId}/mileage`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const mileageData = await response.json();
        console.log('✅ Kilometraža učitana:', mileageData);
        setMileageRecords(mileageData);
      } else {
        console.log('❌ Greška pri učitavanju kilometraže');
        setMileageRecords([]);
      }
    } catch (error) {
      console.error('Error loading mileage records:', error);
      setMileageRecords([]);
    } finally {
      setIsLoadingMileage(false);
    }
  };

  const handleAddMileage = async () => {
    if (!currentVehicle || !newMileage.startOdometer || !newMileage.endOdometer) {
      Alert.alert('Greška', 'Molimo unesite početnu i krajnju kilometražu');
      return;
    }

    const startKm = parseInt(newMileage.startOdometer);
    const endKm = parseInt(newMileage.endOdometer);

    if (isNaN(startKm) || isNaN(endKm)) {
      Alert.alert('Greška', 'Kilometraža mora biti broj');
      return;
    }

    if (endKm <= startKm) {
      Alert.alert('Greška', 'Krajnja kilometraža mora biti veća od početne');
      return;
    }

    try {
      const userData = await AsyncStorage.getItem('user');
      const parsedUser = userData ? JSON.parse(userData) : null;
      const token = parsedUser?.token;

      if (!token) {
        Alert.alert('Greška', 'Niste prijavljeni');
        return;
      }

      console.log('🚗 Dodajem kilometražu za vozilo:', currentVehicle._id);

      const response = await fetch(`${API_BASE_URL}/api/vehicles/${currentVehicle._id}/mileage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          startOdometer: startKm,
          endOdometer: endKm,
          date: newMileage.date,
          notes: newMileage.notes
        })
      });

      if (response.ok) {
        const newRecord = await response.json();
        console.log('✅ Kilometraža dodana:', newRecord);
        
        // Dodaj novi zapis na početak liste
        setMileageRecords(prev => [newRecord.mileage, ...prev]);
        
        // Ažuriraj trenutnu kilometražu vozila
        if (currentVehicle) {
          setCurrentVehicle(prev => prev ? {
            ...prev,
            currentOdometer: endKm
          } : null);
        }
        
        setModalVisible(false);
        setNewMileage({
          startOdometer: '',
          endOdometer: '',
          date: new Date().toISOString().split('T')[0],
          notes: ''
        });
        
        Alert.alert('Success', 'Kilometraža uspješno dodana!');
      } else {
        const errorText = await response.text();
        console.log('❌ Greška pri dodavanju kilometraže:', errorText);
        Alert.alert('Greška', 'Neuspješno dodavanje kilometraže');
      }
    } catch (error) {
      console.error('Error adding mileage record:', error);
      Alert.alert('Greška', 'Problem s mrežom. Provjerite internet vezu.');
    }
  };

  const calculateTotalDistance = () => {
    return mileageRecords.reduce((total, record) => {
      return total + (record.endOdometer - record.startOdometer);
    }, 0);
  };

  const getTodayDistance = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayRecord = mileageRecords.find(record => record.date === today);
    return todayRecord ? todayRecord.endOdometer - todayRecord.startOdometer : 0;
  };

  const getLastOdometer = () => {
    if (mileageRecords.length === 0) return currentVehicle?.currentOdometer || 0;
    const sortedRecords = [...mileageRecords].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return sortedRecords[0].endOdometer;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('hr-HR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const suggestStartOdometer = () => {
    const lastOdometer = getLastOdometer();
    return lastOdometer > 0 ? lastOdometer.toString() : '';
  };

  // Auto-populate start odometer when modal opens
  useEffect(() => {
    if (modalVisible) {
      setNewMileage(prev => ({
        ...prev,
        startOdometer: suggestStartOdometer()
      }));
    }
  }, [modalVisible]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2086F6" />
        <Text style={styles.loadingText}>Učitavam podatke o vozilu...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Moje Vozilo</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Vehicle Info Card */}
        {currentVehicle ? (
          <View style={styles.vehicleCard}>
            <View style={styles.vehicleHeader}>
              <View style={styles.vehicleIcon}>
                <Ionicons name="car-sport" size={32} color="#2086F6" />
              </View>
              <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleModel}>{currentVehicle.make} {currentVehicle.model}</Text>
                <Text style={styles.vehiclePlate}>{currentVehicle.plate}</Text>
                <Text style={styles.vehicleYear}>Godina: {currentVehicle.year}</Text>
              </View>
            </View>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{getTodayDistance()} km</Text>
                <Text style={styles.statLabel}>Danas</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{calculateTotalDistance()} km</Text>
                <Text style={styles.statLabel}>Ukupno</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{mileageRecords.length}</Text>
                <Text style={styles.statLabel}>Zapisa</Text>
              </View>
            </View>

            {/* Trenutna kilometraža */}
            <View style={styles.currentOdometer}>
              <Ionicons name="speedometer" size={16} color="#6B7280" />
              <Text style={styles.currentOdometerText}>
                Trenutna kilometraža: {getLastOdometer()} km
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.noVehicleCard}>
            <Ionicons name="car-outline" size={48} color="#9CA3AF" />
            <Text style={styles.noVehicleText}>Nema dodijeljenog vozila</Text>
            <Text style={styles.noVehicleSubtext}>Kontaktirajte administratora</Text>
          </View>
        )}

        {/* Quick Actions */}
        {currentVehicle && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => setModalVisible(true)}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#2086F6' }]}>
                <Ionicons name="add" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.actionText}>Dodaj Kilometražu</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => setHistoryModalVisible(true)}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#4FC377' }]}>
                <Ionicons name="list" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.actionText}>Historija</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Recent Mileage */}
        {currentVehicle && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nedavna Kilometraža</Text>
            
            {isLoadingMileage ? (
              <ActivityIndicator size="small" color="#2086F6" />
            ) : mileageRecords.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="speedometer" size={48} color="#9CA3AF" />
                <Text style={styles.emptyStateText}>Nema zapisa o kilometraži</Text>
                <Text style={styles.emptyStateSubtext}>Dodajte prvi zapis za danas</Text>
              </View>
            ) : (
              mileageRecords.slice(0, 3).map((record) => (
                <View key={record._id} style={styles.mileageItem}>
                  <View style={styles.mileageIcon}>
                    <Ionicons name="speedometer" size={20} color="#2086F6" />
                  </View>
                  <View style={styles.mileageContent}>
                    <Text style={styles.mileageDate}>{formatDate(record.date)}</Text>
                    <Text style={styles.mileageDistance}>
                      {record.startOdometer} → {record.endOdometer} km 
                      <Text style={styles.mileageTotal}> ({record.endOdometer - record.startOdometer} km)</Text>
                    </Text>
                    {record.notes && (
                      <Text style={styles.mileageNotes}>{record.notes}</Text>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* Vehicle Details */}
        {currentVehicle && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detalji Vozila</Text>
            <View style={styles.detailsCard}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Marka</Text>
                <Text style={styles.detailValue}>{currentVehicle.make}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Model</Text>
                <Text style={styles.detailValue}>{currentVehicle.model}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Registracija</Text>
                <Text style={styles.detailValue}>{currentVehicle.plate}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Godina</Text>
                <Text style={styles.detailValue}>{currentVehicle.year}</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Add Mileage Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Dodaj Kilometražu</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Početna kilometraža *</Text>
            <TextInput
              style={styles.input}
              placeholder="Unesite početnu kilometražu"
              value={newMileage.startOdometer}
              onChangeText={(text) => setNewMileage(prev => ({ ...prev, startOdometer: text }))}
              keyboardType="numeric"
            />
            
            <Text style={styles.inputLabel}>Krajnja kilometraža *</Text>
            <TextInput
              style={styles.input}
              placeholder="Unesite krajnju kilometražu"
              value={newMileage.endOdometer}
              onChangeText={(text) => setNewMileage(prev => ({ ...prev, endOdometer: text }))}
              keyboardType="numeric"
            />
            
            <Text style={styles.inputLabel}>Datum *</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={newMileage.date}
              onChangeText={(text) => setNewMileage(prev => ({ ...prev, date: text }))}
            />
            
            <Text style={styles.inputLabel}>Bilješke (opcionalno)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Dodajte bilješke o vožnji..."
              value={newMileage.notes}
              onChangeText={(text) => setNewMileage(prev => ({ ...prev, notes: text }))}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity style={styles.submitButton} onPress={handleAddMileage}>
              <Text style={styles.submitButtonText}>Spremi Kilometražu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* History Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={historyModalVisible}
        onRequestClose={() => setHistoryModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, styles.historyModal]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Povijest Kilometraže</Text>
              <TouchableOpacity onPress={() => setHistoryModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={mileageRecords}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <View style={styles.historyItem}>
                  <View style={styles.historyIcon}>
                    <Ionicons name="speedometer" size={16} color="#2086F6" />
                  </View>
                  <View style={styles.historyContent}>
                    <Text style={styles.historyDate}>{formatDate(item.date)}</Text>
                    <Text style={styles.historyDistance}>
                      {item.startOdometer} - {item.endOdometer} km 
                      <Text style={styles.historyTotal}> ({item.endOdometer - item.startOdometer} km)</Text>
                    </Text>
                    {item.notes && (
                      <Text style={styles.historyNotes}>{item.notes}</Text>
                    )}
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.emptyHistory}>
                  <Text style={styles.emptyHistoryText}>Nema zapisa o kilometraži</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#2086F6',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  vehicleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  noVehicleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 40,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  noVehicleText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 12,
    marginBottom: 4,
  },
  noVehicleSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  vehicleIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleModel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  vehiclePlate: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2086F6',
    marginBottom: 4,
  },
  vehicleYear: {
    fontSize: 14,
    color: '#6B7280',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E5E7EB',
  },
  currentOdometer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 8,
  },
  currentOdometerText: {
    fontSize: 14,
    color: '#0369A1',
    fontWeight: '500',
    marginLeft: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  mileageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  mileageIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  mileageContent: {
    flex: 1,
  },
  mileageDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  mileageDistance: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  mileageTotal: {
    fontWeight: '600',
    color: '#2086F6',
  },
  mileageNotes: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  historyModal: {
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#2086F6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  historyIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyContent: {
    flex: 1,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  historyDistance: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  historyTotal: {
    fontWeight: '600',
    color: '#2086F6',
  },
  historyNotes: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  emptyHistory: {
    alignItems: 'center',
    padding: 40,
  },
  emptyHistoryText: {
    fontSize: 16,
    color: '#6B7280',
  },
});