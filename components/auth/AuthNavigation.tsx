// src/components/auth/AuthNavigation.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Home } from 'lucide-react';

interface AuthNavigationProps {
  showBackButton?: boolean;
  showHomeButton?: boolean;
  onBack?: () => void;
  onHome?: () => void;
}

export const AuthNavigation: React.FC<AuthNavigationProps> = ({
  showBackButton = false,
  showHomeButton = true,
  onBack,
  onHome
}) => {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  const handleHome = () => {
    if (onHome) {
      onHome();
    } else {
      window.location.href = '/';
    }
  };

  if (!showBackButton && !showHomeButton) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-6 left-6 z-10"
    >
      <div className="flex space-x-2">
        {showBackButton && (
          <button
            onClick={handleBack}
            className="p-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg shadow-sm hover:bg-white hover:shadow-md transition-all duration-200"
            title="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
        )}
        
        {showHomeButton && (
          <button
            onClick={handleHome}
            className="p-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg shadow-sm hover:bg-white hover:shadow-md transition-all duration-200"
            title="Go to home"
          >
            <Home className="w-5 h-5 text-gray-600" />
          </button>
        )}
      </div>
    </motion.div>
  );
};