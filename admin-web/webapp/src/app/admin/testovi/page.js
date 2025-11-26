"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../../components/Sidebar";
import GlobalStats from "./components/GlobalStats";
import CandidatesList from "./components/CandidatesList";
import CandidateStats from "./components/CandidateStats";
import TestResults from "./components/TestResults";
import ResultsModal from "./components/ResultsModal";
import LoadingScreen from "./components/LoadingScreen";

export default function TestoviAdmin() {
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState("testovi");
  const [isLoading, setIsLoading] = useState(true);
  const [candidates, setCandidates] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedTestType, setSelectedTestType] = useState("svi");
  const [detailedResults, setDetailedResults] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [hoveredCard, setHoveredCard] = useState(null);
  const router = useRouter();

  // Mock podaci za dodatne kandidate
  const mockCandidates = [
    {
      _id: 'mock_amina_husic',
      name: 'Amina',
      surname: 'Husić',
      email: 'amina.husic@example.com',
      jmbg: '1502995123456',
      role: 'candidate',
      status: {
        teorijaPrvaPomoc: true,
        polozio: {
          teoriju: true,
          prvuPomoc: true,
          voznju: false
        }
      },
      instruktor: {
        _id: '68ddb01cebb9729427e99c14',
        name: 'Amir',
        surname: 'Hodžić'
      },
      createdAt: '2023-10-15T08:00:00.000Z'
    },
    {
      _id: 'mock_dario_mandic',
      name: 'Dario',
      surname: 'Madić',
      email: 'dario.madic@example.com',
      jmbg: '2001993123456',
      role: 'candidate',
      status: {
        teorijaPrvaPomoc: true,
        polozio: {
          teoriju: true,
          prvuPomoc: false,
          voznju: true
        }
      },
      instruktor: null,
      createdAt: '2023-11-05T08:00:00.000Z'
    },
    {
      _id: 'mock_selma_karahodzic',
      name: 'Selma',
      surname: 'Karahodžić',
      email: 'selma.karahodzic@example.com',
      jmbg: '0804996123456',
      role: 'candidate',
      status: {
        teorijaPrvaPomoc: false,
        polozio: {
          teoriju: false,
          prvuPomoc: false,
          voznju: false
        }
      },
      instruktor: {
        _id: '68ddb01cebb9729427e99c14',
        name: 'Amir',
        surname: 'Hodžić'
      },
      createdAt: '2023-12-01T08:00:00.000Z'
    },
    {
      _id: 'mock_nermin_selimovic',
      name: 'Nermin',
      surname: 'Selimović',
      email: 'nermin.selimovic@example.com',
      jmbg: '1208991123456',
      role: 'candidate',
      status: {
        teorijaPrvaPomoc: true,
        polozio: {
          teoriju: true,
          prvuPomoc: true,
          voznju: true
        }
      },
      instruktor: null,
      createdAt: '2023-09-10T08:00:00.000Z'
    }
  ];

  // Mock test rezultati za dodatne kandidate
  const mockTestResults = [
    // Amina Husić - PUNO TESTOVA
    {
      _id: 'mock_amina_znak_1',
      user: 'mock_amina_husic',
      tip: "znak",
      subTip: "kombinovani",
      attemptNumber: 1,
      correctCount: 18,
      total: 20,
      score: 90,
      passed: true,
      vrijeme: 1320,
      createdAt: '2025-09-15T10:30:00.000Z'
    },
    {
      _id: 'mock_amina_znak_2',
      user: 'mock_amina_husic',
      tip: "znak",
      subTip: "kombinovani",
      attemptNumber: 2,
      correctCount: 19,
      total: 20,
      score: 95,
      passed: true,
      vrijeme: 1250,
      createdAt: '2025-09-20T14:20:00.000Z'
    },
    {
      _id: 'mock_amina_teorija_1',
      user: 'mock_amina_husic',
      tip: "teorija",
      subTip: "kombinovani",
      attemptNumber: 1,
      correctCount: 28,
      total: 30,
      score: 93.3,
      passed: true,
      vrijeme: 1680,
      createdAt: '2025-09-10T09:15:00.000Z'
    },
    {
      _id: 'mock_amina_teorija_2',
      user: 'mock_amina_husic',
      tip: "teorija",
      subTip: "lekcijski",
      attemptNumber: 1,
      correctCount: 14,
      total: 15,
      score: 93.3,
      passed: true,
      vrijeme: 920,
      createdAt: '2025-09-05T16:45:00.000Z'
    },
    {
      _id: 'mock_amina_prva_pomoc_1',
      user: 'mock_amina_husic',
      tip: "prva_pomoc",
      subTip: "kombinovani",
      attemptNumber: 1,
      correctCount: 22,
      total: 25,
      score: 88,
      passed: true,
      vrijeme: 1420,
      createdAt: '2025-09-08T11:30:00.000Z'
    },
    {
      _id: 'mock_amina_prva_pomoc_2',
      user: 'mock_amina_husic',
      tip: "prva_pomoc",
      subTip: "lekcijski",
      attemptNumber: 1,
      correctCount: 9,
      total: 10,
      score: 90,
      passed: true,
      vrijeme: 850,
      createdAt: '2025-09-03T13:20:00.000Z'
    },
    {
      _id: 'mock_amina_raskrsnice_1',
      user: 'mock_amina_husic',
      tip: "raskrsnice",
      subTip: "kombinovani",
      attemptNumber: 1,
      correctCount: 23,
      total: 25,
      score: 92,
      passed: true,
      vrijeme: 1580,
      createdAt: '2025-09-12T15:30:00.000Z'
    },
    {
      _id: 'mock_amina_raskrsnice_2',
      user: 'mock_amina_husic',
      tip: "raskrsnice",
      subTip: "zavrsni",
      attemptNumber: 1,
      correctCount: 20,
      total: 22,
      score: 90.9,
      passed: true,
      vrijeme: 1340,
      createdAt: '2025-09-18T10:15:00.000Z'
    },

    // Dario Madić - PUNO TESTOVA
    {
      _id: 'mock_dario_teorija_1',
      user: 'mock_dario_mandic',
      tip: "teorija",
      subTip: "kombinovani",
      attemptNumber: 1,
      correctCount: 25,
      total: 30,
      score: 83.3,
      passed: true,
      vrijeme: 1720,
      createdAt: '2025-10-05T09:30:00.000Z'
    },
    {
      _id: 'mock_dario_teorija_2',
      user: 'mock_dario_mandic',
      tip: "teorija",
      subTip: "kombinovani",
      attemptNumber: 2,
      correctCount: 27,
      total: 30,
      score: 90,
      passed: true,
      vrijeme: 1650,
      createdAt: '2025-10-08T14:20:00.000Z'
    },
    {
      _id: 'mock_dario_znak_1',
      user: 'mock_dario_mandic',
      tip: "znak",
      subTip: "kombinovani",
      attemptNumber: 1,
      correctCount: 17,
      total: 20,
      score: 85,
      passed: true,
      vrijeme: 1380,
      createdAt: '2025-10-03T11:45:00.000Z'
    },
    {
      _id: 'mock_dario_znak_2',
      user: 'mock_dario_mandic',
      tip: "znak",
      subTip: "lekcijski",
      attemptNumber: 1,
      correctCount: 8,
      total: 10,
      score: 80,
      passed: true,
      vrijeme: 780,
      createdAt: '2025-10-01T16:30:00.000Z'
    },
    {
      _id: 'mock_dario_prva_pomoc_1',
      user: 'mock_dario_mandic',
      tip: "prva_pomoc",
      subTip: "kombinovani",
      attemptNumber: 1,
      correctCount: 18,
      total: 25,
      score: 72,
      passed: false,
      vrijeme: 1520,
      createdAt: '2025-10-10T10:15:00.000Z'
    },
    {
      _id: 'mock_dario_prva_pomoc_2',
      user: 'mock_dario_mandic',
      tip: "prva_pomoc",
      subTip: "kombinovani",
      attemptNumber: 2,
      correctCount: 21,
      total: 25,
      score: 84,
      passed: true,
      vrijeme: 1480,
      createdAt: '2025-10-12T13:40:00.000Z'
    },
    {
      _id: 'mock_dario_raskrsnice_1',
      user: 'mock_dario_mandic',
      tip: "raskrsnice",
      subTip: "kombinovani",
      attemptNumber: 1,
      correctCount: 19,
      total: 25,
      score: 76,
      passed: false,
      vrijeme: 1620,
      createdAt: '2025-10-07T15:20:00.000Z'
    },
    {
      _id: 'mock_dario_raskrsnice_2',
      user: 'mock_dario_mandic',
      tip: "raskrsnice",
      subTip: "kombinovani",
      attemptNumber: 2,
      correctCount: 22,
      total: 25,
      score: 88,
      passed: true,
      vrijeme: 1550,
      createdAt: '2025-10-09T11:10:00.000Z'
    },

    // Selma Karahodžić - PUNO TESTOVA
    {
      _id: 'mock_selma_teorija_1',
      user: 'mock_selma_karahodzic',
      tip: "teorija",
      subTip: "kombinovani",
      attemptNumber: 1,
      correctCount: 22,
      total: 30,
      score: 73.3,
      passed: false,
      vrijeme: 1780,
      createdAt: '2025-11-05T09:45:00.000Z'
    },
    {
      _id: 'mock_selma_teorija_2',
      user: 'mock_selma_karahodzic',
      tip: "teorija",
      subTip: "kombinovani",
      attemptNumber: 2,
      correctCount: 24,
      total: 30,
      score: 80,
      passed: true,
      vrijeme: 1720,
      createdAt: '2025-11-08T14:30:00.000Z'
    },
    {
      _id: 'mock_selma_znak_1',
      user: 'mock_selma_karahodzic',
      tip: "znak",
      subTip: "kombinovani",
      attemptNumber: 1,
      correctCount: 15,
      total: 20,
      score: 75,
      passed: false,
      vrijeme: 1420,
      createdAt: '2025-11-03T11:20:00.000Z'
    },
    {
      _id: 'mock_selma_znak_2',
      user: 'mock_selma_karahodzic',
      tip: "znak",
      subTip: "kombinovani",
      attemptNumber: 2,
      correctCount: 16,
      total: 20,
      score: 80,
      passed: true,
      vrijeme: 1380,
      createdAt: '2025-11-06T16:15:00.000Z'
    },
    {
      _id: 'mock_selma_znak_3',
      user: 'mock_selma_karahodzic',
      tip: "znak",
      subTip: "lekcijski",
      attemptNumber: 1,
      correctCount: 7,
      total: 10,
      score: 70,
      passed: false,
      vrijeme: 820,
      createdAt: '2025-11-02T13:40:00.000Z'
    },
    {
      _id: 'mock_selma_prva_pomoc_1',
      user: 'mock_selma_karahodzic',
      tip: "prva_pomoc",
      subTip: "kombinovani",
      attemptNumber: 1,
      correctCount: 17,
      total: 25,
      score: 68,
      passed: false,
      vrijeme: 1580,
      createdAt: '2025-11-10T10:30:00.000Z'
    },
    {
      _id: 'mock_selma_raskrsnice_1',
      user: 'mock_selma_karahodzic',
      tip: "raskrsnice",
      subTip: "kombinovani",
      attemptNumber: 1,
      correctCount: 18,
      total: 25,
      score: 72,
      passed: false,
      vrijeme: 1680,
      createdAt: '2025-11-07T15:45:00.000Z'
    },

    // Nermin Selimović - PUNO TESTOVA (najbolji)
    {
      _id: 'mock_nermin_teorija_1',
      user: 'mock_nermin_selimovic',
      tip: "teorija",
      subTip: "kombinovani",
      attemptNumber: 1,
      correctCount: 29,
      total: 30,
      score: 96.7,
      passed: true,
      vrijeme: 1620,
      createdAt: '2025-08-20T09:15:00.000Z'
    },
    {
      _id: 'mock_nermin_teorija_2',
      user: 'mock_nermin_selimovic',
      tip: "teorija",
      subTip: "zavrsni",
      attemptNumber: 1,
      correctCount: 28,
      total: 30,
      score: 93.3,
      passed: true,
      vrijeme: 1580,
      createdAt: '2025-08-25T14:40:00.000Z'
    },
    {
      _id: 'mock_nermin_znak_1',
      user: 'mock_nermin_selimovic',
      tip: "znak",
      subTip: "kombinovani",
      attemptNumber: 1,
      correctCount: 20,
      total: 20,
      score: 100,
      passed: true,
      vrijeme: 1250,
      createdAt: '2025-08-18T11:20:00.000Z'
    },
    {
      _id: 'mock_nermin_znak_2',
      user: 'mock_nermin_selimovic',
      tip: "znak",
      subTip: "kombinovani",
      attemptNumber: 2,
      correctCount: 19,
      total: 20,
      score: 95,
      passed: true,
      vrijeme: 1220,
      createdAt: '2025-08-22T16:30:00.000Z'
    },
    {
      _id: 'mock_nermin_prva_pomoc_1',
      user: 'mock_nermin_selimovic',
      tip: "prva_pomoc",
      subTip: "kombinovani",
      attemptNumber: 1,
      correctCount: 24,
      total: 25,
      score: 96,
      passed: true,
      vrijeme: 1420,
      createdAt: '2025-08-15T10:45:00.000Z'
    },
    {
      _id: 'mock_nermin_prva_pomoc_2',
      user: 'mock_nermin_selimovic',
      tip: "prva_pomoc",
      subTip: "zavrsni",
      attemptNumber: 1,
      correctCount: 23,
      total: 25,
      score: 92,
      passed: true,
      vrijeme: 1380,
      createdAt: '2025-08-28T13:15:00.000Z'
    },
    {
      _id: 'mock_nermin_raskrsnice_1',
      user: 'mock_nermin_selimovic',
      tip: "raskrsnice",
      subTip: "kombinovani",
      attemptNumber: 1,
      correctCount: 24,
      total: 25,
      score: 96,
      passed: true,
      vrijeme: 1520,
      createdAt: '2025-08-17T15:20:00.000Z'
    },
    {
      _id: 'mock_nermin_raskrsnice_2',
      user: 'mock_nermin_selimovic',
      tip: "raskrsnice",
      subTip: "zavrsni",
      attemptNumber: 1,
      correctCount: 23,
      total: 25,
      score: 92,
      passed: true,
      vrijeme: 1480,
      createdAt: '2025-08-30T11:50:00.000Z'
    },
    {
      _id: 'mock_nermin_raskrsnice_3',
      user: 'mock_nermin_selimovic',
      tip: "raskrsnice",
      subTip: "probni",
      attemptNumber: 1,
      correctCount: 22,
      total: 25,
      score: 88,
      passed: true,
      vrijeme: 1550,
      createdAt: '2025-09-02T14:25:00.000Z'
    }
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const userData = localStorage.getItem("user");

    if (!token || role !== "admin") {
      router.push("/login");
      return;
    }

    // Simuliramo učitavanje
    setTimeout(() => {
      setUser(JSON.parse(userData));
      setIsLoading(false);
      fetchCandidates();
      fetchTestResults();
    }, 1000);
  }, [router]);

  const fetchCandidates = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/users/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const allUsers = await response.json();
        const apiCandidates = allUsers.filter(user => user.role === 'candidate');
        
        // Kombiniraj API kandidate sa mock kandidatima
        const allCandidates = [...apiCandidates, ...mockCandidates];
        setCandidates(allCandidates);
      } else {
        throw new Error('API nije dostupan');
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
      // Fallback na mock podatke
      setCandidates(mockCandidates);
    }
  };

  const fetchTestResults = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/testresults/all', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // API vraća { ukupno_testova: number, rezultati: array }
        const apiResults = data.rezultati || [];
        
        // Kombiniraj API rezultate sa mock rezultatima
        const allResults = [...apiResults, ...mockTestResults];
        setTestResults(allResults);
      } else {
        throw new Error('API nije dostupan');
      }
    } catch (error) {
      console.error('Error fetching test results:', error);
      // Fallback na mock podatke
      setTestResults(mockTestResults);
    }
  };

  const fetchCandidateResults = async (candidateId, tip = "svi") => {
    try {
      const token = localStorage.getItem('token');
      let url = `http://localhost:5000/api/testresults/user/${candidateId}`;
      
      if (tip !== "svi") {
        url += `/${tip}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const results = await response.json();
        return results;
      } else {
        throw new Error('API nije dostupan');
      }
    } catch (error) {
      console.error('Error fetching candidate results:', error);
      // Fallback na mock podatke
      const filteredResults = mockTestResults.filter(result => 
        result.user === candidateId && (tip === "svi" || result.tip === tip)
      );
      return { rezultati: filteredResults };
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
  };

  const handleCandidateSelect = async (candidate) => {
    setSelectedCandidate(candidate);
    setSelectedTestType("svi");
    setDetailedResults(null);
    
    const results = await fetchCandidateResults(candidate._id, "svi");
    setTestResults(results.rezultati || []);
  };

  const handleTestTypeChange = async (type) => {
    setSelectedTestType(type);
    if (selectedCandidate) {
      const results = await fetchCandidateResults(selectedCandidate._id, type === "svi" ? "svi" : type);
      setTestResults(results.rezultati || []);
    }
  };

  const handleViewDetails = (result) => {
    setDetailedResults(result);
  };

  const handleCloseDetails = () => {
    setDetailedResults(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Helper funkcije
  const getCandidateStats = (candidateId) => {
    const candidateResults = testResults.filter(result => 
      result.user && (result.user._id === candidateId || result.user === candidateId)
    );
    const totalTests = candidateResults.length;
    const passedTests = candidateResults.filter(result => result.passed).length;

    const categoryStats = {
      prva_pomoc: candidateResults.filter(r => r.tip === 'prva_pomoc'),
      znak: candidateResults.filter(r => r.tip === 'znak'),
      teorija: candidateResults.filter(r => r.tip === 'teorija'),
      raskrsnice: candidateResults.filter(r => r.tip === 'raskrsnice')
    };

    const categoryAverages = {};
    Object.keys(categoryStats).forEach(category => {
      const tests = categoryStats[category];
      categoryAverages[category] = tests.length > 0 
        ? Math.round(tests.reduce((acc, result) => acc + (result.score || 0), 0) / tests.length)
        : 0;
    });

    const overallAverage = totalTests > 0 
      ? Math.round(candidateResults.reduce((acc, result) => acc + (result.score || 0), 0) / totalTests)
      : 0;

    return {
      totalTests,
      passedTests,
      overallAverage,
      categoryAverages,
      successRate: totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0
    };
  };

  // Globalne statistike
  const getGlobalStats = () => {
    const totalTests = testResults.length;
    const passedTests = testResults.filter(result => result.passed).length;
    const averageScore = totalTests > 0 
      ? Math.round(testResults.reduce((acc, result) => acc + (result.score || 0), 0) / totalTests)
      : 0;

    return {
      totalTests,
      passedTests,
      averageScore,
      totalCandidates: candidates.length,
      successRate: totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0
    };
  };

  const globalStats = getGlobalStats();
  const candidateStats = selectedCandidate ? getCandidateStats(selectedCandidate._id) : null;

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#0F111A] via-[#1A1C25] to-[#232634] text-white">
      {/* Sidebar Component */}
      <Sidebar
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-gradient-to-r from-[#1A1C25] to-[#232634]/80 backdrop-blur-xl border-b border-[#2A2D3A] p-8 shadow-2xl shadow-[#6C63FF]/5 animate-slideDown">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white bg-gradient-to-r from-white via-[#E2E8FF] to-[#B0B3C1] bg-clip-text text-transparent">
                Analiza rezultata testova
              </h1>
              <p className="text-[#B0B3C1] mt-3 text-lg font-light">
                Detaljna analiza testova po kandidatima i kategorijama
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="bg-[#232634]/60 backdrop-blur-lg px-6 py-3 rounded-2xl text-[#B0B3C1] border border-[#2A2D3A] shadow-2xl shadow-black/30 hover:shadow-[#6C63FF]/20 hover:border-[#6C63FF]/40 transition-all duration-500 group hover:scale-105">
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
            {/* Globalne statistike */}
            <GlobalStats 
              globalStats={globalStats} 
              hoveredCard={hoveredCard}
              onHover={setHoveredCard}
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Lista kandidata */}
              <CandidatesList
                candidates={candidates}
                selectedCandidate={selectedCandidate}
                onCandidateSelect={handleCandidateSelect}
                getCandidateStats={getCandidateStats}
              />

              {/* Statistika odabranog kandidata i rezultati */}
              <div className="lg:col-span-3">
                {selectedCandidate ? (
                  <>
                    {/* Statistika kandidata */}
                    <CandidateStats
                      selectedCandidate={selectedCandidate}
                      candidateStats={candidateStats}
                    />

                    {/* Rezultati testova */}
                    <TestResults
                      selectedCandidate={selectedCandidate}
                      testResults={testResults}
                      selectedTestType={selectedTestType}
                      onTestTypeChange={handleTestTypeChange}
                      onViewDetails={handleViewDetails}
                    />
                  </>
                ) : (
                  <div className="bg-gradient-to-br from-[#1A1C25] to-[#232634] rounded-2xl border border-[#2A2D3A] shadow-2xl shadow-black/20 hover:shadow-[#6C63FF]/10 transition-all duration-500 animate-slideUp">
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">👆</div>
                      <p className="text-[#B0B3C1] text-lg">Odaberite kandidata za pregled statistike i rezultata</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Dijalog za detalje rezultata */}
      <ResultsModal
        detailedResults={detailedResults}
        onClose={handleCloseDetails}
      />

      {/* Snackbar za notifikacije */}
      {snackbar.open && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-xl border backdrop-blur-sm animate-slideUp ${
          snackbar.severity === 'success' 
            ? 'bg-[#27AE60]/20 border-[#27AE60]/30 text-[#27AE60]' 
            : 'bg-[#FF6B35]/20 border-[#FF6B35]/30 text-[#FF6B35]'
        }`}>
          <div className="flex items-center space-x-3">
            <span>{snackbar.severity === 'success' ? '✅' : '⚠️'}</span>
            <span>{snackbar.message}</span>
            <button 
              onClick={handleCloseSnackbar}
              className="ml-2 hover:opacity-70 transition-opacity duration-300"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}