import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Animated,
  Easing,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

const API_BASE_URL = __DEV__
  ? "http://192.168.1.10:5000"
  : "http://localhost:5000";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);

  const router = useRouter();

  // Animacije
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const scaleAnim = useState(new Animated.Value(0.8))[0];
  const logoScale = useState(new Animated.Value(0))[0];

  useEffect(() => {
    startAnimations();
  }, []);

  const startAnimations = () => {
    Animated.timing(logoScale, {
      toValue: 1,
      duration: 800,
      easing: Easing.elastic(1),
      useNativeDriver: true,
    }).start(() => {
      setShowLoginForm(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Greška", "Unesite e-mail i lozinku.");
      return;
    }

    if (!email.includes('@')) {
      Alert.alert("Greška", "Molimo unesite ispravnu email adresu");
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('🚀 Starting login process...', { email: email.toLowerCase().trim() });

      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password: password
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.log('Server error response:', errorData);
        throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Login response:', data);

      if (data.token) {
        console.log('💾 Saving user data to AsyncStorage...');
        
        // 🔹 KLJUČNA ISPRAVKA: SPREMANJE POD OBA NAČINA
        const userData = {
          id: data.id,
          email: data.email,
          name: data.name,
          role: data.role,
          token: data.token
        };

        // 🔹 SPREMI POD OBA FORMATA ZA KOMPATIBILNOST
        await AsyncStorage.multiSet([
          // STARI FORMAT: za postojeće screenove (home, profile)
          ['userToken', data.token],
          ['userRole', data.role],
          ['userName', data.name || ''],
          ['userEmail', data.email || ''],
          ['userId', data.id || ''],
          // NOVI FORMAT: za dashboard i buduće screenove
          ['user', JSON.stringify(userData)]
        ]);

        // Verifikacija
        const savedToken = await AsyncStorage.getItem('userToken');
        const savedUser = await AsyncStorage.getItem('user');
        console.log('✅ Verified - Token:', !!savedToken, 'User:', !!savedUser);
        console.log('🎉 Login successful! User role:', data.role);
        
        // 👇 REDIRECT PO ROLI
        setTimeout(() => {
          console.log('🧠 Checking user role for redirect:', data.role);
          
          if (data.role === 'instructor') {
            console.log('➡️ Redirecting INSTRUCTOR to DASHBOARD...');
            router.replace("/(instructor)/dashboard");
          } else {
            console.log('➡️ Redirecting CANDIDATE to HOME...');
            router.replace("/(tabs)/home");
          }
        }, 500);

      } else {
        Alert.alert("Greška", data.message || "Došlo je do greške pri prijavi");
      }
    } catch (error) {
      console.error('🚨 Login error:', error);
      Alert.alert(
        "Greška pri prijavi", 
        error.message || "Provjerite email, lozinku i konekciju sa serverom"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert("Reset lozinke", "Pošaljite email na: support@unaschool.ba");
  };

  const handleRegisterRedirect = () => {
    Alert.alert(
      "Registracija",
      "Za registraciju novog korisnika kontaktirajte administraciju:\nadmin@unaschool.hr"
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Animated.View
            style={[
              styles.logoContainer,
              { transform: [{ scale: logoScale }] },
            ]}
          >
            <View style={styles.logoCircle}>
              <Ionicons name="car-sport" size={60} color="#FFFFFF" />
            </View>
            <Text style={styles.logoText}>UNA SCHOOL</Text>
            <Text style={styles.subtitle}>Vozačka škola izvrsnosti</Text>
          </Animated.View>
        </View>

        {/* Login Form */}
        {showLoginForm && (
          <Animated.View
            style={[
              styles.formContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
              },
            ]}
          >
            <Text style={styles.welcomeText}>Prijava</Text>
            <Text style={styles.instructionText}>
              Unesite svoje korisničke podatke
            </Text>

            {/* Email */}
            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={20}
                color="#2086F6"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Email adresa"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!isLoading}
                returnKeyType="next"
              />
            </View>

            {/* Password */}
            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#2086F6"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Lozinka"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="password"
                editable={!isLoading}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#2086F6"
                />
              </TouchableOpacity>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={handleForgotPassword}
              disabled={isLoading}
            >
              <Text style={styles.forgotPasswordText}>
                Zaboravili ste lozinku?
              </Text>
            </TouchableOpacity>

            {/* Button */}
            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.buttonText}>Prijava...</Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <Text style={styles.buttonText}>Prijavi se</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                Nemate račun?{" "}
                <Text style={styles.infoLink} onPress={handleRegisterRedirect}>
                  Kontaktirajte nas
                </Text>
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Footer */}
        <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
          <View style={styles.footerIcons}>
            <Ionicons name="shield-checkmark" size={14} color="#4FC377" />
            <Text style={styles.footerSubText}>
              Sigurna i zaštićena prijava
            </Text>
          </View>
          <Text style={styles.footerText}>© 2024 Una School</Text>
        </Animated.View>
      </ScrollView>

      {/* Background */}
      <View style={styles.backgroundCircle1} />
      <View style={styles.backgroundCircle2} />
    </KeyboardAvoidingView>
  );
}

// Stilovi
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "space-between",
    paddingHorizontal: 25,
  },
  header: {
    alignItems: "center",
    paddingTop: height * 0.12,
    paddingBottom: 30,
  },
  logoContainer: { alignItems: "center" },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#2086F6",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#2086F6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
    marginBottom: 20,
  },
  logoText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2086F6",
    marginBottom: 8,
    letterSpacing: 1.5,
  },
  subtitle: {
    fontSize: 14,
    color: "#8104FA",
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  formContainer: { paddingBottom: 20 },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2086F6",
    textAlign: "center",
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    height: 56,
  },
  inputIcon: { marginRight: 12 },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#2086F6",
    fontWeight: "500",
    paddingVertical: 0,
  },
  eyeIcon: { padding: 4 },
  forgotPassword: { alignSelf: "flex-end", marginBottom: 24 },
  forgotPasswordText: { color: "#8104FA", fontSize: 14, fontWeight: "500" },
  button: {
    backgroundColor: "#2086F6",
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#2086F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonContent: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginRight: 8,
  },
  infoContainer: { alignItems: "center" },
  infoText: { fontSize: 14, color: "#666", textAlign: "center" },
  infoLink: { color: "#4FC377", fontWeight: "600" },
  footer: { paddingVertical: 20, alignItems: "center" },
  footerText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
  },
  footerIcons: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  footerSubText: {
    fontSize: 12,
    color: "#4FC377",
    fontWeight: "500",
    marginLeft: 4,
  },
  backgroundCircle1: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(32, 134, 246, 0.05)",
    top: -50,
    left: -50,
    zIndex: -1,
  },
  backgroundCircle2: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(79, 195, 119, 0.05)",
    bottom: -30,
    right: -30,
    zIndex: -1,
  },
});