// app/instructor/kandidati/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../../components/Sidebar2";

export default function KandidatiInstruktor() {
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState("kandidati");
  const [isLoading, setIsLoading] = useState(true);
  const [candidates, setCandidates] = useState([]);
  const [termini, setTermini] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [hoveredCard, setHoveredCard] = useState(null);
  const router = useRouter();

  // Mock podaci za kandidate trenutnog instruktora
  const mockCandidates = [
    {
      _id: '32eade9esd1421454f0b85fe3',
      name: 'Ana',
      surname: 'Anić',
      email: 'ana.anic@example.com',
      jmbg: '0101990123456',
      role: 'candidate',
      status: {
        teorijaPrvaPomoc: true,
        voznja: {
          brojVoznji: 8,
          ocjene: ['5', '5', '4'],
          zavrsnaVoznja: true
        },
        polozio: {
          teoriju: true,
          prvuPomoc: true,
          voznju: false
        },
        bedzevi: ['prva_pomoc', 'teorija']
      },
      instructor: {
        _id: '68ddb01cebb9729427e99c14',
        name: 'Amir',
        surname: 'Hodžić',
        email: 'amir.hodzic@test.com'
      },
      drivingSessions: [],
      recommendations: [],
      documents: {},
      createdAt: '2025-09-22T08:00:00.000Z',
      updatedAt: '2025-11-18T14:20:00.000Z'
    },
    {
      _id: '689dfedcf654f324dfsae33',
      name: 'Lejla',
      surname: 'Karić',
      email: 'lejla.karic@example.com',
      jmbg: '0101998123456',
      role: 'candidate',
      status: {
        teorijaPrvaPomoc: true,
        voznja: {
          brojVoznji: 35,
          ocjene: ['5', '5', '5', '4'],
          zavrsnaVoznja: true
        },
        polozio: {
          teoriju: true,
          prvuPomoc: true,
          voznju: true
        },
        bedzevi: ['prva_pomoc', 'teorija', 'voznja']
      },
      instructor: {
        _id: '68ddb01cebb9729427e99c14',
        name: 'Amir',
        surname: 'Hodžić',
        email: 'amir.hodzic@test.com'
      },
      drivingSessions: [],
      recommendations: [],
      documents: {},
      createdAt: '2023-08-15T08:00:00.000Z',
      updatedAt: '2023-11-28T16:45:00.000Z'
    }
  ];

  // Mock termini za kandidate
  const mockTermini = {
    '68eade989edcf654f0b85fe3': [
      { _id: '1', datum: '2024-01-15', vrijeme: '14:00', trajanje: 2 },
      { _id: '2', datum: '2024-01-17', vrijeme: '10:00', trajanje: 2 }
    ],
    '32eade9esd1421454f0b85fe3': [
      { _id: '3', datum: '2024-01-16', vrijeme: '09:00', trajanje: 2 },
      { _id: '4', datum: '2024-01-18', vrijeme: '16:00', trajanje: 2 },
      { _id: '5', datum: '2024-01-20', vrijeme: '11:00', trajanje: 2 }
    ]
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const userData = localStorage.getItem("user");

    if (!token || role !== "instructor") {
      router.push("/");
      return;
    }

    // Simuliramo učitavanje
    setTimeout(() => {
      setUser(JSON.parse(userData));
      setIsLoading(false);
      fetchMyCandidates();
    }, 1000);
  }, [router]);

  const fetchMyCandidates = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Dohvaćam moje kandidate...');
      
      // Koristi novu rutu za instruktore
      const response = await fetch('http://localhost:5000/api/users/my-candidates', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const myCandidates = await response.json();
        console.log('Moji kandidati s API-ja:', myCandidates);
        
        // Kombiniraj API kandidate sa mock kandidatima
        const allCandidates = [...myCandidates, ...mockCandidates];
        console.log('Svi moji kandidati:', allCandidates);
        
        setCandidates(allCandidates);
        
        // Učitaj termine za svakog kandidata
        allCandidates.forEach(candidate => {
          fetchTermini(candidate._id);
        });
      } else {
        throw new Error('API nije dostupan');
      }
    } catch (error) {
      console.error('Error fetching my candidates:', error);
      // Fallback na mock podatke
      setCandidates(mockCandidates);
      
      // Koristi mock termine
      setTermini(mockTermini);
    }
  };

  const fetchTermini = async (candidateId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/driving/kandidat/${candidateId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const candidateTermini = await response.json();
        setTermini(prev => ({
          ...prev,
          [candidateId]: candidateTermini
        }));
      } else {
        // Fallback na mock termine ako API ne radi
        setTermini(prev => ({
          ...prev,
          [candidateId]: mockTermini[candidateId] || []
        }));
      }
    } catch (error) {
      console.error(`Error fetching termini for candidate ${candidateId}:`, error);
      // Fallback na mock termine
      setTermini(prev => ({
        ...prev,
        [candidateId]: mockTermini[candidateId] || []
      }));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    router.push("/");
  };

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
  };

  const handleOpenDetails = (candidate) => {
    setSelectedCandidate(candidate);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCandidate(null);
  };

  const handleUpdateStatus = async (candidateId, field, value) => {
    try {
      const token = localStorage.getItem('token');
      
      const updateData = {};
      if (field === 'teoriju') updateData.teorija = value;
      if (field === 'prvuPomoc') updateData.prvaPomoc = value;
      if (field === 'voznju') updateData.voznja = value;

      const response = await fetch(`http://localhost:5000/api/users/${candidateId}/update-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        const updatedCandidates = candidates.map(candidate => {
          if (candidate._id === candidateId) {
            return {
              ...candidate,
              status: {
                ...candidate.status,
                polozio: {
                  ...candidate.status.polozio,
                  [field]: value
                }
              }
            };
          }
          return candidate;
        });

        setCandidates(updatedCandidates);
        setSnackbar({
          open: true,
          message: 'Status uspješno ažuriran',
          severity: 'success'
        });
      } else {
        throw new Error('Greška pri ažuriranju');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      // Fallback na lokalno ažuriranje
      const updatedCandidates = candidates.map(candidate => {
        if (candidate._id === candidateId) {
          return {
            ...candidate,
            status: {
              ...candidate.status,
              polozio: {
                ...candidate.status.polozio,
                [field]: value
              }
            }
          };
        }
        return candidate;
      });

      setCandidates(updatedCandidates);
      setSnackbar({
        open: true,
        message: 'Status uspješno ažuriran (offline)',
        severity: 'success'
      });
    }
  };

  const handleAddOcjena = async (candidateId, ocjena) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/users/${candidateId}/add-ocjena`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ocjena })
      });

      if (response.ok) {
        const updatedCandidates = candidates.map(candidate => {
          if (candidate._id === candidateId) {
            const newOcjene = [...(candidate.status?.voznja?.ocjene || []), ocjena];
            return {
              ...candidate,
              status: {
                ...candidate.status,
                voznja: {
                  ...candidate.status.voznja,
                  brojVoznji: (candidate.status?.voznja?.brojVoznji || 0) + 1,
                  ocjene: newOcjene
                }
              }
            };
          }
          return candidate;
        });

        setCandidates(updatedCandidates);
        setSnackbar({
          open: true,
          message: `Ocjena ${ocjena} uspješno dodana`,
          severity: 'success'
        });
      } else {
        throw new Error('Greška pri dodavanju ocjene');
      }
    } catch (error) {
      console.error('Error adding ocjena:', error);
      // Fallback na lokalno ažuriranje
      const updatedCandidates = candidates.map(candidate => {
        if (candidate._id === candidateId) {
          const newOcjene = [...(candidate.status?.voznja?.ocjene || []), ocjena];
          return {
            ...candidate,
            status: {
              ...candidate.status,
              voznja: {
                ...candidate.status.voznja,
                brojVoznji: (candidate.status?.voznja?.brojVoznji || 0) + 1,
                ocjene: newOcjene
              }
            }
          };
        }
        return candidate;
      });

      setCandidates(updatedCandidates);
      setSnackbar({
        open: true,
        message: `Ocjena ${ocjena} uspješno dodana (offline)`,
        severity: 'success'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('bs-BA');
  };

  const getVoznjeCount = (candidate) => {
    return candidate.status?.voznja?.brojVoznji || 
           candidate.drivingSessions?.length || 
           0;
  };

  const getProsjekOcjena = (candidate) => {
    const ocjene = candidate.status?.voznja?.ocjene || [];
    if (ocjene.length === 0) return 0;
    const sum = ocjene.reduce((acc, ocjena) => acc + parseInt(ocjena), 0);
    return (sum / ocjene.length).toFixed(1);
  };

  // Helper funkcije za formatiranje bedževa
  const formatBedzevi = (candidate) => {
    const bedzevi = candidate.status?.bedzevi || [];
    const polozio = candidate.status?.polozio || {};
    const formattedBedzevi = [];
    
    // Dodaj bedževe na osnovu polaganja
    if (polozio.teoriju) formattedBedzevi.push('Teorija');
    if (polozio.prvuPomoc) formattedBedzevi.push('Prva pomoć');
    if (polozio.voznju) formattedBedzevi.push('Vožnja');
    
    return formattedBedzevi;
  };

  const getPolozioStatus = (candidate) => {
    const polozio = candidate.status?.polozio || {};
    const status = [];
    
    if (polozio.teoriju) status.push('Teoriju');
    if (polozio.prvuPomoc) status.push('Prvu pomoć');
    if (polozio.voznju) status.push('Vožnju');
    
    return status.length > 0 ? status.join(', ') : 'Ništa';
  };

  // Helper funkcije za siguran pristup podacima
  const getInitials = (name, surname) => {
    if (!name || !surname) return '??';
    return `${name[0] || ''}${surname[0] || ''}`;
  };

  const getTerminiCount = (candidateId) => {
    return termini[candidateId]?.length || 0;
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
              <span className="text-4xl animate-pulse-slow">👥</span>
            </div>
          </div>

          {/* Animated Text */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-white bg-gradient-to-r from-[#3D9DF6] via-[#27AE60] to-[#6C63FF] bg-clip-text text-transparent animate-gradient-text">
              Učitavanje kandidata
            </h1>
            <div className="h-8 flex items-center justify-center">
              <p className="text-[#B0B3C1] text-lg font-light animate-typing overflow-hidden whitespace-nowrap border-r-4 border-r-[#3D9DF6] w-0 mx-auto">
                Pripremam listu vaših kandidata...
              </p>
            </div>
          </div>

          {/* Loading Bar */}
          <div className="mt-8 w-64 mx-auto">
            <div className="w-full bg-[#232634] rounded-full h-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#3D9DF6] to-[#27AE60] rounded-full animate-loading-bar"></div>
            </div>
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
        role="instructor"
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-gradient-to-r from-[#1A1C25] to-[#232634]/80 backdrop-blur-xl border-b border-[#2A2D3A] p-8 shadow-2xl shadow-[#3D9DF6]/5 animate-slideDown">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white bg-gradient-to-r from-white via-[#E2E8FF] to-[#B0B3C1] bg-clip-text text-transparent">
                Moji kandidati
              </h1>
              <p className="text-[#B0B3C1] mt-3 text-lg font-light">
                Upravljajte napretkom i ocjenama vaših kandidata
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="bg-[#232634]/60 backdrop-blur-lg px-6 py-3 rounded-2xl text-[#B0B3C1] border border-[#2A2D3A] shadow-2xl shadow-black/30 hover:shadow-[#3D9DF6]/20 hover:border-[#3D9DF6]/40 transition-all duration-500 group hover:scale-105">
                <span className="flex items-center space-x-3">
                  <span className="text-xl">📅</span>
                  <span className="font-medium">{new Date().toLocaleDateString('bs-BA')}</span>
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-auto">
          <div className="space-y-8 animate-fadeIn">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                title="Moji kandidati" 
                value={candidates.length.toString()} 
                trend={`+${Math.floor(candidates.length * 0.12)}%`}
                icon="👥"
                color="from-[#3D9DF6] to-[#56CCF2]"
                trendColor="text-[#27AE60]"
                description="Aktivni kandidati"
                index={0}
                hoveredCard={hoveredCard}
                onHover={setHoveredCard}
              />
              <StatCard 
                title="Prosjek ocjena" 
                value={candidates.length > 0 ? 
                  (candidates.reduce((acc, c) => acc + parseFloat(getProsjekOcjena(c)), 0) / candidates.length).toFixed(1) : '0.0'} 
                trend="Ukupni prosjek"
                icon="⭐"
                color="from-[#FF6B35] to-[#FF9D6C]"
                trendColor="text-[#B0B3C1]"
                description="Prosječna ocjena vožnje"
                index={1}
                hoveredCard={hoveredCard}
                onHover={setHoveredCard}
              />
              <StatCard 
                title="Položeno teoriju" 
                value={candidates.filter(c => c.status?.polozio?.teoriju).length.toString()} 
                trend={`${Math.round((candidates.filter(c => c.status?.polozio?.teoriju).length / candidates.length) * 100) || 0}%`}
                icon="📚"
                color="from-[#27AE60] to-[#6FCF97]"
                trendColor="text-[#27AE60]"
                description="Uspešno položeni testovi"
                index={2}
                hoveredCard={hoveredCard}
                onHover={setHoveredCard}
              />
              <StatCard 
                title="Ukupno termina" 
                value={Object.values(termini).flat().length.toString()} 
                trend="Zakazano"
                icon="📅"
                color="from-[#6C63FF] to-[#FF4DA6]"
                trendColor="text-[#B0B3C1]"
                description="Svi zakazani termini"
                index={3}
                hoveredCard={hoveredCard}
                onHover={setHoveredCard}
              />
            </div>

            {/* Candidates Table */}
            <div className="bg-gradient-to-br from-[#1A1C25] to-[#232634] rounded-2xl border border-[#2A2D3A] shadow-2xl shadow-black/20 hover:shadow-[#3D9DF6]/10 transition-all duration-500 animate-slideUp">
              <div className="p-6 border-b border-[#2A2D3A]">
                <h3 className="text-xl font-semibold text-white flex items-center space-x-3">
                  <span className="text-2xl animate-pulse">📋</span>
                  <span>Lista mojih kandidata ({candidates.length})</span>
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2A2D3A]">
                      <th className="text-left p-6 text-[#B0B3C1] font-semibold">Kandidat</th>
                      <th className="text-left p-6 text-[#B0B3C1] font-semibold">Kontakt</th>
                      <th className="text-left p-6 text-[#B0B3C1] font-semibold">Status</th>
                      <th className="text-left p-6 text-[#B0B3C1] font-semibold">Vožnje & Ocjene</th>
                      <th className="text-left p-6 text-[#B0B3C1] font-semibold">Termini</th>
                      <th className="text-left p-6 text-[#B0B3C1] font-semibold">Datum upisa</th>
                      <th className="text-left p-6 text-[#B0B3C1] font-semibold">Akcije</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.map((candidate, index) => {
                      const formattedBedzevi = formatBedzevi(candidate);
                      const polozioStatus = getPolozioStatus(candidate);
                      const brojTermina = getTerminiCount(candidate._id);
                      
                      return (
                      <tr 
                        key={candidate._id} 
                        className="border-b border-[#2A2D3A] hover:bg-[#232634]/50 transition-all duration-300 animate-fadeIn"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <td className="p-6">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#3D9DF6] to-[#27AE60] rounded-2xl flex items-center justify-center text-white font-semibold text-lg">
                              {getInitials(candidate.name, candidate.surname)}
                            </div>
                            <div>
                              <p className="text-white font-semibold">
                                {candidate.name || 'N/A'} {candidate.surname || 'N/A'}
                              </p>
                              <p className="text-[#7A7F96] text-sm">
                                ID: {candidate._id}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                          <p className="text-white">{candidate.email || 'N/A'}</p>
                          <p className="text-[#7A7F96] text-sm">JMBG: {candidate.jmbg || 'N/A'}</p>
                        </td>
                        <td className="p-6">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <StatusBadge 
                                status={candidate.status?.polozio?.teoriju} 
                                label="T"
                                onClick={() => handleUpdateStatus(candidate._id, 'teoriju', !candidate.status?.polozio?.teoriju)}
                              />
                              <StatusBadge 
                                status={candidate.status?.polozio?.prvuPomoc} 
                                label="PP"
                                onClick={() => handleUpdateStatus(candidate._id, 'prvuPomoc', !candidate.status?.polozio?.prvuPomoc)}
                              />
                              <StatusBadge 
                                status={candidate.status?.polozio?.voznju} 
                                label="V"
                                onClick={() => handleUpdateStatus(candidate._id, 'voznju', !candidate.status?.polozio?.voznju)}
                              />
                            </div>
                            <p className="text-[#7A7F96] text-sm">
                              <strong>Položio:</strong> {polozioStatus}
                            </p>
                            {formattedBedzevi.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {formattedBedzevi.map((bedz, index) => (
                                  <span key={index} className="px-2 py-1 bg-gradient-to-r from-[#3D9DF6] to-[#27AE60] text-white text-xs rounded-full">
                                    {bedz}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-3">
                              <span className="text-[#B0B3C1] text-sm">Broj vožnji:</span>
                              <span className="text-white font-semibold">{getVoznjeCount(candidate)}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="text-[#B0B3C1] text-sm">Prosjek:</span>
                              <span className="text-white font-semibold">{getProsjekOcjena(candidate)}</span>
                            </div>
                            {candidate.status?.voznja?.ocjene && candidate.status.voznja.ocjene.length > 0 && (
                              <div className="flex items-center space-x-1">
                                {candidate.status.voznja.ocjene.slice(-3).map((ocjena, idx) => (
                                  <span key={idx} className="w-6 h-6 bg-gradient-to-br from-[#3D9DF6] to-[#27AE60] rounded-full flex items-center justify-center text-white text-xs font-bold">
                                    {ocjena}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="text-center">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#FF6B35] to-[#FF9D6C] rounded-xl flex items-center justify-center text-white font-semibold mx-auto mb-2">
                              {brojTermina}
                            </div>
                            <p className="text-[#B0B3C1] text-sm">Termina</p>
                          </div>
                        </td>
                        <td className="p-6">
                          <p className="text-white">{formatDate(candidate.createdAt)}</p>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleOpenDetails(candidate)}
                              className="w-10 h-10 bg-gradient-to-br from-[#3D9DF6] to-[#56CCF2] rounded-xl flex items-center justify-center text-white hover:scale-110 transition-transform duration-300 shadow-lg shadow-[#3D9DF6]/30"
                              title="Detalji kandidata"
                            >
                              👁️
                            </button>
                            <div className="relative group">
                              <button className="w-10 h-10 bg-gradient-to-br from-[#27AE60] to-[#6FCF97] rounded-xl flex items-center justify-center text-white hover:scale-110 transition-transform duration-300 shadow-lg shadow-[#27AE60]/30"
                                title="Dodaj ocjenu">
                                ⭐
                              </button>
                              <div className="absolute right-0 top-12 bg-[#1A1C25] border border-[#2A2D3A] rounded-xl p-2 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10">
                                <div className="grid grid-cols-3 gap-1">
                                  {[1, 2, 3, 4, 5].map(ocjena => (
                                    <button
                                      key={ocjena}
                                      onClick={() => handleAddOcjena(candidate._id, ocjena.toString())}
                                      className="w-8 h-8 bg-gradient-to-br from-[#3D9DF6] to-[#27AE60] rounded-lg flex items-center justify-center text-white text-sm font-bold hover:scale-110 transition-transform duration-200"
                                    >
                                      {ocjena}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Dijalog za detalje kandidata */}
      {openDialog && selectedCandidate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-gradient-to-br from-[#1A1C25] to-[#232634] rounded-2xl border border-[#2A2D3A] p-8 shadow-2xl shadow-black/40 max-w-2xl w-full mx-4 animate-popIn">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
              <span className="text-2xl">👤</span>
              <span>Detalji kandidata</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div>
                  <label className="text-[#B0B3C1] text-sm">Ime i prezime</label>
                  <p className="text-white font-medium text-lg">{selectedCandidate.name} {selectedCandidate.surname}</p>
                </div>
                <div>
                  <label className="text-[#B0B3C1] text-sm">Email</label>
                  <p className="text-white font-medium">{selectedCandidate.email}</p>
                </div>
                <div>
                  <label className="text-[#B0B3C1] text-sm">JMBG</label>
                  <p className="text-white font-medium">{selectedCandidate.jmbg}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[#B0B3C1] text-sm">Datum upisa</label>
                  <p className="text-white font-medium">{formatDate(selectedCandidate.createdAt)}</p>
                </div>
                <div>
                  <label className="text-[#B0B3C1] text-sm">Broj vožnji</label>
                  <p className="text-white font-medium">{getVoznjeCount(selectedCandidate)}</p>
                </div>
                <div>
                  <label className="text-[#B0B3C1] text-sm">Prosjek ocjena</label>
                  <p className="text-white font-medium">{getProsjekOcjena(selectedCandidate)}</p>
                </div>
              </div>
            </div>

            {/* Status polaganja */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Status polaganja</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className={`p-4 rounded-xl text-center ${
                  selectedCandidate.status?.polozio?.teoriju 
                    ? 'bg-gradient-to-r from-[#27AE60] to-[#6FCF97] text-white' 
                    : 'bg-[#232634] border border-[#2A2D3A] text-[#7A7F96]'
                }`}>
                  <div className="text-2xl font-bold">T</div>
                  <div className="text-sm">Teorija</div>
                  <div className="text-xs mt-1">{selectedCandidate.status?.polozio?.teoriju ? 'Položeno' : 'Nije položeno'}</div>
                </div>
                <div className={`p-4 rounded-xl text-center ${
                  selectedCandidate.status?.polozio?.prvuPomoc 
                    ? 'bg-gradient-to-r from-[#27AE60] to-[#6FCF97] text-white' 
                    : 'bg-[#232634] border border-[#2A2D3A] text-[#7A7F96]'
                }`}>
                  <div className="text-2xl font-bold">PP</div>
                  <div className="text-sm">Prva pomoć</div>
                  <div className="text-xs mt-1">{selectedCandidate.status?.polozio?.prvuPomoc ? 'Položeno' : 'Nije položeno'}</div>
                </div>
                <div className={`p-4 rounded-xl text-center ${
                  selectedCandidate.status?.polozio?.voznju 
                    ? 'bg-gradient-to-r from-[#27AE60] to-[#6FCF97] text-white' 
                    : 'bg-[#232634] border border-[#2A2D3A] text-[#7A7F96]'
                }`}>
                  <div className="text-2xl font-bold">V</div>
                  <div className="text-sm">Vožnja</div>
                  <div className="text-xs mt-1">{selectedCandidate.status?.polozio?.voznju ? 'Položeno' : 'Nije položeno'}</div>
                </div>
              </div>
            </div>

            {/* Historija ocjena */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Historija ocjena</h3>
              <div className="flex flex-wrap gap-2">
                {selectedCandidate.status?.voznja?.ocjene && selectedCandidate.status.voznja.ocjene.length > 0 ? (
                  selectedCandidate.status.voznja.ocjene.map((ocjena, index) => (
                    <div key={index} className="w-10 h-10 bg-gradient-to-br from-[#3D9DF6] to-[#27AE60] rounded-xl flex items-center justify-center text-white font-bold">
                      {ocjena}
                    </div>
                  ))
                ) : (
                  <p className="text-[#7A7F96]">Nema ocjena</p>
                )}
              </div>
            </div>

            {/* Postignuća */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Postignuća</h3>
              <div className="flex flex-wrap gap-2">
                {formatBedzevi(selectedCandidate).length > 0 ? (
                  formatBedzevi(selectedCandidate).map((bedz, index) => (
                    <span key={index} className="px-3 py-1 bg-gradient-to-r from-[#3D9DF6] to-[#27AE60] text-white text-sm rounded-full">
                      {bedz}
                    </span>
                  ))
                ) : (
                  <p className="text-[#7A7F96]">Nema postignuća</p>
                )}
              </div>
            </div>
            
            <div className="flex space-x-4 mt-8">
              <button
                onClick={handleCloseDialog}
                className="flex-1 bg-[#232634] border border-[#2A2D3A] text-white py-3 rounded-xl hover:border-[#7A7F96] transition-colors duration-300"
              >
                Zatvori
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar za obavijesti */}
      {snackbar.open && (
        <div className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 px-6 py-4 rounded-2xl shadow-2xl border z-50 animate-slideUp ${
          snackbar.severity === 'success' 
            ? 'bg-gradient-to-r from-[#27AE60] to-[#6FCF97] border-[#27AE60]/50 text-white' 
            : 'bg-gradient-to-r from-[#FF6B35] to-[#FF9D6C] border-[#FF6B35]/50 text-white'
        }`}>
          <div className="flex items-center space-x-3">
            <span className="text-xl">{snackbar.severity === 'success' ? '✅' : '⚠️'}</span>
            <span className="font-semibold">{snackbar.message}</span>
            <button 
              onClick={handleCloseSnackbar}
              className="ml-4 hover:scale-110 transition-transform duration-300"
            >
              ✕
            </button>
          </div>
        </div>
      )}
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

// StatusBadge Component
function StatusBadge({ status, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 hover:scale-110 ${
        status 
          ? 'bg-gradient-to-br from-[#27AE60] to-[#6FCF97] text-white shadow-lg shadow-[#27AE60]/30' 
          : 'bg-[#232634] border border-[#2A2D3A] text-[#7A7F96] hover:border-[#3D9DF6]'
      }`}
    >
      {label}
    </button>
  );
}