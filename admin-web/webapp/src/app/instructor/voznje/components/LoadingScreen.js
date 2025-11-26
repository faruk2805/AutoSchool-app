export default function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0F111A] via-[#1A1C25] to-[#232634]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#6C63FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white text-lg">Učitavanje...</p>
      </div>
    </div>
  );
}