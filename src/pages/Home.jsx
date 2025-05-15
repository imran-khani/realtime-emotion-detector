import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import WebcamCapture from '../components/WebcamCapture';
import EmotionDisplay from '../components/EmotionDisplay';
import EmotionAnalytics from '../components/EmotionAnalytics';
import ChatInterface from '../components/ChatInterface';
import EmotionJournal from '../components/EmotionJournal';
import EmotionalFeedback from '../components/EmotionalFeedback';
import EmotionInsights from '../components/EmotionInsights';
import { 
  ArrowRightIcon,
  SparklesIcon 
} from '@heroicons/react/24/outline';
import { trackEmotion, subscribeToEmotions, startSession, endSession } from '../utils/emotionFirebase';

const Home = () => {
  const [currentEmotion, setCurrentEmotion] = useState(null);
  const [emotionHistory, setEmotionHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localEmotions, setLocalEmotions] = useState([]); // For immediate feedback
  const [isFullscreenChatOpen, setIsFullscreenChatOpen] = useState(false);

  // Start session when component mounts (only once)
  useEffect(() => {
    let mounted = true;
    
    const initSession = async () => {
      if (mounted) {
        await startSession();
      }
    };
    
    initSession();
    
    // Cleanup on unmount
    return () => {
      mounted = false;
      endSession();
    };
  }, []); // Empty dependency array - runs only once

  // Subscribe to emotion history from Firebase
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToEmotions((emotions) => {
      setEmotionHistory(emotions);
      setLoading(false);
    }, 'day'); // Get last 24 hours

    return () => unsubscribe();
  }, []);

  const handleEmotionDetected = async (emotionData) => {
    // Update current emotion for display
    setCurrentEmotion({
      emotion: emotionData.emotion,
      confidence: emotionData.confidence
    });
    
    // Add to local emotions for immediate feedback
    setLocalEmotions(prev => [...prev.slice(-19), {
      ...emotionData,
      timestamp: Date.now()
    }]);
    
    // Track emotion (buffered saving)
    trackEmotion(emotionData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Quick Actions Bar */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {currentEmotion && (
              <div className="bg-indigo-50 dark:bg-indigo-900/50 rounded-lg px-4 py-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Current Emotion:</span>
                <span className="ml-2 text-indigo-600 dark:text-indigo-400 text-sm font-medium">
                  {currentEmotion.emotion} ({(currentEmotion.confidence * 100).toFixed(0)}%)
                </span>
              </div>
            )}
            <div className="flex space-x-3">
              {/* Quick actions can be added here if needed */}
            </div>
          </div>
        </div>
      </div>

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
                  isAutoDetecting={!isFullscreenChatOpen}
                />
              </div>
            </div>

            {currentEmotion && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
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
              </motion.div>
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
              <EmotionAnalytics emotionHistory={[...emotionHistory, ...localEmotions]} />
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
            confidence={currentEmotion?.confidence}
            emotionHistory={emotionHistory}
            onFullscreenToggle={setIsFullscreenChatOpen}
          />
        </div>
      </main>
    </div>
  );
};

export default Home;