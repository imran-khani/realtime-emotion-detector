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
  
  // Add to buffer
  emotionBuffer.push({
    ...emotionData,
    timestamp: now,
    userId: user.uid
  });
  
  // Save every 10 seconds or when buffer reaches 10 items
  if (now - lastSaveTime > 10000 || emotionBuffer.length >= 10) {
    await saveBufferedEmotions();
    lastSaveTime = now;
  }
};

// Save buffered emotions
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
    
    // Group emotions by type
    const emotionGroups = emotionBuffer.reduce((acc, item) => {
      if (!acc[item.emotion]) {
        acc[item.emotion] = {
          count: 0,
          totalConfidence: 0,
          timestamps: []
        };
      }
      acc[item.emotion].count++;
      acc[item.emotion].totalConfidence += item.confidence;
      acc[item.emotion].timestamps.push(item.timestamp);
      return acc;
    }, {});
    
    // Save aggregated emotion data
    const emotionRecord = {
      userId: user.uid,
      sessionId: sessionId || 'no-session',
      timestamp: Date.now(),
      period: new Date().toISOString().slice(0, 13), // Hour precision
      emotions: emotionGroups,
      totalCount: emotionBuffer.length,
      createdAt: serverTimestamp()
    };
    
    console.log("Saving emotion record:", emotionRecord.totalCount, "emotions");
    await addDoc(collection(db, EMOTIONS_COLLECTION), emotionRecord);
    
    // Update user stats
    await updateUserStats(emotionGroups);
    
    // Clear buffer
    emotionBuffer = [];
    console.log("Emotions saved successfully");
    
  } catch (error) {
    console.error("Error saving emotions:", error.message);
    // Keep buffer for retry
  }
};

// Update user statistics
const updateUserStats = async (emotionGroups) => {
  const user = auth.currentUser;
  if (!user) return;
  
  const statsRef = doc(db, STATS_COLLECTION, user.uid);
  
  try {
    const updates = {};
    Object.entries(emotionGroups).forEach(([emotion, data]) => {
      updates[`emotions.${emotion}`] = increment(data.count);
      updates[`totalCount`] = increment(data.count);
    });
    updates.lastActivity = serverTimestamp();
    
    await setDoc(statsRef, updates, { merge: true });
  } catch (error) {
    console.error("Error updating stats:", error);
  }
};

// Get emotion history with proper aggregation
export const getEmotionHistory = async (timeRange = 'day') => {
  const user = auth.currentUser;
  if (!user) return [];
  
  try {
    const now = Date.now();
    let startTime;
    
    switch (timeRange) {
      case 'hour':
        startTime = now - (60 * 60 * 1000);
        break;
      case 'day':
        startTime = now - (24 * 60 * 60 * 1000);
        break;
      case 'week':
        startTime = now - (7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startTime = now - (30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = now - (24 * 60 * 60 * 1000);
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
    
    // Convert to format expected by charts
    const emotionHistory = [];
    records.forEach(record => {
      Object.entries(record.emotions).forEach(([emotion, data]) => {
        // Distribute emotions across their timestamps
        data.timestamps.forEach((timestamp, index) => {
          emotionHistory.push({
            emotion,
            confidence: data.totalConfidence / data.count,
            timestamp,
            isAggregated: true
          });
        });
      });
    });
    
    return emotionHistory.sort((a, b) => a.timestamp - b.timestamp);
    
  } catch (error) {
    console.error("Error getting emotion history:", error);
    return [];
  }
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
  
  switch (timeRange) {
    case 'hour':
      startTime = now - (60 * 60 * 1000);
      break;
    case 'day':
      startTime = now - (24 * 60 * 60 * 1000);
      break;
    case 'week':
      startTime = now - (7 * 24 * 60 * 60 * 1000);
      break;
    default:
      startTime = now - (24 * 60 * 60 * 1000);
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
        
        // Convert to emotion history format
        const emotionHistory = [];
        filteredRecords.forEach(record => {
          Object.entries(record.emotions || {}).forEach(([emotion, data]) => {
            if (data.timestamps) {
              data.timestamps.forEach((timestamp) => {
                emotionHistory.push({
                  emotion,
                  confidence: data.totalConfidence / data.count,
                  timestamp,
                  isAggregated: true
                });
              });
            }
          });
        });
        
        callback(emotionHistory.sort((a, b) => a.timestamp - b.timestamp));
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
