import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  FaceSmileIcon,
  HeartIcon,
  CalendarDaysIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
  ClockIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const [emotionHistory, setEmotionHistory] = useState([]);
  const [timeRange, setTimeRange] = useState('week'); // week, month, year
  const [selectedEmotion, setSelectedEmotion] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('emotionHistory');
    if (saved) {
      setEmotionHistory(JSON.parse(saved));
    }
  }, []);

  // Calculate statistics
  const getEmotionStats = () => {
    if (!emotionHistory.length) return null;

    const now = Date.now();
    let cutoffTime;
    
    switch (timeRange) {
      case 'week':
        cutoffTime = now - 7 * 24 * 60 * 60 * 1000;
        break;
      case 'month':
        cutoffTime = now - 30 * 24 * 60 * 60 * 1000;
        break;
      case 'year':
        cutoffTime = now - 365 * 24 * 60 * 60 * 1000;
        break;
      default:
        cutoffTime = 0;
    }

    const filteredHistory = emotionHistory.filter(entry => entry.timestamp >= cutoffTime);
    
    const emotionCounts = filteredHistory.reduce((acc, entry) => {
      acc[entry.emotion] = (acc[entry.emotion] || 0) + 1;
      return acc;
    }, {});

    const totalCount = filteredHistory.length;
    const dominantEmotion = Object.entries(emotionCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0];

    const averageConfidence = filteredHistory.reduce((sum, entry) => 
      sum + entry.confidence, 0) / totalCount;

    // Calculate emotion trends
    const trends = calculateTrends(filteredHistory, timeRange);

    return {
      emotionCounts,
      totalCount,
      dominantEmotion,
      averageConfidence,
      trends,
      filteredHistory
    };
  };

  const calculateTrends = (history, range) => {
    const trends = {};
    const now = new Date();
    
    history.forEach(entry => {
      const date = new Date(entry.timestamp);
      let key;
      
      if (range === 'week') {
        key = `${date.getMonth()}/${date.getDate()} ${date.getHours()}:00`;
      } else if (range === 'month') {
        key = `${date.getMonth() + 1}/${date.getDate()}`;
      } else {
        key = `${date.getMonth() + 1}/${date.getFullYear()}`;
      }
      
      if (!trends[key]) {
        trends[key] = {};
      }
      
      trends[key][entry.emotion] = (trends[key][entry.emotion] || 0) + 1;
    });
    
    return trends;
  };

  const stats = getEmotionStats();

  // Chart configurations
  const emotionColors = {
    happy: '#10B981',
    sad: '#6366F1',
    angry: '#EF4444',
    fearful: '#F59E0B',
    disgusted: '#8B5CF6',
    surprised: '#EC4899',
    neutral: '#6B7280'
  };

  const lineChartData = {
    labels: stats ? Object.keys(stats.trends) : [],
    datasets: stats ? Object.keys(emotionColors).map(emotion => ({
      label: emotion.charAt(0).toUpperCase() + emotion.slice(1),
      data: Object.entries(stats.trends).map(([time, emotions]) => emotions[emotion] || 0),
      borderColor: emotionColors[emotion],
      backgroundColor: emotionColors[emotion] + '20',
      tension: 0.3,
      fill: true
    })) : []
  };

  const pieChartData = {
    labels: stats ? Object.keys(stats.emotionCounts) : [],
    datasets: [{
      data: stats ? Object.values(stats.emotionCounts) : [],
      backgroundColor: stats ? Object.keys(stats.emotionCounts).map(emotion => emotionColors[emotion]) : [],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      }
    }
  };

  const statCards = [
    {
      title: 'Total Emotions',
      value: stats?.totalCount || 0,
      icon: FaceSmileIcon,
      color: 'indigo',
      trend: '+12%'
    },
    {
      title: 'Dominant Emotion',
      value: stats?.dominantEmotion || 'None',
      icon: FireIcon,
      color: emotionColors[stats?.dominantEmotion] || 'gray',
      description: `${((stats?.emotionCounts[stats?.dominantEmotion] / stats?.totalCount) * 100).toFixed(0)}% of the time`
    },
    {
      title: 'Confidence Average',
      value: stats ? `${(stats.averageConfidence * 100).toFixed(0)}%` : 'N/A',
      icon: ArrowTrendingUpIcon,
      color: 'green',
      trend: '+5%'
    },
    {
      title: 'Emotional Stability',
      value: stats ? calculateStability(stats.filteredHistory) : 'N/A',
      icon: HeartIcon,
      color: 'purple',
      description: 'Based on variation'
    }
  ];

  function calculateStability(history) {
    if (!history || history.length < 2) return 'N/A';
    
    let changes = 0;
    for (let i = 1; i < history.length; i++) {
      if (history[i].emotion !== history[i-1].emotion) {
        changes++;
      }
    }
    
    const changeRate = changes / history.length;
    if (changeRate < 0.2) return 'Very Stable';
    if (changeRate < 0.4) return 'Stable';
    if (changeRate < 0.6) return 'Variable';
    return 'Highly Variable';
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Emotion Dashboard
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Track and analyze your emotional patterns over time
            </p>
          </div>

          {/* Time Range Selector */}
          <div className="mb-6 flex justify-end">
            <div className="inline-flex rounded-lg shadow-sm" role="group">
              {['week', 'month', 'year'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 text-sm font-medium ${
                    timeRange === range
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  } ${
                    range === 'week' ? 'rounded-l-lg' : ''
                  } ${
                    range === 'year' ? 'rounded-r-lg' : ''
                  } border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <stat.icon 
                    className="w-8 h-8" 
                    style={{ color: typeof stat.color === 'string' && stat.color.startsWith('#') ? stat.color : undefined }}
                  />
                  {stat.trend && (
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                      {stat.trend}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {stat.title}
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stat.value}
                </p>
                {stat.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {stat.description}
                  </p>
                )}
              </motion.div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Line Chart - Emotion Trends */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Emotion Trends
              </h3>
              <div className="h-80">
                {stats ? (
                  <Line data={lineChartData} options={chartOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    No data available
                  </div>
                )}
              </div>
            </div>

            {/* Pie Chart - Emotion Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Emotion Distribution
              </h3>
              <div className="h-80">
                {stats ? (
                  <Doughnut data={pieChartData} options={{
                    ...chartOptions,
                    cutout: '50%'
                  }} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    No data available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Emotions */}
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Recent Emotions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {emotionHistory.slice(-9).reverse().map((entry, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: emotionColors[entry.emotion] }}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {entry.emotion.charAt(0).toUpperCase() + entry.emotion.slice(1)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(entry.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {(entry.confidence * 100).toFixed(0)}%
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;