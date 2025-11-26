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
  Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface LessonProgress {
  lesson: number;
  completed: boolean;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  dateCompleted?: string;
}

interface UserData {
  _id: string;
  id: string;
  name: string;
  email: string;
  role: string;
}

interface TestResult {
  tip: string;
  subTip: string;
  odgovori: {
    questionId: string;
    odgovor: string;
    tacno: boolean;
  }[];
  correctCount: number;
  total: number;
  score: number;
  passed: boolean;
}

const API_BASE_URL = 'http://192.168.1.9:5000';

export default function LekcijePrvaPomoc() {
  const router = useRouter();
  const [lessonsProgress, setLessonsProgress] = useState<LessonProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Animacije
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];
  const progressAnim = useState(new Animated.Value(0))[0];
  const cardSlideAnim = useState(new Animated.Value(50))[0];
  const rotateAnim = useState(new Animated.Value(0))[0];

  const totalLessons = 5;
  const questionsPerLesson = 10;

  useEffect(() => {
    checkUserAndLoadProgress();
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

    // Rotate animation for refresh
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };

  const checkUserAndLoadProgress = async () => {
    try {
      console.log('🔐 Provjeravam prijavu korisnika...');
      
      const userDataString = await AsyncStorage.getItem('userData');
      
      if (!userDataString) {
        console.log('❌ Korisnik nije prijavljen');
        Alert.alert(
          'Potrebna prijava',
          'Morate biti prijavljeni da biste pristupili lekcijama',
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
      const user_Id = userData._id;
      setUserId(user_Id);

      if (!user_Id) {
        throw new Error('User ID nije pronađen');
      }

      console.log('👤 User ID:', user_Id);
      await loadProgressFromAPI(user_Id);
      startAnimations();

    } catch (error) {
      console.log('🚨 Greška:', error);
      Alert.alert('Greška', 'Došlo je do greške pri učitavanju podataka');
      setIsLoading(false);
    }
  };

  const loadProgressFromAPI = async (user_Id: string) => {
    try {
      console.log('📊 Učitavam napredak sa APIja...');

      const response = await fetch(
        `${API_BASE_URL}/api/testresults/user/${user_Id}/prva_pomoc/lekcijski`
      );
      
      console.log('🌐 API URL:', `${API_BASE_URL}/api/testresults/user/${user_Id}/prva_pomoc/lekcijski`);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log('ℹ️ Nema rezultata za lekcije - inicijaliziraj prazan progres');
          const initialProgress = Array.from({ length: totalLessons }, (_, i) => ({
            lesson: i + 1,
            completed: false,
            score: 0,
            correctAnswers: 0,
            totalQuestions: questionsPerLesson
          }));
          setLessonsProgress(initialProgress);
          setIsLoading(false);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiResponse = await response.json();
      console.log('✅ Rezultati sa APIja:', apiResponse);

      const progress = Array.from({ length: totalLessons }, (_, i) => {
        const lessonNumber = i + 1;
        const lessonResults = apiResponse.rezultati?.filter((result: any) => {
          return result.attemptNumber === lessonNumber;
        });
        
        const latestResult = lessonResults && lessonResults.length > 0 
          ? lessonResults[0] 
          : null;

        return {
          lesson: lessonNumber,
          completed: !!latestResult,
          score: latestResult ? latestResult.score : 0,
          correctAnswers: latestResult ? latestResult.correctCount : 0,
          totalQuestions: latestResult ? latestResult.total : questionsPerLesson,
          dateCompleted: latestResult ? latestResult.createdAt : undefined
        };
      });

      setLessonsProgress(progress);
      
    } catch (error) {
      console.log('🚨 Greška pri učitavanju sa APIja:', error);
      const initialProgress = Array.from({ length: totalLessons }, (_, i) => ({
        lesson: i + 1,
        completed: false,
        score: 0,
        correctAnswers: 0,
        totalQuestions: questionsPerLesson
      }));
      setLessonsProgress(initialProgress);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const getLessonStatus = (lessonNumber: number) => {
    const lesson = lessonsProgress.find(l => l.lesson === lessonNumber);
    if (!lesson) return 'locked';
    if (lesson.completed) return 'completed';
    if (lessonNumber === 1) return 'available';
    
    const prevLesson = lessonsProgress.find(l => l.lesson === lessonNumber - 1);
    return prevLesson?.completed ? 'available' : 'locked';
  };

  const handleLessonSelect = (lessonNumber: number) => {
    const status = getLessonStatus(lessonNumber);
    
    if (status === 'locked') {
      Alert.alert(
        'Lekcija zaključana',
        'Morate završiti prethodnu lekciju da biste otključali ovu.'
      );
      return;
    }

    if (!userId) {
      Alert.alert('Greška', 'Niste prijavljeni');
      return;
    }

    console.log(`🎯 Pokrećem lekciju ${lessonNumber}`);
    router.push({
      pathname: `/prva-pomoc/lekcija`,
      params: { 
        lesson: lessonNumber,
        userId: userId
      }
    });
  };

  const getLessonTitle = (lessonNumber: number) => {
    const titles = {
      1: 'Osnove Prve Pomći',
      2: 'Krvarenja i Šok',
      3: 'Prijelomi i Opekotine',
      4: 'Hitna Stanja',
      5: 'Reanimacija i Transport'
    };
    return titles[lessonNumber as keyof typeof titles] || `Lekcija ${lessonNumber}`;
  };

  const getLessonDescription = (lessonNumber: number) => {
    const descriptions = {
      1: 'Osnovni principi, procjena stanja, poziv hitnoj pomoći',
      2: 'Vrste krvarenja, hemoragijski šok, zaustavljanje krvarenja',
      3: 'Imobilizacija, opekotine, prijelomi, zglobovi',
      4: 'Gušenje, trovanja, alergije, epilepsija',
      5: 'KPR, AED, transport, stabilni položaji'
    };
    return descriptions[lessonNumber as keyof typeof descriptions] || '10 pitanja';
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

  const refreshProgress = async () => {
    if (userId) {
      setRefreshing(true);
      await loadProgressFromAPI(userId);
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return '#4FC377';
    if (percentage >= 60) return '#FFB020';
    return '#FF6B6B';
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#2086F6" />
        <LinearGradient
          colors={['#2086F6', '#4FC377']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Učitavam lekcije...</Text>
        </View>
      </View>
    );
  }

  const completedLessons = lessonsProgress.filter(l => l.completed).length;
  const progressPercentage = Math.round((completedLessons / totalLessons) * 100);
  const progressColor = getProgressColor(progressPercentage);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2086F6" />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={['#2086F6', '#4FC377']}
        style={styles.backgroundGradient}
      />
      
      {/* Animated Background Elements */}
      <View style={styles.backgroundCircle1} />
      <View style={styles.backgroundCircle2} />

      {/* Header - OVO OSTAJE FIXED */}
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Prva Pomoc</Text>
          <Text style={styles.headerSubtitle}>Lekcije • Učenje</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={refreshProgress} style={styles.refreshButton}>
            <Animated.View
              style={{
                transform: [{
                  rotate: rotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg']
                  })
                }]
              }}
            >
              <Ionicons name="refresh" size={22} color="#FFF" />
            </Animated.View>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="exit-outline" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* ScrollView koji sadrži SVE - progress i lekcije */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Progress Overview - SADA JE U SCROLLVIEW */}
        <Animated.View 
          style={[
            styles.progressOverview,
            {
              opacity: fadeAnim,
              transform: [{ translateY: cardSlideAnim }]
            }
          ]}
        >
          <View style={styles.progressHeader}>
            <LinearGradient
              colors={['#2086F6', '#1D4ED8']}
              style={styles.progressIcon}
            >
              <Ionicons name="bar-chart" size={20} color="#FFF" />
            </LinearGradient>
            <Text style={styles.progressTitle}>Napredak u Lekcijama</Text>
          </View>
          
          <View style={styles.progressContent}>
            {/* Progress Circle */}
            <View style={styles.progressCircleWrapper}>
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
                </View>
                <View style={styles.progressCircleContent}>
                  <Text style={styles.progressPercentage}>
                    {progressPercentage}%
                  </Text>
                  <Text style={styles.progressLabel}>Završeno</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: '#2086F6' }]}>
                  <Ionicons name="checkmark-done" size={18} color="#FFF" />
                </View>
                <Text style={styles.statNumber}>{completedLessons}</Text>
                <Text style={styles.statLabel}>Završeno</Text>
              </View>
              
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: '#4FC377' }]}>
                  <Ionicons name="library" size={18} color="#FFF" />
                </View>
                <Text style={styles.statNumber}>{totalLessons}</Text>
                <Text style={styles.statLabel}>Ukupno</Text>
              </View>
              
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: '#FFB020' }]}>
                  <Ionicons name="trophy" size={18} color="#FFF" />
                </View>
                <Text style={styles.statNumber}>
                  {Math.max(...lessonsProgress.map(l => l.score), 0)}%
                </Text>
                <Text style={styles.statLabel}>Najbolji rezultat</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Lessons List */}
        <View style={styles.lessonsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Lekcije Prve Pomći</Text>
            <Text style={styles.sectionSubtitle}>Započni svoje učenje</Text>
          </View>

          <View style={styles.lessonsContainer}>
            {Array.from({ length: totalLessons }, (_, i) => {
              const lessonNumber = i + 1;
              const status = getLessonStatus(lessonNumber);
              const lessonProgress = lessonsProgress.find(l => l.lesson === lessonNumber);
              
              return (
                <Animated.View
                  key={lessonNumber}
                  style={[
                    styles.lessonCardWrapper,
                    {
                      opacity: fadeAnim,
                      transform: [
                        { translateY: cardSlideAnim },
                        { scale: scaleAnim }
                      ]
                    }
                  ]}
                >
                  <TouchableOpacity
                    style={[
                      styles.lessonCard,
                      status === 'locked' && styles.lessonCardLocked
                    ]}
                    onPress={() => handleLessonSelect(lessonNumber)}
                    disabled={status === 'locked'}
                  >
                    <LinearGradient
                      colors={status === 'locked' ? ['#F8F9FA', '#E9ECEF'] : ['#FFFFFF', '#F8F9FA']}
                      style={styles.lessonGradient}
                    >
                      <View style={styles.lessonHeader}>
                        <View style={styles.lessonNumberContainer}>
                          <LinearGradient
                            colors={
                              status === 'completed' ? ['#10B981', '#059669'] :
                              status === 'locked' ? ['#6C757D', '#495057'] :
                              ['#2086F6', '#1D4ED8']
                            }
                            style={styles.lessonNumber}
                          >
                            {status === 'completed' ? (
                              <Ionicons name="checkmark" size={20} color="#FFF" />
                            ) : (
                              <Text style={styles.lessonNumberText}>
                                {lessonNumber}
                              </Text>
                            )}
                          </LinearGradient>
                        </View>
                        
                        <View style={styles.lessonInfo}>
                          <Text style={[
                            styles.lessonTitle,
                            status === 'locked' && styles.lessonTitleLocked
                          ]}>
                            {getLessonTitle(lessonNumber)}
                          </Text>
                          <Text style={[
                            styles.lessonDescription,
                            status === 'locked' && styles.lessonDescriptionLocked
                          ]}>
                            {getLessonDescription(lessonNumber)}
                          </Text>
                        </View>

                        <View style={styles.lessonStatus}>
                          {status === 'completed' && lessonProgress && (
                            <View style={styles.scoreContainer}>
                              <LinearGradient
                                colors={['#10B981', '#059669']}
                                style={styles.scoreBadge}
                              >
                                <Text style={styles.scoreText}>
                                  {lessonProgress.score}%
                                </Text>
                              </LinearGradient>
                            </View>
                          )}
                          {status === 'available' && (
                            <LinearGradient
                              colors={['#2086F6', '#1D4ED8']}
                              style={styles.playButton}
                            >
                              <Ionicons name="play" size={20} color="#FFF" />
                            </LinearGradient>
                          )}
                          {status === 'locked' && (
                            <View style={styles.lockIcon}>
                              <Ionicons name="lock-closed" size={20} color="#6C757D" />
                            </View>
                          )}
                        </View>
                      </View>

                      {status === 'completed' && lessonProgress && (
                        <View style={styles.lessonFooter}>
                          <View style={styles.statsRow}>
                            <View style={styles.statMini}>
                              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                              <Text style={styles.statMiniText}>
                                {lessonProgress.correctAnswers}/{lessonProgress.totalQuestions} tačnih
                              </Text>
                            </View>
                            {lessonProgress.dateCompleted && (
                              <View style={styles.statMini}>
                                <Ionicons name="calendar" size={14} color="#6B7280" />
                                <Text style={styles.lessonDate}>
                                  {new Date(lessonProgress.dateCompleted).toLocaleDateString('bs-BA')}
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// Eksport funkcija za spremanje rezultata - SAMO API
export const saveLessonResult = async (
  userId: string, 
  lessonNumber: number, 
  questions: any[], 
  selectedAnswers: { [key: string]: number },
  correctCount: number,
  totalQuestions: number
) => {
  try {
    const score = Math.round((correctCount / totalQuestions) * 100);
    const passed = score >= 70;

    console.log(`💾 Spremanje rezultata lekcije ${lessonNumber}...`);

    const odgovori = questions.map((question) => {
      const selectedOptionIndex = selectedAnswers[question._id];
      const selectedOption =
        selectedOptionIndex !== undefined
          ? question.opcije[selectedOptionIndex]
          : null;

      return {
        questionId: question._id,
        odgovor: selectedOption ? selectedOption.text : "Nije odgovoreno",
        tacno: selectedOption ? selectedOption.correct : false,
      };
    });

    const requestData = {
      userId: userId,
      tip: "prva_pomoc",
      subTip: "lekcijski",
      odgovori: odgovori.filter(odgovor => odgovor.odgovor !== "Nije odgovoreno")
    };

    console.log("📤 Šaljem na API:", requestData);

    const API_URL = `${API_BASE_URL}/api/testresults/save`;

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ HTTP greška:", response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    console.log("✅ Rezultat uspješno spremljen u bazu!");
    return true;

  } catch (error) {
    console.error("🚨 Greška pri spremanju rezultata:", error);
    throw error;
  }
};

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
    height: height * 0.3,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backgroundCircle1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: height * 0.05,
    right: -30,
  },
  backgroundCircle2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    top: height * 0.15,
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
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshButton: {
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 120, // Space for fixed header
    paddingBottom: 30,
  },
  progressOverview: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    margin: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 0,
  },
  progressIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  progressContent: {
    padding: 20,
  },
  progressCircleWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  progressCircleContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  progressCircleBackground: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 6,
    borderColor: '#F1F3F4',
  },
  progressCircleFill: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
    opacity: 0.15,
  },
  progressCircleContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  progressLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
  },
  lessonsSection: {
    marginTop: 8,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  lessonsContainer: {
    paddingHorizontal: 16,
  },
  lessonCardWrapper: {
    marginBottom: 12,
  },
  lessonCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  lessonCardLocked: {
    opacity: 0.7,
  },
  lessonGradient: {
    padding: 20,
  },
  lessonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lessonNumberContainer: {
    marginRight: 16,
  },
  lessonNumber: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  lessonNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  lessonTitleLocked: {
    color: '#6C757D',
  },
  lessonDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  lessonDescriptionLocked: {
    color: '#ADB5BD',
  },
  lessonStatus: {
    marginLeft: 12,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 60,
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  lockIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  lessonFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F3F4',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statMini: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statMiniText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
    marginLeft: 6,
  },
  lessonDate: {
    fontSize: 11,
    color: '#6B7280',
    marginLeft: 6,
  },
});