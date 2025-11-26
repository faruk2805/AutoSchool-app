const CandidateStats = ({ selectedCandidate, candidateStats }) => {
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

  return (
    <div className="bg-gradient-to-br from-[#1A1C25] to-[#232634] rounded-2xl border border-[#2A2D3A] shadow-2xl shadow-black/20 hover:shadow-[#6C63FF]/10 transition-all duration-500 animate-slideUp mb-6">
      <div className="p-6 border-b border-[#2A2D3A]">
        <h3 className="text-xl font-semibold text-white flex items-center space-x-3">
          <span className="text-2xl animate-pulse">📈</span>
          <span>
            Statistika - {selectedCandidate.name} {selectedCandidate.surname}
          </span>
        </h3>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-[#232634] rounded-xl border border-[#2A2D3A]">
            <p className="text-[#B0B3C1] text-sm mb-2">Ukupno testova</p>
            <p className="text-2xl font-bold text-white">{candidateStats.totalTests}</p>
          </div>
          <div className="text-center p-4 bg-[#232634] rounded-xl border border-[#2A2D3A]">
            <p className="text-[#B0B3C1] text-sm mb-2">Položeno</p>
            <p className="text-2xl font-bold text-[#27AE60]">{candidateStats.passedTests}</p>
          </div>
          <div className="text-center p-4 bg-[#232634] rounded-xl border border-[#2A2D3A]">
            <p className="text-[#B0B3C1] text-sm mb-2">Prosječan rezultat</p>
            <p className="text-2xl font-bold text-white">{candidateStats.overallAverage}%</p>
          </div>
          <div className="text-center p-4 bg-[#232634] rounded-xl border border-[#2A2D3A]">
            <p className="text-[#B0B3C1] text-sm mb-2">Uspješnost</p>
            <p className="text-2xl font-bold text-[#3D9DF6]">{candidateStats.successRate}%</p>
          </div>
        </div>

        {/* Grafikoni po kategorijama */}
        <h4 className="text-lg font-semibold text-white mb-4">Performanse po kategorijama</h4>
        <div className="space-y-4">
          {Object.entries(candidateStats.categoryAverages).map(([category, average]) => (
            <div key={category} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#B0B3C1]">{getTestTypeDisplay(category)}</span>
                <span className="text-white font-semibold">{average}%</span>
              </div>
              <div className="w-full bg-[#2A2D3A] rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#6C63FF] to-[#FF4DA6] rounded-full transition-all duration-1000"
                  style={{ width: `${average}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CandidateStats;