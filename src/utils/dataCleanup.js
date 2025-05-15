import { 
  collection, 
  query, 
  where, 
  getDocs,
  deleteDoc,
  doc
} from "firebase/firestore";
import { db } from "../config/firebase";
import { emotionConfig } from "../config/emotionConfig";

// Clean up old data based on retention policy
export const cleanupOldData = async () => {
  try {
    const now = Date.now();
    
    // Clean individual emotions if enabled
    if (emotionConfig.features.saveIndividualEmotions) {
      const emotionsRetentionTime = now - (emotionConfig.retention.individualEmotions * 24 * 60 * 60 * 1000);
      const emotionsQuery = query(
        collection(db, "emotions"),
        where("clientTimestamp", "<", emotionsRetentionTime)
      );
      
      const emotionsSnapshot = await getDocs(emotionsQuery);
      const deletePromises = emotionsSnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      
      await Promise.all(deletePromises);
      console.log(`Deleted ${emotionsSnapshot.size} old emotion records`);
    }
    
    // Clean aggregates
    const aggregatesRetentionTime = now - (emotionConfig.retention.aggregates * 24 * 60 * 60 * 1000);
    const aggregatesQuery = query(
      collection(db, "emotion_aggregates"),
      where("timestamp", "<", aggregatesRetentionTime)
    );
    
    const aggregatesSnapshot = await getDocs(aggregatesQuery);
    const deleteAggregatePromises = aggregatesSnapshot.docs.map(doc => 
      deleteDoc(doc.ref)
    );
    
    await Promise.all(deleteAggregatePromises);
    console.log(`Deleted ${aggregatesSnapshot.size} old aggregate records`);
    
  } catch (error) {
    console.error("Error cleaning up old data:", error);
  }
};

// Run cleanup periodically (e.g., once per day)
export const scheduleCleanup = () => {
  // Run on startup
  cleanupOldData();
  
  // Run every 24 hours
  setInterval(() => {
    cleanupOldData();
  }, 24 * 60 * 60 * 1000);
};
