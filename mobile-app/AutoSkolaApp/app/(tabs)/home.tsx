import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

const { width } = Dimensions.get('window');

interface User {
  token: string;
  role: string;
  name: string;
  email: string;
  id: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const [token, role, name, email, id] = await Promise.all([
        AsyncStorage.getItem("userToken"),
        AsyncStorage.getItem("userRole"),
        AsyncStorage.getItem("userName"),
        AsyncStorage.getItem("userEmail"),
        AsyncStorage.getItem("userId"),
      ]);

      console.log("📦 Loaded user data:", { token: !!token, name, role });

      if (token && role) {
        setUser({
          token,
          role,
          name: name || "",
          email: email || "",
          id: id || "",
        });
      } else {
        console.log("❌ No user data found, redirecting to login...");
        router.replace("/");
      }
    } catch (error) {
      console.error("🚨 Error loading user data:", error);
      Alert.alert("Greška", "Došlo je do greške pri učitavanju podataka");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    Alert.alert("Odjava", "Jeste li sigurni da se želite odjaviti?", [
      { text: "Odustani", style: "cancel" },
      {
        text: "Odjavi se",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.multiRemove([
            "userToken",
            "userRole",
            "userName",
            "userEmail",
            "userId",
          ]);
          console.log("✅ Logout successful");
          router.replace("/");
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingSpinner}>
          <LinearGradient
            colors={['#2086F6', '#4FC377']}
            style={styles.loadingGradient}
          />
        </View>
        <Text style={styles.loadingText}>Učitavanje...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Niste prijavljeni...</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadUserData}>
          <Text style={styles.retryText}>Pokušaj ponovo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <LinearGradient
          colors={['#2086F6', '#1A75E0']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.welcomeSection}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </Text>
                </View>
                <View style={styles.onlineIndicator} />
              </View>
              
              <View style={styles.welcomeTextContainer}>
                <Text style={styles.welcome}>
                  Dobrodošli, {user.name}!
                </Text>
                <Text style={styles.subtitle}>
                  Autoškola Una School
                </Text>
              </View>
            </View>

            <TouchableOpacity 
              onPress={logout} 
              style={styles.logoutButton}
            >
              <Ionicons name="exit-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.userStats}>
            <View style={styles.statBadge}>
              <Ionicons name="person" size={16} color="#4FC377" />
              <Text style={styles.statBadgeText}>Kandidat</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Progress Overview */}
        <View style={styles.progressSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Vaš napredak</Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="time-outline" size={28} color="#2086F6" />
              </View>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Preostalo sati</Text>
              <View style={styles.statProgress}>
                <View style={[styles.progressFill, { width: '40%' }]} />
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: '#E8F5E8' }]}>
                <Ionicons name="calendar-outline" size={28} color="#4FC377" />
              </View>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Sljedećih termina</Text>
              <View style={styles.nextAppointment}>
                <Text style={styles.appointmentText}>Sutra 14:00</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Brzi pristup</Text>
          </View>

          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push("/Testovi")}
            >
              <View style={styles.actionContent}>
                <View style={[styles.actionIcon, { backgroundColor: '#2086F6' }]}>
                  <Ionicons name="document-text-outline" size={28} color="#FFFFFF" />
                </View>
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionTitle}>Testovi</Text>
                  <Text style={styles.actionSubtitle}>Vježbajte znanje</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#2086F6" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push("/(tabs)/voznje")}
            >
              <View style={styles.actionContent}>
                <View style={[styles.actionIcon, { backgroundColor: '#4FC377' }]}>
                  <Ionicons name="car-outline" size={28} color="#FFFFFF" />
                </View>
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionTitle}>Vožnje</Text>
                  <Text style={styles.actionSubtitle}>Termini vožnji</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#4FC377" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push("/(tabs)/chat")}
            >
              <View style={styles.actionContent}>
                <View style={[styles.actionIcon, { backgroundColor: '#8104FA' }]}>
                  <Ionicons name="chatbubble-outline" size={28} color="#FFFFFF" />
                </View>
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionTitle}>Chat</Text>
                  <Text style={styles.actionSubtitle}>Kontaktirajte nas</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#8104FA" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push("/(tabs)/profil")}
            >
              <View style={styles.actionContent}>
                <View style={[styles.actionIcon, { backgroundColor: '#8355FC' }]}>
                  <Ionicons name="person-outline" size={28} color="#FFFFFF" />
                </View>
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionTitle}>Profil</Text>
                  <Text style={styles.actionSubtitle}>Vaši podaci</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#8355FC" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#FFFFFF',
  },
  loadingSpinner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 20,
    overflow: 'hidden',
  },
  loadingGradient: {
    width: '100%',
    height: '100%',
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  errorText: {
    fontSize: 18,
    color: "#666",
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#2086F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  welcomeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2086F6',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4FC377',
    borderWidth: 2,
    borderColor: '#2086F6',
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcome: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },
  logoutButton: {
    padding: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
  },
  userStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statBadgeText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: 6,
  },
  progressSection: {
    padding: 20,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1F2937",
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  statIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
    marginBottom: 12,
  },
  statProgress: {
    height: 6,
    backgroundColor: "#F3F4F6",
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: "#2086F6",
    borderRadius: 3,
  },
  nextAppointment: {
    backgroundColor: "#E8F5E8",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  appointmentText: {
    fontSize: 12,
    color: "#4FC377",
    fontWeight: "600",
  },
  actionsSection: {
    padding: 20,
    paddingTop: 0,
  },
  actionsGrid: {
    gap: 12,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  infoSection: {
    padding: 20,
    paddingTop: 0,
  },
  infoCards: {
    gap: 12,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  infoIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    color: "#6B7280",
  },
});