import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  getDocs,
  onSnapshot,
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  increment,
  where
} from "firebase/firestore";
import { db, auth } from "../config/firebase";
import { emotionConfig } from '../config/emotionConfig';
import { shouldRecordEmotion } from './significantChangeDetector';

const EMOTIONS_COLLECTION = "user_emotions";
const SESSION_COLLECTION = "sessions";
const STATS_COLLECTION = "user_stats";

// Tracking variables
let lastSaveTime = 0;
let emotionBuffer = [];
let sessionId = null;

// Fix multiple session starts
let sessionStartPromise = null;

// Start a new session (singleton pattern)
export const startSession = async () => {
  const user = auth.currentUser;
  if (!user) {
    console.log("No authenticated user for session");
    return null;
  }
  
  // Return existing promise if session is already being created
  if (sessionStartPromise) {
    return sessionStartPromise;
  }
  
  // Return existing session if already created
  if (sessionId) {
    return sessionId;
  }
  
  // Create new session promise
  sessionStartPromise = (async () => {
    try {
      const sessionData = {
        userId: user.uid,
        startTime: Date.now(),
        clientTimestamp: Date.now(),
        endTime: null,
        emotionCount: 0,
        dominantEmotion: null,
        createdAt: serverTimestamp()
      };
      
      console.log("Starting session for user:", user.uid);
      const sessionDoc = await addDoc(collection(db, SESSION_COLLECTION), sessionData);
      sessionId = sessionDoc.id;
      console.log("Session started:", sessionId);
      return sessionId;
    } catch (error) {
      console.error("Error starting session:", error.message);
      sessionStartPromise = null; // Reset on error
      return null;
    }
  })();
  
  return sessionStartPromise;
};

// Buffer emotions and save periodically
export const trackEmotion = async (emotionData) => {
  const user = auth.currentUser;
  if (!user) return;
  
  const now = Date.now();
  const lastEmotion = emotionBuffer.length > 0 ? emotionBuffer[emotionBuffer.length - 1] : null;
  const timeSinceLastRecord = lastEmotion ? now - lastEmotion.timestamp : Infinity;
  
  // Record only significant changes or when minimum time threshold reached
  if (shouldRecordEmotion(emotionData, lastEmotion, timeSinceLastRecord)) {
    emotionBuffer.push({
      ...emotionData,
      timestamp: now,
      userId: user.uid
    });
    
    console.log(`Recorded emotion: ${emotionData.emotion} with confidence ${emotionData.confidence.toFixed(2)}`);
  }
  
  // Save based on interval or buffer size thresholds
  if (now - lastSaveTime > emotionConfig.SAVE_INTERVAL || emotionBuffer.length >= 10) {
    await saveBufferedEmotions();
    lastSaveTime = now;
  }
};

// Save buffered emotions with tiered storage
const saveBufferedEmotions = async () => {
  if (emotionBuffer.length === 0) return;
  
  const user = auth.currentUser;
  if (!user) {
    console.log("No authenticated user to save emotions");
    return;
  }
  
  try {
    // Start session if needed
    if (!sessionId) {
      await startSession();
    }
    
    // Group by emotion within 5-minute windows
    const timeWindows = {};
    const windowSize = 5 * 60 * 1000; // 5 minutes
    
    emotionBuffer.forEach(entry => {
      const windowStart = Math.floor(entry.timestamp / windowSize) * windowSize;
      const key = `${windowStart}_${entry.emotion}`;
      
      if (!timeWindows[key]) {
        timeWindows[key] = {
          emotion: entry.emotion,
          startTime: windowStart,
          endTime: windowStart + windowSize,
          count: 0,
          totalConfidence: 0,
          samples: []
        };
      }
      
      const window = timeWindows[key];
      window.count++;
      window.totalConfidence += entry.confidence;
      
      // Store a small number of representative samples
      if (window.samples.length < 3) {
        window.samples.push({
          timestamp: entry.timestamp,
          confidence: entry.confidence
        });
      }
    });
    
    // Create optimized emotion record
    const emotionRecord = {
      userId: user.uid,
      sessionId: sessionId || 'no-session',
      timestamp: Date.now(),
      emotionWindows: Object.values(timeWindows),
      rawDataPoints: emotionBuffer.length,
      compressionRatio: emotionBuffer.length / Object.keys(timeWindows).length,
      createdAt: serverTimestamp()
    };
    
    console.log(`Saving optimized emotion record with compression ratio: ${emotionRecord.compressionRatio.toFixed(2)}x`);
    await addDoc(collection(db, EMOTIONS_COLLECTION), emotionRecord);
    
    // Update user stats
    await updateUserStats(emotionBuffer);
    
    // Clear buffer
    emotionBuffer = [];
    console.log("Optimized emotions saved successfully");
    
  } catch (error) {
    console.error("Error saving emotions:", error.message);
    // Keep buffer for retry
  }
};

// Update user statistics based on emotion buffer
const updateUserStats = async (emotionBuffer) => {
  const user = auth.currentUser;
  if (!user) return;
  
  const statsRef = doc(db, STATS_COLLECTION, user.uid);
  
  try {
    // Count emotions by type
    const emotionGroups = emotionBuffer.reduce((acc, item) => {
      if (!acc[item.emotion]) {
        acc[item.emotion] = 0;
      }
      acc[item.emotion]++;
      return acc;
    }, {});
    
    const updates = {};
    Object.entries(emotionGroups).forEach(([emotion, count]) => {
      updates[`emotions.${emotion}`] = increment(count);
      updates[`totalCount`] = increment(count);
    });
    updates.lastActivity = serverTimestamp();
    
    await setDoc(statsRef, updates, { merge: true });
  } catch (error) {
    console.error("Error updating stats:", error);
  }
};

// Get emotion history with proper aggregation based on time range
export const getEmotionHistory = async (timeRange = 'day') => {
  const user = auth.currentUser;
  if (!user) return [];
  
  try {
    const now = Date.now();
    let startTime;
    let resolution;
    
    // Set time range and resolution based on requested range
    switch (timeRange) {
      case '1m':
        startTime = now - (60 * 1000);
        resolution = 'raw';
        break;
      case '5m':
        startTime = now - (5 * 60 * 1000);
        resolution = 'raw';
        break;
      case '15m':
        startTime = now - (15 * 60 * 1000);
        resolution = 'minute';
        break;
      case 'hour':
        startTime = now - (60 * 60 * 1000);
        resolution = '5minutes';
        break;
      case 'day':
        startTime = now - (24 * 60 * 60 * 1000);
        resolution = 'hour';
        break;
      case 'week':
        startTime = now - (7 * 24 * 60 * 60 * 1000);
        resolution = 'day';
        break;
      case 'month':
        startTime = now - (30 * 24 * 60 * 60 * 1000);
        resolution = 'day';
        break;
      default:
        startTime = now - (24 * 60 * 60 * 1000);
        resolution = 'hour';
    }
    
    const q = query(
      collection(db, EMOTIONS_COLLECTION),
      where("userId", "==", user.uid),
      where("timestamp", ">=", startTime),
      orderBy("timestamp", "desc"),
      limit(100)
    );
    
    const snapshot = await getDocs(q);
    const records = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Convert optimized windows to chart-friendly format
    return prepareChartData(records, resolution);
    
  } catch (error) {
    console.error("Error getting emotion history:", error);
    return [];
  }
};

// Helper function to prepare chart data with appropriate resolution
const prepareChartData = (records, resolution) => {
  const emotionHistory = [];
  
  records.forEach(record => {
    // Handle new format with emotionWindows
    if (record.emotionWindows) {
      record.emotionWindows.forEach(window => {
        if (resolution === 'raw') {
          // Use all individual samples for highest resolution
          window.samples.forEach(sample => {
            emotionHistory.push({
              emotion: window.emotion,
              confidence: sample.confidence,
              timestamp: sample.timestamp,
              expressions: {
                [window.emotion]: sample.confidence
              },
              isAggregated: false
            });
          });
        } else {
          // Create aggregated points based on resolution
          emotionHistory.push({
            emotion: window.emotion,
            confidence: window.totalConfidence / window.count,
            timestamp: window.startTime + ((window.endTime - window.startTime) / 2),
            expressions: {
              [window.emotion]: window.totalConfidence / window.count
            },
            isAggregated: true,
            sampleCount: window.count
          });
        }
      });
    } 
    // Handle old format for backward compatibility
    else if (record.emotions) {
      Object.entries(record.emotions).forEach(([emotion, data]) => {
        if (data.timestamps) {
          data.timestamps.forEach((timestamp) => {
            // Create a standardized expressions object
            const expressions = {};
            expressions[emotion] = data.totalConfidence / data.count;
            
            emotionHistory.push({
              emotion,
              confidence: data.totalConfidence / data.count,
              timestamp,
              expressions,
              isAggregated: true
            });
          });
        }
      });
    }
  });
  
  return emotionHistory.sort((a, b) => a.timestamp - b.timestamp);
};

// Subscribe to emotion updates
export const subscribeToEmotions = (callback, timeRange = 'day') => {
  const user = auth.currentUser;
  if (!user) {
    console.log("No authenticated user for subscription");
    callback([]);
    return () => {};
  }
  
  const now = Date.now();
  let startTime;
  let resolution;
  
  // Set time range and resolution based on requested range
  switch (timeRange) {
    case '1m':
      startTime = now - (60 * 1000);
      resolution = 'raw';
      break;
    case '5m':
      startTime = now - (5 * 60 * 1000);
      resolution = 'raw';
      break;
    case '15m':
      startTime = now - (15 * 60 * 1000);
      resolution = 'minute';
      break;
    case 'hour':
      startTime = now - (60 * 60 * 1000);
      resolution = '5minutes';
      break;
    case 'day':
      startTime = now - (24 * 60 * 60 * 1000);
      resolution = 'hour';
      break;
    case 'week':
      startTime = now - (7 * 24 * 60 * 60 * 1000);
      resolution = 'day';
      break;
    case 'month':
      startTime = now - (30 * 24 * 60 * 60 * 1000);
      resolution = 'day';
      break;
    default:
      startTime = now - (24 * 60 * 60 * 1000);
      resolution = 'hour';
  }
  
  try {
    // Simple query first
    const q = query(
      collection(db, EMOTIONS_COLLECTION),
      where("userId", "==", user.uid),
      limit(100)
    );
    
    return onSnapshot(q, 
      (snapshot) => {
        console.log(`Got ${snapshot.docs.length} emotion records`);
        const records = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Filter by time in memory
        const filteredRecords = records.filter(r => 
          r.timestamp && r.timestamp >= startTime
        );
        
        // Process with optimized chart data preparation
        const emotionHistory = prepareChartData(filteredRecords, resolution);
        callback(emotionHistory);
      }, 
      (error) => {
        console.error("Error in subscription:", error);
        callback([]);
      }
    );
  } catch (error) {
    console.error("Error setting up subscription:", error);
    callback([]);
    return () => {};
  }
};

// End session and save final stats
export const endSession = async () => {
  if (!sessionId || !auth.currentUser) return;
  
  try {
    await updateDoc(doc(db, SESSION_COLLECTION, sessionId), {
      endTime: serverTimestamp()
    });
    
    // Save any remaining buffered emotions
    await saveBufferedEmotions();
    
    sessionId = null;
  } catch (error) {
    console.error("Error ending session:", error);
  }
};

// Get user statistics
export const getUserStats = async () => {
  const user = auth.currentUser;
  if (!user) return null;
  
  try {
    const statsDoc = await getDoc(doc(db, STATS_COLLECTION, user.uid));
    if (statsDoc.exists()) {
      return statsDoc.data();
    }
    return null;
  } catch (error) {
    console.error("Error getting user stats:", error);
    return null;
  }
};
