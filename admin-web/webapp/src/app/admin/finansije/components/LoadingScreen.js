const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F111A] via-[#1A1C25] to-[#232634] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#6C63FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white text-lg">Učitavanje uplata...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;