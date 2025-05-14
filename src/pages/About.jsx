import { motion } from 'framer-motion';
import { 
  FaceSmileIcon, 
  HeartIcon, 
  ChartBarIcon, 
  ShieldCheckIcon,
  AcademicCapIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const features = [
  {
    icon: FaceSmileIcon,
    title: 'Real-time Emotion Detection',
    description: 'Advanced facial recognition technology identifies emotions instantly using your webcam.'
  },
  {
    icon: ChartBarIcon,
    title: 'Comprehensive Analytics',
    description: 'Track your emotional patterns over time with detailed charts and insights.'
  },
  {
    icon: HeartIcon,
    title: 'Personalized Support',
    description: 'Get tailored recommendations and activities based on your emotional state.'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Privacy-First Design',
    description: 'All emotion detection happens locally on your device. Your data stays private.'
  },
  {
    icon: AcademicCapIcon,
    title: 'Scientific Foundation',
    description: 'Built on established psychological research and emotion recognition models.'
  },
  {
    icon: SparklesIcon,
    title: 'AI-Powered Insights',
    description: 'Intelligent analysis helps you understand and manage your emotions better.'
  }
];

const teamMembers = [
  {
    name: 'Sarah Johnson',
    role: 'Lead Developer',
    description: 'Expert in AI and emotion recognition systems',
    image: '/api/placeholder/150/150'
  },
  {
    name: 'Dr. Michael Chen',
    role: 'Psychology Advisor',
    description: 'Clinical psychologist specializing in emotional intelligence',
    image: '/api/placeholder/150/150'
  },
  {
    name: 'Emily Rodriguez',
    role: 'UX Designer',
    description: 'Creating intuitive experiences for emotional wellness',
    image: '/api/placeholder/150/150'
  }
];

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-900/20 dark:to-purple-900/20" />
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
              About <span className="text-indigo-600 dark:text-indigo-400">EmotiSense</span>
            </h1>
            <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-600 dark:text-gray-300">
              EmotiSense is your personal emotional intelligence companion, designed to help you 
              understand, track, and improve your emotional well-being through advanced AI technology.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12"
        >
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            Our Mission
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 text-center max-w-4xl mx-auto">
            We believe that emotional intelligence is the key to personal growth and well-being. 
            Our mission is to make emotional awareness accessible to everyone through innovative 
            technology, helping people build better relationships, make better decisions, and 
            lead more fulfilling lives.
          </p>
        </motion.div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.6 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                    <feature.icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="ml-3 text-lg font-semibold text-gray-900 dark:text-white">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Team Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Meet Our Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index, duration: 0.6 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 bg-gray-200 dark:bg-gray-700"
                />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                  {member.name}
                </h3>
                <p className="text-indigo-600 dark:text-indigo-400 mb-3">
                  {member.role}
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {member.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 md:p-12 text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Emotional Intelligence Journey?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join thousands of users who are already improving their emotional well-being with EmotiSense.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-8 py-3 bg-white text-indigo-600 font-semibold rounded-lg shadow-lg hover:bg-gray-100 transition-colors duration-200"
          >
            Get Started Now
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default About;