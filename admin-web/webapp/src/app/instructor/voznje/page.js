"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../../components/Sidebar";
import DrivingStats from "./components/DrivingStats";
import DrivingCalendar from "./components/DrivingCalendar";
import DrivingList from "./components/DrivingList";
import AddDrivingModal from "./components/AddDrivingModal";
import CancelDayModal from "./components/CancelDayModal";
import EnterResultModal from "./components/EnterResultModal";
import LoadingScreen from "./components/LoadingScreen";

export default function VoznjeInstruktor() {
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState("voznje");
  const [isLoading, setIsLoading] = useState(true);
  const [drivingSessions, setDrivingSessions] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState("calendar"); // "calendar" ili "list"
  const [showAddDriving, setShowAddDriving] = useState(false);
  const [showCancelDay, setShowCancelDay] = useState(false);
  const [showEnterResult, setShowEnterResult] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const router = useRouter();

  // Mock podaci za kandidate - samo za ovog instruktora
  const mockCandidates = [
    {
      _id: 'mock_candidate_1',
      name: 'Amina',
      surname: 'Husić',
      email: 'amina.husic@example.com',
      phone: '+38761123456',
      status: {
        teorijaPrvaPomoc: true,
        polozio: { teoriju: true, prvuPomoc: true, voznju: false }
      }
    },
    {
      _id: 'mock_candidate_2',
      name: 'Dario',
      surname: 'Madić',
      email: 'dario.madic@example.com',
      phone: '+38762345678',
      status: {
        teorijaPrvaPomoc: true,
        polozio: { teoriju: true, prvuPomoc: false, voznju: true }
      }
    },
    {
      _id: 'mock_candidate_3',
      name: 'Selma',
      surname: 'Karahodžić',
      email: 'selma.karahodzic@example.com',
      phone: '+38763456789',
      status: {
        teorijaPrvaPomoc: false,
        polozio: { teoriju: false, prvuPomoc: false, voznju: false }
      }
    },
    {
      _id: 'mock_candidate_4',
      name: 'Adnan',
      surname: 'Karić',
      email: 'adnan.karic@example.com',
      phone: '+38761122334',
      status: {
        teorijaPrvaPomoc: true,
        polozio: { teoriju: true, prvuPomoc: true, voznju: false }
      }
    }
  ];

  // Mock podaci za instruktore - samo trenutni instruktor
  const mockInstructors = [
    {
      _id: '68ddb01cebb9729427e99c14',
      name: 'Amir',
      surname: 'Hodžić',
      email: 'amir.hodzic@example.com',
      phone: '+38761111222',
      status: 'active'
    }
  ];

  // Mock podaci za vozila - samo za ovog instruktora
  const mockVehicles = [
    {
      _id: 'mock_vehicle_1',
      make: 'Volkswagen',
      model: 'Golf 7',
      plate: 'SA-123-A',
      year: 2020,
      status: 'active',
      instructor: {
        _id: '68ddb01cebb9729427e99c14',
        name: 'Amir',
        surname: 'Hodžić'
      }
    },
    {
      _id: 'mock_vehicle_2',
      make: 'Opel',
      model: 'Corsa',
      plate: 'SA-456-B',
      year: 2022,
      status: 'active',
      instructor: {
        _id: '68ddb01cebb9729427e99c14',
        name: 'Amir',
        surname: 'Hodžić'
      }
    }
  ];

  // Bogati mock podaci za vožnje - samo za ovog instruktora - SVAKE PO 1 SAT
  const getCurrentMonthDates = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const monthString = month < 10 ? `0${month}` : `${month}`;
    
    return {
      today: `${year}-${monthString}-${now.getDate()}`,
      tomorrow: `${year}-${monthString}-${now.getDate() + 1}`,
      dayAfter: `${year}-${monthString}-${now.getDate() + 2}`,
      nextWeek: `${year}-${monthString}-${now.getDate() + 7}`,
      lastWeek: `${year}-${monthString}-${now.getDate() - 7}`
    };
  };

  const dates = getCurrentMonthDates();

  const mockDrivingSessions = [
    // Današnje vožnje - Amir Hodžić - SVAKE PO 1 SAT
    {
      _id: 'mock_session_1',
      kandidat: mockCandidates[0],
      instruktor: mockInstructors[0],
      vozilo: mockVehicles[0],
      datum: dates.today,
      vrijeme: '08:00',
      trajanje: 1, // 1 SAT
      status: 'zavrsena',
      lokacija: 'Poligon',
      napomene: 'Vježbe parkiranja',
      ocjena: 8,
      potrosnjaGoriva: 2.1,
      predeniKilometri: 15,
      zavrsnaVoznja: false,
      createdAt: new Date().toISOString()
    },
    {
      _id: 'mock_session_2',
      kandidat: mockCandidates[0],
      instruktor: mockInstructors[0],
      vozilo: mockVehicles[0],
      datum: dates.today,
      vrijeme: '10:00',
      trajanje: 1, // 1 SAT
      status: 'zakazana',
      lokacija: 'Gradska vožnja',
      napomene: 'Vožnja po centru',
      ocjena: null,
      potrosnjaGoriva: null,
      predeniKilometri: null,
      zavrsnaVoznja: false,
      createdAt: new Date().toISOString()
    },
    {
      _id: 'mock_session_3',
      kandidat: mockCandidates[3],
      instruktor: mockInstructors[0],
      vozilo: mockVehicles[0],
      datum: dates.today,
      vrijeme: '16:00',
      trajanje: 1, // 1 SAT
      status: 'zakazana',
      lokacija: 'Poligon',
      napomene: 'Vježbe poligona',
      ocjena: null,
      potrosnjaGoriva: null,
      predeniKilometri: null,
      zavrsnaVoznja: false,
      createdAt: new Date().toISOString()
    },

    // Sutrašnje vožnje - Amir Hodžić - SVAKE PO 1 SAT
    {
      _id: 'mock_session_4',
      kandidat: mockCandidates[2],
      instruktor: mockInstructors[0],
      vozilo: mockVehicles[0],
      datum: dates.tomorrow,
      vrijeme: '09:00',
      trajanje: 1, // 1 SAT
      status: 'zakazana',
      lokacija: 'Poligon',
      napomene: 'Prva vožnja - osnove',
      ocjena: null,
      potrosnjaGoriva: null,
      predeniKilometri: null,
      zavrsnaVoznja: false,
      createdAt: new Date().toISOString()
    },
    {
      _id: 'mock_session_5',
      kandidat: mockCandidates[1],
      instruktor: mockInstructors[0],
      vozilo: mockVehicles[1],
      datum: dates.tomorrow,
      vrijeme: '15:00',
      trajanje: 1, // 1 SAT
      status: 'zakazana',
      lokacija: 'Autoput',
      napomene: 'Brzinska vožnja',
      ocjena: null,
      potrosnjaGoriva: null,
      predeniKilometri: null,
      zavrsnaVoznja: false,
      createdAt: new Date().toISOString()
    },

    // Prekosutra - Amir Hodžić - SVAKE PO 1 SAT
    {
      _id: 'mock_session_6',
      kandidat: mockCandidates[0],
      instruktor: mockInstructors[0],
      vozilo: mockVehicles[0],
      datum: dates.dayAfter,
      vrijeme: '08:00',
      trajanje: 1, // 1 SAT
      status: 'zakazana',
      lokacija: 'Poligon',
      napomene: 'Završna priprema',
      ocjena: null,
      potrosnjaGoriva: null,
      predeniKilometri: null,
      zavrsnaVoznja: false,
      createdAt: new Date().toISOString()
    },

    // Sljedeće sedmice - Amir Hodžić - SVAKE PO 1 SAT
    {
      _id: 'mock_session_7',
      kandidat: mockCandidates[3],
      instruktor: mockInstructors[0],
      vozilo: mockVehicles[0],
      datum: dates.nextWeek,
      vrijeme: '10:00',
      trajanje: 1, // 1 SAT
      status: 'zakazana',
      lokacija: 'Testna staza',
      napomene: 'Ispitna vožnja',
      ocjena: null,
      potrosnjaGoriva: null,
      predeniKilometri: null,
      zavrsnaVoznja: true,
      createdAt: new Date().toISOString()
    },

    // Prošle sedmice - završene vožnje - Amir Hodžić - SVAKE PO 1 SAT
    {
      _id: 'mock_session_8',
      kandidat: mockCandidates[0],
      instruktor: mockInstructors[0],
      vozilo: mockVehicles[0],
      datum: dates.lastWeek,
      vrijeme: '11:00',
      trajanje: 1, // 1 SAT
      status: 'otkazana',
      lokacija: 'Poligon',
      napomene: 'Otkazano zbog bolesti',
      ocjena: null,
      potrosnjaGoriva: null,
      predeniKilometri: null,
      zavrsnaVoznja: false,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: 'mock_session_9',
      kandidat: mockCandidates[1],
      instruktor: mockInstructors[0],
      vozilo: mockVehicles[1],
      datum: dates.lastWeek,
      vrijeme: '08:00',
      trajanje: 1, // 1 SAT
      status: 'zavrsena',
      lokacija: 'Autoput',
      napomene: 'Duga vožnja',
      ocjena: 8,
      potrosnjaGoriva: 2.5,
      predeniKilometri: 25,
      zavrsnaVoznja: false,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
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

    // Postavi podatke odmah
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    setCandidates(mockCandidates);
    setInstructors(mockInstructors);
    setDrivingSessions(mockDrivingSessions);
    
    // Pokusaj fetch sa API-ja
    fetchWithTimeout(parsedUser);
  }, [router]);

  const fetchWithTimeout = async (currentUser) => {
    try {
      const token = localStorage.getItem('token');
      const instruktorId = currentUser?.id;
      
      console.log("📞 Fetching driving sessions for instructor:", instruktorId);
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 3000)
      );

      // Koristimo API endpoint za instruktora: /api/driving/instruktor/:id
      const sessionsPromise = fetch(`http://localhost:5000/api/driving/instruktor/${instruktorId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const response = await Promise.race([sessionsPromise, timeoutPromise]);
      
      if (response.ok) {
        const apiSessions = await response.json();
        console.log('✅ API vožnje za instruktora:', apiSessions);
        
        // Transform API data to match our frontend structure
        const transformedSessions = apiSessions.map(session => ({
          _id: session._id,
          kandidat: session.kandidat,
          instruktor: session.instruktor,
          vozilo: mockVehicles[0], // Default vehicle since API doesn't provide it
          datum: session.datum,
          vrijeme: session.vrijemePocetka,
          trajanje: 1, // Uvijek 1 sat
          status: session.status,
          lokacija: session.lokacija || 'Poligon',
          napomene: session.napomene,
          ocjena: session.ocjena,
          potrosnjaGoriva: session.potrosnjaGoriva,
          predeniKilometri: session.predeniKilometri,
          zavrsnaVoznja: session.zavrsnaVoznja || false,
          createdAt: session.createdAt
        }));
        
        if (transformedSessions.length > 0) {
          setDrivingSessions(transformedSessions);
          setIsLoading(false);
        } else {
          // Ako nema API podataka, koristimo mock
          setIsLoading(false);
        }
      } else {
        throw new Error('API nije dostupan');
      }
    } catch (error) {
      console.log('API nije dostupan, koristim mock podatke');
      // Koristimo mock vozila i završavamo loading
      setVehicles(mockVehicles);
      setIsLoading(false);
    }
  };

  const fetchVehicles = async (instruktorId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/vehicles', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const apiVehicles = await response.json();
        console.log('✅ API vozila (SVA VOZILA):', apiVehicles);
        
        // Filtriranje vozila - samo ona koja pripadaju instruktoru
        const filteredVehicles = apiVehicles.filter(vehicle => 
          vehicle.instructor && vehicle.instructor._id === instruktorId
        );
        
        console.log('🎯 Filtrirana vozila instruktora:', filteredVehicles);
        setVehicles(filteredVehicles);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setVehicles(mockVehicles);
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

  const handleAddDriving = async (drivingData) => {
    try {
      const token = localStorage.getItem('token');
      const currentUser = JSON.parse(localStorage.getItem('user'));
      
      // API poziv za kreiranje vožnje
      const response = await fetch('http://localhost:5000/api/driving', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          kandidat: drivingData.kandidat,
          instruktor: currentUser.id, // Trenutni instruktor
          datum: drivingData.datum,
          vrijemePocetka: drivingData.vrijeme,
          vrijemeZavrsetka: calculateEndTime(drivingData.vrijeme, 1), // 1 sat
          status: 'zakazan',
          lokacija: drivingData.lokacija,
          napomene: drivingData.napomene,
          zavrsnaVoznja: drivingData.zavrsnaVoznja || false
        })
      });

      if (response.ok) {
        const newSession = await response.json();
        
        // Transform API response to frontend format
        const transformedSession = {
          _id: newSession._id,
          kandidat: candidates.find(c => c._id === drivingData.kandidat),
          instruktor: mockInstructors[0],
          vozilo: vehicles.find(v => v._id === drivingData.vozilo) || mockVehicles[0],
          datum: drivingData.datum,
          vrijeme: drivingData.vrijeme,
          trajanje: 1, // Uvijek 1 sat
          status: 'zakazana',
          lokacija: drivingData.lokacija,
          napomene: drivingData.napomene,
          ocjena: null,
          potrosnjaGoriva: null,
          predeniKilometri: null,
          zavrsnaVoznja: drivingData.zavrsnaVoznja || false,
          createdAt: new Date().toISOString()
        };

        setDrivingSessions(prev => [...prev, transformedSession]);
        setSnackbar({ open: true, message: 'Vožnja uspješno zakazana!', severity: 'success' });
        setShowAddDriving(false);
      } else {
        throw new Error('Greška pri zakazivanju vožnje');
      }
    } catch (error) {
      console.error('Error adding driving session:', error);
      
      // Fallback na mock ako API ne radi
      const newSession = {
        _id: 'mock_new_' + Date.now(),
        kandidat: candidates.find(c => c._id === drivingData.kandidat),
        instruktor: mockInstructors[0],
        vozilo: vehicles.find(v => v._id === drivingData.vozilo) || mockVehicles[0],
        datum: drivingData.datum,
        vrijeme: drivingData.vrijeme,
        trajanje: 1, // Uvijek 1 sat
        status: 'zakazana',
        lokacija: drivingData.lokacija,
        napomene: drivingData.napomene,
        ocjena: null,
        potrosnjaGoriva: null,
        predeniKilometri: null,
        zavrsnaVoznja: drivingData.zavrsnaVoznja || false,
        createdAt: new Date().toISOString()
      };

      setDrivingSessions(prev => [...prev, newSession]);
      setSnackbar({ open: true, message: 'Vožnja uspješno zakazana!', severity: 'success' });
      setShowAddDriving(false);
    }
  };

  // Helper funkcija za izračun završnog vremena
  const calculateEndTime = (startTime, durationHours) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endHours = hours + durationHours;
    return `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const handleCancelSession = async (sessionId) => {
    try {
      const token = localStorage.getItem('token');
      
      // API poziv za otkazivanje vožnje
      const response = await fetch(`http://localhost:5000/api/driving/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'otkazana'
        })
      });

      if (response.ok) {
        setDrivingSessions(prev => 
          prev.map(session => 
            session._id === sessionId 
              ? { ...session, status: 'otkazana' }
              : session
          )
        );
        setSnackbar({ open: true, message: 'Vožnja uspješno otkazana!', severity: 'success' });
      } else {
        throw new Error('Greška pri otkazivanju vožnje');
      }
    } catch (error) {
      console.error('Error canceling session:', error);
      // Fallback na mock
      setDrivingSessions(prev => 
        prev.map(session => 
          session._id === sessionId 
            ? { ...session, status: 'otkazana' }
            : session
        )
      );
      setSnackbar({ open: true, message: 'Vožnja uspješno otkazana!', severity: 'success' });
    }
  };

  const handleCancelDay = async (cancelData) => {
    try {
      const { date, razlog } = cancelData;
      const currentUser = JSON.parse(localStorage.getItem('user'));
      const instruktorId = currentUser?.id;
      
      setDrivingSessions(prev => 
        prev.map(session => {
          if (session.datum === date && session.instruktor._id === instruktorId && session.status === 'zakazana') {
            return { 
              ...session, 
              status: 'otkazana',
              napomene: session.napomene ? `${session.napomene} | ${razlog}` : razlog
            };
          }
          return session;
        })
      );
      
      setSnackbar({ open: true, message: 'Sve vožnje za odabrani dan su otkazane!', severity: 'success' });
      setShowCancelDay(false);
    } catch (error) {
      console.error('Error canceling day:', error);
      setSnackbar({ open: true, message: 'Greška pri otkazivanju vožnji', severity: 'error' });
    }
  };

  const handleEnterResult = async (resultData) => {
    try {
      const token = localStorage.getItem('token');
      
      // API poziv za unos rezultata
      const response = await fetch(`http://localhost:5000/api/driving/${selectedSession._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'zavrsena',
          ocjena: resultData.ocjena,
          potrosnjaGoriva: resultData.potrosnjaGoriva,
          predeniKilometri: resultData.predeniKilometri,
          napomene: resultData.napomene,
          zavrsnaVoznja: resultData.zavrsnaVoznja
        })
      });

      if (response.ok) {
        setDrivingSessions(prev => 
          prev.map(session => 
            session._id === selectedSession._id 
              ? { 
                  ...session, 
                  status: 'zavrsena',
                  ocjena: resultData.ocjena,
                  potrosnjaGoriva: resultData.potrosnjaGoriva,
                  predeniKilometri: resultData.predeniKilometri,
                  napomene: resultData.napomene,
                  zavrsnaVoznja: resultData.zavrsnaVoznja
                }
              : session
          )
        );
        
        setSnackbar({ open: true, message: 'Rezultat vožnje uspješno unesen!', severity: 'success' });
        setShowEnterResult(false);
        setSelectedSession(null);
      } else {
        throw new Error('Greška pri unosu rezultata');
      }
    } catch (error) {
      console.error('Error entering result:', error);
      // Fallback na mock
      setDrivingSessions(prev => 
        prev.map(session => 
          session._id === selectedSession._id 
            ? { 
                ...session, 
                status: 'zavrsena',
                ocjena: resultData.ocjena,
                potrosnjaGoriva: resultData.potrosnjaGoriva,
                predeniKilometri: resultData.predeniKilometri,
                napomene: resultData.napomene,
                zavrsnaVoznja: resultData.zavrsnaVoznja
              }
            : session
        )
      );
      
      setSnackbar({ open: true, message: 'Rezultat vožnje uspješno unesen!', severity: 'success' });
      setShowEnterResult(false);
      setSelectedSession(null);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Helper funkcije za statistike
  const getDrivingStats = () => {
    const totalSessions = drivingSessions.length;
    const completedSessions = drivingSessions.filter(s => s.status === 'zavrsena').length;
    const scheduledSessions = drivingSessions.filter(s => s.status === 'zakazana').length;
    const canceledSessions = drivingSessions.filter(s => s.status === 'otkazana').length;
    
    const totalHours = drivingSessions
      .filter(s => s.status === 'zavrsena')
      .reduce((acc, session) => acc + (session.trajanje || 0), 0);
    
    const totalKilometers = drivingSessions
      .filter(s => s.status === 'zavrsena')
      .reduce((acc, session) => acc + (session.predeniKilometri || 0), 0);

    const averageGrade = drivingSessions
      .filter(s => s.ocjena)
      .reduce((acc, session, _, array) => {
        return array.length > 0 ? acc + session.ocjena / array.length : 0;
      }, 0);

    return {
      totalSessions,
      completedSessions,
      scheduledSessions,
      canceledSessions,
      totalHours,
      totalKilometers,
      averageGrade: Math.round(averageGrade * 10) / 10
    };
  };

  const drivingStats = getDrivingStats();

  // Filtrirane vožnje - samo za trenutnog instruktora
  const filteredSessions = drivingSessions.filter(session => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const instruktorId = currentUser?.id;
    
    // Uvijek filtriramo samo vožnje trenutnog instruktora
    const matchesInstructor = session.instruktor && session.instruktor._id === instruktorId;
    const matchesStatus = filterStatus === "all" || session.status === filterStatus;
    
    return matchesInstructor && matchesStatus;
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#0F111A] via-[#1A1C25] to-[#232634] text-white">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        user={user}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-gradient-to-r from-[#1A1C25] to-[#232634]/80 backdrop-blur-xl border-b border-[#2A2D3A] p-6 shadow-2xl shadow-[#6C63FF]/5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-white via-[#E2E8FF] to-[#B0B3C1] bg-clip-text text-transparent">
                Upravljanje vožnjama
              </h1>
              <p className="text-[#B0B3C1] mt-2 text-sm">
                Kalendar vožnji, statistike i upravljanje terminima
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAddDriving(true)}
                className="bg-[#6C63FF] text-white px-4 py-2 rounded-lg hover:bg-[#5A52D5] transition-all duration-300 shadow-lg shadow-[#6C63FF]/25 hover:shadow-[#6C63FF]/40 font-medium text-sm"
              >
                + Zakazi vožnju
              </button>
              <button
                onClick={() => setShowCancelDay(true)}
                className="bg-[#FF6B35] text-white px-4 py-2 rounded-lg hover:bg-[#E55A2B] transition-all duration-300 font-medium text-sm"
              >
                🏖️ Godišnji odmor
              </button>
              <div className="bg-[#232634]/60 backdrop-blur-lg px-4 py-2 rounded-xl text-[#B0B3C1] border border-[#2A2D3A]">
                <span className="flex items-center space-x-2">
                  <span>📅</span>
                  <span className="text-sm">{new Date().toLocaleDateString('bs-BA')}</span>
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="space-y-6">
            {/* Globalne statistike */}
            <DrivingStats 
              drivingStats={drivingStats} 
            />

            {/* Filteri i View Toggle */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex flex-wrap gap-4">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-[#232634] border border-[#2A2D3A] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#6C63FF] transition-colors duration-300"
                >
                  <option value="all">Svi statusi</option>
                  <option value="zakazana">Zakazane</option>
                  <option value="zavrsena">Završene</option>
                  <option value="otkazana">Otkazane</option>
                </select>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setView("calendar")}
                  className={`px-4 py-2 rounded-lg transition-all duration-300 text-sm font-medium ${
                    view === "calendar" 
                      ? "bg-[#6C63FF] text-white shadow-lg shadow-[#6C63FF]/25" 
                      : "bg-[#232634] text-[#B0B3C1] hover:bg-[#2A2D3A]"
                  }`}
                >
                  📅 Kalendar
                </button>
                <button
                  onClick={() => setView("list")}
                  className={`px-4 py-2 rounded-lg transition-all duration-300 text-sm font-medium ${
                    view === "list" 
                      ? "bg-[#6C63FF] text-white shadow-lg shadow-[#6C63FF]/25" 
                      : "bg-[#232634] text-[#B0B3C1] hover:bg-[#2A2D3A]"
                  }`}
                >
                  📋 Lista
                </button>
              </div>
            </div>

            {/* Kalendar ili Lista */}
            {view === "calendar" ? (
              <DrivingCalendar
                sessions={filteredSessions}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                onSessionSelect={setSelectedSession}
                onEnterResult={(session) => {
                  setSelectedSession(session);
                  setShowEnterResult(true);
                }}
                onCancelSession={handleCancelSession}
              />
            ) : (
              <DrivingList
                sessions={filteredSessions}
                onEnterResult={(session) => {
                  setSelectedSession(session);
                  setShowEnterResult(true);
                }}
                onCancelSession={handleCancelSession}
              />
            )}
          </div>
        </main>
      </div>

      {/* Modali */}
      {showAddDriving && (
        <AddDrivingModal
          open={showAddDriving}
          onClose={() => setShowAddDriving(false)}
          onAddDriving={handleAddDriving}
          candidates={candidates}
          instructors={mockInstructors} // Samo trenutni instruktor
          vehicles={vehicles}
          currentInstructor={mockInstructors[0]} // Trenutni instruktor
        />
      )}

      {showCancelDay && (
        <CancelDayModal
          open={showCancelDay}
          onClose={() => setShowCancelDay(false)}
          onCancelDay={handleCancelDay}
          instructors={mockInstructors} // Samo trenutni instruktor
        />
      )}

      {showEnterResult && selectedSession && (
        <EnterResultModal
          open={showEnterResult}
          onClose={() => {
            setShowEnterResult(false);
            setSelectedSession(null);
          }}
          onEnterResult={handleEnterResult}
          session={selectedSession}
        />
      )}

      {/* Snackbar */}
      {snackbar.open && (
        <div className={`fixed bottom-4 right-4 p-3 rounded-lg border backdrop-blur-sm ${
          snackbar.severity === 'success' 
            ? 'bg-[#27AE60]/20 border-[#27AE60]/30 text-[#27AE60]' 
            : 'bg-[#FF6B35]/20 border-[#FF6B35]/30 text-[#FF6B35]'
        }`}>
          <div className="flex items-center space-x-2">
            <span className="text-sm">{snackbar.message}</span>
            <button 
              onClick={handleCloseSnackbar}
              className="ml-2 hover:opacity-70 transition-opacity"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}