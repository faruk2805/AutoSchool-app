// app/instruktor/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar2";

export default function InstruktorDashboard() {
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState("pocetna");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const userData = localStorage.getItem("user");

    if (!token || role !== "instructor") {
      router.push("/");
      return;
    }

    // Simuliramo učitavanje za bolji UX
    setTimeout(() => {
      setUser(JSON.parse(userData));
      setIsLoading(false);
    }, 1800);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F111A] via-[#1A1C25] to-[#232634] flex items-center justify-center relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-[#3D9DF6]/20 to-[#27AE60]/20 rounded-full animate-orbital-1"></div>
          <div className="absolute bottom-1/3 right-1/3 w-48 h-48 bg-gradient-to-r from-[#FF6B35]/20 to-[#FF9D6C]/20 rounded-full animate-orbital-2"></div>
          <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-gradient-to-r from-[#6C63FF]/20 to-[#FF4DA6]/20 rounded-full animate-orbital-3"></div>
        </div>

        {/* Main Loading Content */}
        <div className="relative z-10 text-center">
          {/* Animated Logo */}
          <div className="relative mb-8">
            <div className="w-32 h-32 bg-gradient-to-br from-[#3D9DF6] to-[#27AE60] rounded-3xl flex items-center justify-center mx-auto mb-6 relative overflow-hidden shadow-2xl shadow-[#3D9DF6]/40">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-shimmer"></div>
              <span className="text-4xl animate-pulse-slow">👨‍🏫</span>
            </div>
            {/* Orbiting dots */}
            <div className="absolute inset-0">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-3 h-3 bg-gradient-to-br from-[#3D9DF6] to-[#27AE60] rounded-full animate-orbit"
                  style={{
                    animationDelay: `${i * 0.5}s`
                  }}
                />
              ))}
            </div>
          </div>

          {/* Animated Text */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-white bg-gradient-to-r from-[#3D9DF6] via-[#27AE60] to-[#6C63FF] bg-clip-text text-transparent animate-gradient-text">
              Una Autoškola
            </h1>
            <div className="h-8 flex items-center justify-center">
              <p className="text-[#B0B3C1] text-lg font-light animate-typing overflow-hidden whitespace-nowrap border-r-4 border-r-[#3D9DF6] w-0 mx-auto">
                Instruktorski panel - Učitavanje...
              </p>
            </div>
          </div>

          {/* Loading Bar */}
          <div className="mt-8 w-64 mx-auto">
            <div className="w-full bg-[#232634] rounded-full h-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#3D9DF6] to-[#27AE60] rounded-full animate-loading-bar"></div>
            </div>
            <p className="text-[#7A7F96] text-sm mt-2 animate-pulse">
              Pripremam vaš dashboard...
            </p>
          </div>

          {/* Floating Elements */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-6 h-6 opacity-20 animate-float-3d"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${8 + Math.random() * 8}s`
                }}
              >
                {['🚗', '👨‍🏫', '🎓', '📝', '⏰', '⭐'][i % 6]}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#0F111A] via-[#1A1C25] to-[#232634] text-white">
      {/* Sidebar Component */}
      <Sidebar
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        user={user}
        onLogout={handleLogout}
        role="instruktor"
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-gradient-to-r from-[#1A1C25] to-[#232634]/80 backdrop-blur-xl border-b border-[#2A2D3A] p-8 shadow-2xl shadow-[#3D9DF6]/5 animate-slideDown">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white bg-gradient-to-r from-white via-[#E2E8FF] to-[#B0B3C1] bg-clip-text text-transparent">
                {getSectionTitle(activeSection)}
              </h1>
              <p className="text-[#B0B3C1] mt-3 text-lg font-light">
                {getSectionDescription(activeSection)}
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="bg-[#232634]/60 backdrop-blur-lg px-6 py-3 rounded-2xl text-[#B0B3C1] border border-[#2A2D3A] shadow-2xl shadow-black/30 hover:shadow-[#3D9DF6]/20 hover:border-[#3D9DF6]/40 transition-all duration-500 group hover:scale-105">
                <span className="flex items-center space-x-3">
                  <span className="text-xl">📅</span>
                  <span className="font-medium">{new Date().toLocaleDateString('bs-BA')}</span>
                </span>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-[#3D9DF6] to-[#27AE60] rounded-2xl flex items-center justify-center shadow-2xl shadow-[#3D9DF6]/40 border border-[#3D9DF6]/50 hover:scale-105 transition-transform duration-300 animate-pulse-slow">
                <span className="text-2xl">👨‍🏫</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-auto">
          <SectionContent activeSection={activeSection} user={user} />
        </main>
      </div>
    </div>
  );
}

// Helper functions
function getSectionTitle(section) {
  const titles = {
    pocetna: "Kontrolna ploča",
    kandidati: "Moji kandidati",
    raspored: "Raspored vožnji",
    vozilo: "Moje vozilo",
    izvjestaji: "Izvještaji i statistika",
    profil: "Moj profil"
  };
  return titles[section] || "Instruktorski panel";
}

function getSectionDescription(section) {
  const descriptions = {
    pocetna: "Pregled vaših aktivnosti i performansi",
    kandidati: "Upravljajte svojim kandidatima i napretkom",
    raspored: "Organizujte termine i časove vožnje",
    vozilo: "Informacije o dodijeljenom vozilu",
    izvjestaji: "Pregled statistike i postignuća",
    profil: "Upravljajte svojim profilom i postavkama"
  };
  return descriptions[section] || "Upravljajte svojim instruktorskim aktivnostima";
}

// Main Content Component
function SectionContent({ activeSection, user }) {
  const sections = {
    pocetna: <DashboardContent user={user} />,
    kandidati: <KandidatiContent />,
    raspored: <RasporedContent />,
    vozilo: <VoziloContent />,
    izvjestaji: <IzvjestajiContent />,
    profil: <ProfilContent user={user} />,
  };

  return sections[activeSection] || <DashboardContent user={user} />;
}

// Content Components
function DashboardContent({ user }) {
  const [hoveredCard, setHoveredCard] = useState(null);

  const quickActions = [
    { icon: "📝", label: "Novi termin", color: "from-[#3D9DF6] to-[#56CCF2]" },
    { icon: "👥", label: "Dodaj kandidata", color: "from-[#27AE60] to-[#6FCF97]" },
    { icon: "📊", label: "Unesi ocjenu", color: "from-[#FF6B35] to-[#FF9D6C]" },
    { icon: "🚗", label: "Evidencija", color: "from-[#6C63FF] to-[#FF4DA6]" },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#3D9DF6] to-[#27AE60] rounded-3xl p-8 shadow-2xl shadow-[#3D9DF6]/40 border border-[#3D9DF6]/50 hover:scale-[1.02] transition-transform duration-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 animate-shimmer-slow"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-3 animate-pulse">
              Dobrodošli nazad, {user?.name}! 👋
            </h2>
            <p className="text-white/80 text-lg max-w-2xl">
              Vaši kandidati napreduju odlično. Evo šta vas danas čeka.
            </p>
          </div>
          <div className="text-6xl opacity-20 animate-bounce-slow">🚗</div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Aktivni kandidati" 
          value="12" 
          trend="+2"
          icon="🎓"
          color="from-[#3D9DF6] to-[#56CCF2]"
          trendColor="text-[#27AE60]"
          description="Trenutno aktivni"
          index={0}
          hoveredCard={hoveredCard}
          onHover={setHoveredCard}
        />
        <StatCard 
          title="Zakazane vožnje" 
          value="8" 
          trend="Danas"
          icon="⏰"
          color="from-[#FF6B35] to-[#FF9D6C]"
          trendColor="text-[#B0B3C1]"
          description="Termini za danas"
          index={1}
          hoveredCard={hoveredCard}
          onHover={setHoveredCard}
        />
        <StatCard 
          title="Stopa uspjeha" 
          value="94%" 
          trend="+3%"
          icon="⭐"
          color="from-[#27AE60] to-[#6FCF97]"
          trendColor="text-[#27AE60]"
          description="Položeni ispiti"
          index={2}
          hoveredCard={hoveredCard}
          onHover={setHoveredCard}
        />
        <StatCard 
          title="Kilometraža" 
          value="1.2k" 
          trend="Ovaj mjesec"
          icon="🛣️"
          color="from-[#6C63FF] to-[#FF4DA6]"
          trendColor="text-[#B0B3C1]"
          description="Pređeni kilometri"
          index={3}
          hoveredCard={hoveredCard}
          onHover={setHoveredCard}
        />
      </div>

      {/* Brze akcije & Današnji raspored */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Brze akcije */}
        <div className="bg-gradient-to-br from-[#1A1C25] to-[#232634] rounded-2xl border border-[#2A2D3A] p-6 shadow-2xl shadow-black/20 hover:shadow-[#3D9DF6]/10 transition-all duration-500 animate-slideInLeft">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-3">
            <span className="text-2xl animate-pulse">⚡</span>
            <span>Brze akcije</span>
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className={`bg-gradient-to-br ${action.color} p-4 rounded-xl text-white text-center shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 border border-white/10 animate-popIn`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-2xl mb-2 animate-bounce">{action.icon}</div>
                <div className="text-sm font-medium">{action.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Današnji raspored */}
        <div className="bg-gradient-to-br from-[#1A1C25] to-[#232634] rounded-2xl border border-[#2A2D3A] p-6 shadow-2xl shadow-black/20 lg:col-span-2 hover:shadow-[#3D9DF6]/10 transition-all duration-500 animate-slideInRight">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-3">
            <span className="text-2xl">📅</span>
            <span>Današnji raspored vožnji</span>
          </h3>
          <div className="space-y-4">
            {[
              { time: "08:00", kandidat: "Adnan Hadžić", tip: "Prva vožnja", status: "U toku" },
              { time: "09:30", kandidat: "Lejla Karić", tip: "Gradska vožnja", status: "Sljedeće" },
              { time: "11:00", kandidat: "Dženan Džafić", tip: "Poligon", status: "Zakazano" },
              { time: "13:30", kandidat: "Amela Smajlović", tip: "Test na cesti", status: "Zakazano" },
              { time: "15:00", kandidat: "Kenan Kovačević", tip: "Noćna vožnja", status: "Zakazano" },
            ].map((item, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-4 bg-[#232634] rounded-xl border border-[#2A2D3A] hover:border-[#3D9DF6]/30 hover:scale-[1.02] transition-all duration-300 group animate-slideUp"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#3D9DF6] to-[#27AE60] rounded-xl flex items-center justify-center text-white font-semibold text-sm group-hover:scale-110 transition-transform duration-300">
                    {item.time}
                  </div>
                  <div>
                    <p className="text-white font-medium">{item.kandidat}</p>
                    <p className="text-[#7A7F96] text-sm">{item.tip}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium animate-pulse ${
                  item.status === 'U toku' ? 'bg-[#27AE60]/20 text-[#27AE60] border border-[#27AE60]/30' :
                  item.status === 'Sljedeće' ? 'bg-[#FF6B35]/20 text-[#FF6B35] border border-[#FF6B35]/30' :
                  'bg-[#3D9DF6]/20 text-[#3D9DF6] border border-[#3D9DF6]/30'
                }`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Aktivni kandidati i performanse */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-[#1A1C25] to-[#232634] rounded-2xl border border-[#2A2D3A] p-6 shadow-2xl shadow-black/20 hover:shadow-[#3D9DF6]/10 transition-all duration-500">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-3">
            <span className="text-2xl">👥</span>
            <span>Aktivni kandidati</span>
          </h3>
          <div className="space-y-4">
            {[
              { name: "Adnan Hadžić", progress: 85, status: "Napredni", vozniSati: 28 },
              { name: "Lejla Karić", progress: 65, status: "Srednji", vozniSati: 18 },
              { name: "Dženan Džafić", progress: 45, status: "Početni", vozniSati: 12 },
              { name: "Amela Smajlović", progress: 92, status: "Spreman za ispit", vozniSati: 35 },
            ].map((kandidat, index) => (
              <div 
                key={index} 
                className="p-4 bg-[#232634] rounded-xl border border-[#2A2D3A] hover:scale-[1.02] transition-all duration-300 animate-fadeIn"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#3D9DF6] to-[#27AE60] rounded-xl flex items-center justify-center text-white font-semibold text-sm">
                      {kandidat.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-white font-medium">{kandidat.name}</p>
                      <p className="text-[#7A7F96] text-xs">{kandidat.vozniSati} sati vožnje</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    kandidat.status === 'Spreman za ispit' ? 'bg-[#27AE60]/20 text-[#27AE60]' :
                    kandidat.status === 'Napredni' ? 'bg-[#3D9DF6]/20 text-[#3D9DF6]' :
                    kandidat.status === 'Srednji' ? 'bg-[#FF6B35]/20 text-[#FF6B35]' :
                    'bg-[#6C63FF]/20 text-[#6C63FF]'
                  }`}>
                    {kandidat.status}
                  </span>
                </div>
                <div className="w-full bg-[#2A2D3A] rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-[#3D9DF6] to-[#27AE60] h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${kandidat.progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-[#7A7F96] mt-2">
                  <span>Napredak: {kandidat.progress}%</span>
                  <span>{kandidat.progress}/100</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#1A1C25] to-[#232634] rounded-2xl border border-[#2A2D3A] p-6 shadow-2xl shadow-black/20 hover:shadow-[#3D9DF6]/10 transition-all duration-500">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-3">
            <span className="text-2xl animate-pulse">📊</span>
            <span>Vaše performanse</span>
          </h3>
          <div className="space-y-4">
            {[
              { metric: "Zadovoljstvo kandidata", value: "4.8/5", change: "+0.3", color: "from-[#27AE60] to-[#6FCF97]" },
              { metric: "Prosječna ocjena", value: "4.9", change: "+0.1", color: "from-[#FF6B35] to-[#FF9D6C]" },
              { metric: "Stopa položenih", value: "94%", change: "+5%", color: "from-[#3D9DF6] to-[#56CCF2]" },
              { metric: "Broj vožnji", value: "48", change: "Ovaj mjesec", color: "from-[#6C63FF] to-[#FF4DA6]" },
            ].map((item, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-4 bg-[#232634] rounded-xl border border-[#2A2D3A] hover:scale-[1.02] transition-all duration-300 animate-fadeIn"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-8 bg-gradient-to-b ${item.color} rounded-full animate-grow`}></div>
                  <div>
                    <p className="text-white font-medium">{item.metric}</p>
                    <p className="text-[#27AE60] text-sm">{item.change}</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-white animate-pulse">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// StatCard Component
function StatCard({ title, value, trend, icon, color, trendColor, description, index, hoveredCard, onHover }) {
  const isHovered = hoveredCard === index;

  return (
    <div 
      className={`bg-gradient-to-br from-[#1A1C25] to-[#232634] p-6 rounded-2xl border border-[#2A2D3A] shadow-2xl shadow-black/20 transition-all duration-500 animate-popIn ${
        isHovered ? 'scale-105 shadow-[#3D9DF6]/30 border-[#3D9DF6]/50' : 'hover:shadow-[#3D9DF6]/20 hover:border-[#3D9DF6]/30'
      }`}
      style={{ animationDelay: `${index * 150}ms` }}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-[#B0B3C1] text-sm font-medium mb-2">{title}</p>
          <p className={`text-3xl font-bold transition-all duration-500 ${
            isHovered ? 'bg-gradient-to-r from-[#3D9DF6] to-[#27AE60] bg-clip-text text-transparent' : 'text-white'
          }`}>
            {value}
          </p>
          <p className={`text-sm font-semibold mt-2 ${trendColor} animate-pulse`}>{trend}</p>
          {description && (
            <p className="text-[#7A7F96] text-xs mt-2">{description}</p>
          )}
        </div>
        <div className={`bg-gradient-to-br ${color} p-3 rounded-2xl shadow-2xl shadow-current/40 transition-transform duration-300 ${
          isHovered ? 'scale-125 rotate-12' : 'group-hover:scale-110'
        }`}>
          <span className="text-2xl text-white animate-bounce">{icon}</span>
        </div>
      </div>
      <div className="w-full bg-[#2A2D3A] rounded-full h-1">
        <div 
          className={`bg-gradient-to-r ${color} h-1 rounded-full transition-all duration-1000 ${
            isHovered ? 'w-full' : 'w-3/4'
          }`}
        ></div>
      </div>
    </div>
  );
}

// Placeholder components for other sections
function KandidatiContent() {
  return <PlaceholderContent title="Moji kandidati" icon="👥" />;
}

function RasporedContent() {
  return <PlaceholderContent title="Raspored vožnji" icon="📅" />;
}

function VoziloContent() {
  return <PlaceholderContent title="Moje vozilo" icon="🚗" />;
}

function IzvjestajiContent() {
  return <PlaceholderContent title="Izvještaji i statistika" icon="📊" />;
}

function ProfilContent({ user }) {
  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      <div className="bg-gradient-to-br from-[#1A1C25] to-[#232634] rounded-2xl border border-[#2A2D3A] p-8 shadow-2xl shadow-black/20">
        <h2 className="text-3xl font-bold text-white mb-8 flex items-center space-x-3">
          <span className="text-3xl">👨‍🏫</span>
          <span>Moj profil</span>
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Osnovne informacije */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">Osnovne informacije</h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-[#232634] rounded-xl border border-[#2A2D3A]">
                <div className="w-12 h-12 bg-gradient-to-br from-[#3D9DF6] to-[#27AE60] rounded-xl flex items-center justify-center text-white font-semibold">
                  👤
                </div>
                <div>
                  <p className="text-[#B0B3C1] text-sm">Ime i prezime</p>
                  <p className="text-white font-medium">{user?.name} {user?.surname}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-[#232634] rounded-xl border border-[#2A2D3A]">
                <div className="w-12 h-12 bg-gradient-to-br from-[#FF6B35] to-[#FF9D6C] rounded-xl flex items-center justify-center text-white font-semibold">
                  📧
                </div>
                <div>
                  <p className="text-[#B0B3C1] text-sm">Email adresa</p>
                  <p className="text-white font-medium">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-[#232634] rounded-xl border border-[#2A2D3A]">
                <div className="w-12 h-12 bg-gradient-to-br from-[#6C63FF] to-[#FF4DA6] rounded-xl flex items-center justify-center text-white font-semibold">
                  🪪
                </div>
                <div>
                  <p className="text-[#B0B3C1] text-sm">Broj licence</p>
                  <p className="text-white font-medium">{user?.licenseNumber || "BIH-12345"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Statistika */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">Statistika</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-[#3D9DF6] to-[#56CCF2] p-4 rounded-xl text-center text-white">
                <div className="text-2xl font-bold">156</div>
                <div className="text-sm opacity-90">Ukupno kandidata</div>
              </div>
              
              <div className="bg-gradient-to-br from-[#27AE60] to-[#6FCF97] p-4 rounded-xl text-center text-white">
                <div className="text-2xl font-bold">94%</div>
                <div className="text-sm opacity-90">Stopa uspjeha</div>
              </div>
              
              <div className="bg-gradient-to-br from-[#FF6B35] to-[#FF9D6C] p-4 rounded-xl text-center text-white">
                <div className="text-2xl font-bold">4.8</div>
                <div className="text-sm opacity-90">Prosječna ocjena</div>
              </div>
              
              <div className="bg-gradient-to-br from-[#6C63FF] to-[#FF4DA6] p-4 rounded-xl text-center text-white">
                <div className="text-2xl font-bold">3+</div>
                <div className="text-sm opacity-90">Godine iskustva</div>
              </div>
            </div>

            <div className="bg-[#232634] rounded-xl p-4 border border-[#2A2D3A]">
              <h4 className="text-white font-medium mb-3">Dodijeljeno vozilo</h4>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#27AE60] to-[#6FCF97] rounded-xl flex items-center justify-center text-white">
                  🚗
                </div>
                <div>
                  <p className="text-white font-medium">Škoda Octavia</p>
                  <p className="text-[#7A7F96] text-sm">A789-C-123 • 2021</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlaceholderContent({ title, icon }) {
  return (
    <div className="flex items-center justify-center min-h-96 animate-fadeIn">
      <div className="text-center max-w-2xl">
        <div className="text-8xl mb-8 opacity-50 animate-bounce">{icon}</div>
        <h2 className="text-4xl font-bold text-white mb-6 bg-gradient-to-r from-white to-[#B0B3C1] bg-clip-text text-transparent animate-pulse">
          {title}
        </h2>
        <p className="text-[#B0B3C1] text-lg leading-relaxed mb-8 animate-slideUp">
          Ova sekcija je trenutno u razvoju. Vrijemo da vam donesemo 
          sveobuhvatne alate za upravljanje {title.toLowerCase()}.
        </p>
        <div className="bg-gradient-to-r from-[#3D9DF6] to-[#27AE60] p-4 rounded-2xl shadow-2xl shadow-[#3D9DF6]/40 border border-[#3D9DF6]/50 hover:scale-105 transition-transform duration-300 animate-pulse">
          <p className="text-white font-semibold">🚀 Dolazi uskoro - ostanite s nama!</p>
        </div>
      </div>
    </div>
  );
}