"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../../components/Sidebar2";
import VehicleStats from "./components/VehicleStats";
import VehiclesList from "./components/VehiclesList";
import VehicleDetails from "./components/VehicleDetails";
import ServiceHistory from "./components/ServiceHistory";
import DailyMileage from "./components/DailyMileage";
import LoadingScreen from "./components/LoadingScreen";

export default function VozilaInstruktor() {
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState("vozila");
  const [isLoading, setIsLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [serviceHistory, setServiceHistory] = useState([]);
  const [dailyMileage, setDailyMileage] = useState([]);
  const [activeTab, setActiveTab] = useState("details");
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [hoveredCard, setHoveredCard] = useState(null);
  const router = useRouter();

  // Mock podaci za servisnu historiju
  const mockServiceHistory = [
    // Volkswagen Golf servisi
    {
      _id: 'mock_service_1',
      vehicle: 'vehicle_1',
      type: 'redovni servis',
      description: 'Veliki servis - zamjena ulja, filtera zraka, filtera goriva, kontrola kočnica i ovjesa',
      mileage: 15000,
      cost: 450,
      date: '2024-02-15T08:00:00.000Z',
      nextServiceMileage: 30000,
      createdAt: '2024-02-15T08:00:00.000Z'
    },
    {
      _id: 'mock_service_2',
      vehicle: 'vehicle_1',
      type: 'zamjena guma',
      description: 'Zamjena ljetnih sa zimskim gumama Continental WinterContact',
      mileage: 14800,
      cost: 120,
      date: '2023-11-10T08:00:00.000Z',
      nextServiceMileage: null,
      createdAt: '2023-11-10T08:00:00.000Z'
    },
    // Audi servisi
    {
      _id: 'mock_service_3',
      vehicle: 'vehicle_2',
      type: 'veliki servis',
      description: 'Kompletan servis - ulje, filteri, kočione pločice, diskovi, klima servis',
      mileage: 65000,
      cost: 890,
      date: '2024-03-18T08:00:00.000Z',
      nextServiceMileage: 85000,
      createdAt: '2024-03-18T08:00:00.000Z'
    }
  ];

  // Mock podaci za dnevnu kilometražu
  const mockDailyMileage = [
    // Volkswagen Golf kilometraža
    {
      _id: 'mock_mileage_1',
      vehicle: 'vehicle_1',
      date: '2024-03-20T08:00:00.000Z',
      startOdometer: 15500,
      endOdometer: 15680,
      distance: 180,
      enteredBy: {
        _id: '68ddb01cebb9729427e99c14',
        name: 'Amir',
        surname: 'Hodžić'
      },
      notes: 'Vožnje po gradu sa polaznicima - centar, Ilidža, Otoka',
      createdAt: '2024-03-20T18:30:00.000Z'
    },
    {
      _id: 'mock_mileage_2',
      vehicle: 'vehicle_1',
      date: '2024-03-19T08:00:00.000Z',
      startOdometer: 15320,
      endOdometer: 15500,
      distance: 180,
      enteredBy: {
        _id: '68ddb01cebb9729427e99c14',
        name: 'Amir',
        surname: 'Hodžić'
      },
      notes: 'Vježbe na otvorenom putu - autoput ka Zenici',
      createdAt: '2024-03-19T17:45:00.000Z'
    },
    // Audi kilometraža
    {
      _id: 'mock_mileage_3',
      vehicle: 'vehicle_2',
      date: '2024-03-17T08:00:00.000Z',
      startOdometer: 67700,
      endOdometer: 67890,
      distance: 190,
      enteredBy: {
        _id: '68ddb01cebb9729427e99c14',
        name: 'Amir',
        surname: 'Hodžić'
      },
      notes: 'Zadnja vožnja prije servisa - testiranje kočnica',
      createdAt: '2024-03-17T16:15:00.000Z'
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
      fetchVehicles();
    }, 1000);
  }, [router]);

  const fetchVehicles = async () => {
  try {
    const token = localStorage.getItem('token');
    const currentUser = JSON.parse(localStorage.getItem('user'));
    
    // KORISTI currentUser.id UMJESTO currentUser._id
    const instruktorId = currentUser?.id;
    
    console.log("🔐 Token:", token ? "Postoji" : "Nema tokena");
    console.log("👤 Trenutni korisnik:", currentUser);
    console.log("🆔 Instruktor ID:", instruktorId);
    console.log("📋 Dostupni ključevi u user objektu:", Object.keys(currentUser));
    
    const response = await fetch('http://localhost:5000/api/vehicles', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log("📡 API Response status:", response.status);
    console.log("📡 API Response ok:", response.ok);
    
    if (response.ok) {
      const apiVehicles = await response.json();
      console.log('✅ API vozila (SVA VOZILA):', apiVehicles);
      console.log('📊 Broj vozila iz API-ja:', apiVehicles.length);
      
      // Loguj svako vozilo detaljno
      apiVehicles.forEach((vehicle, index) => {
        console.log(`🚗 Vozilo ${index + 1}:`, {
          id: vehicle._id,
          marka: vehicle.make,
          model: vehicle.model,
          tablice: vehicle.plate,
          instruktor: vehicle.instructor,
          instruktorId: vehicle.instructor?._id,
          trenutniInstruktorId: instruktorId,
          match: vehicle.instructor?._id === instruktorId
        });
      });
      
      // Filtriranje vozila - samo ona koja pripadaju instruktoru
      const filteredVehicles = apiVehicles.filter(vehicle => {
        const matches = vehicle.instructor && vehicle.instructor._id === instruktorId;
        console.log(`🔍 Vozilo ${vehicle.plate} match:`, matches, 
          `(vehicle.instructor._id: ${vehicle.instructor?._id}, instruktorId: ${instruktorId})`);
        return matches;
      });
      
      console.log('🎯 Filtrirana vozila instruktora:', filteredVehicles);
      console.log('📈 Broj filtriranih vozila:', filteredVehicles.length);
      
      setVehicles(filteredVehicles);
    } else {
      console.error('❌ API Error - Status:', response.status);
      const errorText = await response.text();
      console.error('❌ API Error - Body:', errorText);
      throw new Error('API nije dostupan');
    }
  } catch (error) {
    console.error('❌ Error fetching vehicles:', error);
    console.error('❌ Error details:', error.message);
    setVehicles([]);
  }
};

  const fetchVehicleDetails = async (vehicleId) => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch vehicle details
      const vehicleResponse = await fetch(`http://localhost:5000/api/vehicles/${vehicleId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (vehicleResponse.ok) {
        const vehicleData = await vehicleResponse.json();
        console.log('✅ Detalji vozila:', vehicleData);
        setSelectedVehicle(vehicleData);
        
        // Fetch service history
        await fetchServiceHistory(vehicleId);
        
        // Fetch daily mileage
        await fetchDailyMileage(vehicleId);
      } else {
        throw new Error('API nije dostupan');
      }
    } catch (error) {
      console.error('Error fetching vehicle details:', error);
      // Fallback na mock podatke
      const mockVehicle = vehicles.find(v => v._id === vehicleId);
      setSelectedVehicle(mockVehicle);
      
      const mockServices = mockServiceHistory.filter(s => s.vehicle === vehicleId);
      setServiceHistory(mockServices);
      
      const mockMileage = mockDailyMileage.filter(m => m.vehicle === vehicleId);
      setDailyMileage(mockMileage);
    }
  };

  const fetchServiceHistory = async (vehicleId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/vehicles/${vehicleId}/service`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const serviceData = await response.json();
        console.log('✅ Servisna historija:', serviceData);
        setServiceHistory(serviceData);
      } else {
        throw new Error('API nije dostupan');
      }
    } catch (error) {
      console.error('Error fetching service history:', error);
      // Fallback na mock podatke
      const mockServices = mockServiceHistory.filter(s => s.vehicle === vehicleId);
      setServiceHistory(mockServices);
    }
  };

  const fetchDailyMileage = async (vehicleId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/vehicles/${vehicleId}/mileage`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const mileageData = await response.json();
        console.log('✅ Kilometraža:', mileageData);
        setDailyMileage(mileageData);
      } else {
        throw new Error('API nije dostupan');
      }
    } catch (error) {
      console.error('Error fetching daily mileage:', error);
      // Fallback na mock podatke
      const mockMileage = mockDailyMileage.filter(m => m.vehicle === vehicleId);
      setDailyMileage(mockMileage);
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

  const handleVehicleSelect = async (vehicle) => {
    console.log("🚗 Vehicle selected:", vehicle);
    await fetchVehicleDetails(vehicle._id);
    setActiveTab("details");
  };

  const handleAddService = async (serviceData) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/vehicles/${selectedVehicle._id}/service`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(serviceData)
      });
      
      if (response.ok) {
        setSnackbar({ open: true, message: 'Servis uspješno dodan', severity: 'success' });
        await fetchServiceHistory(selectedVehicle._id);
      } else {
        throw new Error('Greška pri dodavanju servisa');
      }
    } catch (error) {
      console.error('Error adding service:', error);
      setSnackbar({ open: true, message: 'Greška pri dodavanju servisa', severity: 'error' });
    }
  };

  const handleAddMileage = async (mileageData) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/vehicles/${selectedVehicle._id}/mileage`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...mileageData,
          date: new Date(mileageData.date).toISOString(),
          enteredBy: user._id
        })
      });
      
      if (response.ok) {
        setSnackbar({ open: true, message: 'Kilometraža uspješno dodana', severity: 'success' });
        await fetchDailyMileage(selectedVehicle._id);
        
        // Refresh vehicle data to update current odometer
        await fetchVehicleDetails(selectedVehicle._id);
      } else {
        throw new Error('Greška pri dodavanju kilometraže');
      }
    } catch (error) {
      console.error('Error adding mileage:', error);
      setSnackbar({ open: true, message: 'Greška pri dodavanju kilometraže', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Helper funkcije za statistike
  const getGlobalStats = () => {
    const totalVehicles = vehicles.length;
    const activeVehicles = vehicles.filter(v => !v.status || v.status === 'active').length;
    const maintenanceVehicles = vehicles.filter(v => v.status === 'maintenance').length;
    
    // Safe mileage calculation - koristimo currentOdometer
    const totalMileage = vehicles.reduce((acc, vehicle) => {
      const current = vehicle.currentOdometer || 0;
      return acc + current;
    }, 0);
    
    const averageMileage = totalVehicles > 0 ? Math.round(totalMileage / totalVehicles) : 0;

    // Poboljšana statistika
    const totalMonthlyMileage = dailyMileage
      .filter(m => {
        const mileageDate = new Date(m.date);
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        return mileageDate.getMonth() === currentMonth && mileageDate.getFullYear() === currentYear;
      })
      .reduce((acc, m) => acc + (m.distance || 0), 0);

    const upcomingServices = serviceHistory.filter(s => 
      s.nextServiceMileage && selectedVehicle && 
      selectedVehicle.currentOdometer && 
      (s.nextServiceMileage - selectedVehicle.currentOdometer) <= 1000
    ).length;

    return {
      totalVehicles,
      activeVehicles,
      maintenanceVehicles,
      totalMileage,
      averageMileage,
      totalMonthlyMileage,
      upcomingServices
    };
  };

  const globalStats = getGlobalStats();

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
                Upravljanje vozilima
              </h1>
              <p className="text-[#B0B3C1] mt-3 text-lg font-light">
                Pregled vozila, servisa i dnevne kilometraže
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
            <VehicleStats 
              globalStats={globalStats} 
              hoveredCard={hoveredCard}
              onHover={setHoveredCard}
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Lista vozila */}
              <VehiclesList
                vehicles={vehicles}
                selectedVehicle={selectedVehicle}
                onVehicleSelect={handleVehicleSelect}
              />

              {/* Detalji odabranog vozila */}
              <div className="lg:col-span-3">
                {selectedVehicle ? (
                  <div className="bg-gradient-to-br from-[#1A1C25] to-[#232634] rounded-2xl border border-[#2A2D3A] shadow-2xl shadow-black/20 hover:shadow-[#6C63FF]/10 transition-all duration-500 animate-slideUp">
                    {/* Tab navigacija */}
                    <div className="border-b border-[#2A2D3A]">
                      <div className="flex space-x-1 p-6">
                        <button
                          onClick={() => setActiveTab("details")}
                          className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                            activeTab === "details"
                              ? "bg-[#6C63FF] text-white shadow-lg shadow-[#6C63FF]/25"
                              : "text-[#B0B3C1] hover:text-white hover:bg-[#2A2D3A]"
                          }`}
                        >
                          📋 Detalji vozila
                        </button>
                        <button
                          onClick={() => setActiveTab("service")}
                          className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                            activeTab === "service"
                              ? "bg-[#6C63FF] text-white shadow-lg shadow-[#6C63FF]/25"
                              : "text-[#B0B3C1] hover:text-white hover:bg-[#2A2D3A]"
                          }`}
                        >
                          🔧 Servisna historija
                        </button>
                        <button
                          onClick={() => setActiveTab("mileage")}
                          className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                            activeTab === "mileage"
                              ? "bg-[#6C63FF] text-white shadow-lg shadow-[#6C63FF]/25"
                              : "text-[#B0B3C1] hover:text-white hover:bg-[#2A2D3A]"
                          }`}
                        >
                          📊 Dnevna kilometraža
                        </button>
                      </div>
                    </div>

                    {/* Tab sadržaj */}
                    <div className="p-6">
                      {activeTab === "details" && (
                        <VehicleDetails 
                          vehicle={selectedVehicle} 
                          onAddService={handleAddService}
                        />
                      )}
                      {activeTab === "service" && (
                        <ServiceHistory 
                          serviceHistory={serviceHistory}
                          vehicle={selectedVehicle}
                          onAddService={handleAddService}
                        />
                      )}
                      {activeTab === "mileage" && (
                        <DailyMileage 
                          dailyMileage={dailyMileage}
                          vehicle={selectedVehicle}
                          onAddMileage={handleAddMileage}
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-[#1A1C25] to-[#232634] rounded-2xl border border-[#2A2D3A] shadow-2xl shadow-black/20 hover:shadow-[#6C63FF]/10 transition-all duration-500 animate-slideUp">
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">🚗</div>
                      <p className="text-[#B0B3C1] text-lg">
                        {vehicles.length === 0 
                          ? "Trenutno nemate dodijeljena vozila" 
                          : "Odaberite vozilo za pregled detalja i servisa"
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

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