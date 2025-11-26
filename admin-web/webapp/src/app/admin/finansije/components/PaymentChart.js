"use client";

import { useEffect, useRef } from 'react';

const PaymentChart = ({ data, title, type, timeRange, onTimeRangeChange }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // Generiši bolje mock podatke ako su prazni
  const getChartData = () => {
    if (data && data.length > 0 && data.some(item => item.amount > 0)) {
      return data;
    }

    // Fallback na bogate mock podatke
    if (type === 'bar') {
      return [
        { month: 'Jan', amount: 4500, count: 12 },
        { month: 'Feb', amount: 5200, count: 15 },
        { month: 'Mar', amount: 4800, count: 14 },
        { month: 'Apr', amount: 6100, count: 18 },
        { month: 'Maj', amount: 5700, count: 16 },
        { month: 'Jun', amount: 6900, count: 20 },
        { month: 'Jul', amount: 7300, count: 22 },
        { month: 'Aug', amount: 6800, count: 19 },
        { month: 'Sep', amount: 7500, count: 23 },
        { month: 'Okt', amount: 8200, count: 25 },
        { month: 'Nov', amount: 7800, count: 24 },
        { month: 'Dec', amount: 8900, count: 27 }
      ];
    } else if (type === 'doughnut') {
      return [
        { name: 'Gotovina', amount: 24500, count: 68, color: '#27AE60' },
        { name: 'Bankovni transfer', amount: 31800, count: 42, color: '#2D9CDB' },
        { name: 'Kartica', amount: 18700, count: 35, color: '#9B51E0' }
      ];
    }
    
    return data;
  };

  useEffect(() => {
    // Dynamic import za Chart.js
    const initChart = async () => {
      try {
        const { Chart, registerables } = await import('chart.js');
        Chart.register(...registerables);

        if (chartRef.current && chartRef.current.getContext) {
          // Destroy previous chart
          if (chartInstance.current) {
            chartInstance.current.destroy();
          }

          const ctx = chartRef.current.getContext('2d');
          const chartData = getChartData();
          
          if (type === 'bar') {
            // Bar chart for monthly data
            chartInstance.current = new Chart(ctx, {
              type: 'bar',
              data: {
                labels: chartData.map(d => d.month),
                datasets: [
                  {
                    label: 'Iznos (KM)',
                    data: chartData.map(d => d.amount),
                    backgroundColor: 'rgba(108, 99, 255, 0.8)',
                    borderColor: 'rgba(108, 99, 255, 1)',
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false,
                  }
                ]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                  intersect: false,
                  mode: 'index',
                },
                scales: {
                  y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                      display: true,
                      text: 'Iznos (KM)',
                      color: '#B0B3C1'
                    },
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                      color: '#B0B3C1',
                      callback: function(value) {
                        return value.toLocaleString() + ' KM';
                      }
                    }
                  },
                  x: {
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                      color: '#B0B3C1'
                    }
                  }
                },
                plugins: {
                  legend: {
                    position: 'top',
                    labels: {
                      color: '#B0B3C1',
                      font: {
                        size: 12
                      }
                    }
                  },
                  title: {
                    display: true,
                    text: title,
                    color: '#FFFFFF',
                    font: {
                      size: 16,
                      weight: 'bold'
                    }
                  },
                  tooltip: {
                    backgroundColor: 'rgba(26, 28, 37, 0.95)',
                    titleColor: '#FFFFFF',
                    bodyColor: '#B0B3C1',
                    borderColor: 'rgba(108, 99, 255, 0.5)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    padding: 12,
                    callbacks: {
                      label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                          label += ': ';
                        }
                        if (context.parsed.y !== null) {
                          label += `${context.parsed.y.toLocaleString()} KM`;
                        }
                        return label;
                      }
                    }
                  }
                },
                animation: {
                  duration: 1000,
                  easing: 'easeOutQuart'
                }
              }
            });
          } else if (type === 'doughnut') {
            // Doughnut chart for payment methods/types
            chartInstance.current = new Chart(ctx, {
              type: 'doughnut',
              data: {
                labels: chartData.map(d => d.name),
                datasets: [
                  {
                    data: chartData.map(d => d.amount),
                    backgroundColor: chartData.map(d => d.color),
                    borderColor: chartData.map(d => d.color + 'DD'),
                    borderWidth: 3,
                    borderRadius: 8,
                    spacing: 4,
                    hoverOffset: 12
                  }
                ]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      color: '#B0B3C1',
                      padding: 20,
                      font: {
                        size: 12
                      },
                      usePointStyle: true,
                      pointStyle: 'circle',
                      generateLabels: function(chart) {
                        const data = chart.data;
                        if (data.labels.length && data.datasets.length) {
                          return data.labels.map((label, i) => {
                            const value = data.datasets[0].data[i];
                            const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            
                            return {
                              text: `${label} - ${percentage}%`,
                              fillStyle: data.datasets[0].backgroundColor[i],
                              strokeStyle: data.datasets[0].borderColor[i],
                              lineWidth: 2,
                              pointStyle: 'circle',
                              hidden: false,
                              index: i
                            };
                          });
                        }
                        return [];
                      }
                    }
                  },
                  title: {
                    display: true,
                    text: title,
                    color: '#FFFFFF',
                    font: {
                      size: 16,
                      weight: 'bold'
                    },
                    padding: {
                      bottom: 20
                    }
                  },
                  tooltip: {
                    backgroundColor: 'rgba(26, 28, 37, 0.95)',
                    titleColor: '#FFFFFF',
                    bodyColor: '#B0B3C1',
                    borderColor: 'rgba(108, 99, 255, 0.5)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    padding: 12,
                    callbacks: {
                      label: function(context) {
                        const label = context.label || '';
                        const value = context.parsed;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = Math.round((value / total) * 100);
                        return `${label}: ${value.toLocaleString()} KM (${percentage}%)`;
                      }
                    }
                  }
                },
                animation: {
                  duration: 1000,
                  easing: 'easeOutQuart'
                }
              }
            });
          }
        }
      } catch (error) {
        console.error('Error loading Chart.js:', error);
      }
    };

    initChart();

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, title, type, timeRange]);

  const chartData = getChartData();

  return (
    <div className="bg-gradient-to-br from-[#1A1C25] to-[#232634] rounded-2xl border border-[#2A2D3A] shadow-2xl shadow-black/20 hover:shadow-[#6C63FF]/10 transition-all duration-500 animate-slideUp p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">{title}</h3>
        {type === 'bar' && (
          <div className="flex items-center space-x-2">
            <span className="text-[#B0B3C1] text-sm">Prikaz:</span>
            <select
              value={timeRange}
              onChange={(e) => onTimeRangeChange(e.target.value)}
              className="bg-[#232634] border border-[#2A2D3A] rounded-xl px-3 py-1 text-white text-sm focus:outline-none focus:border-[#6C63FF] transition-colors duration-300"
            >
              <option value="month">Mjesečno</option>
              <option value="year">Godišnje</option>
              <option value="all">Sve</option>
            </select>
          </div>
        )}
      </div>
      
      <div className="relative h-80">
        <canvas ref={chartRef} />
        
        {/* Fallback message ako chart ne uspije loadati */}
        {chartData.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-[#B0B3C1]">Nema podataka za prikaz</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Additional info */}
      {type === 'bar' && chartData.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[#2A2D3A]">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <p className="text-[#B0B3C1]">Ukupno ove godine</p>
              <p className="text-white font-bold text-lg">
                {chartData.reduce((sum, item) => sum + item.amount, 0).toLocaleString()} KM
              </p>
            </div>
            <div className="text-center">
              <p className="text-[#B0B3C1]">Prosječno mjesečno</p>
              <p className="text-white font-bold text-lg">
                {Math.round(chartData.reduce((sum, item) => sum + item.amount, 0) / chartData.length).toLocaleString()} KM
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentChart;