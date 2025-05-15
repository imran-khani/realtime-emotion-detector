import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  ClockIcon,
  TrashIcon,
  ArrowLeftIcon,
  ChartBarIcon,
  FaceSmileIcon
} from '@heroicons/react/24/outline';
import { 
  getChatSessions,
  getChatHistory,
  deleteChatSession,
  getChatStats
} from '../utils/chatFirebase';

const ChatHistory = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionMessages, setSessionMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    loadSessions();
    loadStats();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const sessionList = await getChatSessions(20);
      setSessions(sessionList);
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
    setLoading(false);
  };

  const loadStats = async () => {
    try {
      const chatStats = await getChatStats();
      setStats(chatStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const selectSession = async (session) => {
    setSelectedSession(session);
    const messages = await getChatHistory(session.id);
    setSessionMessages(messages);
  };

  const handleDeleteSession = async (sessionId) => {
    const success = await deleteChatSession(sessionId);
    if (success) {
      setSessions(sessions.filter(s => s.id !== sessionId));
      if (selectedSession?.id === sessionId) {
        setSelectedSession(null);
        setSessionMessages([]);
      }
      setDeleteConfirm(null);
      loadStats(); // Reload stats after deletion
    }
  };

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
          <div className="mb-8">
            <Link
              to="/"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Back to Home
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Chat History
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              View and manage your chat conversations
            </p>
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

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sessions List */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                    Chat Sessions
                  </h2>
                </div>
                <div className="overflow-hidden">
                  {loading ? (
                    <div className="p-4 text-center text-gray-500">
                      Loading sessions...
                    </div>
                  ) : sessions.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No chat sessions found
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {sessions.map((session) => (
                        <motion.div
                          key={session.id}
                          whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                          onClick={() => selectSession(session)}
                          className={`p-4 cursor-pointer ${
                            selectedSession?.id === session.id
                              ? 'bg-indigo-50 dark:bg-indigo-900/20'
                              : ''
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {formatDate(session.startTime)}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Last active: {formatDate(session.lastActive)}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirm(session.id);
                              }}
                              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                            >
                              <TrashIcon className="h-4 w-4 text-gray-400" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Messages Display */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                    Messages
                  </h2>
                </div>
                <div className="h-[600px] overflow-y-auto p-4">
                  {selectedSession ? (
                    sessionMessages.length > 0 ? (
                      <div className="space-y-4">
                        {sessionMessages.map((message) => (
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
                                className={`rounded-lg p-3 ${
                                  message.sender === 'user'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                                }`}
                              >
                                <p className="text-sm">{message.text}</p>
                              </div>
                              <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                                <span>{formatMessageTime(message.timestamp)}</span>
                                {message.emotion && (
                                  <span
                                    className="ml-2 px-2 py-0.5 rounded-full"
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
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              message.sender === 'user'
                                ? 'order-2 ml-2 bg-indigo-600'
                                : 'order-1 mr-2 bg-gray-300 dark:bg-gray-600'
                            }`}>
                              <span className="text-xs text-white">
                                {message.sender === 'user' ? 'U' : 'AI'}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 dark:text-gray-400">
                        No messages in this session
                      </div>
                    )
                  ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400">
                      Select a session to view messages
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4"
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Delete Chat Session?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This will permanently delete this chat session and all its messages.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteSession(deleteConfirm)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ChatHistory;