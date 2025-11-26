const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F111A] via-[#1A1C25] to-[#232634] flex items-center justify-center relative overflow-hidden">
      {/* Loading animacija */}
      <div className="relative z-10 text-center">
        <div className="relative mb-8">
          <div className="w-32 h-32 bg-gradient-to-br from-[#6C63FF] to-[#FF4DA6] rounded-3xl flex items-center justify-center mx-auto mb-6 relative overflow-hidden shadow-2xl shadow-[#6C63FF]/40">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-shimmer"></div>
            <span className="text-4xl animate-pulse-slow">📊</span>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-white bg-gradient-to-r from-[#6C63FF] via-[#FF4DA6] to-[#3D9DF6] bg-clip-text text-transparent animate-gradient-text">
            Učitavanje rezultata
          </h1>
          <div className="h-8 flex items-center justify-center">
            <p className="text-[#B0B3C1] text-lg font-light animate-typing overflow-hidden whitespace-nowrap border-r-4 border-r-[#6C63FF] w-0 mx-auto">
              Pripremam pregled testova...
            </p>
          </div>
        </div>

        <div className="mt-8 w-64 mx-auto">
          <div className="w-full bg-[#232634] rounded-full h-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#6C63FF] to-[#FF4DA6] rounded-full animate-loading-bar"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;