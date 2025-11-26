import { useState } from "react";

const DailyMileage = ({ dailyMileage, vehicle, onAddMileage }) => {
  const [showMileageForm, setShowMileageForm] = useState(false);
  const [mileageForm, setMileageForm] = useState({
    date: new Date().toISOString().split('T')[0],
    startOdometer: vehicle.currentOdometer || 0,
    endOdometer: '',
    notes: ''
  });

  const handleMileageSubmit = (e) => {
    e.preventDefault();
    const start = parseInt(mileageForm.startOdometer) || 0;
    const end = parseInt(mileageForm.endOdometer) || 0;
    const distance = end - start;
    
    if (distance < 0) {
      alert('Završna kilometraža ne može biti manja od početne!');
      return;
    }
    
    onAddMileage({
      ...mileageForm,
      startOdometer: start,
      endOdometer: end,
      distance: distance
    });
    
    setMileageForm({
      date: new Date().toISOString().split('T')[0],
      startOdometer: end,
      endOdometer: '',
      notes: ''
    });
    setShowMileageForm(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Nepoznat datum';
    return new Date(dateString).toLocaleDateString('bs-BA');
  };

  const formatNumber = (num) => {
    if (num === undefined || num === null) return '0';
    return num.toLocaleString();
  };

  const calculateTotalMileage = () => {
    return dailyMileage.reduce((total, entry) => total + (entry.distance || 0), 0);
  };

  const calculateAverageDaily = () => {
    return dailyMileage.length > 0 ? Math.round(calculateTotalMileage() / dailyMileage.length) : 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Dnevna kilometraža</h2>
        <button
          onClick={() => setShowMileageForm(true)}
          className="bg-[#6C63FF] text-white px-4 py-2 rounded-xl hover:bg-[#5A52D5] transition-colors duration-300"
        >
          + Unesi kilometražu
        </button>
      </div>

      {/* Statistike */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#232634] rounded-xl p-4 border border-[#2A2D3A]">
          <p className="text-[#B0B3C1] text-sm">Ukupno zabilježeno</p>
          <p className="text-2xl font-bold text-white">{formatNumber(calculateTotalMileage())} km</p>
        </div>
        <div className="bg-[#232634] rounded-xl p-4 border border-[#2A2D3A]">
          <p className="text-[#B0B3C1] text-sm">Prosječno dnevno</p>
          <p className="text-2xl font-bold text-[#6C63FF]">{formatNumber(calculateAverageDaily())} km</p>
        </div>
        <div className="bg-[#232634] rounded-xl p-4 border border-[#2A2D3A]">
          <p className="text-[#B0B3C1] text-sm">Broj unosa</p>
          <p className="text-2xl font-bold text-[#27AE60]">{dailyMileage.length}</p>
        </div>
      </div>

      {dailyMileage.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-[#B0B3C1] text-lg">Nema evidentirane dnevne kilometraže za ovo vozilo</p>
        </div>
      ) : (
        <div className="space-y-4">
          {dailyMileage.map((entry) => (
            <div
              key={entry._id}
              className="bg-[#232634] rounded-xl p-6 border border-[#2A2D3A] hover:border-[#6C63FF]/40 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-white font-semibold">{formatDate(entry.date)}</h3>
                  {entry.enteredBy && (
                    <p className="text-[#B0B3C1] text-sm">
                      Unio: {entry.enteredBy.name} {entry.enteredBy.surname}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-[#6C63FF]">
                    +{formatNumber(entry.distance)} km
                  </span>
                  <p className="text-[#B0B3C1] text-sm">
                    {formatNumber(entry.startOdometer)} → {formatNumber(entry.endOdometer)} km
                  </p>
                </div>
              </div>
              
              {entry.notes && (
                <p className="text-[#B0B3C1] border-t border-[#2A2D3A] pt-3">
                  {entry.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Forma za unos kilometraže */}
      {showMileageForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-gradient-to-br from-[#1A1C25] to-[#232634] rounded-2xl border border-[#2A2D3A] p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Unesi dnevnu kilometražu</h3>
            <form onSubmit={handleMileageSubmit} className="space-y-4">
              <div>
                <label className="block text-[#B0B3C1] text-sm mb-2">Datum</label>
                <input
                  type="date"
                  value={mileageForm.date}
                  onChange={(e) => setMileageForm({...mileageForm, date: e.target.value})}
                  className="w-full bg-[#232634] border border-[#2A2D3A] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#6C63FF] transition-colors duration-300"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#B0B3C1] text-sm mb-2">Početna km</label>
                  <input
                    type="number"
                    value={mileageForm.startOdometer}
                    onChange={(e) => setMileageForm({...mileageForm, startOdometer: e.target.value})}
                    className="w-full bg-[#232634] border border-[#2A2D3A] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#6C63FF] transition-colors duration-300"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-[#B0B3C1] text-sm mb-2">Završna km</label>
                  <input
                    type="number"
                    value={mileageForm.endOdometer}
                    onChange={(e) => setMileageForm({...mileageForm, endOdometer: e.target.value})}
                    className="w-full bg-[#232634] border border-[#2A2D3A] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#6C63FF] transition-colors duration-300"
                    required
                  />
                </div>
              </div>
              
              {mileageForm.endOdometer && mileageForm.startOdometer && (
                <div className="bg-[#6C63FF]/10 border border-[#6C63FF]/30 rounded-xl p-3">
                  <p className="text-[#6C63FF] text-center font-semibold">
                    Dnevna kilometraža: {formatNumber(parseInt(mileageForm.endOdometer) - parseInt(mileageForm.startOdometer))} km
                  </p>
                </div>
              )}
              
              <div>
                <label className="block text-[#B0B3C1] text-sm mb-2">Napomene (opciono)</label>
                <textarea
                  value={mileageForm.notes}
                  onChange={(e) => setMileageForm({...mileageForm, notes: e.target.value})}
                  className="w-full bg-[#232634] border border-[#2A2D3A] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#6C63FF] transition-colors duration-300"
                  rows="2"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#6C63FF] text-white py-3 rounded-xl hover:bg-[#5A52D5] transition-colors duration-300"
                >
                  Spremi kilometražu
                </button>
                <button
                  type="button"
                  onClick={() => setShowMileageForm(false)}
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

export default DailyMileage;