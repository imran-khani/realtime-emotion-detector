import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserCircleIcon, EnvelopeIcon, KeyIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile, updatePassword, updateEmail, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const reauthenticate = async () => {
    if (!formData.currentPassword) throw new Error('Current password required');
    const credential = EmailAuthProvider.credential(user.email, formData.currentPassword);
    await reauthenticateWithCredential(user, credential);
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      // Update display name
      if (formData.displayName !== user?.displayName) {
        await updateProfile(user, {
          displayName: formData.displayName
        });
      }
      
      if (formData.email !== user?.email) {
        await reauthenticate();
        await updateEmail(user, formData.email);
      }
      
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error('New passwords do not match');
        }
        if (formData.newPassword.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        
        await reauthenticate();
        await updatePassword(user, formData.newPassword);
      }
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      displayName: user?.displayName || '',
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setMessage({ type: '', text: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
        >
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
                <p className="text-indigo-100 mt-1">Manage your account information</p>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          <div className="p-6">
            {message.text && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-6 p-4 rounded-lg ${
                  message.type === 'success' 
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                }`}
              >
                {message.text}
              </motion.div>
            )}

            <div className="flex items-center space-x-6 mb-8">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-700">
                <UserCircleIcon className="w-full h-full text-gray-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {user?.displayName || 'User'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Display Name
                </label>
                <div className="relative">
                  <UserCircleIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-500"
                    placeholder="Enter your display name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-500"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {isEditing && (
                <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">Change Password</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Current password is required for email or password changes
                  </p>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <KeyIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter current password"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      New Password (optional)
                    </label>
                    <div className="relative">
                      <KeyIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter new password (min 6 characters)"
                      />
                    </div>
                  </div>

                  {formData.newPassword && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <KeyIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {isEditing && (
              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  <XMarkIcon className="w-4 h-4 inline mr-2" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <CheckIcon className="w-4 h-4 mr-2" />
                  )}
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
