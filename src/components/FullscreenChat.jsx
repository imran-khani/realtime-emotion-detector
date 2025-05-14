import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

const FullscreenChat = ({ currentEmotion, emotionHistory, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // Initialize chat with a welcome message
  useEffect(() => {
    const emotion = currentEmotion?.toLowerCase() || 'neutral';
    
    // Analyze emotion history on component mount
    const analysis = analyzeEmotionHistory();
    
    // Generate personalized welcome message
    let welcomeMessage = `Welcome to EmotiChat! I can see you're feeling ${emotion}. `;
    
    if (analysis?.dominantEmotion) {
      welcomeMessage += `You've been mostly ${analysis.dominantEmotion} recently. `;
    }
    
    welcomeMessage += "How can I help you today? We can chat about how you're feeling, or I can suggest activities that might complement your current emotional state.";
    
    // Add initial message
    addMessage(welcomeMessage, 'ai', emotion);
  }, []);
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
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
    addMessage(inputMessage, 'user', currentEmotion);
    const userMsg = inputMessage;
    setInputMessage('');

    // Show typing indicator
    setIsTyping(true);

    try {
      // Get AI response
      const response = await generateAIResponse(userMsg, currentEmotion);
      addMessage(response, 'ai', currentEmotion);
    } catch (error) {
      console.error('Error getting AI response:', error);
      // Fallback response
      addMessage("I'm here to support you. Let's talk about how you're feeling or try an activity that might help.", 'ai', currentEmotion);
    } finally {
      setIsTyping(false);
    }
  };

  // Add message to chat
  const addMessage = (text, sender, emotion) => {
    const newMessage = {
      id: Date.now(),
      text,
      sender,
      emotion,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, newMessage]);
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
    <div className="fixed inset-0 bg-gray-100 dark:bg-gray-900 z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3">
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold">EmotiChat Assistant</h1>
        </div>
        {currentEmotion && (
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="font-medium capitalize">{currentEmotion}</span>
          </div>
        )}
      </div>
      
      {/* Main chat area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-4xl mx-auto w-full">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} items-end space-x-2`}
            >
              {message.sender === 'ai' && (
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                  <span className="text-indigo-600 dark:text-indigo-400 text-sm">AI</span>
                </div>
              )}
              <div className="flex flex-col space-y-1 max-w-[80%]">
                <div
                  className={`rounded-2xl p-4 ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-br-none'
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm md:text-base whitespace-pre-wrap">{message.text}</p>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500 px-2">
                  {formatTime(message.timestamp)}
                </span>
              </div>
              {message.sender === 'user' && (
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
                  <span className="text-white text-sm">You</span>
                </div>
              )}
            </motion.div>
          ))}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start items-end space-x-2"
            >
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                <span className="text-indigo-600 dark:text-indigo-400 text-sm">AI</span>
              </div>
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-none p-4">
                <div className="flex space-x-2">
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                    className="w-3 h-3 bg-gray-400 dark:bg-gray-500 rounded-full"
                  />
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }}
                    className="w-3 h-3 bg-gray-400 dark:bg-gray-500 rounded-full"
                  />
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }}
                    className="w-3 h-3 bg-gray-400 dark:bg-gray-500 rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          )}
          <div ref={chatEndRef} />
        </AnimatePresence>
      </div>
      
      {/* Message input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <form onSubmit={handleSendMessage} className="flex space-x-2 max-w-4xl mx-auto">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-4 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
          />
          <button
            type="submit"
            className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-600 transition-all duration-200 flex items-center justify-center"
          >
            <span className="mr-2">Send</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default FullscreenChat; 