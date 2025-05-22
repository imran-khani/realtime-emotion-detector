import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const MODEL_NAME = "gpt-4o-mini";
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;

// Activity suggestions based on emotion
const ACTIVITY_SUGGESTIONS = {
  happy: [
    "Start a gratitude journal to capture these positive moments",
    "Create art that reflects your current positive mood",
    "Share your positive energy with friends or family"
  ],
  sad: [
    "Listen to calming music that acknowledges your feelings",
    "Take a gentle walk in nature",
    "Write about your feelings in a private journal"
  ],
  angry: [
    "Practice deep breathing exercises for 5 minutes",
    "Go for a brisk walk or jog to release tension",
    "Write down what's bothering you, then physically crumple it up"
  ],
  neutral: [
    "Try a new hobby you've been curious about",
    "Take time to read a good book",
    "Plan something you're looking forward to"
  ],
  surprised: [
    "Journal about what surprised you and why",
    "Share this surprising moment with someone for perspective",
    "Channel this surprise energy into a creative project"
  ],
  fearful: [
    "Practice the 5-4-3-2-1 sensory grounding technique",
    "Create a safe, cozy environment around you",
    "Write down your specific fears and challenge their reality"
  ],
  disgusted: [
    "Open windows to get fresh air flowing",
    "Shift your focus to something pleasant or beautiful",
    "Take a refreshing walk outdoors"
  ]
};

// Emotional coping strategies
const COPING_STRATEGIES = {
  sad: [
    "Remember that all emotions are temporary and will pass",
    "Be gentle with yourself - it's okay to feel sad sometimes",
    "Reach out to a supportive friend or family member"
  ],
  angry: [
    "Take a timeout before responding to what's upsetting you",
    "Ask yourself if this will matter in a day, a week, or a month",
    "Look for the humor in a frustrating situation when possible"
  ],
  fearful: [
    "Focus on what you can control, even if it's just your breathing",
    "Break overwhelming fears into smaller, manageable pieces",
    "Visualize yourself handling the feared situation successfully"
  ]
};

const FullscreenChat = ({ currentMood, emotionHistory, messages = [], onClose }) => {
  const [localMessages, setLocalMessages] = useState(messages);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const [showEmojis, setShowEmojis] = useState(false);
  const [messageIdCounter, setMessageIdCounter] = useState(messages.length + 1);
  
  // Handle key press for sending messages with Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };
  
  // Update local messages when props change
  useEffect(() => {
    setLocalMessages(messages);
    setMessageIdCounter(messages.length + 1);
  }, [messages]);

  // Focus on input when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages]);
  
  // Analyze emotion history to provide context
  const analyzeEmotionHistory = () => {
    if (!emotionHistory || emotionHistory.length === 0) return null;

    // Analyze the last 10 minutes
    const last10Minutes = emotionHistory.filter(entry => 
      Date.now() - entry.timestamp < 10 * 60 * 1000
    );

    if (last10Minutes.length === 0) return null;

    // Count occurrences of each emotion
    const emotionCounts = last10Minutes.reduce((acc, entry) => {
      acc[entry.emotion] = (acc[entry.emotion] || 0) + 1;
      return acc;
    }, {});

    // Find the dominant emotion
    const dominantEmotion = Object.entries(emotionCounts)
      .reduce((a, b) => (b[1] > a[1] ? b : a))[0];

    // Track emotion changes
    const emotionChanges = last10Minutes.reduce((changes, entry, i, arr) => {
      if (i > 0 && entry.emotion !== arr[i - 1].emotion) {
        changes.push({
          from: arr[i - 1].emotion,
          to: entry.emotion,
          timestamp: entry.timestamp
        });
      }
      return changes;
    }, []);

    return {
      dominantEmotion,
      emotionChanges,
      duration: Date.now() - last10Minutes[0].timestamp,
      emotionCounts,
      recentEmotions: last10Minutes.slice(-5).map(e => e.emotion)
    };
  };
  
  // Get activity suggestions for current emotion
  const getRelevantActivities = (emotion) => {
    const emotionKey = emotion?.toLowerCase() || 'neutral';
    const activities = ACTIVITY_SUGGESTIONS[emotionKey] || ACTIVITY_SUGGESTIONS.neutral;
    
    // Get coping strategies if applicable
    let strategies = [];
    if (['sad', 'angry', 'fearful'].includes(emotionKey) && COPING_STRATEGIES[emotionKey]) {
      strategies = COPING_STRATEGIES[emotionKey];
    }
    
    return {
      activities,
      strategies
    };
  };

  // Generate AI response based on user input and emotional context
  const generateAIResponse = async (userMessage, emotion) => {
    try {
      // Get updated analysis
      const emotionContext = analyzeEmotionHistory();
      
      // Get relevant activities and coping strategies
      const { activities, strategies } = getRelevantActivities(emotion);
      
      // Create a detailed context for the AI
      const messages = [
        {
          role: 'system',
          content: `You are EmotiChat, an empathetic AI assistant specialized in emotional intelligence. 
          You help users understand and process their emotions in a supportive way.

          ## USER'S EMOTIONAL STATE
          The user's current emotion based on facial recognition is: ${emotion || 'neutral'}.
          ${emotionContext ? `Emotion history context: ${JSON.stringify(emotionContext)}` : ''}
          
          ## AVAILABLE ACTIVITIES FOR THE USER'S CURRENT EMOTION
          ${activities.map(a => `- ${a}`).join('\n')}
          
          ${strategies.length > 0 ? `## COPING STRATEGIES FOR ${emotion.toUpperCase()}\n${strategies.map(s => `- ${s}`).join('\n')}` : ''}
          
          ## GUIDELINES
          1. Be empathetic, supportive, and use a conversational tone
          2. If the user is feeling sad, angry, or fearful, offer emotional support first
          3. Suggest specific activities from the available list when appropriate
          4. If the user asks for suggestions or activities, recommend 1-2 activities from the list
          5. If the user seems to be struggling emotionally, offer one of the coping strategies
          6. Keep responses concise (3-4 sentences max)
          7. Ask open-ended questions to encourage sharing
          8. If the user shares something about their feelings, acknowledge it before moving on
          9. Don't use bullet points or numbered lists - keep it conversational
          10. DO NOT list all the activities at once - suggest only 1-2 that are most relevant`
        },
        {
          role: 'user',
          content: userMessage
        }
      ];
      
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: MODEL_NAME,
          messages: messages,
          temperature: 0.7,
          max_tokens: 150,
          top_p: 0.9
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Extract the response content
      const aiResponse = response.data.choices[0]?.message?.content || '';
      
      return aiResponse;
    } catch (error) {
      console.error('AI response error:', error);
      // Fallback response
      return "I'm here to listen and support you. Would you like to talk about how you're feeling, or perhaps try an activity that might help with your current emotion?";
    }
  };

  // Handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage = {
      id: messageIdCounter,
      text: inputMessage,
      sender: 'user',
      emotion: currentMood,
      timestamp: Date.now()
    };

    setLocalMessages(prev => [...prev, userMessage]);
    setMessageIdCounter(prev => prev + 1);
    
    const userMsg = inputMessage;
    setInputMessage('');

    // Show typing indicator
    setIsTyping(true);

    try {
      // Simulate a slight delay for better UX even if response is fast
      await new Promise(resolve => setTimeout(resolve, 700));
      
      // Get AI response
      const response = await generateAIResponse(userMsg, currentMood);
      
      // Hide typing indicator before adding the AI message
      setIsTyping(false);
      
      // Short delay before showing the AI response
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Add AI response
      const aiMessage = {
        id: messageIdCounter + 1,
        text: response,
        sender: 'ai',
        emotion: currentMood,
        timestamp: Date.now()
      };

      setLocalMessages(prev => [...prev, aiMessage]);
      setMessageIdCounter(prev => prev + 2);
    } catch (error) {
      console.error('Error getting AI response:', error);
      // Hide typing indicator
      setIsTyping(false);
      
      // Wait a moment before showing fallback
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Fallback response
      const fallbackMessage = {
        id: messageIdCounter + 1,
        text: "I'm here to support you. Let's talk about how you're feeling or try an activity that might help.",
        sender: 'ai',
        emotion: currentMood,
        timestamp: Date.now()
      };

      setLocalMessages(prev => [...prev, fallbackMessage]);
      setMessageIdCounter(prev => prev + 2);
    }
  };

  // Add message to chat (removed Firebase dependency)
  const addMessage = (text, sender, emotion) => {
    const newMessage = {
      id: messageIdCounter,
      text,
      sender,
      emotion,
      timestamp: Date.now()
    };
    
    setLocalMessages(prev => [...prev, newMessage]);
    setMessageIdCounter(prev => prev + 1);
  };

  // Format time for display
  const formatTime = (timestamp) => {
    return new Intl.DateTimeFormat('en', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(timestamp);
  };

  return (
    <div className="fixed inset-0 bg-gray-100 dark:bg-gray-900 z-50 flex">
      <div className="max-w-4xl mx-auto w-full flex flex-col">
        {/* Header */}
        <div className="bg-indigo-600 dark:bg-indigo-700 text-white p-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-semibold">EmotiChat</span>
            {currentMood && (
              <span className="text-xs bg-indigo-500/40 px-2 py-0.5 rounded-full">
                {currentMood.charAt(0).toUpperCase() + currentMood.slice(1)}
              </span>
            )}
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full hover:bg-indigo-500/30"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-3 space-y-3 bg-gray-50 dark:bg-gray-900">
          <AnimatePresence>
            {localMessages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-gray-500 dark:text-gray-400 mt-6 space-y-1.5 max-w-2xl mx-auto"
              >
                <p className="text-base">👋 Start a conversation</p>
                <p className="text-xs">Type a message below to begin chatting</p>
              </motion.div>
            ) : (
              <div className="max-w-3xl mx-auto space-y-3">
                {localMessages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} items-end space-x-2`}
                >
                  {message.sender === 'ai' && (
                    <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                      <span className="text-indigo-600 dark:text-indigo-400 text-xs">AI</span>
                    </div>
                  )}
                  <div className="flex flex-col space-y-1 max-w-[85%]">
                    <div
                      className={`rounded-2xl p-2.5 ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-br-none'
                          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-500 px-1">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  {message.sender === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center">
                      <span className="text-white text-xs">You</span>
                    </div>
                  )}
                </motion.div>
              ))}
              </div>
            )}
            {isTyping && (
              <div className="max-w-3xl mx-auto">
                <motion.div
                  key="typing-indicator"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex justify-start items-end space-x-2"
                >
                  <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                    <span className="text-indigo-600 dark:text-indigo-400 text-xs">AI</span>
                  </div>
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-none p-2.5">
                    <div className="flex space-x-1.5">
                      <motion.div
                        animate={{ y: [0, -3, 0] }}
                        transition={{ repeat: Infinity, duration: 1.2 }}
                        className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -3, 0] }}
                        transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }}
                        className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -3, 0] }}
                        transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }}
                        className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
            <div ref={chatEndRef} />
          </AnimatePresence>
        </div>

        {/* Input area */}
        <div className="p-2 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="w-full p-2.5 pr-10 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
                <button
                  type="button"
                  onClick={() => setShowEmojis(!showEmojis)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  😊
                </button>
                {showEmojis && (
                  <div className="absolute bottom-full right-0 mb-2 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                    <div className="grid grid-cols-4 gap-1">
                      {['😊', '😢', '😠', '😮', '😐', '😨', '🤢', '👍'].map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            setInputMessage(prev => prev + emoji);
                            setShowEmojis(false);
                            inputRef.current?.focus();
                          }}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="px-3 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-600 transition-all duration-200 flex items-center"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullscreenChat; 