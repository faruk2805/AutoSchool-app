const PaymentsList = ({ payments, selectedCandidate, onAddPayment }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('bs-BA');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-[#27AE60] text-white';
      case 'pending': return 'bg-[#FF6B35] text-white';
      case 'failed': return 'bg-[#EB5757] text-white';
      default: return 'bg-[#B0B3C1] text-[#1A1C25]';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Završeno';
      case 'pending': return 'Na čekanju';
      case 'failed': return 'Neuspješno';
      default: return status;
    }
  };

  const getMethodText = (method) => {
    switch (method) {
      case 'cash': return 'Gotovina';
      case 'bank_transfer': return 'Bankovni transfer';
      case 'card': return 'Kartica';
      default: return method;
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'deposit': return 'Depozit';
      case 'instalment': return 'Rata';
      case 'full': return 'Puna uplata';
      default: return type;
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#1A1C25] to-[#232634] rounded-2xl border border-[#2A2D3A] shadow-2xl shadow-black/20 hover:shadow-[#6C63FF]/10 transition-all duration-500 animate-slideUp">
      <div className="p-6 border-b border-[#2A2D3A]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">
              {selectedCandidate ? `Uplate - ${selectedCandidate.name} ${selectedCandidate.surname}` : 'Sve uplate'}
            </h2>
            <p className="text-[#B0B3C1] text-sm mt-1">
              {selectedCandidate ? `Ukupno uplaćeno: ${selectedCandidate.paidAmount?.toLocaleString()} KM` : `Ukupno uplata: ${payments.length}`}
            </p>
          </div>
          <button
            onClick={onAddPayment}
            className="bg-[#6C63FF] text-white px-4 py-2 rounded-xl hover:bg-[#5A52D5] transition-colors duration-300 text-sm font-medium"
          >
            + Dodaj uplatu
          </button>
        </div>
      </div>
      
      <div className="max-h-[600px] overflow-y-auto">
        {payments.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💰</div>
            <p className="text-[#B0B3C1] text-lg">
              {selectedCandidate ? 'Nema uplata za ovog kandidata' : 'Nema evidentiranih uplata'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#2A2D3A]">
            {payments.map((payment) => (
              <div
                key={payment._id}
                className="p-6 hover:bg-[#2A2D3A]/50 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {getStatusText(payment.status)}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#6C63FF]/20 text-[#6C63FF] border border-[#6C63FF]/30">
                        {getTypeText(payment.type)}
                      </span>
                    </div>
                    <span className="text-[#B0B3C1] text-sm">
                      {formatDate(payment.date)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-white">
                      {payment.amount?.toLocaleString()} KM
                    </span>
                    <p className="text-[#B0B3C1] text-sm">
                      {getMethodText(payment.method)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium group-hover:text-[#6C63FF] transition-colors duration-300">
                      {payment.description}
                    </p>
                    {!selectedCandidate && payment.user && (
                      <p className="text-[#B0B3C1] text-sm mt-1">
                        Kandidat: {payment.user.name} {payment.user.surname}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-[#B0B3C1] text-sm">
                      {formatDate(payment.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentsList;