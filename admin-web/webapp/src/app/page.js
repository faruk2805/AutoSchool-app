// app/login/page.js
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Unesite email i lozinku");
      return;
    }

    if (!email.includes("@")) {
      alert("Unesite ispravnu email adresu");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Greška pri prijavi");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("user", JSON.stringify(data.user || data));

      if (data.role === "admin") {
        window.location.href = "/admin";
      } else if (data.role === "instructor") {
        window.location.href = "/instructor";
      } else {
        window.location.href = "/";
      }

    } catch (error) {
      console.error("❌ Greška:", error);
      alert(error.message || "Došlo je do greške pri prijavi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F111A] via-[#1A1C25] to-[#232634] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6C63FF]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F111A] via-[#1A1C25] to-[#232634] relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#6C63FF]/20 to-[#FF4DA6]/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-[#3D9DF6]/20 to-[#27AE60]/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-[#FF6B35]/10 to-[#FF4DA6]/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-br from-[#6C63FF] to-[#FF4DA6] rounded-full opacity-30 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${15 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md transform transition-all duration-700 hover:scale-[1.02]">
          {/* Animated Logo */}
          <div className="text-center mb-12 animate-fade-in-up">
            <h1 className="text-4xl font-bold text-white bg-gradient-to-r from-white via-[#E2E8FF] to-[#B0B3C1] bg-clip-text text-transparent mb-2">
              Una Autoškola
            </h1>
            <p className="text-[#7A7F96] text-lg font-light tracking-wide">
              Uči voziti s povjerenjem.
            </p>
          </div>

          {/* Glass Morphism Login Form */}
          <div className="bg-gradient-to-br from-[#1A1C25]/80 to-[#232634]/80 backdrop-blur-xl rounded-3xl border border-[#2A2D3A]/50 p-10 shadow-2xl shadow-[#6C63FF]/10 hover:shadow-[#6C63FF]/20 transition-all duration-500 relative overflow-hidden">
            {/* Form Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#6C63FF]/5 to-[#FF4DA6]/5 rounded-3xl"></div>
            
            <div className="relative z-10">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-3 bg-gradient-to-r from-white to-[#B0B3C1] bg-clip-text text-transparent">
                  Dobrodošli Nazad
                </h2>
                <p className="text-[#B0B3C1] text-lg font-light">
                  Prijavite se da nastavite svoje putovanje
                </p>
              </div>

              {/* Email Input */}
              <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <label className="block text-[#B0B3C1] text-sm font-medium mb-3 uppercase tracking-wider">
                  📧 Email Adresa
                </label>
                <div className="relative group">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full bg-[#232634]/50 backdrop-blur-sm border-2 border-[#2A2D3A] rounded-2xl px-5 py-4 text-white placeholder-[#7A7F96] focus:outline-none focus:border-[#6C63FF] focus:ring-4 focus:ring-[#6C63FF]/20 transition-all duration-300 group-hover:border-[#6C63FF]/50"
                    placeholder="vaš@email.com"
                    disabled={isLoading}
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#7A7F96] group-hover:text-[#6C63FF] transition-colors duration-300">
                    ✉️
                  </div>
                </div>
              </div>

              {/* Password Input */}
              <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <label className="block text-[#B0B3C1] text-sm font-medium mb-3 uppercase tracking-wider">
                  🔒 Lozinka
                </label>
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full bg-[#232634]/50 backdrop-blur-sm border-2 border-[#2A2D3A] rounded-2xl px-5 py-4 text-white placeholder-[#7A7F96] focus:outline-none focus:border-[#6C63FF] focus:ring-4 focus:ring-[#6C63FF]/20 transition-all duration-300 group-hover:border-[#6C63FF]/50 pr-14"
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#7A7F96] hover:text-[#6C63FF] transition-all duration-300 hover:scale-110"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="w-full group relative bg-gradient-to-r from-[#6C63FF] to-[#FF4DA6] text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-2xl shadow-[#6C63FF]/40 hover:shadow-[#6C63FF]/60 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-3 relative z-10">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-white">Prijava u toku...</span>
                    </div>
                  ) : (
                    <span className="relative z-10 flex items-center justify-center space-x-2">
                      <span>🚀</span>
                      <span>Prijavi Se</span>
                    </span>
                  )}
                </button>
              </div>

              {/* Forgot Password */}
              <div className="text-center mt-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <button
                  onClick={() => alert("Kontaktirajte support@una-autoskola.ba")}
                  className="text-[#7A7F96] hover:text-[#B0B3C1] text-sm transition-all duration-300 hover:scale-105 font-light"
                >
                  Zaboravili ste lozinku?
                </button>
              </div>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-8 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <Link 
              href="/" 
              className="inline-flex items-center text-[#7A7F96] hover:text-[#B0B3C1] transition-all duration-300 hover:scale-105 group font-light"
            >
              <span className="group-hover:-translate-x-1 transition-transform duration-300">←</span>
              <span className="ml-2">Nazad na početnu stranicu</span>
            </Link>
          </div>

          {/* Footer */}
          <div className="text-center mt-12 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <p className="text-[#7A7F96] text-xs font-light tracking-wide">
              © 2024 Una Autoškola. Sva prava zadržana.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}