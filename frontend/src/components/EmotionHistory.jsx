import { useEffect, useRef } from 'react';

const EmotionHistory = ({ history }) => {
  const timelineRef = useRef(null);

  useEffect(() => {
    // Auto-scroll to the latest emotion
    if (timelineRef.current) {
      timelineRef.current.scrollLeft = timelineRef.current.scrollWidth;
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
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="mt-6 bg-white rounded-lg shadow-md p-4">
      <h2 className="text-xl font-semibold mb-4">Emotion Timeline</h2>
      
      <div 
        ref={timelineRef}
        className="flex gap-2 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
      >
        {history.map((item, index) => (
          <div 
            key={item.timestamp} 
            className="flex-shrink-0 flex flex-col items-center"
          >
            <div className={`w-4 h-4 rounded-full ${getEmotionColor(item.emotion)}`} />
            {index % 2 === 0 && (
              <div className="mt-1 text-xs text-gray-500">
                {formatTime(item.timestamp)}
              </div>
            )}
            <div className="text-sm capitalize mt-1">
              {item.emotion}
            </div>
          </div>
        ))}
      </div>

      {history.length === 0 && (
        <div className="text-center text-gray-500 py-4">
          No emotion history yet
        </div>
      )}
    </div>
  );
};

export default EmotionHistory; 