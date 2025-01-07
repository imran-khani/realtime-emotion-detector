import React, { useEffect, useState } from 'react';
import { Card, Typography, Box, Alert } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';

const feedbackMessages = {
  happy: "Great job maintaining positive energy!",
  sad: "It's okay to feel this way, take a moment for yourself",
  angry: "Take a deep breath, this feeling will pass",
  surprised: "Take a moment to process what's happening",
  neutral: "You're in a balanced state of mind"
};

const EmotionalFeedback = ({ currentEmotion }) => {
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (currentEmotion) {
      setFeedback(feedbackMessages[currentEmotion.toLowerCase()] || feedbackMessages.neutral);
    }
  }, [currentEmotion]);

  return (
    <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-indigo-100/50 dark:from-indigo-900/20 dark:to-indigo-800/20">
        <h2 className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2">
          <TipsAndUpdatesIcon className="text-indigo-500" sx={{ fontSize: 20 }} />
          Emotional Insight
        </h2>
      </div>

      <div className="p-4">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {currentEmotion && feedback ? (
              <Alert 
                severity={currentEmotion.toLowerCase() === 'happy' ? 'success' : 'info'}
                icon={currentEmotion.toLowerCase() === 'happy' ? <SentimentVerySatisfiedIcon /> : <SentimentVeryDissatisfiedIcon />}
                sx={{ 
                  '& .MuiAlert-message': { 
                    fontSize: '0.95rem',
                    fontWeight: 500 
                  }
                }}
              >
                {feedback}
              </Alert>
            ) : (
              <Alert 
                severity="info"
                sx={{ 
                  '& .MuiAlert-message': { 
                    fontSize: '0.95rem' 
                  }
                }}
              >
                Waiting to detect your emotion...
              </Alert>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </Card>
  );
};

export default EmotionalFeedback; 