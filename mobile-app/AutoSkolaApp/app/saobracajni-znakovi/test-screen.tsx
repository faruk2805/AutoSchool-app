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
  Modal,
  StatusBar,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");
const isSmallDevice = width < 375;

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
  correctCount: number;
  totalQuestions: number;
  score: number;
  passed: boolean;
  answers: { [key: string]: number[] };
}

export default function ZnakTestScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: string]: number[];
  }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showExplanation, setShowExplanation] = useState(false);
  const [currentExplanation, setCurrentExplanation] = useState("");
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [correctAnswerIndices, setCorrectAnswerIndices] = useState<number[]>([]);
  const [isNavigating, setIsNavigating] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800);
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState<{[key: string]: boolean}>({});

  const API_BASE_URL = 'http://192.168.1.9:5000';

  useEffect(() => {
    loadUserAndQuestions();
  }, []);

  const getImageUrl = (slikaPath: string): string => {
    if (!slikaPath) return '';
    if (slikaPath.startsWith('http')) return slikaPath;
    if (slikaPath.startsWith('/')) return `${API_BASE_URL}${slikaPath}`;
    return `${API_BASE_URL}/${slikaPath}`;
  };

  const loadUserAndQuestions = async () => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      const token = await AsyncStorage.getItem("userToken");

      if (!userData || !token) {
        Alert.alert("Niste prijavljeni", "Morate biti prijavljeni da biste radili test.", 
          [{ text: "Prijavi se", onPress: () => router.replace("/login") }]
        );
        return;
      }

      const user = JSON.parse(userData);
      setUserId(user._id);

      const questionsParam = params.questions as string;
      if (questionsParam) {
        const parsedQuestions = JSON.parse(questionsParam);
        
        const initialImageLoading: {[key: string]: boolean} = {};
        parsedQuestions.forEach((q: Question) => {
          if (q.slika) initialImageLoading[q._id] = true;
        });
        setImageLoading(initialImageLoading);
        
        setQuestions(parsedQuestions);
        setTestStarted(true);
      } else {
        throw new Error("Nema pitanja za test");
      }
    } catch (error) {
      Alert.alert("Greška", "Došlo je do greške pri učitavanju testa");
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!testStarted || testCompleted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testStarted, testCompleted]);

  useEffect(() => {
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion) {
      const correctIndices = currentQuestion.opcije
        .map((option, index) => option.correct ? index : -1)
        .filter(index => index !== -1);
      setCorrectAnswerIndices(correctIndices);
      setIsAnswerCorrect(false);
    }
  }, [currentQuestionIndex, questions]);

  const handleTimeUp = () => {
    Alert.alert(
      "Vrijeme je isteklo!",
      "Test je automatski završen zbog isteka vremena.",
      [{ text: "Pogledaj rezultate", onPress: () => calculateResults() }]
    );
    setTestCompleted(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const hasMultipleCorrectAnswers = (question: Question): boolean => {
    const correctCount = question.opcije.filter(option => option.correct).length;
    return correctCount > 1;
  };

  const handleAnswerSelect = (questionId: string, optionIndex: number) => {
    if (isNavigating || testCompleted) return;

    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion || currentQuestion._id !== questionId) return;

    const currentSelected = selectedAnswers[questionId] || [];
    
    const isAlreadySelected = currentSelected.includes(optionIndex);
    let newSelected: number[];
    
    if (isAlreadySelected) {
      newSelected = currentSelected.filter(idx => idx !== optionIndex);
    } else {
      newSelected = [...currentSelected, optionIndex];
    }

    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: newSelected
    }));

    // SAMO za pitanja sa JEDNIM tačnim odgovorom - automatski provjeri
    const isSingleAnswerQuestion = !hasMultipleCorrectAnswers(currentQuestion);
    if (isSingleAnswerQuestion && newSelected.length === 1) {
      checkAnswer(currentQuestion, newSelected);
    }
  };

  const checkAnswer = (question: Question, selectedIndices: number[]) => {
    const correctIndices = question.opcije
      .map((option, index) => option.correct ? index : -1)
      .filter(index => index !== -1);

    const allCorrectSelected = correctIndices.every(index => 
      selectedIndices.includes(index)
    );
    const noExtraSelected = selectedIndices.every(index =>
      correctIndices.includes(index)
    );
    
    const isCorrect = allCorrectSelected && noExtraSelected;

    setIsAnswerCorrect(isCorrect);

    if (!isCorrect && question.objasnjenje) {
      setCurrentExplanation(question.objasnjenje);
      setShowExplanation(true);
    } else if (isCorrect) {
      setIsNavigating(true);
      setTimeout(() => {
        goToNextQuestion();
      }, 1000);
    }
  };

  const handleNext = () => {
    if (isNavigating || testCompleted) return;

    const currentQuestion = questions[currentQuestionIndex];
    const selectedAnswerIndices = selectedAnswers[currentQuestion._id] || [];
    
    if (selectedAnswerIndices.length === 0) {
      Alert.alert("Niste odabrali odgovor", "Molimo odaberite barem jedan odgovor prije nego nastavite.");
      return;
    }

    // Za pitanja sa VIŠE odgovora - provjeri
    const isMultipleAnswerQuestion = hasMultipleCorrectAnswers(currentQuestion);
    if (isMultipleAnswerQuestion) {
      checkAnswer(currentQuestion, selectedAnswerIndices);
    } else {
      goToNextQuestion();
    }
  };

  const goToNextQuestion = () => {
    setIsNavigating(true);
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setIsNavigating(false);
      } else {
        calculateResults();
      }
    }, 150);
  };

  const handlePrevious = () => {
    if (isNavigating || testCompleted) return;
    setIsNavigating(true);
    setTimeout(() => {
      if (currentQuestionIndex > 0) {
        setCurrentQuestionIndex(prev => prev - 1);
      }
      setIsNavigating(false);
    }, 150);
  };

  const closeExplanation = () => {
    setShowExplanation(false);
    setCurrentExplanation("");
    setIsNavigating(true);
    setTimeout(() => {
      goToNextQuestion();
    }, 300);
  };

  const calculateResults = () => {
    let correctCount = 0;

    questions.forEach((question) => {
      const selectedOptionIndices = selectedAnswers[question._id] || [];
      
      if (selectedOptionIndices.length > 0) {
        const correctIndices = question.opcije
          .map((option, index) => option.correct ? index : -1)
          .filter(index => index !== -1);
        
        const allCorrectSelected = correctIndices.every(index => 
          selectedOptionIndices.includes(index)
        );
        const noExtraSelected = selectedOptionIndices.every(index =>
          correctIndices.includes(index)
        );
        
        if (allCorrectSelected && noExtraSelected) {
          correctCount++;
        }
      }
    });

    const score = (correctCount / questions.length) * 100;
    const passed = score >= 80;

    const result: TestResult = {
      correctCount,
      totalQuestions: questions.length,
      score,
      passed,
      answers: selectedAnswers,
    };

    setTestCompleted(true);
    Alert.alert(
      passed ? "Čestitamo! 🎉" : "Pokušajte Ponovo",
      `Rezultat: ${correctCount}/${questions.length} (${score.toFixed(1)}%)`,
      [
        { text: "Povratak", onPress: () => router.push("/saobracajni-znakovi") },
        { text: "Pregled Odgovora", onPress: () => showDetailedResults(result) },
      ]
    );
  };

  const showDetailedResults = (result: TestResult) => {
    router.push({
      pathname: "/saobracajni-znakovi/pregled-rezultata",
      params: {
        questions: JSON.stringify(questions),
        result: JSON.stringify(result),
        testType: "znak",
      },
    });
  };

  const handleExitTest = () => {
    Alert.alert(
      "Prekid testa",
      "Da li ste sigurni da želite prekinuti test?",
      [
        { text: "Nastavi test", style: "cancel" },
        { text: "Prekini test", onPress: () => router.push("/saobracajni-znakovi") },
      ]
    );
  };

  const currentQuestion = questions[currentQuestionIndex];
  const selectedAnswerIndices = currentQuestion ? selectedAnswers[currentQuestion._id] || [] : [];
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;
  const answeredQuestions = Object.keys(selectedAnswers).length;
  const imageUrl = currentQuestion?.slika ? getImageUrl(currentQuestion.slika) : '';
  const currentHasMultipleCorrectAnswers = currentQuestion ? hasMultipleCorrectAnswers(currentQuestion) : false;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#2086F6" />
        <ActivityIndicator size="large" color="#2086F6" />
        <Text style={styles.loadingText}>Učitavam test znakova...</Text>
      </View>
    );
  }

  if (!userId || questions.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#2086F6" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push("/saobracajni-znakovi")} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Test Znakova</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.noQuestionsText}>Nema dostupnih pitanja za test znakova.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2086F6" />

      <View style={styles.header}>
        <TouchableOpacity onPress={handleExitTest} style={styles.backButton}>
          <Ionicons name="close" size={24} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Test Znakova</Text>
          <View style={styles.timerContainer}>
            <Ionicons name="time" size={16} color="#FFF" />
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <Text style={styles.progressText}>{currentQuestionIndex + 1}/{questions.length}</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
        </View>
        <Text style={styles.progressInfoText}>Odgovoreno: {answeredQuestions}/{questions.length}</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
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
                style={styles.znakImage}
                resizeMode="contain"
                onLoad={() => setImageLoading(prev => ({...prev, [currentQuestion._id]: false}))}
                onError={() => setImageLoading(prev => ({...prev, [currentQuestion._id]: false}))}
              />
            </View>
          )}
          
          <Text style={styles.questionText}>{currentQuestion.pitanje}</Text>

          {currentHasMultipleCorrectAnswers && (
            <View style={styles.multipleAnswersInfo}>
              <Ionicons name="information-circle" size={16} color="#2086F6" />
              <Text style={styles.multipleAnswersText}>
                Ovo pitanje ima {correctAnswerIndices.length} tačna odgovora
              </Text>
            </View>
          )}

          <View style={styles.optionsContainer}>
            {currentQuestion.opcije.map((option, index) => {
              const isSelected = selectedAnswerIndices.includes(index);
              
              return (
                <TouchableOpacity
                  key={option._id}
                  style={[
                    styles.optionButton,
                    isSelected && styles.optionSelected,
                  ]}
                  onPress={() => handleAnswerSelect(currentQuestion._id, index)}
                  disabled={isNavigating || testCompleted}
                >
                  <View style={styles.optionContent}>
                    <View style={styles.optionIndicator}>
                      {isSelected ? (
                        <Ionicons name="checkmark-circle" size={24} color="#2086F6" />
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
                      isSelected && styles.optionTextSelected,
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
          style={[styles.navButton, styles.navButtonSecondary, currentQuestionIndex === 0 && styles.navButtonDisabled]}
          onPress={handlePrevious}
          disabled={currentQuestionIndex === 0 || isNavigating}
        >
          <Ionicons name="arrow-back" size={20} color="#2086F6" />
          <Text style={styles.navButtonTextSecondary}>Prethodno</Text>
        </TouchableOpacity>

        {currentQuestionIndex < questions.length - 1 ? (
          <TouchableOpacity
            style={[styles.navButton, isNavigating && styles.navButtonDisabled]}
            onPress={handleNext}
            disabled={isNavigating}
          >
            <Text style={styles.navButtonText}>Sljedeće</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.navButton, styles.submitButton, isNavigating && styles.navButtonDisabled]}
            onPress={calculateResults}
            disabled={isNavigating}
          >
            <Text style={styles.navButtonText}>Završi Test</Text>
            <Ionicons name="checkmark" size={20} color="#FFF" />
          </TouchableOpacity>
        )}
      </View>

      <Modal visible={showExplanation} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconContainer}>
                <View style={styles.modalIconCircle}>
                  <Ionicons name="bulb" size={32} color="#FFA500" />
                </View>
              </View>
              <View style={styles.modalTitleContainer}>
                <Text style={styles.modalTitle}>Objašnjenje</Text>
                <View style={styles.resultBadge}>
                  <Ionicons name="close-circle" size={16} color="#FF6B6B" />
                  <Text style={styles.resultBadgeText}>Pogrešan odgovor</Text>
                </View>
              </View>
            </View>

            <View style={styles.modalDivider} />

            <ScrollView style={styles.explanationScroll}>
              <View style={styles.explanationContent}>
                <Text style={styles.explanationText}>{currentExplanation}</Text>
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.continueButton} onPress={closeExplanation}>
              <Text style={styles.continueButtonText}>Nastavi dalje</Text>
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

// Styles ostaju isti...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: "#2086F6",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    backgroundColor: "#2086F6",
    flexDirection: "row",
    alignItems: "center",
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
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timerText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: 4,
  },
  progressText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "500",
  },
  headerRight: {
    width: 60,
    alignItems: "flex-end",
  },
  progressContainer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#E9ECEF",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4FC377",
    borderRadius: 3,
  },
  progressInfoText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
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
    color: "#666",
    textAlign: "center",
    marginTop: 50,
  },
  questionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 20,
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  questionTheme: {
    fontSize: 12,
    color: "#2086F6",
    fontWeight: "500",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  imageContainer: {
    alignItems: "center",
    marginVertical: 20,
    padding: 10,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
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
  znakImage: {
    width: width * 0.7,
    height: 200,
    borderRadius: 8,
  },
  questionText: {
    fontSize: isSmallDevice ? 18 : 20,
    fontWeight: "600",
    color: "#1F2937",
    lineHeight: isSmallDevice ? 24 : 28,
    marginBottom: 8,
    textAlign: 'center',
  },
  multipleAnswersInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 8,
    marginVertical: 12,
  },
  multipleAnswersText: {
    fontSize: 14,
    color: '#2086F6',
    fontWeight: '500',
    marginLeft: 8,
    textAlign: 'center',
    flex: 1,
  },
  optionsContainer: {
    marginTop: 8,
  },
  optionButton: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#F3F4F6",
  },
  optionSelected: {
    borderColor: "#2086F6",
    backgroundColor: "#EFF6FF",
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionIndicator: {
    marginRight: 16,
  },
  optionCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  optionLetter: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  optionText: {
    flex: 1,
    fontSize: isSmallDevice ? 15 : 16,
    color: "#374151",
    lineHeight: isSmallDevice ? 20 : 22,
    fontWeight: "500",
  },
  optionTextSelected: {
    color: "#2086F6",
    fontWeight: "600",
  },
  navigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2086F6",
    paddingHorizontal: isSmallDevice ? 16 : 24,
    paddingVertical: 12,
    borderRadius: 16,
    minWidth: isSmallDevice ? 120 : 140,
    justifyContent: "center",
  },
  navButtonSecondary: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#2086F6",
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginHorizontal: 8,
  },
  navButtonTextSecondary: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2086F6",
    marginHorizontal: 8,
  },
  submitButton: {
    backgroundColor: "#10B981",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    width: "100%",
    maxHeight: "80%",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 24,
    paddingBottom: 16,
  },
  modalIconContainer: {
    marginRight: 16,
  },
  modalIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFF9F0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFE4C2",
  },
  modalTitleContainer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 8,
  },
  resultBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  resultBadgeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#DC2626",
    marginLeft: 6,
  },
  modalDivider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginHorizontal: 24,
  },
  explanationScroll: {
    maxHeight: 300,
  },
  explanationContent: {
    padding: 24,
    paddingTop: 20,
  },
  explanationText: {
    fontSize: 17,
    lineHeight: 26,
    color: "#4B5563",
    textAlign: "left",
    fontWeight: "500",
  },
  continueButton: {
    backgroundColor: "#2086F6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    margin: 24,
    marginTop: 8,
    borderRadius: 18,
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
});