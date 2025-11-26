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
  answers: { [key: string]: number };
}

export default function TestScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: string]: number;
  }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showExplanation, setShowExplanation] = useState(false);
  const [currentExplanation, setCurrentExplanation] = useState("");
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState<number>(-1);
  const [hasAnsweredCurrent, setHasAnsweredCurrent] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800);
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Učitaj pitanja i user ID
  useEffect(() => {
    console.log("📖 Učitavam test...");
    loadUserAndQuestions();
  }, []);

  const loadUserAndQuestions = async () => {
    try {
      // Prvo provjeri da li je korisnik ulogovan
      const userData = await AsyncStorage.getItem("userData");
      const token = await AsyncStorage.getItem("userToken");

      if (!userData || !token) {
        console.log("🚨 Korisnik nije ulogovan - redirect na login");
        Alert.alert(
          "Niste prijavljeni",
          "Morate biti prijavljeni da biste radili test.",
          [{ text: "Prijavi se", onPress: () => router.replace("/login") }]
        );
        return;
      }

      const user = JSON.parse(userData);
      setUserId(user._id);
      console.log("👤 Korisnik ID:", user._id);

      // Učitaj pitanja
      const questionsParam = params.questions as string;
      const testType = params.testType as string;
      const testMode = params.testMode as string;

      console.log("📋 Test parametri:", { testType, testMode });

      if (questionsParam) {
        const parsedQuestions = JSON.parse(questionsParam);
        console.log("✅ Učitano pitanja:", parsedQuestions.length);
        setQuestions(parsedQuestions);
        setTestStarted(true);
      } else {
        throw new Error("Nema pitanja za test");
      }
    } catch (error) {
      console.error("🚨 Greška pri učitavanju:", error);
      Alert.alert("Greška", "Došlo je do greške pri učitavanju testa");
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  // Timer efekat
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

  // Resetuj hasAnsweredCurrent kada se promijeni pitanje
  useEffect(() => {
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion) {
      const hasAnswered = selectedAnswers[currentQuestion._id] !== undefined;
      setHasAnsweredCurrent(hasAnswered);
      setCorrectAnswerIndex(-1);
      setIsAnswerCorrect(false);
    }
  }, [currentQuestionIndex, questions, selectedAnswers]);

  const handleTimeUp = () => {
    Alert.alert(
      "Vrijeme je isteklo!",
      "Test je automatski završen zbog isteka vremena.",
      [{ text: "Pogledaj rezultate", onPress: calculateResults }]
    );
    setTestCompleted(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleAnswerSelect = (questionId: string, optionIndex: number) => {
    if (hasAnsweredCurrent || isNavigating || testCompleted) return;

    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion || currentQuestion._id !== questionId) return;

    const selectedOption = currentQuestion.opcije[optionIndex];
    const isCorrect = selectedOption.correct;

    const correctIndex = currentQuestion.opcije.findIndex((opt) => opt.correct);
    setCorrectAnswerIndex(correctIndex);
    setHasAnsweredCurrent(true);

    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
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
    if (isNavigating || testCompleted) return;

    setIsNavigating(true);

    if (currentQuestionIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex((prev) => {
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
    if (isNavigating || testCompleted) return;

    setIsNavigating(true);

    if (currentQuestionIndex > 0) {
      setTimeout(() => {
        setCurrentQuestionIndex((prev) => {
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
    setCurrentExplanation("");
    setCorrectAnswerIndex(-1);
    setIsNavigating(true);

    setTimeout(() => {
      handleNext();
    }, 300);
  };

  const saveTestResultToAPI = async (result: any) => {
    try {
      console.log("📡 POKUŠAVAM SPREMITI REZULTAT U BAZU...");

      // Ako nema user ID, redirect na login
      if (!userId) {
        console.log("🚨 Nema user ID - redirect na login");
        Alert.alert(
          "Sesija istekla",
          "Morate se ponovno prijaviti.",
          [{ text: "Prijavi se", onPress: () => router.replace("/login") }]
        );
        return false;
      }

      const API_URL = "http://192.168.1.9:5000/api/testresults/save";
      console.log("🎯 API URL:", API_URL);

      const requestData = {
        userId: userId, // Koristi pravi user ID
        tip: result.tip || "prva_pomoc",
        subTip: result.subTip || "kombinovani",
        odgovori: result.odgovori.filter((odgovor: any) => odgovor.odgovor !== "Nije odgovoreno")
      };

      console.log("📤 Podaci za slanje:", JSON.stringify(requestData, null, 2));

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      console.log("📥 Status odgovora:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ HTTP greška:", response.status, errorText);
        
        // Ako je greška auth related, redirect na login
        if (response.status === 401 || response.status === 403) {
          Alert.alert(
            "Sesija istekla",
            "Morate se ponovno prijaviti.",
            [{ text: "Prijavi se", onPress: () => router.replace("/login") }]
          );
        }
        
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log("✅ USPJEH! Podaci spremljeni u bazu:", responseData);
      return true;

    } catch (error) {
      console.error("🚨 GREŠKA PRI SPREMANJU U BAZU:", error);
      return false;
    }
  };

  const saveTestResult = async (result: TestResult) => {
    try {
      // Priprema podataka za bazu
      const testResultData = {
        tip: "prva_pomoc",
        subTip: "kombinovani",
        odgovori: questions.map((question) => {
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
        }),
        correctCount: result.correctCount,
        total: result.totalQuestions,
        score: result.score,
        passed: result.passed,
      };

      console.log("💾 Pripremljeni podaci za bazu:", testResultData);

      // Spremi u bazu
      const apiSuccess = await saveTestResultToAPI(testResultData);

      if (apiSuccess) {
        console.log("🎉 Test rezultat uspješno spremljen u bazu!");
      } else {
        console.log("⚠️ Test rezultat nije spremljen u bazu");
        // Ne spremaj lokalno - traži od korisnika da se prijavi
        return;
      }

    } catch (error) {
      console.error("🚨 Greška pri spremanju rezultata:", error);
    }
  };

  const calculateResults = () => {
    let correctCount = 0;

    questions.forEach((question) => {
      const selectedOptionIndex = selectedAnswers[question._id];
      if (selectedOptionIndex !== undefined) {
        const selectedOption = question.opcije[selectedOptionIndex];
        if (selectedOption.correct) {
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

    console.log("📊 Rezultat testa:", result);
    setTestCompleted(true);

    // Sačuvaj rezultat
    saveTestResult(result);

    Alert.alert(
      passed ? "Čestitamo! 🎉" : "Pokušajte Ponovo",
      `Rezultat testa:\n\nTočnih odgovora: ${correctCount}/${
        questions.length
      }\nPostotak: ${score.toFixed(1)}%\nStatus: ${
        passed ? "POLOŽENO" : "PALO"
      }\n\nMinimalno za prolaz: 80%`,
      [
        {
          text: "Povratak",
          onPress: () => router.push("/Prva_pomoc"),
        },
        {
          text: "Pregled Odgovora",
          onPress: () => showDetailedResults(result),
        },
      ]
    );
  };

  const showDetailedResults = (result: TestResult) => {
    router.push({
      pathname: "/Prva_pomoc/pregled-rezultata",
      params: {
        questions: JSON.stringify(questions),
        result: JSON.stringify(result),
      },
    });
  };

  const handleExitTest = () => {
    Alert.alert(
      "Prekid testa",
      "Da li ste sigurni da želite prekinuti test? Trenutni progres će biti izgubljen.",
      [
        { text: "Nastavi test", style: "cancel" },
        {
          text: "Prekini test",
          style: "destructive",
          onPress: () => router.push("/Prva_pomoc"),
        },
      ]
    );
  };

  const currentQuestion = questions[currentQuestionIndex];
  const selectedAnswer = currentQuestion
    ? selectedAnswers[currentQuestion._id]
    : undefined;
  const progressPercentage =
    ((currentQuestionIndex + 1) / questions.length) * 100;
  const answeredQuestions = Object.keys(selectedAnswers).length;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#2086F6" />
        <ActivityIndicator size="large" color="#2086F6" />
        <Text style={styles.loadingText}>Učitavam test...</Text>
      </View>
    );
  }

  if (!userId) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#2086F6" />
        <ActivityIndicator size="large" color="#2086F6" />
        <Text style={styles.loadingText}>Provjera prijave...</Text>
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#2086F6" />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.push("/Prva_pomoc")}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Test</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.noQuestionsText}>
            Nema dostupnih pitanja za test.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2086F6" />

      {/* Header sa vremenom */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleExitTest} style={styles.backButton}>
          <Ionicons name="close" size={24} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {params.testType === "nasumicni-prva-pomoc"
              ? "Nasumični Test"
              : "Test"}
          </Text>
          <View style={styles.timerContainer}>
            <Ionicons name="time" size={16} color="#FFF" />
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <Text style={styles.progressText}>
            {currentQuestionIndex + 1}/{questions.length}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${progressPercentage}%` }]}
          />
        </View>
        <View style={styles.progressInfo}>
          <Text style={styles.progressInfoText}>
            Odgovoreno: {answeredQuestions}/{questions.length}
          </Text>
        </View>
      </View>

      {/* Question Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.questionCard}>
          <View style={styles.questionHeader}>
            <Text style={styles.questionNumber}>
              Pitanje {currentQuestionIndex + 1}
            </Text>
            <Text style={styles.questionTheme}>{currentQuestion.tema}</Text>
          </View>

          <Text style={styles.questionText}>{currentQuestion.pitanje}</Text>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {currentQuestion.opcije.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrectOption = option.correct;
              const showCorrect =
                correctAnswerIndex !== -1 && correctAnswerIndex === index;
              const isAnswered = hasAnsweredCurrent;

              return (
                <TouchableOpacity
                  key={option._id}
                  style={[
                    styles.optionButton,
                    isSelected && !isCorrectOption && styles.optionWrong,
                    isSelected && isCorrectOption && styles.optionCorrect,
                    showCorrect && !isSelected && styles.optionCorrect,
                    isAnswered &&
                      !isSelected &&
                      !showCorrect &&
                      styles.optionDisabled,
                  ]}
                  onPress={() => handleAnswerSelect(currentQuestion._id, index)}
                  disabled={isAnswered || isNavigating || testCompleted}
                >
                  <View style={styles.optionContent}>
                    <View style={styles.optionIndicator}>
                      {isSelected ? (
                        <Ionicons
                          name={
                            isCorrectOption
                              ? "checkmark-circle"
                              : "close-circle"
                          }
                          size={24}
                          color={isCorrectOption ? "#4FC377" : "#FF6B6B"}
                        />
                      ) : showCorrect ? (
                        <Ionicons
                          name="checkmark-circle"
                          size={24}
                          color="#4FC377"
                        />
                      ) : (
                        <View style={styles.optionCircle}>
                          <Text style={styles.optionLetter}>
                            {String.fromCharCode(65 + index)}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.optionText,
                        isSelected &&
                          !isCorrectOption &&
                          styles.optionTextWrong,
                        isSelected &&
                          isCorrectOption &&
                          styles.optionTextCorrect,
                        showCorrect && !isSelected && styles.optionTextCorrect,
                      ]}
                    >
                      {option.text}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity
          style={[
            styles.navButton,
            styles.navButtonSecondary,
            (currentQuestionIndex === 0 || isNavigating || testCompleted) &&
              styles.navButtonDisabled,
          ]}
          onPress={handlePrevious}
          disabled={currentQuestionIndex === 0 || isNavigating || testCompleted}
        >
          <Ionicons name="arrow-back" size={20} color="#2086F6" />
          <Text style={styles.navButtonTextSecondary}>Prethodno</Text>
        </TouchableOpacity>

        {currentQuestionIndex < questions.length - 1 ? (
          <TouchableOpacity
            style={[
              styles.navButton,
              (isNavigating || testCompleted) && styles.navButtonDisabled,
            ]}
            onPress={handleNext}
            disabled={isNavigating || testCompleted}
          >
            <Text style={styles.navButtonText}>Sljedeće</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.navButton,
              styles.submitButton,
              (isNavigating || testCompleted) && styles.navButtonDisabled,
            ]}
            onPress={calculateResults}
            disabled={isNavigating || testCompleted}
          >
            <Text style={styles.navButtonText}>Završi Test</Text>
            <Ionicons name="checkmark" size={20} color="#FFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Explanation Modal - NOVI REDIZAJN */}
      <Modal
        visible={showExplanation}
        animationType="fade"
        transparent={true}
        onRequestClose={closeExplanation}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
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

            {/* Divider */}
            <View style={styles.modalDivider} />

            {/* Explanation Content */}
            <ScrollView
              style={styles.explanationScroll}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.explanationContent}>
                <Text style={styles.explanationText}>{currentExplanation}</Text>
              </View>
            </ScrollView>

            {/* Action Button */}
            <TouchableOpacity
              style={styles.continueButton}
              onPress={closeExplanation}
              disabled={isNavigating}
            >
              <Text style={styles.continueButtonText}>Nastavi dalje</Text>
              <View style={styles.continueButtonIcon}>
                <Ionicons name="arrow-forward" size={20} color="#FFF" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Loading Overlay za navigaciju */}
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
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
  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  questionText: {
    fontSize: isSmallDevice ? 18 : 20,
    fontWeight: "600",
    color: "#1F2937",
    lineHeight: isSmallDevice ? 24 : 28,
    marginBottom: 8,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  optionCorrect: {
    borderColor: "#4FC377",
    backgroundColor: "#F0F9F4",
  },
  optionWrong: {
    borderColor: "#FF6B6B",
    backgroundColor: "#FEF2F2",
  },
  optionDisabled: {
    opacity: 0.6,
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
  optionTextCorrect: {
    color: "#047857",
    fontWeight: "600",
  },
  optionTextWrong: {
    color: "#DC2626",
    fontWeight: "600",
  },
  navigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
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
  
  // NOVI STILOVI ZA MODAL
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 40,
    elevation: 20,
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
    letterSpacing: -0.5,
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
    shadowColor: "#2086F6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  continueButtonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
});