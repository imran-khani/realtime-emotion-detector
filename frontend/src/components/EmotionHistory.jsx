import { useEffect, useRef } from 'react';

const EmotionHistory = ({ history }) => {
  const listRef = useRef(null);

  useEffect(() => {
    // Auto-scroll to the latest emotion
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [history]);

  const getEmotionColor = (emotion) => {
    const colors = {
      happy: 'bg-green-500',
      sad: 'bg-blue-500',
      angry: 'bg-red-500',
      surprised: 'bg-purple-500',
      neutral: 'bg-gray-500',
      unknown: 'bg-yellow-500'
    };
    return colors[emotion] || colors.unknown;
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  if (history.length === 0) {
    return (
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Emotion History</h2>
        <div className="text-center text-gray-500 dark:text-gray-400 py-4">
          No emotion history yet
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4 dark:text-white">Emotion History</h2>
      
      <div 
        ref={listRef}
        className="overflow-y-auto max-h-[300px] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-700 pr-2"
      >
        <div className="space-y-2">
          {history.map((item) => (
            <div 
              key={item.timestamp}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
            >
              <div className={`w-2.5 h-2.5 rounded-full ${getEmotionColor(item.emotion)}`} />
              <div className="text-sm capitalize text-gray-700 dark:text-gray-300 flex-1">
                {item.emotion}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {formatTime(item.timestamp)}
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500">
                {(item.confidence * 100).toFixed(0)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmotionHistory; 