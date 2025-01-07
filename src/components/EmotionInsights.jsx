import React, { useEffect, useState } from 'react';
import { Card, Typography, Box, Chip, LinearProgress } from '@mui/material';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import StarIcon from '@mui/icons-material/Star';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';

const EmotionInsights = ({ emotionHistory }) => {
  const [dailyGoal, setDailyGoal] = useState(null);
  const [progress, setProgress] = useState(0);
  const [actionableInsight, setActionableInsight] = useState('');

  useEffect(() => {
    if (emotionHistory && emotionHistory.length > 0) {
      analyzeEmotions(emotionHistory);
    }
  }, [emotionHistory]);

  const analyzeEmotions = (history) => {
    // Get today's emotions
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEmotions = history.filter(entry => new Date(entry.timestamp) >= todayStart);

    // Calculate most frequent emotion today
    const emotionCounts = todayEmotions.reduce((acc, entry) => {
      acc[entry.emotion] = (acc[entry.emotion] || 0) + 1;
      return acc;
    }, {});

    const dominantEmotion = Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0];

    // Set daily goal based on dominant emotion
    const goals = {
      happy: { text: "Share your positivity with others", target: 70 },
      sad: { text: "Take small steps toward joy", target: 30 },
      angry: { text: "Find moments of calm", target: 40 },
      surprised: { text: "Reflect on new experiences", target: 50 },
      neutral: { text: "Explore emotional range", target: 60 }
    };

    const goal = goals[dominantEmotion?.toLowerCase()] || goals.neutral;
    setDailyGoal(goal);

    // Calculate progress
    const positiveEmotions = todayEmotions.filter(e => 
      e.emotion.toLowerCase() === 'happy' || e.emotion.toLowerCase() === 'neutral'
    ).length;
    const progressValue = (positiveEmotions / todayEmotions.length) * 100 || 0;
    setProgress(Math.min(progressValue, 100));

    // Generate actionable insights
    const insights = {
      happy: "Try: Write down what made you happy today to remember these moments",
      sad: "Try: Take a 5-minute break to do something you enjoy",
      angry: "Try: Practice deep breathing - 4 counts in, 4 counts out",
      surprised: "Try: Journal about what surprised you and what you learned",
      neutral: "Try: Express how you're feeling to someone you trust"
    };

    setActionableInsight(insights[dominantEmotion?.toLowerCase()] || insights.neutral);
  };

  return (
    <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-indigo-100/50 dark:from-indigo-900/20 dark:to-indigo-800/20">
        <h2 className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2">
          <EmojiObjectsIcon className="text-indigo-500" sx={{ fontSize: 20 }} />
          Daily Insights
        </h2>
      </div>

      <div className="p-4 space-y-4">
        {/* Daily Goal */}
        {dailyGoal && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Typography variant="subtitle2" className="text-gray-600 dark:text-gray-300">
                Today's Goal
              </Typography>
              <Chip
                icon={<StarIcon sx={{ fontSize: 16 }} />}
                label={`${progress.toFixed(0)}%`}
                size="small"
                color={progress >= (dailyGoal.target || 50) ? "success" : "default"}
              />
            </div>
            <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
              {dailyGoal.text}
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={progress}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: 'rgba(99, 102, 241, 0.1)',
                '& .MuiLinearProgress-bar': {
                  bgcolor: progress >= (dailyGoal.target || 50) ? '#22c55e' : '#6366f1'
                }
              }}
            />
          </div>
        )}

        {/* Actionable Tip */}
        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <TipsAndUpdatesIcon className="text-indigo-500 mt-1" />
            <div>
              <Typography variant="subtitle2" className="text-gray-700 dark:text-gray-200 mb-1">
                Action Step
              </Typography>
              <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                {actionableInsight}
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default EmotionInsights; 