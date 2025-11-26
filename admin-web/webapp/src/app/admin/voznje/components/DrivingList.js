export default function DrivingList({ sessions, onEnterResult, onCancelSession }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'zavrsena': return 'text-green-400 bg-green-500/20';
      case 'zakazana': return 'text-blue-400 bg-blue-500/20';
      case 'otkazana': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'zavrsena': return 'Završena';
      case 'zakazana': return 'Zakazana';
      case 'otkazana': return 'Otkazana';
      default: return status;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('bs-BA');
  };

  return (
    <div className="bg-[#232634]/60 backdrop-blur-lg rounded-xl border border-[#2A2D3A] overflow-hidden">
      <div className="p-6 border-b border-[#2A2D3A]">
        <h3 className="text-lg font-semibold text-white">Lista svih vožnji</h3>
        <p className="text-[#B0B3C1] text-sm mt-1">
          Ukupno vožnji: {sessions.length}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#2A2D3A]">
              <th className="text-left p-4 text-sm text-[#B0B3C1] font-medium">Datum & Vrijeme</th>
              <th className="text-left p-4 text-sm text-[#B0B3C1] font-medium">Kandidat</th>
              <th className="text-left p-4 text-sm text-[#B0B3C1] font-medium">Instruktor</th>
              <th className="text-left p-4 text-sm text-[#B0B3C1] font-medium">Vozilo</th>
              <th className="text-left p-4 text-sm text-[#B0B3C1] font-medium">Lokacija</th>
              <th className="text-left p-4 text-sm text-[#B0B3C1] font-medium">Status</th>
              <th className="text-left p-4 text-sm text-[#B0B3C1] font-medium">Akcije</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session._id} className="border-b border-[#2A2D3A] hover:bg-[#2A2D3A]/50 transition-colors">
                <td className="p-4">
                  <div className="text-white font-medium">{formatDate(session.datum)}</div>
                  <div className="text-sm text-[#B0B3C1]">{session.vrijeme} • {session.trajanje}h</div>
                </td>
                <td className="p-4">
                  <div className="text-white font-medium">
                    {session.kandidat.name} {session.kandidat.surname}
                  </div>
                  <div className="text-sm text-[#B0B3C1]">{session.kandidat.phone}</div>
                </td>
                <td className="p-4">
                  <div className="text-white">
                    {session.instruktor.name} {session.instruktor.surname}
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-white">{session.vozilo.plate}</div>
                  <div className="text-sm text-[#B0B3C1]">{session.vozilo.make} {session.vozilo.model}</div>
                </td>
                <td className="p-4">
                  <div className="text-white">{session.lokacija}</div>
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                    {getStatusText(session.status)}
                  </span>
                  {session.ocjena && (
                    <div className="text-sm text-[#B0B3C1] mt-1">
                      Ocjena: {session.ocjena}/10
                    </div>
                  )}
                </td>
                <td className="p-4">
                  <div className="flex space-x-2">
                    {session.status === 'zakazana' && (
                      <>
                        <button
                          onClick={() => onEnterResult(session)}
                          className="bg-[#6C63FF] text-white text-xs py-1 px-2 rounded hover:bg-[#5A52D5] transition-colors"
                        >
                          Unesi rezultat
                        </button>
                        <button
                          onClick={() => onCancelSession(session._id)}
                          className="bg-[#FF6B35] text-white text-xs py-1 px-2 rounded hover:bg-[#E55A2B] transition-colors"
                        >
                          Otkaži
                        </button>
                      </>
                    )}
                    {session.status === 'zavrsena' && (
                      <button
                        onClick={() => onEnterResult(session)}
                        className="bg-[#27AE60] text-white text-xs py-1 px-2 rounded hover:bg-[#219653] transition-colors"
                      >
                        Pregledaj
                      </button>
                    )}
                    {session.status === 'otkazana' && (
                      <span className="text-xs text-[#B0B3C1]">Otkazano</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {sessions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📝</div>
            <p className="text-[#B0B3C1]">Nema vožnji za prikaz</p>
          </div>
        )}
      </div>
    </div>
  );
}