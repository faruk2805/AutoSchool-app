import React, { useState, useEffect } from 'react';
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
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface TestStats {
  completedTests: number;
  correctAnswers: number;
  totalQuestions: number;
  incorrectAnswers: number;
  bestScore: number;
  averageScore: number;
}

interface Question {
  _id: string;
  tip: string;
  tema: string;
  pitanje: string;
  opcije: { _id: string; text: string; correct: boolean }[];
  objasnjenje: string;
  slika: string;
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
  odgovori: Array<{
    questionId: any;
    odgovor: string;
    tacno: boolean;
    _id: string;
  }>;
}

interface UserResultsResponse {
  userId: string;
  broj_testova: number;
  rezultati: TestResult[];
}

interface UserData {
  _id: string;
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function NasumicniTestSve() {
  const router = useRouter();
  const [userStats, setUserStats] = useState<TestStats>({
    completedTests: 0,
    correctAnswers: 0,
    totalQuestions: 0,
    incorrectAnswers: 0,
    bestScore: 0,
    averageScore: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [questionsByType, setQuestionsByType] = useState({
    teorija: 0,
    znakovi: 0,
    raskrsnice: 0
  });

  // Animacije
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideUpAnim = useState(new Animated.Value(30))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];
  const progressAnim = useState(new Animated.Value(0))[0];
  const cardSlideAnim = useState(new Animated.Value(50))[0];
  const modalScaleAnim = useState(new Animated.Value(0.8))[0];
  const modalOpacityAnim = useState(new Animated.Value(0))[0];

  const API_BASE_URL = 'http://192.168.1.9:5000';

  useEffect(() => {
    checkUserAndLoadData();
  }, []);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(cardSlideAnim, {
        toValue: 0,
        duration: 1000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    ]).start();

    // Animate progress circle
    Animated.timing(progressAnim, {
      toValue: calculateProgress() / 100,
      duration: 1500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  };

  const showResultsModalAnimation = () => {
    setShowResultsModal(true);
    Animated.parallel([
      Animated.timing(modalScaleAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacityAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    ]).start();
  };

  const hideResultsModalAnimation = () => {
    Animated.parallel([
      Animated.timing(modalScaleAnim, {
        toValue: 0.8,
        duration: 300,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacityAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      })
    ]).start(() => {
      setShowResultsModal(false);
      setTestResults(null);
    });
  };

  const checkUserAndLoadData = async () => {
    try {
      console.log('🔐 Provjeravam prijavu korisnika...');
      
      const userDataString = await AsyncStorage.getItem('userData');
      
      if (!userDataString) {
        console.log('❌ Korisnik nije prijavljen, preusmjeravam na login...');
        Alert.alert(
          'Potrebna prijava',
          'Morate biti prijavljeni da biste pristupili testovima',
          [
            {
              text: 'Prijavi se',
              onPress: () => router.replace('/login')
            }
          ]
        );
        setIsLoading(false);
        return;
      }

      const userData: UserData = JSON.parse(userDataString);
      console.log('✅ Korisnik prijavljen:', userData);
      
      const user_Id = userData._id;
      setUserId(user_Id);

      if (!user_Id) {
        throw new Error('User ID nije pronađen');
      }

      console.log('👤 User ID:', user_Id);
      
      await Promise.all([
        loadUserStats(user_Id),
        loadMixedQuestions()
      ]);

      startAnimations();

    } catch (error) {
      console.log('🚨 Greška pri provjeri korisnika:', error);
      Alert.alert(
        'Greška',
        'Došlo je do greške pri učitavanju podataka',
        [
          {
            text: 'Prijavi se ponovo',
            onPress: () => router.replace('/login')
          }
        ]
      );
      setIsLoading(false);
    }
  };

  const loadUserStats = async (user_Id: string) => {
    try {
      console.log('📊 Učitavam statistiku korisnika sa APIja...', user_Id);

      const response = await fetch(`${API_BASE_URL}/api/testresults/user/${user_Id}`);
      
      console.log('📡 API Results status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const userResults: UserResultsResponse = await response.json();
      console.log('✅ Učitani rezultati korisnika:', userResults);

      // Računamo sve rezultate zajedno
      const allResults = userResults.rezultati;

      console.log('📈 Ukupno rezultata:', allResults.length, 'testova');

      let completedTests = allResults.length;
      let totalCorrectAnswers = 0;
      let totalQuestions = 0;
      let totalIncorrectAnswers = 0;
      let bestScore = 0;
      let totalScore = 0;

      allResults.forEach(result => {
        totalCorrectAnswers += result.correctCount;
        totalQuestions += result.total;
        totalIncorrectAnswers += (result.total - result.correctCount);
        
        const score = result.score;
        totalScore += score;
        
        if (score > bestScore) {
          bestScore = score;
        }
      });

      const averageScore = completedTests > 0 ? totalScore / completedTests : 0;

      const newStats: TestStats = {
        completedTests,
        correctAnswers: totalCorrectAnswers,
        totalQuestions,
        incorrectAnswers: totalIncorrectAnswers,
        bestScore: Math.round(bestScore),
        averageScore: Math.round(averageScore)
      };

      console.log('📊 Nova statistika:', newStats);
      setUserStats(newStats);

    } catch (error) {
      console.log('🚨 Greška pri učitavanju statistike:', error);
      setUserStats({
        completedTests: 0,
        correctAnswers: 0,
        totalQuestions: 0,
        incorrectAnswers: 0,
        bestScore: 0,
        averageScore: 0
      });
    }
  };

  const loadMixedQuestions = async () => {
    try {
      console.log('🔍 Učitavam mješovita pitanja sa APIja...');
      setIsLoading(true);
      setLoadError(false);
      
      // Učitaj sve tipove pitanja
      const [teorijaResponse, znakoviResponse, raskrsniceResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/questions/tip/teorija`),
        fetch(`${API_BASE_URL}/api/questions/tip/znak`),
        fetch(`${API_BASE_URL}/api/questions/tip/raskrsnica`)
      ]);
      
      console.log('📡 API Response statusi:', {
        teorija: teorijaResponse.status,
        znakovi: znakoviResponse.status,
        raskrsnice: raskrsniceResponse.status
      });
      
      if (!teorijaResponse.ok || !znakoviResponse.ok || !raskrsniceResponse.ok) {
        throw new Error('HTTP error pri učitavanju pitanja');
      }
      
      const teorijaQuestions = await teorijaResponse.json();
      const znakoviQuestions = await znakoviResponse.json();
      const raskrsniceQuestions = await raskrsniceResponse.json();
      
      console.log('✅ Učitano pitanja:', {
        teorija: teorijaQuestions.length,
        znakovi: znakoviQuestions.length,
        raskrsnice: raskrsniceQuestions.length
      });
      
      if (!Array.isArray(teorijaQuestions) || !Array.isArray(znakoviQuestions) || !Array.isArray(raskrsniceQuestions)) {
        throw new Error('API nije vratio listu pitanja');
      }

      // Pomiješaj i odaberi pitanja
      const selectedTeorija = [...teorijaQuestions]
        .sort(() => 0.5 - Math.random())
        .slice(0, 10);
      
      const selectedZnakovi = [...znakoviQuestions]
        .sort(() => 0.5 - Math.random())
        .slice(0, 5);
      
      const selectedRaskrsnice = [...raskrsniceQuestions]
        .sort(() => 0.5 - Math.random())
        .slice(0, 5);

      const mixedQuestions = [
        ...selectedTeorija,
        ...selectedZnakovi,
        ...selectedRaskrsnice
      ].sort(() => 0.5 - Math.random()); // Dodatno miješanje svih pitanja

      setQuestionsByType({
        teorija: selectedTeorija.length,
        znakovi: selectedZnakovi.length,
        raskrsnice: selectedRaskrsnice.length
      });
      
      console.log('🎯 Odabrano mješovitih pitanja:', {
        ukupno: mixedQuestions.length,
        poTipovima: {
          teorija: selectedTeorija.length,
          znakovi: selectedZnakovi.length,
          raskrsnice: selectedRaskrsnice.length
        }
      });
      
      setQuestions(mixedQuestions);
      
    } catch (error) {
      console.error('🚨 Greška pri učitavanju mješovitih pitanja:', error);
      setLoadError(true);
      setQuestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const startTest = () => {
    if (!userId) {
      Alert.alert('Greška', 'Morate biti prijavljeni da biste započeli test');
      router.replace('/login');
      return;
    }

    if (questions.length === 0) {
      Alert.alert('Greška', 'Nema dostupnih pitanja za test');
      return;
    }

    console.log('🚀 Pokrećem MJEŠOVITI test sa pitanjima:', {
      ukupno: questions.length,
      poTipovima: questionsByType
    });
    
    router.push({
      pathname: "/testovi/mjesoviti-test-screen",
      params: {
        questions: JSON.stringify(questions),
        testType: 'mjesoviti-test',
        testMode: 'nasumicni',
        userId: userId,
        questionsByType: JSON.stringify(questionsByType)
      }
    });
  };

  const handleTestComplete = (results: any) => {
    setTestResults(results);
    showResultsModalAnimation();
    // Refresh stats after test completion
    if (userId) {
      loadUserStats(userId);
    }
  };

  const retryLoadQuestions = () => {
    loadMixedQuestions();
  };

  const calculateProgress = () => {
    if (userStats.totalQuestions === 0) return 0;
    const userProgress = (userStats.correctAnswers / userStats.totalQuestions) * 100;
    return Math.min(userProgress, 100);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Odjava',
      'Želite li se odjaviti?',
      [
        {
          text: 'Odustani',
          style: 'cancel'
        },
        {
          text: 'Odjavi se',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.multiRemove(['userToken', 'userData']);
            router.replace('/login');
          }
        }
      ]
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#4FC377';
    if (score >= 60) return '#FFB020';
    return '#FF6B6B';
  };

  const handleBackToTests = () => {
    hideResultsModalAnimation();
    router.push('/testovi');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />
        <LinearGradient
          colors={['#8B5CF6', '#EC4899']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Učitavam mješovita pitanja...</Text>
        </View>
      </View>
    );
  }

  if (!userId) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />
        <LinearGradient
          colors={['#8B5CF6', '#EC4899']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Provjera prijave...</Text>
        </View>
      </View>
    );
  }

  const progress = calculateProgress();
  const progressColor = getScoreColor(progress);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={['#8B5CF6', '#EC4899']}
        style={styles.backgroundGradient}
      />
      
      {/* Animated Background Elements */}
      <View style={styles.backgroundCircle1} />
      <View style={styles.backgroundCircle2} />

      {/* Header */}
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideUpAnim }]
          }
        ]}
      >
        <TouchableOpacity onPress={() => router.push('/testovi')} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Mješoviti Test</Text>
          <Text style={styles.headerSubtitle}>20 Nasumičnih Pitanja • Sve Kategorije</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="exit-outline" size={24} color="#FFF" />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Error Message */}
        {loadError && (
          <Animated.View 
            style={[
              styles.errorCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: cardSlideAnim }]
              }
            ]}
          >
            <Ionicons name="warning" size={40} color="#FF6B6B" />
            <Text style={styles.errorTitle}>Problem sa učitavanjem</Text>
            <Text style={styles.errorText}>
              Nema dostupnih pitanja. Provjeri internet konekciju i pokušaj ponovo.
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={retryLoadQuestions}>
              <Ionicons name="refresh" size={20} color="#FFF" />
              <Text style={styles.retryButtonText}>Pokušaj Ponovo</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Progress Overview */}
        <Animated.View 
          style={[
            styles.progressSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: cardSlideAnim }]
            }
          ]}
        >
          <View style={styles.sectionHeader}>
            <Ionicons name="trending-up" size={24} color="#1F2937" />
            <Text style={styles.sectionTitle}>Tvoj Napredak</Text>
          </View>
          
          <View style={styles.progressCard}>
            {/* Animated Progress Circle */}
            <View style={styles.progressCircleContainer}>
              <View style={styles.progressCircleBackground}>
                <Animated.View 
                  style={[
                    styles.progressCircleFill,
                    {
                      backgroundColor: progressColor,
                      transform: [{
                        rotate: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg']
                        })
                      }]
                    }
                  ]}
                />
                <View style={styles.progressCircleContent}>
                  <Text style={styles.progressPercentage}>
                    {Math.round(progress)}%
                  </Text>
                  <Text style={styles.progressLabel}>Ukupni Postotak</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: '#8B5CF6' }]}>
                  <Ionicons name="checkmark-done" size={20} color="#FFF" />
                </View>
                <Text style={styles.statNumber}>{userStats.completedTests}</Text>
                <Text style={styles.statLabel}>Završeno</Text>
              </View>
              
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: '#EC4899' }]}>
                  <Ionicons name="speedometer" size={20} color="#FFF" />
                </View>
                <Text style={styles.statNumber}>
                  {userStats.averageScore}%
                </Text>
                <Text style={styles.statLabel}>Prosjek</Text>
              </View>
              
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: '#FFB020' }]}>
                  <Ionicons name="trophy" size={20} color="#FFF" />
                </View>
                <Text style={styles.statNumber}>{userStats.bestScore}%</Text>
                <Text style={styles.statLabel}>Rekord</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Test Composition */}
        <Animated.View 
          style={[
            styles.compositionSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: cardSlideAnim }]
            }
          ]}
        >
          <View style={styles.sectionHeader}>
            <Ionicons name="layers" size={24} color="#1F2937" />
            <Text style={styles.sectionTitle}>Sastav Testa</Text>
          </View>
          
          <View style={styles.compositionCard}>
            <View style={styles.compositionItem}>
              <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
                style={styles.compositionIcon}
              >
                <Ionicons name="book" size={20} color="#FFF" />
              </LinearGradient>
              <View style={styles.compositionText}>
                <Text style={styles.compositionTitle}>10 Pitanja Teorije</Text>
                <Text style={styles.compositionDescription}>Pravila saobraćaja, propisi i teorijsko znanje</Text>
              </View>
              <View style={styles.compositionBadge}>
                <Text style={styles.compositionBadgeText}>{questionsByType.teorija}/10</Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.compositionItem}>
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.compositionIcon}
              >
                <Ionicons name="trail-sign" size={20} color="#FFF" />
              </LinearGradient>
              <View style={styles.compositionText}>
                <Text style={styles.compositionTitle}>5 Pitanja Znakovi</Text>
                <Text style={styles.compositionDescription}>Prepoznavanje i tumačenje saobraćajnih znakova</Text>
              </View>
              <View style={styles.compositionBadge}>
                <Text style={styles.compositionBadgeText}>{questionsByType.znakovi}/5</Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.compositionItem}>
              <LinearGradient
                colors={['#EF4444', '#DC2626']}
                style={styles.compositionIcon}
              >
                <Ionicons name="git-merge" size={20} color="#FFF" />
              </LinearGradient>
              <View style={styles.compositionText}>
                <Text style={styles.compositionTitle}>5 Pitanja Raskrsnice</Text>
                <Text style={styles.compositionDescription}>Rješavanje situacija na raskrsnicama</Text>
              </View>
              <View style={styles.compositionBadge}>
                <Text style={styles.compositionBadgeText}>{questionsByType.raskrsnice}/5</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Test Info */}
        <Animated.View 
          style={[
            styles.infoSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: cardSlideAnim }]
            }
          ]}
        >
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={24} color="#1F2937" />
            <Text style={styles.sectionTitle}>Informacije o Testu</Text>
          </View>
          
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <LinearGradient
                colors={['#8B5CF6', '#EC4899']}
                style={styles.infoIcon}
              >
                <Ionicons name="shuffle" size={20} color="#FFF" />
              </LinearGradient>
              <View style={styles.infoText}>
                <Text style={styles.infoTitle}>Nasumičan Odabir</Text>
                <Text style={styles.infoDescription}>Pitanja su pomiješana iz svih kategorija za pravi izazov</Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.infoItem}>
              <LinearGradient
                colors={['#10B981', '#8B5CF6']}
                style={styles.infoIcon}
              >
                <Ionicons name="time" size={20} color="#FFF" />
              </LinearGradient>
              <View style={styles.infoText}>
                <Text style={styles.infoTitle}>40 Minuta</Text>
                <Text style={styles.infoDescription}>Vrijeme za završetak kompletnog testa od 20 pitanja</Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.infoItem}>
              <LinearGradient
                colors={['#FFB020', '#EF4444']}
                style={styles.infoIcon}
              >
                <Ionicons name="trophy" size={20} color="#FFF" />
              </LinearGradient>
              <View style={styles.infoText}>
                <Text style={styles.infoTitle}>80% za Prolaz</Text>
                <Text style={styles.infoDescription}>Minimalni uspjeh potreban za pozitivan rezultat</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Quick Stats */}
        <Animated.View 
          style={[
            styles.statsSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: cardSlideAnim }]
            }
          ]}
        >
          <View style={styles.sectionHeader}>
            <Ionicons name="stats-chart" size={24} color="#1F2937" />
            <Text style={styles.sectionTitle}>Statistika</Text>
          </View>
          
          <View style={styles.quickStatsGrid}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.quickStat}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="checkmark-circle" size={32} color="#FFF" />
              <Text style={styles.quickStatNumber}>{userStats.correctAnswers}</Text>
              <Text style={styles.quickStatLabel}>Tačnih Odgovora</Text>
            </LinearGradient>
            
            <LinearGradient
              colors={['#8B5CF6', '#7C3AED']}
              style={styles.quickStat}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="list" size={32} color="#FFF" />
              <Text style={styles.quickStatNumber}>{userStats.totalQuestions}</Text>
              <Text style={styles.quickStatLabel}>Ukupno Pitanja</Text>
            </LinearGradient>
            
            <LinearGradient
              colors={['#EF4444', '#DC2626']}
              style={styles.quickStat}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="close-circle" size={32} color="#FFF" />
              <Text style={styles.quickStatNumber}>
                {userStats.incorrectAnswers}
              </Text>
              <Text style={styles.quickStatLabel}>Netačnih Odgovora</Text>
            </LinearGradient>
          </View>
        </Animated.View>

        {/* Motivational Message */}
        <Animated.View 
          style={[
            styles.motivationSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: cardSlideAnim }]
            }
          ]}
        >
          <View style={styles.motivationCard}>
            <Ionicons name="sparkles" size={32} color="#8B5CF6" />
            <Text style={styles.motivationTitle}>Spreman za sveobuhvatni izazov?</Text>
            <Text style={styles.motivationText}>
              {userStats.completedTests > 0 
                ? `Već si završio ${userStats.completedTests} testova! Ovo je prilika da testiraš svoje znanje iz svih oblasti.`
                : 'Ovo je tvoja prilika da pokažeš sveobuhvatno znanje o saobraćaju!'
              }
            </Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Start Button */}
      <Animated.View 
        style={[
          styles.footer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideUpAnim }]
          }
        ]}
      >
        <TouchableOpacity 
          style={[
            styles.startButton,
            questions.length === 0 && styles.startButtonDisabled
          ]}
          onPress={startTest}
          disabled={questions.length === 0}
        >
          <LinearGradient
            colors={questions.length === 0 ? ['#9CA3AF', '#6B7280'] : ['#8B5CF6', '#EC4899']}
            style={styles.startButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="play" size={24} color="#FFF" />
            <Text style={styles.startButtonText}>
              {questions.length > 0 
                ? `Započni Mješoviti Test • ${questions.length} Pitanja` 
                : 'Nema Dostupnih Pitanja'
              }
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Results Modal */}
      <Modal
        visible={showResultsModal}
        transparent={true}
        animationType="none"
        onRequestClose={hideResultsModalAnimation}
      >
        <Animated.View style={[styles.modalOverlay, { opacity: modalOpacityAnim }]}>
          <Animated.View style={[
            styles.modalContent,
            {
              opacity: modalOpacityAnim,
              transform: [{ scale: modalScaleAnim }]
            }
          ]}>
            <LinearGradient
              colors={testResults?.passed ? ['#10B981', '#059669'] : ['#EF4444', '#DC2626']}
              style={styles.modalHeader}
            >
              <View style={styles.modalIconContainer}>
                <Ionicons 
                  name={testResults?.passed ? "trophy" : "close-circle"} 
                  size={48} 
                  color="#FFF" 
                />
              </View>
              <Text style={styles.modalTitle}>
                {testResults?.passed ? 'Čestitamo! 🎉' : 'Pokušajte Ponovo'}
              </Text>
              <Text style={styles.modalSubtitle}>
                {testResults?.passed ? 'Uspješno ste završili mješoviti test!' : 'Mješoviti test nije položen'}
              </Text>
            </LinearGradient>

            <View style={styles.modalBody}>
              <View style={styles.resultStats}>
                <View style={styles.resultStat}>
                  <Text style={styles.resultStatNumber}>
                    {testResults?.correctCount || 0}/{testResults?.total || 0}
                  </Text>
                  <Text style={styles.resultStatLabel}>Tačnih odgovora</Text>
                </View>
                
                <View style={styles.resultStat}>
                  <Text style={styles.resultStatNumber}>
                    {testResults?.score ? `${testResults.score}%` : '0%'}
                  </Text>
                  <Text style={styles.resultStatLabel}>Postotak</Text>
                </View>
                
                <View style={styles.resultStat}>
                  <Ionicons 
                    name={testResults?.passed ? "checkmark-circle" : "close-circle"} 
                    size={32} 
                    color={testResults?.passed ? "#10B981" : "#EF4444"} 
                  />
                  <Text style={styles.resultStatLabel}>
                    {testResults?.passed ? 'POLOŽENO' : 'PALO'}
                  </Text>
                </View>
              </View>

              <View style={styles.modalDivider} />

              <Text style={styles.modalMessage}>
                {testResults?.passed 
                  ? 'Odlično ste savladali sve kategorije! Pokazali ste sveobuhvatno znanje o saobraćaju.'
                  : 'Potrebno je više vježbe iz svih oblasti. Pokušajte ponovo kada budete spremni.'
                }
              </Text>

              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.primaryButton}
                  onPress={handleBackToTests}
                >
                  <LinearGradient
                    colors={['#8B5CF6', '#EC4899']}
                    style={styles.primaryButtonGradient}
                  >
                    <Ionicons name="home" size={20} color="#FFF" />
                    <Text style={styles.primaryButtonText}>Nazad na Testove</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.secondaryButton}
                  onPress={hideResultsModalAnimation}
                >
                  <Text style={styles.secondaryButtonText}>Zatvori</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.4,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backgroundCircle1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: height * 0.1,
    right: -30,
  },
  backgroundCircle2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    top: height * 0.25,
    left: -20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
  },
  logoutButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 120,
  },
  errorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#DC2626',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  progressSection: {
    marginBottom: 24,
  },
  compositionSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 8,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  compositionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  compositionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  compositionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  compositionText: {
    flex: 1,
  },
  compositionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  compositionDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  compositionBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  compositionBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  progressCircleContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  progressCircleBackground: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 8,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  progressCircleFill: {
    position: 'absolute',
    width: 144,
    height: 144,
    borderRadius: 72,
    opacity: 0.15,
  },
  progressCircleContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPercentage: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  progressLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    textAlign: 'center',
  },
  infoSection: {
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  infoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 4,
  },
  statsSection: {
    marginBottom: 24,
  },
  quickStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickStat: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  quickStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginVertical: 8,
  },
  quickStatLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  motivationSection: {
    marginBottom: 20,
  },
  motivationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  motivationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  motivationText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  startButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 16,
  },
  startButtonDisabled: {
    opacity: 0.6,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 12,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
  },
  modalHeader: {
    padding: 32,
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  modalBody: {
    padding: 32,
  },
  resultStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 24,
  },
  resultStat: {
    alignItems: 'center',
    flex: 1,
  },
  resultStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  resultStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    textAlign: 'center',
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 20,
  },
  modalMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  modalActions: {
    gap: 12,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  secondaryButton: {
    padding: 16,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#F3F4F6',
  },
  secondaryButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
});