import StatCard from "./StatCard";

const GlobalStats = ({ globalStats, hoveredCard, onHover }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard 
        title="Ukupno testova" 
        value={globalStats.totalTests.toString()} 
        trend={`${globalStats.successRate}% uspješnost`}
        icon="📊"
        color="from-[#6C63FF] to-[#FF4DA6]"
        trendColor="text-[#27AE60]"
        description="Svi odrađeni testovi"
        index={0}
        hoveredCard={hoveredCard}
        onHover={onHover}
      />
      <StatCard 
        title="Položeno testova" 
        value={globalStats.passedTests.toString()} 
        trend={`${globalStats.passedTests}/${globalStats.totalTests}`}
        icon="✅"
        color="from-[#27AE60] to-[#6FCF97]"
        trendColor="text-[#27AE60]"
        description="Prolazni rezultati"
        index={1}
        hoveredCard={hoveredCard}
        onHover={onHover}
      />
      <StatCard 
        title="Prosječan rezultat" 
        value={`${globalStats.averageScore}%`} 
        trend="Ocjena"
        icon="⭐"
        color="from-[#3D9DF6] to-[#56CCF2]"
        trendColor="text-[#3D9DF6]"
        description="Prosječan postotak"
        index={2}
        hoveredCard={hoveredCard}
        onHover={onHover}
      />
      <StatCard 
        title="Aktivni kandidati" 
        value={globalStats.totalCandidates.toString()} 
        trend="U sistemu"
        icon="👥"
        color="from-[#FF6B35] to-[#FF9D6C]"
        trendColor="text-[#FF6B35]"
        description="Svi kandidati"
        index={3}
        hoveredCard={hoveredCard}
        onHover={onHover}
      />
    </div>
  );
};

export default GlobalStats;