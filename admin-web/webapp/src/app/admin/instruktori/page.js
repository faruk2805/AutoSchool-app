// app/admin/instruktori/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../../components/Sidebar";

export default function InstruktoriAdmin() {
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState("instruktori");
  const [isLoading, setIsLoading] = useState(true);
  const [instructors, setInstructors] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openAssignVehicleDialog, setOpenAssignVehicleDialog] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [hoveredCard, setHoveredCard] = useState(null);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    jmbg: '',
    licenseNumber: '',
    role: 'instruktor'
  });

  // Podaci za instruktore (6 instruktora)
  const additionalInstructors = [
    {
      _id: '68ddb01cebb9729427e99c15',
      name: 'Lejla',
      surname: 'Hasanović',
      email: 'lejla.hasanovic@autoskola.com',
      jmbg: '2001985123456',
      licenseNumber: 'BIH-67890',
      role: 'instruktor',
      assignedVehicle: {
        _id: 'veh2',
        make: 'Škoda',
        model: 'Octavia',
        plate: 'A789-C-123',
        year: 2021,
        currentOdometer: 28760
      },
      status: 'active',
      createdAt: '2023-03-10T08:00:00.000Z',
      updatedAt: '2023-11-25T09:15:00.000Z'
    },
    {
      _id: '68ddb01cebb9729427e99c16',
      name: 'Adnan',
      surname: 'Kovačević',
      email: 'adnan.kovacevic@autoskola.com',
      jmbg: '1001983123456',
      licenseNumber: 'BIH-54321',
      role: 'instruktor',
      assignedVehicle: {
        _id: 'veh3',
        make: 'Renault',
        model: 'Clio',
        plate: 'A456-D-789',
        year: 2019,
        currentOdometer: 45230
      },
      status: 'active',
      createdAt: '2023-02-20T08:00:00.000Z',
      updatedAt: '2023-11-28T16:45:00.000Z'
    },
    {
      _id: '68ddb01cebb9729427e99c17',
      name: 'Maja',
      surname: 'Petrović',
      email: 'maja.petrovic@autoskola.com',
      jmbg: '2501990123456',
      licenseNumber: 'BIH-98765',
      role: 'instruktor',
      assignedVehicle: {
        _id: 'veh4',
        make: 'Ford',
        model: 'Focus',
        plate: 'E123-F-456',
        year: 2022,
        currentOdometer: 15680
      },
      status: 'active',
      createdAt: '2023-04-05T08:00:00.000Z',
      updatedAt: '2023-11-30T11:20:00.000Z'
    },
    {
      _id: '68ddb01cebb9729427e99c18',
      name: 'Dario',
      surname: 'Horvat',
      email: 'dario.horvat@autoskola.com',
      jmbg: '1501992123456',
      licenseNumber: 'BIH-24680',
      role: 'instruktor',
      assignedVehicle: {
        _id: 'veh5',
        make: 'Opel',
        model: 'Astra',
        plate: 'G789-H-012',
        year: 2020,
        currentOdometer: 34210
      },
      status: 'active',
      createdAt: '2023-05-12T08:00:00.000Z',
      updatedAt: '2023-12-01T14:15:00.000Z'
    },
    {
      _id: '68ddb01cebb9729427e99c19',
      name: 'Amra',
      surname: 'Delić',
      email: 'amra.delic@autoskola.com',
      jmbg: '0801995123456',
      licenseNumber: 'BIH-13579',
      role: 'instruktor',
      assignedVehicle: {
        _id: 'veh6',
        make: 'Toyota',
        model: 'Yaris',
        plate: 'I345-J-678',
        year: 2021,
        currentOdometer: 18900
      },
      status: 'active',
      createdAt: '2023-06-15T08:00:00.000Z',
      updatedAt: '2023-11-10T11:20:00.000Z'
    },
    {
      _id: '68ddb01cebb9729427e99c1a',
      name: 'Kenan',
      surname: 'Karišik',
      email: 'kenan.karisik@autoskola.com',
      jmbg: '1201988123456',
      licenseNumber: 'BIH-86420',
      role: 'instruktor',
      assignedVehicle: {
        _id: 'veh7',
        make: 'Hyundai',
        model: 'i30',
        plate: 'K901-L-234',
        year: 2023,
        currentOdometer: 5600
      },
      status: 'active',
      createdAt: '2023-07-20T08:00:00.000Z',
      updatedAt: '2023-12-02T09:45:00.000Z'
    }
  ];

  // Podaci za dodatna vozila
  const additionalVehicles = [
    {
      _id: 'veh8',
      make: 'Volkswagen',
      model: 'Golf',
      year: 2022,
      plate: 'M567-N-890',
      color: 'Plava',
      fuelType: 'dizel',
      transmission: 'manuelni',
      status: 'available',
      currentOdometer: 12400,
      instructor: null,
      createdAt: '2023-08-10T08:00:00.000Z',
      updatedAt: '2023-12-03T10:30:00.000Z'
    },
    {
      _id: 'veh9',
      make: 'Peugeot',
      model: '208',
      year: 2023,
      plate: 'O123-P-456',
      color: 'Crvena',
      fuelType: 'benzin',
      transmission: 'automatski',
      status: 'available',
      currentOdometer: 3200,
      instructor: null,
      createdAt: '2023-09-05T08:00:00.000Z',
      updatedAt: '2023-12-04T14:20:00.000Z'
    }
  ];

  // Podaci za kandidate (veći broj za veću auto školu)
  const additionalCandidates = [
    { instruktor: '68ddb01cebb9729427e99c14' },
    { instruktor: '68ddb01cebb9729427e99c14' },
    { instruktor: '68ddb01cebb9729427e99c14' },
    { instruktor: '68ddb01cebb9729427e99c15' },
    { instruktor: '68ddb01cebb9729427e99c15' },
    { instruktor: '68ddb01cebb9729427e99c15' },
    { instruktor: '68ddb01cebb9729427e99c16' },
    { instruktor: '68ddb01cebb9729427e99c16' },
    { instruktor: '68ddb01cebb9729427e99c17' },
    { instruktor: '68ddb01cebb9729427e99c17' },
    { instruktor: '68ddb01cebb9729427e99c17' },
    { instruktor: '68ddb01cebb9729427e99c18' },
    { instruktor: '68ddb01cebb9729427e99c18' },
    { instruktor: '68ddb01cebb9729427e99c19' },
    { instruktor: '68ddb01cebb9729427e99c19' },
    { instruktor: '68ddb01cebb9729427e99c19' },
    { instruktor: '68ddb01cebb9729427e99c1a' },
    { instruktor: '68ddb01cebb9729427e99c1a' },
    { instruktor: '6717f0c8b1a2de43f63f0c12' },
    { instruktor: '6717f0c8b1a2de43f63f0c12' },
    { instruktor: '6717f0c8b1a2de43f63f0c12' },
    { instruktor: '6717f0cd98b7ef46d1f0e3a2' },
    { instruktor: '6717f0cd98b7ef46d1f0e3a2' },
    { instruktor: '6717f0cd98b7ef46d1f0e3a2' },
    { instruktor: '6717f0cd98b7ef46d1f0e3a2' }
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
      fetchInstructors();
      fetchVehicles();
      fetchCandidates();
    }, 1000);
  }, [router]);

  const fetchInstructors = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Dohvaćam instruktore...');
      
      const response = await fetch('http://localhost:5000/api/users/instruktori', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const apiInstructors = await response.json();
        console.log('API instruktori:', apiInstructors);
        
        // Ovdje ćemo kasnije popuniti assignedVehicle za svakog instruktora
        const instructorsWithVehicles = await Promise.all(
          apiInstructors.map(async (instructor) => {
            try {
              const vehicleResponse = await fetch(`http://localhost:5000/api/vehicles?instructor=${instructor._id}`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });
              
              if (vehicleResponse.ok) {
                const instructorVehicles = await vehicleResponse.json();
                return {
                  ...instructor,
                  assignedVehicle: instructorVehicles.length > 0 ? instructorVehicles[0] : null
                };
              }
              return { ...instructor, assignedVehicle: null };
            } catch (error) {
              console.error(`Error fetching vehicle for instructor ${instructor._id}:`, error);
              return { ...instructor, assignedVehicle: null };
            }
          })
        );
        
        // Kombiniraj API instruktore sa dodatnim instruktorima
        const allInstructors = [...instructorsWithVehicles, ...additionalInstructors];
        console.log('Svi instruktori (API + dodatni):', allInstructors);
        
        setInstructors(allInstructors);
      } else {
        throw new Error('API nije dostupan');
      }
    } catch (error) {
      console.error('Error fetching instructors:', error);
      setInstructors([]);
    }
  };

  const fetchVehicles = async () => {
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
        console.log('API vozila:', apiVehicles);
        
        // Kombiniraj API vozila sa dodatnim vozilima
        const allVehicles = [...apiVehicles, ...additionalVehicles];
        setVehicles(allVehicles);
      } else {
        throw new Error('API nije dostupan');
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setVehicles([]);
    }
  };

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
        
        // Kombiniraj API kandidate sa dodatnim kandidatima
        const allCandidates = [...apiCandidates, ...additionalCandidates];
        setCandidates(allCandidates);
      } else {
        throw new Error('API nije dostupan');
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
      setCandidates([]);
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
      licenseNumber: '',
      role: 'instruktor'
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleOpenAssignVehicleDialog = (instructor) => {
    setSelectedInstructor(instructor);
    setSelectedVehicle(instructor.assignedVehicle?._id || '');
    setOpenAssignVehicleDialog(true);
  };

  const handleCloseAssignVehicleDialog = () => {
    setOpenAssignVehicleDialog(false);
    setSelectedInstructor(null);
    setSelectedVehicle('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddInstructor = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Dodajem instruktora:', formData);
      
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
        console.log('Instruktor dodan:', result);
        setSnackbar({
          open: true,
          message: 'Instruktor uspješno dodan',
          severity: 'success'
        });
        handleCloseDialog();
        fetchInstructors();
      } else {
        const errorData = await response.json();
        console.error('Greška pri dodavanju:', errorData);
        throw new Error(errorData.message || 'Greška pri dodavanju instruktora');
      }
    } catch (error) {
      console.error('Error u handleAddInstructor:', error);
      setSnackbar({
        open: true,
        message: 'Greška pri dodavanju instruktora',
        severity: 'error'
      });
    }
  };

  const handleAssignVehicle = async () => {
    if (!selectedInstructor || !selectedVehicle) return;

    try {
      const token = localStorage.getItem('token');
      
      // Ažuriraj vozilo da pokazuje na instruktora
      const response = await fetch(`http://localhost:5000/api/vehicles/${selectedVehicle}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          instructor: selectedInstructor._id
        })
      });

      if (response.ok) {
        const updatedVehicle = await response.json();
        
        // Ažuriraj lokalno stanje instruktora
        const updatedInstructors = instructors.map(instructor => {
          if (instructor._id === selectedInstructor._id) {
            return {
              ...instructor,
              assignedVehicle: updatedVehicle
            };
          }
          // Ukloni vozilo iz prethodnog instruktora ako je bilo dodijeljeno
          if (instructor.assignedVehicle && instructor.assignedVehicle._id === selectedVehicle) {
            return {
              ...instructor,
              assignedVehicle: null
            };
          }
          return instructor;
        });

        setInstructors(updatedInstructors);
        setSnackbar({
          open: true,
          message: 'Vozilo uspješno dodijeljeno',
          severity: 'success'
        });
        handleCloseAssignVehicleDialog();
      } else {
        throw new Error('Greška pri dodjeli vozila');
      }
    } catch (error) {
      console.error('Error assigning vehicle:', error);
      setSnackbar({
        open: true,
        message: 'Greška pri dodjeli vozila',
        severity: 'error'
      });
    }
  };

  const handleRemoveVehicle = async (instructorId) => {
    if (!window.confirm('Jeste li sigurni da želite ukloniti vozilo ovom instruktoru?')) {
      return;
    }

    try {
      const instructor = instructors.find(inst => inst._id === instructorId);
      if (!instructor?.assignedVehicle) return;

      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/vehicles/${instructor.assignedVehicle._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          instructor: null
        })
      });

      if (response.ok) {
        // Ažuriraj lokalno stanje
        const updatedInstructors = instructors.map(inst => 
          inst._id === instructorId ? { ...inst, assignedVehicle: null } : inst
        );
        setInstructors(updatedInstructors);
        setSnackbar({
          open: true,
          message: 'Vozilo uspješno uklonjeno',
          severity: 'success'
        });
      } else {
        throw new Error('Greška pri uklanjanju vozila');
      }
    } catch (error) {
      console.error('Error removing vehicle:', error);
      setSnackbar({
        open: true,
        message: 'Greška pri uklanjanju vozila',
        severity: 'error'
      });
    }
  };

  const handleDeleteInstructor = async (id) => {
    if (window.confirm('Jeste li sigurni da želite obrisati ovog instruktora?')) {
      try {
        // Ako nije dodatni instruktor, pokušaj brisanje s API-ja
        if (!additionalInstructors.find(inst => inst._id === id)) {
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

        setInstructors(prev => prev.filter(i => i._id !== id));
        setSnackbar({
          open: true,
          message: 'Instruktor uspješno obrisan',
          severity: 'success'
        });
      } catch (error) {
        console.error('Error deleting instructor:', error);
        setSnackbar({
          open: true,
          message: 'Greška pri brisanju instruktora',
          severity: 'error'
        });
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('bs-BA');
  };

  // Helper funkcije
  const getInitials = (name, surname) => {
    if (!name || !surname) return '??';
    return `${name[0] || ''}${surname[0] || ''}`;
  };

  const getAssignedCandidatesCount = (instructorId) => {
    return candidates.filter(candidate => 
      candidate.instruktor && 
      (candidate.instruktor._id === instructorId || candidate.instruktor === instructorId)
    ).length;
  };

  const getAvailableVehicles = () => {
    return vehicles.filter(vehicle => !vehicle.instructor);
  };

  // Ažurirane statistike
  const stats = {
    totalInstructors: instructors.length,
    availableVehicles: getAvailableVehicles().length,
    averageCandidates: instructors.length > 0 ? Math.round(candidates.length / instructors.length) : 0,
    totalDrivingSessions: 347 // Veći broj za veću auto školu
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
            <div className="w-32 h-32 bg-gradient-to-br from-[#3D9DF6] to-[#27AE60] rounded-3xl flex items-center justify-center mx-auto mb-6 relative overflow-hidden shadow-2xl shadow-[#3D9DF6]/40">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-shimmer"></div>
              <span className="text-4xl animate-pulse-slow">👨‍🏫</span>
            </div>
          </div>

          {/* Animated Text */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-white bg-gradient-to-r from-[#3D9DF6] via-[#27AE60] to-[#6C63FF] bg-clip-text text-transparent animate-gradient-text">
              Učitavanje instruktora
            </h1>
            <div className="h-8 flex items-center justify-center">
              <p className="text-[#B0B3C1] text-lg font-light animate-typing overflow-hidden whitespace-nowrap border-r-4 border-r-[#3D9DF6] w-0 mx-auto">
                Pripremam listu instruktora...
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
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-gradient-to-r from-[#1A1C25] to-[#232634]/80 backdrop-blur-xl border-b border-[#2A2D3A] p-8 shadow-2xl shadow-[#3D9DF6]/5 animate-slideDown">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white bg-gradient-to-r from-white via-[#E2E8FF] to-[#B0B3C1] bg-clip-text text-transparent">
                Upravljanje instruktorima
              </h1>
              <p className="text-[#B0B3C1] mt-3 text-lg font-light">
                Upravljajte instruktorima, vozilima i dodjelom resursa
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="bg-[#232634]/60 backdrop-blur-lg px-6 py-3 rounded-2xl text-[#B0B3C1] border border-[#2A2D3A] shadow-2xl shadow-black/30 hover:shadow-[#3D9DF6]/20 hover:border-[#3D9DF6]/40 transition-all duration-500 group hover:scale-105">
                <span className="flex items-center space-x-3">
                  <span className="text-xl">📅</span>
                  <span className="font-medium">{new Date().toLocaleDateString('bs-BA')}</span>
                </span>
              </div>
              <button 
                onClick={handleOpenDialog}
                className="bg-gradient-to-r from-[#3D9DF6] to-[#56CCF2] px-6 py-3 rounded-2xl text-white font-semibold shadow-2xl shadow-[#3D9DF6]/40 border border-[#3D9DF6]/50 hover:scale-105 transition-transform duration-300 animate-pulse-slow flex items-center space-x-3"
              >
                <span className="text-xl">+</span>
                <span>Dodaj Instruktora</span>
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
                title="Ukupno instruktora" 
                value={stats.totalInstructors.toString()} 
                trend={`+${Math.floor(stats.totalInstructors * 0.12)}%`}
                icon="👨‍🏫"
                color="from-[#3D9DF6] to-[#56CCF2]"
                trendColor="text-[#27AE60]"
                description="Aktivni instruktori"
                index={0}
                hoveredCard={hoveredCard}
                onHover={setHoveredCard}
              />
              <StatCard 
                title="Dostupna vozila" 
                value={stats.availableVehicles.toString()} 
                trend="Slobodna"
                icon="🚗"
                color="from-[#27AE60] to-[#6FCF97]"
                trendColor="text-[#27AE60]"
                description="Vozila bez instruktora"
                index={1}
                hoveredCard={hoveredCard}
                onHover={setHoveredCard}
              />
              <StatCard 
                title="Prosječno kandidata" 
                value={stats.averageCandidates.toString()} 
                trend="Po instruktoru"
                icon="👥"
                color="from-[#6C63FF] to-[#FF4DA6]"
                trendColor="text-[#3D9DF6]"
                description="Prosječan broj kandidata"
                index={2}
                hoveredCard={hoveredCard}
                onHover={setHoveredCard}
              />
              <StatCard 
                title="Ukupno vožnji" 
                value={stats.totalDrivingSessions.toString()} 
                trend="Ovaj mjesec"
                icon="⏱️"
                color="from-[#FF6B35] to-[#FF9D6C]"
                trendColor="text-[#FF6B35]"
                description="Zakazane vožnje"
                index={3}
                hoveredCard={hoveredCard}
                onHover={setHoveredCard}
              />
            </div>

            {/* Instructors Table */}
            <div className="bg-gradient-to-br from-[#1A1C25] to-[#232634] rounded-2xl border border-[#2A2D3A] shadow-2xl shadow-black/20 hover:shadow-[#3D9DF6]/10 transition-all duration-500 animate-slideUp">
              <div className="p-6 border-b border-[#2A2D3A]">
                <h3 className="text-xl font-semibold text-white flex items-center space-x-3">
                  <span className="text-2xl animate-pulse">👨‍🏫</span>
                  <span>Lista instruktora ({instructors.length})</span>
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2A2D3A]">
                      <th className="text-left p-6 text-[#B0B3C1] font-semibold">Instruktor</th>
                      <th className="text-left p-6 text-[#B0B3C1] font-semibold">Kontakt & Licenca</th>
                      <th className="text-left p-6 text-[#B0B3C1] font-semibold">Dodijeljeno vozilo</th>
                      <th className="text-left p-6 text-[#B0B3C1] font-semibold">Statistika</th>
                      <th className="text-left p-6 text-[#B0B3C1] font-semibold">Datum upisa</th>
                      <th className="text-left p-6 text-[#B0B3C1] font-semibold">Akcije</th>
                    </tr>
                  </thead>
                  <tbody>
                    {instructors.map((instructor, index) => (
                      <tr 
                        key={instructor._id} 
                        className="border-b border-[#2A2D3A] hover:bg-[#232634]/50 transition-all duration-300 animate-fadeIn"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <td className="p-6">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#3D9DF6] to-[#56CCF2] rounded-2xl flex items-center justify-center text-white font-semibold text-lg">
                              {getInitials(instructor.name, instructor.surname)}
                            </div>
                            <div>
                              <p className="text-white font-semibold">
                                {instructor.name || 'N/A'} {instructor.surname || 'N/A'}
                              </p>
                              <p className="text-[#7A7F96] text-sm">
                                ID: {instructor._id}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                          <p className="text-white">{instructor.email || 'N/A'}</p>
                          <p className="text-[#7A7F96] text-sm">
                            JMBG: {instructor.jmbg || 'N/A'} • Licenca: {instructor.licenseNumber || 'N/A'}
                          </p>
                        </td>
                        <td className="p-6">
                          {instructor.assignedVehicle ? (
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-[#27AE60] to-[#6FCF97] rounded-full flex items-center justify-center text-white text-xs">
                                🚗
                              </div>
                              <div>
                                <span className="text-white font-medium">
                                  {instructor.assignedVehicle.make} {instructor.assignedVehicle.model}
                                </span>
                                <p className="text-[#7A7F96] text-sm">
                                  {instructor.assignedVehicle.plate} • {instructor.assignedVehicle.year}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-[#FF6B35] font-medium">Bez vozila</span>
                          )}
                        </td>
                        <td className="p-6">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-4 text-sm">
                              <span className="text-[#B0B3C1]">Kandidati:</span>
                              <span className="text-white font-semibold">
                                {getAssignedCandidatesCount(instructor._id)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-4 text-sm">
                              <span className="text-[#B0B3C1]">Kilometraža:</span>
                              <span className="text-white font-semibold">
                                {instructor.assignedVehicle?.currentOdometer?.toLocaleString('bs-BA') || '0'} km
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                          <p className="text-white">{formatDate(instructor.createdAt)}</p>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleOpenAssignVehicleDialog(instructor)}
                              className="w-10 h-10 bg-gradient-to-br from-[#27AE60] to-[#6FCF97] rounded-xl flex items-center justify-center text-white hover:scale-110 transition-transform duration-300 shadow-lg shadow-[#27AE60]/30"
                              title="Dodijeli vozilo"
                            >
                              🚗
                            </button>
                            {instructor.assignedVehicle && (
                              <button
                                onClick={() => handleRemoveVehicle(instructor._id)}
                                className="w-10 h-10 bg-gradient-to-br from-[#FF6B35] to-[#FF9D6C] rounded-xl flex items-center justify-center text-white hover:scale-110 transition-transform duration-300 shadow-lg shadow-[#FF6B35]/30"
                                title="Ukloni vozilo"
                              >
                                🚫
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteInstructor(instructor._id)}
                              className="w-10 h-10 bg-gradient-to-br from-[#FF6B35] to-[#FF9D6C] rounded-xl flex items-center justify-center text-white hover:scale-110 transition-transform duration-300 shadow-lg shadow-[#FF6B35]/30"
                              title="Obriši instruktora"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Dijalog za dodavanje novog instruktora */}
      {openDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-gradient-to-br from-[#1A1C25] to-[#232634] rounded-2xl border border-[#2A2D3A] p-8 shadow-2xl shadow-black/40 max-w-md w-full mx-4 animate-popIn">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
              <span className="text-2xl">👨‍🏫</span>
              <span>Dodaj Novog Instruktora</span>
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    name="name"
                    placeholder="Ime"
                    className="w-full bg-[#232634] border border-[#2A2D3A] rounded-xl px-4 py-3 text-white placeholder-[#7A7F96] focus:outline-none focus:border-[#3D9DF6] transition-colors duration-300"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="surname"
                    placeholder="Prezime"
                    className="w-full bg-[#232634] border border-[#2A2D3A] rounded-xl px-4 py-3 text-white placeholder-[#7A7F96] focus:outline-none focus:border-[#3D9DF6] transition-colors duration-300"
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
                  className="w-full bg-[#232634] border border-[#2A2D3A] rounded-xl px-4 py-3 text-white placeholder-[#7A7F96] focus:outline-none focus:border-[#3D9DF6] transition-colors duration-300"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <input
                  type="password"
                  name="password"
                  placeholder="Lozinka"
                  className="w-full bg-[#232634] border border-[#2A2D3A] rounded-xl px-4 py-3 text-white placeholder-[#7A7F96] focus:outline-none focus:border-[#3D9DF6] transition-colors duration-300"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    name="jmbg"
                    placeholder="JMBG"
                    className="w-full bg-[#232634] border border-[#2A2D3A] rounded-xl px-4 py-3 text-white placeholder-[#7A7F96] focus:outline-none focus:border-[#3D9DF6] transition-colors duration-300"
                    value={formData.jmbg}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="licenseNumber"
                    placeholder="Broj licence"
                    className="w-full bg-[#232634] border border-[#2A2D3A] rounded-xl px-4 py-3 text-white placeholder-[#7A7F96] focus:outline-none focus:border-[#3D9DF6] transition-colors duration-300"
                    value={formData.licenseNumber}
                    onChange={handleInputChange}
                  />
                </div>
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
                onClick={handleAddInstructor}
                className="flex-1 bg-gradient-to-r from-[#3D9DF6] to-[#56CCF2] text-white py-3 rounded-xl font-semibold shadow-lg shadow-[#3D9DF6]/30 hover:scale-105 transition-transform duration-300"
              >
                Dodaj Instruktora
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dijalog za dodjelu vozila */}
      {openAssignVehicleDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-gradient-to-br from-[#1A1C25] to-[#232634] rounded-2xl border border-[#2A2D3A] p-8 shadow-2xl shadow-black/40 max-w-md w-full mx-4 animate-popIn">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
              <span className="text-2xl">🚗</span>
              <span>Dodjela Vozila</span>
            </h2>
            
            <p className="text-[#B0B3C1] mb-6">
              Za instruktora: <span className="text-white font-semibold">{selectedInstructor?.name} {selectedInstructor?.surname}</span>
            </p>
            
            <div className="mb-6">
              <select 
                className="w-full bg-[#232634] border border-[#2A2D3A] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#27AE60] transition-colors duration-300"
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
              >
                <option value="">Odaberi vozilo</option>
                {getAvailableVehicles().map((vehicle) => (
                  <option key={vehicle._id} value={vehicle._id}>
                    {vehicle.make} {vehicle.model} - {vehicle.plate}
                  </option>
                ))}
              </select>
              {getAvailableVehicles().length === 0 && (
                <p className="text-[#FF6B35] text-sm mt-2">
                  Nema dostupnih vozila. Sva vozila su već dodijeljena.
                </p>
              )}
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={handleCloseAssignVehicleDialog}
                className="flex-1 bg-[#232634] border border-[#2A2D3A] text-white py-3 rounded-xl hover:border-[#7A7F96] transition-colors duration-300"
              >
                Odustani
              </button>
              <button
                onClick={handleAssignVehicle}
                disabled={!selectedVehicle}
                className={`flex-1 py-3 rounded-xl font-semibold shadow-lg transition-transform duration-300 ${
                  selectedVehicle 
                    ? 'bg-gradient-to-r from-[#27AE60] to-[#6FCF97] text-white hover:scale-105 shadow-[#27AE60]/30' 
                    : 'bg-[#2A2D3A] text-[#7A7F96] cursor-not-allowed'
                }`}
              >
                Dodijeli Vozilo
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