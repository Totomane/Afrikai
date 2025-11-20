import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { LoginForm } from '../loginForm';
import { RegisterForm } from '../RegisterForm';
import { PasswordResetForm } from '../PasswordResetForm';

export type AuthView = 'login' | 'register' | 'reset';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: AuthView;
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialView = 'login' 
}) => {
  const [currentView, setCurrentView] = useState<AuthView>(initialView);

  const handleSuccess = () => {
    onClose();
  };

  const getTitle = () => {
    switch (currentView) {
      case 'login': return 'Welcome Back';
      case 'register': return 'Get Started';
      case 'reset': return 'Reset Password';
      default: return 'Authentication';
    }
  };

  const getSubtitle = () => {
    switch (currentView) {
      case 'login': return 'Sign in to access your dashboard';
      case 'register': return 'Create your account to begin exploring';
      case 'reset': return 'Enter your email to reset your password';
      default: return '';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>

              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {getTitle()}
                </h2>
                <p className="text-gray-600">
                  {getSubtitle()}
                </p>
              </div>

              {/* Tab switcher - only show for login/register */}
              {currentView !== 'reset' && (
                <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
                  <button
                    onClick={() => setCurrentView('login')}
                    className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                      currentView === 'login'
                        ? 'bg-white text-blue-600 shadow-md'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setCurrentView('register')}
                    className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                      currentView === 'register'
                        ? 'bg-white text-blue-600 shadow-md'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>
              )}

              <div className="space-y-4">
                {currentView === 'login' && (
                  <div>
                    <LoginForm onSuccess={handleSuccess} />
                    <div className="mt-4 text-center">
                      <button
                        onClick={() => setCurrentView('reset')}
                        className="text-sm text-blue-600 hover:text-blue-700 underline"
                      >
                        Forgot your password?
                      </button>
                    </div>
                  </div>
                )}
                
                {currentView === 'register' && (
                  <RegisterForm onSuccess={handleSuccess} />
                )}
                
                {currentView === 'reset' && (
                  <div>
                    <PasswordResetForm 
                      onSuccess={() => setCurrentView('login')}
                      onCancel={() => setCurrentView('login')}
                    />
                    <div className="mt-4 text-center">
                      <button
                        onClick={() => setCurrentView('login')}
                        className="text-sm text-gray-600 hover:text-gray-700"
                      >
                        ← Back to Sign In
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                <p className="text-xs text-gray-500">
                  By continuing, you agree to our{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-700 underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-700 underline">
                    Privacy Policy
                  </a>
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
