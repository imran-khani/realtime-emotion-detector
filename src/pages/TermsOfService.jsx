import { motion } from 'framer-motion';
import { 
  DocumentTextIcon,
  ScaleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UserIcon,
  NoSymbolIcon
} from '@heroicons/react/24/outline';

const TermsOfService = () => {
  const sections = [
    {
      title: "Acceptance of Terms",
      icon: CheckCircleIcon,
      content: [
        {
          subtitle: "Agreement",
          text: "By using EmotiSense, you agree to these Terms of Service. If you don't agree, please don't use our service."
        },
        {
          subtitle: "Updates",
          text: "We may update these terms from time to time. Continued use after changes means you accept the new terms."
        },
        {
          subtitle: "Age Requirement",
          text: "You must be at least 13 years old to use EmotiSense. Users under 18 should have parental consent."
        }
      ]
    },
    {
      title: "Use of Service",
      icon: UserIcon,
      content: [
        {
          subtitle: "Personal Use",
          text: "EmotiSense is designed for personal emotional wellness. Use it responsibly and for its intended purpose."
        },
        {
          subtitle: "Account Security",
          text: "You're responsible for maintaining the security of your device and browser where your data is stored."
        },
        {
          subtitle: "Accurate Information",
          text: "Please provide accurate information when using the service for the best emotional insights."
        }
      ]
    },
    {
      title: "Prohibited Uses",
      icon: NoSymbolIcon,
      content: [
        {
          subtitle: "Misuse",
          text: "Don't use EmotiSense to harm, harass, or violate the privacy of others."
        },
        {
          subtitle: "Illegal Activities",
          text: "Don't use the service for any illegal purposes or to violate any laws."
        },
        {
          subtitle: "Reverse Engineering",
          text: "Don't attempt to reverse engineer, modify, or create derivative works of the service."
        }
      ]
    },
    {
      title: "Medical Disclaimer",
      icon: ExclamationTriangleIcon,
      content: [
        {
          subtitle: "Not Medical Advice",
          text: "EmotiSense is NOT a medical device and should not be used for medical diagnosis or treatment."
        },
        {
          subtitle: "Professional Help",
          text: "If you're experiencing mental health issues, please consult with a qualified healthcare professional."
        },
        {
          subtitle: "Emergency Situations",
          text: "In case of emergency or if you're having thoughts of self-harm, contact emergency services immediately."
        }
      ]
    },
    {
      title: "Intellectual Property",
      icon: DocumentTextIcon,
      content: [
        {
          subtitle: "Ownership",
          text: "EmotiSense and its original content, features, and functionality are owned by us and are protected by copyright laws."
        },
        {
          subtitle: "Your Content",
          text: "You retain ownership of your emotion data. We don't claim any rights to your personal information."
        },
        {
          subtitle: "Feedback",
          text: "Any feedback you provide may be used to improve the service without compensation to you."
        }
      ]
    },
    {
      title: "Limitation of Liability",
      icon: ScaleIcon,
      content: [
        {
          subtitle: "As-Is Service",
          text: "EmotiSense is provided 'as is' without warranties of any kind, express or implied."
        },
        {
          subtitle: "No Liability",
          text: "We're not liable for any damages arising from your use of the service."
        },
        {
          subtitle: "Indemnification",
          text: "You agree to indemnify us from any claims arising from your use of EmotiSense."
        }
      ]
    }
  ];

  const lastUpdated = "January 1, 2024";

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <ScaleIcon className="w-16 h-16 mx-auto text-indigo-600 dark:text-indigo-400 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Terms of Service
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Please read these terms carefully before using EmotiSense.
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
              Last updated: {lastUpdated}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8"
        >
          <div className="space-y-12">
            {sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.6 }}
              >
                <div className="flex items-center mb-4">
                  <section.icon className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mr-3" />
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {section.title}
                  </h2>
                </div>
                
                <div className="space-y-6 ml-11">
                  {section.content.map((item, itemIndex) => (
                    <div key={itemIndex}>
                      <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                        {item.subtitle}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Important Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-12 p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
          >
            <div className="flex items-start">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
                  Important Medical Notice
                </h3>
                <p className="text-red-700 dark:text-red-400">
                  EmotiSense is not a substitute for professional medical advice, diagnosis, or treatment. 
                  Always seek the advice of your physician or qualified mental health provider with any 
                  questions you may have regarding a medical condition.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-8 p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Questions About Our Terms?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              If you have questions about these terms, please contact our legal team.
            </p>
            <a
              href="mailto:legal@emotisense.com"
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              legal@emotisense.com
            </a>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsOfService;