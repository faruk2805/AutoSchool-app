// app/admin/kandidati/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../../components/Sidebar";

export default function KandidatiAdmin() {
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState("kandidati");
  const [isLoading, setIsLoading] = useState(true);
  const [candidates, setCandidates] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedInstructor, setSelectedInstructor] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [hoveredCard, setHoveredCard] = useState(null);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    jmbg: '',
    role: 'candidate'
  });

  // Mock podaci za dodatne kandidate (9 kandidata)
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
        bedzevi: ['Teorija', 'Prva pomoć']
      },
      instruktor: {
        _id: '68ddb01cebb9729427e99c14',
        name: 'Amir',
        surname: 'Hodžić',
        email: 'amir.hodzic@test.com'
      },
      drivingSessions: [],
      recommendations: [],
      documents: {},
      createdAt: '2023-09-22T08:00:00.000Z',
      updatedAt: '2023-11-18T14:20:00.000Z'
    },
    {
      _id: '13eade14dasf654f0b85fe3',
      name: 'Haris',
      surname: 'Hadžić',
      email: 'haris.hadzic@example.com',
      jmbg: '0101995123456',
      role: 'candidate',
      status: {
        teorijaPrvaPomoc: false,
        voznja: {
          brojVoznji: 2,
          ocjene: ['3'],
          zavrsnaVoznja: false
        },
        polozio: {
          teoriju: false,
          prvuPomoc: false,
          voznju: false
        },
        bedzevi: []
      },
      instruktor: null,
      drivingSessions: [],
      recommendations: [],
      documents: {},
      createdAt: '2023-11-10T08:00:00.000Z',
      updatedAt: '2023-11-25T09:15:00.000Z'
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
          brojVoznji: 12,
          ocjene: ['5', '5', '5', '4'],
          zavrsnaVoznja: true
        },
        polozio: {
          teoriju: true,
          prvuPomoc: true,
          voznju: true
        },
        bedzevi: ['Teorija', 'Prva pomoć', 'Vožnja']
      },
      instruktor: {
        _id: '11ddb01cebb9ee9427e99c66',
        name: 'Amir',
        surname: 'Hodžić',
        email: 'amir.hodzic@test.com'
      },
      drivingSessions: [],
      recommendations: [],
      documents: {},
      createdAt: '2023-08-15T08:00:00.000Z',
      updatedAt: '2023-11-28T16:45:00.000Z'
    },
    {
      _id: '33eade9khzdcf654f0b853fg',
      name: 'Kenan',
      surname: 'Kovačević',
      email: 'kenan.kovacevic@example.com',
      jmbg: '0101993123456',
      role: 'candidate',
      status: {
        teorijaPrvaPomoc: true,
        voznja: {
          brojVoznji: 6,
          ocjene: ['4', '4', '5'],
          zavrsnaVoznja: false
        },
        polozio: {
          teoriju: true,
          prvuPomoc: false,
          voznju: false
        },
        bedzevi: ['Teorija']
      },
      instruktor: null,
      drivingSessions: [],
      recommendations: [],
      documents: {},
      createdAt: '2023-10-05T08:00:00.000Z',
      updatedAt: '2023-11-22T11:30:00.000Z'
    },
    {
      _id: '62eade98khedcf654f0b8dsa',
      name: 'Emina',
      surname: 'Smajlović',
      email: 'emina.smajlovic@example.com',
      jmbg: '0101997123456',
      role: 'candidate',
      status: {
        teorijaPrvaPomoc: false,
        voznja: {
          brojVoznji: 0,
          ocjene: [],
          zavrsnaVoznja: false
        },
        polozio: {
          teoriju: false,
          prvuPomoc: false,
          voznju: false
        },
        bedzevi: []
      },
      instruktor: {
        _id: '68ddb01cebb9729427e99c14',
        name: 'Amir',
        surname: 'Hodžić',
        email: 'amir.hodzic@test.com'
      },
      drivingSessions: [],
      recommendations: [],
      documents: {},
      createdAt: '2023-12-01T08:00:00.000Z',
      updatedAt: '2023-12-01T08:00:00.000Z'
    },
    {
      _id: 'ade98dad9edcf654f0b85ge33',
      name: 'Dženan',
      surname: 'Džafić',
      email: 'dzenan.dzafic@example.com',
      jmbg: '0101992123456',
      role: 'candidate',
      status: {
        teorijaPrvaPomoc: true,
        voznja: {
          brojVoznji: 10,
          ocjene: ['5', '4', '5', '4'],
          zavrsnaVoznja: true
        },
        polozio: {
          teoriju: true,
          prvuPomoc: true,
          voznju: false
        },
        bedzevi: ['Teorija', 'Prva pomoć']
      },
      instruktor: null,
      drivingSessions: [],
      recommendations: [],
      documents: {},
      createdAt: '2023-07-20T08:00:00.000Z',
      updatedAt: '2023-11-30T14:20:00.000Z'
    },
    {
      _id: '23eade9ddedcf654f0b8te5d',
      name: 'Amila',
      surname: 'Hasanović',
      email: 'amila.hasanovic@example.com',
      jmbg: '0101999123456',
      role: 'candidate',
      status: {
        teorijaPrvaPomoc: true,
        voznja: {
          brojVoznji: 4,
          ocjene: ['3', '4'],
          zavrsnaVoznja: false
        },
        polozio: {
          teoriju: false,
          prvuPomoc: true,
          voznju: false
        },
        bedzevi: ['Prva pomoć']
      },
      instruktor: {
        _id: '68ddb01cebb9729427e99c14',
        name: 'Amir',
        surname: 'Hodžić',
        email: 'amir.hodzic@test.com'
      },
      drivingSessions: [],
      recommendations: [],
      documents: {},
      createdAt: '2023-11-15T08:00:00.000Z',
      updatedAt: '2023-12-02T10:45:00.000Z'
    },
    {
      _id: '5eade98sedf654f0b85das3',
      name: 'Adnan',
      surname: 'Ademović',
      email: 'adnan.ademovic@example.com',
      jmbg: '0101994123456',
      role: 'candidate',
      status: {
        teorijaPrvaPomoc: true,
        voznja: {
          brojVoznji: 15,
          ocjene: ['5', '5', '5', '5', '4'],
          zavrsnaVoznja: true
        },
        polozio: {
          teoriju: true,
          prvuPomoc: true,
          voznju: true
        },
        bedzevi: ['Teorija', 'Prva pomoć', 'Vožnja', 'Izvrsno']
      },
      instruktor: null,
      drivingSessions: [],
      recommendations: [],
      documents: {},
      createdAt: '2023-06-10T08:00:00.000Z',
      updatedAt: '2023-11-29T16:10:00.000Z'
    },
    {
      _id: '68eadefasdfedcf4f0b85de6',
      name: 'Selma',
      surname: 'Selimović',
      email: 'selma.selimovic@example.com',
      jmbg: '0101996123456',
      role: 'candidate',
      status: {
        teorijaPrvaPomoc: false,
        voznja: {
          brojVoznji: 1,
          ocjene: ['2'],
          zavrsnaVoznja: false
        },
        polozio: {
          teoriju: false,
          prvuPomoc: false,
          voznju: false
        },
        bedzevi: []
      },
      instruktor: {
        _id: '68ddb01cebb9729427e99c14',
        name: 'Amir',
        surname: 'Hodžić',
        email: 'amir.hodzic@test.com'
      },
      drivingSessions: [],
      recommendations: [],
      documents: {},
      createdAt: '2023-12-03T08:00:00.000Z',
      updatedAt: '2023-12-05T09:20:00.000Z'
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
      fetchInstructors();
    }, 1000);
  }, [router]);

  const fetchCandidates = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Dohvaćam kandidate...');
      
      const response = await fetch('http://localhost:5000/api/users/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const allUsers = await response.json();
        console.log('Svi korisnici s API-ja:', allUsers);
        
        // Filtriraj samo kandidate
        const apiCandidates = allUsers.filter(user => user.role === 'candidate');
        console.log('API kandidati:', apiCandidates);
        
        // Kombiniraj API kandidate sa mock kandidatima
        const allCandidates = [...apiCandidates, ...mockCandidates];
        console.log('Svi kandidati (API + mock):', allCandidates);
        
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

  const fetchInstructors = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/users/instruktori', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const apiInstructors = await response.json();
        console.log('API instruktori:', apiInstructors);
        setInstructors(apiInstructors);
      } else {
        throw new Error('API nije dostupan');
      }
    } catch (error) {
      console.error('Error fetching instructors:', error);
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

  const handleOpenDialog = () => {
    setFormData({
      name: '',
      surname: '',
      email: '',
      password: '',
      jmbg: '',
      role: 'candidate'
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddCandidate = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Dodajem kandidata:', formData);
      
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Kandidat dodan:', result);
        setSnackbar({
          open: true,
          message: 'Kandidat uspješno dodan',
          severity: 'success'
        });
        handleCloseDialog();
        fetchCandidates(); // Osvježi listu
      } else {
        const errorData = await response.json();
        console.error('Greška pri dodavanju:', errorData);
        throw new Error(errorData.message || 'Greška pri dodavanju kandidata');
      }
    } catch (error) {
      console.error('Error u handleAddCandidate:', error);
      // Fallback na mock ako API ne radi
      const newCandidate = {
        _id: `mock${Date.now()}`,
        ...formData,
        status: {
          teorijaPrvaPomoc: false,
          voznja: { brojVoznji: 0, ocjene: [], zavrsnaVoznja: false },
          polozio: { teoriju: false, prvuPomoc: false, voznju: false },
          bedzevi: []
        },
        instruktor: null,
        drivingSessions: [],
        recommendations: [],
        documents: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setCandidates(prev => [newCandidate, ...prev]);
      setSnackbar({
        open: true,
        message: 'Kandidat uspješno dodan (offline)',
        severity: 'success'
      });
      handleCloseDialog();
    }
  };

  const handleDeleteCandidate = async (id) => {
    if (window.confirm('Jeste li sigurni da želite obrisati ovog kandidata?')) {
      try {
        // Ako nije mock kandidat, pokušaj brisanje s API-ja
        if (!id.startsWith('mock')) {
          const token = localStorage.getItem('token');
          const response = await fetch(`http://localhost:5000/api/users/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (!response.ok) {
            throw new Error('Greška pri brisanju');
          }
        }

        setCandidates(prev => prev.filter(c => c._id !== id));
        setSnackbar({
          open: true,
          message: 'Kandidat uspješno obrisan',
          severity: 'success'
        });
      } catch (error) {
        console.error('Error deleting candidate:', error);
        // Fallback na lokalno brisanje
        setCandidates(prev => prev.filter(c => c._id !== id));
        setSnackbar({
          open: true,
          message: 'Kandidat uspješno obrisan (offline)',
          severity: 'success'
        });
      }
    }
  };

  const handleOpenAssignDialog = (candidate) => {
    setSelectedCandidate(candidate);
    setSelectedInstructor(candidate.instruktor?._id || '');
    setOpenAssignDialog(true);
  };

  const handleCloseAssignDialog = () => {
    setOpenAssignDialog(false);
    setSelectedCandidate(null);
    setSelectedInstructor('');
  };

  const handleAssignInstructor = async () => {
    if (!selectedCandidate || !selectedInstructor) return;

    try {
      // Ako nije mock kandidat, pokušaj ažuriranje s API-ja
      if (!selectedCandidate._id.startsWith('mock')) {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/users/${selectedCandidate._id}/assign-instructor/${selectedInstructor}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Greška pri dodjeli');
        }
      }

      const updatedCandidates = candidates.map(candidate => {
        if (candidate._id === selectedCandidate._id) {
          const instructor = instructors.find(inst => inst._id === selectedInstructor);
          return {
            ...candidate,
            instruktor: instructor || null
          };
        }
        return candidate;
      });

      setCandidates(updatedCandidates);
      setSnackbar({
        open: true,
        message: 'Instruktor uspješno dodijeljen',
        severity: 'success'
      });
      handleCloseAssignDialog();
    } catch (error) {
      console.error('Error assigning instructor:', error);
      // Fallback na lokalno ažuriranje
      const updatedCandidates = candidates.map(candidate => {
        if (candidate._id === selectedCandidate._id) {
          const instructor = instructors.find(inst => inst._id === selectedInstructor);
          return {
            ...candidate,
            instruktor: instructor || null
          };
        }
        return candidate;
      });

      setCandidates(updatedCandidates);
      setSnackbar({
        open: true,
        message: 'Instruktor uspješno dodijeljen (offline)',
        severity: 'success'
      });
      handleCloseAssignDialog();
    }
  };

  const handleUpdateStatus = async (candidateId, field, value) => {
    try {
      // Ako nije mock kandidat, pokušaj ažuriranje s API-ja
      if (!candidateId.startsWith('mock')) {
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

        if (!response.ok) {
          throw new Error('Greška pri ažuriranju');
        }
      }

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

  // Helper funkcije za siguran pristup podacima
  const getInitials = (name, surname) => {
    if (!name || !surname) return '??';
    return `${name[0] || ''}${surname[0] || ''}`;
  };

  const getInstructorInitials = (instructor) => {
    if (!instructor || !instructor.name) return '??';
    return `${instructor.name[0] || ''}${instructor.surname?.[0] || ''}`;
  };

  const getInstructorName = (candidate, instructors) => {
    if (candidate.instruktor && typeof candidate.instruktor === 'object') {
      return candidate.instruktor;
    }
    
    if (candidate.instruktor && typeof candidate.instruktor === 'string') {
      const instructor = instructors.find(inst => inst._id === candidate.instruktor);
      return instructor || null;
    }
    
    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F111A] via-[#1A1C25] to-[#232634] flex items-center justify-center relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-[#6C63FF]/20 to-[#FF4DA6]/20 rounded-full animate-orbital-1"></div>
          <div className="absolute bottom-1/3 right-1/3 w-48 h-48 bg-gradient-to-r from-[#3D9DF6]/20 to-[#27AE60]/20 rounded-full animate-orbital-2"></div>
          <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-gradient-to-r from-[#FF6B35]/20 to-[#FF4DA6]/20 rounded-full animate-orbital-3"></div>
        </div>

        {/* Main Loading Content */}
        <div className="relative z-10 text-center">
          {/* Animated Logo */}
          <div className="relative mb-8">
            <div className="w-32 h-32 bg-gradient-to-br from-[#6C63FF] to-[#FF4DA6] rounded-3xl flex items-center justify-center mx-auto mb-6 relative overflow-hidden shadow-2xl shadow-[#6C63FF]/40">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-shimmer"></div>
              <span className="text-4xl animate-pulse-slow">👥</span>
            </div>
          </div>

          {/* Animated Text */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-white bg-gradient-to-r from-[#6C63FF] via-[#FF4DA6] to-[#3D9DF6] bg-clip-text text-transparent animate-gradient-text">
              Učitavanje kandidata
            </h1>
            <div className="h-8 flex items-center justify-center">
              <p className="text-[#B0B3C1] text-lg font-light animate-typing overflow-hidden whitespace-nowrap border-r-4 border-r-[#6C63FF] w-0 mx-auto">
                Pripremam listu kandidata...
              </p>
            </div>
          </div>

          {/* Loading Bar */}
          <div className="mt-8 w-64 mx-auto">
            <div className="w-full bg-[#232634] rounded-full h-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#6C63FF] to-[#FF4DA6] rounded-full animate-loading-bar"></div>
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
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-gradient-to-r from-[#1A1C25] to-[#232634]/80 backdrop-blur-xl border-b border-[#2A2D3A] p-8 shadow-2xl shadow-[#6C63FF]/5 animate-slideDown">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white bg-gradient-to-r from-white via-[#E2E8FF] to-[#B0B3C1] bg-clip-text text-transparent">
                Upravljanje kandidatima
              </h1>
              <p className="text-[#B0B3C1] mt-3 text-lg font-light">
                Upravljajte kandidatima, nalozima i pravima pristupa
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="bg-[#232634]/60 backdrop-blur-lg px-6 py-3 rounded-2xl text-[#B0B3C1] border border-[#2A2D3A] shadow-2xl shadow-black/30 hover:shadow-[#6C63FF]/20 hover:border-[#6C63FF]/40 transition-all duration-500 group hover:scale-105">
                <span className="flex items-center space-x-3">
                  <span className="text-xl">📅</span>
                  <span className="font-medium">{new Date().toLocaleDateString('bs-BA')}</span>
                </span>
              </div>
              <button 
                onClick={handleOpenDialog}
                className="bg-gradient-to-r from-[#6C63FF] to-[#FF4DA6] px-6 py-3 rounded-2xl text-white font-semibold shadow-2xl shadow-[#6C63FF]/40 border border-[#6C63FF]/50 hover:scale-105 transition-transform duration-300 animate-pulse-slow flex items-center space-x-3"
              >
                <span className="text-xl">+</span>
                <span>Dodaj Kandidata</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-auto">
          <div className="space-y-8 animate-fadeIn">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                title="Ukupno kandidata" 
                value={candidates.length.toString()} 
                trend={`+${Math.floor(candidates.length * 0.12)}%`}
                icon="👥"
                color="from-[#6C63FF] to-[#FF4DA6]"
                trendColor="text-[#27AE60]"
                description="Aktivni upisani kandidati"
                index={0}
                hoveredCard={hoveredCard}
                onHover={setHoveredCard}
              />
              <StatCard 
                title="Bez instruktora" 
                value={candidates.filter(c => !getInstructorName(c, instructors)).length.toString()} 
                trend="Treba dodijeliti"
                icon="👨‍🏫"
                color="from-[#FF6B35] to-[#FF9D6C]"
                trendColor="text-[#FF6B35]"
                description="Kandidati bez instruktora"
                index={1}
                hoveredCard={hoveredCard}
                onHover={setHoveredCard}
              />
              <StatCard 
                title="Položeno teoriju" 
                value={candidates.filter(c => c.status?.polozio?.teoriju).length.toString()} 
                trend={`${Math.round((candidates.filter(c => c.status?.polozio?.teoriju).length / candidates.length) * 100) || 0}%`}
                icon="📚"
                color="from-[#3D9DF6] to-[#56CCF2]"
                trendColor="text-[#27AE60]"
                description="Uspešno položeni testovi"
                index={2}
                hoveredCard={hoveredCard}
                onHover={setHoveredCard}
              />
              <StatCard 
                title="Položeno vožnju" 
                value={candidates.filter(c => c.status?.polozio?.voznju).length.toString()} 
                trend={`${Math.round((candidates.filter(c => c.status?.polozio?.voznju).length / candidates.length) * 100) || 0}%`}
                icon="🚗"
                color="from-[#27AE60] to-[#6FCF97]"
                trendColor="text-[#27AE60]"
                description="Završeni praktični ispiti"
                index={3}
                hoveredCard={hoveredCard}
                onHover={setHoveredCard}
              />
            </div>

            {/* Candidates Table */}
            <div className="bg-gradient-to-br from-[#1A1C25] to-[#232634] rounded-2xl border border-[#2A2D3A] shadow-2xl shadow-black/20 hover:shadow-[#6C63FF]/10 transition-all duration-500 animate-slideUp">
              <div className="p-6 border-b border-[#2A2D3A]">
                <h3 className="text-xl font-semibold text-white flex items-center space-x-3">
                  <span className="text-2xl animate-pulse">📋</span>
                  <span>Lista kandidata ({candidates.length})</span>
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2A2D3A]">
                      <th className="text-left p-6 text-[#B0B3C1] font-semibold">Kandidat</th>
                      <th className="text-left p-6 text-[#B0B3C1] font-semibold">Kontakt</th>
                      <th className="text-left p-6 text-[#B0B3C1] font-semibold">Instruktor</th>
                      <th className="text-left p-6 text-[#B0B3C1] font-semibold">Status</th>
                      <th className="text-left p-6 text-[#B0B3C1] font-semibold">Datum upisa</th>
                      <th className="text-left p-6 text-[#B0B3C1] font-semibold">Akcije</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.map((candidate, index) => {
                      const instructor = getInstructorName(candidate, instructors);
                      return (
                      <tr 
                        key={candidate._id} 
                        className="border-b border-[#2A2D3A] hover:bg-[#232634]/50 transition-all duration-300 animate-fadeIn"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <td className="p-6">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#6C63FF] to-[#FF4DA6] rounded-2xl flex items-center justify-center text-white font-semibold text-lg">
                              {getInitials(candidate.name, candidate.surname)}
                            </div>
                            <div>
                              <p className="text-white font-semibold">
                                {candidate.name || 'N/A'} {candidate.surname || 'N/A'}
                              </p>
                              <p className="text-[#7A7F96] text-sm">
                                ID: {candidate._id}
                                {candidate._id.startsWith('mock') && (
                                  <span className="ml-2 text-[#FF6B35]">(mock)</span>
                                )}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                          <p className="text-white">{candidate.email || 'N/A'}</p>
                          <p className="text-[#7A7F96] text-sm">JMBG: {candidate.jmbg || 'N/A'}</p>
                        </td>
                        <td className="p-6">
                          {instructor ? (
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-[#3D9DF6] to-[#56CCF2] rounded-full flex items-center justify-center text-white text-xs">
                                {getInstructorInitials(instructor)}
                              </div>
                              <span className="text-white font-medium">
                                {instructor.name || 'N/A'} {instructor.surname || 'N/A'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[#FF6B35] font-medium animate-pulse">Bez instruktora</span>
                          )}
                        </td>
                        <td className="p-6">
                          <div className="flex items-center space-x-2 mb-2">
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
                            Voznje: {getVoznjeCount(candidate)}
                            {candidate.status?.bedzevi && candidate.status.bedzevi.length > 0 && (
                              <span className="ml-2">
                                • {candidate.status.bedzevi.join(', ')}
                              </span>
                            )}
                          </p>
                        </td>
                        <td className="p-6">
                          <p className="text-white">{formatDate(candidate.createdAt)}</p>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleOpenAssignDialog(candidate)}
                              className="w-10 h-10 bg-gradient-to-br from-[#3D9DF6] to-[#56CCF2] rounded-xl flex items-center justify-center text-white hover:scale-110 transition-transform duration-300 shadow-lg shadow-[#3D9DF6]/30"
                              title="Dodijeli instruktora"
                            >
                              👨‍🏫
                            </button>
                            <button
                              onClick={() => handleDeleteCandidate(candidate._id)}
                              className="w-10 h-10 bg-gradient-to-br from-[#FF6B35] to-[#FF9D6C] rounded-xl flex items-center justify-center text-white hover:scale-110 transition-transform duration-300 shadow-lg shadow-[#FF6B35]/30"
                              title="Obriši kandidata"
                            >
                              🗑️
                            </button>
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

      {/* Dijalog za dodavanje novog kandidata */}
      {openDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-gradient-to-br from-[#1A1C25] to-[#232634] rounded-2xl border border-[#2A2D3A] p-8 shadow-2xl shadow-black/40 max-w-md w-full mx-4 animate-popIn">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
              <span className="text-2xl">👤</span>
              <span>Dodaj Novog Kandidata</span>
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    name="name"
                    placeholder="Ime"
                    className="w-full bg-[#232634] border border-[#2A2D3A] rounded-xl px-4 py-3 text-white placeholder-[#7A7F96] focus:outline-none focus:border-[#6C63FF] transition-colors duration-300"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="surname"
                    placeholder="Prezime"
                    className="w-full bg-[#232634] border border-[#2A2D3A] rounded-xl px-4 py-3 text-white placeholder-[#7A7F96] focus:outline-none focus:border-[#6C63FF] transition-colors duration-300"
                    value={formData.surname}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email adresa"
                  className="w-full bg-[#232634] border border-[#2A2D3A] rounded-xl px-4 py-3 text-white placeholder-[#7A7F96] focus:outline-none focus:border-[#6C63FF] transition-colors duration-300"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <input
                  type="password"
                  name="password"
                  placeholder="Lozinka"
                  className="w-full bg-[#232634] border border-[#2A2D3A] rounded-xl px-4 py-3 text-white placeholder-[#7A7F96] focus:outline-none focus:border-[#6C63FF] transition-colors duration-300"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <input
                  type="text"
                  name="jmbg"
                  placeholder="JMBG"
                  className="w-full bg-[#232634] border border-[#2A2D3A] rounded-xl px-4 py-3 text-white placeholder-[#7A7F96] focus:outline-none focus:border-[#6C63FF] transition-colors duration-300"
                  value={formData.jmbg}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="flex space-x-4 mt-8">
              <button
                onClick={handleCloseDialog}
                className="flex-1 bg-[#232634] border border-[#2A2D3A] text-white py-3 rounded-xl hover:border-[#7A7F96] transition-colors duration-300"
              >
                Odustani
              </button>
              <button
                onClick={handleAddCandidate}
                className="flex-1 bg-gradient-to-r from-[#6C63FF] to-[#FF4DA6] text-white py-3 rounded-xl font-semibold shadow-lg shadow-[#6C63FF]/30 hover:scale-105 transition-transform duration-300"
              >
                Dodaj Kandidata
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dijalog za dodjelu instruktora */}
      {openAssignDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-gradient-to-br from-[#1A1C25] to-[#232634] rounded-2xl border border-[#2A2D3A] p-8 shadow-2xl shadow-black/40 max-w-md w-full mx-4 animate-popIn">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
              <span className="text-2xl">👨‍🏫</span>
              <span>Dodjela Instruktora</span>
            </h2>
            
            <p className="text-[#B0B3C1] mb-6">
              Za kandidata: <span className="text-white font-semibold">{selectedCandidate?.name} {selectedCandidate?.surname}</span>
            </p>
            
            <div className="mb-6">
              <select 
                className="w-full bg-[#232634] border border-[#2A2D3A] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#6C63FF] transition-colors duration-300"
                value={selectedInstructor}
                onChange={(e) => setSelectedInstructor(e.target.value)}
              >
                <option value="">Odaberi instruktora</option>
                {instructors.map((instructor) => (
                  <option key={instructor._id} value={instructor._id}>
                    {instructor.name} {instructor.surname}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={handleCloseAssignDialog}
                className="flex-1 bg-[#232634] border border-[#2A2D3A] text-white py-3 rounded-xl hover:border-[#7A7F96] transition-colors duration-300"
              >
                Odustani
              </button>
              <button
                onClick={handleAssignInstructor}
                className="flex-1 bg-gradient-to-r from-[#6C63FF] to-[#FF4DA6] text-white py-3 rounded-xl font-semibold shadow-lg shadow-[#6C63FF]/30 hover:scale-105 transition-transform duration-300"
              >
                Dodijeli Instruktora
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
        isHovered ? 'scale-105 shadow-[#6C63FF]/30 border-[#6C63FF]/50' : 'hover:shadow-[#6C63FF]/20 hover:border-[#6C63FF]/30'
      }`}
      style={{ animationDelay: `${index * 150}ms` }}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-[#B0B3C1] text-sm font-medium mb-2">{title}</p>
          <p className={`text-3xl font-bold transition-all duration-500 ${
            isHovered ? 'bg-gradient-to-r from-[#6C63FF] to-[#FF4DA6] bg-clip-text text-transparent' : 'text-white'
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
          : 'bg-[#232634] border border-[#2A2D3A] text-[#7A7F96] hover:border-[#6C63FF]'
      }`}
    >
      {label}
    </button>
  );
}