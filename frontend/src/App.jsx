import { useState, useCallback } from 'react'
import WebcamCapture from './components/WebcamCapture'
import EmotionDisplay from './components/EmotionDisplay'
import EmotionHistory from './components/EmotionHistory'
import EmotionStats from './components/EmotionStats'
import Settings from './components/Settings'
import LandingPage from './components/LandingPage'

function App() {
  const [showDemo, setShowDemo] = useState(false);
  const [emotionData, setEmotionData] = useState({
    emotion: 'neutral',
    confidence: 0
  });
  const [emotionHistory, setEmotionHistory] = useState([]);
  const [detectionFrequency, setDetectionFrequency] = useState(2000);
  const [isAutoDetecting, setIsAutoDetecting] = useState(true);
  const maxHistoryLength = 50;

  const handleEmotionDetected = useCallback((data) => {
    if (data.error) {
      console.error('Emotion detection error:', data.error);
      return;
    }

    setEmotionData(data);
    setEmotionHistory(prevHistory => {
      const newHistory = [
        ...prevHistory,
        { ...data, timestamp: Date.now() }
      ];
      return newHistory.slice(-maxHistoryLength);
    });
  }, []);

  const handleClearHistory = useCallback(() => {
    setEmotionHistory([]);
  }, []);

  const handleDownloadHistory = useCallback(() => {
    const historyData = JSON.stringify(emotionHistory, null, 2);
    const blob = new Blob([historyData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emotion-history-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [emotionHistory]);

  const handleFrequencyChange = useCallback((newFrequency) => {
    setDetectionFrequency(newFrequency);
  }, []);

  const handleAutoDetectToggle = useCallback(() => {
    setIsAutoDetecting(prev => !prev);
  }, []);

  if (!showDemo) {
    return <LandingPage onStartDemo={() => setShowDemo(true)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Emotion Detection Demo
          </h1>
          <button
            onClick={() => setShowDemo(false)}
            className="text-gray-600 hover:text-gray-800 font-medium"
          >
            ← Back to Home
          </button>
        </div>
        
        <div className="grid gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <WebcamCapture 
              onEmotionDetected={handleEmotionDetected}
              detectionFrequency={detectionFrequency}
              isAutoDetecting={isAutoDetecting}
            />
            <EmotionDisplay 
              emotion={emotionData.emotion} 
              confidence={emotionData.confidence} 
            />
          </div>

          <Settings
            detectionFrequency={detectionFrequency}
            onFrequencyChange={handleFrequencyChange}
            isAutoDetecting={isAutoDetecting}
            onAutoDetectToggle={handleAutoDetectToggle}
          />

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">History & Analytics</h2>
              <div className="flex gap-2">
                <button
                  onClick={handleClearHistory}
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                >
                  Clear History
                </button>
                <button
                  onClick={handleDownloadHistory}
                  className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-md transition-colors"
                >
                  Download History
                </button>
              </div>
            </div>

            <EmotionHistory history={emotionHistory} />
            <EmotionStats history={emotionHistory} />
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Tips for Best Results</h2>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center">
                <span className="mr-2">💡</span>
                Ensure good lighting on your face
              </li>
              <li className="flex items-center">
                <span className="mr-2">🎯</span>
                Face the camera directly
              </li>
              <li className="flex items-center">
                <span className="mr-2">📏</span>
                Keep your face centered in the frame
              </li>
              <li className="flex items-center">
                <span className="mr-2">⚡</span>
                Adjust detection frequency for optimal performance
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
