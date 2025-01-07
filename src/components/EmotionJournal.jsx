import React, { useEffect, useState } from 'react';
import { Card, Typography, Divider, List, ListItem, ListItemText, Chip, Box, ToggleButton, ToggleButtonGroup } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TimelineIcon from '@mui/icons-material/Timeline';
import UpdateIcon from '@mui/icons-material/Update';

const EmotionJournal = ({ emotionHistory }) => {
  const [insights, setInsights] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [dominantEmotion, setDominantEmotion] = useState(null);
  const [timeRange, setTimeRange] = useState('today');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    if (emotionHistory && emotionHistory.length > 0) {
      analyzeEmotions(emotionHistory);
      // Update timestamp
      setLastUpdate(new Date());
    }
  }, [emotionHistory, timeRange]);

  // Auto-update every minute
  useEffect(() => {
    const interval = setInterval(() => {
      if (emotionHistory && emotionHistory.length > 0) {
        analyzeEmotions(emotionHistory);
        setLastUpdate(new Date());
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [emotionHistory, timeRange]);

  const getFilteredHistory = (history) => {
    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.setDate(now.getDate() - 7));
    const monthStart = new Date(now.setDate(now.getDate() - 30));

    return history.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      switch (timeRange) {
        case 'today':
          return entryDate >= dayStart;
        case 'week':
          return entryDate >= weekStart;
        case 'month':
          return entryDate >= monthStart;
        default:
          return true;
      }
    });
  };

  const analyzeEmotions = (history) => {
    const filteredHistory = getFilteredHistory(history);
    if (filteredHistory.length === 0) {
      setInsights([{ type: 'info', text: 'No emotions recorded in this time period' }]);
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

  const handleTimeRangeChange = (event, newRange) => {
    if (newRange !== null) {
      setTimeRange(newRange);
    }
  };

  return (
    <Card sx={{ p: 3, m: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TimelineIcon color="primary" />
          <Typography variant="h5" component="div">
            Emotion Journal
          </Typography>
        </Box>
        <Typography variant="caption" component="div" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <UpdateIcon fontSize="small" />
          Updated {lastUpdate.toLocaleTimeString()}
        </Typography>
      </Box>

      <ToggleButtonGroup
        value={timeRange}
        exclusive
        onChange={handleTimeRangeChange}
        size="small"
        sx={{ mb: 2 }}
      >
        <ToggleButton value="today">Today</ToggleButton>
        <ToggleButton value="week">This Week</ToggleButton>
        <ToggleButton value="month">This Month</ToggleButton>
      </ToggleButtonGroup>

      <Divider sx={{ my: 2 }} />

      {dominantEmotion && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" component="div" gutterBottom>
            Your Dominant Emotion
          </Typography>
          <Chip
            label={dominantEmotion}
            color="primary"
            variant="outlined"
            sx={{ fontSize: '1rem' }}
          />
        </Box>
      )}

      <Typography variant="subtitle1" component="div" gutterBottom>
        Personal Insights
      </Typography>
      <List>
        {insights.map((insight, index) => (
          <ListItem key={index}>
            <ListItemText
              primary={insight.text}
              secondary={
                insight.type === 'stability' && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    {insight.score >= 7 ? (
                      <TrendingUpIcon color="success" />
                    ) : (
                      <TrendingDownIcon color="error" />
                    )}
                    <Typography variant="body2" component="span" color="text.secondary">
                      {insight.score >= 7 ? 'High stability' : 'Variable emotions'}
                    </Typography>
                  </Box>
                )
              }
            />
          </ListItem>
        ))}
      </List>

      {patterns.length > 0 && (
        <>
          <Typography variant="subtitle1" component="div" gutterBottom sx={{ mt: 2 }}>
            Recent Patterns
          </Typography>
          <List>
            {patterns.map((pattern, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={pattern.emotion + ' streak of ' + pattern.streak + ' occurrences'}
                  secondary={
                    <Typography variant="body2" component="span" color="text.secondary">
                      {new Date(pattern.timestamp).toLocaleDateString()}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </>
      )}
    </Card>
  );
};

export default EmotionJournal; 