import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Animated,
  Easing,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

type MainTestType = "prva-pomoc" | "teorija-voznje";
type SubTestType = "teorija" | "znak" | "raskrsnica" | "simulacija";

interface TestStats {
  completedTests: number;
  correctAnswers: number;
  totalQuestions: number;
  bestScore: number;
  averageScore: number;
  passedTests: number;
  successRate: number;
}

interface Odgovor {
  questionId: any;
  odabraniOdgovor: number;
  tacanOdgovor: number;
  jeTacno: boolean;
}

interface TestResult {
  _id: string;
  id: string;
  user: string;
  tip: string;
  subTip?: string;
  // NOVA POLJA KOJA API VRAĆA
  total: number;
  correctCount: number;
  score: number;
  passed: boolean;
  createdAt: string;
  // STARTA POLJA ZA BACKWARD COMPATIBILITY
  ukupnoPitanja?: number;
  ukupno_pitanja?: number;
  tacnoOdgovoreno?: number;
  tacno?: number;
  procentualniRezultat?: number;
  procentualni_rezultat?: string;
  polozen?: boolean;
  datum?: string;
  odgovori: Odgovor[];
}

interface UserResults {
  userId: string;
  tip?: string;
  subTip?: string;
  broj_testova: number;
  rezultati: TestResult[];
}

interface TypeStats {
  totalTests: number;
  averageScore: number;
  passedTests: number;
  successRate: number;
  bestScore: number;
  totalQuestions: number;
  totalCorrect: number;
}

export default function TestoviScreen() {
  const router = useRouter();
  const [selectedMainType, setSelectedMainType] = useState<MainTestType | null>(
    null
  );
  const [selectedSubType, setSelectedSubType] = useState<SubTestType | null>(
    null
  );
  const [userStats, setUserStats] = useState<TestStats>({
    completedTests: 0,
    correctAnswers: 0,
    totalQuestions: 0,
    bestScore: 0,
    averageScore: 0,
    passedTests: 0,
    successRate: 0,
  });
  const [userResults, setUserResults] = useState<UserResults | null>(null);
  const [typeStats, setTypeStats] = useState<{ [key: string]: TypeStats }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<
    "all" | "7days" | "today" | "30days"
  >("all");

  // Animacije
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];

  const API_BASE_URL = "http://192.168.1.9:5000";

  useEffect(() => {
    loadUserResults();
    startAnimations();
  }, []);

  useEffect(() => {
    if (userResults) {
      calculateStats();
    }
  }, [userResults, timeFilter]);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
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

  const handleApiError = (error: any, context: string) => {
    console.error(`API Error in ${context}:`, error);
    Alert.alert("Greška", `Došlo je do greške pri učitavanju ${context}`);
  };

  const loadUserResults = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      const userId = await AsyncStorage.getItem("userId");

      if (!userId) {
        console.log("User ID not found");
        setIsLoading(false);
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/testresults/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const results: UserResults = await response.json();
      console.log("✅ Učitani rezultati korisnika:", results);
      setUserResults(results);
    } catch (error) {
      handleApiError(error, "rezultata testova");
      setUserResults({
        userId: "",
        broj_testova: 0,
        rezultati: [],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterResultsByTime = (results: TestResult[]) => {
    if (!results || !Array.isArray(results)) {
      console.log("Invalid results array");
      return [];
    }

    const now = new Date();
    console.log(`Filtering ${results.length} results for: ${timeFilter}`);

    const filtered = results.filter((result) => {
      const resultDate = new Date(result.createdAt || result.datum);

      if (isNaN(resultDate.getTime())) {
        console.log("Invalid date for result:", result._id || result.id);
        return false;
      }

      switch (timeFilter) {
        case "today":
          const isToday = resultDate.toDateString() === now.toDateString();
          return isToday;
        case "7days":
          const sevenDaysAgo = new Date(
            now.getTime() - 7 * 24 * 60 * 60 * 1000
          );
          return resultDate >= sevenDaysAgo;
        case "30days":
          const thirtyDaysAgo = new Date(
            now.getTime() - 30 * 24 * 60 * 60 * 1000
          );
          return resultDate >= thirtyDaysAgo;
        case "all":
        default:
          return true;
      }
    });

    console.log(`Filtered to ${filtered.length} results`);
    return filtered;
  };

  const calculateStats = () => {
    if (
      !userResults ||
      !userResults.rezultati ||
      !Array.isArray(userResults.rezultati)
    ) {
      console.log("No valid results data available");
      setUserStats({
        completedTests: 0,
        correctAnswers: 0,
        totalQuestions: 0,
        bestScore: 0,
        averageScore: 0,
        passedTests: 0,
        successRate: 0,
      });
      setTypeStats({});
      return;
    }

    const filteredResults = filterResultsByTime(userResults.rezultati);
    console.log(`Filtered results for ${timeFilter}:`, filteredResults.length);

    if (filterResultsByTime.length === 0) {
      setUserStats({
        completedTests: 0,
        correctAnswers: 0,
        totalQuestions: 0,
        bestScore: 0,
        averageScore: 0,
        passedTests: 0,
        successRate: 0,
      });
      setTypeStats({});
      return;
    }

    // DEBUG: Prikaži prva 3 rezultata za provjeru
    console.log("Sample results:", filteredResults.slice(0, 3));

    // UKUPNA STATISTIKA - KORIGOVANO ZA NOVA POLJA
    const totalTests = filteredResults.length;
    const totalQuestions = filteredResults.reduce(
      (sum, result) =>
        sum +
        (result.total || result.ukupnoPitanja || result.ukupno_pitanja || 0),
      0
    );
    const totalCorrect = filteredResults.reduce(
      (sum, result) =>
        sum +
        (result.correctCount || result.tacnoOdgovoreno || result.tacno || 0),
      0
    );
    const passedTests = filteredResults.filter(
      (result) => result.passed || result.polozen
    ).length;

    // KORIGOVANO RAČUNANJE SCORE-A - KORISTI NOVA POLJA
    const scores = filteredResults.map((result) => {
      // Prvo pokušaj sa novim poljima, pa sa starim
      let score =
        result.score ||
        result.procentualniRezultat ||
        parseFloat(result.procentualni_rezultat || "0");

      // Ako je score još uvijek 0 ili NaN, izračunaj ga
      if (isNaN(score) || score === 0) {
        const pitanja =
          result.total || result.ukupnoPitanja || result.ukupno_pitanja || 1;
        const tacno =
          result.correctCount || result.tacnoOdgovoreno || result.tacno || 0;
        score = (tacno / pitanja) * 100;
      }

      return isNaN(score) ? 0 : score;
    });

    const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
    const averageScore =
      scores.length > 0
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length
        : 0;
    const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

    console.log("📈 Nova statistika:", {
      totalTests,
      totalQuestions,
      totalCorrect,
      passedTests,
      bestScore,
      averageScore,
      successRate,
    });

    setUserStats({
      completedTests: totalTests,
      correctAnswers: totalCorrect,
      totalQuestions: totalQuestions,
      bestScore: bestScore,
      averageScore: averageScore,
      passedTests: passedTests,
      successRate: successRate,
    });

    // STATISTIKA PO TIPOVIMA - POBOLJŠANO SA NOVIM POLJIMA
    const statsByType: { [key: string]: TypeStats } = {};

    filteredResults.forEach((result) => {
      const tip = result.tip || "unknown";

      if (!statsByType[tip]) {
        statsByType[tip] = {
          totalTests: 0,
          averageScore: 0,
          passedTests: 0,
          successRate: 0,
          bestScore: 0,
          totalQuestions: 0,
          totalCorrect: 0,
        };
      }

      const typeStat = statsByType[tip];
      typeStat.totalTests += 1;
      typeStat.totalQuestions +=
        result.total || result.ukupnoPitanja || result.ukupno_pitanja || 0;
      typeStat.totalCorrect +=
        result.correctCount || result.tacnoOdgovoreno || result.tacno || 0;
      if (result.passed || result.polozen) typeStat.passedTests += 1;

      // Poboljšano računanje score-a za tip
      let score =
        result.score ||
        result.procentualniRezultat ||
        parseFloat(result.procentualni_rezultat || "0");
      if (isNaN(score) || score === 0) {
        const pitanja =
          result.total || result.ukupnoPitanja || result.ukupno_pitanja || 1;
        const tacno =
          result.correctCount || result.tacnoOdgovoreno || result.tacno || 0;
        score = (tacno / pitanja) * 100;
      }

      if (!isNaN(score) && score > typeStat.bestScore) {
        typeStat.bestScore = score;
      }
    });

    // Izračunaj prosjeke i stope uspjeha za svaki tip
    Object.keys(statsByType).forEach((type) => {
      const stat = statsByType[type];
      stat.averageScore =
        stat.totalQuestions > 0
          ? (stat.totalCorrect / stat.totalQuestions) * 100
          : 0;
      stat.successRate =
        stat.totalTests > 0 ? (stat.passedTests / stat.totalTests) * 100 : 0;

      console.log(`Stats for ${type}:`, stat);
    });

    setTypeStats(statsByType);
  };

  const getTypeDisplayName = (type: string) => {
    const typeMap: { [key: string]: string } = {
      prva_pomoc: "Prva Pomoc",
      teorija: "Teorija Vožnje",
      znak: "Saobraćajni Znakovi",
      znakovi: "Saobraćajni Znakovi",
      raskrsnica: "Raskrsnice",
      simulacija: "Simulacija Ispita",
      unknown: "Nepoznato",
    };
    return typeMap[type] || type;
  };

  const getTypeIcon = (type: string) => {
    const iconMap: { [key: string]: string } = {
      prva_pomoc: "medkit",
      teorija: "book",
      znak: "warning",
      znakovi: "warning",
      raskrsnica: "git-merge",
      simulacija: "school",
      unknown: "help-circle",
    };
    return iconMap[type] || "help-circle";
  };

  const getTypeColor = (type: string) => {
    const colorMap: { [key: string]: string } = {
      prva_pomoc: "#FF6B6B",
      teorija: "#2086F6",
      znak: "#4FC377",
      znakovi: "#4FC377",
      raskrsnica: "#8104FA",
      simulacija: "#FF9A76",
      unknown: "#666",
    };
    return colorMap[type] || "#666";
  };

  const mainTestTypes = [
    {
      id: "prva-pomoc" as MainTestType,
      title: "Prva Pomoc",
      icon: "medkit",
      color: "#FF6B6B",
      description: "Testovi iz prve pomoći za vozače",
    },
    {
      id: "teorija-voznje" as MainTestType,
      title: "Teorija Vožnje",
      icon: "car-sport",
      color: "#4ECDC4",
      description: "Pravila saobraćaja i teorija vožnje",
    },
  ];

  const subTestTypes = [
    {
      id: "teorija" as SubTestType,
      title: "Teorijski Dio",
      icon: "book",
      color: "#2086F6",
      description: "Opšta pravila saobraćaja",
    },
    {
      id: "znak" as SubTestType,
      title: "Saobraćajni Znakovi",
      icon: "warning",
      color: "#4FC377",
      description: "Prepoznavanje saobraćajnih znakova",
    },
    {
      id: "raskrsnica" as SubTestType,
      title: "Raskrsnice",
      icon: "git-merge",
      color: "#8104FA",
      description: "Pravila prolaska kroz raskrsnice",
    },
    {
      id: "simulacija" as SubTestType,
      title: "Simulacija Ispita",
      icon: "school",
      color: "#FF9A76",
      description: "Prava simulacija vozačkog ispita",
    },
  ];

  const getPracticeOptions = () => {
    const baseOptions = [
      {
        id: "lekcije",
        title: "Lekcijski Testovi",
        icon: "library",
        color: "#FFD93D",
        description: "Uči po lekcijama i temama",
      },
      {
        id: "nasumicni",
        title: "Nasumični Test",
        icon: "shuffle",
        color: "#6BCF7F",
        description: "Test sa nasumičnim pitanjima",
      },
    ];

    return baseOptions;
  };

  // API FUNKCIJE
  const getQuestionsByType = async (tip: string, subTip?: string) => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem("userToken");

      let url = `${API_BASE_URL}/api/tests/tip/${tip}`;

      // Ako postoji subTip, koristi kombinovani endpoint
      if (subTip) {
        url = `${API_BASE_URL}/api/testresults/user/${await AsyncStorage.getItem(
          "userId"
        )}/${tip}/${subTip}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Ako je subTip, vrati rezultate, inače vrati pitanja
      if (subTip) {
        return data.rezultati || [];
      } else {
        return data.slice(0, 10); // Max 10 pitanja za obične testove
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      Alert.alert("Greška", "Došlo je do greške pri učitavanju pitanja");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const handleMainTypeSelect = (type: MainTestType) => {
    setSelectedMainType(type);
    setSelectedSubType(null);
  };

  const handleSubTypeSelect = (type: SubTestType) => {
    setSelectedSubType(type);
  };

  const handlePracticeStart = async (optionId: string) => {
    if (!selectedMainType) {
      Alert.alert("Greška", "Molimo odaberite vrstu testa");
      return;
    }

    if (isLoading) return;

    try {
      // 👇 LEKCIJE ZA PRVU POMOĆ
      if (selectedMainType === "prva-pomoc" && optionId === "lekcije") {
        console.log("➡️ Preusmjeravam na Lekcije prve pomoći");
        router.push("/prva-pomoc/lekcije");
        return;
      }

      // 👇 NASUMIČNI TESTOVI ZA PRVU POMOĆ
      if (selectedMainType === "prva-pomoc" && optionId === "nasumicni") {
        console.log("➡️ Preusmjeravam na nasumične testove prve pomoći");
        router.push("/prva-pomoc/nasumicni-test");
        return;
      }

      // 👇 TEORIJA VOŽNJE - LEKCIJSKI TESTOVI
      if (selectedMainType === "teorija-voznje" && optionId === "lekcije") {
        if (!selectedSubType) {
          Alert.alert("Greška", "Molimo odaberite podvrstu testa");
          return;
        }

        console.log(`➡️ Lekcijski testovi za: ${selectedSubType}`);

        // Preusmjeri na odgovarajuće lekcije
        switch (selectedSubType) {
          case "teorija":
            router.push("/teorija-voznje/lekcije");
            break;
          case "znak":
            router.push("/saobracajni-znakovi/lekcije");
            break;
          case "raskrsnica":
            router.push("/raskrsnice/lekcije");
            break;
          case "simulacija":
            router.push("/simulacija/lekcije");
            break;
          default:
            Alert.alert("Greška", "Nepoznata vrsta testa");
        }
        return;
      }
      
      // 👇 TEORIJA VOŽNJE - NASUMIČNI TESTOVI
      if (selectedMainType === "teorija-voznje" && optionId === "nasumicni") {
        if (!selectedSubType) {
          Alert.alert("Greška", "Molimo odaberite podvrstu testa");
          return;
        }

        console.log(`➡️ Nasumični testovi za: ${selectedSubType}`);

        // Preusmjeri na odgovarajuće nasumične testove
        switch (selectedSubType) {
          case "teorija":
            router.push("/teorija-voznje/nasumicni-test");
            break;
          case "znak":
            router.push("/saobracajni-znakovi/nasumicni-test");
            break;
          case "raskrsnica":
            router.push("/raskrsnice/nasumicni-test");
            break;
          case "simulacija":
            router.push("/simulacija/nasumicni-test");
            break;
          default:
            Alert.alert("Greška", "Nepoznata vrsta testa");
        }
        return;
      }

      // Fallback za ostale slučajeve
      Alert.alert("Info", "Funkcionalnost će biti implementirana uskoro");
    } catch (error) {
      console.error("Error starting test:", error);
      Alert.alert("Greška", "Došlo je do greške pri pokretanju testa");
    }
  };

  // Safe number formatting
  const formatNumber = (
    value: number | undefined,
    decimals: number = 1
  ): string => {
    if (value === undefined || value === null || isNaN(value)) {
      return "0";
    }
    return value.toFixed(decimals);
  };

  return (
    <View style={styles.container}>
      {/* Improved Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.headerBackground}>
          <View style={styles.headerContent}>
            <View style={styles.titleContainer}>
              <Text style={styles.headerTitle}>Testovi</Text>
              <View style={styles.subtitleContainer}>
                <Ionicons name="car-sport" size={20} color="#FFD93D" />
                <Text style={styles.headerSubtitle}>
                  Statistika i vježbanje
                </Text>
              </View>
            </View>
            <View style={styles.headerStats}>
              <View style={styles.headerStat}>
                <Text style={styles.headerStatNumber}>
                  {userStats.completedTests}
                </Text>
                <Text style={styles.headerStatLabel}>Testova</Text>
              </View>
              <View style={styles.headerStat}>
                <Text style={styles.headerStatNumber}>
                  {formatNumber(userStats.bestScore, 0)}%
                </Text>
                <Text style={styles.headerStatLabel}>Rekord</Text>
              </View>
            </View>
          </View>

          {/* Filter Buttons */}
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                timeFilter === "today" && styles.filterButtonActive,
              ]}
              onPress={() => setTimeFilter("today")}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  timeFilter === "today" && styles.filterButtonTextActive,
                ]}
              >
                Danas
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                timeFilter === "7days" && styles.filterButtonActive,
              ]}
              onPress={() => setTimeFilter("7days")}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  timeFilter === "7days" && styles.filterButtonTextActive,
                ]}
              >
                7 Dana
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                timeFilter === "30days" && styles.filterButtonActive,
              ]}
              onPress={() => setTimeFilter("30days")}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  timeFilter === "30days" && styles.filterButtonTextActive,
                ]}
              >
                30 Dana
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                timeFilter === "all" && styles.filterButtonActive,
              ]}
              onPress={() => setTimeFilter("all")}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  timeFilter === "all" && styles.filterButtonTextActive,
                ]}
              >
                Sve
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Ukupna Statistika */}
        {userStats.completedTests > 0 && (
          <Animated.View
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.sectionTitle}>Ukupna Statistika</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="stats-chart" size={20} color="#2086F6" />
                </View>
                <Text style={styles.statNumber}>
                  {userStats.completedTests}
                </Text>
                <Text style={styles.statLabel}>Odrađenih testova</Text>
              </View>
              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="trophy" size={20} color="#FFD93D" />
                </View>
                <Text style={styles.statNumber}>
                  {formatNumber(userStats.bestScore, 1)}%
                </Text>
                <Text style={styles.statLabel}>Najbolji rezultat</Text>
              </View>
              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="school" size={20} color="#4FC377" />
                </View>
                <Text style={styles.statNumber}>{userStats.passedTests}</Text>
                <Text style={styles.statLabel}>Položenih testova</Text>
              </View>
              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="trending-up" size={20} color="#FF6B6B" />
                </View>
                <Text style={styles.statNumber}>
                  {formatNumber(userStats.successRate, 1)}%
                </Text>
                <Text style={styles.statLabel}>Stopa uspjeha</Text>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Statistika po Vrstama Testova */}
        {Object.keys(typeStats).length > 0 && (
          <Animated.View
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.sectionTitle}>Statistika po Vrstama</Text>
            <Text style={styles.sectionSubtitle}>
              Performanse po kategorijama
            </Text>

            <View style={styles.typeStatsContainer}>
              {Object.entries(typeStats).map(([type, stats]) => (
                <View key={type} style={styles.typeStatCard}>
                  <View style={styles.typeStatHeader}>
                    <View
                      style={[
                        styles.typeIcon,
                        { backgroundColor: getTypeColor(type) },
                      ]}
                    >
                      <Ionicons
                        name={getTypeIcon(type) as any}
                        size={16}
                        color="#FFF"
                      />
                    </View>
                    <Text style={styles.typeStatTitle}>
                      {getTypeDisplayName(type)}
                    </Text>
                  </View>

                  <View style={styles.typeStatGrid}>
                    <View style={styles.typeStatItem}>
                      <Text style={styles.typeStatValue}>
                        {stats.totalTests}
                      </Text>
                      <Text style={styles.typeStatLabel}>Testova</Text>
                    </View>
                    <View style={styles.typeStatItem}>
                      <Text style={styles.typeStatValue}>
                        {formatNumber(stats.averageScore, 1)}%
                      </Text>
                      <Text style={styles.typeStatLabel}>Prosjek</Text>
                    </View>
                    <View style={styles.typeStatItem}>
                      <Text style={styles.typeStatValue}>
                        {stats.passedTests}
                      </Text>
                      <Text style={styles.typeStatLabel}>Položeno</Text>
                    </View>
                    <View style={styles.typeStatItem}>
                      <Text style={styles.typeStatValue}>
                        {formatNumber(stats.bestScore, 1)}%
                      </Text>
                      <Text style={styles.typeStatLabel}>Rekord</Text>
                    </View>
                  </View>

                  <View style={styles.progressContainer}>
                    <View style={styles.progressLabel}>
                      <Text style={styles.progressText}>Stopa uspjeha:</Text>
                      <Text style={styles.progressPercentage}>
                        {formatNumber(stats.successRate, 1)}%
                      </Text>
                    </View>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${Math.min(stats.successRate, 100)}%`,
                            backgroundColor: getTypeColor(type),
                          },
                        ]}
                      />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Loading State */}
        {isLoading && (
          <Animated.View
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" color="#2086F6" />
              <Text style={styles.loadingStateText}>
                Učitavanje statistike...
              </Text>
            </View>
          </Animated.View>
        )}

        {/* No Data State */}
        {!isLoading && userStats.completedTests === 0 && (
          <Animated.View
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.noDataState}>
              <Ionicons name="stats-chart" size={64} color="#CCCCCC" />
              <Text style={styles.noDataTitle}>Nema podataka</Text>
              <Text style={styles.noDataText}>
                Još niste odradili nijedan test. Odaberite vrstu testa ispod i
                započnite vježbanje!
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Main Test Type Selection */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.sectionTitle}>Odaberi Vrstu Testa</Text>
          <Text style={styles.sectionSubtitle}>Što želiš vježbati?</Text>

          <View style={styles.mainTypesGrid}>
            {mainTestTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.mainTypeCard,
                  selectedMainType === type.id && styles.mainTypeCardSelected,
                  { borderColor: type.color },
                ]}
                onPress={() => handleMainTypeSelect(type.id)}
                disabled={isLoading}
              >
                <View
                  style={[styles.mainTypeIcon, { backgroundColor: type.color }]}
                >
                  <Ionicons name={type.icon as any} size={32} color="#FFF" />
                </View>
                <Text style={styles.mainTypeTitle}>{type.title}</Text>
                <Text style={styles.mainTypeDescription}>
                  {type.description}
                </Text>
                {selectedMainType === type.id && (
                  <View
                    style={[
                      styles.selectedIndicator,
                      { backgroundColor: type.color },
                    ]}
                  >
                    <Ionicons name="checkmark" size={20} color="#FFF" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Sub Test Type Selection - Only for Teorija Voznje */}
        {selectedMainType === "teorija-voznje" && (
          <Animated.View
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.sectionTitle}>Podvrste Testova</Text>
            <Text style={styles.sectionSubtitle}>
              Odaberi specifičnu oblast
            </Text>

            <View style={styles.subTypesGrid}>
              {subTestTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.subTypeCard,
                    selectedSubType === type.id && styles.subTypeCardSelected,
                    { borderColor: type.color },
                  ]}
                  onPress={() => handleSubTypeSelect(type.id)}
                  disabled={isLoading}
                >
                  <View
                    style={[
                      styles.subTypeIcon,
                      { backgroundColor: type.color },
                    ]}
                  >
                    <Ionicons name={type.icon as any} size={24} color="#FFF" />
                  </View>
                  <Text style={styles.subTypeTitle}>{type.title}</Text>
                  <Text style={styles.subTypeDescription}>
                    {type.description}
                  </Text>
                  {selectedSubType === type.id && (
                    <View
                      style={[
                        styles.selectedIndicator,
                        { backgroundColor: type.color },
                      ]}
                    >
                      <Ionicons name="checkmark" size={16} color="#FFF" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Practice Options - Show when main type is selected */}
        {selectedMainType && (
          <Animated.View
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.sectionTitle}>Načini Vježbanja</Text>
            <Text style={styles.sectionSubtitle}>Kako želiš vježbati?</Text>

            {/* Standardne opcije vježbanja */}
            <View style={styles.practiceGrid}>
              {getPracticeOptions().map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.practiceCard,
                    isLoading && styles.practiceCardDisabled,
                  ]}
                  onPress={() => handlePracticeStart(option.id)}
                  disabled={
                    isLoading ||
                    (selectedMainType === "teorija-voznje" && !selectedSubType)
                  }
                >
                  <View
                    style={[
                      styles.practiceIcon,
                      { backgroundColor: option.color },
                    ]}
                  >
                    <Ionicons
                      name={option.icon as any}
                      size={24}
                      color="#FFF"
                    />
                  </View>
                  <Text style={styles.practiceTitle}>{option.title}</Text>
                  <Text style={styles.practiceDescription}>
                    {option.description}
                  </Text>

                  <View style={styles.practiceButton}>
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#2086F6" />
                    ) : (
                      <>
                        <Text style={styles.practiceButtonText}>Kreni</Text>
                        <Ionicons
                          name="arrow-forward"
                          size={14}
                          color="#2086F6"
                        />
                      </>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

// STYLES OSTAJU ISTI KAO U PRETHODNOM KODU
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    backgroundColor: "#2086F6",
    paddingBottom: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerBackground: {
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  titleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    marginLeft: 8,
    fontWeight: "500",
  },
  headerStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerStat: {
    alignItems: "center",
    marginLeft: 20,
  },
  headerStatNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFD93D",
    marginBottom: 2,
  },
  headerStatLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500",
  },
  filterContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    padding: 4,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  filterButtonActive: {
    backgroundColor: "#FFFFFF",
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
  },
  filterButtonTextActive: {
    color: "#2086F6",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  section: {
    backgroundColor: "#FFFFFF",
    margin: 20,
    marginTop: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2086F6",
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  // Ukupna statistika stilovi
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: "48%",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    alignItems: "center",
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2086F6",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: "#666",
    textAlign: "center",
  },
  // Statistika po tipovima stilovi
  typeStatsContainer: {
    marginTop: 10,
  },
  typeStatCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#2086F6",
  },
  typeStatHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  typeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  typeStatTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2086F6",
  },
  typeStatGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  typeStatItem: {
    alignItems: "center",
    flex: 1,
  },
  typeStatValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2086F6",
    marginBottom: 2,
  },
  typeStatLabel: {
    fontSize: 11,
    color: "#666",
  },
  progressContainer: {
    marginTop: 8,
  },
  progressLabel: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  progressText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  progressPercentage: {
    fontSize: 12,
    color: "#2086F6",
    fontWeight: "bold",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  // Loading i no data states
  loadingState: {
    alignItems: "center",
    padding: 20,
  },
  loadingStateText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  noDataState: {
    alignItems: "center",
    padding: 20,
  },
  noDataTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    marginTop: 10,
    marginBottom: 5,
  },
  noDataText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    lineHeight: 20,
  },
  mainTypesGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  mainTypeCard: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 5,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  mainTypeCardSelected: {
    borderColor: "#2086F6",
    backgroundColor: "#FFFFFF",
    shadowColor: "#2086F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  mainTypeIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  mainTypeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2086F6",
    marginBottom: 5,
    textAlign: "center",
  },
  mainTypeDescription: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  subTypesGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  subTypeCard: {
    width: "48%",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  subTypeCardSelected: {
    borderColor: "#2086F6",
    backgroundColor: "#FFFFFF",
  },
  subTypeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  subTypeTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2086F6",
    marginBottom: 5,
    textAlign: "center",
  },
  subTypeDescription: {
    fontSize: 11,
    color: "#666",
    textAlign: "center",
  },
  selectedIndicator: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  practiceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  practiceCard: {
    width: "48%",
    backgroundColor: "#F8F9FA",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    alignItems: "center",
  },
  practiceCardDisabled: {
    opacity: 0.6,
  },
  practiceIcon: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  practiceTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2086F6",
    marginBottom: 5,
    textAlign: "center",
  },
  practiceDescription: {
    fontSize: 11,
    color: "#666",
    textAlign: "center",
    marginBottom: 10,
  },
  practiceButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#2086F6",
  },
  practiceButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2086F6",
    marginRight: 4,
  },
});