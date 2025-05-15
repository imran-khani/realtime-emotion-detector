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

const techStack = [
  {
    category: 'Frontend',
    technologies: ['React.js', 'Tailwind CSS', 'Material-UI', 'Framer Motion'],
    description: 'Modern UI framework with beautiful animations and responsive design'
  },
  {
    category: 'AI/ML',
    technologies: ['face-api.js','OpenAI'],
    description: 'Advanced emotion detection and natural language processing'
  },
  {
    category: 'Backend',
    technologies: ['Vite', 'Bun', 'Firebase', 'Node.js'],
    description: 'Fast development server with efficient data management'
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

      {/* Technology Stack Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Technology Stack
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {techStack.map((tech, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index, duration: 0.6 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
              >
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {tech.category}
                </h3>
                <div className="mb-4">
                  {tech.technologies.map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-block bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 px-3 py-1 rounded-full text-sm font-medium mr-2 mb-2"
                    >
                      {item}
                    </span>
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {tech.description}
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