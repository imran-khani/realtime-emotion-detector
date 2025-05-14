import { motion } from 'framer-motion';
import { 
  ShieldCheckIcon, 
  LockClosedIcon, 
  EyeSlashIcon,
  DocumentTextIcon,
  ServerIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const PrivacyPolicy = () => {
  const sections = [
    {
      title: "Data Collection",
      icon: DocumentTextIcon,
      content: [
        {
          subtitle: "What We Collect",
          text: "EmotiSense collects emotion data through facial recognition. This includes detected emotions, confidence scores, and timestamps. We DO NOT store any actual facial images or biometric data."
        },
        {
          subtitle: "How We Collect",
          text: "All emotion detection happens locally in your browser. No video or image data is transmitted to our servers."
        },
        {
          subtitle: "What We Don't Collect",
          text: "We never collect or store: facial images, video recordings, biometric identifiers, or any personally identifiable facial features."
        }
      ]
    },
    {
      title: "Data Storage",
      icon: ServerIcon,
      content: [
        {
          subtitle: "Local Storage",
          text: "All emotion history and preferences are stored locally in your browser using localStorage. This data never leaves your device unless you explicitly export it."
        },
        {
          subtitle: "No Cloud Storage",
          text: "EmotiSense does not upload or store any of your emotional data on external servers."
        },
        {
          subtitle: "Data Retention",
          text: "Your emotion history is retained based on your preferences (1-90 days). You can clear all data at any time."
        }
      ]
    },
    {
      title: "Data Usage",
      icon: EyeSlashIcon,
      content: [
        {
          subtitle: "Analytics",
          text: "Your emotion data is used solely to provide you with personal insights and analytics. It is never used for marketing or advertising purposes."
        },
        {
          subtitle: "No Third-Party Sharing",
          text: "We never sell, rent, or share your emotional data with third parties."
        },
        {
          subtitle: "Research",
          text: "If you opt-in, anonymized aggregate data may be used for research purposes to improve emotion detection accuracy."
        }
      ]
    },
    {
      title: "Your Rights",
      icon: UserGroupIcon,
      content: [
        {
          subtitle: "Access",
          text: "You can access all your emotion data through the Dashboard and export it at any time."
        },
        {
          subtitle: "Deletion",
          text: "You have the right to delete all your emotion history and personal data at any time through the app settings."
        },
        {
          subtitle: "Control",
          text: "You maintain full control over data collection - you can start or stop emotion detection at any time."
        }
      ]
    },
    {
      title: "Security",
      icon: LockClosedIcon,
      content: [
        {
          subtitle: "Encryption",
          text: "All data stored in your browser is encrypted using modern web standards."
        },
        {
          subtitle: "No Transmission",
          text: "Since emotion detection happens locally, there's no risk of data interception during transmission."
        },
        {
          subtitle: "Browser Security",
          text: "Your data security depends on your browser's security. We recommend keeping your browser updated."
        }
      ]
    },
    {
      title: "Updates",
      icon: ShieldCheckIcon,
      content: [
        {
          subtitle: "Policy Changes",
          text: "We may update this privacy policy from time to time. Significant changes will be announced in the app."
        },
        {
          subtitle: "Notification",
          text: "You will be notified of any material changes to how we handle your data."
        },
        {
          subtitle: "Last Updated",
          text: "This privacy policy was last updated on January 1, 2024."
        }
      ]
    }
  ];

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
            <ShieldCheckIcon className="w-16 h-16 mx-auto text-indigo-600 dark:text-indigo-400 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Privacy Policy
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Your privacy is our priority. Learn how EmotiSense protects your emotional data.
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

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-12 p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Questions About Privacy?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              If you have any questions about this privacy policy or how we handle your data, 
              please don't hesitate to contact us.
            </p>
            <a
              href="mailto:privacy@emotisense.com"
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              privacy@emotisense.com
            </a>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;