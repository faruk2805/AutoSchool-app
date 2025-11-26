import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  RefreshControl,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const { width, height } = Dimensions.get("window");

interface ExamSession {
  _id: string;
  tip: "teorija" | "prva_pomoc" | "glavna_voznja";
  datum: string;
  maxKandidata: number;
  status: "otvoren" | "zatvoren" | "otkazan";
  prijavljeni: string[];
  rezultati: Array<{
    kandidatId: string;
    prosao: boolean;
    bodovi: number;
  }>;
  instruktor: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ExamsModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
}

export default function ExamsModal({
  visible,
  onClose,
  userId,
}: ExamsModalProps) {
  const [activeTab, setActiveTab] = useState<"open" | "my">("open");
  const [exams, setExams] = useState<ExamSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [registering, setRegistering] = useState<string | null>(null);

  const API_BASE_URL =
    Constants.expoConfig?.extra?.apiUrl || "http://192.168.1.9:5000";

  useEffect(() => {
    if (visible) {
      loadExams();
    }
  }, [visible, activeTab]);

  const getAuthHeaders = async () => {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) throw new Error("Nema tokena");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const loadExams = async () => {
    try {
      setLoading(true);
      const headers = await getAuthHeaders();

      const endpoint =
        activeTab === "open"
          ? `${API_BASE_URL}/api/exams/open`
          : `${API_BASE_URL}/api/exams/user/${userId}`;

      const response = await fetch(endpoint, { headers });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(err);
      }

      const data = await response.json();
      
      // Dodaj userResult za "my" tab
      if (activeTab === "my") {
        const myExamsWithResult = data.map((exam: ExamSession) => ({
          ...exam,
          userResult: exam.rezultati?.find((r) => r.kandidatId === userId) || null
        }));
        setExams(myExamsWithResult);
      } else {
        setExams(data);
      }
    } catch (error) {
      console.error("Error loading exams:", error);
      Alert.alert("Greška", "Došlo je do greške pri učitavanju ispita");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadExams();
  };

  const registerForExam = async (examId: string) => {
    try {
      setRegistering(examId);

      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert("Greška", "Niste prijavljeni");
        return;
      }

      // Pronađi ispit u trenutno učitanim ispitima
      const exam = exams.find((e) => e._id === examId);
      if (!exam) {
        Alert.alert("Greška", "Ispit nije pronađen");
        return;
      }

      if (exam.prijavljeni.includes(userId)) {
        Alert.alert("Info", "Već ste prijavljeni na ovaj ispit");
        return;
      }

      if (exam.prijavljeni.length >= exam.maxKandidata) {
        Alert.alert("Info", "Ispitni rok je popunjen");
        return;
      }

      // Pripremi payload koji backend očekuje
      const payload = {
        sessionId: examId,
        userId,
        vrijeme: new Date(exam.datum).toISOString(),
      };

      const response = await fetch(`${API_BASE_URL}/api/exams/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Uspješno", "Prijavili ste se na ispit", [
          { text: "OK", onPress: loadExams },
        ]);
      } else {
        console.log("Greška prilikom prijave:", data);
        Alert.alert("Greška", data.message || "Došlo je do greške pri prijavi na ispit.");
      }
    } catch (error) {
      console.error("Error registering for exam:", error);
      Alert.alert("Greška", "Došlo je do greške pri prijavi");
    } finally {
      setRegistering(null);
    }
  };

  const cancelRegistration = async (examId: string) => {
    Alert.alert(
      "Otkaži prijavu",
      "Da li ste sigurni da želite otkazati prijavu?",
      [
        { text: "Ne", style: "cancel" },
        {
          text: "Da",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("userToken");
              const response = await fetch(`${API_BASE_URL}/api/exams/cancel`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ examId, userId }),
              });

              if (response.ok) {
                Alert.alert("Uspješno", "Prijava je otkazana", [
                  { text: "OK", onPress: loadExams },
                ]);
              } else {
                const errorData = await response.json();
                Alert.alert("Greška", errorData.message || "Nije moguće otkazati prijavu");
              }
            } catch (error) {
              console.error("Error canceling registration:", error);
              Alert.alert("Greška", "Došlo je do greške pri otkazivanju");
            }
          },
        },
      ]
    );
  };

  const getExamTypeName = (tip: string) =>
    ({
      teorija: "Teorija Vožnje",
      prva_pomoc: "Prva Pomoć",
      glavna_voznja: "Glavna Vožnja",
    }[tip] || tip);

  const getExamTypeIcon = (tip: string) =>
    ({
      teorija: "school-outline",
      prva_pomoc: "medkit-outline",
      glavna_voznja: "car-sport-outline",
    }[tip] || "help-outline");

  const getStatusColor = (status: string) =>
    ({ 
      otvoren: "#10B981", 
      zatvoren: "#6B7280", 
      otkazan: "#EF4444" 
    }[status] || "#6B7280");

  const getStatusText = (status: string) =>
    ({ 
      otvoren: "OTVOREN", 
      zatvoren: "ZAVRŠEN", 
      otkazan: "OTKAZAN" 
    }[status] || status);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("bs-BA");
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("bs-BA", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isUserRegistered = (exam: ExamSession) =>
    exam.prijavljeni.includes(userId);

  const getUserResult = (exam: ExamSession) => {
    // Prvo provjeri ima li userResult property (za my tab)
    if ((exam as any).userResult) {
      return (exam as any).userResult;
    }
    // Fallback na staru logiku
    return exam.rezultati?.find((r) => r.kandidatId === userId);
  };

  const canRegister = (exam: ExamSession) =>
    exam.status === "otvoren" &&
    !isUserRegistered(exam) &&
    exam.prijavljeni.length < exam.maxKandidata;

  const canCancelRegistration = (exam: ExamSession) =>
    exam.status === "otvoren" && isUserRegistered(exam);

  const getDisplayedExams = () => {
    if (activeTab === "open") {
      return exams.filter(exam => exam.status === "otvoren");
    } else {
      return exams.filter(exam => exam.prijavljeni.includes(userId));
    }
  };

  const renderExamCard = (exam: ExamSession) => {
    const userRegistered = isUserRegistered(exam);
    const userResult = getUserResult(exam);
    const canUserRegister = canRegister(exam);
    const canUserCancel = canCancelRegistration(exam);
    const isFull = exam.prijavljeni.length >= exam.maxKandidata;
    const showActions = activeTab === "open";

    return (
      <View key={exam._id} style={styles.examCard}>
        <View style={styles.examHeader}>
          <View style={styles.examType}>
            <Ionicons
              name={getExamTypeIcon(exam.tip)}
              size={24}
              color="#2086F6"
            />
            <View style={styles.examTypeInfo}>
              <Text style={styles.examTypeText}>
                {getExamTypeName(exam.tip)}
              </Text>
              <Text style={styles.instruktorText}>
                Instruktor: {exam.instruktor?.name || "N/A"}
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(exam.status) },
            ]}
          >
            <Text style={styles.statusText}>{getStatusText(exam.status)}</Text>
          </View>
        </View>

        <View style={styles.examDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color="#6B7280" />
            <Text style={styles.detailText}>{formatDate(exam.datum)}</Text>
            <Ionicons
              name="time-outline"
              size={16}
              color="#6B7280"
              style={{ marginLeft: 12 }}
            />
            <Text style={styles.detailText}>{formatTime(exam.datum)}</Text>
          </View>

          <View style={styles.capacityRow}>
            <Text style={styles.detailText}>
              {exam.prijavljeni.length}/{exam.maxKandidata} prijava
            </Text>
            {isFull && (
              <Text style={styles.fullText}>• POPUNJEN</Text>
            )}
          </View>
        </View>

        {userResult && (
          <View
            style={[
              styles.resultBadge,
              { backgroundColor: userResult.prosao ? "#ECFDF5" : "#FEF2F2" },
            ]}
          >
            <Ionicons
              name={userResult.prosao ? "checkmark-circle" : "close-circle"}
              size={18}
              color={userResult.prosao ? "#10B981" : "#EF4444"}
            />
            <Text
              style={[
                styles.resultText,
                { color: userResult.prosao ? "#10B981" : "#EF4444" },
              ]}
            >
              {userResult.prosao ? "POLOŽENO" : "PALO"} • {userResult.bodovi}{" "}
              bodova
            </Text>
          </View>
        )}

        {showActions && exam.status === "otvoren" && (
          <View style={styles.actionsContainer}>
            {canUserCancel ? (
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => cancelRegistration(exam._id)}
              >
                <Ionicons name="close-circle" size={20} color="#EF4444" />
                <Text style={styles.cancelButtonText}>Otkaži prijavu</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.registerButton,
                  (!canUserRegister || registering === exam._id) &&
                    styles.disabledButton,
                ]}
                onPress={() => canUserRegister && registerForExam(exam._id)}
                disabled={!canUserRegister || registering === exam._id}
              >
                {registering === exam._id ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.registerButtonText}>
                    {isFull
                      ? "POPUNJEN"
                      : userRegistered
                      ? "PRIJAVLJEN"
                      : "PRIJAVI SE"}
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  const displayedExams = getDisplayedExams();

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Ispitni rokovi</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "open" && styles.activeTab]}
            onPress={() => setActiveTab("open")}
          >
            <Text
              style={
                activeTab === "open" ? styles.activeTabText : styles.tabText
              }
            >
              Dostupni
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "my" && styles.activeTab]}
            onPress={() => setActiveTab("my")}
          >
            <Text
              style={activeTab === "my" ? styles.activeTabText : styles.tabText}
            >
              Moje prijave
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={displayedExams.length === 0 ? styles.emptyContainer : undefined}
        >
          {loading ? (
            <ActivityIndicator
              size="large"
              color="#2086F6"
              style={{ margin: 40 }}
            />
          ) : displayedExams.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={64} color="#9CA3AF" />
              <Text style={styles.emptyStateText}>
                {activeTab === "open" 
                  ? "Nema dostupnih ispita" 
                  : "Nema prijavljenih ispita"}
              </Text>
            </View>
          ) : (
            displayedExams.map((exam) => renderExamCard(exam))
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: { 
    flex: 1, 
    backgroundColor: "#fff" 
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: "bold",
    color: "#1F2937"
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },
  tab: { 
    flex: 1, 
    padding: 16, 
    alignItems: "center" 
  },
  activeTab: { 
    borderBottomWidth: 2, 
    borderBottomColor: "#2086F6" 
  },
  tabText: { 
    color: "#6B7280",
    fontWeight: "500"
  },
  activeTabText: { 
    color: "#2086F6", 
    fontWeight: "bold" 
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 60,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
  examCard: {
    backgroundColor: "#fff",
    margin: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  examHeader: { 
    flexDirection: "row", 
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  examType: { 
    flexDirection: "row", 
    alignItems: "flex-start",
    flex: 1,
  },
  examTypeInfo: { 
    marginLeft: 12,
    flex: 1,
  },
  examTypeText: { 
    fontWeight: "bold", 
    fontSize: 16,
    color: "#1F2937",
    marginBottom: 4,
  },
  instruktorText: { 
    color: "#6B7280",
    fontSize: 14,
  },
  statusBadge: { 
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: { 
    color: "#fff", 
    fontWeight: "bold", 
    fontSize: 12 
  },
  examDetails: { 
    marginTop: 8,
  },
  detailRow: { 
    flexDirection: "row", 
    alignItems: "center",
    marginBottom: 8,
  },
  capacityRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailText: { 
    marginLeft: 6, 
    color: "#6B7280",
    fontSize: 14,
  },
  fullText: {
    color: "#EF4444",
    fontWeight: "bold",
    fontSize: 14,
    marginLeft: 8,
  },
  resultBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    padding: 8,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  resultText: { 
    marginLeft: 6, 
    fontWeight: "bold",
    fontSize: 14,
  },
  actionsContainer: { 
    marginTop: 16,
  },
  actionButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  registerButton: { 
    backgroundColor: "#2086F6" 
  },
  cancelButton: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  registerButtonText: { 
    color: "#fff", 
    fontWeight: "bold",
    fontSize: 16,
  },
  cancelButtonText: { 
    color: "#EF4444", 
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 6,
  },
  disabledButton: { 
    backgroundColor: "#9CA3AF" 
  },
});