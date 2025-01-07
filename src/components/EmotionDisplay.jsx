const EmotionDisplay = ({ emotion, confidence }) => {
  const getEmotionColor = (emotion) => {
    const colors = {
      happy: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
      sad: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
      angry: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
      surprised: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800',
      neutral: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800',
      fearful: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800',
      disgusted: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800'
    };
    return colors[emotion] || colors.neutral;
  };

  const getEmotionEmoji = (emotion) => {
    const emojis = {
      happy: '😊',
      sad: '😢',
      angry: '😠',
      surprised: '😮',
      neutral: '😐',
      fearful: '😨',
      disgusted: '🤢'
    };
    return emojis[emotion] || '😐';
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.7) return 'text-green-600 dark:text-green-400';
    if (confidence >= 0.4) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="space-y-4">
      <div className={`p-4 rounded-lg border ${getEmotionColor(emotion)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl" role="img" aria-label={emotion}>
              {getEmotionEmoji(emotion)}
            </span>
            <span className="text-lg font-medium capitalize">
              {emotion}
            </span>
          </div>
          <div className={`text-sm font-medium ${getConfidenceColor(confidence)}`}>
            {(confidence * 100).toFixed(0)}% confident
          </div>
        </div>
      </div>

      {/* Confidence Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Confidence Level</span>
          <span>{(confidence * 100).toFixed(0)}%</span>
        </div>
        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-400 dark:to-indigo-500 transition-all duration-500 ease-out"
            style={{ width: `${confidence * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default EmotionDisplay; 