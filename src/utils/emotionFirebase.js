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

const EMOTIONS_COLLECTION = "emotions";
const AGGREGATES_COLLECTION = "emotion_aggregates";
const CURRENT_SESSION = "current_session";

// Save individual emotion (throttled)
let lastSaveTime = 0;
const SAVE_INTERVAL = 5000; // Save every 5 seconds max
let pendingEmotion = null;

export const saveEmotion = async (emotionData) => {
  const now = Date.now();
  const user = auth.currentUser;
  
  if (!user) {
    console.error("No authenticated user");
    return;
  }
  
  // Update pending emotion
  pendingEmotion = {
    emotion: emotionData.emotion,
    confidence: emotionData.confidence,
    expressions: emotionData.expressions,
    timestamp: now,
    userId: user.uid
  };
  
  // Only save if enough time has passed
  if (now - lastSaveTime >= SAVE_INTERVAL) {
    lastSaveTime = now;
    
    try {
      // Save to detailed collection (less frequently)
      await addDoc(collection(db, EMOTIONS_COLLECTION), {
        ...pendingEmotion,
        createdAt: serverTimestamp()
      });
      
      // Update aggregates
      await updateEmotionAggregates(pendingEmotion);
      
      console.log("Emotion saved and aggregated");
    } catch (error) {
      console.error("Error saving emotion:", error);
    }
  } else {
    // Still update aggregates for live data
    await updateEmotionAggregates(pendingEmotion);
  }
};

// Update emotion aggregates (hourly buckets)
const updateEmotionAggregates = async (emotionData) => {
  const user = auth.currentUser;
  if (!user) return;
  
  const now = new Date();
  const hourKey = `${user.uid}-${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}-${now.getHours().toString().padStart(2, '0')}`;
  
  const aggregateRef = doc(db, AGGREGATES_COLLECTION, hourKey);
  
  try {
    const aggregateDoc = await getDoc(aggregateRef);
    
    if (aggregateDoc.exists()) {
      // Update existing aggregate
      await updateDoc(aggregateRef, {
        [`emotions.${emotionData.emotion}`]: increment(1),
        totalCount: increment(1),
        lastUpdated: serverTimestamp(),
        averageConfidence: increment(emotionData.confidence)
      });
    } else {
      // Create new aggregate
      await setDoc(aggregateRef, {
        emotions: {
          [emotionData.emotion]: 1
        },
        totalCount: 1,
        averageConfidence: emotionData.confidence,
        hour: hourKey,
        timestamp: now.getTime(),
        lastUpdated: serverTimestamp(),
        userId: user.uid
      });
    }
  } catch (error) {
    console.error("Error updating aggregates:", error);
  }
};

// Get aggregated emotion history
export const getEmotionHistory = async (limitCount = 168) => {
  const user = auth.currentUser;
  if (!user) return [];
  
  try {
    // Get aggregated data for current user
    const aggregateQuery = query(
      collection(db, AGGREGATES_COLLECTION),
      where("userId", "==", user.uid),
      orderBy("timestamp", "desc"),
      limit(limitCount)
    );
    
    const aggregateSnapshot = await getDocs(aggregateQuery);
    const aggregates = aggregateSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).reverse();
    
    // Convert aggregates to emotion history format
    const emotionHistory = [];
    
    aggregates.forEach(aggregate => {
      // Calculate average confidence
      const avgConfidence = aggregate.totalCount > 0 
        ? aggregate.averageConfidence / aggregate.totalCount 
        : 0;
      
      // Add entries for each emotion in this hour
      Object.entries(aggregate.emotions || {}).forEach(([emotion, count]) => {
        // Distribute emotions across the hour
        for (let i = 0; i < Math.min(count, 10); i++) { // Cap at 10 per hour for visualization
          emotionHistory.push({
            emotion,
            confidence: avgConfidence,
            timestamp: aggregate.timestamp + (i * 60000), // Spread across minutes
            isAggregate: true
          });
        }
      });
    });
    
    return emotionHistory;
  } catch (error) {
    console.error("Error getting emotion history:", error);
    return [];
  }
};

// Subscribe to emotion updates (uses aggregates for efficiency)
export const subscribeToEmotions = (callback, limitCount = 168) => {
  const user = auth.currentUser;
  if (!user) {
    callback([]);
    return () => {};
  }
  
  try {
    const aggregateQuery = query(
      collection(db, AGGREGATES_COLLECTION),
      where("userId", "==", user.uid),
      orderBy("timestamp", "desc"),
      limit(limitCount)
    );
    
    return onSnapshot(aggregateQuery, (snapshot) => {
      console.log("Aggregate update: got", snapshot.docs.length, "hours of data");
      
      const aggregates = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).reverse();
      
      // Convert to emotion format
      const emotionHistory = [];
      
      aggregates.forEach(aggregate => {
        const avgConfidence = aggregate.totalCount > 0 
          ? aggregate.averageConfidence / aggregate.totalCount 
          : 0;
        
        Object.entries(aggregate.emotions || {}).forEach(([emotion, count]) => {
          for (let i = 0; i < Math.min(count, 10); i++) {
            emotionHistory.push({
              emotion,
              confidence: avgConfidence,
              timestamp: aggregate.timestamp + (i * 60000),
              isAggregate: true
            });
          }
        });
      });
      
      callback(emotionHistory);
    }, (error) => {
      console.error("Error in subscription:", error);
      callback([]);
    });
  } catch (error) {
    console.error("Error setting up subscription:", error);
    callback([]);
    return () => {};
  }
};

// Get current session stats (for immediate feedback)
export const getCurrentSessionStats = async () => {
  try {
    const sessionRef = doc(db, CURRENT_SESSION, "stats");
    const sessionDoc = await getDoc(sessionRef);
    
    if (sessionDoc.exists()) {
      return sessionDoc.data();
    }
    
    return null;
  } catch (error) {
    console.error("Error getting session stats:", error);
    return null;
  }
};

// Update current session stats
export const updateSessionStats = async (emotion, confidence) => {
  try {
    const sessionRef = doc(db, CURRENT_SESSION, "stats");
    
    await setDoc(sessionRef, {
      lastEmotion: emotion,
      lastConfidence: confidence,
      lastUpdated: serverTimestamp(),
      [`emotions.${emotion}`]: increment(1),
      totalDetections: increment(1)
    }, { merge: true });
  } catch (error) {
    console.error("Error updating session stats:", error);
  }
};
