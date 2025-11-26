import { useState } from "react";

const AddPaymentModal = ({ open, onClose, onAddPayment, candidates }) => {
  const [formData, setFormData] = useState({
    user: '',
    amount: '',
    type: 'instalment',
    method: 'cash',
    description: '',
    date: new Date().toISOString().split('T')[0],
    status: 'completed'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.user || !formData.amount) {
      alert('Molimo popunite sva obavezna polja');
      return;
    }

    onAddPayment(formData);

    // Reset form
    setFormData({
      user: '',
      amount: '',
      type: 'instalment',
      method: 'cash',
      description: '',
      date: new Date().toISOString().split('T')[0],
      status: 'completed'
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-[#1A1C25] to-[#232634] rounded-xl border border-[#2A2D3A] p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Dodaj novu uplatu</h3>
          <button
            onClick={onClose}
            className="text-[#B0B3C1] hover:text-white transition-colors duration-300"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Kandidat */}
          <div>
            <label className="block text-[#B0B3C1] text-sm mb-2">
              Kandidat *
            </label>
            <select
              value={formData.user}
              onChange={(e) => setFormData({...formData, user: e.target.value})}
              className="w-full bg-[#232634] border border-[#2A2D3A] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#6C63FF] transition-colors duration-300 text-sm"
              required
            >
              <option value="">Odaberite kandidata</option>
              {candidates.map(candidate => (
                <option key={candidate._id} value={candidate._id}>
                  {candidate.name} {candidate.surname}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Iznos */}
            <div>
              <label className="block text-[#B0B3C1] text-sm mb-2">
                Iznos (KM) *
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="w-full bg-[#232634] border border-[#2A2D3A] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#6C63FF] transition-colors duration-300 text-sm"
                placeholder="0.00"
                step="0.01"
                required
              />
            </div>

            {/* Datum */}
            <div>
              <label className="block text-[#B0B3C1] text-sm mb-2">
                Datum *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full bg-[#232634] border border-[#2A2D3A] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#6C63FF] transition-colors duration-300 text-sm"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Tip uplate */}
            <div>
              <label className="block text-[#B0B3C1] text-sm mb-2">Tip uplate</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full bg-[#232634] border border-[#2A2D3A] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#6C63FF] transition-colors duration-300 text-sm"
              >
                <option value="deposit">Depozit</option>
                <option value="instalment">Rata</option>
                <option value="full">Puna uplata</option>
              </select>
            </div>

            {/* Način plaćanja */}
            <div>
              <label className="block text-[#B0B3C1] text-sm mb-2">Način plaćanja</label>
              <select
                value={formData.method}
                onChange={(e) => setFormData({...formData, method: e.target.value})}
                className="w-full bg-[#232634] border border-[#2A2D3A] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#6C63FF] transition-colors duration-300 text-sm"
              >
                <option value="cash">Gotovina</option>
                <option value="bank_transfer">Bankovni transfer</option>
                <option value="card">Kartica</option>
              </select>
            </div>
          </div>

          {/* Opis */}
          <div>
            <label className="block text-[#B0B3C1] text-sm mb-2">Opis</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full bg-[#232634] border border-[#2A2D3A] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#6C63FF] transition-colors duration-300 text-sm"
              placeholder="Opis uplate..."
            />
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-[#6C63FF] text-white py-2 rounded-lg hover:bg-[#5A52D5] transition-colors duration-300 font-medium text-sm"
            >
              Spremi uplatu
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-[#2A2D3A] text-[#B0B3C1] py-2 rounded-lg hover:bg-[#232634] transition-colors duration-300 text-sm"
            >
              Otkaži
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPaymentModal;