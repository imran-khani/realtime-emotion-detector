import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UserIcon, 
  CogIcon, 
  BellIcon, 
  ShieldCheckIcon,
  ChartBarIcon,
  CameraIcon,
  ArrowPathIcon,
  CheckIcon 
} from '@heroicons/react/24/outline';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  
  // Load user data from localStorage
  const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem('userProfile');
    return saved ? JSON.parse(saved) : {
      name: '',
      email: '',
      avatar: null,
      preferences: {
        theme: 'system',
        notifications: true,
        dataCollection: true,
        emotionHistory: 7,
        analyticsFrequency: 'daily'
      }
    };
  });

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'preferences', name: 'Preferences', icon: CogIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'privacy', name: 'Privacy', icon: ShieldCheckIcon },
    { id: 'data', name: 'Data & Analytics', icon: ChartBarIcon },
  ];

  const handleSave = () => {
    localStorage.setItem('userProfile', JSON.stringify(userData));
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserData({ ...userData, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const clearEmotionHistory = () => {
    if (confirm('Are you sure you want to clear your emotion history? This action cannot be undone.')) {
      localStorage.removeItem('emotionHistory');
      alert('Emotion history cleared successfully!');
    }
  };

  const exportData = () => {
    const emotionHistory = localStorage.getItem('emotionHistory') || '[]';
    const data = {
      profile: userData,
      emotionHistory: JSON.parse(emotionHistory)
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emotisense-data-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Account Settings
          </h1>

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <tab.icon className="w-5 h-5 mr-2" />
                  {tab.name}
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                        {userData.avatar ? (
                          <img src={userData.avatar} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon className="w-12 h-12 text-gray-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                        )}
                      </div>
                      <label className="absolute bottom-0 right-0 p-1 bg-indigo-600 rounded-full cursor-pointer hover:bg-indigo-700 transition-colors">
                        <CameraIcon className="w-4 h-4 text-white" />
                        <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                      </label>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Profile Picture</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Upload a photo to personalize your profile</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                      <input
                        type="text"
                        value={userData.name}
                        onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                      <input
                        type="email"
                        value={userData.email}
                        onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Theme</label>
                    <select
                      value={userData.preferences.theme}
                      onChange={(e) => setUserData({
                        ...userData,
                        preferences: { ...userData.preferences, theme: e.target.value }
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                    >
                      <option value="system">System</option>
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Emotion History Retention</label>
                    <select
                      value={userData.preferences.emotionHistory}
                      onChange={(e) => setUserData({
                        ...userData,
                        preferences: { ...userData.preferences, emotionHistory: parseInt(e.target.value) }
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                    >
                      <option value={1}>1 day</option>
                      <option value={7}>7 days</option>
                      <option value={30}>30 days</option>
                      <option value={90}>90 days</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Analytics Update Frequency</label>
                    <select
                      value={userData.preferences.analyticsFrequency}
                      onChange={(e) => setUserData({
                        ...userData,
                        preferences: { ...userData.preferences, analyticsFrequency: e.target.value }
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                    >
                      <option value="realtime">Real-time</option>
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                    </select>
                  </div>
                </motion.div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-medium text-gray-900 dark:text-white">Enable Notifications</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Receive alerts about emotional patterns and insights</p>
                    </div>
                    <button
                      onClick={() => setUserData({
                        ...userData,
                        preferences: { ...userData.preferences, notifications: !userData.preferences.notifications }
                      })}
                      className={`${
                        userData.preferences.notifications ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                    >
                      <span
                        className={`${
                          userData.preferences.notifications ? 'translate-x-5' : 'translate-x-0'
                        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                      />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-medium text-gray-900 dark:text-white">Data Collection</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Allow EmotiSense to collect anonymized usage data</p>
                    </div>
                    <button
                      onClick={() => setUserData({
                        ...userData,
                        preferences: { ...userData.preferences, dataCollection: !userData.preferences.dataCollection }
                      })}
                      className={`${
                        userData.preferences.dataCollection ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                    >
                      <span
                        className={`${
                          userData.preferences.dataCollection ? 'translate-x-5' : 'translate-x-0'
                        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                      />
                    </button>
                  </div>

                  <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-base font-medium text-gray-900 dark:text-white mb-4">Privacy Information</h3>
                    <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                      <p>• All emotion detection is performed locally on your device</p>
                      <p>• Your facial data is never stored or transmitted</p>
                      <p>• Emotion history is stored locally in your browser</p>
                      <p>• You can export or delete your data at any time</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Data & Analytics Tab */}
              {activeTab === 'data' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-base font-medium text-gray-900 dark:text-white mb-4">Manage Your Data</h3>
                    <div className="space-y-4">
                      <button
                        onClick={exportData}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <ArrowPathIcon className="w-5 h-5 mr-2" />
                        Export All Data
                      </button>
                      
                      <button
                        onClick={clearEmotionHistory}
                        className="inline-flex items-center px-4 py-2 border border-red-300 dark:border-red-600 rounded-md shadow-sm text-sm font-medium text-red-700 dark:text-red-300 bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Clear Emotion History
                      </button>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-base font-medium text-gray-900 dark:text-white mb-4">Storage Information</h3>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <p>Data stored locally: {(JSON.stringify(localStorage).length / 1024).toFixed(2)} KB</p>
                      <p>Emotion history entries: {JSON.parse(localStorage.getItem('emotionHistory') || '[]').length}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Save Button */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Changes are saved automatically
                </p>
                <button
                  onClick={handleSave}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {showSaveSuccess ? (
                    <>
                      <CheckIcon className="w-5 h-5 mr-2" />
                      Saved
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Success Message */}
        <AnimatePresence>
          {showSaveSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg"
            >
              <div className="flex items-center">
                <CheckIcon className="w-5 h-5 mr-2" />
                Profile saved successfully!
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Profile;