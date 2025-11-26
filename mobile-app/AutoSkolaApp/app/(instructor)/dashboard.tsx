import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator 
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

export default function InstructorDashboard() {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      console.log('📋 Loading user data for instructor dashboard...');
      
      const userData = await AsyncStorage.getItem('user');
      console.log('🔍 Raw user data from AsyncStorage:', userData);
      
      if (userData) {
        const parsedUser = JSON.parse(userData);
        console.log('👤 Parsed instructor user data:', parsedUser);
        
        const userWithId = {
          ...parsedUser,
          _id: parsedUser._id || parsedUser.id || 'mock-instructor-id',
          name: parsedUser.name || 'Instruktor',
          email: parsedUser.email || 'email@primjer.com',
          role: parsedUser.role || 'instructor'
        };
        
        console.log('✅ Final user data for dashboard:', userWithId);
        setUser(userWithId);
      } else {
        console.log('❌ No user data found in AsyncStorage');
        Alert.alert('Greška', 'Nema podataka o korisniku');
        router.replace('/login');
      }
    } catch (error) {
      console.error('🚨 Error loading user data:', error);
      Alert.alert('Greška', 'Došlo je do greške pri učitavanju podataka');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Odjava',
      'Da li ste sigurni da želite da se odjavite?',
      [
        {
          text: 'Odustani',
          style: 'cancel',
        },
        {
          text: 'Odjavi se',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.multiRemove([
              'user',
              'userToken',
              'userRole',  
              'userName',
              'userEmail',
              'userId'
            ]);
            console.log('✅ All user data cleared, redirecting to login...');
            router.replace('/login');
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2086F6" />
        <Text style={styles.loadingText}>Učitavam instruktorski panel...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color="#FFFFFF" />
        </View>
        <Text style={styles.welcomeText}>Dobrodošli, {user?.name}!</Text>
        <Text style={styles.roleText}>Instruktor</Text>
        <Text style={styles.emailText}>{user?.email}</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, { backgroundColor: '#E3F2FD' }]}>
            <Ionicons name="people" size={28} color="#2086F6" />
          </View>
          <Text style={styles.statNumber}>24</Text>
          <Text style={styles.statLabel}>Polaznika</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, { backgroundColor: '#E8F5E8' }]}>
            <Ionicons name="calendar" size={28} color="#4FC377" />
          </View>
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>Termina</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, { backgroundColor: '#FFF3E0' }]}>
            <Ionicons name="car-sport" size={28} color="#FFB020" />
          </View>
          <Text style={styles.statNumber}>8</Text>
          <Text style={styles.statLabel}>Vozila</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Brze akcije</Text>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/(instructor)/voznje')}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#2086F6' }]}>
            <Ionicons name="car-outline" size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.actionText}>Vožnje</Text>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/(instructor)/chat')}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#4FC377' }]}>
            <Ionicons name="chatbubble-outline" size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.actionText}>Chat</Text>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/(instructor)/vozilo')}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#8104FA' }]}>
            <Ionicons name="car-sport" size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.actionText}>Vozilo</Text>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Aktivnosti</Text>
        
        <View style={styles.activityItem}>
          <View style={[styles.activityIcon, { backgroundColor: '#ECFDF5' }]}>
            <Ionicons name="checkmark-done" size={16} color="#10B981" />
          </View>
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>Marko Marković završio vožnju</Text>
            <Text style={styles.activityTime}>Prije 2 sata</Text>
          </View>
        </View>

        <View style={styles.activityItem}>
          <View style={[styles.activityIcon, { backgroundColor: '#FEF3F2' }]}>
            <Ionicons name="time" size={16} color="#EF4444" />
          </View>
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>Ana Anić zakazala termin</Text>
            <Text style={styles.activityTime}>Prije 4 sata</Text>
          </View>
        </View>

        <View style={styles.activityItem}>
          <View style={[styles.activityIcon, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="car" size={16} color="#3B82F6" />
          </View>
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>Servis vozila A123</Text>
            <Text style={styles.activityTime}>Sutra u 09:00</Text>
          </View>
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#EF4444" />
        <Text style={styles.logoutText}>Odjavi se</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
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
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 20,
    paddingBottom: 30,
    backgroundColor: '#2086F6',
    marginHorizontal: -20,
    marginTop: -20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  roleText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    textAlign: 'center',
  },
  emailText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
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
    flex: 1,
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },
  activityItem: {
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
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 8,
  },
});