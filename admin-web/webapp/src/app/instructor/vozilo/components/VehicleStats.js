const VehicleStats = ({ globalStats, hoveredCard, onHover }) => {
  const stats = [
    {
      id: 'total',
      title: 'Ukupno vozila',
      value: globalStats.totalVehicles,
      icon: '🚗',
      color: 'from-[#6C63FF] to-[#8B85FF]',
      description: 'Ukupan broj vozila u floti'
    },
    {
      id: 'active',
      title: 'Aktivna vozila',
      value: globalStats.activeVehicles,
      icon: '✅',
      color: 'from-[#27AE60] to-[#2ECC71]',
      description: 'Vozila u upotrebi'
    },
    {
      id: 'maintenance',
      title: 'Na servisu',
      value: globalStats.maintenanceVehicles,
      icon: '🔧',
      color: 'from-[#FF6B35] to-[#FF8E53]',
      description: 'Vozila na održavanju'
    },
    {
      id: 'mileage',
      title: 'Prosječna kilometraža',
      value: `${globalStats.averageMileage.toLocaleString()} km`,
      icon: '📊',
      color: 'from-[#2D9CDB] to-[#56CCF2]',
      description: 'Prosječno pređena kilometraža'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div
          key={stat.id}
          className={`bg-gradient-to-br ${stat.color} rounded-2xl p-6 border border-white/10 shadow-2xl shadow-black/20 backdrop-blur-sm transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-[#6C63FF]/20 cursor-pointer ${
            hoveredCard === stat.id ? 'scale-105 shadow-2xl shadow-[#6C63FF]/20' : ''
          }`}
          onMouseEnter={() => onHover(stat.id)}
          onMouseLeave={() => onHover(null)}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium mb-2">{stat.title}</p>
              <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-white/60 text-xs">{stat.description}</p>
            </div>
            <div className="text-4xl opacity-80">{stat.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VehicleStats;