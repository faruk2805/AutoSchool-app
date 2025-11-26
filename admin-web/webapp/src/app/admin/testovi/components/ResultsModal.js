const ResultsModal = ({ detailedResults, onClose }) => {
  if (!detailedResults) return null;

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

  const getQuestionText = (questionData) => {
    if (typeof questionData === 'object' && questionData.pitanje) {
      return questionData.pitanje;
    }
    return `Pitanje (ID: ${questionData})`;
  };

  const getCorrectAnswer = (questionData) => {
    if (typeof questionData === 'object' && questionData.opcije) {
      const correctOption = questionData.opcije.find(opt => opt.correct);
      return correctOption ? correctOption.text : 'Nepoznat tačan odgovor';
    }
    return 'Nepoznat tačan odgovor';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-gradient-to-br from-[#1A1C25] to-[#232634] rounded-2xl border border-[#2A2D3A] p-8 shadow-2xl shadow-black/40 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-popIn">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
            <span className="text-2xl">📋</span>
            <span>Detalji testa</span>
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-[#232634] border border-[#2A2D3A] rounded-xl flex items-center justify-center text-white hover:border-[#7A7F96] transition-colors duration-300"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Osnovne informacije */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-[#232634] rounded-xl border border-[#2A2D3A]">
            <div className="text-center">
              <p className="text-[#B0B3C1] text-sm">Tip testa</p>
              <p className="text-white font-semibold">{getTestTypeDisplay(detailedResults.tip)}</p>
            </div>
            <div className="text-center">
              <p className="text-[#B0B3C1] text-sm">Rezultat</p>
              <p className="text-white font-semibold">{detailedResults.score}%</p>
            </div>
            <div className="text-center">
              <p className="text-[#B0B3C1] text-sm">Status</p>
              <p className={`font-semibold ${
                detailedResults.passed ? 'text-[#27AE60]' : 'text-[#FF6B35]'
              }`}>
                {detailedResults.passed ? 'POLOŽIO' : 'PAO'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[#B0B3C1] text-sm">Tačni odgovori</p>
              <p className="text-white font-semibold">{detailedResults.correctCount}/{detailedResults.total}</p>
            </div>
          </div>

          {/* Pitanja i odgovori */}
          {detailedResults.odgovori && detailedResults.odgovori.length > 0 ? (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Pitanja i odgovori ({detailedResults.odgovori.length})</h3>
              <div className="space-y-4">
                {detailedResults.odgovori.map((odgovor, index) => (
                  <div 
                    key={odgovor._id || index}
                    className={`p-4 rounded-xl border ${
                      odgovor.tacno 
                        ? 'border-[#27AE60]/30 bg-[#27AE60]/10' 
                        : 'border-[#FF6B35]/30 bg-[#FF6B35]/10'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                        odgovor.tacno 
                          ? 'bg-[#27AE60] text-white' 
                          : 'bg-[#FF6B35] text-white'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium mb-2">
                          {getQuestionText(odgovor.questionId)}
                        </p>
                        
                        <div className="space-y-2">
                          <div className={`p-2 rounded-lg ${
                            odgovor.tacno 
                              ? 'bg-[#27AE60]/20 border border-[#27AE60]/30' 
                              : 'bg-[#FF6B35]/20 border border-[#FF6B35]/30'
                          }`}>
                            <p className="text-sm text-[#B0B3C1]">Kandidatov odgovor:</p>
                            <p className="text-white">{odgovor.odgovor}</p>
                          </div>
                          
                          {!odgovor.tacno && (
                            <div className="p-2 rounded-lg bg-[#27AE60]/20 border border-[#27AE60]/30">
                              <p className="text-sm text-[#B0B3C1]">Tačan odgovor:</p>
                              <p className="text-white">{getCorrectAnswer(odgovor.questionId)}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📝</div>
              <p className="text-[#B0B3C1]">Nema dostupnih detalja o pitanjima za ovaj test</p>
            </div>
          )}

          {/* Dodatne informacije */}
          <div className="p-4 bg-[#232634] rounded-xl border border-[#2A2D3A]">
            <h3 className="text-lg font-semibold text-white mb-3">Dodatne informacije</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[#B0B3C1]">Datum i vrijeme testa</p>
                <p className="text-white">{formatDate(detailedResults.createdAt)}</p>
              </div>
              <div>
                <p className="text-[#B0B3C1]">Vrijeme trajanja</p>
                <p className="text-white">{formatTime(detailedResults.vrijeme)}</p>
              </div>
              <div>
                <p className="text-[#B0B3C1]">Tip testa</p>
                <p className="text-white">{getTestTypeDisplay(detailedResults.tip)}</p>
              </div>
              <div>
                <p className="text-[#B0B3C1]">Podtip testa</p>
                <p className="text-white">{getSubTypeDisplay(detailedResults.subTip)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-8">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-[#232634] border border-[#2A2D3A] rounded-xl text-white font-semibold hover:border-[#7A7F96] transition-colors duration-300"
          >
            Zatvori
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsModal;