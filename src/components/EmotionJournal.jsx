import React, { useEffect, useState } from 'react';
import { Card, Typography, Divider, List, ListItem, ListItemText, Chip, Box } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TimelineIcon from '@mui/icons-material/Timeline';
import UpdateIcon from '@mui/icons-material/Update';

const EmotionJournal = ({ emotionHistory }) => {
  const [insights, setInsights] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [dominantEmotion, setDominantEmotion] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    if (emotionHistory && emotionHistory.length > 0) {
      analyzeEmotions(emotionHistory);
      setLastUpdate(new Date());
    }
  }, [emotionHistory]);

  const getFilteredHistory = (history) => {
    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return history.filter(entry => new Date(entry.timestamp) >= dayStart);
  };

  const analyzeEmotions = (history) => {
    const filteredHistory = getFilteredHistory(history);
    if (filteredHistory.length === 0) {
      setInsights([{ type: 'info', text: 'No emotions recorded today' }]);
      setPatterns([]);
      setDominantEmotion(null);
      return;
    }

    // Calculate emotion frequencies
    const frequencies = filteredHistory.reduce((acc, entry) => {
      acc[entry.emotion] = (acc[entry.emotion] || 0) + 1;
      return acc;
    }, {});

    // Find dominant emotion
    const dominant = Object.entries(frequencies)
      .sort(([,a], [,b]) => b - a)[0][0];
    setDominantEmotion(dominant);

    // Analyze patterns
    const recentHistory = filteredHistory.slice(-10);
    const emotionPatterns = [];
    let currentStreak = 1;
    let prevEmotion = recentHistory[0]?.emotion;

    for (let i = 1; i < recentHistory.length; i++) {
      if (recentHistory[i].emotion === prevEmotion) {
        currentStreak++;
      } else {
        if (currentStreak >= 3) {
          emotionPatterns.push({
            emotion: prevEmotion,
            streak: currentStreak,
            timestamp: recentHistory[i-1].timestamp
          });
        }
        currentStreak = 1;
      }
      prevEmotion = recentHistory[i].emotion;
    }

    setPatterns(emotionPatterns);

    // Generate insights
    const newInsights = [];
    
    // Time-based patterns
    const timePatterns = analyzeTimePatterns(filteredHistory);
    if (timePatterns.morning) {
      newInsights.push({
        type: 'time',
        text: `You tend to feel ${timePatterns.morning} in the mornings`
      });
    }

    // Emotion transitions
    const transitions = analyzeTransitions(filteredHistory);
    if (transitions.length > 0) {
      newInsights.push({
        type: 'transition',
        text: `Your emotions often shift from ${transitions[0].from} to ${transitions[0].to}`
      });
    }

    // Emotional stability
    const stability = calculateEmotionalStability(filteredHistory);
    newInsights.push({
      type: 'stability',
      text: `Your emotional stability score is ${stability.toFixed(1)}/10`,
      score: stability
    });

    // Add time-specific insights
    const emotionCounts = Object.entries(frequencies);
    const totalEmotions = emotionCounts.reduce((sum, [, count]) => sum + count, 0);
    emotionCounts.forEach(([emotion, count]) => {
      const percentage = ((count / totalEmotions) * 100).toFixed(1);
      if (percentage > 20) {
        newInsights.push({
          type: 'frequency',
          text: `You felt ${emotion} ${percentage}% of the time`
        });
      }
    });

    setInsights(newInsights);
  };

  const analyzeTimePatterns = (history) => {
    const morningEmotions = history.filter(entry => {
      const hour = new Date(entry.timestamp).getHours();
      return hour >= 6 && hour < 12;
    });

    if (morningEmotions.length === 0) return {};

    const frequencies = morningEmotions.reduce((acc, entry) => {
      acc[entry.emotion] = (acc[entry.emotion] || 0) + 1;
      return acc;
    }, {});

    const dominant = Object.entries(frequencies)
      .sort(([,a], [,b]) => b - a)[0][0];

    return { morning: dominant };
  };

  const analyzeTransitions = (history) => {
    const transitions = [];
    for (let i = 1; i < history.length; i++) {
      if (history[i].emotion !== history[i-1].emotion) {
        transitions.push({
          from: history[i-1].emotion,
          to: history[i].emotion,
          timestamp: history[i].timestamp
        });
      }
    }
    return transitions;
  };

  const calculateEmotionalStability = (history) => {
    if (history.length < 2) return 10;
    let changes = 0;
    for (let i = 1; i < history.length; i++) {
      if (history[i].emotion !== history[i-1].emotion) {
        changes++;
      }
    }
    const stabilityScore = 10 - ((changes / history.length) * 10);
    return Math.max(0, Math.min(10, stabilityScore));
  };

  return (
    <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-indigo-100/50 dark:from-indigo-900/20 dark:to-indigo-800/20">
        <h2 className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2">
          <TimelineIcon className="text-indigo-500" sx={{ fontSize: 20 }} />
          Emotion Journal
        </h2>
      </div>

      <div className="p-4 space-y-4">
        {dominantEmotion && (
          <div className="mb-4">
            <Typography variant="subtitle2" className="text-gray-600 dark:text-gray-300 mb-2">
              Your Dominant Emotion Today
            </Typography>
            <Chip
              label={typeof dominantEmotion === 'string' ? dominantEmotion : dominantEmotion.emotion}
              color="primary"
              variant="outlined"
              sx={{ fontSize: '0.875rem' }}
            />
          </div>
        )}

        <div>
          <Typography variant="subtitle2" className="text-gray-600 dark:text-gray-300 mb-2">
            Today's Insights
          </Typography>
          <List className="space-y-2">
            {insights.map((insight, index) => (
              <ListItem key={index} className="px-0">
                <ListItemText
                  primary={
                    <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
                      {typeof insight.text === 'string' ? insight.text : JSON.stringify(insight.text)}
                    </Typography>
                  }
                  secondary={
                    insight.type === 'stability' && (
                      <Box className="flex items-center gap-2 mt-1">
                        {insight.score >= 7 ? (
                          <TrendingUpIcon className="text-green-500" sx={{ fontSize: 16 }} />
                        ) : (
                          <TrendingDownIcon className="text-red-500" sx={{ fontSize: 16 }} />
                        )}
                        <Typography variant="caption" className="text-gray-400 dark:text-gray-500">
                          {insight.score >= 7 ? 'High stability' : 'Variable emotions'}
                        </Typography>
                      </Box>
                    )
                  }
                />
              </ListItem>
            ))}
          </List>
        </div>

        {patterns.length > 0 && (
          <div>
            <Typography variant="subtitle2" className="text-gray-600 dark:text-gray-300 mb-2">
              Recent Patterns
            </Typography>
            <List className="space-y-2">
              {patterns.map((pattern, index) => (
                <ListItem key={index} className="px-0">
                  <ListItemText
                    primary={
                      <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
                        {`${pattern.emotion} streak of ${pattern.streak} occurrences`}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" className="text-gray-400 dark:text-gray-500">
                        {new Date(pattern.timestamp).toLocaleTimeString()}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </div>
        )}
      </div>
    </Card>
  );
};

export default EmotionJournal; 