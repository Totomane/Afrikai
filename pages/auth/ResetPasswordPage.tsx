// src/pages/auth/ResetPasswordPage.tsx
import React, { useState, useEffect } from 'react';
import { AuthForm } from '../../components/auth/AuthForm';
import { useAuth } from '../../components/context/authContext';
import { useToast } from '../../components/ui/Toast';
import { authValidationRules } from '../../utils/validation';
import { formatBackendErrors, checkPasswordStrength } from '../../utils/auth';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowLeft, AlertTriangle } from 'lucide-react';

// Navigation helper
const navigate = (path: string) => {
  if (path.startsWith('/')) {
    window.location.href = path;
  } else {
    (window as any).navigate?.(path);
  }
};

const Link: React.FC<{ to: string; className?: string; children: React.ReactNode }> = ({ to, className, children }) => {
  return (
    <button
      onClick={() => navigate(to)}
      className={className}
      type="button"
    >
      {children}
    </button>
  );
};

export const ResetPasswordPage: React.FC = () => {
  const { confirmResetPassword } = useAuth();
  const { showError, showSuccess } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [resetSuccess, setResetSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: [] as string[] });

  // Get token from URL path
  const getTokenFromUrl = () => {
    const path = window.location.pathname;
    const segments = path.split('/');
    return segments[segments.length - 1]; // Assuming token is the last segment
  };

  const token = getTokenFromUrl();

  useEffect(() => {
    if (!token) {
      showError('Invalid Link', 'This password reset link is invalid or has expired.');
      navigate('/forgot-password');
    }
  }, [token, showError]);

  const handleSubmit = async (formData: Record<string, string>) => {
    if (!token) return;

    setIsLoading(true);
    setErrors({});

    try {
      const result = await confirmResetPassword(token, formData.password);
      
      if (result.success) {
        setResetSuccess(true);
        showSuccess('Password Reset!', 'Your password has been successfully updated.');
        
        // Redirect to login after a short delay
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        if (result.message?.includes('token') || result.message?.includes('expired')) {
          setErrors({ general: 'This reset link has expired or is invalid. Please request a new one.' });
        } else if (result.message?.includes('password')) {
          setErrors({ password: result.message });
        } else {
          setErrors({ general: result.message || 'Failed to reset password. Please try again.' });
        }
        showError('Reset Failed', result.message || 'Please try again or request a new reset link.');
      }
    } catch (error) {
      const errorMessage = 'An unexpected error occurred. Please try again.';
      setErrors({ general: errorMessage });
      showError('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = (password: string) => {
    if (password) {
      setPasswordStrength(checkPasswordStrength(password));
    } else {
      setPasswordStrength({ score: 0, feedback: [] });
    }
  };

  const formFields = [
    {
      name: 'password',
      type: 'password' as const,
      label: 'New Password',
      placeholder: 'Enter your new password',
      autoComplete: 'new-password',
      required: true,
      validation: authValidationRules.password
    },
    {
      name: 'confirmPassword',
      type: 'password' as const,
      label: 'Confirm New Password',
      placeholder: 'Confirm your new password',
      autoComplete: 'new-password',
      required: true,
      validation: authValidationRules.confirmPassword
    }
  ];

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 py-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Reset Link</h1>
            <p className="text-gray-600 mb-6">
              This password reset link is invalid or has expired.
            </p>
            
            <div className="space-y-3">
              <Link
                to="/forgot-password"
                className="w-full inline-flex justify-center py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Request New Reset Link
              </Link>
              
              <Link
                to="/login"
                className="w-full inline-flex items-center justify-center space-x-2 py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (resetSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 py-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Password Reset Complete!</h1>
            
            <div className="space-y-4 text-left">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  Your password has been successfully updated. You can now sign in with your new password.
                </p>
              </div>
            </div>
            
            <div className="mt-6">
              <Link
                to="/login"
                className="w-full inline-flex items-center justify-center space-x-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                <span>Continue to Sign In</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="w-full max-w-md">
        <AuthForm
          title="Set New Password"
          subtitle="Choose a strong password for your account"
          fields={formFields}
          submitText="Update Password"
          isLoading={isLoading}
          errors={errors}
          onSubmit={handleSubmit}
        >
          <div className="mt-6">
            <Link
              to="/login"
              className="w-full flex items-center justify-center space-x-2 py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </AuthForm>

        {/* Password Strength Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6 p-4 bg-gray-50 rounded-lg"
        >
          <h4 className="text-sm font-medium text-gray-900 mb-3">Password Strength</h4>
          
          {/* Strength Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                passwordStrength.score === 0 ? 'w-0 bg-gray-300' :
                passwordStrength.score === 1 ? 'w-1/5 bg-red-500' :
                passwordStrength.score === 2 ? 'w-2/5 bg-orange-500' :
                passwordStrength.score === 3 ? 'w-3/5 bg-yellow-500' :
                passwordStrength.score === 4 ? 'w-4/5 bg-green-500' :
                'w-full bg-green-600'
              }`}
            />
          </div>
          
          {/* Strength Label */}
          <p className={`text-xs font-medium mb-2 ${
            passwordStrength.score === 0 ? 'text-gray-500' :
            passwordStrength.score === 1 ? 'text-red-600' :
            passwordStrength.score === 2 ? 'text-orange-600' :
            passwordStrength.score === 3 ? 'text-yellow-600' :
            passwordStrength.score === 4 ? 'text-green-600' :
            'text-green-700'
          }`}>
            {passwordStrength.score === 0 ? 'Enter a password' :
             passwordStrength.score === 1 ? 'Very Weak' :
             passwordStrength.score === 2 ? 'Weak' :
             passwordStrength.score === 3 ? 'Good' :
             passwordStrength.score === 4 ? 'Strong' :
             'Very Strong'}
          </p>
          
          {/* Feedback */}
          {passwordStrength.feedback.length > 0 && (
            <ul className="text-xs text-gray-600 space-y-1">
              {passwordStrength.feedback.map((feedback, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  <span>{feedback}</span>
                </li>
              ))}
            </ul>
          )}
        </motion.div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <p className="text-xs text-blue-700">
            <strong>Security Tip:</strong> Use a unique password that you don't use on other sites. 
            Consider using a password manager to generate and store strong passwords.
          </p>
        </motion.div>
      </div>
    </div>
  );
};