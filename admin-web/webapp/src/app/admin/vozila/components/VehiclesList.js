const VehiclesList = ({ vehicles, selectedVehicle, onVehicleSelect }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-[#27AE60]';
      case 'maintenance': return 'text-[#FF6B35]';
      case 'inactive': return 'text-[#B0B3C1]';
      default: return 'text-[#27AE60]'; // default active
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Aktivno';
      case 'maintenance': return 'Na servisu';
      case 'inactive': return 'Neaktivno';
      default: return 'Aktivno'; // default active
    }
  };

  // Safe number formatting
  const formatMileage = (mileage) => {
    if (mileage === undefined || mileage === null) return '0';
    return mileage.toLocaleString();
  };

  return (
    <div className="bg-gradient-to-br from-[#1A1C25] to-[#232634] rounded-2xl border border-[#2A2D3A] shadow-2xl shadow-black/20 hover:shadow-[#6C63FF]/10 transition-all duration-500 animate-slideUp">
      <div className="p-6 border-b border-[#2A2D3A]">
        <h2 className="text-xl font-bold text-white">Lista vozila</h2>
        <p className="text-[#B0B3C1] text-sm mt-1">Odaberite vozilo za detalje</p>
      </div>
      
      <div className="max-h-[600px] overflow-y-auto">
        {vehicles.map((vehicle) => (
          <div
            key={vehicle._id}
            onClick={() => onVehicleSelect(vehicle)}
            className={`p-4 border-b border-[#2A2D3A] cursor-pointer transition-all duration-300 hover:bg-[#2A2D3A] group ${
              selectedVehicle?._id === vehicle._id 
                ? 'bg-[#6C63FF]/10 border-l-4 border-l-[#6C63FF]' 
                : ''
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-white group-hover:text-[#6C63FF] transition-colors duration-300">
                {vehicle.make} {vehicle.model}
              </h3>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(vehicle.status)} bg-opacity-20`}>
                {getStatusText(vehicle.status)}
              </span>
            </div>
            
            <div className="space-y-1 text-sm">
              <p className="text-[#B0B3C1]">Tablice: {vehicle.plate}</p>
              <p className="text-[#B0B3C1]">Godina: {vehicle.year}</p>
              <p className="text-[#B0B3C1]">
                Kilometraža: <span className="text-white font-medium">{formatMileage(vehicle.currentOdometer)} km</span>
              </p>
              {vehicle.instructor && (
                <p className="text-[#B0B3C1] text-xs">
                  Instruktor: {vehicle.instructor.name} {vehicle.instructor.surname}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VehiclesList;