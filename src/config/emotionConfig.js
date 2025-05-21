// Configuration for emotion detection optimization
export const emotionConfig = {
  // How often to save to Firebase (milliseconds)
  SAVE_INTERVAL: 30000, // 30 seconds (increased from 5)
  
  // How often to aggregate data (milliseconds)
  AGGREGATE_INTERVAL: 3600000, // 1 hour
  
  // Maximum emotions to keep in local memory
  MAX_LOCAL_EMOTIONS: 50, // Reduced from 100
  
  // Detection frequency (milliseconds)
  DETECTION_FREQUENCY: 5000, // 5 seconds (increased from 2)
  
  // Minimum time interval to record emotions regardless of significance
  MINIMUM_RECORD_INTERVAL: 20000, // 20 seconds
  
  // Significance threshold for confidence changes (0-1)
  SIGNIFICANCE_THRESHOLD: 0.15, // 15% change threshold
  
  // Enable/disable features
  features: {
    saveIndividualEmotions: false, // Save each emotion
    saveAggregates: true, // Save hourly aggregates
    localCaching: true, // Keep recent emotions in memory
  },
  
  // Data retention
  retention: {
    individualEmotions: 7, // days
    aggregates: 90, // days
  }
};
