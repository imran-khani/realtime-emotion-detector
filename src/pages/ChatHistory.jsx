import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  ClockIcon,
  ArrowLeftIcon,
  ChartBarIcon,
  FaceSmileIcon
} from '@heroicons/react/24/outline';

const ChatHistory = () => {
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState({
    totalMessages: 0,
    emotionDistribution: {},
    lastChatTime: null
  });

  // Load actual chat data from localStorage
  useEffect(() => {
    const storedMessages = localStorage.getItem('chatMessages');
    if (storedMessages) {
      try {
        const parsedMessages = JSON.parse(storedMessages);
        setMessages(parsedMessages);
        
        // Calculate actual stats from messages
        const userMessages = parsedMessages.filter(msg => msg.sender === 'user');
        const emotionCounts = {};
        
        userMessages.forEach(msg => {
          if (msg.emotion) {
            emotionCounts[msg.emotion] = (emotionCounts[msg.emotion] || 0) + 1;
          }
        });

        const lastMessage = parsedMessages.length > 0 ? 
          parsedMessages[parsedMessages.length - 1] : null;

        setStats({
          totalMessages: parsedMessages.length,
          emotionDistribution: emotionCounts,
          lastChatTime: lastMessage ? lastMessage.timestamp : null
        });
      } catch (error) {
        console.error('Error parsing stored messages:', error);
      }
    }
  }, []);

  const formatDate = (timestamp) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(new Date(timestamp));
  };

  const formatMessageTime = (timestamp) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(new Date(timestamp));
  };

  const emotionColors = {
    happy: '#10B981',
    sad: '#6366F1',
    angry: '#EF4444',
    fearful: '#F59E0B',
    disgusted: '#8B5CF6',
    surprised: '#EC4899',
    neutral: '#6B7280'
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="mb-8 flex justify-between items-start">
            <div>
              <Link
                to="/app"
                className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                Back to App
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Chat History
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                View and manage your chat conversations
              </p>
            </div>
            {messages.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear all chat history? This cannot be undone.')) {
                    localStorage.removeItem('chatMessages');
                    setMessages([]);
                    setStats({
                      totalMessages: 0,
                      emotionDistribution: {},
                      lastChatTime: null
                    });
                  }
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
              >
                Clear History
              </button>
            )}
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <ChatBubbleLeftRightIcon className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Messages
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.totalMessages || 0}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <FaceSmileIcon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Most Common Emotion
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.emotionDistribution && Object.keys(stats.emotionDistribution).length > 0
                    ? Object.entries(stats.emotionDistribution)
                        .sort((a, b) => b[1] - a[1])[0][0]
                        .charAt(0).toUpperCase() + 
                      Object.entries(stats.emotionDistribution)
                        .sort((a, b) => b[1] - a[1])[0][0]
                        .slice(1)
                    : 'None'}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <ClockIcon className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Last Chat
                </h3>
                <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                  {stats.lastChatTime
                    ? formatDate(stats.lastChatTime)
                    : 'Never'}
                </p>
              </motion.div>
            </div>
          )}

          {/* Main Content - Chat Messages */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  Chat Messages
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {messages.length > 0 ? `${messages.length} messages in your chat history` : 'No messages yet'}
                </p>
              </div>
              <div className="h-[600px] overflow-y-auto p-6">
                {messages.length > 0 ? (
                  <div className="space-y-6">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${
                          message.sender === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div className={`max-w-[70%] ${
                          message.sender === 'user' ? 'order-1' : 'order-2'
                        }`}>
                          <div
                            className={`rounded-2xl p-4 ${
                              message.sender === 'user'
                                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-br-none'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
                            }`}
                          >
                            <p className="text-sm leading-relaxed">{message.text}</p>
                          </div>
                          <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                            <span>{formatMessageTime(message.timestamp)}</span>
                            {message.emotion && (
                              <span
                                className="ml-2 px-2 py-1 rounded-full text-xs font-medium"
                                style={{
                                  backgroundColor: emotionColors[message.emotion] + '20',
                                  color: emotionColors[message.emotion]
                                }}
                              >
                                {message.emotion}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          message.sender === 'user'
                            ? 'order-2 ml-3 bg-indigo-600'
                            : 'order-1 mr-3 bg-gray-300 dark:bg-gray-600'
                        }`}>
                          <span className="text-sm font-medium text-white">
                            {message.sender === 'user' ? 'You' : 'AI'}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                    <ChatBubbleLeftRightIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">No chat history found</p>
                    <p className="text-sm mb-4">Start chatting with EmotiChat to see your conversation history here</p>
                    <Link
                      to="/app/home"
                      className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                    >
                      Start Chatting
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ChatHistory;