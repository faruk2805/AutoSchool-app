import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import PaymentsModal from "../components/PaynamentsModal";
import ExamsModal from '../components/ExamsModal';
const { width, height } = Dimensions.get("window");

interface User {
  _id: string;
  name: string;
  surname: string;
  email: string;
  role: string;
  instruktor?: any;
  status?: {
    teorijaPrvaPomoc?: boolean;
    voznja?: boolean;
    polozio?: {
      teoriju?: boolean;
      prvuPomoc?: boolean;
      voznju?: boolean;
    };
    bedzevi?: string[];
  };
  drivingSessions: any[];
  recommendations: any[];
  documents: any[];
  createdAt: string;
  updatedAt: string;
}

interface TestResult {
  _id: string;
  tip: string;
  subTip: string;
  correctCount: number;
  total: number;
  score: number;
  passed: boolean;
  createdAt: string;
}

interface UserResultsResponse {
  userId: string;
  broj_testova: number;
  rezultati: TestResult[];
}

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const [showPersonalModal, setShowPersonalModal] = useState(false);
  const [showPaymentsModal, setShowPaymentsModal] = useState(false);
  const [showExamsModal, setShowExamsModal] = useState(false);
  const [showMoreResults, setShowMoreResults] = useState(false);

  const API_BASE_URL = "http://192.168.1.9:5000";

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        router.replace("/");
        return;
      }

      // Load user profile from /api/users/me
      const userResponse = await fetch(`${API_BASE_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!userResponse.ok) {
        throw new Error(`HTTP error! status: ${userResponse.status}`);
      }

      const userData: User = await userResponse.json();
      console.log("User data loaded:", userData);
      console.log("User documents:", userData.documents);
      setUser(userData);

      // Load test results
      loadTestResults(userData._id);
    } catch (error) {
      console.error("Error loading user data:", error);
      Alert.alert("Greška", "Došlo je do greške pri učitavanju podataka");
    } finally {
      setIsLoading(false);
    }
  };

  const loadTestResults = async (userId: string) => {
    try {
      setLoadingResults(true);
      console.log("Loading test results for user:", userId);

      const response = await fetch(
        `${API_BASE_URL}/api/testresults/user/${userId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const userResults: UserResultsResponse = await response.json();
      console.log("Loaded test results:", userResults.rezultati.length);

      // Sort by date, newest first
      const sortedResults = userResults.rezultati.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setTestResults(sortedResults);
    } catch (error) {
      console.error("Error loading test results:", error);
      Alert.alert("Greška", "Došlo je do greške pri učitavanju rezultata");
    } finally {
      setLoadingResults(false);
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
          router.replace("/");
        },
      },
    ]);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "#4FC377";
    if (score >= 60) return "#FFB020";
    return "#FF6B6B";
  };

  const getTestTypeName = (tip: string, subTip: string) => {
    const typeMap: { [key: string]: string } = {
      znak: "Znakovi",
      "prva-pomoc": "Prva Pomoc",
      prva_pomoc: "Prva Pomoc",
      teorija: "Teorija Voznje",
      "teorija-voznje": "Teorija Voznje",
    };

    const subTypeMap: { [key: string]: string } = {
      kombinovani: "Kombinovani",
      nasumicni: "Nasumični",
      lekcijski: "Lekcijski",
    };

    const mainType = typeMap[tip] || tip;
    const subType = subTypeMap[subTip] || subTip;

    return `${mainType} • ${subType}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("bs-BA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getDocumentInfo = (documents: any) => {
    if (!documents || documents.length === 0) {
      return "Nema dokumentaa";
    }

    console.log("Documents:", documents);

    // Pokušaj pronaći JMBG u dokumentima
    const jmbgDoc = documents.find(
      (doc: any) =>
        doc.type?.toLowerCase().includes("jmbg") ||
        doc.name?.toLowerCase().includes("jmbg") ||
        doc.documentType?.toLowerCase().includes("jmbg") ||
        doc.title?.toLowerCase().includes("jmbg")
    );

    if (jmbgDoc) {
      console.log("JMBG document found:", jmbgDoc);
      return jmbgDoc.number || jmbgDoc.value || jmbgDoc.name || "JMBG dostupan";
    }

    // Ako nema JMBG, prikaži broj dokumenata
    return `${documents.length} dokumentaa`;
  };

  const getDocumentDetails = (documents: any) => {
    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      return [{ label: "Dokumenti", value: "Nema dostupnih dokumenata" }];
    }

    const details = [];

    // Dodaj osnovne podatke o dokumentima
    details.push({
      label: "Broj dokumenata",
      value: `${documents.length}`,
    });

    // Pokušaj pronaći specifične dokumente
    documents.forEach((doc: any, index: number) => {
      const docName =
        doc.name || doc.type || doc.title || `Dokument ${index + 1}`;
      const docValue = doc.number || doc.value || doc.status || "Dostupan";

      details.push({
        label: docName,
        value: docValue,
      });
    });

    return details;
  };

  // Safe status check functions
  const hasPassedTheory = () => user?.status?.polozio?.teoriju || false;
  const hasPassedFirstAid = () => user?.status?.polozio?.prvuPomoc || false;
  const hasPassedDriving = () => user?.status?.polozio?.voznju || false;

  const displayedResults = showMoreResults
    ? testResults
    : testResults.slice(0, 3);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2086F6" />
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

  const documentDetails = getDocumentDetails(user.documents);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <LinearGradient colors={["#2086F6", "#1A75E0"]} style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.welcomeSection}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </Text>
                </View>
                <View style={styles.onlineIndicator} />
              </View>

              <View style={styles.welcomeTextContainer}>
                <Text style={styles.welcome}>
                  {user.name} {user.surname}
                </Text>
                <Text style={styles.subtitle}>{user.email}</Text>
                <Text style={styles.roleText}>
                  {user.role === "candidate" ? "Kandidat" : user.role}
                </Text>
              </View>
            </View>

            <TouchableOpacity onPress={logout} style={styles.logoutButton}>
              <Ionicons name="exit-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Progress Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: "#E3F2FD" },
                ]}
              >
                <Ionicons name="school-outline" size={24} color="#2086F6" />
              </View>
              <Text style={styles.statNumber}>
                {hasPassedTheory() ? "DA" : "NE"}
              </Text>
              <Text style={styles.statLabel}>Teorija</Text>
            </View>

            <View style={styles.statCard}>
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: "#E8F5E8" },
                ]}
              >
                <Ionicons name="medkit-outline" size={24} color="#4FC377" />
              </View>
              <Text style={styles.statNumber}>
                {hasPassedFirstAid() ? "DA" : "NE"}
              </Text>
              <Text style={styles.statLabel}>Prva Pomoc</Text>
            </View>

            <View style={styles.statCard}>
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: "#FFF3E0" },
                ]}
              >
                <Ionicons name="car-sport-outline" size={24} color="#FFB020" />
              </View>
              <Text style={styles.statNumber}>
                {hasPassedDriving() ? "DA" : "NE"}
              </Text>
              <Text style={styles.statLabel}>Voznja</Text>
            </View>
          </View>
        </View>

        {/* Menu Options */}
        <View style={styles.menuSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Moj Profil</Text>
          </View>

          <View style={styles.menuGrid}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setShowPersonalModal(true)}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name="person-outline" size={24} color="#2086F6" />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>Lični podaci</Text>
                <Text style={styles.menuSubtitle}>Pregled svih podataka</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setShowExamsModal(true)}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name="calendar-outline" size={24} color="#FF6B6B" />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>Moji ispiti</Text>
                <Text style={styles.menuSubtitle}>
                  Prijave i rezultati ispita
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setShowPaymentsModal(true)}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name="card-outline" size={24} color="#4FC377" />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>Moja plaćanja</Text>
                <Text style={styles.menuSubtitle}>
                  Istorija i status plaćanja
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Test Results */}
        <View style={styles.resultsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Moji rezultati</Text>
            <Text style={styles.resultsCount}>
              {testResults.length} testova
            </Text>
          </View>

          {loadingResults ? (
            <View style={styles.loadingResults}>
              <ActivityIndicator size="small" color="#2086F6" />
              <Text style={styles.loadingResultsText}>
                Učitavanje rezultata...
              </Text>
            </View>
          ) : testResults.length === 0 ? (
            <View style={styles.noResults}>
              <Ionicons
                name="document-text-outline"
                size={48}
                color="#9CA3AF"
              />
              <Text style={styles.noResultsText}>Nema rezultata testova</Text>
              <Text style={styles.noResultsSubtext}>
                Započnite testove da biste vidjeli svoje rezultate ovdje
              </Text>
            </View>
          ) : (
            <View style={styles.resultsList}>
              {displayedResults.map((result, index) => (
                <View key={result._id} style={styles.resultCard}>
                  <View style={styles.resultHeader}>
                    <View style={styles.resultType}>
                      <Text style={styles.resultTypeText}>
                        {getTestTypeName(result.tip, result.subTip)}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.resultStatus,
                        {
                          backgroundColor: result.passed
                            ? "#E8F5E8"
                            : "#FFE6E6",
                        },
                      ]}
                    >
                      <Ionicons
                        name={
                          result.passed ? "checkmark-circle" : "close-circle"
                        }
                        size={16}
                        color={result.passed ? "#4FC377" : "#FF6B6B"}
                      />
                      <Text
                        style={[
                          styles.resultStatusText,
                          { color: result.passed ? "#4FC377" : "#FF6B6B" },
                        ]}
                      >
                        {result.passed ? "POLOŽENO" : "PALO"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.resultStats}>
                    <View style={styles.resultStat}>
                      <Text style={styles.resultStatNumber}>
                        {result.correctCount}/{result.total}
                      </Text>
                      <Text style={styles.resultStatLabel}>
                        Tačnih odgovora
                      </Text>
                    </View>

                    <View style={styles.resultStat}>
                      <Text
                        style={[
                          styles.resultStatNumber,
                          { color: getScoreColor(result.score) },
                        ]}
                      >
                        {result.score.toFixed(1)}%
                      </Text>
                      <Text style={styles.resultStatLabel}>Postotak</Text>
                    </View>

                    <View style={styles.resultStat}>
                      <Text style={styles.resultStatNumber}>
                        #{testResults.length - index}
                      </Text>
                      <Text style={styles.resultStatLabel}>Pokušaj</Text>
                    </View>
                  </View>

                  <View style={styles.resultFooter}>
                    <Text style={styles.resultDate}>
                      {formatDate(result.createdAt)}
                    </Text>
                  </View>
                </View>
              ))}

              {testResults.length > 3 && (
                <TouchableOpacity
                  style={styles.showMoreButton}
                  onPress={() => setShowMoreResults(!showMoreResults)}
                >
                  <Text style={styles.showMoreText}>
                    {showMoreResults
                      ? "Prikaži manje"
                      : `Prikaži više (${testResults.length - 3})`}
                  </Text>
                  <Ionicons
                    name={showMoreResults ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#2086F6"
                  />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Personal Data Modal */}
      {showPersonalModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Lični podaci</Text>
              <TouchableOpacity
                onPress={() => setShowPersonalModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.sectionSubtitle}>Osnovni podaci</Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Ime i prezime:</Text>
                <Text style={styles.infoValue}>
                  {user.name} {user.surname}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email:</Text>
                <Text style={styles.infoValue}>{user.email}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Status:</Text>
                <Text style={styles.infoValue}>
                  {user.role === "kandidat" ? "Kandidat" : user.role}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Datum registracije:</Text>
                <Text style={styles.infoValue}>
                  {formatDate(user.createdAt)}
                </Text>
              </View>

              {/* Dokumenti - SAMO OVO OSTAVLJAMO */}
              <Text style={styles.sectionSubtitle}>Dokumenti</Text>
              {documentDetails.map((doc, index) => (
                <View key={index} style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{doc.label}:</Text>
                  <Text style={styles.infoValue}>{doc.value}</Text>
                </View>
              ))}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowPersonalModal(false)}
              >
                <Text style={styles.modalButtonText}>Zatvori</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Exams Modal - Placeholder */}
      {showExamsModal && (
        <ExamsModal
          visible={showExamsModal}
          onClose={() => setShowExamsModal(false)}
          userId={user._id}
        />
      )}

      {/* Payments Modal */}
      {showPaymentsModal && (
        <PaymentsModal
          visible={showPaymentsModal}
          onClose={() => setShowPaymentsModal(false)}
          userId={user._id}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 90,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
    marginTop: 12,
  },
  errorText: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#2086F6",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryText: {
    color: "#FFFFFF",
    fontWeight: "600",
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
  },
  welcomeSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2086F6",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#4FC377",
    borderWidth: 2,
    borderColor: "#2086F6",
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
    marginBottom: 2,
  },
  roleText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 2,
  },
  logoutButton: {
    padding: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
  },
  statsSection: {
    padding: 20,
    paddingBottom: 0,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
    textAlign: "center",
  },
  menuSection: {
    padding: 20,
    paddingTop: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1F2937",
  },
  sectionSubtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 20,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  resultsCount: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "600",
  },
  menuGrid: {
    gap: 12,
  },
  menuItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  menuIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  resultsSection: {
    padding: 20,
    paddingTop: 0,
  },
  loadingResults: {
    alignItems: "center",
    padding: 40,
  },
  loadingResultsText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
  },
  noResults: {
    alignItems: "center",
    padding: 40,
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
  },
  resultsList: {
    gap: 12,
  },
  resultCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  resultType: {
    flex: 1,
  },
  resultTypeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  resultStatus: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  resultStatusText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  resultStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  resultStat: {
    alignItems: "center",
    flex: 1,
  },
  resultStatNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  resultStatLabel: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  resultFooter: {
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 12,
  },
  resultDate: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
  },
  showMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  showMoreText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2086F6",
    marginRight: 8,
  },
  // Modal Styles
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
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
    padding: 24,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  infoLabel: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "600",
  },
  modalFooter: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  modalButton: {
    backgroundColor: "#2086F6",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  placeholderSection: {
    alignItems: "center",
    padding: 40,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6B7280",
    marginTop: 16,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 16,
    color: "#9CA3AF",
    textAlign: "center",
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: "#D1D5DB",
    textAlign: "center",
    fontStyle: "italic",
  },
});
