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
  FlatList,
  RefreshControl,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

interface UserData {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: string;
  token?: string;
}

interface DrivingSession {
  _id: string;
  kandidat: {
    _id: string;
    name: string;
    surname: string;
    email: string;
  };
  instruktor: {
    _id: string;
    name: string;
    surname: string;
    email: string;
  };
  datum: string;
  vrijeme: string;
  nocna: boolean;
  status: "zakazana" | "zavrsena" | "otkazana";
  ocjena?: string;
  napomena?: string;
  zavrsna?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Student {
  _id: string;
  name: string;
  surname: string;
  email: string;
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

const API_BASE_URL = 'http://192.168.1.9:5000';

export default function InstruktorVoznjeScreen() {
  const [user, setUser] = useState<UserData | null>(null);
  const [drivingSessions, setDrivingSessions] = useState<DrivingSession[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'zakazana' | 'zavrsena' | 'otkazana'>('zakazana');
  const [selectedSession, setSelectedSession] = useState<DrivingSession | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [evaluationModalVisible, setEvaluationModalVisible] = useState(false);
  const [evaluation, setEvaluation] = useState({
    ocjena: '',
    napomena: '',
    zavrsna: false
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
        await Promise.all([
          loadDrivingSessions(userWithId._id),
          loadStudents(),
          loadVehicles(userWithId._id)
        ]);
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

  const loadDrivingSessions = async (instructorId: string) => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const parsedUser = userData ? JSON.parse(userData) : null;
      const token = parsedUser?.token;

      if (!token) {
        Alert.alert('Greška', 'Niste prijavljeni');
        return;
      }

      console.log('🔍 Učitavam vožnje za instruktora:', instructorId);

      const response = await fetch(`${API_BASE_URL}/api/driving/instruktor/${instructorId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const sessionsData = await response.json();
        console.log('✅ Vožnje instruktora učitane:', sessionsData.length);
        setDrivingSessions(sessionsData);
      } else {
        const errorText = await response.text();
        console.log('❌ Greška pri učitavanju vožnji:', errorText);
        Alert.alert('Greška', 'Neuspješno učitavanje vožnji');
      }
    } catch (error) {
      console.error('Error loading driving sessions:', error);
      Alert.alert('Greška', 'Problem s mrežom. Provjerite internet vezu.');
    }
  };

  const loadStudents = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const parsedUser = userData ? JSON.parse(userData) : null;
      const token = parsedUser?.token;

      if (!token) {
        Alert.alert('Greška', 'Niste prijavljeni');
        return;
      }

      // Koristimo users endpoint za učenike (candidate)
      const response = await fetch(`${API_BASE_URL}/api/users?role=candidate`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const studentsData = await response.json();
        console.log('✅ Učenici učitani:', studentsData.length);
        setStudents(studentsData);
      } else {
        console.log('❌ Greška pri učitavanju učenika');
      }
    } catch (error) {
      console.error('Error loading students:', error);
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
        console.log('✅ Vozila učitana:', vehiclesData.length);
        setVehicles(vehiclesData);
      } else {
        console.log('❌ Greška pri učitavanju vozila');
      }
    } catch (error) {
      console.error('Error loading vehicles:', error);
    }
  };

  const handleAddSession = async (sessionData: {
    kandidatId: string;
    datum: string;
    vrijeme: string;
    notes?: string;
  }) => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const parsedUser = userData ? JSON.parse(userData) : null;
      const token = parsedUser?.token;

      if (!token) {
        Alert.alert('Greška', 'Niste prijavljeni');
        return;
      }

      const hour = parseInt(sessionData.vrijeme.split(':')[0]);
      const nocna = hour >= 17;

      const response = await fetch(`${API_BASE_URL}/api/driving`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          kandidatId: sessionData.kandidatId,
          instruktorId: user?._id,
          datum: sessionData.datum,
          vrijeme: sessionData.vrijeme,
          nocna: nocna,
          notes: sessionData.notes
        })
      });

      if (response.ok) {
        const newSession = await response.json();
        setDrivingSessions(prev => [newSession.voznja, ...prev]);
        setModalVisible(false);
        Alert.alert('Success', 'Vožnja uspješno dodana!');
      } else {
        const errorText = await response.text();
        console.log('❌ Greška pri dodavanju vožnje:', errorText);
        Alert.alert('Greška', 'Neuspješno dodavanje vožnje');
      }
    } catch (error) {
      console.error('Error adding driving session:', error);
      Alert.alert('Greška', 'Problem s mrežom. Provjerite internet vezu.');
    }
  };

  const updateSessionStatus = async (sessionId: string, status: 'zakazana' | 'zavrsena' | 'otkazana') => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const parsedUser = userData ? JSON.parse(userData) : null;
      const token = parsedUser?.token;

      if (!token) {
        Alert.alert('Greška', 'Niste prijavljeni');
        return;
      }

      if (status === 'otkazana') {
        // Koristimo PUT /otkazi/:id endpoint
        const response = await fetch(`${API_BASE_URL}/api/driving/otkazi/${sessionId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const updatedSession = await response.json();
          setDrivingSessions(prev => 
            prev.map(session => 
              session._id === sessionId ? updatedSession.voznja : session
            )
          );
          Alert.alert('Success', 'Vožnja otkazana!');
        } else {
          throw new Error('Neuspješno otkazivanje vožnje');
        }
      } else if (status === 'zavrsena') {
        // Za završavanje koristimo unesiRezultat endpoint
        const response = await fetch(`${API_BASE_URL}/api/driving/unesiRezultat/${sessionId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            status: 'zavrsena'
          })
        });

        if (response.ok) {
          const updatedSession = await response.json();
          setDrivingSessions(prev => 
            prev.map(session => 
              session._id === sessionId ? updatedSession.voznja : session
            )
          );
          Alert.alert('Success', 'Vožnja završena!');
        } else {
          throw new Error('Neuspješno završavanje vožnje');
        }
      }
    } catch (error) {
      console.error('Error updating driving session:', error);
      Alert.alert('Greška', 'Problem s mrežom. Provjerite internet vezu.');
    }
  };

  const handleEvaluateSession = async (sessionId: string, evaluationData: { 
    ocjena: string; 
    napomena: string;
    zavrsna: boolean;
  }) => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const parsedUser = userData ? JSON.parse(userData) : null;
      const token = parsedUser?.token;

      if (!token) {
        Alert.alert('Greška', 'Niste prijavljeni');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/driving/unesiRezultat/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(evaluationData)
      });

      if (response.ok) {
        const evaluatedSession = await response.json();
        setDrivingSessions(prev => 
          prev.map(session => 
            session._id === sessionId ? evaluatedSession.voznja : session
          )
        );
        setEvaluationModalVisible(false);
        setEvaluation({ ocjena: '', napomena: '', zavrsna: false });
        Alert.alert('Success', 'Vožnja uspješno ocijenjena!');
      } else {
        const errorText = await response.text();
        console.log('❌ Greška pri ocjenjivanju vožnje:', errorText);
        Alert.alert('Greška', 'Neuspješno ocjenjivanje vožnje');
      }
    } catch (error) {
      console.error('Error evaluating driving session:', error);
      Alert.alert('Greška', 'Problem s mrežom. Provjerite internet vezu.');
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'zakazana': 'Zakazana',
      'zavrsena': 'Završena',
      'otkazana': 'Otkazana'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      'zakazana': '#2086F6',
      'zavrsena': '#4FC377',
      'otkazana': '#FF4757'
    };
    return colorMap[status] || '#6B7280';
  };

  const getOcjenaText = (ocjena: string) => {
    const ocjeneMap: { [key: string]: string } = {
      'nedovoljan': 'Nedovoljan (1)',
      'dovoljan': 'Dovoljan (2)',
      'dobar': 'Dobar (3)',
      'vrlo_dobar': 'Vrlo dobar (4)',
      'odlican': 'Odličan (5)'
    };
    return ocjeneMap[ocjena] || ocjena;
  };

  const getOcjenaColor = (ocjena: string) => {
    const colors: { [key: string]: string } = {
      'nedovoljan': '#EF4444',
      'dovoljan': '#F59E0B',
      'dobar': '#10B981',
      'vrlo_dobar': '#2086F6',
      'odlican': '#8B5CF6'
    };
    return colors[ocjena] || '#6B7280';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('hr-HR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (datum: string, vrijeme: string) => {
    const date = new Date(datum);
    const [sati, minute] = vrijeme.split(':');
    date.setHours(parseInt(sati), parseInt(minute));
    
    const danas = new Date();
    const sutra = new Date(danas);
    sutra.setDate(sutra.getDate() + 1);

    let prefix = '';
    if (date.toDateString() === danas.toDateString()) {
      prefix = 'Danas, ';
    } else if (date.toDateString() === sutra.toDateString()) {
      prefix = 'Sutra, ';
    }

    return (
      prefix +
      date.toLocaleDateString('hr-HR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    );
  };

  const filterSessionsByStatus = (status: 'zakazana' | 'zavrsena' | 'otkazana') => {
    return drivingSessions.filter(session => session.status === status);
  };

  const getSessionCount = (status: 'zakazana' | 'zavrsena' | 'otkazana') => {
    return drivingSessions.filter(session => session.status === status).length;
  };

  const zakazaneSessions = filterSessionsByStatus('zakazana');
  const zavrseneSessions = filterSessionsByStatus('zavrsena');
  const otkazaneSessions = filterSessionsByStatus('otkazana');

  const onRefresh = async () => {
    setIsRefreshing(true);
    if (user?._id) {
      await loadDrivingSessions(user._id);
    }
    setIsRefreshing(false);
  };

  const handleSessionPress = (session: DrivingSession) => {
    setSelectedSession(session);
    setDetailsModalVisible(true);
  };

  const handleEvaluatePress = (session: DrivingSession) => {
    setSelectedSession(session);
    setEvaluation({
      ocjena: session.ocjena || '',
      napomena: session.napomena || '',
      zavrsna: session.zavrsna || false
    });
    setEvaluationModalVisible(true);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2086F6" />
        <Text style={styles.loadingText}>Učitavam podatke o vožnjama...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2086F6" />
      
      {/* Header */}
      <LinearGradient
        colors={['#2086F6', '#1A75E0']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Moje vožnje</Text>
            <Text style={styles.headerSubtitle}>Upravljajte vožnjama s učenicima</Text>
          </View>
          <View style={styles.carIconContainer}>
            <Ionicons name="car-sport" size={32} color="#FFFFFF" />
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={['#2086F6']}
            tintColor="#2086F6"
          />
        }
      >
        {/* Status Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, selectedStatus === 'zakazana' && styles.tabActive]}
            onPress={() => setSelectedStatus('zakazana')}
          >
            <Text style={[styles.tabText, selectedStatus === 'zakazana' && styles.tabTextActive]}>
              Nadolazeće ({getSessionCount('zakazana')})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, selectedStatus === 'zavrsena' && styles.tabActive]}
            onPress={() => setSelectedStatus('zavrsena')}
          >
            <Text style={[styles.tabText, selectedStatus === 'zavrsena' && styles.tabTextActive]}>
              Završene ({getSessionCount('zavrsena')})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, selectedStatus === 'otkazana' && styles.tabActive]}
            onPress={() => setSelectedStatus('otkazana')}
          >
            <Text style={[styles.tabText, selectedStatus === 'otkazana' && styles.tabTextActive]}>
              Otkazane ({getSessionCount('otkazana')})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sessions List */}
        <View style={styles.sessionsSection}>
          {selectedStatus === 'zakazana' && (
            <SessionsList 
              sessions={zakazaneSessions}
              onUpdateStatus={updateSessionStatus}
              onSessionPress={handleSessionPress}
              onEvaluatePress={handleEvaluatePress}
              showActions={true}
            />
          )}
          
          {selectedStatus === 'zavrsena' && (
            <SessionsList 
              sessions={zavrseneSessions}
              onUpdateStatus={updateSessionStatus}
              onSessionPress={handleSessionPress}
              onEvaluatePress={handleEvaluatePress}
              showActions={false}
            />
          )}
          
          {selectedStatus === 'otkazana' && (
            <SessionsList 
              sessions={otkazaneSessions}
              onUpdateStatus={updateSessionStatus}
              onSessionPress={handleSessionPress}
              onEvaluatePress={handleEvaluatePress}
              showActions={false}
            />
          )}
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <LinearGradient
              colors={['#2086F6', '#1A75E0']}
              style={styles.statIcon}
            >
              <Ionicons name="time" size={24} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.statNumber}>{getSessionCount('zakazana')}</Text>
            <Text style={styles.statLabel}>Nadolazeće</Text>
          </View>
          
          <View style={styles.statCard}>
            <LinearGradient
              colors={['#4FC377', '#3BAF6D']}
              style={styles.statIcon}
            >
              <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.statNumber}>{getSessionCount('zavrsena')}</Text>
            <Text style={styles.statLabel}>Završene</Text>
          </View>
          
          <View style={styles.statCard}>
            <LinearGradient
              colors={['#FF4757', '#FF3742']}
              style={styles.statIcon}
            >
              <Ionicons name="close-circle" size={24} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.statNumber}>{getSessionCount('otkazana')}</Text>
            <Text style={styles.statLabel}>Otkazane</Text>
          </View>
        </View>
      </ScrollView>

      {/* Add Session Button */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <LinearGradient
          colors={['#2086F6', '#1A75E0']}
          style={styles.addButtonGradient}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Add Session Modal */}
      <AddSessionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAddSession={handleAddSession}
        students={students}
      />

      {/* Session Details Modal */}
      <SessionDetailsModal
        visible={detailsModalVisible}
        onClose={() => setDetailsModalVisible(false)}
        session={selectedSession}
        onUpdateStatus={updateSessionStatus}
        onEvaluatePress={handleEvaluatePress}
      />

      {/* Evaluation Modal */}
      <EvaluationModal
        visible={evaluationModalVisible}
        onClose={() => setEvaluationModalVisible(false)}
        onEvaluate={(evaluationData) => {
          if (selectedSession) {
            handleEvaluateSession(selectedSession._id, evaluationData);
          }
        }}
        evaluation={evaluation}
        setEvaluation={setEvaluation}
      />
    </View>
  );
}

// Separate component for sessions list
const SessionsList = ({ 
  sessions, 
  onUpdateStatus, 
  onSessionPress,
  onEvaluatePress,
  showActions 
}: { 
  sessions: DrivingSession[]; 
  onUpdateStatus: (sessionId: string, status: 'zakazana' | 'zavrsena' | 'otkazana') => void;
  onSessionPress: (session: DrivingSession) => void;
  onEvaluatePress: (session: DrivingSession) => void;
  showActions: boolean;
}) => {
  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      'zakazana': '#2086F6',
      'zavrsena': '#4FC377',
      'otkazana': '#FF4757'
    };
    return colorMap[status] || '#6B7280';
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'zakazana': 'Zakazana',
      'zavrsena': 'Završena',
      'otkazana': 'Otkazana'
    };
    return statusMap[status] || status;
  };

  const formatDateTime = (datum: string, vrijeme: string) => {
    const date = new Date(datum);
    const [sati, minute] = vrijeme.split(':');
    date.setHours(parseInt(sati), parseInt(minute));
    
    const danas = new Date();
    const sutra = new Date(danas);
    sutra.setDate(sutra.getDate() + 1);

    let prefix = '';
    if (date.toDateString() === danas.toDateString()) {
      prefix = 'Danas, ';
    } else if (date.toDateString() === sutra.toDateString()) {
      prefix = 'Sutra, ';
    }

    return (
      prefix +
      date.toLocaleDateString('hr-HR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    );
  };

  if (sessions.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="car-outline" size={64} color="#9CA3AF" />
        <Text style={styles.emptyStateText}>Nema vožnji</Text>
        <Text style={styles.emptyStateSubtext}>Dodajte novu vožnju kako biste započeli</Text>
      </View>
    );
  }

  return (
    <View style={styles.sessionsList}>
      {sessions.map((session) => (
        <TouchableOpacity 
          key={session._id} 
          style={styles.sessionCard}
          onPress={() => onSessionPress(session)}
        >
          <View style={styles.sessionHeader}>
            <View style={styles.studentInfo}>
              <Text style={styles.studentName}>
                {session.kandidat?.name} {session.kandidat?.surname}
              </Text>
              <Text style={styles.studentEmail}>
                {session.kandidat?.email}
              </Text>
            </View>
            <View 
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(session.status) }
              ]}
            >
              <Text style={styles.statusText}>
                {getStatusText(session.status)}
              </Text>
            </View>
          </View>
          
          <View style={styles.sessionDetails}>
            <View style={styles.detailItem}>
              <Ionicons name="calendar" size={16} color="#6B7280" />
              <Text style={styles.detailText}>
                {formatDateTime(session.datum, session.vrijeme)}
              </Text>
            </View>

            {session.nocna && (
              <View style={styles.detailItem}>
                <Ionicons name="moon" size={16} color="#F59E0B" />
                <Text style={[styles.detailText, { color: '#F59E0B' }]}>Noćna vožnja</Text>
              </View>
            )}
          </View>

          {session.status === 'zavrsena' && session.ocjena && (
            <View style={styles.evaluationContainer}>
              <Text style={[styles.ocjenaText, { color: getOcjenaColor(session.ocjena) }]}>
                Ocjena: {getOcjenaText(session.ocjena)}
              </Text>
              {session.napomena && (
                <Text style={styles.napomenaText}>Napomena: {session.napomena}</Text>
              )}
              {session.zavrsna && (
                <Text style={styles.zavrsnaText}>✓ Završna vožnja</Text>
              )}
            </View>
          )}
          
          {showActions && (
            <View style={styles.actionsContainer}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.completeButton]}
                onPress={() => onUpdateStatus(session._id, 'zavrsena')}
              >
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Završi</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => onUpdateStatus(session._id, 'otkazana')}
              >
                <Ionicons name="close" size={16} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Otkaži</Text>
              </TouchableOpacity>

              {session.status === 'zavrsena' && !session.ocjena && (
                <TouchableOpacity 
                  style={[styles.actionButton, styles.evaluateButton]}
                  onPress={() => onEvaluatePress(session)}
                >
                  <Ionicons name="star" size={16} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Ocijeni</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Add Session Modal Component
const AddSessionModal = ({ 
  visible, 
  onClose, 
  onAddSession, 
  students 
}: { 
  visible: boolean;
  onClose: () => void;
  onAddSession: (sessionData: any) => void;
  students: Student[];
}) => {
  const [newSession, setNewSession] = useState({
    kandidatId: '',
    datum: new Date().toISOString().split('T')[0],
    vrijeme: '08:00',
    notes: ''
  });

  const handleSubmit = () => {
    if (!newSession.kandidatId || !newSession.datum || !newSession.vrijeme) {
      Alert.alert('Greška', 'Molimo popunite sva obavezna polja');
      return;
    }

    onAddSession(newSession);
    setNewSession({
      kandidatId: '',
      datum: new Date().toISOString().split('T')[0],
      vrijeme: '08:00',
      notes: ''
    });
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Dodaj novu vožnju</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Učenik *</Text>
              <View style={styles.picker}>
                {students.map(student => (
                  <TouchableOpacity
                    key={student._id}
                    style={[
                      styles.pickerOption,
                      newSession.kandidatId === student._id && styles.pickerOptionSelected
                    ]}
                    onPress={() => setNewSession(prev => ({ ...prev, kandidatId: student._id }))}
                  >
                    <Text style={[
                      styles.pickerOptionText,
                      newSession.kandidatId === student._id && styles.pickerOptionTextSelected
                    ]}>
                      {student.name} {student.surname}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Datum *</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={newSession.datum}
                onChangeText={(text) => setNewSession(prev => ({ ...prev, datum: text }))}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Vrijeme *</Text>
              <TextInput
                style={styles.input}
                placeholder="HH:MM"
                value={newSession.vrijeme}
                onChangeText={(text) => setNewSession(prev => ({ ...prev, vrijeme: text }))}
              />
              <Text style={styles.inputHelp}>Vrijeme mora biti između 08:00 i 20:00</Text>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Bilješke (opcionalno)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Dodajte bilješke o vožnji..."
                value={newSession.notes}
                onChangeText={(text) => setNewSession(prev => ({ ...prev, notes: text }))}
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Odustani</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.submitButton]}
              onPress={handleSubmit}
            >
              <LinearGradient
                colors={['#2086F6', '#1A75E0']}
                style={styles.submitButtonGradient}
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Dodaj vožnju</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Session Details Modal Component
const SessionDetailsModal = ({ 
  visible, 
  onClose, 
  session, 
  onUpdateStatus,
  onEvaluatePress
}: { 
  visible: boolean;
  onClose: () => void;
  session: DrivingSession | null;
  onUpdateStatus: (sessionId: string, status: 'zakazana' | 'zavrsena' | 'otkazana') => void;
  onEvaluatePress: (session: DrivingSession) => void;
}) => {
  if (!session) return null;

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      'zakazana': '#2086F6',
      'zavrsena': '#4FC377',
      'otkazana': '#FF4757'
    };
    return colorMap[status] || '#6B7280';
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'zakazana': 'Zakazana',
      'zavrsena': 'Završena',
      'otkazana': 'Otkazana'
    };
    return statusMap[status] || status;
  };

  const formatDateTime = (datum: string, vrijeme: string) => {
    const date = new Date(datum);
    const [sati, minute] = vrijeme.split(':');
    date.setHours(parseInt(sati), parseInt(minute));
    
    const danas = new Date();
    const sutra = new Date(danas);
    sutra.setDate(sutra.getDate() + 1);

    let prefix = '';
    if (date.toDateString() === danas.toDateString()) {
      prefix = 'Danas, ';
    } else if (date.toDateString() === sutra.toDateString()) {
      prefix = 'Sutra, ';
    }

    return (
      prefix +
      date.toLocaleDateString('hr-HR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Detalji vožnje</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Učenik</Text>
              <Text style={styles.detailText}>
                {session.kandidat?.name} {session.kandidat?.surname}
              </Text>
              <Text style={styles.detailSubtext}>{session.kandidat?.email}</Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Termin</Text>
              <Text style={styles.detailText}>
                {formatDateTime(session.datum, session.vrijeme)}
              </Text>
              {session.nocna && (
                <Text style={[styles.detailSubtext, { color: '#F59E0B' }]}>
                  Noćna vožnja
                </Text>
              )}
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Status</Text>
              <View 
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(session.status) }
                ]}
              >
                <Text style={styles.statusText}>
                  {getStatusText(session.status)}
                </Text>
              </View>
            </View>

            {session.status === 'zavrsena' && session.ocjena && (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Ocjenjivanje</Text>
                <Text style={[styles.detailText, { color: getOcjenaColor(session.ocjena) }]}>
                  Ocjena: {getOcjenaText(session.ocjena)}
                </Text>
                {session.napomena && (
                  <Text style={styles.detailSubtext}>Napomena: {session.napomena}</Text>
                )}
                {session.zavrsna && (
                  <Text style={[styles.detailSubtext, { color: '#10B981', fontWeight: '600' }]}>
                    ✓ Završna vožnja
                  </Text>
                )}
              </View>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            {session.status === 'zakazana' && (
              <>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.completeButton]}
                  onPress={() => {
                    onUpdateStatus(session._id, 'zavrsena');
                    onClose();
                  }}
                >
                  <Text style={styles.actionButtonText}>Završi vožnju</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    onUpdateStatus(session._id, 'otkazana');
                    onClose();
                  }}
                >
                  <Text style={styles.actionButtonText}>Otkaži vožnju</Text>
                </TouchableOpacity>
              </>
            )}

            {session.status === 'zavrsena' && !session.ocjena && (
              <TouchableOpacity 
                style={[styles.modalButton, styles.evaluateButton]}
                onPress={() => {
                  onEvaluatePress(session);
                  onClose();
                }}
              >
                <Text style={styles.actionButtonText}>Ocijeni vožnju</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Evaluation Modal Component
const EvaluationModal = ({ 
  visible, 
  onClose, 
  onEvaluate,
  evaluation,
  setEvaluation
}: { 
  visible: boolean;
  onClose: () => void;
  onEvaluate: (evaluationData: { ocjena: string; napomena: string; zavrsna: boolean }) => void;
  evaluation: { ocjena: string; napomena: string; zavrsna: boolean };
  setEvaluation: (evaluation: { ocjena: string; napomena: string; zavrsna: boolean }) => void;
}) => {
  const ocjene = [
    { value: 'nedovoljan', label: 'Nedovoljan (1)' },
    { value: 'dovoljan', label: 'Dovoljan (2)' },
    { value: 'dobar', label: 'Dobar (3)' },
    { value: 'vrlo_dobar', label: 'Vrlo dobar (4)' },
    { value: 'odlican', label: 'Odličan (5)' }
  ];

  const handleSubmit = () => {
    if (!evaluation.ocjena) {
      Alert.alert('Greška', 'Molimo odaberite ocjenu');
      return;
    }

    onEvaluate(evaluation);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Ocijeni vožnju</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Ocjena *</Text>
              <View style={styles.picker}>
                {ocjene.map(ocjena => (
                  <TouchableOpacity
                    key={ocjena.value}
                    style={[
                      styles.pickerOption,
                      evaluation.ocjena === ocjena.value && styles.pickerOptionSelected
                    ]}
                    onPress={() => setEvaluation(prev => ({ ...prev, ocjena: ocjena.value }))}
                  >
                    <Text style={[
                      styles.pickerOptionText,
                      evaluation.ocjena === ocjena.value && styles.pickerOptionTextSelected
                    ]}>
                      {ocjena.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Napomena (opcionalno)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Dodajte napomenu o vožnji..."
                value={evaluation.napomena}
                onChangeText={(text) => setEvaluation(prev => ({ ...prev, napomena: text }))}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputGroup}>
              <TouchableOpacity
                style={[
                  styles.checkbox,
                  evaluation.zavrsna && styles.checkboxSelected
                ]}
                onPress={() => setEvaluation(prev => ({ ...prev, zavrsna: !prev.zavrsna }))}
              >
                <Ionicons 
                  name={evaluation.zavrsna ? "checkbox" : "square-outline"} 
                  size={20} 
                  color={evaluation.zavrsna ? "#2086F6" : "#6B7280"} 
                />
                <Text style={styles.checkboxLabel}>Označi kao završnu vožnju</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Odustani</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.submitButton]}
              onPress={handleSubmit}
            >
              <LinearGradient
                colors={['#4FC377', '#3BAF6D']}
                style={styles.submitButtonGradient}
              >
                <Ionicons name="star" size={20} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Spremi ocjenu</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Helper function to get grade color
const getOcjenaColor = (ocjena: string) => {
  const colors: { [key: string]: string } = {
    'nedovoljan': '#EF4444',
    'dovoljan': '#F59E0B',
    'dobar': '#10B981',
    'vrlo_dobar': '#2086F6',
    'odlican': '#8B5CF6'
  };
  return colors[ocjena] || '#6B7280';
};

// Helper function to get grade text
const getOcjenaText = (ocjena: string) => {
  const ocjeneMap: { [key: string]: string } = {
    'nedovoljan': 'Nedovoljan (1)',
    'dovoljan': 'Dovoljan (2)',
    'dobar': 'Dobar (3)',
    'vrlo_dobar': 'Vrlo dobar (4)',
    'odlican': 'Odličan (5)'
  };
  return ocjeneMap[ocjena] || ocjena;
};

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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  carIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#2086F6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  sessionsSection: {
    marginBottom: 24,
  },
  sessionsList: {
    gap: 12,
  },
  sessionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  studentEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sessionDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
  },
  evaluationContainer: {
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2086F6',
  },
  ocjenaText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  napomenaText: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  zavrsnaText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
    flex: 1,
    minWidth: 100,
  },
  completeButton: {
    backgroundColor: '#4FC377',
  },
  cancelButton: {
    backgroundColor: '#FF4757',
  },
  evaluateButton: {
    backgroundColor: '#8B5CF6',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
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
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  inputHelp: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    fontStyle: 'italic',
  },
  picker: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
  },
  pickerOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  pickerOptionSelected: {
    backgroundColor: '#2086F6',
  },
  pickerOptionText: {
    fontSize: 16,
    color: '#374151',
  },
  pickerOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  checkboxSelected: {
    backgroundColor: '#F0F9FF',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 8,
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    padding: 16,
  },
  submitButton: {
    borderRadius: 12,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 4,
  },
  detailSubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
});