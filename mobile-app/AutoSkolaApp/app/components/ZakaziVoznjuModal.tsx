// app/components/ZakaziVoznjuModal.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const API_BASE_URL = 'http://192.168.1.9:5000';

interface Instruktor {
  _id: string;
  name: string;
  surname: string;
  email: string;
}

interface ZakaziVoznjuModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ZakaziVoznjuModal({
  visible,
  onClose,
  onSuccess
}: ZakaziVoznjuModalProps) {
  const [selectedInstruktor, setSelectedInstruktor] = useState<string>('');
  const [selectedDatum, setSelectedDatum] = useState<Date>(new Date());
  const [selectedVrijeme, setSelectedVrijeme] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [instruktori, setInstruktori] = useState<Instruktor[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Učitaj podatke kada se modal otvori
  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Greška', 'Niste prijavljeni');
        return;
      }

      console.log('🔐 Učitavam podatke...');

      // Učitaj podatke korisnika
      const userResponse = await fetch(`${API_BASE_URL}/api/users/me`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (userResponse.ok) {
        const userDetails = await userResponse.json();
        console.log('✅ User data:', userDetails);
        setUserData(userDetails);
        
        // Postavi podrazumijevanog instruktora odmah
        if (userDetails.instruktor?._id) {
          setSelectedInstruktor(userDetails.instruktor._id);
          console.log('🎯 Postavljen podrazumijevani instruktor:', userDetails.instruktor._id);
        }
      } else {
        console.log('❌ Greška pri učitavanju user podataka:', userResponse.status);
      }

      // Učitaj instruktore sa novim endpointom
      console.log('👨‍🏫 Učitavam instruktore sa /api/users/instruktori...');
      const instruktoriResponse = await fetch(`${API_BASE_URL}/api/users/instruktori`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (instruktoriResponse.ok) {
        const instruktoriData = await instruktoriResponse.json();
        console.log('✅ Instruktori učitani:', instruktoriData);
        setInstruktori(instruktoriData);
        
        // Ako nema podrazumijevanog instruktora iz userData, postavi prvog instruktora
        if (!userData?.instruktor?._id && instruktoriData.length > 0) {
          setSelectedInstruktor(instruktoriData[0]._id);
          console.log('🎯 Postavljen prvi instruktor iz liste:', instruktoriData[0]._id);
        }
      } else {
        console.log('❌ Greška pri učitavanju instruktora:', instruktoriResponse.status);
        const errorText = await instruktoriResponse.text();
        console.log('❌ Error detalji:', errorText);
      }

    } catch (error) {
      console.log('🚨 Greška pri učitavanju podataka:', error);
      Alert.alert('Greška', 'Došlo je do greške pri učitavanju podataka');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedDatum(new Date());
    setSelectedVrijeme('');
    setCurrentMonth(new Date());
    
    // Resetuj na podrazumijevanog instruktora
    if (userData?.instruktor?._id) {
      setSelectedInstruktor(userData.instruktor._id);
    } else if (instruktori.length > 0) {
      setSelectedInstruktor(instruktori[0]._id);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleZakazi = async () => {
    if (!selectedInstruktor) {
      Alert.alert('Greška', 'Molimo odaberite instruktora');
      return;
    }

    if (!selectedVrijeme) {
      Alert.alert('Greška', 'Molimo odaberite vrijeme');
      return;
    }

    // Validacija vremena
    const [sati, minute] = selectedVrijeme.split(':').map(Number);
    if (sati < 8 || sati >= 20 || minute > 59 || isNaN(minute)) {
      Alert.alert(
        'Greška', 
        'Vožnje se mogu zakazivati samo između 08:00 i 20:00 sati'
      );
      return;
    }

    // Validacija datuma (ne može u prošlost)
    const danas = new Date();
    danas.setHours(0, 0, 0, 0);
    const odabraniDatum = new Date(selectedDatum);
    odabraniDatum.setHours(0, 0, 0, 0);

    if (odabraniDatum < danas) {
      Alert.alert('Greška', 'Datum vožnje mora biti u budućnosti');
      return;
    }

    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        throw new Error('Niste prijavljeni');
      }

      // Formatiraj datum za API
      const formattedDatum = selectedDatum.toISOString().split('T')[0];

      const requestBody = {
        kandidatId: userData?._id,
        instruktorId: selectedInstruktor,
        datum: formattedDatum,
        vrijeme: selectedVrijeme
      };

      console.log('🚗 Šaljem zahtjev za zakazivanje:', requestBody);
      console.log('📡 Endpoint:', `${API_BASE_URL}/api/driving/zakazi`);

      const response = await fetch(`${API_BASE_URL}/api/driving/zakazi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📡 Status odgovora:', response.status);

      if (!response.ok) {
        let errorMessage = 'Greška pri zakazivanju';
        
        // Pokušaj pročitati error poruku
        try {
          const errorText = await response.text();
          console.log('❌ Error response:', errorText);
          
          if (errorText.includes('Cannot POST')) {
            errorMessage = 'API endpoint /api/driving/zakazi ne postoji. Kontaktirajte administratora.';
          } else if (errorText.includes('<!DOCTYPE html>')) {
            errorMessage = 'Server je vratio HTML grešku. Provjerite API endpoint.';
          } else {
            // Pokušaj parsirati kao JSON
            try {
              const errorData = JSON.parse(errorText);
              errorMessage = errorData.message || errorMessage;
            } catch {
              errorMessage = errorText || errorMessage;
            }
          }
        } catch (readError) {
          console.log('❌ Greška pri čitanju errora:', readError);
        }
        
        throw new Error(errorMessage);
      }

      // Uspješan odgovor
      const result = await response.json();
      console.log('✅ Vožnja uspješno zakazana:', result);
      
      Alert.alert('Uspeh', 'Vožnja je uspešno zakazana!');
      resetForm();
      onSuccess();
      onClose();

    } catch (error: any) {
      console.log('🚨 Greška pri zakazivanju vožnje:', error);
      Alert.alert('Greška', error.message || 'Došlo je do greške pri zakazivanju vožnje');
    } finally {
      setIsLoading(false);
    }
  };

  // Kalendar funkcije
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Prazna polja za prvi dan u mjesecu (0 = nedjelja)
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Dani u mjesecu
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      days.push(date);
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDatum.toDateString() === date.toDateString();
  };

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const formatDatumPrikaz = (date: Date) => {
    return date.toLocaleDateString('bs-BA', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getInstruktorIme = (instruktorId: string) => {
    const instruktor = instruktori.find(i => i._id === instruktorId);
    return instruktor ? `${instruktor.name} ${instruktor.surname}` : 'Odaberi instruktora';
  };

  const getSelectedInstruktor = () => {
    return instruktori.find(i => i._id === selectedInstruktor);
  };

  const calendarDays = generateCalendarDays();
  const dayNames = ['Ne', 'Po', 'Ut', 'Sr', 'Če', 'Pe', 'Su'];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerContent}>
              <Text style={styles.modalTitle}>Zakaži Vožnju</Text>
              <Text style={styles.modalSubtitle}>
                Odaberi instruktora i termin
              </Text>
            </View>
            <TouchableOpacity 
              onPress={handleClose}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Loading state */}
            {isLoading && (
              <View style={styles.loadingContainer}>
                <Ionicons name="time-outline" size={32} color="#2086F6" />
                <Text style={styles.loadingText}>Učitavam podatke...</Text>
              </View>
            )}

            {/* Odabir instruktora */}
            {!isLoading && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="person" size={20} color="#2086F6" />
                  <Text style={styles.sectionTitle}>Instruktor</Text>
                </View>
                
                {instruktori.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Ionicons name="person-outline" size={48} color="#9CA3AF" />
                    <Text style={styles.emptyStateText}>Nema dostupnih instruktora</Text>
                    <Text style={styles.emptyStateSubtext}>
                      Molimo pokušajte kasnije ili kontaktirajte administratora
                    </Text>
                  </View>
                ) : (
                  <>
                    {/* Trenutno odabrani instruktor */}
                    {selectedInstruktor && (
                      <View style={styles.selectedInstruktorCard}>
                        <View style={styles.selectedInstruktorHeader}>
                          <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                          <Text style={styles.selectedInstruktorTitle}>Odabrani instruktor</Text>
                        </View>
                        <View style={styles.selectedInstruktorInfo}>
                          <View style={styles.instruktorAvatar}>
                            <Text style={styles.instruktorInitials}>
                              {getSelectedInstruktor()?.name[0]}{getSelectedInstruktor()?.surname[0]}
                            </Text>
                          </View>
                          <View style={styles.selectedInstruktorDetails}>
                            <Text style={styles.selectedInstruktorName}>
                              {getSelectedInstruktor()?.name} {getSelectedInstruktor()?.surname}
                            </Text>
                            <Text style={styles.selectedInstruktorEmail}>
                              {getSelectedInstruktor()?.email}
                            </Text>
                          </View>
                        </View>
                        {userData?.instruktor?._id === selectedInstruktor && (
                          <View style={styles.defaultBadge}>
                            <Ionicons name="star" size={14} color="#F59E0B" />
                            <Text style={styles.defaultBadgeText}>
                              Vaš podrazumijevani instruktor
                            </Text>
                          </View>
                        )}
                      </View>
                    )}

                    {/* Lista svih instruktora */}
                    <Text style={styles.instruktoriListTitle}>Dostupni instruktori:</Text>
                    <View style={styles.instruktoriGrid}>
                      {instruktori.map((instruktor) => (
                        <TouchableOpacity
                          key={instruktor._id}
                          style={[
                            styles.instruktorCard,
                            selectedInstruktor === instruktor._id && styles.instruktorCardSelected
                          ]}
                          onPress={() => setSelectedInstruktor(instruktor._id)}
                        >
                          <View style={styles.instruktorAvatar}>
                            <Text style={styles.instruktorInitials}>
                              {instruktor.name[0]}{instruktor.surname[0]}
                            </Text>
                          </View>
                          <View style={styles.instruktorInfo}>
                            <Text style={[
                              styles.instruktorName,
                              selectedInstruktor === instruktor._id && styles.instruktorNameSelected
                            ]}>
                              {instruktor.name} {instruktor.surname}
                            </Text>
                            <Text style={styles.instruktorEmail}>
                              {instruktor.email}
                            </Text>
                          </View>
                          {selectedInstruktor === instruktor._id && (
                            <View style={styles.selectedBadge}>
                              <Ionicons name="checkmark" size={16} color="#FFF" />
                            </View>
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                )}
              </View>
            )}

            {/* Kalendar */}
            {!isLoading && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="calendar" size={20} color="#2086F6" />
                  <Text style={styles.sectionTitle}>Odaberi datum</Text>
                </View>

                <View style={styles.calendarContainer}>
                  {/* Mjesec navigacija */}
                  <View style={styles.calendarHeader}>
                    <TouchableOpacity 
                      onPress={() => navigateMonth('prev')}
                      style={styles.monthNavButton}
                    >
                      <Ionicons name="chevron-back" size={20} color="#2086F6" />
                    </TouchableOpacity>
                    
                    <Text style={styles.monthTitle}>
                      {currentMonth.toLocaleDateString('bs-BA', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </Text>
                    
                    <TouchableOpacity 
                      onPress={() => navigateMonth('next')}
                      style={styles.monthNavButton}
                    >
                      <Ionicons name="chevron-forward" size={20} color="#2086F6" />
                    </TouchableOpacity>
                  </View>

                  {/* Dani u sedmici */}
                  <View style={styles.weekDays}>
                    {dayNames.map((day, index) => (
                      <Text key={index} style={styles.weekDayText}>
                        {day}
                      </Text>
                    ))}
                  </View>

                  {/* Kalendar dani */}
                  <View style={styles.calendarGrid}>
                    {calendarDays.map((date, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.calendarDay,
                          date && isSelected(date) && styles.calendarDaySelected,
                          date && isToday(date) && styles.calendarDayToday,
                          date && isPast(date) && styles.calendarDayDisabled
                        ]}
                        onPress={() => date && !isPast(date) && setSelectedDatum(date)}
                        disabled={!date || isPast(date)}
                      >
                        {date && (
                          <>
                            <Text style={[
                              styles.calendarDayText,
                              isSelected(date) && styles.calendarDayTextSelected,
                              isToday(date) && styles.calendarDayTextToday,
                              isPast(date) && styles.calendarDayTextDisabled
                            ]}>
                              {date.getDate()}
                            </Text>
                            {isToday(date) && !isSelected(date) && (
                              <View style={styles.todayDot} />
                            )}
                          </>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Odabrani datum */}
                <View style={styles.selectedDateContainer}>
                  <Ionicons name="calendar" size={16} color="#2086F6" />
                  <Text style={styles.selectedDateText}>
                    Odabrani datum: {formatDatumPrikaz(selectedDatum)}
                  </Text>
                </View>
              </View>
            )}

            {/* Odabir vremena */}
            {!isLoading && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="time" size={20} color="#2086F6" />
                  <Text style={styles.sectionTitle}>Odaberi vrijeme</Text>
                </View>

                <View style={styles.timeGrid}>
                  {[
                    '08:00', '09:00', '10:00', '11:00', 
                    '12:00', '13:00', '14:00', '15:00',
                    '16:00', '17:00', '18:00', '19:00'
                  ].map(time => (
                    <TouchableOpacity
                      key={time}
                      style={[
                        styles.timeOption,
                        selectedVrijeme === time && styles.timeOptionSelected
                      ]}
                      onPress={() => setSelectedVrijeme(time)}
                    >
                      <Text style={[
                        styles.timeText,
                        selectedVrijeme === time && styles.timeTextSelected
                      ]}>
                        {time}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Sažetak */}
            {!isLoading && (selectedInstruktor || selectedVrijeme) && (
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Sažetak termina</Text>
                <View style={styles.summaryItems}>
                  {selectedInstruktor && (
                    <View style={styles.summaryItem}>
                      <Ionicons name="person" size={16} color="#2086F6" />
                      <Text style={styles.summaryText}>
                        {getInstruktorIme(selectedInstruktor)}
                      </Text>
                    </View>
                  )}
                  <View style={styles.summaryItem}>
                    <Ionicons name="calendar" size={16} color="#2086F6" />
                    <Text style={styles.summaryText}>
                      {formatDatumPrikaz(selectedDatum)}
                    </Text>
                  </View>
                  {selectedVrijeme && (
                    <View style={styles.summaryItem}>
                      <Ionicons name="time" size={16} color="#2086F6" />
                      <Text style={styles.summaryText}>
                        {selectedVrijeme}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={handleClose}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Otkaži</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.confirmButton,
                (!selectedInstruktor || !selectedVrijeme || instruktori.length === 0) && styles.confirmButtonDisabled
              ]}
              onPress={handleZakazi}
              disabled={!selectedInstruktor || !selectedVrijeme || instruktori.length === 0 || isLoading}
            >
              <LinearGradient
                colors={['#4FC377', '#2086F6']}
                style={styles.confirmButtonGradient}
              >
                {isLoading ? (
                  <Ionicons name="time" size={20} color="#FFF" />
                ) : (
                  <Ionicons name="car-sport" size={20} color="#FFF" />
                )}
                <Text style={styles.confirmButtonText}>
                  {isLoading ? 'Zakazivanje...' : 'Zakaži Vožnju'}
                </Text>
              </LinearGradient>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    minHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F4',
  },
  headerContent: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  closeButton: {
    padding: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  modalBody: {
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
  },
  // Selected Instruktor styles
  selectedInstruktorCard: {
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2086F6',
    marginBottom: 16,
  },
  selectedInstruktorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedInstruktorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginLeft: 8,
  },
  selectedInstruktorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedInstruktorDetails: {
    flex: 1,
    marginLeft: 12,
  },
  selectedInstruktorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  selectedInstruktorEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  instruktoriListTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
  },
  // Instruktori styles
  instruktoriGrid: {
    gap: 12,
  },
  instruktorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  instruktorCardSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2086F6',
  },
  instruktorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2086F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  instruktorInitials: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  instruktorInfo: {
    flex: 1,
  },
  instruktorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  instruktorNameSelected: {
    color: '#2086F6',
  },
  instruktorEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  selectedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2086F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  defaultBadgeText: {
    fontSize: 12,
    color: '#D97706',
    marginLeft: 4,
    fontWeight: '500',
  },
  // Kalendar styles
  calendarContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  monthNavButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginVertical: 2,
  },
  calendarDaySelected: {
    backgroundColor: '#2086F6',
  },
  calendarDayToday: {
    backgroundColor: '#EFF6FF',
  },
  calendarDayDisabled: {
    opacity: 0.3,
  },
  calendarDayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  calendarDayTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  calendarDayTextToday: {
    color: '#2086F6',
    fontWeight: 'bold',
  },
  calendarDayTextDisabled: {
    color: '#9CA3AF',
  },
  todayDot: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#2086F6',
  },
  selectedDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  selectedDateText: {
    fontSize: 14,
    color: '#1E40AF',
    fontWeight: '600',
    marginLeft: 8,
  },
  // Time styles
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: '30%',
  },
  timeOptionSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2086F6',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    textAlign: 'center',
  },
  timeTextSelected: {
    color: '#2086F6',
    fontWeight: '600',
  },
  // Summary styles
  summaryCard: {
    backgroundColor: '#F0F9FF',
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2086F6',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 12,
  },
  summaryItems: {
    gap: 8,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    fontWeight: '500',
  },
  // Footer styles
  modalFooter: {
    flexDirection: 'row',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#F1F3F4',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 18,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  confirmButton: {
    flex: 2,
    borderRadius: 16,
    overflow: 'hidden',
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});