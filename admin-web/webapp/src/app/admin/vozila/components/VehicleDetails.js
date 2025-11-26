import { useState } from "react";

const VehicleDetails = ({ vehicle, onAddService }) => {
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    type: 'redovni servis',
    description: '',
    cost: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleServiceSubmit = (e) => {
    e.preventDefault();
    onAddService({
      ...serviceForm,
      mileage: vehicle.currentOdometer || 0,
      cost: parseFloat(serviceForm.cost) || 0
    });
    setServiceForm({
      type: 'redovni servis',
      description: '',
      cost: '',
      date: new Date().toISOString().split('T')[0]
    });
    setShowServiceForm(false);
  };

  // Safe number formatting
  const formatNumber = (num) => {
    if (num === undefined || num === null) return '0';
    return num.toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-[#27AE60] text-white';
      case 'maintenance': return 'bg-[#FF6B35] text-white';
      case 'inactive': return 'bg-[#B0B3C1] text-[#1A1C25]';
      default: return 'bg-[#27AE60] text-white'; // default active
    }
  };

  return (
    <div className="space-y-6">
      {/* Header sa osnovnim informacijama */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {vehicle.make} {vehicle.model} {vehicle.year}
          </h2>
          <p className="text-[#B0B3C1]">Tablice: {vehicle.plate}</p>
        </div>
        <div className="flex items-center space-x-4">
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(vehicle.status)}`}>
            {vehicle.status === 'active' ? 'Aktivno' : vehicle.status === 'maintenance' ? 'Na servisu' : 'Aktivno'}
          </span>
          <button
            onClick={() => setShowServiceForm(true)}
            className="bg-[#6C63FF] text-white px-4 py-2 rounded-xl hover:bg-[#5A52D5] transition-colors duration-300"
          >
            + Dodaj servis
          </button>
        </div>
      </div>

      {/* Grid sa detaljima */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Osnovne informacije */}
        <div className="bg-[#232634] rounded-xl p-6 border border-[#2A2D3A]">
          <h3 className="text-lg font-semibold text-white mb-4">Osnovne informacije</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-[#B0B3C1]">ID:</span>
              <span className="text-white font-mono text-sm">{vehicle._id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#B0B3C1]">Marka:</span>
              <span className="text-white">{vehicle.make}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#B0B3C1]">Model:</span>
              <span className="text-white">{vehicle.model}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#B0B3C1]">Godina:</span>
              <span className="text-white">{vehicle.year}</span>
            </div>
          </div>
        </div>

        {/* Kilometraža */}
        <div className="bg-[#232634] rounded-xl p-6 border border-[#2A2D3A]">
          <h3 className="text-lg font-semibold text-white mb-4">Kilometraža</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-[#B0B3C1]">Trenutna:</span>
              <span className="text-white font-bold">{formatNumber(vehicle.currentOdometer)} km</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#B0B3C1]">Dodano:</span>
              <span className="text-white">{new Date(vehicle.createdAt).toLocaleDateString('bs-BA')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#B0B3C1]">Ažurirano:</span>
              <span className="text-[#6C63FF]">
                {new Date(vehicle.updatedAt).toLocaleDateString('bs-BA')}
              </span>
            </div>
          </div>
        </div>

        {/* Servis */}
        <div className="bg-[#232634] rounded-xl p-6 border border-[#2A2D3A]">
          <h3 className="text-lg font-semibold text-white mb-4">Servis</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-[#B0B3C1]">Status:</span>
              <span className={`font-bold ${
                vehicle.status === 'maintenance' ? 'text-[#FF6B35]' : 'text-[#27AE60]'
              }`}>
                {vehicle.status === 'maintenance' ? 'Na servisu' : 'U vožnji'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#B0B3C1]">Zadnja aktivnost:</span>
              <span className="text-white">
                {new Date(vehicle.updatedAt).toLocaleDateString('bs-BA')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#B0B3C1]">Registracija:</span>
              <span className="text-[#27AE60] font-bold">
                {vehicle.plate}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Instruktor */}
      {vehicle.instructor && (
        <div className="bg-[#232634] rounded-xl p-6 border border-[#2A2D3A]">
          <h3 className="text-lg font-semibold text-white mb-4">Dodijeljeni instruktor</h3>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-[#6C63FF] rounded-full flex items-center justify-center text-white font-semibold">
              {vehicle.instructor.name?.[0]}{vehicle.instructor.surname?.[0]}
            </div>
            <div>
              <p className="text-white font-medium">
                {vehicle.instructor.name} {vehicle.instructor.surname}
              </p>
              <p className="text-[#B0B3C1] text-sm">Vozački instruktor</p>
            </div>
          </div>
        </div>
      )}

      {/* Forma za dodavanje servisa */}
      {showServiceForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-gradient-to-br from-[#1A1C25] to-[#232634] rounded-2xl border border-[#2A2D3A] p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Dodaj servis</h3>
            <form onSubmit={handleServiceSubmit} className="space-y-4">
              <div>
                <label className="block text-[#B0B3C1] text-sm mb-2">Tip servisa</label>
                <select
                  value={serviceForm.type}
                  onChange={(e) => setServiceForm({...serviceForm, type: e.target.value})}
                  className="w-full bg-[#232634] border border-[#2A2D3A] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#6C63FF] transition-colors duration-300"
                >
                  <option value="redovni servis">Redovni servis</option>
                  <option value="zamjena guma">Zamjena guma</option>
                  <option value="kočioni sistem">Kočioni sistem</option>
                  <option value="motor">Motor</option>
                  <option value="elektrika">Elektrika</option>
                  <option value="ostalo">Ostalo</option>
                </select>
              </div>
              
              <div>
                <label className="block text-[#B0B3C1] text-sm mb-2">Opis</label>
                <textarea
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})}
                  className="w-full bg-[#232634] border border-[#2A2D3A] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#6C63FF] transition-colors duration-300"
                  rows="3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#B0B3C1] text-sm mb-2">Cijena (KM)</label>
                  <input
                    type="number"
                    value={serviceForm.cost}
                    onChange={(e) => setServiceForm({...serviceForm, cost: e.target.value})}
                    className="w-full bg-[#232634] border border-[#2A2D3A] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#6C63FF] transition-colors duration-300"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-[#B0B3C1] text-sm mb-2">Datum</label>
                  <input
                    type="date"
                    value={serviceForm.date}
                    onChange={(e) => setServiceForm({...serviceForm, date: e.target.value})}
                    className="w-full bg-[#232634] border border-[#2A2D3A] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#6C63FF] transition-colors duration-300"
                    required
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#6C63FF] text-white py-3 rounded-xl hover:bg-[#5A52D5] transition-colors duration-300"
                >
                  Spremi servis
                </button>
                <button
                  type="button"
                  onClick={() => setShowServiceForm(false)}
                  className="flex-1 bg-[#2A2D3A] text-[#B0B3C1] py-3 rounded-xl hover:bg-[#232634] transition-colors duration-300"
                >
                  Otkaži
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleDetails;