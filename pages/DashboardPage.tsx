// src/pages/DashboardPage.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../components/context/authContext';
import { useToast } from '../components/ui/Toast';
import { OAuthManager } from '../components/OAuthManager';
import { 
  User, 
  Settings, 
  Bell, 
  Shield, 
  LogOut, 
  Mail, 
  CheckCircle,
  AlertTriangle,
  Loader2
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, logout, sendEmailVerification } = useAuth();
  const { showSuccess, showError } = useToast();
  const [sendingVerification, setSendingVerification] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'connections'>('profile');

  const handleLogout = async () => {
    try {
      await logout();
      showSuccess('Logged Out', 'You have been successfully logged out.');
    } catch (error) {
      showError('Error', 'Failed to log out. Please try again.');
    }
  };

  const handleSendVerification = async () => {
    setSendingVerification(true);
    try {
      const result = await sendEmailVerification();
      if (result.success) {
        showSuccess('Verification Email Sent!', 'Please check your inbox.');
      } else {
        showError('Failed to Send Email', result.message || 'Please try again later.');
      }
    } catch (error) {
      showError('Error', 'Failed to send verification email.');
    } finally {
      setSendingVerification(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'connections', label: 'Connections', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-gray-600"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.username}!</h2>
            <p className="text-blue-100">
              Manage your account settings and connected services from here.
            </p>
          </div>
        </motion.div>

        {/* Email Verification Alert */}
        {user?.email && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-yellow-900">Verify Your Email Address</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Please verify your email address to secure your account and enable all features.
                  </p>
                  <button
                    onClick={handleSendVerification}
                    disabled={sendingVerification}
                    className="mt-3 px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-md hover:bg-yellow-700 disabled:opacity-50"
                  >
                    {sendingVerification ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending...</span>
                      </div>
                    ) : (
                      'Send Verification Email'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm border p-4"
            >
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm border"
            >
              {activeTab === 'profile' && (
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h3>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Username
                        </label>
                        <div className="p-3 bg-gray-50 rounded-lg border">
                          <span className="text-gray-900">{user?.username}</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <div className="p-3 bg-gray-50 rounded-lg border flex items-center justify-between">
                          <span className="text-gray-900">{user?.email}</span>
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        User ID
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <span className="text-gray-600 font-mono text-sm">#{user?.id}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h3>
                  
                  <div className="space-y-6">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">Password</h4>
                          <p className="text-sm text-gray-600">Change your account password</p>
                        </div>
                        <button className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium">
                          Change Password
                        </button>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                          <p className="text-sm text-gray-600">Add an extra layer of security</p>
                        </div>
                        <button className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium">
                          Enable 2FA
                        </button>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">Active Sessions</h4>
                          <p className="text-sm text-gray-600">Manage your active login sessions</p>
                        </div>
                        <button className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium">
                          View Sessions
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'connections' && (
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Connected Accounts</h3>
                  <OAuthManager />
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};