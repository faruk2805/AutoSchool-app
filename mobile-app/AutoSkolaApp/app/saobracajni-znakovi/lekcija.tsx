// components/LekcijaZnakovi.tsx
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
  Modal,
  StatusBar,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;

interface Question {
  _id: string;
  tip: string;
  tema: string;
  pitanje: string;
  opcije: { _id: string; text: string; correct: boolean }[];
  objasnjenje: string;
  slika?: string;
}

interface LessonProgress {
  lesson: number;
  completed: boolean;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  dateCompleted?: string;
}

interface AnswerSubmission {
  questionId: string;
  odgovor: string;
  tacno: boolean;
}

interface TestResultSubmission {
  userId: string;
  tip: string;
  subTip: string;
  odgovori: AnswerSubmission[];
}

export default function LekcijaZnakovi() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const lessonNumber = parseInt(params.lesson as string) || 1;
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: string]: number}>({});
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [currentExplanation, setCurrentExplanation] = useState('');
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState<number>(-1);
  const [hasAnsweredCurrent, setHasAnsweredCurrent] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [imageLoading, setImageLoading] = useState<{[key: string]: boolean}>({});

  const API_BASE_URL = 'http://192.168.1.9:5000';

  useEffect(() => {
    console.log('📖 Učitavam lekciju znakova:', lessonNumber);
    loadUserData();
    loadQuestions();
  }, [lessonNumber]);

  useEffect(() => {
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion) {
      const hasAnswered = selectedAnswers[currentQuestion._id] !== undefined;
      setHasAnsweredCurrent(hasAnswered);
      setCorrectAnswerIndex(-1);
      setIsAnswerCorrect(false);
      setIsNavigating(false);
      
      // Reset image loading state for current question
      if (currentQuestion.slika && imageLoading[currentQuestion._id] === undefined) {
        setImageLoading(prev => ({
          ...prev,
          [currentQuestion._id]: true
        }));
      }
    }
  }, [currentQuestionIndex, questions, selectedAnswers]);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        setUserId(user._id || user.id);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadQuestions = async () => {
    try {
      console.log('📚 Učitavam pitanja za lekciju znakova:', lessonNumber);
      setIsLoading(true);
      
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setHasAnsweredCurrent(false);
      setCorrectAnswerIndex(-1);
      setShowExplanation(false);
      setCurrentExplanation('');
      setIsNavigating(false);
      
      const response = await fetch(`${API_BASE_URL}/api/questions/tip/znak`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const allQuestions = await response.json();
      console.log('✅ Učitano svih pitanja znakova:', allQuestions.length);
      
      const startIndex = (lessonNumber - 1) * 10;
      const endIndex = startIndex + 10;
      const lessonQuestions = allQuestions.slice(startIndex, endIndex);
      
      if (lessonQuestions.length === 0) {
        Alert.alert('Greška', 'Nema dostupnih pitanja za ovu lekciju.');
        router.back();
        return;
      }
      
      console.log(`📖 Lekcija znakova ${lessonNumber}: pitanja ${startIndex + 1}-${endIndex}`);
      
      // Initialize image loading states
      const initialImageLoading: {[key: string]: boolean} = {};
      lessonQuestions.forEach(q => {
        if (q.slika) {
          initialImageLoading[q._id] = true;
        }
      });
      setImageLoading(initialImageLoading);
      
      setQuestions(lessonQuestions);
      
    } catch (error) {
      console.error('🚨 Greška pri učitavanju:', error);
      Alert.alert('Greška', 'Došlo je do greške pri učitavanju pitanja');
    } finally {
      setIsLoading(false);
    }
  };

  const getImageUrl = (slikaPath: string): string => {
    if (!slikaPath) return '';
    
    // Ako slika već ima pun URL (http/https), vrati ga
    if (slikaPath.startsWith('http')) {
      return slikaPath;
    }
    
    // Ako slika počinje sa /, dodaj base URL
    if (slikaPath.startsWith('/')) {
      return `${API_BASE_URL}${slikaPath}`;
    }
    
    // Ako nema / na početku, dodaj ga
    return `${API_BASE_URL}/${slikaPath}`;
  };

  const handleImageLoad = (questionId: string) => {
    console.log(`✅ Slika učitana za pitanje: ${questionId}`);
    setImageLoading(prev => ({
      ...prev,
      [questionId]: false
    }));
  };

  const handleImageError = (questionId: string) => {
    console.log(`❌ Greška pri učitavanju slike za pitanje: ${questionId}`);
    setImageLoading(prev => ({
      ...prev,
      [questionId]: false
    }));
  };

  const handleAnswerSelect = (questionId: string, optionIndex: number) => {
    if (hasAnsweredCurrent || isNavigating) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion || currentQuestion._id !== questionId) return;

    const selectedOption = currentQuestion.opcije[optionIndex];
    const isCorrect = selectedOption.correct;

    const correctIndex = currentQuestion.opcije.findIndex(opt => opt.correct);
    setCorrectAnswerIndex(correctIndex);
    setHasAnsweredCurrent(true);

    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));

    if (!isCorrect && currentQuestion.objasnjenje) {
      setIsAnswerCorrect(false);
      setCurrentExplanation(currentQuestion.objasnjenje);
      setShowExplanation(true);
    } else if (isCorrect) {
      setIsAnswerCorrect(true);
      setIsNavigating(true);
      setTimeout(() => {
        handleNext();
      }, 1000);
    }
  };

  const handleNext = () => {
    if (isNavigating) return;
    
    setIsNavigating(true);
    
    if (currentQuestionIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(prev => {
          const nextIndex = prev + 1;
          setIsNavigating(false);
          return nextIndex;
        });
      }, 150);
    } else {
      calculateResults();
    }
  };

  const handlePrevious = () => {
    if (isNavigating) return;
    
    setIsNavigating(true);
    
    if (currentQuestionIndex > 0) {
      setTimeout(() => {
        setCurrentQuestionIndex(prev => {
          const prevIndex = prev - 1;
          setIsNavigating(false);
          return prevIndex;
        });
      }, 150);
    } else {
      setIsNavigating(false);
    }
  };

  const closeExplanation = () => {
    setShowExplanation(false);
    setCurrentExplanation('');
    setCorrectAnswerIndex(-1);
    setIsNavigating(true);
    
    setTimeout(() => {
      handleNext();
    }, 300);
  };

  const sendResultsToBackend = async (correctCount: number, totalQuestions: number, score: number): Promise<boolean> => {
    try {
      if (!userId) {
        console.log('❌ User ID nije dostupan');
        Alert.alert('Greška', 'Niste prijavljeni');
        return false;
      }

      const odgovori: AnswerSubmission[] = questions.map(question => {
        const selectedOptionIndex = selectedAnswers[question._id];
        const selectedOption = selectedOptionIndex !== undefined 
          ? question.opcije[selectedOptionIndex] 
          : null;

        return {
          questionId: question._id,
          odgovor: selectedOption ? selectedOption.text : 'Nije odgovoreno',
          tacno: selectedOption ? selectedOption.correct : false
        };
      });

      const testResult = {
        userId: userId,
        tip: 'znak',
        subTip: 'lekcijski',
        odgovori: odgovori.filter(odgovor => odgovor.odgovor !== "Nije odgovoreno")
      };

      console.log('📤 Šaljem rezultate znakova na backend:', testResult);

      const response = await fetch(`${API_BASE_URL}/api/testresults/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testResult)
      });

      console.log('📥 Status odgovora:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ HTTP greška:', response.status, errorText);
        
        if (response.status === 401 || response.status === 403) {
          Alert.alert('Sesija istekla', 'Morate se ponovno prijaviti.');
        }
        
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Rezultati znakova uspješno poslani:', result);
      return true;

    } catch (error) {
      console.error('🚨 Greška pri slanju rezultata znakova:', error);
      return false;
    }
  };

  const saveLessonProgress = async (correctCount: number, totalQuestions: number, score: number, passed: boolean) => {
    try {
      const progressData = await AsyncStorage.getItem('znakProgress');
      let progress: LessonProgress[] = progressData ? JSON.parse(progressData) : [];

      const updatedProgress = progress.map(item => 
        item.lesson === lessonNumber 
          ? {
              ...item,
              completed: passed,
              score: score,
              correctAnswers: correctCount,
              totalQuestions: totalQuestions,
              dateCompleted: passed ? new Date().toISOString() : item.dateCompleted
            }
          : item
      );

      if (!updatedProgress.find(item => item.lesson === lessonNumber)) {
        updatedProgress.push({
          lesson: lessonNumber,
          completed: passed,
          score: score,
          correctAnswers: correctCount,
          totalQuestions: totalQuestions,
          dateCompleted: passed ? new Date().toISOString() : undefined
        });
      }

      await AsyncStorage.setItem('znakProgress', JSON.stringify(updatedProgress));
      console.log('💾 Progres lekcije znakova sačuvan');

    } catch (error) {
      console.error('Error saving lesson progress:', error);
    }
  };

  const calculateResults = async () => {
    let correctCount = 0;
    
    questions.forEach(question => {
      const selectedOptionIndex = selectedAnswers[question._id];
      if (selectedOptionIndex !== undefined) {
        const selectedOption = question.opcije[selectedOptionIndex];
        if (selectedOption.correct) {
          correctCount++;
        }
      }
    });

    const score = (correctCount / questions.length) * 100;
    const passed = score >= 70;

    console.log('📊 Rezultat znakova:', { correctCount, total: questions.length, score, passed });

    const backendSuccess = await sendResultsToBackend(correctCount, questions.length, score);

    if (backendSuccess) {
      await saveLessonProgress(correctCount, questions.length, score, passed);
    }

    Alert.alert(
      passed ? 'Čestitamo! 🎉' : 'Pokušajte Ponovo',
      `Rezultat lekcije znakova ${lessonNumber}:\n\nTočnih odgovora: ${correctCount}/${questions.length}\nPostotak: ${score.toFixed(1)}%\nStatus: ${passed ? 'POLOŽENO' : 'PALO'}\n\n${backendSuccess ? 'Rezultati su spremljeni!' : 'Rezultati nisu spremljeni na server!'}`,
      [
        { 
          text: 'Nazad na Lekcije', 
          onPress: () => router.push('/saobracajni-znakovi/lekcije') 
        },
        passed && lessonNumber < 8 && {
          text: 'Sljedeća Lekcija',
          onPress: () => {
            router.push(`/saobracajni-znakovi/lekcija?lesson=${lessonNumber + 1}`);
          }
        }
      ].filter(Boolean)
    );
  };

  const getLessonTitle = (lessonNumber: number) => {
    const titles = {
      1: 'Osnovni Znakovi',
      2: 'Znakovi Zabrane',
      3: 'Znakovi Obaveze',
      4: 'Znakovi Upozorenja',
      5: 'Informativni Znakovi',
      6: 'Oblik i Boja Znakova',
      7: 'Vertikalna Signalizacija',
      8: 'Posebni Znakovi'
    };
    return titles[lessonNumber as keyof typeof titles] || `Lekcija ${lessonNumber}`;
  };

  const currentQuestion = questions[currentQuestionIndex];
  const selectedAnswer = currentQuestion ? selectedAnswers[currentQuestion._id] : undefined;
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;
  const imageUrl = currentQuestion?.slika ? getImageUrl(currentQuestion.slika) : '';

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#2086F6" />
        <ActivityIndicator size="large" color="#2086F6" />
        <Text style={styles.loadingText}>Učitavam lekciju {lessonNumber}...</Text>
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#2086F6" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/saobracajni-znakovi/lekcije')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lekcija {lessonNumber}</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.noQuestionsText}>Nema dostupnih pitanja za ovu lekciju.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2086F6" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/saobracajni-znakovi/lekcije')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Lekcija {lessonNumber}</Text>
          <Text style={styles.headerSubtitle}>{getLessonTitle(lessonNumber)}</Text>
          <Text style={styles.progressText}>
            {currentQuestionIndex + 1}/{questions.length}
          </Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { width: `${progressPercentage}%` }
            ]} 
          />
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.questionCard}>
          <View style={styles.questionHeader}>
            <Text style={styles.questionNumber}>Pitanje {currentQuestionIndex + 1}</Text>
            <Text style={styles.questionTheme}>{currentQuestion.tema}</Text>
          </View>
          
          {currentQuestion.slika && (
            <View style={styles.imageContainer}>
              {imageLoading[currentQuestion._id] && (
                <View style={styles.imagePlaceholder}>
                  <ActivityIndicator size="small" color="#2086F6" />
                  <Text style={styles.imageLoadingText}>Učitavam sliku...</Text>
                </View>
              )}
              <Image
                source={{ uri: imageUrl }}
                style={styles.questionImage}
                resizeMode="contain"
                onLoad={() => handleImageLoad(currentQuestion._id)}
                onError={() => handleImageError(currentQuestion._id)}
              />
            </View>
          )}
          
          <Text style={styles.questionText}>{currentQuestion.pitanje}</Text>
          
          <View style={styles.optionsContainer}>
            {currentQuestion.opcije.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrectOption = option.correct;
              const showCorrect = correctAnswerIndex !== -1 && correctAnswerIndex === index;
              
              return (
                <TouchableOpacity
                  key={option._id}
                  style={[
                    styles.optionButton,
                    isSelected && !isCorrectOption && styles.optionWrong,
                    isSelected && isCorrectOption && styles.optionCorrect,
                    showCorrect && !isSelected && styles.optionCorrect,
                    hasAnsweredCurrent && !isSelected && !showCorrect && styles.optionDisabled
                  ]}
                  onPress={() => handleAnswerSelect(currentQuestion._id, index)}
                  disabled={hasAnsweredCurrent || isNavigating}
                >
                  <View style={styles.optionContent}>
                    <View style={styles.optionIndicator}>
                      {isSelected ? (
                        <Ionicons 
                          name={isCorrectOption ? "checkmark-circle" : "close-circle"} 
                          size={24} 
                          color={isCorrectOption ? "#4FC377" : "#FF6B6B"} 
                        />
                      ) : showCorrect ? (
                        <Ionicons name="checkmark-circle" size={24} color="#4FC377" />
                      ) : (
                        <View style={styles.optionCircle}>
                          <Text style={styles.optionLetter}>
                            {String.fromCharCode(65 + index)}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={[
                      styles.optionText,
                      (isSelected && !isCorrectOption) && styles.optionTextWrong,
                      (isSelected && isCorrectOption) && styles.optionTextCorrect,
                      (showCorrect && !isSelected) && styles.optionTextCorrect
                    ]}>
                      {option.text}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={styles.navigation}>
        <TouchableOpacity 
          style={[
            styles.navButton,
            styles.navButtonSecondary,
            (currentQuestionIndex === 0 || isNavigating) && styles.navButtonDisabled
          ]}
          onPress={handlePrevious}
          disabled={currentQuestionIndex === 0 || isNavigating}
        >
          <Ionicons name="arrow-back" size={20} color="#2086F6" />
          <Text style={styles.navButtonTextSecondary}>Prethodno</Text>
        </TouchableOpacity>

        {currentQuestionIndex < questions.length - 1 ? (
          <TouchableOpacity 
            style={[
              styles.navButton,
              (isNavigating) && styles.navButtonDisabled
            ]}
            onPress={handleNext}
            disabled={isNavigating}
          >
            <Text style={styles.navButtonText}>Sljedeće</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[
              styles.navButton,
              styles.submitButton,
              (isNavigating) && styles.navButtonDisabled
            ]}
            onPress={calculateResults}
            disabled={isNavigating}
          >
            <Text style={styles.navButtonText}>Završi Lekciju</Text>
            <Ionicons name="checkmark" size={20} color="#FFF" />
          </TouchableOpacity>
        )}
      </View>

      <Modal
        visible={showExplanation}
        animationType="fade"
        transparent={true}
        onRequestClose={closeExplanation}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIcon}>
                <Ionicons name="bulb-outline" size={32} color="#FFA500" />
              </View>
              <Text style={styles.modalTitle}>Objašnjenje</Text>
              <Text style={styles.modalSubtitle}>Pogrešan odgovor</Text>
            </View>
            
            <ScrollView 
              style={styles.explanationScroll}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.explanationText}>
                {currentExplanation}
              </Text>
            </ScrollView>

            <TouchableOpacity 
              style={styles.closeButton}
              onPress={closeExplanation}
              disabled={isNavigating}
            >
              <Text style={styles.closeButtonText}>Nastavi dalje</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {isNavigating && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#2086F6" />
        </View>
      )}
    </View>
  );
}

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
    marginTop: 20,
    fontSize: 16,
    color: '#2086F6',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#2086F6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
    marginBottom: 4,
  },
  progressText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  headerRight: {
    width: 40,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E9ECEF',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4FC377',
    borderRadius: 3,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  noQuestionsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 50,
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 20,
  },
  questionHeader: {
    marginBottom: 16,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  questionTheme: {
    fontSize: 12,
    color: '#2086F6',
    fontWeight: '500',
    marginTop: 4,
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    minHeight: 200,
    justifyContent: 'center',
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  imageLoadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  questionImage: {
    width: 160,
    height: 140,
    borderRadius: 8,
  },
  questionText: {
    fontSize: isSmallDevice ? 18 : 20,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: isSmallDevice ? 24 : 28,
    marginBottom: 8,
    textAlign: 'center',
  },
  optionsContainer: {
    marginTop: 8,
  },
  optionButton: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#F3F4F6',
  },
  optionCorrect: {
    borderColor: '#4FC377',
    backgroundColor: '#F0F9F4',
  },
  optionWrong: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FEF2F2',
  },
  optionDisabled: {
    opacity: 0.6,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIndicator: {
    marginRight: 16,
  },
  optionCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionLetter: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  optionText: {
    flex: 1,
    fontSize: isSmallDevice ? 15 : 16,
    color: '#374151',
    lineHeight: isSmallDevice ? 20 : 22,
    fontWeight: '500',
  },
  optionTextCorrect: {
    color: '#047857',
    fontWeight: '600',
  },
  optionTextWrong: {
    color: '#DC2626',
    fontWeight: '600',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2086F6',
    paddingHorizontal: isSmallDevice ? 16 : 24,
    paddingVertical: 12,
    borderRadius: 16,
    minWidth: isSmallDevice ? 120 : 140,
    justifyContent: 'center',
  },
  navButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#2086F6',
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginHorizontal: 8,
  },
  navButtonTextSecondary: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2086F6',
    marginHorizontal: 8,
  },
  submitButton: {
    backgroundColor: '#10B981',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxHeight: '80%',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: '500',
  },
  explanationScroll: {
    maxHeight: 300,
    marginBottom: 24,
  },
  explanationText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4B5563',
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#2086F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    marginTop: 8,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});