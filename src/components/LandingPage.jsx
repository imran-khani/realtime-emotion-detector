import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@mui/material';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import TimelineIcon from '@mui/icons-material/Timeline';
import ChatIcon from '@mui/icons-material/Chat';
import PsychologyIcon from '@mui/icons-material/Psychology';

const LandingPage = ({ onGetStarted }) => {
  const features = [
    {
      icon: <SentimentSatisfiedAltIcon sx={{ fontSize: 40 }} />,
      title: "Real-time Emotion Detection",
      description: "Advanced AI technology that detects and analyzes your emotions in real-time through facial expressions."
    },
    {
      icon: <TimelineIcon sx={{ fontSize: 40 }} />,
      title: "Emotional Analytics",
      description: "Track your emotional patterns and get insights into your emotional well-being over time."
    },
    {
      icon: <ChatIcon sx={{ fontSize: 40 }} />,
      title: "AI Chat Support",
      description: "Engage with our emotionally intelligent AI that provides personalized support and guidance."
    },
    {
      icon: <PsychologyIcon sx={{ fontSize: 40 }} />,
      title: "Emotional Intelligence",
      description: "Develop better emotional awareness and understanding through real-time feedback and insights."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl sm:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-indigo-600 mb-6">
              EmotiSense
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 mb-8">
              AI-powered emotional intelligence assistant that helps you understand and manage your emotions better
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={onGetStarted}
              sx={{
                backgroundColor: 'rgb(79, 70, 229)',
                '&:hover': {
                  backgroundColor: 'rgb(67, 56, 202)',
                },
                fontSize: '1.1rem',
                py: 1.5,
                px: 4,
                borderRadius: 2,
                textTransform: 'none'
              }}
            >
              Get Started
            </Button>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-12">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 * (index + 1), duration: 0.5 }}
              className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 hover:border-indigo-500/50 transition-colors"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="text-indigo-400">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
              </div>
              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="mt-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-12">Why Choose EmotiSense?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="bg-gray-800/30 rounded-lg p-6">
                <div className="text-2xl font-bold text-indigo-400 mb-2">Real-time</div>
                <p className="text-gray-400">Instant emotion detection and feedback</p>
              </div>
              <div className="bg-gray-800/30 rounded-lg p-6">
                <div className="text-2xl font-bold text-indigo-400 mb-2">Intelligent</div>
                <p className="text-gray-400">Advanced AI-powered analysis and insights</p>
              </div>
              <div className="bg-gray-800/30 rounded-lg p-6">
                <div className="text-2xl font-bold text-indigo-400 mb-2">Private</div>
                <p className="text-gray-400">Secure and confidential emotion tracking</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="mt-24 text-center"
        >
          <div className="inline-block bg-gradient-to-r from-indigo-900/50 to-indigo-800/50 rounded-2xl p-8 border border-indigo-700/30">
            <h3 className="text-2xl font-bold mb-4">Ready to understand your emotions better?</h3>
            <p className="text-gray-400 mb-6">Start your emotional intelligence journey today</p>
            <Button
              variant="contained"
              size="large"
              onClick={onGetStarted}
              sx={{
                backgroundColor: 'rgb(79, 70, 229)',
                '&:hover': {
                  backgroundColor: 'rgb(67, 56, 202)',
                },
                fontSize: '1.1rem',
                py: 1.5,
                px: 4,
                borderRadius: 2,
                textTransform: 'none'
              }}
            >
              Get Started Now
            </Button>
          </div>
        </motion.div>

        {/* Team Members */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.5 }}
          className="mt-24 text-center"
        >
          <div className="bg-gradient-to-r from-indigo-900/30 to-indigo-800/30 rounded-2xl p-8 border border-indigo-700/20">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-300 mb-3">
              Final Year Project
            </h2>
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-200 mb-1">University of Agriculture, Peshawar</h3>
              <p className="text-indigo-400">Department of Computer Science</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="bg-gray-800/40 rounded-xl p-6 border border-indigo-700/20 hover:border-indigo-500/40 transition-colors">
                <div className="text-lg font-medium text-gray-200 mb-1">Imran Khan</div>
                <div className="text-sm text-indigo-400">Team Lead</div>
              </div>
              <div className="bg-gray-800/40 rounded-xl p-6 border border-indigo-700/20 hover:border-indigo-500/40 transition-colors">
                <div className="text-lg font-medium text-gray-200 mb-1">Ubaid Ullah</div>
                <div className="text-sm text-indigo-400">Team Member</div>
              </div>
              <div className="bg-gray-800/40 rounded-xl p-6 border border-indigo-700/20 hover:border-indigo-500/40 transition-colors">
                <div className="text-lg font-medium text-gray-200 mb-1">Saqib Khan</div>
                <div className="text-sm text-indigo-400">Team Member</div>
              </div>
            </div>

            <div className="mt-8 text-sm text-gray-400">
              Supervised by: <span className="text-indigo-400">Gulzar Alam</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LandingPage; 