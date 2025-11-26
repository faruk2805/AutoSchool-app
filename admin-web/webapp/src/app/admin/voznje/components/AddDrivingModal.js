import { useState } from 'react';

export default function AddDrivingModal({ open, onClose, onAddDriving, candidates, instructors, vehicles }) {
  const [formData, setFormData] = useState({
    kandidat: '',
    instruktor: '',
    vozilo: '',
    datum: '',
    vrijeme: '08:00',
    trajanje: 2,
    lokacija: '',
    napomene: '',
    zavrsnaVoznja: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddDriving(formData);
    setFormData({
      kandidat: '',
      instruktor: '',
      vozilo: '',
      datum: '',
      vrijeme: '08:00',
      trajanje: 2,
      lokacija: '',
      napomene: '',
      zavrsnaVoznja: false
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#232634] rounded-xl border border-[#2A2D3A] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-[#2A2D3A]">
          <h2 className="text-xl font-semibold text-white">Zakazivanje nove vožnje</h2>
          <p className="text-[#B0B3C1] text-sm mt-1">Popunite podatke za novu vožnju</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Kandidat */}
            <div>
              <label className="block text-sm font-medium text-[#B0B3C1] mb-2">
                Kandidat *
              </label>
              <select
                name="kandidat"
                value={formData.kandidat}
                onChange={handleChange}
                required
                className="w-full bg-[#1A1C25] border border-[#2A2D3A] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#6C63FF] transition-colors"
              >
                <option value="">Odaberite kandidata</option>
                {candidates.map(candidate => (
                  <option key={candidate._id} value={candidate._id}>
                    {candidate.name} {candidate.surname} - {candidate.phone}
                  </option>
                ))}
              </select>
            </div>

            {/* Instruktor */}
            <div>
              <label className="block text-sm font-medium text-[#B0B3C1] mb-2">
                Instruktor *
              </label>
              <select
                name="instruktor"
                value={formData.instruktor}
                onChange={handleChange}
                required
                className="w-full bg-[#1A1C25] border border-[#2A2D3A] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#6C63FF] transition-colors"
              >
                <option value="">Odaberite instruktora</option>
                {instructors.filter(i => i.status === 'active').map(instructor => (
                  <option key={instructor._id} value={instructor._id}>
                    {instructor.name} {instructor.surname}
                  </option>
                ))}
              </select>
            </div>

            {/* Vozilo */}
            <div>
              <label className="block text-sm font-medium text-[#B0B3C1] mb-2">
                Vozilo *
              </label>
              <select
                name="vozilo"
                value={formData.vozilo}
                onChange={handleChange}
                required
                className="w-full bg-[#1A1C25] border border-[#2A2D3A] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#6C63FF] transition-colors"
              >
                <option value="">Odaberite vozilo</option>
                {vehicles.filter(v => v.status === 'active').map(vehicle => (
                  <option key={vehicle._id} value={vehicle._id}>
                    {vehicle.plate} - {vehicle.make} {vehicle.model}
                  </option>
                ))}
              </select>
            </div>

            {/* Datum */}
            <div>
              <label className="block text-sm font-medium text-[#B0B3C1] mb-2">
                Datum *
              </label>
              <input
                type="date"
                name="datum"
                value={formData.datum}
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-[#1A1C25] border border-[#2A2D3A] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#6C63FF] transition-colors"
              />
            </div>

            {/* Vrijeme */}
            <div>
              <label className="block text-sm font-medium text-[#B0B3C1] mb-2">
                Vrijeme *
              </label>
              <select
                name="vrijeme"
                value={formData.vrijeme}
                onChange={handleChange}
                required
                className="w-full bg-[#1A1C25] border border-[#2A2D3A] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#6C63FF] transition-colors"
              >
                {Array.from({ length: 13 }, (_, i) => {
                  const hour = i + 8; // Počevši od 8:00
                  return `${hour.toString().padStart(2, '0')}:00`;
                }).map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>

            {/* Trajanje */}
            <div>
              <label className="block text-sm font-medium text-[#B0B3C1] mb-2">
                Trajanje (sati) *
              </label>
              <select
                name="trajanje"
                value={formData.trajanje}
                onChange={handleChange}
                required
                className="w-full bg-[#1A1C25] border border-[#2A2D3A] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#6C63FF] transition-colors"
              >
                <option value={1}>1 sat</option>
                <option value={2}>2 sata</option>
                <option value={3}>3 sata</option>
                <option value={4}>4 sata</option>
              </select>
            </div>
          </div>

          {/* Lokacija */}
          <div>
            <label className="block text-sm font-medium text-[#B0B3C1] mb-2">
              Lokacija *
            </label>
            <input
              type="text"
              name="lokacija"
              value={formData.lokacija}
              onChange={handleChange}
              required
              placeholder="Unesite lokaciju vožnje"
              className="w-full bg-[#1A1C25] border border-[#2A2D3A] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#6C63FF] transition-colors"
            />
          </div>

          {/* Napomene */}
          <div>
            <label className="block text-sm font-medium text-[#B0B3C1] mb-2">
              Napomene
            </label>
            <textarea
              name="napomene"
              value={formData.napomene}
              onChange={handleChange}
              rows={3}
              placeholder="Dodatne napomene o vožnji..."
              className="w-full bg-[#1A1C25] border border-[#2A2D3A] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#6C63FF] transition-colors resize-none"
            />
          </div>

          {/* Završna vožnja checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="zavrsnaVoznja"
              checked={formData.zavrsnaVoznja}
              onChange={handleChange}
              className="w-4 h-4 text-[#6C63FF] bg-[#1A1C25] border-[#2A2D3A] rounded focus:ring-[#6C63FF] focus:ring-2"
            />
            <label className="ml-2 text-sm text-[#B0B3C1]">
              Završna vožnja (ispitna)
            </label>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-[#6C63FF] text-white py-2 px-4 rounded-lg hover:bg-[#5A52D5] transition-colors font-medium"
            >
              Zakazi vožnju
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