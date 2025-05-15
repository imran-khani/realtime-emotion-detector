import { useState, useEffect, useCallback } from 'react';

// Debounce utility
const createDebounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const useOptimizedEmotionTracking = () => {
  const [currentEmotion, setCurrentEmotion] = useState(null);
  const [recentEmotions, setRecentEmotions] = useState([]);
  const [emotionCounts, setEmotionCounts] = useState({});
  
  // Debounced save function (saves every 5 seconds max)
  const debouncedSave = useCallback(
    createDebounce(async (emotionData) => {
      const { saveEmotion } = await import('./emotionFirebase');
      await saveEmotion(emotionData);
    }, 5000),
    []
  );
  
  // Track emotion locally for immediate feedback
  const trackEmotion = useCallback((emotionData) => {
    setCurrentEmotion(emotionData);
    
    // Update local counts immediately
    setEmotionCounts(prev => ({
      ...prev,
      [emotionData.emotion]: (prev[emotionData.emotion] || 0) + 1
    }));
    
    // Add to recent emotions (keep last 50)
    setRecentEmotions(prev => [
      ...prev.slice(-49),
      {
        ...emotionData,
        timestamp: Date.now()
      }
    ]);
    
    // Save to Firebase (debounced)
    debouncedSave(emotionData);
  }, [debouncedSave]);
  
  // Clean up old data periodically
  useEffect(() => {
    const cleanup = setInterval(() => {
      const cutoff = Date.now() - (60 * 60 * 1000); // 1 hour
      setRecentEmotions(prev => prev.filter(e => e.timestamp > cutoff));
    }, 60000); // Every minute
    
    return () => clearInterval(cleanup);
  }, []);
  
  return {
    currentEmotion,
    recentEmotions,
    emotionCounts,
    trackEmotion
  };
};
