"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../../components/Sidebar2";
import GlobalStats from "./components/GlobalStats";
import CandidatesList from "./components/CandidatesList";
import CandidateStats from "./components/CandidateStats";
import TestResults from "./components/TestResults";
import ResultsModal from "./components/ResultsModal";
import LoadingScreen from "./components/LoadingScreen";

export default function TestoviInstruktor() {
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

  // Mock podaci za kandidate - samo za instruktora
  const mockCandidates = [
    {
      _id: '68eade989edcf654f0b85fe3',
      name: 'Faruk',
      surname: 'Hasic',
      email: 'faruk.hasic@example.com',
      jmbg: '0101990123456',
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
      createdAt: '2023-09-22T08:00:00.000Z'
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
        polozio: {
          teoriju: true,
          prvuPomoc: true,
          voznju: true
        }
      },
      instruktor: {
        _id: '68ddb01cebb9729427e99c14',
        name: 'Amir',
        surname: 'Hodžić'
      },
      createdAt: '2023-08-15T08:00:00.000Z'
    },
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
      instruktor: {
        _id: '68ddb01cebb9729427e99c14',
        name: 'Amir',
        surname: 'Hodžić'
      },
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
      instruktor: {
        _id: '68ddb01cebb9729427e99c14',
        name: 'Amir',
        surname: 'Hodžić'
      },
      createdAt: '2023-09-10T08:00:00.000Z'
    }
  ];

  // Mock test rezultati za sve kandidate instruktora
  const mockTestResults = [
    // Faruk Hasic - PUNO TESTOVA (SOLIDAN)
    {
      _id: 'faruk_znak_1',
      user: '68eade989edcf654f0b85fe3',
      tip: "znak",
      subTip: "kombinovani",
      attemptNumber: 1,
      correctCount: 18,
      total: 20,
      score: 90,
      passed: true,
      vrijeme: 1320,
      createdAt: '2023-11-20T10:30:00.000Z'
    },
    {
      _id: 'faruk_znak_2',
      user: '68eade989edcf654f0b85fe3',
      tip: "znak",
      subTip: "kombinovani",
      attemptNumber: 2,
      correctCount: 19,
      total: 20,
      score: 95,
      passed: true,
      vrijeme: 1250,
      createdAt: '2023-11-25T14:20:00.000Z'
    },
    {
      _id: 'faruk_teorija_1',
      user: '68eade989edcf654f0b85fe3',
      tip: "teorija",
      subTip: "kombinovani",
      correctCount: 25,
      total: 30,
      score: 83,
      passed: true,
      vrijeme: 1680,
      createdAt: '2023-12-01T08:20:00.000Z'
    },
    {
      _id: 'faruk_prva_pomoc_1',
      user: '68eade989edcf654f0b85fe3',
      tip: "prva_pomoc",
      subTip: "kombinovani",
      correctCount: 20,
      total: 25,
      score: 80,
      passed: true,
      vrijeme: 1420,
      createdAt: '2023-11-28T11:30:00.000Z'
    },
    {
      _id: 'faruk_prva_pomoc_2',
      user: '68eade989edcf654f0b85fe3',
      tip: "prva_pomoc",
      subTip: "zavrsni",
      correctCount: 11,
      total: 25,
      score: 44,
      passed: false,
      vrijeme: 1520,
      createdAt: '2023-12-05T14:20:00.000Z'
    },
    {
      _id: 'faruk_raskrsnice_1',
      user: '68eade989edcf654f0b85fe3',
      tip: "raskrsnice",
      subTip: "kombinovani",
      correctCount: 22,
      total: 25,
      score: 88,
      passed: true,
      vrijeme: 1580,
      createdAt: '2023-12-02T14:30:00.000Z'
    },

    // Lejla Karić - PUNO TESTOVA (ODLIČNA)
    {
      _id: 'lejla_teorija_1',
      user: '689dfedcf654f324dfsae33',
      tip: "teorija",
      subTip: "kombinovani",
      correctCount: 28,
      total: 30,
      score: 93,
      passed: true,
      vrijeme: 1450,
      createdAt: '2023-11-28T09:15:00.000Z'
    },
    {
      _id: 'lejla_teorija_2',
      user: '689dfedcf654f324dfsae33',
      tip: "teorija",
      subTip: "zavrsni",
      correctCount: 27,
      total: 30,
      score: 90,
      passed: true,
      vrijeme: 1420,
      createdAt: '2023-12-05T11:20:00.000Z'
    },
    {
      _id: 'lejla_znak_1',
      user: '689dfedcf654f324dfsae33',
      tip: "znak",
      subTip: "kombinovani",
      correctCount: 19,
      total: 20,
      score: 95,
      passed: true,
      vrijeme: 1250,
      createdAt: '2023-11-22T14:20:00.000Z'
    },
    {
      _id: 'lejla_znak_2',
      user: '689dfedcf654f324dfsae33',
      tip: "znak",
      subTip: "lekcijski",
      correctCount: 10,
      total: 10,
      score: 100,
      passed: true,
      vrijeme: 850,
      createdAt: '2023-11-25T16:45:00.000Z'
    },
    {
      _id: 'lejla_prva_pomoc_1',
      user: '689dfedcf654f324dfsae33',
      tip: "prva_pomoc",
      subTip: "kombinovani",
      correctCount: 23,
      total: 25,
      score: 92,
      passed: true,
      vrijeme: 1380,
      createdAt: '2023-11-25T10:15:00.000Z'
    },
    {
      _id: 'lejla_prva_pomoc_2',
      user: '689dfedcf654f324dfsae33',
      tip: "prva_pomoc",
      subTip: "zavrsni",
      correctCount: 24,
      total: 25,
      score: 96,
      passed: true,
      vrijeme: 1350,
      createdAt: '2023-12-01T13:30:00.000Z'
    },
    {
      _id: 'lejla_raskrsnice_1',
      user: '689dfedcf654f324dfsae33',
      tip: "raskrsnice",
      subTip: "kombinovani",
      correctCount: 24,
      total: 25,
      score: 96,
      passed: true,
      vrijeme: 1520,
      createdAt: '2023-11-30T15:30:00.000Z'
    },
    {
      _id: 'lejla_raskrsnice_2',
      user: '689dfedcf654f324dfsae33',
      tip: "raskrsnice",
      subTip: "zavrsni",
      correctCount: 23,
      total: 25,
      score: 92,
      passed: true,
      vrijeme: 1480,
      createdAt: '2023-12-08T10:20:00.000Z'
    },

    // Amina Husić - PUNO TESTOVA (VRLO DOBRA)
    {
      _id: 'amina_teorija_1',
      user: 'mock_amina_husic',
      tip: "teorija",
      subTip: "kombinovani",
      attemptNumber: 1,
      correctCount: 26,
      total: 30,
      score: 87,
      passed: true,
      vrijeme: 1680,
      createdAt: '2023-11-10T09:15:00.000Z'
    },
    {
      _id: 'amina_teorija_2',
      user: 'mock_amina_husic',
      tip: "teorija",
      subTip: "lekcijski",
      attemptNumber: 1,
      correctCount: 14,
      total: 15,
      score: 93,
      passed: true,
      vrijeme: 920,
      createdAt: '2023-11-05T16:45:00.000Z'
    },
    {
      _id: 'amina_znak_1',
      user: 'mock_amina_husic',
      tip: "znak",
      subTip: "kombinovani",
      attemptNumber: 1,
      correctCount: 18,
      total: 20,
      score: 90,
      passed: true,
      vrijeme: 1320,
      createdAt: '2023-11-15T10:30:00.000Z'
    },
    {
      _id: 'amina_znak_2',
      user: 'mock_amina_husic',
      tip: "znak",
      subTip: "kombinovani",
      attemptNumber: 2,
      correctCount: 19,
      total: 20,
      score: 95,
      passed: true,
      vrijeme: 1250,
      createdAt: '2023-11-20T14:20:00.000Z'
    },
    {
      _id: 'amina_prva_pomoc_1',
      user: 'mock_amina_husic',
      tip: "prva_pomoc",
      subTip: "kombinovani",
      attemptNumber: 1,
      correctCount: 22,
      total: 25,
      score: 88,
      passed: true,
      vrijeme: 1420,
      createdAt: '2023-11-08T11:30:00.000Z'
    },
    {
      _id: 'amina_prva_pomoc_2',
      user: 'mock_amina_husic',
      tip: "prva_pomoc",
      subTip: "lekcijski",
      attemptNumber: 1,
      correctCount: 9,
      total: 10,
      score: 90,
      passed: true,
      vrijeme: 850,
      createdAt: '2023-11-03T13:20:00.000Z'
    },
    {
      _id: 'amina_raskrsnice_1',
      user: 'mock_amina_husic',
      tip: "raskrsnice",
      subTip: "kombinovani",
      attemptNumber: 1,
      correctCount: 23,
      total: 25,
      score: 92,
      passed: true,
      vrijeme: 1580,
      createdAt: '2023-11-12T15:30:00.000Z'
    },

    // Dario Madić - PUNO TESTOVA (PROSJEČAN)
    {
      _id: 'dario_teorija_1',
      user: 'mock_dario_mandic',
      tip: "teorija",
      subTip: "kombinovani",
      attemptNumber: 1,
      correctCount: 22,
      total: 30,
      score: 73,
      passed: false,
      vrijeme: 1720,
      createdAt: '2023-11-05T09:30:00.000Z'
    },
    {
      _id: 'dario_teorija_2',
      user: 'mock_dario_mandic',
      tip: "teorija",
      subTip: "kombinovani",
      attemptNumber: 2,
      correctCount: 25,
      total: 30,
      score: 83,
      passed: true,
      vrijeme: 1650,
      createdAt: '2023-11-08T14:20:00.000Z'
    },
    {
      _id: 'dario_znak_1',
      user: 'mock_dario_mandic',
      tip: "znak",
      subTip: "kombinovani",
      attemptNumber: 1,
      correctCount: 16,
      total: 20,
      score: 80,
      passed: true,
      vrijeme: 1380,
      createdAt: '2023-11-03T11:45:00.000Z'
    },
    {
      _id: 'dario_znak_2',
      user: 'mock_dario_mandic',
      tip: "znak",
      subTip: "lekcijski",
      attemptNumber: 1,
      correctCount: 8,
      total: 10,
      score: 80,
      passed: true,
      vrijeme: 780,
      createdAt: '2023-11-01T16:30:00.000Z'
    },
    {
      _id: 'dario_prva_pomoc_1',
      user: 'mock_dario_mandic',
      tip: "prva_pomoc",
      subTip: "kombinovani",
      attemptNumber: 1,
      correctCount: 18,
      total: 25,
      score: 72,
      passed: false,
      vrijeme: 1520,
      createdAt: '2023-11-10T10:15:00.000Z'
    },
    {
      _id: 'dario_prva_pomoc_2',
      user: 'mock_dario_mandic',
      tip: "prva_pomoc",
      subTip: "kombinovani",
      attemptNumber: 2,
      correctCount: 21,
      total: 25,
      score: 84,
      passed: true,
      vrijeme: 1480,
      createdAt: '2023-11-12T13:40:00.000Z'
    },
    {
      _id: 'dario_raskrsnice_1',
      user: 'mock_dario_mandic',
      tip: "raskrsnice",
      subTip: "kombinovani",
      attemptNumber: 1,
      correctCount: 19,
      total: 25,
      score: 76,
      passed: false,
      vrijeme: 1620,
      createdAt: '2023-11-07T15:20:00.000Z'
    },
    {
      _id: 'dario_raskrsnice_2',
      user: 'mock_dario_mandic',
      tip: "raskrsnice",
      subTip: "kombinovani",
      attemptNumber: 2,
      correctCount: 22,
      total: 25,
      score: 88,
      passed: true,
      vrijeme: 1550,
      createdAt: '2023-11-09T11:10:00.000Z'
    },

    // Selma Karahodžić - PUNO TESTOVA (SLABA)
    {
      _id: 'selma_teorija_1',
      user: 'mock_selma_karahodzic',
      tip: "teorija",
      subTip: "kombinovani",
      attemptNumber: 1,
      correctCount: 18,
      total: 30,
      score: 60,
      passed: false,
      vrijeme: 1780,
      createdAt: '2023-12-05T09:45:00.000Z'
    },
    {
      _id: 'selma_teorija_2',
      user: 'mock_selma_karahodzic',
      tip: "teorija",
      subTip: "kombinovani",
      attemptNumber: 2,
      correctCount: 20,
      total: 30,
      score: 67,
      passed: false,
      vrijeme: 1720,
      createdAt: '2023-12-08T14:30:00.000Z'
    },
    {
      _id: 'selma_teorija_3',
      user: 'mock_selma_karahodzic',
      tip: "teorija",
      subTip: "kombinovani",
      attemptNumber: 3,
      correctCount: 22,
      total: 30,
      score: 73,
      passed: false,
      vrijeme: 1680,
      createdAt: '2023-12-12T11:20:00.000Z'
    },
    {
      _id: 'selma_znak_1',
      user: 'mock_selma_karahodzic',
      tip: "znak",
      subTip: "kombinovani",
      attemptNumber: 1,
      correctCount: 14,
      total: 20,
      score: 70,
      passed: false,
      vrijeme: 1420,
      createdAt: '2023-12-03T11:20:00.000Z'
    },
    {
      _id: 'selma_znak_2',
      user: 'mock_selma_karahodzic',
      tip: "znak",
      subTip: "kombinovani",
      attemptNumber: 2,
      correctCount: 15,
      total: 20,
      score: 75,
      passed: false,
      vrijeme: 1380,
      createdAt: '2023-12-06T16:15:00.000Z'
    },
    {
      _id: 'selma_prva_pomoc_1',
      user: 'mock_selma_karahodzic',
      tip: "prva_pomoc",
      subTip: "kombinovani",
      attemptNumber: 1,
      correctCount: 16,
      total: 25,
      score: 64,
      passed: false,
      vrijeme: 1580,
      createdAt: '2023-12-10T10:30:00.000Z'
    },

    // Nermin Selimović - PUNO TESTOVA (NAJBOLJI)
    {
      _id: 'nermin_teorija_1',
      user: 'mock_nermin_selimovic',
      tip: "teorija",
      subTip: "kombinovani",
      attemptNumber: 1,
      correctCount: 29,
      total: 30,
      score: 97,
      passed: true,
      vrijeme: 1620,
      createdAt: '2023-10-20T09:15:00.000Z'
    },
    {
      _id: 'nermin_teorija_2',
      user: 'mock_nermin_selimovic',
      tip: "teorija",
      subTip: "zavrsni",
      attemptNumber: 1,
      correctCount: 28,
      total: 30,
      score: 93,
      passed: true,
      vrijeme: 1580,
      createdAt: '2023-10-25T14:40:00.000Z'
    },
    {
      _id: 'nermin_znak_1',
      user: 'mock_nermin_selimovic',
      tip: "znak",
      subTip: "kombinovani",
      attemptNumber: 1,
      correctCount: 20,
      total: 20,
      score: 100,
      passed: true,
      vrijeme: 1250,
      createdAt: '2023-10-18T11:20:00.000Z'
    },
    {
      _id: 'nermin_znak_2',
      user: 'mock_nermin_selimovic',
      tip: "znak",
      subTip: "kombinovani",
      attemptNumber: 2,
      correctCount: 19,
      total: 20,
      score: 95,
      passed: true,
      vrijeme: 1220,
      createdAt: '2023-10-22T16:30:00.000Z'
    },
    {
      _id: 'nermin_prva_pomoc_1',
      user: 'mock_nermin_selimovic',
      tip: "prva_pomoc",
      subTip: "kombinovani",
      attemptNumber: 1,
      correctCount: 24,
      total: 25,
      score: 96,
      passed: true,
      vrijeme: 1420,
      createdAt: '2023-10-15T10:45:00.000Z'
    },
    {
      _id: 'nermin_prva_pomoc_2',
      user: 'mock_nermin_selimovic',
      tip: "prva_pomoc",
      subTip: "zavrsni",
      attemptNumber: 1,
      correctCount: 23,
      total: 25,
      score: 92,
      passed: true,
      vrijeme: 1380,
      createdAt: '2023-10-28T13:15:00.000Z'
    },
    {
      _id: 'nermin_raskrsnice_1',
      user: 'mock_nermin_selimovic',
      tip: "raskrsnice",
      subTip: "kombinovani",
      attemptNumber: 1,
      correctCount: 24,
      total: 25,
      score: 96,
      passed: true,
      vrijeme: 1520,
      createdAt: '2023-10-17T15:20:00.000Z'
    },
    {
      _id: 'nermin_raskrsnice_2',
      user: 'mock_nermin_selimovic',
      tip: "raskrsnice",
      subTip: "zavrsni",
      attemptNumber: 1,
      correctCount: 23,
      total: 25,
      score: 92,
      passed: true,
      vrijeme: 1480,
      createdAt: '2023-10-30T11:50:00.000Z'
    },
    {
      _id: 'nermin_raskrsnice_3',
      user: 'mock_nermin_selimovic',
      tip: "raskrsnice",
      subTip: "probni",
      attemptNumber: 1,
      correctCount: 22,
      total: 25,
      score: 88,
      passed: true,
      vrijeme: 1550,
      createdAt: '2023-11-02T14:25:00.000Z'
    }
  ];

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
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setIsLoading(false);
      fetchCandidates(parsedUser);
    }, 1000);
  }, [router]);

  const fetchCandidates = async (currentUser) => {
    try {
      const token = localStorage.getItem('token');
      const instruktorId = currentUser?._id || '68ddb01cebb9729427e99c14';
      
      const response = await fetch(`http://localhost:5000/api/users/instruktor/${instruktorId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const apiCandidates = await response.json();
        
        // Kombiniraj API kandidate sa mock kandidatima (samo za ovog instruktora)
        const filteredMockCandidates = mockCandidates.filter(candidate => 
          candidate.instruktor && candidate.instruktor._id === instruktorId
        );
        
        const allCandidates = [...apiCandidates, ...filteredMockCandidates];
        setCandidates(allCandidates);
        
        // Nakon što dobijemo kandidate, dohvatimo rezultate za sve njih
        await fetchAllTestResults(allCandidates);
      } else {
        throw new Error('API nije dostupan');
      }
    } catch (error) {
      // Fallback na mock podatke - samo za ovog instruktora
      const currentUser = JSON.parse(localStorage.getItem('user'));
      const instruktorId = currentUser?._id || '68ddb01cebb9729427e99c14';
      const filteredMockCandidates = mockCandidates.filter(candidate => 
        candidate.instruktor && candidate.instruktor._id === instruktorId
      );
      setCandidates(filteredMockCandidates);
      
      // Koristimo mock rezultate
      setTestResults(mockTestResults);
    }
  };

  const fetchAllTestResults = async (candidatesList) => {
    try {
      const token = localStorage.getItem('token');
      let allResults = [];

      // Dohvati rezultate za svakog kandidata posebno
      for (const candidate of candidatesList) {
        try {
          const response = await fetch(`http://localhost:5000/api/testresults/user/${candidate._id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            const candidateResults = data.rezultati || [];
            allResults = [...allResults, ...candidateResults];
          }
        } catch (error) {
          console.error(`Error fetching results for candidate ${candidate._id}:`, error);
        }
      }

      // Ako nema API rezultata, koristi mock
      if (allResults.length === 0) {
        const instruktorCandidateIds = candidatesList.map(c => c._id);
        const filteredMockResults = mockTestResults.filter(result => 
          instruktorCandidateIds.includes(result.user)
        );
        setTestResults(filteredMockResults);
      } else {
        setTestResults(allResults);
      }
    } catch (error) {
      // Fallback na mock podatke
      const instruktorCandidateIds = candidatesList.map(c => c._id);
      const filteredMockResults = mockTestResults.filter(result => 
        instruktorCandidateIds.includes(result.user)
      );
      setTestResults(filteredMockResults);
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

  // Globalne statistike - samo za kandidate ovog instruktora
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
                Detaljna analiza testova za vaše kandidate
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