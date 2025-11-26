const TestResults = ({ selectedCandidate, testResults, selectedTestType, onTestTypeChange, onViewDetails }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('bs-BA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (seconds) => {
    if (!seconds) {
      // Default vrijeme za testove
      return '10:00';
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTestTypeDisplay = (tip) => {
    const types = {
      'teorija': 'Teorija vožnje',
      'prva_pomoc': 'Prva pomoć',
      'znak': 'Znakovi',
      'raskrsnice': 'Raskrsnice',
      'kombinovani': 'Kombinovani test'
    };
    return types[tip] || tip;
  };

  const getSubTypeDisplay = (subTip) => {
    const subTypes = {
      'lekcijski': 'Lekcijski',
      'zavrsni': 'Završni',
      'probni': 'Probni',
      'kombinovani': 'Kombinovani'
    };
    return subTypes[subTip] || subTip;
  };

  return (
    <div className="bg-gradient-to-br from-[#1A1C25] to-[#232634] rounded-2xl border border-[#2A2D3A] shadow-2xl shadow-black/20 hover:shadow-[#6C63FF]/10 transition-all duration-500 animate-slideUp">
      <div className="p-6 border-b border-[#2A2D3A]">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white flex items-center space-x-3">
            <span className="text-2xl animate-pulse">📝</span>
            <span>
              Rezultati testova - {selectedCandidate.name} {selectedCandidate.surname}
            </span>
          </h3>
          
          <select 
            className="bg-[#232634] border border-[#2A2D3A] rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#6C63FF] transition-colors duration-300"
            value={selectedTestType}
            onChange={(e) => onTestTypeChange(e.target.value)}
          >
            <option value="svi">Svi testovi</option>
            <option value="prva_pomoc">Prva pomoć</option>
            <option value="znak">Znakovi</option>
            <option value="teorija">Teorija</option>
            <option value="raskrsnice">Raskrsnice</option>
          </select>
        </div>
      </div>
      
      <div className="p-6">
        {testResults.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-[#B0B3C1] text-lg">Nema rezultata testova za odabranog kandidata</p>
          </div>
        ) : (
          <div className="space-y-4">
            {testResults.map((result, index) => (
              <div 
                key={result._id}
                className="bg-[#232634] border border-[#2A2D3A] rounded-xl p-4 hover:border-[#6C63FF] transition-all duration-300 animate-fadeIn"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        result.passed 
                          ? 'bg-gradient-to-r from-[#27AE60] to-[#6FCF97] text-white' 
                          : 'bg-gradient-to-r from-[#FF6B35] to-[#FF9D6C] text-white'
                      }`}>
                        {result.passed ? 'POLOŽIO' : 'PAO'}
                      </span>
                      <span className="text-white font-semibold">
                        {getTestTypeDisplay(result.tip)} - {getSubTypeDisplay(result.subTip)}
                      </span>
                      {result.attemptNumber && (
                        <span className="text-[#B0B3C1] text-sm">
                          Pokušaj: {result.attemptNumber}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-[#B0B3C1]">Rezultat</p>
                        <p className="text-white font-semibold">{result.score}%</p>
                      </div>
                      <div>
                        <p className="text-[#B0B3C1]">Tačni odgovori</p>
                        <p className="text-white font-semibold">{result.correctCount}/{result.total}</p>
                      </div>
                      <div>
                        <p className="text-[#B0B3C1]">Vrijeme</p>
                        <p className="text-white font-semibold">{formatTime(result.vrijeme)}</p>
                      </div>
                      <div>
                        <p className="text-[#B0B3C1]">Datum</p>
                        <p className="text-white font-semibold text-sm">{formatDate(result.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onViewDetails(result)}
                    className="ml-4 bg-gradient-to-r from-[#3D9DF6] to-[#56CCF2] px-4 py-2 rounded-xl text-white font-semibold hover:scale-105 transition-transform duration-300"
                  >
                    Detalji
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestResults;