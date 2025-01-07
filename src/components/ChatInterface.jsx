import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// Enhanced response system with categories and context
const CHAT_RESPONSES = {
  happy: {
    greetings: [
      "You seem happy! What's making you smile?",
      "Your positive energy is contagious! Want to share your joy?",
      "It's great to see you in such a good mood!"
    ],
    activities: [
      "This is a perfect time to work on something creative! Any projects in mind?",
      "Would you like to share this happiness with someone? Maybe call a friend?",
      "How about channeling this positive energy into something you've been wanting to do?"
    ],
    support: [
      "It's wonderful to see you happy! Let's talk about what's going well.",
      "Your smile brightens the room! Want to share your happiness tips?",
      "I love seeing you this way! What's the highlight of your day?"
    ]
  },
  sad: {
    greetings: [
      "I notice you're feeling down. Would you like to talk about it?",
      "Sometimes sharing what's troubling us can help. I'm here to listen.",
      "Remember, it's okay to not be okay. Want to share what's on your mind?"
    ],
    activities: [
      "How about we try some mood-lifting activities? Maybe a short walk?",
      "Would you like to listen to some uplifting music together?",
      "Sometimes writing down our feelings helps. Want to try journaling?"
    ],
    support: [
      "You're not alone in this. I'm here to support you.",
      "This feeling won't last forever. Let's work through it together.",
      "Your feelings are valid. Would you like to explore them together?"
    ]
  },
  angry: {
    greetings: [
      "I can see you're frustrated. Want to talk about what's bothering you?",
      "Taking deep breaths can help when we're angry. Want to try that together?",
      "It's okay to feel angry. Would you like to discuss what triggered this?"
    ],
    activities: [
      "Let's try some calming exercises. Deep breathing can help.",
      "Would you like to try counting to 10 slowly with me?",
      "Sometimes physical activity helps release tension. Maybe stretch a bit?"
    ],
    support: [
      "Your anger is valid. Let's work through this together.",
      "I'm here to listen without judgment. Want to vent?",
      "It's okay to feel this way. How can I help you process this?"
    ]
  },
  neutral: {
    greetings: [
      "Hello! How are you doing today?",
      "Nice to see you! How's your day going?",
      "Hi there! What's on your mind?"
    ],
    activities: [
      "Would you like some suggestions for activities?",
      "I can recommend some activities if you'd like.",
      "There's always something interesting we could try!"
    ],
    support: [
      "I'm here to chat and help however I can.",
      "Feel free to share whatever's on your mind.",
      "Let me know if you'd like any suggestions or support."
    ]
  },
  surprised: {
    greetings: [
      "Oh! What's got you surprised?",
      "Something unexpected happened?",
      "I see you're surprised! Want to talk about it?"
    ],
    activities: [
      "Let's channel that surprise into something fun!",
      "How about trying something new while you're in an adventurous mood?",
      "This could be a good time to explore something different!"
    ],
    support: [
      "Surprises can be both good and bad. Want to talk about it?",
      "I'm here to process this surprising moment with you.",
      "Let's talk about what surprised you!"
    ]
  },
  fearful: {
    greetings: [
      "I notice you're feeling anxious. Would you like to talk about it?",
      "It's okay to feel scared. I'm here to listen.",
      "Let's work through this fear together."
    ],
    activities: [
      "Some deep breathing might help calm those nerves.",
      "Would you like to try some grounding exercises?",
      "Let's focus on something calming together."
    ],
    support: [
      "Remember, this feeling will pass. I'm here with you.",
      "You're safe here. Let's talk through what's bothering you.",
      "It's perfectly normal to feel scared sometimes. How can I help?"
    ]
  },
  disgusted: {
    greetings: [
      "Something bothering you?",
      "Let's talk about what's causing this reaction.",
      "Want to share what's troubling you?"
    ],
    activities: [
      "Let's focus on something more pleasant.",
      "How about we shift our attention to something you enjoy?",
      "Would you like to try an activity to lift your mood?"
    ],
    support: [
      "I understand this feeling can be uncomfortable. Let's work through it.",
      "We can talk about what's bothering you if you'd like.",
      "Sometimes talking about it can help process these feelings."
    ]
  }
};

// Activity suggestions based on emotion
const ACTIVITIES = {
  happy: [
    "📝 Start a gratitude journal",
    "🎨 Work on a creative project",
    "📞 Call a friend to share your joy",
    "🎵 Create a happy playlist"
  ],
  sad: [
    "🚶‍♂️ Take a gentle walk outside",
    "🎵 Listen to uplifting music",
    "📝 Write down your feelings",
    "🫂 Reach out to a friend"
  ],
  angry: [
    "🧘‍♂️ Try deep breathing exercises",
    "🏃‍♂️ Go for a quick run or walk",
    "📝 Write down what's bothering you",
    "🎵 Listen to calming music"
  ],
  neutral: [
    "📚 Read a good book",
    "🎨 Try a new hobby",
    "🌳 Take a nature walk",
    "✍️ Write in a journal"
  ],
  surprised: [
    "📝 Journal about this unexpected moment",
    "📞 Share the surprise with a friend",
    "🎨 Channel the energy into creativity",
    "📸 Document this unique experience"
  ],
  fearful: [
    "🧘‍♂️ Practice deep breathing",
    "🎵 Listen to calming music",
    "📝 Write down your worries",
    "🫂 Connect with a supportive friend"
  ],
  disgusted: [
    "🚶‍♂️ Take a refreshing walk",
    "🎭 Focus on a pleasant memory",
    "🎨 Do something creative",
    "🌺 Spend time in nature"
  ]
};

const getDefaultEmotion = (emotion) => {
  const validEmotions = Object.keys(CHAT_RESPONSES);
  return validEmotions.includes(emotion?.toLowerCase()) ? emotion.toLowerCase() : 'neutral';
};

const HF_TOKEN = "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";
const MODEL_NAME = "mistralai/Mistral-7B-Instruct-v0.2";

const ChatInterface = ({ currentEmotion, confidence, emotionHistory }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [conversationContext, setConversationContext] = useState({
    topicCount: {},
    lastResponse: null,
    suggestedActivity: false
  });
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const generateAIResponse = async (userMessage, emotion) => {
    try {
      // Format prompt in Mistral style
      const prompt = `<s>[INST] You are EmotiChat, an empathetic AI assistant. The user is feeling ${emotion}.
Please respond to their message: "${userMessage}"
Keep your response supportive, understanding, and concise. [/INST]`;
      
      const response = await axios.post(
        `https://api-inference.huggingface.co/models/${MODEL_NAME}`,
        {
          inputs: prompt,
          parameters: {
            max_new_tokens: 150,
            temperature: 0.7,
            top_k: 50,
            top_p: 0.9,
            repetition_penalty: 1.1,
            do_sample: true
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${HF_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      let aiResponse = response.data[0]?.generated_text || '';
      
      // Clean up the response
      aiResponse = aiResponse.split('[/INST]').pop().trim();
      aiResponse = aiResponse.split('[INST]')[0].trim();
      
      return aiResponse || getSmartResponse(userMessage, emotion);
    } catch (error) {
      console.error('AI response error:', error);
      // Fallback to rule-based responses if API fails
      return getSmartResponse(userMessage, emotion);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Add user message
    addMessage(inputMessage, 'user', currentEmotion);
    const userMsg = inputMessage;
    setInputMessage('');
    setShowEmojis(false);

    // Show typing indicator
    setIsTyping(true);

    try {
      // Get AI response
      const response = await generateAIResponse(userMsg, currentEmotion);
      addMessage(response, 'ai', currentEmotion);
    } catch (error) {
      console.error('Error getting AI response:', error);
      // Fallback to rule-based response
      const fallbackResponse = getSmartResponse(userMsg, currentEmotion);
      addMessage(fallbackResponse, 'ai', currentEmotion);
    } finally {
      setIsTyping(false);
    }
  };

  const formatTime = (timestamp) => {
    return new Intl.DateTimeFormat('en', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(timestamp);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

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

  const generateResponse = (userMessage, emotion) => {
    // Check for greetings
    const greetings = ['hi', 'hello', 'hey'];
    if (greetings.some(g => userMessage.toLowerCase().includes(g))) {
      return "👋 Hello! How are you feeling today?";
    }

    // Check for gratitude
    if (userMessage.toLowerCase().includes('thank')) {
      return "You're welcome! I'm here to help! 😊";
    }

    // Check for questions about capabilities
    if (userMessage.toLowerCase().includes('what can you do')) {
      return "I can chat with you, understand your emotions, and provide support. I can also suggest activities based on how you're feeling! Would you like to try that?";
    }

    // Get contextual response based on emotion and message
    return getSmartResponse(userMessage, emotion);
  };

  const analyzeEmotionHistory = () => {
    if (!emotionHistory || emotionHistory.length === 0) return null;

    const last10Minutes = emotionHistory.filter(entry => 
      Date.now() - entry.timestamp < 10 * 60 * 1000
    );

    const emotionCounts = last10Minutes.reduce((acc, entry) => {
      acc[entry.emotion] = (acc[entry.emotion] || 0) + 1;
      return acc;
    }, {});

    const dominantEmotion = Object.entries(emotionCounts)
      .reduce((a, b) => (b[1] > a[1] ? b : a))[0];

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
      duration: last10Minutes.length > 0 ? 
        Date.now() - last10Minutes[0].timestamp : 0
    };
  };

  const getSmartResponse = (userMessage, emotion) => {
    const analysis = analyzeEmotionHistory();
    const currentEmotion = getDefaultEmotion(emotion);
    
    // If we have emotion history analysis, use it for more contextual responses
    if (analysis) {
      // Check for emotional changes
      if (analysis.emotionChanges.length > 0) {
        const lastChange = analysis.emotionChanges[analysis.emotionChanges.length - 1];
        if (Date.now() - lastChange.timestamp < 60000) { // Within last minute
          return `I notice your mood has shifted from ${lastChange.from} to ${lastChange.to}. Would you like to talk about what triggered this change?`;
        }
      }

      // Check for persistent emotions
      if (analysis.dominantEmotion === currentEmotion && analysis.duration > 5 * 60 * 1000) {
        return `I've noticed you've been feeling ${currentEmotion} for a while now. How are you coping with these feelings?`;
      }
    }

    // Check for activity-related keywords
    if (userMessage.toLowerCase().includes('activity') || 
        userMessage.toLowerCase().includes('suggestion') ||
        userMessage.toLowerCase().includes('what should i do')) {
      const activities = ACTIVITIES[currentEmotion];
      const activity = activities[Math.floor(Math.random() * activities.length)];
      setConversationContext(prev => ({ ...prev, suggestedActivity: true }));
      return `Based on your current mood, here's a suggestion: ${activity}. Would you like to try this?`;
    }

    // Get responses for the current emotion
    const responses = CHAT_RESPONSES[currentEmotion];
    
    // Determine response category based on message content and context
    let category = 'greetings';
    
    if (userMessage.toLowerCase().includes('help') || 
        userMessage.toLowerCase().includes('support')) {
      category = 'support';
    } else if (!conversationContext.suggestedActivity) {
      category = 'activities';
      setConversationContext(prev => ({ ...prev, suggestedActivity: true }));
    }

    // Get response array for the category
    const categoryResponses = responses[category];
    
    // Select a random response from the category
    const response = categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
    
    // Update conversation context
    setConversationContext(prev => ({
      ...prev,
      lastResponse: response,
      topicCount: {
        ...prev.topicCount,
        [category]: (prev.topicCount[category] || 0) + 1
      }
    }));

    return response;
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group z-50"
      >
        {isChatOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <div className="relative">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            {messages.length > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
            )}
          </div>
        )}
      </button>

      {/* Chat Modal */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 w-96 h-[600px] shadow-2xl rounded-2xl overflow-hidden z-50"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden h-full flex flex-col">
              {/* Header */}
              <div className="p-4 bg-gradient-to-r from-indigo-600 to-indigo-500 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                  <div>
                    <h2 className="text-white text-lg font-semibold">EmotiChat Assistant</h2>
                    <p className="text-indigo-100 text-sm">Always here to listen and support</p>
                  </div>
                </div>
                {currentEmotion && (
                  <span className="px-3 py-1 rounded-full bg-white/10 text-white text-xs">
                    Feeling: {currentEmotion}
                  </span>
                )}
              </div>

              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
                <AnimatePresence>
                  {messages.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center text-gray-500 dark:text-gray-400 mt-8 space-y-2"
                    >
                      <p className="text-lg">👋 Welcome to EmotiChat!</p>
                      <p className="text-sm">I can see your emotions and I'm here to chat and support you.</p>
                      <p className="text-xs">Try saying "Hi" or "How can you help me?"</p>
                    </motion.div>
                  ) : (
                    messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} items-end space-x-2`}
                      >
                        {message.sender === 'ai' && (
                          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                            <span className="text-indigo-600 dark:text-indigo-400 text-sm">AI</span>
                          </div>
                        )}
                        <div className="flex flex-col space-y-1 max-w-[80%]">
                          <div
                            className={`rounded-2xl p-3 ${
                              message.sender === 'user'
                                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-br-none'
                                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                          </div>
                          <span className="text-xs text-gray-400 dark:text-gray-500 px-2">
                            {formatTime(message.timestamp)}
                          </span>
                        </div>
                        {message.sender === 'user' && (
                          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                            <span className="text-white text-sm">You</span>
                          </div>
                        )}
                      </motion.div>
                    ))
                  )}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex justify-start items-end space-x-2"
                    >
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                        <span className="text-indigo-600 dark:text-indigo-400 text-sm">AI</span>
                      </div>
                      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-none p-3">
                        <div className="flex space-x-1">
                          <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 0.5 }}
                            className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
                          />
                          <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 0.5, delay: 0.1 }}
                            className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
                          />
                          <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 0.5, delay: 0.2 }}
                            className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={chatEndRef} />
              </div>

              {/* Message input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="w-full p-3 pr-12 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEmojis(!showEmojis)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      😊
                    </button>
                    {showEmojis && (
                      <div className="absolute bottom-full right-0 mb-2 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                        <div className="grid grid-cols-6 gap-1">
                          {['😊', '😢', '😠', '😮', '😐', '😨', '🤢', '👍', '❤️', '🎉', '🤔', '😴'].map((emoji) => (
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
                    className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-600 transition-all duration-200 flex items-center space-x-2"
                  >
                    <span>Send</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsChatOpen(false)}
            className="fixed inset-0 bg-black/10 z-40"
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatInterface; 