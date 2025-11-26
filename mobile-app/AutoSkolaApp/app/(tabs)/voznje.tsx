import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
  StatusBar,
  Animated,
  Easing,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import ZakaziVoznjuModal from "../components/ZakaziVoznjuModal";
import DetaljiVoznje from "../components/DetaljiVoznje";

const { width, height } = Dimensions.get("window");

interface UserData {
  _id: string;
  name: string;
  surname: string;
  email: string;
  role: string;
  instruktor?: {
    _id: string;
    name: string;
    surname: string;
    email: string;
  };
  status: {
    teorijaPrvaPomoc: boolean;
    voznja: {
      brojVoznji: number;
      ocjene: string[];
      zavrsnaVoznja: boolean;
    };
    polozio: {
      teoriju: boolean;
      prvuPomoc: boolean;
      voznju: boolean;
    };
    bedzevi: string[];
  };
}

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

interface Instruktor {
  _id: string;
  name: string;
  surname: string;
  email: string;
}

const API_BASE_URL = "http://192.168.1.9:5000";

export default function VoznjeScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [voznje, setVoznje] = useState<Voznja[]>([]);
  const [instruktori, setInstruktori] = useState<Instruktor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showZakaziModal, setShowZakaziModal] = useState(false);
  const [showDetaljiModal, setShowDetaljiModal] = useState(false);
  const [selectedVoznja, setSelectedVoznja] = useState<Voznja | null>(null);

  // Animacije
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];
  const pulseAnim = useState(new Animated.Value(1))[0];
  const rotateAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    loadUserData();
  }, []);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const startLockedAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };

  const loadUserData = async () => {
    try {
      console.log("🔐 Učitavam podatke korisnika...");

      const token = await AsyncStorage.getItem("userToken");

      console.log(
        "📋 Token iz AsyncStorage:",
        token ? "Postoji" : "Ne postoji"
      );

      if (!token) {
        console.log("❌ Korisnik nije prijavljen");
        Alert.alert(
          "Potrebna prijava",
          "Morate biti prijavljeni da biste pristupili vožnjama",
          [
            {
              text: "Prijavi se",
              onPress: () => router.replace("/login"),
            },
          ]
        );
        setIsLoading(false);
        return;
      }

      // Prvo učitaj korisničke podatke, pa onda vožnje
      await loadUserDetails(token);
      startAnimations();
    } catch (error) {
      console.log("🚨 Greška pri učitavanju podataka:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserDetails = async (token: string) => {
    try {
      console.log("👤 Dohvatam detalje korisnika prema /api/users/me...");

      const response = await fetch(`${API_BASE_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("📡 Status /api/users/me:", response.status);

      if (response.ok) {
        const userDetails = await response.json();
        console.log(
          "✅ USPEH - Podaci sa /api/users/me:",
          JSON.stringify(userDetails, null, 2)
        );

        // Ažuriraj userData sa novim podacima
        setUserData(userDetails);
        await AsyncStorage.setItem("userData", JSON.stringify(userDetails));

        // Sada učitaj vožnje i instruktore
        await Promise.all([
          loadVoznje(token, userDetails._id),
          loadInstruktori(),
        ]);

        // Pokreni animaciju ako nije položio testove
        if (!canAccessVoznje(userDetails)) {
          startLockedAnimation();
        }
      } else {
        console.log("❌ Greška sa /api/users/me:", response.status);
        const errorText = await response.text();
        console.log(`❌ Detalji greške:`, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.log("🚨 Greška pri dohvatanju detalja korisnika:", error);
      // Pokušaj sa postojećim podacima iz AsyncStorage
      const existingUserData = await AsyncStorage.getItem("userData");
      if (existingUserData) {
        const parsedData = JSON.parse(existingUserData);
        setUserData(parsedData);

        // Pokušaj učitati vožnje sa postojećim podacima
        const token = await AsyncStorage.getItem("userToken");
        if (token) {
          await loadVoznje(token, parsedData._id);
        }

        // Pokreni animaciju ako nije položio testove
        if (!canAccessVoznje(parsedData)) {
          startLockedAnimation();
        }
      }
    }
  };

  const canAccessVoznje = (user: UserData): boolean => {
    console.log("📊 Proveravam uslove za vožnje:");
    console.log("   - role:", user.role);
    console.log("   - status.polozio:", user.status?.polozio);

    // Ako nije candidate, može pristupiti
    if (user.role !== "candidate") {
      console.log("✅ Nije candidate - može pristupiti");
      return true;
    }

    // Proveri da li je položio teoriju i prvu pomoć
    const hasPassedRequiredTests =
      user.status?.polozio?.teoriju && user.status?.polozio?.prvuPomoc;

    console.log("✅ Položio teoriju i prvu pomoć:", hasPassedRequiredTests);

    return hasPassedRequiredTests || false;
  };

  const getTestStatus = (user: UserData) => {
    return {
      teorija: user.status?.polozio?.teoriju || false,
      prvaPomoc: user.status?.polozio?.prvuPomoc || false,
      voznja: user.status?.polozio?.voznju || false,
    };
  };

  const loadVoznje = async (token: string, userId: string) => {
    try {
      console.log("🚗 Učitavam vožnje za korisnika:", userId);
      console.log("🔗 Koristim endpoint:", `${API_BASE_URL}/api/driving/user/${userId}`);

      const response = await fetch(`${API_BASE_URL}/api/driving/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("📡 Status vožnji (/api/driving/user/:id):", response.status);

      if (!response.ok) {
        if (response.status === 404) {
          console.log("ℹ️ Nema vožnji - prazna lista");
          setVoznje([]);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Vožnje učitane:", data);

      if (Array.isArray(data)) {
        setVoznje(data);
      } else {
        console.log("⚠️ Neočekivana struktura podataka:", data);
        setVoznje([]);
      }
    } catch (error) {
      console.log("🚨 Greška pri učitavanju vožnji:", error);
      setVoznje([]);
    }
  };

  const loadInstruktori = async () => {
    try {
      console.log("👨‍🏫 Učitavam instruktore...");

      const response = await fetch(`${API_BASE_URL}/api/instruktori`);

      console.log("📡 Status instruktora:", response.status);

      if (!response.ok) {
        if (response.status === 404) {
          console.log("ℹ️ Nema instruktora - prazna lista");
          setInstruktori([]);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Instruktori učitani:", data);
      setInstruktori(data);
    } catch (error) {
      console.log("🚨 Greška pri učitavanju instruktora:", error);
      setInstruktori([]);
    }
  };

  const handleZakaziVoznju = async (voznjaData: {
    instruktorId: string;
    datum: string;
    vrijeme: string;
  }) => {
    try {
      const userToken = await AsyncStorage.getItem("userToken");

      console.log("🚗 Šaljem zahtjev za zakazivanje:", {
        kandidatId: userData?._id,
        ...voznjaData,
      });

      const response = await fetch(`${API_BASE_URL}/api/driving/zakazi`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          kandidatId: userData?._id,
          instruktorId: voznjaData.instruktorId,
          datum: voznjaData.datum,
          vrijeme: voznjaData.vrijeme,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Greška pri zakazivanju");
      }

      const result = await response.json();
      console.log("✅ Vožnja uspješno zakazana:", result);

      Alert.alert("Uspjeh", "Vožnja je uspješno zakazana!");
      setShowZakaziModal(false);

      // Osveži listu vožnji
      const freshToken = await AsyncStorage.getItem("userToken");
      if (freshToken && userData) {
        loadVoznje(freshToken, userData._id);
      }
    } catch (error) {
      console.log("🚨 Greška pri zakazivanju vožnje:", error);
      Alert.alert(
        "Greška",
        error.message || "Došlo je do greške pri zakazivanju vožnje"
      );
      throw error;
    }
  };

  // Funkcija za otkazivanje vožnje
  const handleOtkaziVoznju = async (voznjaId: string) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      
      const response = await fetch(`${API_BASE_URL}/api/driving/otkazi/${voznjaId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Vožnja otkazana:", result);
      
      Alert.alert("Uspeh", "Vožnja je uspješno otkazana!");
      
      // Osveži listu vožnji
      if (token && userData) {
        await loadVoznje(token, userData._id);
      }
    } catch (error) {
      console.log("🚨 Greška pri otkazivanju vožnje:", error);
      Alert.alert("Greška", "Došlo je do greške pri otkazivanju vožnje");
      throw error;
    }
  };

  // Funkcija za otvaranje detalja vožnje kao modal
  const handleVoznjaPress = (voznja: Voznja) => {
    setSelectedVoznja(voznja);
    setShowDetaljiModal(true);
  };

  // Funkcija za zatvaranje modal
  const handleCloseDetaljiModal = () => {
    setShowDetaljiModal(false);
    setSelectedVoznja(null);
  };

  const handleLogout = async () => {
    Alert.alert("Odjava", "Želite li se odjaviti?", [
      {
        text: "Odustani",
        style: "cancel",
      },
      {
        text: "Odjavi se",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.multiRemove(["userToken", "userData"]);
          router.replace("/login");
        },
      },
    ]);
  };

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
      const [sati, minute] = vrijeme.split(":");
      datum.setHours(parseInt(sati), parseInt(minute));

      const danas = new Date();
      const sutra = new Date(danas);
      sutra.setDate(sutra.getDate() + 1);

      let prefix = "";
      if (datum.toDateString() === danas.toDateString()) {
        prefix = "Danas, ";
      } else if (datum.toDateString() === sutra.toDateString()) {
        prefix = "Sutra, ";
      }

      return (
        prefix +
        datum.toLocaleDateString("bs-BA", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    } catch (error) {
      return "Nevažeći datum";
    }
  };

  // FUNKCIJA ZA NADOLAZEĆE VOŽNJE - samo zakazane vožnje u budućnosti
  const getNadolazeceVoznje = (voznje: Voznja[]) => {
    const sada = new Date();

    return voznje.filter((voznja) => {
      // Samo vožnje sa statusom "zakazana"
      if (voznja.status !== "zakazana") {
        return false;
      }

      const datumVoznje = new Date(voznja.datum);
      const [sati, minute] = voznja.vrijeme.split(":");
      datumVoznje.setHours(parseInt(sati), parseInt(minute));

      // Vožnja je nadolazeća ako je datum u budućnosti
      return datumVoznje > sada;
    });
  };

  // FUNKCIJA ZA ZAVRŠENE VOŽNJE - samo vožnje sa statusom "zavrsena"
  const getZavrseneVoznje = (voznje: Voznja[]) => {
    return voznje.filter((voznja) => voznja.status === "zavrsena");
  };

  // FUNKCIJA ZA OTKAZANE VOŽNJE - samo vožnje sa statusom "otkazana"
  const getOtkazaneVoznje = (voznje: Voznja[]) => {
    return voznje.filter((voznja) => voznja.status === "otkazana");
  };

  const sortirajVoznjePoDatumu = (voznje: Voznja[]) => {
    return voznje.sort((a, b) => {
      const datumA = new Date(a.datum);
      const datumB = new Date(b.datum);
      const [satiA, minuteA] = a.vrijeme.split(":");
      const [satiB, minuteB] = b.vrijeme.split(":");
      datumA.setHours(parseInt(satiA), parseInt(minuteA));
      datumB.setHours(parseInt(satiB), parseInt(minuteB));

      return datumA.getTime() - datumB.getTime();
    });
  };

  const sortirajZavrseneVoznje = (voznje: Voznja[]) => {
    return voznje.sort((a, b) => {
      const datumA = new Date(a.datum);
      const datumB = new Date(b.datum);
      const [satiA, minuteA] = a.vrijeme.split(":");
      const [satiB, minuteB] = b.vrijeme.split(":");
      datumA.setHours(parseInt(satiA), parseInt(minuteA));
      datumB.setHours(parseInt(satiB), parseInt(minuteB));

      return datumB.getTime() - datumA.getTime(); // Obrnut redoslijed - najnovije prvo
    });
  };

  // Razdvajanje vožnji po kategorijama
  const nadolazeceVoznje = sortirajVoznjePoDatumu(getNadolazeceVoznje(voznje));
  const zavrseneVoznje = sortirajZavrseneVoznje(getZavrseneVoznje(voznje));
  const otkazaneVoznje = sortirajZavrseneVoznje(getOtkazaneVoznje(voznje));

  console.log("📊 REZULTATI FILTRIRANJA:");
  console.log("   - Ukupno vožnji:", voznje.length);
  console.log("   - Nadolazeće vožnje:", nadolazeceVoznje.length);
  console.log("   - Završene vožnje:", zavrseneVoznje.length);
  console.log("   - Otkazane vožnje:", otkazaneVoznje.length);

  const ukupnoSati = zavrseneVoznje.length * 1.5;
  const preostaloSati = Math.max(40 - ukupnoSati, 0);
  const zavrseneVoznjeCount = zavrseneVoznje.length;

  // Proveri da li kandidat može pristupiti vožnjama
  const canAccessVoznjeFlag = userData ? canAccessVoznje(userData) : true;
  const testStatus = userData ? getTestStatus(userData) : null;

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // Funkcija za osvježavanje vožnji
  const handleRefresh = async () => {
    const token = await AsyncStorage.getItem("userToken");
    if (token && userData) {
      setIsLoading(true);
      await loadVoznje(token, userData._id);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#2086F6" />
        <LinearGradient
          colors={["#2086F6", "#4FC377"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Učitavam vožnje...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2086F6" />

      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={28} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.title}>Moje vožnje</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="exit-outline" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Zakaži Button - prikaži samo ako je candidate i može pristupiti */}
        {userData?.role === "candidate" && canAccessVoznjeFlag && (
          <TouchableOpacity
            style={styles.zakaziButton}
            onPress={() => setShowZakaziModal(true)}
          >
            <LinearGradient
              colors={["#4FC377", "#2086F6"]}
              style={styles.zakaziButtonGradient}
            >
              <Ionicons name="add" size={20} color="#FFF" />
              <Text style={styles.zakaziButtonText}>Zakaži vožnju</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Poruka ako candidate nije položio sve testove */}
        {userData?.role === "candidate" && !canAccessVoznjeFlag && (
          <View style={styles.warningBanner}>
            <Ionicons name="warning" size={16} color="#FFF" />
            <Text style={styles.warningText}>
              Morate položiti teoriju i prvu pomoć da biste zakazivali vožnje
            </Text>
          </View>
        )}
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            colors={["#2086F6"]}
            tintColor="#2086F6"
          />
        }
      >
        {/* Status testova za candidate - prikaži samo ako ima podatke */}
        {userData?.role === "candidate" && testStatus && (
          <Animated.View
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.sectionTitle}>Status testova</Text>
            <View style={styles.testStatusCard}>
              <View style={styles.testStatusRow}>
                <View style={styles.testStatusItem}>
                  <Ionicons
                    name="medkit"
                    size={20}
                    color={testStatus.prvaPomoc ? "#10B981" : "#EF4444"}
                  />
                  <Text style={styles.testStatusText}>Prva pomoć</Text>
                  <Text
                    style={[
                      styles.testStatusValue,
                      testStatus.prvaPomoc
                        ? styles.testPassed
                        : styles.testFailed,
                    ]}
                  >
                    {testStatus.prvaPomoc ? "Položeno" : "Nije položeno"}
                  </Text>
                </View>
                <View style={styles.testStatusItem}>
                  <Ionicons
                    name="book"
                    size={20}
                    color={testStatus.teorija ? "#10B981" : "#EF4444"}
                  />
                  <Text style={styles.testStatusText}>Teorija</Text>
                  <Text
                    style={[
                      styles.testStatusValue,
                      testStatus.teorija
                        ? styles.testPassed
                        : styles.testFailed,
                    ]}
                  >
                    {testStatus.teorija ? "Položeno" : "Nije položeno"}
                  </Text>
                </View>
                <View style={styles.testStatusItem}>
                  <Ionicons
                    name="car"
                    size={20}
                    color={testStatus.voznja ? "#10B981" : "#EF4444"}
                  />
                  <Text style={styles.testStatusText}>Vožnja</Text>
                  <Text
                    style={[
                      styles.testStatusValue,
                      testStatus.voznja ? styles.testPassed : styles.testFailed,
                    ]}
                  >
                    {testStatus.voznja ? "Položeno" : "Nije položeno"}
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Animacija zaključanog sadržaja ako nije položio testove */}
        {userData?.role === "candidate" && !canAccessVoznjeFlag && (
          <Animated.View
            style={[
              styles.lockedContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Animated.View
              style={[
                styles.lockedIconContainer,
                {
                  transform: [
                    { scale: pulseAnim },
                    { rotate: rotateInterpolate },
                  ],
                },
              ]}
            >
              <LinearGradient
                colors={["#2086F6", "#4FC377"]}
                style={styles.lockedIconGradient}
              >
                <Ionicons name="lock-closed" size={48} color="#FFF" />
              </LinearGradient>
            </Animated.View>

            <Text style={styles.lockedTitle}>Vožnje su zaključane</Text>
            <Text style={styles.lockedText}>
              Da biste pristupili vožnjama, morate prvo položiti testove teorije
              i prve pomoći.
            </Text>

            <View style={styles.requirementsList}>
              <View style={styles.requirementItem}>
                <Ionicons
                  name={
                    testStatus?.teorija ? "checkmark-circle" : "ellipse-outline"
                  }
                  size={20}
                  color={testStatus?.teorija ? "#10B981" : "#6B7280"}
                />
                <Text style={styles.requirementText}>
                  Položite teorijski test
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <Ionicons
                  name={
                    testStatus?.prvaPomoc
                      ? "checkmark-circle"
                      : "ellipse-outline"
                  }
                  size={20}
                  color={testStatus?.prvaPomoc ? "#10B981" : "#6B7280"}
                />
                <Text style={styles.requirementText}>
                  Položite test prve pomoći
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.testButton}
              onPress={() => router.push("/testovi")}
            >
              <LinearGradient
                colors={["#4FC377", "#2086F6"]}
                style={styles.testButtonGradient}
              >
                <Ionicons name="school" size={20} color="#FFF" />
                <Text style={styles.testButtonText}>Idi na testove</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* NADOLAZEĆE VOŽNJE - prikaži samo ako je položio testove */}
        {canAccessVoznjeFlag && (
          <Animated.View
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Nadolazeće vožnje</Text>
              <Text style={styles.sectionCount}>
                ({nadolazeceVoznje.length})
              </Text>
            </View>

            {nadolazeceVoznje.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
                <Text style={styles.emptyStateText}>
                  Nema nadolazećih vožnji
                </Text>
                {userData?.role === "candidate" && canAccessVoznjeFlag && (
                  <Text style={styles.emptyStateSubtext}>
                    Zakažite svoju prvu vožnju!
                  </Text>
                )}
              </View>
            ) : (
              nadolazeceVoznje.map((voznja) => (
                <TouchableOpacity
                  key={voznja._id}
                  style={styles.lessonCard}
                  onPress={() => handleVoznjaPress(voznja)}
                >
                  <View style={styles.lessonIcon}>
                    <Ionicons
                      name="car-sport"
                      size={24}
                      color={voznja.nocna ? "#F59E0B" : "#2086F6"}
                    />
                    {voznja.nocna && (
                      <Ionicons
                        name="moon"
                        size={12}
                        color="#F59E0B"
                        style={styles.nightIcon}
                      />
                    )}
                  </View>
                  <View style={styles.lessonInfo}>
                    <Text style={styles.lessonTime}>
                      {formatDatum(voznja.datum, voznja.vrijeme)}
                    </Text>
                    <Text style={styles.lessonInstructor}>
                      Instruktor: {voznja.instruktor.name}{" "}
                      {voznja.instruktor.surname}
                    </Text>
                    {voznja.nocna && (
                      <Text style={styles.nightText}>Noćna vožnja</Text>
                    )}
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(voznja.status) },
                    ]}
                  >
                    <Text style={styles.statusBadgeText}>
                      {getStatusText(voznja.status)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </Animated.View>
        )}

        {/* ZAVRŠENE VOŽNJE - prikaži samo ako je položio testove */}
        {canAccessVoznjeFlag && (
          <Animated.View
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Završene vožnje</Text>
              <Text style={styles.sectionCount}>({zavrseneVoznje.length})</Text>
            </View>

            {/* Statistika - prikaži samo za candidate koji su položili testove */}
            {userData?.role === "candidate" && canAccessVoznjeFlag && (
              <View style={styles.statsCard}>
                <View style={styles.statRow}>
                  <View style={styles.statItem}>
                    <Ionicons name="time" size={20} color="#2086F6" />
                    <Text style={styles.statsText}>
                      Ukupno sati: {ukupnoSati}/40
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#10B981"
                    />
                    <Text style={styles.statsText}>
                      Završeno vožnji: {zavrseneVoznjeCount}
                    </Text>
                  </View>
                </View>
                <View style={styles.statRow}>
                  <View style={styles.statItem}>
                    <Ionicons name="hourglass" size={20} color="#F59E0B" />
                    <Text style={styles.statsText}>
                      Preostalo sati: {preostaloSati}
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Ionicons name="speedometer" size={20} color="#EF4444" />
                    <Text style={styles.statsText}>
                      Progres: {Math.round((ukupnoSati / 40) * 100)}%
                    </Text>
                  </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${Math.min((ukupnoSati / 40) * 100, 100)}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {Math.round((ukupnoSati / 40) * 100)}% završeno
                  </Text>
                </View>
              </View>
            )}

            {/* Lista završenih vožnji */}
            {zavrseneVoznje.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="time-outline" size={48} color="#9CA3AF" />
                <Text style={styles.emptyStateText}>Nema završenih vožnji</Text>
              </View>
            ) : (
              zavrseneVoznje.map((voznja) => (
                <TouchableOpacity
                  key={voznja._id}
                  style={styles.lessonCard}
                  onPress={() => handleVoznjaPress(voznja)}
                >
                  <View style={styles.lessonIcon}>
                    <Ionicons
                      name="car-sport"
                      size={24}
                      color={voznja.nocna ? "#F59E0B" : "#6B7280"}
                    />
                  </View>
                  <View style={styles.lessonInfo}>
                    <Text style={[styles.lessonTime, { color: "#6B7280" }]}>
                      {formatDatum(voznja.datum, voznja.vrijeme)}
                    </Text>
                    <Text style={styles.lessonInstructor}>
                      Instruktor: {voznja.instruktor.name}{" "}
                      {voznja.instruktor.surname}
                    </Text>
                    
                    {/* Prikaži ocjenu i napomenu ako postoje */}
                    {voznja.ocjena && (
                      <View style={styles.ocjenaContainer}>
                        <Text style={[
                          styles.ocjenaText,
                          { color: getOcjenaColor(voznja.ocjena) }
                        ]}>
                          Ocjena: {getOcjenaText(voznja.ocjena)}
                        </Text>
                        {voznja.napomena && voznja.napomena.trim() !== "" && (
                          <Text style={styles.napomenaText}>
                            Napomena: {voznja.napomena}
                          </Text>
                        )}
                      </View>
                    )}
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(voznja.status) },
                    ]}
                  >
                    <Text style={styles.statusBadgeText}>
                      {getStatusText(voznja.status)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </Animated.View>
        )}

        {/* OTKAZANE VOŽNJE - prikaži samo ako ima otkazanih vožnji */}
        {canAccessVoznjeFlag && otkazaneVoznje.length > 0 && (
          <Animated.View
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Otkazane vožnje</Text>
              <Text style={styles.sectionCount}>({otkazaneVoznje.length})</Text>
            </View>

            {otkazaneVoznje.map((voznja) => (
              <TouchableOpacity
                key={voznja._id}
                style={styles.lessonCard}
                onPress={() => handleVoznjaPress(voznja)}
              >
                <View style={styles.lessonIcon}>
                  <Ionicons
                    name="car-sport"
                    size={24}
                    color="#EF4444"
                  />
                </View>
                <View style={styles.lessonInfo}>
                  <Text style={[styles.lessonTime, { color: "#EF4444" }]}>
                    {formatDatum(voznja.datum, voznja.vrijeme)}
                  </Text>
                  <Text style={styles.lessonInstructor}>
                    Instruktor: {voznja.instruktor.name}{" "}
                    {voznja.instruktor.surname}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(voznja.status) },
                  ]}
                >
                  <Text style={styles.statusBadgeText}>
                    {getStatusText(voznja.status)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}
      </ScrollView>

      {/* Modal za zakazivanje vožnje */}
      {userData?.role === "candidate" && canAccessVoznjeFlag && (
        <ZakaziVoznjuModal
          visible={showZakaziModal}
          onClose={() => setShowZakaziModal(false)}
          onSuccess={async () => {
            // Osveži listu vožnji nakon uspješnog zakazivanja
            const freshToken = await AsyncStorage.getItem("userToken");
            if (freshToken && userData) {
              await loadVoznje(freshToken, userData._id);
            }
          }}
        />
      )}

      {/* Modal za detalje vožnje */}
      {selectedVoznja && (
        <DetaljiVoznje
          visible={showDetaljiModal}
          onClose={handleCloseDetaljiModal}
          voznja={selectedVoznja}
          onOtkaziVoznju={handleOtkaziVoznju}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContent: {
    alignItems: "center",
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  header: {
    backgroundColor: "#2086F6",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  backButton: {
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
  },
  logoutButton: {
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
  },
  zakaziButton: {
    marginTop: 10,
  },
  zakaziButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  zakaziButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  refreshButton: {
    marginTop: 10,
  },
  refreshButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  refreshButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(239, 68, 68, 0.9)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  warningText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 6,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2086F6",
  },
  sectionCount: {
    fontSize: 16,
    color: "#6B7280",
    marginLeft: 8,
    fontWeight: "600",
  },
  // Locked content styles
  lockedContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    margin: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lockedIconContainer: {
    marginBottom: 20,
  },
  lockedIconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  lockedTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2086F6",
    marginBottom: 12,
    textAlign: "center",
  },
  lockedText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  requirementsList: {
    width: "100%",
    marginBottom: 24,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  requirementText: {
    fontSize: 16,
    color: "#374151",
    marginLeft: 12,
    fontWeight: "500",
  },
  testButton: {
    width: "100%",
  },
  testButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  testButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  testStatusCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  testStatusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  testStatusItem: {
    alignItems: "center",
    flex: 1,
  },
  testStatusText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 8,
    marginBottom: 4,
  },
  testStatusValue: {
    fontSize: 12,
    fontWeight: "600",
  },
  testPassed: {
    color: "#10B981",
  },
  testFailed: {
    color: "#EF4444",
  },
  lessonCard: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lessonIcon: {
    position: "relative",
    marginRight: 15,
  },
  nightIcon: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#FFF",
    borderRadius: 6,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTime: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2086F6",
    marginBottom: 4,
  },
  lessonInstructor: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  nightText: {
    fontSize: 12,
    color: "#F59E0B",
    fontWeight: "500",
  },
  ocjenaContainer: {
    marginTop: 8,
  },
  ocjenaText: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  napomenaText: {
    fontSize: 12,
    color: "#6B7280",
    fontStyle: "italic",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  statsCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  statsText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
    fontWeight: "500",
  },
  progressContainer: {
    marginTop: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#F1F3F4",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4FC377",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F1F3F4",
    borderStyle: "dashed",
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 4,
  },
});