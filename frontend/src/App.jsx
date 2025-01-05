import { useState, useCallback } from 'react'
import WebcamCapture from './components/WebcamCapture'
import EmotionDisplay from './components/EmotionDisplay'
import EmotionHistory from './components/EmotionHistory'
import EmotionStats from './components/EmotionStats'

function App() {
  const [emotionData, setEmotionData] = useState({
    emotion: 'neutral',
    confidence: 0
  });
  const [emotionHistory, setEmotionHistory] = useState([]);
  const maxHistoryLength = 50; // Keep last 50 emotions

  const handleEmotionDetected = useCallback((data) => {
    if (data.error) {
      console.error('Emotion detection error:', data.error);
      return;
    }

    // Update current emotion
    setEmotionData(data);

    // Add to history with timestamp
    setEmotionHistory(prevHistory => {
      const newHistory = [
        ...prevHistory,
        { ...data, timestamp: Date.now() }
      ];
      
      // Keep only the last maxHistoryLength items
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

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          Real-time Emotion Detection
        </h1>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <WebcamCapture onEmotionDetected={handleEmotionDetected} />
          <EmotionDisplay 
            emotion={emotionData.emotion} 
            confidence={emotionData.confidence} 
          />
          
          <div className="flex justify-end gap-2 mt-4">
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

          <EmotionHistory history={emotionHistory} />
          <EmotionStats history={emotionHistory} />
          
          <div className="mt-4 text-sm text-gray-500">
            <p>Note: For best results:</p>
            <ul className="list-disc ml-5 mt-1">
              <li>Ensure good lighting on your face</li>
              <li>Face the camera directly</li>
              <li>Keep your face centered in the frame</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
