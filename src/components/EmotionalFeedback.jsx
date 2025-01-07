import React, { useEffect, useState } from 'react';
import { Card, Typography, Button, Box, CircularProgress, Collapse, Alert } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const feedbackStrategies = {
  happy: {
    reinforcement: ["Great job maintaining positive energy!", "Your happiness can inspire others!"],
    exercises: ["Practice gratitude - list three things you're thankful for", "Share your positive mood with someone"]
  },
  sad: {
    support: ["It's okay to feel this way", "Remember, emotions are temporary"],
    exercises: ["Take three deep breaths", "Think of a happy memory", "Try gentle stretching"]
  },
  angry: {
    regulation: ["Let's manage this feeling together", "Take a moment to pause"],
    exercises: ["Count backwards from 10", "Clench and release your fists", "Write down what's bothering you"]
  },
  surprised: {
    grounding: ["Take a moment to process", "Center yourself"],
    exercises: ["Focus on your surroundings", "Name 5 things you can see"]
  },
  neutral: {
    awareness: ["Good emotional balance", "Stay mindful of your feelings"],
    exercises: ["Check in with yourself", "Set an intention for the day"]
  }
};

const EmotionalFeedback = ({ currentEmotion, emotionHistory }) => {
  const [showExercise, setShowExercise] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(null);
  const [exerciseCompleted, setExerciseCompleted] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [streakCount, setStreakCount] = useState(0);

  useEffect(() => {
    if (currentEmotion) {
      // Analyze emotion and provide appropriate feedback
      const strategies = feedbackStrategies[currentEmotion.toLowerCase()] || feedbackStrategies.neutral;
      const feedbackMessages = getFeedbackMessages(currentEmotion, emotionHistory);
      setFeedback(feedbackMessages);
      
      // Reset exercise state
      setShowExercise(false);
      setExerciseCompleted(false);
    }
  }, [currentEmotion, emotionHistory]);

  const getFeedbackMessages = (emotion, history) => {
    const strategies = feedbackStrategies[emotion.toLowerCase()] || feedbackStrategies.neutral;
    
    // Check for emotional patterns
    const recentEmotions = history.slice(-5);
    const isConsistent = recentEmotions.every(e => e.emotion === emotion);
    
    if (isConsistent) {
      setStreakCount(prev => prev + 1);
    } else {
      setStreakCount(0);
    }

    return {
      ...strategies,
      pattern: isConsistent ? `You've maintained ${emotion} for a while` : null
    };
  };

  const startExercise = () => {
    const strategies = feedbackStrategies[currentEmotion.toLowerCase()] || feedbackStrategies.neutral;
    const randomExercise = strategies.exercises[Math.floor(Math.random() * strategies.exercises.length)];
    setCurrentExercise(randomExercise);
    setShowExercise(true);
    setExerciseCompleted(false);
  };

  const completeExercise = () => {
    setExerciseCompleted(true);
    // Save completion to history
    const completion = {
      exercise: currentExercise,
      emotion: currentEmotion,
      timestamp: Date.now()
    };
    const history = JSON.parse(localStorage.getItem('exerciseHistory') || '[]');
    localStorage.setItem('exerciseHistory', JSON.stringify([...history, completion]));
  };

  return (
    <Card sx={{ p: 3, m: 2, position: 'relative', overflow: 'visible' }}>
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <TipsAndUpdatesIcon color="primary" sx={{ fontSize: 28 }} />
            <Typography variant="h6" component="div">
              Real-time Feedback
            </Typography>
          </Box>

          {currentEmotion && feedback && (
            <>
              <Alert 
                severity={currentEmotion.toLowerCase() === 'happy' ? 'success' : 'info'}
                sx={{ mb: 2 }}
                icon={currentEmotion.toLowerCase() === 'happy' ? <SentimentVerySatisfiedIcon /> : <SentimentVeryDissatisfiedIcon />}
              >
                {feedback[Object.keys(feedback)[0]][0]}
              </Alert>

              {streakCount > 0 && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Emotional streak detected: {streakCount} consecutive readings
                </Alert>
              )}

              {!showExercise ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={startExercise}
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  Start Emotional Exercise
                </Button>
              ) : (
                <Box sx={{ mt: 2, p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    Exercise:
                  </Typography>
                  <Typography paragraph>
                    {currentExercise}
                  </Typography>
                  {!exerciseCompleted ? (
                    <Button
                      variant="contained"
                      color="success"
                      onClick={completeExercise}
                      startIcon={<CheckCircleIcon />}
                    >
                      Complete Exercise
                    </Button>
                  ) : (
                    <Alert severity="success" sx={{ mt: 2 }}>
                      Great job completing the exercise!
                    </Alert>
                  )}
                </Box>
              )}
            </>
          )}

          {!currentEmotion && (
            <Alert severity="info">
              Waiting to detect your emotion...
            </Alert>
          )}
        </motion.div>
      </AnimatePresence>
    </Card>
  );
};

export default EmotionalFeedback; 