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
  const [timeRange, setTimeRange] = useState('1m'); // 1m, 5m, 15m, 30m
  const [dominantEmotion, setDominantEmotion] = useState(null);
  const [emotionTransitions, setEmotionTransitions] = useState([]);
  
  // Process emotion data for visualization
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
    setEmotionTransitions(transitions);

    // Prepare chart data
    const chartData = emotionHistory.map(entry => ({
      timestamp: new Date(entry.timestamp).toLocaleTimeString(),
      ...entry.expressions
    }));
    setEmotionData(chartData);
  }, [emotionHistory]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Emotion Intensity Over Time'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 1
      }
    }
  };

  const getChartData = () => ({
    labels: emotionData.map(d => d.timestamp),
    datasets: [
      {
        label: 'Happy',
        data: emotionData.map(d => d.happy),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.4
      },
      {
        label: 'Sad',
        data: emotionData.map(d => d.sad),
        borderColor: 'rgb(54, 162, 235)',
        tension: 0.4
      },
      {
        label: 'Angry',
        data: emotionData.map(d => d.angry),
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.4
      },
      {
        label: 'Surprised',
        data: emotionData.map(d => d.surprised),
        borderColor: 'rgb(153, 102, 255)',
        tension: 0.4
      }
    ]
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Emotion Summary</h3>
          <p className="text-gray-600">Dominant Emotion: 
            <span className="font-semibold ml-2 capitalize">{dominantEmotion}</span>
          </p>
          <p className="text-gray-600">Emotion Changes: 
            <span className="font-semibold ml-2">{emotionTransitions.length}</span>
          </p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Time Range</h3>
          <div className="flex gap-2">
            {['1m', '5m', '15m', '30m'].map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded ${
                  timeRange === range 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-[400px]">
        <Line options={chartOptions} data={getChartData()} />
      </div>

      {emotionTransitions.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Recent Emotion Transitions</h3>
          <div className="space-y-2">
            {emotionTransitions.slice(-3).map((transition, idx) => (
              <div key={idx} className="flex items-center text-sm text-gray-600">
                <span className="capitalize">{transition.from}</span>
                <svg className="w-4 h-4 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <span className="capitalize">{transition.to}</span>
                <span className="ml-2 text-gray-400">
                  {new Date(transition.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmotionAnalytics; 