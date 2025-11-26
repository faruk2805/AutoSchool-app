const CandidatesList = ({ candidates, selectedCandidate, onCandidateSelect, payments }) => {
  const getPaymentProgress = (candidate) => {
    const total = candidate.totalAmount || 2500;
    const paid = candidate.paidAmount || 0;
    const percentage = Math.round((paid / total) * 100);
    return { percentage, paid, total };
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'bg-[#27AE60]';
    if (percentage >= 50) return 'bg-[#2D9CDB]';
    if (percentage >= 25) return 'bg-[#FF6B35]';
    return 'bg-[#EB5757]';
  };

  const getCandidatePayments = (candidateId) => {
    return payments.filter(payment => payment.user?._id === candidateId);
  };

  return (
    <div className="bg-gradient-to-br from-[#1A1C25] to-[#232634] rounded-2xl border border-[#2A2D3A] shadow-2xl shadow-black/20 hover:shadow-[#6C63FF]/10 transition-all duration-500 animate-slideUp">
      <div className="p-6 border-b border-[#2A2D3A]">
        <h2 className="text-xl font-bold text-white">Lista kandidata</h2>
        <p className="text-[#B0B3C1] text-sm mt-1">Odaberite kandidata za pregled uplata</p>
      </div>
      
      <div className="max-h-[600px] overflow-y-auto">
        {candidates.map((candidate) => {
          const progress = getPaymentProgress(candidate);
          const candidatePayments = getCandidatePayments(candidate._id);
          
          return (
            <div
              key={candidate._id}
              onClick={() => onCandidateSelect(candidate)}
              className={`p-4 border-b border-[#2A2D3A] cursor-pointer transition-all duration-300 hover:bg-[#2A2D3A] group ${
                selectedCandidate?._id === candidate._id 
                  ? 'bg-[#6C63FF]/10 border-l-4 border-l-[#6C63FF]' 
                  : ''
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-white group-hover:text-[#6C63FF] transition-colors duration-300">
                  {candidate.name} {candidate.surname}
                </h3>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-[#2A2D3A] text-[#B0B3C1]">
                  {candidatePayments.length} uplata
                </span>
              </div>
              
              <div className="space-y-2">
                {/* Progress bar */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#B0B3C1]">Napredak uplate:</span>
                  <span className="text-white font-medium">{progress.percentage}%</span>
                </div>
                <div className="w-full bg-[#2A2D3A] rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(progress.percentage)}`}
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
                
                <div className="flex justify-between text-xs text-[#B0B3C1]">
                  <span>Uplaćeno: {progress.paid.toLocaleString()} KM</span>
                  <span>Preostalo: {progress.remainingAmount?.toLocaleString()} KM</span>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#B0B3C1]">{candidate.email}</span>
                  <span className={`px-2 py-1 rounded-full ${
                    progress.percentage === 100 
                      ? 'bg-[#27AE60]/20 text-[#27AE60]' 
                      : progress.percentage >= 50
                      ? 'bg-[#2D9CDB]/20 text-[#2D9CDB]'
                      : 'bg-[#FF6B35]/20 text-[#FF6B35]'
                  }`}>
                    {progress.percentage === 100 ? 'Plaćeno' : 'U toku'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CandidatesList;