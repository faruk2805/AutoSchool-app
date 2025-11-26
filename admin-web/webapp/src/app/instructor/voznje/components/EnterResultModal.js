import { useState } from 'react';

export default function EnterResultModal({ open, onClose, onEnterResult, session }) {
  const [resultData, setResultData] = useState({
    ocjena: session?.ocjena || '',
    potrosnjaGoriva: session?.potrosnjaGoriva || '',
    predeniKilometri: session?.predeniKilometri || '',
    napomene: session?.napomene || '',
    zavrsnaVoznja: session?.zavrsnaVoznja || false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onEnterResult(resultData);
    setResultData({
      ocjena: '',
      potrosnjaGoriva: '',
      predeniKilometri: '',
      napomene: '',
      zavrsnaVoznja: false
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setResultData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (!open || !session) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#232634] rounded-xl border border-[#2A2D3A] w-full max-w-2xl">
        <div className="p-6 border-b border-[#2A2D3A]">
          <h2 className="text-xl font-semibold text-white">Unos rezultata vožnje</h2>
          <p className="text-[#B0B3C1] text-sm mt-1">
            {session.kandidat.name} {session.kandidat.surname} - {session.datum} {session.vrijeme}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Session Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-[#1A1C25] rounded-lg">
            <div>
              <h4 className="text-sm font-medium text-[#B0B3C1]">Kandidat</h4>
              <p className="text-white font-medium">
                {session.kandidat.name} {session.kandidat.surname}
              </p>
              <p className="text-sm text-[#B0B3C1]">{session.kandidat.phone}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-[#B0B3C1]">Instruktor</h4>
              <p className="text-white">
                {session.instruktor.name} {session.instruktor.surname}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-[#B0B3C1]">Vozilo</h4>
              <p className="text-white">{session.vozilo.plate}</p>
              <p className="text-sm text-[#B0B3C1]">{session.vozilo.make} {session.vozilo.model}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-[#B0B3C1]">Lokacija</h4>
              <p className="text-white">{session.lokacija}</p>
            </div>
          </div>

          {/* Results Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Ocjena */}
            <div>
              <label className="block text-sm font-medium text-[#B0B3C1] mb-2">
                Ocjena (1-10) *
              </label>
              <select
                name="ocjena"
                value={resultData.ocjena}
                onChange={handleChange}
                required
                className="w-full bg-[#1A1C25] border border-[#2A2D3A] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#6C63FF] transition-colors"
              >
                <option value="">Odaberite ocjenu</option>
                {Array.from({ length: 10 }, (_, i) => i + 1).map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>

            {/* Potrošnja goriva */}
            <div>
              <label className="block text-sm font-medium text-[#B0B3C1] mb-2">
                Potrošnja goriva (L/100km)
              </label>
              <input
                type="number"
                name="potrosnjaGoriva"
                value={resultData.potrosnjaGoriva}
                onChange={handleChange}
                step="0.1"
                min="0"
                max="20"
                placeholder="npr. 5.2"
                className="w-full bg-[#1A1C25] border border-[#2A2D3A] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#6C63FF] transition-colors"
              />
            </div>

            {/* Pređeni kilometri */}
            <div>
              <label className="block text-sm font-medium text-[#B0B3C1] mb-2">
                Pređeni kilometri *
              </label>
              <input
                type="number"
                name="predeniKilometri"
                value={resultData.predeniKilometri}
                onChange={handleChange}
                required
                min="0"
                max="1000"
                placeholder="npr. 25"
                className="w-full bg-[#1A1C25] border border-[#2A2D3A] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#6C63FF] transition-colors"
              />
            </div>
          </div>

          {/* Napomene */}
          <div>
            <label className="block text-sm font-medium text-[#B0B3C1] mb-2">
              Napomene o vožnji
            </label>
            <textarea
              name="napomene"
              value={resultData.napomene}
              onChange={handleChange}
              rows={4}
              placeholder="Opišite kako je prošla vožnja, napomene za poboljšanje, itd."
              className="w-full bg-[#1A1C25] border border-[#2A2D3A] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#6C63FF] transition-colors resize-none"
            />
          </div>

          {/* Završna vožnja checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="zavrsnaVoznja"
              checked={resultData.zavrsnaVoznja}
              onChange={handleChange}
              className="w-4 h-4 text-[#6C63FF] bg-[#1A1C25] border-[#2A2D3A] rounded focus:ring-[#6C63FF] focus:ring-2"
            />
            <label className="ml-2 text-sm text-[#B0B3C1]">
              Ovo je bila završna (ispitna) vožnja
            </label>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-[#27AE60] text-white py-2 px-4 rounded-lg hover:bg-[#219653] transition-colors font-medium"
            >
              Spremi rezultat
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-[#2A2D3A] text-[#B0B3C1] py-2 px-4 rounded-lg hover:bg-[#3A3D4A] transition-colors font-medium"
            >
              Otkaži
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}