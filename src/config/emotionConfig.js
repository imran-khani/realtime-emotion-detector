// Configuration for emotion detection optimization
export const emotionConfig = {
  // How often to save to Firebase (milliseconds)
  SAVE_INTERVAL: 5000, // 5 seconds
  
  // How often to aggregate data (milliseconds)
  AGGREGATE_INTERVAL: 3600000, // 1 hour
  
  // Maximum emotions to keep in local memory
  MAX_LOCAL_EMOTIONS: 100,
  
  // Detection frequency (milliseconds)
  DETECTION_FREQUENCY: 2000, // 2 seconds
  
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
