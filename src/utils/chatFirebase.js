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
  updateDoc,
  where,
  deleteDoc,
  getDoc,
  increment
} from "firebase/firestore";
import { db, auth } from "../config/firebase";

const CHAT_COLLECTION = "user_chats";
const MESSAGES_COLLECTION = "chat_messages";
const ANALYTICS_COLLECTION = "chat_analytics";

// Create or get chat session
export const createChatSession = async () => {
  const user = auth.currentUser;
  if (!user) return null;
  
  try {
    const sessionData = {
      userId: user.uid,
      startTime: Date.now(),
      lastActive: Date.now(),
      status: 'active',
      createdAt: serverTimestamp()
    };
    
    const sessionDoc = await addDoc(collection(db, CHAT_COLLECTION), sessionData);
    return sessionDoc.id;
  } catch (error) {
    console.error("Error creating chat session:", error);
    return null;
  }
};

// Save a chat message to Firebase
export const saveMessage = async (message, sessionId) => {
  const user = auth.currentUser;
  if (!user || !sessionId) return null;
  
  try {
    const messageData = {
      ...message,
      userId: user.uid,
      sessionId: sessionId,
      timestamp: Date.now(),
      createdAt: serverTimestamp()
    };
    
    const messageDoc = await addDoc(collection(db, MESSAGES_COLLECTION), messageData);
    
    // Update session last active time
    await updateDoc(doc(db, CHAT_COLLECTION, sessionId), {
      lastActive: Date.now()
    });
    
    // Update analytics
    await updateChatAnalytics(message.emotion, message.sender);
    
    return messageDoc.id;
  } catch (error) {
    console.error("Error saving message:", error);
    return null;
  }
};

// Get chat history for a session
export const getChatHistory = async (sessionId, limitCount = 50) => {
  const user = auth.currentUser;
  if (!user || !sessionId) return [];
  
  try {
    const q = query(
      collection(db, MESSAGES_COLLECTION),
      where("userId", "==", user.uid),
      where("sessionId", "==", sessionId),
      orderBy("timestamp", "desc"),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Return in chronological order
    return messages.reverse();
  } catch (error) {
    console.error("Error getting chat history:", error);
    return [];
  }
};

// Subscribe to chat messages for real-time updates
export const subscribeToChatMessages = (sessionId, callback) => {
  const user = auth.currentUser;
  if (!user || !sessionId) {
    callback([]);
    return () => {};
  }
  
  try {
    const q = query(
      collection(db, MESSAGES_COLLECTION),
      where("userId", "==", user.uid),
      where("sessionId", "==", sessionId),
      orderBy("timestamp", "asc")
    );
    
    return onSnapshot(q, 
      (snapshot) => {
        const messages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(messages);
      }, 
      (error) => {
        console.error("Error in chat subscription:", error);
        callback([]);
      }
    );
  } catch (error) {
    console.error("Error setting up chat subscription:", error);
    callback([]);
    return () => {};
  }
};

// Get all chat sessions for a user
export const getChatSessions = async (limitCount = 10) => {
  const user = auth.currentUser;
  if (!user) return [];
  
  try {
    const q = query(
      collection(db, CHAT_COLLECTION),
      where("userId", "==", user.uid),
      orderBy("lastActive", "desc"),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    const sessions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return sessions;
  } catch (error) {
    console.error("Error getting chat sessions:", error);
    return [];
  }
};

// Update chat analytics
const updateChatAnalytics = async (emotion, sender) => {
  const user = auth.currentUser;
  if (!user || sender !== 'user') return;
  
  try {
    const analyticsRef = doc(db, ANALYTICS_COLLECTION, user.uid);
    const timestamp = Date.now();
    const dayKey = new Date(timestamp).toISOString().slice(0, 10);
    
    const updates = {};
    updates[`emotionCounts.${emotion}`] = increment(1);
    updates[`dailyActivity.${dayKey}`] = increment(1);
    updates.lastChatTime = timestamp;
    updates.totalMessages = increment(1);
    
    await setDoc(analyticsRef, updates, { merge: true });
  } catch (error) {
    console.error("Error updating chat analytics:", error);
  }
};

// Get chat analytics
export const getChatAnalytics = async () => {
  const user = auth.currentUser;
  if (!user) return null;
  
  try {
    const analyticsDoc = await getDoc(doc(db, ANALYTICS_COLLECTION, user.uid));
    if (analyticsDoc.exists()) {
      return analyticsDoc.data();
    }
    return null;
  } catch (error) {
    console.error("Error getting chat analytics:", error);
    return null;
  }
};

// Delete a chat session and its messages
export const deleteChatSession = async (sessionId) => {
  const user = auth.currentUser;
  if (!user || !sessionId) return false;
  
  try {
    // Delete all messages in the session
    const messagesQuery = query(
      collection(db, MESSAGES_COLLECTION),
      where("userId", "==", user.uid),
      where("sessionId", "==", sessionId)
    );
    
    const messagesSnapshot = await getDocs(messagesQuery);
    const deletePromises = messagesSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    // Delete the session
    await deleteDoc(doc(db, CHAT_COLLECTION, sessionId));
    
    return true;
  } catch (error) {
    console.error("Error deleting chat session:", error);
    return false;
  }
};

// Get chat statistics for dashboard
export const getChatStats = async () => {
  const user = auth.currentUser;
  if (!user) return null;
  
  try {
    // Get total messages count
    const messagesQuery = query(
      collection(db, MESSAGES_COLLECTION),
      where("userId", "==", user.uid),
      where("sender", "==", "user")
    );
    const messagesSnapshot = await getDocs(messagesQuery);
    const totalMessages = messagesSnapshot.size;
    
    // Get emotion distribution from analytics
    const analytics = await getChatAnalytics();
    
    // Get recent chat activity
    const recentQuery = query(
      collection(db, MESSAGES_COLLECTION),
      where("userId", "==", user.uid),
      where("timestamp", ">=", Date.now() - 7 * 24 * 60 * 60 * 1000),
      orderBy("timestamp", "desc")
    );
    const recentSnapshot = await getDocs(recentQuery);
    const recentMessages = recentSnapshot.docs.map(doc => doc.data());
    
    return {
      totalMessages,
      emotionDistribution: analytics?.emotionCounts || {},
      dailyActivity: analytics?.dailyActivity || {},
      recentMessages,
      lastChatTime: analytics?.lastChatTime || null
    };
  } catch (error) {
    console.error("Error getting chat stats:", error);
    return null;
  }
};
