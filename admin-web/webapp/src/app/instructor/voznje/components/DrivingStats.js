export default function DrivingStats({ drivingStats }) {
  const stats = [
    {
      label: "Ukupno vožnji",
      value: drivingStats.totalSessions,
      icon: "📊",
      color: "from-blue-500 to-cyan-500"
    },
    {
      label: "Završene vožnje",
      value: drivingStats.completedSessions,
      icon: "✅",
      color: "from-green-500 to-emerald-500"
    },
    {
      label: "Zakazane vožnje",
      value: drivingStats.scheduledSessions,
      icon: "📅",
      color: "from-purple-500 to-indigo-500"
    },
    {
      label: "Otkazane vožnje",
      value: drivingStats.canceledSessions,
      icon: "❌",
      color: "from-red-500 to-pink-500"
    },
    {
      label: "Ukupno sati",
      value: drivingStats.totalHours,
      icon: "⏱️",
      color: "from-orange-500 to-amber-500"
    },
    {
      label: "Ukupno km",
      value: drivingStats.totalKilometers,
      icon: "🛣️",
      color: "from-teal-500 to-green-500"
    },
    {
      label: "Prosječna ocjena",
      value: drivingStats.averageGrade,
      icon: "⭐",
      color: "from-yellow-500 to-orange-500"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-[#232634]/60 backdrop-blur-lg rounded-xl p-4 border border-[#2A2D3A] hover:border-[#6C63FF]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[#6C63FF]/5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-[#B0B3C1] mt-1">{stat.label}</p>
            </div>
            <div className="text-2xl">{stat.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
}