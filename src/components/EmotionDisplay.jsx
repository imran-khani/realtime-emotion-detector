const EmotionDisplay = ({ emotion, confidence }) => {
  const getEmotionColor = (emotion) => {
    const colors = {
      happy: 'bg-green-50 text-green-700',
      sad: 'bg-blue-50 text-blue-700',
      angry: 'bg-red-50 text-red-700',
      surprised: 'bg-purple-50 text-purple-700',
      neutral: 'bg-gray-50 text-gray-700',
      unknown: 'bg-yellow-50 text-yellow-700'
    };
    return colors[emotion] || colors.unknown;
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.7) return 'text-green-600';
    if (confidence >= 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="mt-4 p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-2">Detected Emotion</h2>
      <div className="flex items-center justify-between">
        <div className={`px-3 py-1 rounded-full ${getEmotionColor(emotion)}`}>
          <span className="text-lg capitalize">{emotion}</span>
        </div>
        {confidence > 0 && (
          <span className={`text-sm ${getConfidenceColor(confidence)}`}>
            {(confidence * 100).toFixed(1)}% confident
          </span>
        )}
      </div>
      
      {emotion === 'unknown' && (
        <p className="mt-2 text-sm text-gray-500">
          No face detected. Please make sure your face is visible in the camera.
        </p>
      )}
    </div>
  );
};

export default EmotionDisplay; 