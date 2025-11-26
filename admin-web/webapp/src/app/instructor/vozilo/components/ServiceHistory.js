import { useState } from "react";

const ServiceHistory = ({ serviceHistory, vehicle, onAddService }) => {
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
      mileage: vehicle.currentMileage,
      cost: parseFloat(serviceForm.cost)
    });
    setServiceForm({
      type: 'redovni servis',
      description: '',
      cost: '',
      date: new Date().toISOString().split('T')[0]
    });
    setShowServiceForm(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('bs-BA');
  };

  const getServiceTypeColor = (type) => {
    switch (type) {
      case 'redovni servis': return 'bg-[#6C63FF]';
      case 'zamjena guma': return 'bg-[#2D9CDB]';
      case 'kočioni sistem': return 'bg-[#FF6B35]';
      case 'motor': return 'bg-[#27AE60]';
      default: return 'bg-[#B0B3C1]';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Servisna historija</h2>
        <button
          onClick={() => setShowServiceForm(true)}
          className="bg-[#6C63FF] text-white px-4 py-2 rounded-xl hover:bg-[#5A52D5] transition-colors duration-300"
        >
          + Novi servis
        </button>
      </div>

      {serviceHistory.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔧</div>
          <p className="text-[#B0B3C1] text-lg">Nema evidentiranih servisa za ovo vozilo</p>
        </div>
      ) : (
        <div className="space-y-4">
          {serviceHistory.map((service) => (
            <div
              key={service._id}
              className="bg-[#232634] rounded-xl p-6 border border-[#2A2D3A] hover:border-[#6C63FF]/40 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getServiceTypeColor(service.type)}`}>
                    {service.type}
                  </span>
                  <span className="text-[#B0B3C1] text-sm">
                    {formatDate(service.date)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-white font-bold">{service.cost} KM</span>
                  <p className="text-[#B0B3C1] text-sm">Kilometraža: {service.mileage?.toLocaleString()} km</p>
                </div>
              </div>
              
              <p className="text-white">{service.description}</p>
              
              {service.nextServiceMileage && (
                <div className="mt-3 pt-3 border-t border-[#2A2D3A]">
                  <p className="text-[#B0B3C1] text-sm">
                    Sljedeći servis: <span className="text-[#6C63FF] font-medium">{service.nextServiceMileage.toLocaleString()} km</span>
                  </p>
                </div>
              )}
            </div>
          ))}
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

export default ServiceHistory;