import { emotionConfig } from '../config/emotionConfig';

/**
 * Determines if a new emotion detection represents a significant change
 * compared to the last recorded emotion.
 * 
 * Significant changes include:
 * 1. Different emotion type (e.g., happy → sad)
 * 2. Same emotion but confidence change exceeding threshold
 * 
 * @param {Object} newEmotion - New emotion data with emotion type and confidence
 * @param {Object} lastEmotion - Last recorded emotion data
 * @returns {boolean} - True if significant change detected
 */
export const isSignificantChange = (newEmotion, lastEmotion) => {
  // If no previous emotion, this is significant
  if (!lastEmotion) return true;
  
  // Different emotion type
  if (newEmotion.emotion !== lastEmotion.emotion) return true;
  
  // Same emotion but significant confidence change (>threshold)
  if (Math.abs(newEmotion.confidence - lastEmotion.confidence) > 
      emotionConfig.SIGNIFICANCE_THRESHOLD) return true;
  
  return false;
};

/**
 * Helper function to determine if we should record an emotion
 * based on significance and time interval
 */
export const shouldRecordEmotion = (newEmotion, lastEmotion, timeSinceLastRecord) => {
  // Record if:
  // 1. First emotion
  // 2. Significant change in emotion or confidence
  // 3. Minimum time passed regardless of change
  return !lastEmotion || 
         isSignificantChange(newEmotion, lastEmotion) || 
         timeSinceLastRecord > emotionConfig.MINIMUM_RECORD_INTERVAL;
};
