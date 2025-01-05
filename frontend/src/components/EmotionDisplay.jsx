const EmotionDisplay = ({ emotion, confidence }) => {
  return (
    <div className="mt-4 p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-2">Detected Emotion</h2>
      <div className="flex items-center justify-between">
        <span className="text-lg capitalize">{emotion}</span>
        <span className="text-sm text-gray-600">
          {(confidence * 100).toFixed(1)}% confident
        </span>
      </div>
    </div>
  );
};

export default EmotionDisplay; 