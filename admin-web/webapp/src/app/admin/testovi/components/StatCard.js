const StatCard = ({ title, value, trend, icon, color, trendColor, description, index, hoveredCard, onHover }) => {
  return (
    <div 
      className={`bg-gradient-to-br from-[#1A1C25] to-[#232634] rounded-2xl border border-[#2A2D3A] p-6 shadow-2xl shadow-black/20 hover:shadow-[#6C63FF]/10 transition-all duration-500 animate-slideUp ${
        hoveredCard === index ? 'scale-105 border-[#6C63FF]/40' : 'hover:scale-105 hover:border-[#6C63FF]/20'
      }`}
      style={{ animationDelay: `${index * 100}ms` }}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center text-white text-xl shadow-lg`}>
          {icon}
        </div>
        <div className={`text-right ${trendColor} font-semibold`}>
          {trend}
        </div>
      </div>
      
      <h3 className="text-2xl font-bold text-white mb-2">{value}</h3>
      <p className="text-[#B0B3C1] text-sm">{title}</p>
      <p className="text-[#7A7F96] text-xs mt-2">{description}</p>
    </div>
  );
};

export default StatCard;