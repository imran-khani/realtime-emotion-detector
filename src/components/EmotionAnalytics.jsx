import { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const EmotionAnalytics = ({ emotionHistory }) => {
  const [emotionData, setEmotionData] = useState([]);
  const [dominantEmotion, setDominantEmotion] = useState(null);
  const [emotionTransitions, setEmotionTransitions] = useState([]);
  const [compressionRatio, setCompressionRatio] = useState(1);
  const chartRef = useRef(null);

  // Process emotion data for visualization
  // Modified to support both original format (with expressions) and
  // optimized format (with single emotion/confidence entries)
  useEffect(() => {
    if (!emotionHistory.length) return;

    // Calculate dominant emotion
    const emotionCounts = emotionHistory.reduce((acc, entry) => {
      acc[entry.emotion] = (acc[entry.emotion] || 0) + 1;
      return acc;
    }, {});
    
    const dominant = Object.entries(emotionCounts)
      .reduce((a, b) => (a[1] > b[1] ? a : b))[0];
    setDominantEmotion(dominant);

    // Calculate emotion transitions
    const transitions = [];
    for (let i = 1; i < emotionHistory.length; i++) {
      const from = emotionHistory[i - 1].emotion;
      const to = emotionHistory[i].emotion;
      if (from !== to) {
        transitions.push({ from, to, timestamp: emotionHistory[i].timestamp });
      }
    }
    setEmotionTransitions(transitions.slice(-3));

    // Group emotions by timestamp for chart compatibility
    const timeGroups = {};
    
    emotionHistory.forEach(entry => {
      // Format the timestamp for display
      const timeKey = new Date(entry.timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      });
      
      // Initialize the time group if it doesn't exist
      if (!timeGroups[timeKey]) {
        timeGroups[timeKey] = {
          timestamp: timeKey,
          happy: 0,
          sad: 0,
          angry: 0,
          surprised: 0,
          fearful: 0,
          disgusted: 0,
          neutral: 0
        };
      }
      
      // Set the emotion value
      if (entry.expressions) {
        // Original format with expressions object
        Object.assign(timeGroups[timeKey], entry.expressions);
      } else {
        // Optimized format with just emotion and confidence
        timeGroups[timeKey][entry.emotion] = entry.confidence;
      }
    });
    
    // Set compression ratio if we have aggregated data
    const aggregatedCount = emotionHistory.filter(e => e.isAggregated).length;
    if (aggregatedCount > 0) {
      const totalSamples = emotionHistory.reduce((sum, e) => sum + (e.sampleCount || 1), 0);
      setCompressionRatio(totalSamples / emotionHistory.length);
    } else {
      setCompressionRatio(1);
    }
    
    // Convert to array for the chart
    setEmotionData(Object.values(timeGroups));
  }, [emotionHistory]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 300
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12
          },
          color: '#6B7280'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.8)',
        padding: 12,
        titleFont: {
          size: 14
        },
        bodyFont: {
          size: 13
        },
        borderColor: 'rgba(107, 114, 128, 0.2)',
        borderWidth: 1
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 1,
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 11
          },
          padding: 8,
          stepSize: 0.2
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 11
          },
          maxRotation: 45,
          minRotation: 45
        }
      }
    }
  };

  const getChartData = () => ({
    labels: emotionData.map(d => d.timestamp),
    datasets: [
      {
        label: 'Happy',
        data: emotionData.map(d => d.happy),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderWidth: 2,
        pointRadius: 1,
        pointHoverRadius: 5,
        tension: 0.4
      },
      {
        label: 'Sad',
        data: emotionData.map(d => d.sad),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderWidth: 2,
        pointRadius: 1,
        pointHoverRadius: 5,
        tension: 0.4
      },
      {
        label: 'Angry',
        data: emotionData.map(d => d.angry),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        borderWidth: 2,
        pointRadius: 1,
        pointHoverRadius: 5,
        tension: 0.4
      },
      {
        label: 'Surprised',
        data: emotionData.map(d => d.surprised),
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.5)',
        borderWidth: 2,
        pointRadius: 1,
        pointHoverRadius: 5,
        tension: 0.4
      }
    ]
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Recent Transitions
          </h3>
          <div className="space-y-2 max-h-[120px] overflow-y-auto">
            {emotionTransitions.map((transition, idx) => (
              <div key={idx} className="flex items-center text-sm text-gray-600 dark:text-gray-400 flex-wrap gap-2">
                <span className="capitalize">{transition.from}</span>
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <span className="capitalize">{transition.to}</span>
                <span className="text-gray-400 dark:text-gray-500 ml-auto">
                  {new Date(transition.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            ))}
            {emotionTransitions.length === 0 && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                No transitions yet
              </div>
            )}
          </div>
          
          {/* Compression ratio only shown when compression is active */}
          {compressionRatio > 1.1 && (
            <div className="mt-3 border-t pt-2 border-gray-200 dark:border-gray-700">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">Data optimization:</span>
                <span className="font-medium text-gray-600 dark:text-gray-300">
                  {compressionRatio.toFixed(1)}x compression
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
        <div className="w-full h-[400px] min-h-[300px]">
          <Line ref={chartRef} options={{
            ...chartOptions,
            maintainAspectRatio: false,
            responsive: true,
            scales: {
              ...chartOptions.scales,
              x: {
                ...chartOptions.scales.x,
                ticks: {
                  ...chartOptions.scales.x.ticks,
                  maxRotation: 45,
                  minRotation: 45,
                  autoSkip: true,
                  maxTicksLimit: window.innerWidth < 768 ? 6 : 12
                }
              }
            }
          }} data={getChartData()} />
        </div>
      </div>
    </div>
  );
};

export default EmotionAnalytics;