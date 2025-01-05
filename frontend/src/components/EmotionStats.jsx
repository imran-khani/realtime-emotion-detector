import { useMemo } from 'react';

const EmotionStats = ({ history }) => {
  const stats = useMemo(() => {
    const counts = history.reduce((acc, item) => {
      acc[item.emotion] = (acc[item.emotion] || 0) + 1;
      return acc;
    }, {});

    const total = history.length;
    const percentages = Object.entries(counts).map(([emotion, count]) => ({
      emotion,
      count,
      percentage: (count / total) * 100
    })).sort((a, b) => b.count - a.count);

    // Calculate dominant emotion
    const dominantEmotion = percentages[0]?.emotion || 'N/A';

    // Calculate average confidence
    const avgConfidence = history.reduce((sum, item) => sum + item.confidence, 0) / total || 0;

    return {
      percentages,
      dominantEmotion,
      avgConfidence,
      total
    };
  }, [history]);

  const getEmotionColor = (emotion) => {
    const colors = {
      happy: 'bg-green-100 border-green-500',
      sad: 'bg-blue-100 border-blue-500',
      angry: 'bg-red-100 border-red-500',
      surprised: 'bg-purple-100 border-purple-500',
      neutral: 'bg-gray-100 border-gray-500',
      unknown: 'bg-yellow-100 border-yellow-500'
    };
    return colors[emotion] || colors.unknown;
  };

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 bg-white rounded-lg shadow-md p-4">
      <h2 className="text-xl font-semibold mb-4">Emotion Analytics</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-200">
          <div className="text-sm text-indigo-600">Dominant Emotion</div>
          <div className="text-lg font-semibold capitalize">{stats.dominantEmotion}</div>
        </div>
        <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-200">
          <div className="text-sm text-indigo-600">Average Confidence</div>
          <div className="text-lg font-semibold">
            {(stats.avgConfidence * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {stats.percentages.map(({ emotion, count, percentage }) => (
          <div key={emotion} className={`p-2 rounded-lg border ${getEmotionColor(emotion)}`}>
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium capitalize">{emotion}</span>
              <span className="text-sm text-gray-600">
                {count} times ({percentage.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-current"
                style={{ 
                  width: `${percentage}%`,
                  backgroundColor: getEmotionBarColor(emotion)
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const getEmotionBarColor = (emotion) => {
  const colors = {
    happy: '#22c55e',    // green-500
    sad: '#3b82f6',      // blue-500
    angry: '#ef4444',    // red-500
    surprised: '#a855f7', // purple-500
    neutral: '#6b7280',  // gray-500
    unknown: '#eab308'   // yellow-500
  };
  return colors[emotion] || colors.unknown;
};

export default EmotionStats; 