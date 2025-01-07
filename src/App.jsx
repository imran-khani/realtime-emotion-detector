import { useState } from 'react'
import WebcamCapture from './components/WebcamCapture'
import EmotionDisplay from './components/EmotionDisplay'
import EmotionAnalytics from './components/EmotionAnalytics'

function App() {
  const [currentEmotion, setCurrentEmotion] = useState(null);
  const [emotionHistory, setEmotionHistory] = useState([]);

  const handleEmotionDetected = (emotionData) => {
    setCurrentEmotion({
      emotion: emotionData.emotion,
      confidence: emotionData.confidence
    });

    // Add to history
    setEmotionHistory(prev => [...prev, {
      emotion: emotionData.emotion,
      confidence: emotionData.confidence,
      timestamp: emotionData.timestamp,
      expressions: emotionData.expressions
    }].slice(-300)); // Keep last 5 minutes of data (at 1 sample per second)
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            EmotiSense - Real-time Emotion Analytics
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Advanced emotion detection with real-time analytics and insights
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <WebcamCapture
              onEmotionDetected={handleEmotionDetected}
              detectionFrequency={1000} // 1 detection per second
            />
            {currentEmotion && (
              <EmotionDisplay
                emotion={currentEmotion.emotion}
                confidence={currentEmotion.confidence}
              />
            )}
          </div>

          <div>
            <EmotionAnalytics emotionHistory={emotionHistory} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
