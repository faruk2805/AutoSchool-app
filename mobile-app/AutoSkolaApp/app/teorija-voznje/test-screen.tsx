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
import { LinearGradient } from "expo-linear-gradient";

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
  maxSelections?: number;
}

interface TestResult {
  correctCount: number;
  totalQuestions: number;
  score: number;
  passed: boolean;
  answers: { [key: string]: number[] };
}

export default function TestScreenTeorija() {
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
  const [correctAnswerIndexes, setCorrectAnswerIndexes] = useState<number[]>([]);
  const [hasAnsweredCurrent, setHasAnsweredCurrent] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800);
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  // Učitaj pitanja i user ID
  useEffect(() => {
    console.log("📖 Učitavam test TEORIJE...");
    loadUserAndQuestions();
  }, []);

  const loadUserAndQuestions = async () => {
    try {
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

      const questionsParam = params.questions as string;
      const testType = params.testType as string;

      console.log("📋 Test parametri:", { testType });

      if (questionsParam) {
        const parsedQuestions: Question[] = JSON.parse(questionsParam);
        
        // Randomiziraj redoslijed pitanja
        const shuffledQuestions = [...parsedQuestions]
          .sort(() => Math.random() - 0.5)
          .map(question => ({
            ...question,
            // Randomiziraj i opcije unutar pitanja
            opcije: [...question.opcije].sort(() => Math.random() - 0.5)
          }));

        console.log("✅ Učitano i randomizirano pitanja teorije:", shuffledQuestions.length);
        setQuestions(shuffledQuestions);
        setTestStarted(true);
        
        if (shuffledQuestions[0]?.slika) {
          setCurrentImage(shuffledQuestions[0].slika);
        }
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

  // Resetuj stanje kada se promijeni pitanje
  useEffect(() => {
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion) {
      const hasAnswered = selectedAnswers[currentQuestion._id] !== undefined;
      setHasAnsweredCurrent(hasAnswered);
      setCorrectAnswerIndexes([]);
      setIsAnswerCorrect(false);
      
      setCurrentImage(currentQuestion.slika || null);
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
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswerSelect = (questionId: string, optionIndex: number) => {
    if (isNavigating || testCompleted) return;

    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion || currentQuestion._id !== questionId) return;

    const currentSelections = selectedAnswers[questionId] || [];
    const maxSelections = currentQuestion.maxSelections || 1;
    const isCurrentlySelected = currentSelections.includes(optionIndex);

    let newSelections: number[];

    if (isCurrentlySelected) {
      // Deselect ako je već selektiran
      newSelections = currentSelections.filter(idx => idx !== optionIndex);
    } else {
      // Select ako nije premašio max
      if (currentSelections.length < maxSelections) {
        newSelections = [...currentSelections, optionIndex];
      } else {
        // Ako je premašio max, zamijeni prvi selektirani
        newSelections = [...currentSelections.slice(1), optionIndex];
      }
    }

    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: newSelections
    }));

    // Auto-submit ako je single selection pitanje
    if (maxSelections === 1 && newSelections.length === 1) {
      const selectedOption = currentQuestion.opcije[newSelections[0]];
      const isCorrect = selectedOption.correct;

      const correctIndexes = currentQuestion.opcije
        .map((opt, idx) => opt.correct ? idx : -1)
        .filter(idx => idx !== -1);
      
      setCorrectAnswerIndexes(correctIndexes);
      setHasAnsweredCurrent(true);

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
    }
  };

  const handleSubmitAnswer = () => {
    if (isNavigating || testCompleted || hasAnsweredCurrent) return;

    const currentQuestion = questions[currentQuestionIndex];
    const currentSelections = selectedAnswers[currentQuestion._id] || [];

    if (currentSelections.length === 0) {
      Alert.alert("Upozorenje", "Molimo odaberite bar jedan odgovor prije nego nastavite.");
      return;
    }

    setHasAnsweredCurrent(true);

    // Provjeri tačnost odgovora
    const correctIndexes = currentQuestion.opcije
      .map((opt, idx) => opt.correct ? idx : -1)
      .filter(idx => idx !== -1);
    
    setCorrectAnswerIndexes(correctIndexes);

    const isCorrect = currentSelections.every(selectedIdx => 
      currentQuestion.opcije[selectedIdx].correct
    ) && currentSelections.length === correctIndexes.length;

    setIsAnswerCorrect(isCorrect);

    if (!isCorrect && currentQuestion.objasnjenje) {
      setCurrentExplanation(currentQuestion.objasnjenje);
      setShowExplanation(true);
    } else {
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
    setCorrectAnswerIndexes([]);
    setIsNavigating(true);

    setTimeout(() => {
      handleNext();
    }, 300);
  };

  const saveTestResultToAPI = async (result: any) => {
    try {
      console.log("📡 POKUŠAVAM SPREMITI REZULTAT TEORIJE U BAZU...");

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

      const requestData = {
        userId: userId,
        tip: "teorija",
        subTip: "kombinovani",
        odgovori: result.odgovori.filter((odgovor: any) => odgovor.odgovor !== "Nije odgovoreno"),
        correctCount: result.correctCount,
        total: result.totalQuestions,
        score: result.score,
        passed: result.passed
      };

      console.log("📤 Podaci za slanje teorije:", JSON.stringify(requestData, null, 2));

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
      console.log("✅ USPJEH! Podaci teorije spremljeni u bazu:", responseData);
      return true;

    } catch (error) {
      console.error("🚨 GREŠKA PRI SPREMANJU TEORIJE U BAZU:", error);
      return false;
    }
  };

  const saveTestResult = async (result: TestResult) => {
    try {
      const testResultData = {
        tip: "teorija",
        subTip: "kombinovani",
        odgovori: questions.map((question) => {
          const selectedOptionIndexes = selectedAnswers[question._id] || [];
          const selectedOptions = selectedOptionIndexes.map(idx => question.opcije[idx]);

          return {
            questionId: question._id,
            odgovor: selectedOptions.length > 0 
              ? selectedOptions.map(opt => opt.text).join(", ")
              : "Nije odgovoreno",
            tacno: selectedOptions.length > 0 && 
                   selectedOptions.every(opt => opt.correct) &&
                   selectedOptions.length === question.opcije.filter(opt => opt.correct).length,
          };
        }),
        correctCount: result.correctCount,
        total: result.totalQuestions,
        score: result.score,
        passed: result.passed,
      };

      console.log("💾 Pripremljeni podaci za bazu teorije:", testResultData);

      const apiSuccess = await saveTestResultToAPI(testResultData);

      if (apiSuccess) {
        console.log("🎉 Test rezultat teorije uspješno spremljen u bazu!");
      } else {
        console.log("⚠️ Test rezultat teorije nije spremljen u bazu");
      }

    } catch (error) {
      console.error("🚨 Greška pri spremanju rezultata teorije:", error);
    }
  };

  const calculateResults = () => {
    let correctCount = 0;

    questions.forEach((question) => {
      const selectedOptionIndexes = selectedAnswers[question._id] || [];
      if (selectedOptionIndexes.length > 0) {
        const selectedOptions = selectedOptionIndexes.map(idx => question.opcije[idx]);
        const correctOptions = question.opcije.filter(opt => opt.correct);
        
        const isCorrect = selectedOptions.length === correctOptions.length &&
                         selectedOptions.every(opt => opt.correct) &&
                         correctOptions.every(opt => selectedOptions.includes(opt));
        
        if (isCorrect) {
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

    console.log("📊 Rezultat testa teorije:", result);
    setTestCompleted(true);
    setTestResult(result);
    setShowResultsModal(true);

    saveTestResult(result);
  };

  const showDetailedResults = () => {
    setShowResultsModal(false);
    router.push({
      pathname: "/teorija-voznje/pregled-rezultata",
      params: {
        questions: JSON.stringify(questions),
        result: JSON.stringify(testResult),
        testType: "teorija"
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
          onPress: () => router.push("/teorija-voznje"),
        },
      ]
    );
  };

  const currentQuestion = questions[currentQuestionIndex];
  const selectedAnswer = currentQuestion
    ? selectedAnswers[currentQuestion._id] || []
    : [];
  const progressPercentage =
    ((currentQuestionIndex + 1) / questions.length) * 100;
  const answeredQuestions = Object.keys(selectedAnswers).length;

  const getMaxSelections = () => {
    return currentQuestion?.maxSelections || 1;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#2086F6" />
        <LinearGradient
          colors={['#2086F6', '#4FC377']}
          style={StyleSheet.absoluteFill}
        />
        <ActivityIndicator size="large" color="#FFF" />
        <Text style={styles.loadingText}>Učitavam test teorije...</Text>
      </View>
    );
  }

  if (!userId) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#2086F6" />
        <LinearGradient
          colors={['#2086F6', '#4FC377']}
          style={StyleSheet.absoluteFill}
        />
        <ActivityIndicator size="large" color="#FFF" />
        <Text style={styles.loadingText}>Provjera prijave...</Text>
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#2086F6" />
        <LinearGradient
          colors={['#2086F6', '#4FC377']}
          style={styles.backgroundGradient}
        />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.push("/teorija-voznje")}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Test Teorije</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.noQuestionsText}>
            Nema dostupnih pitanja za test teorije.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2086F6" />

      {/* Background Gradient */}
      <LinearGradient
        colors={['#2086F6', '#4FC377']}
        style={styles.backgroundGradient}
      />

      {/* Header sa vremenom */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleExitTest} style={styles.backButton}>
          <Ionicons name="close" size={24} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {params.testType === "nasumicni-teorija"
              ? "Nasumični Test Teorije"
              : "Test Teorije"}
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
            <View style={styles.questionNumberContainer}>
              <Text style={styles.questionNumber}>
                Pitanje {currentQuestionIndex + 1}
              </Text>
              <Text style={styles.questionTheme}>{currentQuestion.tema}</Text>
            </View>
            <View style={styles.questionPoints}>
              <Ionicons name="star" size={16} color="#FFB020" />
              <Text style={styles.pointsText}>1 bod</Text>
            </View>
          </View>

          {/* Selection Info */}
          {getMaxSelections() > 1 && (
            <View style={styles.multiSelectInfo}>
              <Ionicons name="information-circle" size={16} color="#2086F6" />
              <Text style={styles.multiSelectText}>
                Možete odabrati do {getMaxSelections()} odgovora
              </Text>
            </View>
          )}

          {/* Slika ako postoji */}
          {currentImage && (
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: currentImage }}
                style={styles.questionImage}
                resizeMode="contain"
              />
            </View>
          )}

          <Text style={styles.questionText}>{currentQuestion.pitanje}</Text>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {currentQuestion.opcije.map((option, index) => {
              const isSelected = selectedAnswer.includes(index);
              const isCorrectOption = option.correct;
              const showCorrect = correctAnswerIndexes.includes(index);
              const isAnswered = hasAnsweredCurrent;

              return (
                <TouchableOpacity
                  key={option._id}
                  style={[
                    styles.optionButton,
                    isSelected && !showCorrect && styles.optionSelected,
                    isSelected && showCorrect && styles.optionCorrect,
                    showCorrect && !isSelected && styles.optionCorrect,
                    isAnswered && !isSelected && !showCorrect && styles.optionDisabled,
                  ]}
                  onPress={() => handleAnswerSelect(currentQuestion._id, index)}
                  disabled={isAnswered && getMaxSelections() === 1}
                >
                  <View style={styles.optionContent}>
                    <View style={styles.optionIndicator}>
                      {isSelected ? (
                        <Ionicons
                          name={showCorrect ? "checkmark-circle" : "radio-button-on"}
                          size={24}
                          color={showCorrect ? "#4FC377" : "#2086F6"}
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
                        isSelected && styles.optionTextSelected,
                        showCorrect && styles.optionTextCorrect,
                      ]}
                    >
                      {option.text}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Submit Button za multiple choice */}
          {getMaxSelections() > 1 && !hasAnsweredCurrent && (
            <TouchableOpacity
              style={styles.submitAnswerButton}
              onPress={handleSubmitAnswer}
              disabled={selectedAnswer.length === 0}
            >
              <LinearGradient
                colors={selectedAnswer.length === 0 ? ['#9CA3AF', '#6B7280'] : ['#2086F6', '#4FC377']}
                style={styles.submitAnswerGradient}
              >
                <Text style={styles.submitAnswerText}>
                  Potvrdi odgovor
                </Text>
                <Ionicons name="checkmark" size={20} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          )}
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
              (!hasAnsweredCurrent || isNavigating || testCompleted) && styles.navButtonDisabled,
            ]}
            onPress={handleNext}
            disabled={!hasAnsweredCurrent || isNavigating || testCompleted}
          >
            <Text style={styles.navButtonText}>Sljedeće</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.navButton,
              styles.submitButton,
              (!hasAnsweredCurrent || isNavigating || testCompleted) && styles.navButtonDisabled,
            ]}
            onPress={calculateResults}
            disabled={!hasAnsweredCurrent || isNavigating || testCompleted}
          >
            <Text style={styles.navButtonText}>Završi Test</Text>
            <Ionicons name="checkmark" size={20} color="#FFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Explanation Modal - NOVI LJEPŠI DESIGN */}
      <Modal
        visible={showExplanation}
        animationType="slide"
        transparent={true}
        onRequestClose={closeExplanation}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <LinearGradient
              colors={['#FF6B6B', '#FF8E53']}
              style={styles.modalHeader}
            >
              <View style={styles.modalIconContainer}>
                <Ionicons name="bulb-outline" size={32} color="#FFF" />
              </View>
              <View style={styles.modalTitleContainer}>
                <Text style={styles.modalTitle}>Objašnjenje</Text>
                <View style={styles.resultBadge}>
                  <Ionicons name="close-circle" size={16} color="#FFF" />
                  <Text style={styles.resultBadgeText}>Pogrešan odgovor</Text>
                </View>
              </View>
              <TouchableOpacity onPress={closeExplanation} style={styles.modalCloseButton}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </LinearGradient>

            {/* Explanation Content */}
            <ScrollView
              style={styles.explanationScroll}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.explanationContent}>
                <View style={styles.explanationIcon}>
                  <Ionicons name="information-circle" size={48} color="#2086F6" />
                </View>
                <Text style={styles.explanationText}>{currentExplanation}</Text>
              </View>
            </ScrollView>

            {/* Action Button */}
            <TouchableOpacity
              style={styles.continueButton}
              onPress={closeExplanation}
              disabled={isNavigating}
            >
              <LinearGradient
                colors={['#2086F6', '#4FC377']}
                style={styles.continueButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.continueButtonText}>Nastavi dalje</Text>
                <View style={styles.continueButtonIcon}>
                  <Ionicons name="arrow-forward" size={20} color="#FFF" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Results Modal */}
      <Modal
        visible={showResultsModal}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.resultsModalOverlay}>
          <View style={styles.resultsModalContent}>
            <LinearGradient
              colors={testResult?.passed ? ['#4FC377', '#2E8B57'] : ['#FF6B6B', '#DC2626']}
              style={styles.resultsModalHeader}
            >
              <Ionicons 
                name={testResult?.passed ? "trophy" : "sad"} 
                size={48} 
                color="#FFF" 
              />
              <Text style={styles.resultsModalTitle}>
                {testResult?.passed ? "Čestitamo! 🎉" : "Pokušajte Ponovo"}
              </Text>
              <Text style={styles.resultsModalSubtitle}>
                {testResult?.passed ? "Uspješno ste položili test!" : "Test nije položen"}
              </Text>
            </LinearGradient>

            <View style={styles.resultsContent}>
              <View style={styles.resultStats}>
                <View style={styles.resultStat}>
                  <Text style={styles.resultStatNumber}>{testResult?.correctCount}</Text>
                  <Text style={styles.resultStatLabel}>Točnih odgovora</Text>
                </View>
                <View style={styles.resultStat}>
                  <Text style={styles.resultStatNumber}>{testResult?.totalQuestions}</Text>
                  <Text style={styles.resultStatLabel}>Ukupno pitanja</Text>
                </View>
                <View style={styles.resultStat}>
                  <Text style={styles.resultStatNumber}>{testResult?.score?.toFixed(1)}%</Text>
                  <Text style={styles.resultStatLabel}>Postotak</Text>
                </View>
              </View>

              <View style={styles.resultsActions}>
                <TouchableOpacity
                  style={styles.resultsButtonSecondary}
                  onPress={() => {
                    setShowResultsModal(false);
                    router.push("/teorija-voznje");
                  }}
                >
                  <Text style={styles.resultsButtonSecondaryText}>Početna</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.resultsButtonPrimary}
                  onPress={showDetailedResults}
                >
                  <Text style={styles.resultsButtonPrimaryText}>Pregled Odgovora</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Loading Overlay */}
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
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
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
    alignItems: "flex-start",
    marginBottom: 16,
  },
  questionNumberContainer: {
    flex: 1,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  questionTheme: {
    fontSize: 12,
    color: "#2086F6",
    fontWeight: "500",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  questionPoints: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pointsText: {
    fontSize: 12,
    color: '#FFB020',
    fontWeight: '600',
    marginLeft: 4,
  },
  multiSelectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  multiSelectText: {
    fontSize: 14,
    color: '#2086F6',
    fontWeight: '500',
    marginLeft: 8,
  },
  imageContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  questionImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
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
  optionSelected: {
    borderColor: "#2086F6",
    backgroundColor: "#EFF6FF",
  },
  optionCorrect: {
    borderColor: "#4FC377",
    backgroundColor: "#F0F9F4",
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
  optionTextSelected: {
    color: "#2086F6",
    fontWeight: "600",
  },
  optionTextCorrect: {
    color: "#047857",
    fontWeight: "600",
  },
  submitAnswerButton: {
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  submitAnswerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
  },
  submitAnswerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
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
  
  // NOVI MODAL STILOVI
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    width: "100%",
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 40,
    elevation: 20,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 24,
    paddingBottom: 20,
  },
  modalIconContainer: {
    marginRight: 16,
  },
  modalTitleContainer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  resultBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  resultBadgeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 6,
  },
  modalCloseButton: {
    padding: 4,
  },
  explanationScroll: {
    maxHeight: 300,
  },
  explanationContent: {
    padding: 24,
    alignItems: 'center',
  },
  explanationIcon: {
    marginBottom: 16,
  },
  explanationText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#4B5563",
    textAlign: "center",
    fontWeight: "500",
  },
  continueButton: {
    margin: 24,
    marginTop: 8,
    borderRadius: 16,
    shadowColor: "#2086F6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  continueButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 18,
    borderRadius: 16,
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  continueButtonIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },

  // RESULTS MODAL STILOVI
  resultsModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  resultsModalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 40,
    elevation: 20,
    overflow: "hidden",
  },
  resultsModalHeader: {
    padding: 32,
    alignItems: "center",
  },
  resultsModalTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  resultsModalSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },
  resultsContent: {
    padding: 24,
  },
  resultStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 24,
  },
  resultStat: {
    alignItems: "center",
  },
  resultStatNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 4,
  },
  resultStatLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
  },
  resultsActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  resultsButtonSecondary: {
    flex: 1,
    padding: 16,
    borderWidth: 2,
    borderColor: "#2086F6",
    borderRadius: 12,
    marginRight: 8,
    alignItems: "center",
  },
  resultsButtonSecondaryText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2086F6",
  },
  resultsButtonPrimary: {
    flex: 1,
    padding: 16,
    backgroundColor: "#2086F6",
    borderRadius: 12,
    marginLeft: 8,
    alignItems: "center",
  },
  resultsButtonPrimaryText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});