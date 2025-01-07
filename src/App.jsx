import { useState } from 'react'
import WebcamCapture from './components/WebcamCapture'
import EmotionDisplay from './components/EmotionDisplay'
import EmotionAnalytics from './components/EmotionAnalytics'
import ChatInterface from './components/ChatInterface'

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
      <div className="max-w-7xl mx-auto px-4">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            EmotiSense - Emotion-Aware Chat Assistant
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            AI chat assistant that understands and responds to your emotions in real-time
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <WebcamCapture
              onEmotionDetected={handleEmotionDetected}
              detectionFrequency={1000} // 1 detection per second
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentEmotion && (
                <EmotionDisplay
                  emotion={currentEmotion.emotion}
                  confidence={currentEmotion.confidence}
                />
              )}
              <EmotionAnalytics emotionHistory={emotionHistory} />
            </div>
          </div>

          <div className="lg:col-span-1">
            <ChatInterface
              currentEmotion={currentEmotion?.emotion}
              confidence={currentEmotion?.confidence || 0}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
