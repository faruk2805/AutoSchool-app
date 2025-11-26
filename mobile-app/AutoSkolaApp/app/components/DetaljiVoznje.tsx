import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

interface Voznja {
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
  ocjena: string;
  napomena: string;
  zavrsna: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DetaljiVoznjeProps {
  visible: boolean;
  onClose: () => void;
  voznja: Voznja;
  onOtkaziVoznju?: (voznjaId: string) => Promise<void>;
}

export default function DetaljiVoznje({ visible, onClose, voznja, onOtkaziVoznju }: DetaljiVoznjeProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "zavrsena":
        return "#10B981";
      case "zakazana":
        return "#2086F6";
      case "otkazana":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "zavrsena":
        return "Završeno";
      case "zakazana":
        return "Nadolazeće";
      case "otkazana":
        return "Otkazano";
      default:
        return status;
    }
  };

  const getOcjenaText = (ocjena: string) => {
    const ocjeneMap: { [key: string]: string } = {
      "nedovoljan": "Nedovoljan (1)",
      "dovoljan": "Dovoljan (2)",
      "dobar": "Dobar (3)",
      "vrlo_dobar": "Vrlo dobar (4)",
      "odlican": "Odličan (5)"
    };
    return ocjeneMap[ocjena] || ocjena;
  };

  const getOcjenaColor = (ocjena: string) => {
    const colors: { [key: string]: string } = {
      "nedovoljan": "#EF4444",
      "dovoljan": "#F59E0B",
      "dobar": "#10B981",
      "vrlo_dobar": "#2086F6",
      "odlican": "#8B5CF6"
    };
    return colors[ocjena] || "#6B7280";
  };

  const formatDatum = (datumString: string, vrijeme: string) => {
    try {
      const datum = new Date(datumString);
      const [sati, minute] = vrijeme.split(':');
      datum.setHours(parseInt(sati), parseInt(minute));
      
      return datum.toLocaleDateString("bs-BA", {
        weekday: 'long',
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Nevažeći datum";
    }
  };

  const formatDatumKreiranja = (datumString: string) => {
    try {
      const datum = new Date(datumString);
      return datum.toLocaleDateString("bs-BA", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Nevažeći datum";
    }
  };

  const handleOtkaziVoznju = () => {
    Alert.alert(
      "Otkaži vožnju",
      `Da li ste sigurni da želite otkazati vožnju za ${formatDatum(voznja.datum, voznja.vrijeme)}?`,
      [
        {
          text: "Odustani",
          style: "cancel"
        },
        {
          text: "Otkaži vožnju",
          style: "destructive",
          onPress: async () => {
            if (onOtkaziVoznju) {
              await onOtkaziVoznju(voznja._id);
            }
            onClose();
          }
        }
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        {/* Modal Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Detalji vožnje</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        {/* Status Badge */}
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(voznja.status) },
            ]}
          >
            <Ionicons 
              name={
                voznja.status === "zavrsena" ? "checkmark-circle" :
                voznja.status === "otkazana" ? "close-circle" : "time"
              } 
              size={16} 
              color="#FFF" 
            />
            <Text style={styles.statusBadgeText}>
              {getStatusText(voznja.status)}
            </Text>
          </View>
          {voznja.zavrsna && (
            <View style={[styles.statusBadge, { backgroundColor: "#8B5CF6" }]}>
              <Ionicons name="trophy" size={16} color="#FFF" />
              <Text style={styles.statusBadgeText}>Završna vožnja</Text>
            </View>
          )}
          {voznja.nocna && (
            <View style={[styles.statusBadge, { backgroundColor: "#F59E0B" }]}>
              <Ionicons name="moon" size={16} color="#FFF" />
              <Text style={styles.statusBadgeText}>Noćna vožnja</Text>
            </View>
          )}
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Osnovne informacije */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Osnovne informacije</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Ionicons name="calendar" size={20} color="#2086F6" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Datum i vrijeme</Text>
                  <Text style={styles.infoValue}>
                    {formatDatum(voznja.datum, voznja.vrijeme)}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Ionicons name="person" size={20} color="#2086F6" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Instruktor</Text>
                  <Text style={styles.infoValue}>
                    {voznja.instruktor.name} {voznja.instruktor.surname}
                  </Text>
                  <Text style={styles.infoSubtext}>{voznja.instruktor.email}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Ionicons name="person" size={20} color="#2086F6" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Kandidat</Text>
                  <Text style={styles.infoValue}>
                    {voznja.kandidat.name} {voznja.kandidat.surname}
                  </Text>
                  <Text style={styles.infoSubtext}>{voznja.kandidat.email}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Ocjena i napomena - prikaži samo ako je vožnja završena */}
          {voznja.status === "zavrsena" && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ocena i napomena</Text>
              <View style={styles.ocjenaCard}>
                {voznja.ocjena && voznja.ocjena !== "dovoljan" && (
                  <View style={styles.ocjenaRow}>
                    <View style={styles.ocjenaIcon}>
                      <Ionicons name="star" size={20} color={getOcjenaColor(voznja.ocjena)} />
                    </View>
                    <View style={styles.ocjenaContent}>
                      <Text style={styles.ocjenaLabel}>Ocena</Text>
                      <Text style={[styles.ocjenaValue, { color: getOcjenaColor(voznja.ocjena) }]}>
                        {getOcjenaText(voznja.ocjena)}
                      </Text>
                    </View>
                  </View>
                )}

                {voznja.napomena ? (
                  <View style={styles.napomenaRow}>
                    <View style={styles.napomenaIcon}>
                      <Ionicons name="document-text" size={20} color="#6B7280" />
                    </View>
                    <View style={styles.napomenaContent}>
                      <Text style={styles.napomenaLabel}>Napomena instruktora</Text>
                      <Text style={styles.napomenaValue}>{voznja.napomena}</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.napomenaRow}>
                    <View style={styles.napomenaIcon}>
                      <Ionicons name="document-text" size={20} color="#9CA3AF" />
                    </View>
                    <View style={styles.napomenaContent}>
                      <Text style={styles.napomenaLabel}>Napomena instruktora</Text>
                      <Text style={styles.napomenaEmpty}>Nema napomene</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Metapodaci */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Metapodaci</Text>
            <View style={styles.metaCard}>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Kreirano</Text>
                <Text style={styles.metaValue}>
                  {formatDatumKreiranja(voznja.createdAt)}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Ažurirano</Text>
                <Text style={styles.metaValue}>
                  {formatDatumKreiranja(voznja.updatedAt)}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>ID vožnje</Text>
                <Text style={styles.metaValue}>{voznja._id}</Text>
              </View>
            </View>
          </View>

          {/* Akcije - prikaži samo za nadolazeće vožnje */}
          {voznja.status === "zakazana" && onOtkaziVoznju && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Akcije</Text>
              <View style={styles.actionsCard}>
                <TouchableOpacity
                  style={styles.otkaziButton}
                  onPress={handleOtkaziVoznju}
                >
                  <LinearGradient
                    colors={["#EF4444", "#DC2626"]}
                    style={styles.otkaziButtonGradient}
                  >
                    <Ionicons name="close-circle" size={20} color="#FFF" />
                    <Text style={styles.otkaziButtonText}>Otkaži vožnju</Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                <Text style={styles.otkaziInfo}>
                  Vožnju možete otkazati najkasnije 24 sata prije početka.
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#2086F6",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  headerPlaceholder: {
    width: 40,
  },
  statusContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#2086F6",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2086F6",
    marginBottom: 15,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  infoIcon: {
    width: 40,
    alignItems: "center",
    paddingTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "600",
  },
  infoSubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 2,
  },
  ocjenaCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ocjenaRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  ocjenaIcon: {
    width: 40,
    alignItems: "center",
    paddingTop: 2,
  },
  ocjenaContent: {
    flex: 1,
  },
  ocjenaLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
    fontWeight: "500",
  },
  ocjenaValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  napomenaRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  napomenaIcon: {
    width: 40,
    alignItems: "center",
    paddingTop: 2,
  },
  napomenaContent: {
    flex: 1,
  },
  napomenaLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
    fontWeight: "500",
  },
  napomenaValue: {
    fontSize: 16,
    color: "#1F2937",
    lineHeight: 22,
  },
  napomenaEmpty: {
    fontSize: 16,
    color: "#9CA3AF",
    fontStyle: "italic",
  },
  metaCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  metaLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  metaValue: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "500",
  },
  actionsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  otkaziButton: {
    marginBottom: 15,
  },
  otkaziButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  otkaziButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  otkaziInfo: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 16,
  },
});