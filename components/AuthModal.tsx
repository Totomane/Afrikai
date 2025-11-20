// src/components/AuthModal.tsx
import React, { useState } from 'react';
import { LoginForm } from './loginForm';
import { RegisterForm } from './RegisterForm';
import { PasswordResetForm } from './PasswordResetForm';

export type AuthModalView = 'login' | 'register' | 'reset';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: AuthModalView;
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialView = 'login' 
}) => {
  const [currentView, setCurrentView] = useState<AuthModalView>(initialView);

  if (!isOpen) return null;

  const handleSuccess = () => {
    onClose();
  };

  const handleViewChange = (view: AuthModalView) => {
    setCurrentView(view);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="relative max-w-md w-full mx-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 bg-gray-700 hover:bg-gray-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg z-10"
        >
          ×
        </button>

        {/* Form content */}
        {currentView === 'login' && (
          <div>
            <LoginForm onSuccess={handleSuccess} />
            <div className="mt-3 text-center space-y-2">
              <button
                onClick={() => handleViewChange('register')}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                Don't have an account? Sign up
              </button>
              <br />
              <button
                onClick={() => handleViewChange('reset')}
                className="text-gray-400 hover:text-gray-300 text-sm"
              >
                Forgot your password?
              </button>
            </div>
          </div>
        )}

        {currentView === 'register' && (
          <div>
            <RegisterForm onSuccess={handleSuccess} />
            <div className="mt-3 text-center">
              <button
                onClick={() => handleViewChange('login')}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                Already have an account? Sign in
              </button>
            </div>
          </div>
        )}

        {currentView === 'reset' && (
          <PasswordResetForm 
            onSuccess={() => handleViewChange('login')}
            onCancel={() => handleViewChange('login')}
          />
        )}
      </div>
    </div>
  );
};