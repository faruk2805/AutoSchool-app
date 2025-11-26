import { useState } from 'react';

export default function CancelDayModal({ open, onClose, onCancelDay, instructors }) {
  const [cancelData, setCancelData] = useState({
    date: '',
    instruktorId: 'all',
    razlog: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onCancelDay(cancelData);
    setCancelData({
      date: '',
      instruktorId: 'all',
      razlog: ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCancelData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#232634] rounded-xl border border-[#2A2D3A] w-full max-w-md">
        <div className="p-6 border-b border-[#2A2D3A]">
          <h2 className="text-xl font-semibold text-white">Otkazivanje vožnji</h2>
          <p className="text-[#B0B3C1] text-sm mt-1">Otkazite sve vožnje za odabrani dan</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Datum */}
          <div>
            <label className="block text-sm font-medium text-[#B0B3C1] mb-2">
              Datum *
            </label>
            <input
              type="date"
              name="date"
              value={cancelData.date}
              onChange={handleChange}
              required
              min={new Date().toISOString().split('T')[0]}
              className="w-full bg-[#1A1C25] border border-[#2A2D3A] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#6C63FF] transition-colors"
            />
          </div>

          {/* Instruktor */}
          <div>
            <label className="block text-sm font-medium text-[#B0B3C1] mb-2">
              Instruktor
            </label>
            <select
              name="instruktorId"
              value={cancelData.instruktorId}
              onChange={handleChange}
              className="w-full bg-[#1A1C25] border border-[#2A2D3A] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#6C63FF] transition-colors"
            >
              <option value="all">Svi instruktori</option>
              {instructors.filter(i => i.status === 'active').map(instructor => (
                <option key={instructor._id} value={instructor._id}>
                  {instructor.name} {instructor.surname}
                </option>
              ))}
            </select>
          </div>

          {/* Razlog */}
          <div>
            <label className="block text-sm font-medium text-[#B0B3C1] mb-2">
              Razlog otkazivanja *
            </label>
            <select
              name="razlog"
              value={cancelData.razlog}
              onChange={handleChange}
              required
              className="w-full bg-[#1A1C25] border border-[#2A2D3A] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#6C63FF] transition-colors"
            >
              <option value="">Odaberite razlog</option>
              <option value="Godišnji odmor">Godišnji odmor</option>
              <option value="Bolovanje">Bolovanje</option>
              <option value="Odsustvo">Odsustvo</option>
              <option value="Vremenski uslovi">Loši vremenski uslovi</option>
              <option value="Tehnički problemi">Tehnički problemi s vozilom</option>
              <option value="Ostalo">Ostalo</option>
            </select>
          </div>

          {/* Custom razlog */}
          {cancelData.razlog === 'Ostalo' && (
            <div>
              <label className="block text-sm font-medium text-[#B0B3C1] mb-2">
                Opis razloga *
              </label>
              <input
                type="text"
                name="customRazlog"
                onChange={(e) => setCancelData(prev => ({ ...prev, razlog: e.target.value }))}
                required
                placeholder="Unesite razlog otkazivanja"
                className="w-full bg-[#1A1C25] border border-[#2A2D3A] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#6C63FF] transition-colors"
              />
            </div>
          )}

          <div className="bg-[#FF6B35]/10 border border-[#FF6B35]/20 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <span className="text-[#FF6B35]">⚠️</span>
              <div>
                <p className="text-sm text-[#FF6B35] font-medium">Upozorenje</p>
                <p className="text-xs text-[#B0B3C1] mt-1">
                  Ova akcija će otkazati SVE zakazane vožnje za odabrani dan i instruktora. 
                  Ova akcija je nepovratna.
                </p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-[#FF6B35] text-white py-2 px-4 rounded-lg hover:bg-[#E55A2B] transition-colors font-medium"
            >
              Otkaži vožnje
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-[#2A2D3A] text-[#B0B3C1] py-2 px-4 rounded-lg hover:bg-[#3A3D4A] transition-colors font-medium"
            >
              Nazad
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}