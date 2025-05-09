import { useState, useEffect } from 'react'
import WebcamCapture from './components/WebcamCapture'
import EmotionDisplay from './components/EmotionDisplay'
import EmotionAnalytics from './components/EmotionAnalytics'
import ChatInterface from './components/ChatInterface'
import EmotionJournal from './components/EmotionJournal'
import EmotionalFeedback from './components/EmotionalFeedback'
import LandingPage from './components/LandingPage'
import EmotionInsights from './components/EmotionInsights'

function App() {
  const [showApp, setShowApp] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState(null);
  const [emotionHistory, setEmotionHistory] = useState(() => {
    const saved = localStorage.getItem('emotionHistory');
    return saved ? JSON.parse(saved) : [];
  });

  // Load emotion history on mount
  useEffect(() => {
    const saved = localStorage.getItem('emotionHistory');
    if (saved) {
      setEmotionHistory(JSON.parse(saved));
    }
  }, []);

  // Save emotion history when it changes
  useEffect(() => {
    localStorage.setItem('emotionHistory', JSON.stringify(emotionHistory));
  }, [emotionHistory]);

  const handleEmotionDetected = (emotionData) => {
    setCurrentEmotion({
      emotion: emotionData.emotion,
      confidence: emotionData.confidence
    });

    const newHistory = [...emotionHistory, {
      emotion: emotionData.emotion,
      confidence: emotionData.confidence,
      timestamp: Date.now(),
      expressions: emotionData.expressions
    }].slice(-300); // Keep last 300 entries

    setEmotionHistory(newHistory);
    localStorage.setItem('emotionHistory', JSON.stringify(newHistory));
  };

  if (!showApp) {
    return <LandingPage onGetStarted={() => setShowApp(true)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400">
                EmotiSense
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                AI-powered emotional intelligence assistant
              </p>
            </div>
            {currentEmotion && (
              <div className="w-full sm:w-auto bg-indigo-50 dark:bg-indigo-900/50 rounded-lg px-4 py-2 text-center sm:text-left">
                <span className="text-sm text-gray-500 dark:text-gray-400">Current Emotion:</span>
                <span className="ml-2 text-indigo-600 dark:text-indigo-400 text-sm font-medium">
                  {currentEmotion.emotion} ({(currentEmotion.confidence * 100).toFixed(0)}%)
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-indigo-100/50 dark:from-indigo-900/20 dark:to-indigo-800/20">
                <h2 className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Emotion Detection
                </h2>
              </div>
              <div className="aspect-[4/3] relative">
                <WebcamCapture
                  onEmotionDetected={handleEmotionDetected}
                  detectionFrequency={1000}
                />
              </div>
            </div>

            {currentEmotion && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-indigo-100/50 dark:from-indigo-900/20 dark:to-indigo-800/20">
                  <h2 className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Current Emotion
                  </h2>
                </div>
                <div className="p-3">
                  <EmotionDisplay
                    emotion={currentEmotion.emotion}
                    confidence={currentEmotion.confidence}
                  />
                </div>
              </div>
            )}

            <EmotionalFeedback currentEmotion={currentEmotion?.emotion} />
          </div>

          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-indigo-100/50 dark:from-indigo-900/20 dark:to-indigo-800/20">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Emotion Analytics
              </h2>
            </div>
            <div className="p-4 overflow-x-auto">
              <EmotionAnalytics emotionHistory={emotionHistory} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <EmotionJournal emotionHistory={emotionHistory} />
          <EmotionInsights emotionHistory={emotionHistory} />
        </div>

        <div>
          <ChatInterface 
            currentEmotion={currentEmotion?.emotion} 
            emotionHistory={emotionHistory} 
          />
        </div>
      </main>
    </div>
  );
}

export default App;
