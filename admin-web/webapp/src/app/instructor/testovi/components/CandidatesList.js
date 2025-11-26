const CandidatesList = ({ candidates, selectedCandidate, onCandidateSelect, getCandidateStats }) => {
  const getInitials = (name, surname) => {
    if (!name || !surname) return '??';
    return `${name[0] || ''}${surname[0] || ''}`;
  };

  return (
    <div className="lg:col-span-1">
      <div className="bg-gradient-to-br from-[#1A1C25] to-[#232634] rounded-2xl border border-[#2A2D3A] shadow-2xl shadow-black/20 hover:shadow-[#6C63FF]/10 transition-all duration-500 animate-slideUp">
        <div className="p-6 border-b border-[#2A2D3A]">
          <h3 className="text-xl font-semibold text-white flex items-center space-x-3">
            <span className="text-2xl animate-pulse">👥</span>
            <span>Kandidati ({candidates.length})</span>
          </h3>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {candidates.map((candidate, index) => {
            const stats = getCandidateStats(candidate._id);
            return (
              <div
                key={candidate._id}
                className={`p-4 border-b border-[#2A2D3A] hover:bg-[#232634]/50 transition-all duration-300 cursor-pointer animate-fadeIn ${
                  selectedCandidate?._id === candidate._id ? 'bg-[#232634] border-l-4 border-l-[#6C63FF]' : ''
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => onCandidateSelect(candidate)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#6C63FF] to-[#FF4DA6] rounded-xl flex items-center justify-center text-white font-semibold">
                    {getInitials(candidate.name, candidate.surname)}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold">
                      {candidate.name} {candidate.surname}
                    </p>
                    <p className="text-[#7A7F96] text-sm">
                      {stats.totalTests} testova • {stats.overallAverage}%
                    </p>
                  </div>
                  <div className="flex space-x-1">
                    {candidate.status?.polozio?.teoriju && (
                      <div className="w-6 h-6 bg-gradient-to-br from-[#27AE60] to-[#6FCF97] rounded-full flex items-center justify-center text-white text-xs" title="Položio teoriju">
                        T
                      </div>
                    )}
                    {candidate.status?.polozio?.prvuPomoc && (
                      <div className="w-6 h-6 bg-gradient-to-br from-[#3D9DF6] to-[#56CCF2] rounded-full flex items-center justify-center text-white text-xs" title="Položio prvu pomoć">
                        P
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CandidatesList;