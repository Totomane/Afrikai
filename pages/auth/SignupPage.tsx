// src/pages/auth/SignupPage.tsx
import React, { useState, useEffect } from 'react';
import { AuthForm } from '../../components/auth/AuthForm';
import { useAuth } from '../../components/context/authContext';
import { useToast } from '../../components/ui/Toast';
import { authValidationRules } from '../../utils/validation';
import { formatBackendErrors, sanitizeRedirectUrl, checkPasswordStrength } from '../../utils/auth';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface SignupPageProps {
  onSuccess?: () => void; // Callback for successful signup
}

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

export const SignupPage: React.FC<SignupPageProps> = ({ onSuccess }) => {
  const { register, user, loading, sendEmailVerification } = useAuth();
  const { showError, showSuccess, showInfo } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showEmailVerificationPrompt, setShowEmailVerificationPrompt] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);

  // Get redirect parameter from URL
  const getRedirectParam = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('redirect') || '/dashboard';
  };

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      const redirectTo = getRedirectParam();
      navigate(sanitizeRedirectUrl(redirectTo));
    }
  }, [user, loading]);

  const handleSubmit = async (formData: Record<string, string>) => {
    setIsLoading(true);
    setErrors({});

    try {
      const result = await register(formData.username, formData.email, formData.password);
      
      if (result.success) {
        showSuccess('Account Created!', 'Welcome! Your account has been created successfully.');
        
        // Show email verification prompt
        setShowEmailVerificationPrompt(true);
        
        // Call success callback if provided (for modal usage)
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 2000); // Small delay to show success message
        } else {
          // Redirect to dashboard after a short delay only if not used as modal
          setTimeout(() => {
            const redirectTo = getRedirectParam();
            navigate(sanitizeRedirectUrl(redirectTo));
          }, 3000);
        }
      } else {
        // Format and display backend errors
        if (typeof result.message === 'object') {
          setErrors(formatBackendErrors(result.message));
        } else {
          setErrors({ general: result.message || 'Registration failed. Please try again.' });
        }
        showError('Registration Failed', 'Please check the form and try again.');
      }
    } catch (error) {
      const errorMessage = 'An unexpected error occurred. Please try again.';
      setErrors({ general: errorMessage });
      showError('Registration Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendVerification = async () => {
    setSendingVerification(true);
    try {
      const result = await sendEmailVerification();
      if (result.success) {
        showSuccess('Verification Email Sent!', 'Please check your inbox and follow the instructions.');
        setShowEmailVerificationPrompt(false);
      } else {
        showError('Failed to Send Email', result.message || 'Please try again later.');
      }
    } catch (error) {
      showError('Error', 'Failed to send verification email.');
    } finally {
      setSendingVerification(false);
    }
  };

  const formFields = [
    {
      name: 'username',
      type: 'text' as const,
      label: 'Username',
      placeholder: 'Choose a username',
      autoComplete: 'username',
      required: true,
      validation: authValidationRules.username
    },
    {
      name: 'email',
      type: 'email' as const,
      label: 'Email Address',
      placeholder: 'Enter your email address',
      autoComplete: 'email',
      required: true,
      validation: authValidationRules.email
    },
    {
      name: 'password',
      type: 'password' as const,
      label: 'Password',
      placeholder: 'Create a strong password',
      autoComplete: 'new-password',
      required: true,
      validation: authValidationRules.password
    },
    {
      name: 'confirmPassword',
      type: 'password' as const,
      label: 'Confirm Password',
      placeholder: 'Confirm your password',
      autoComplete: 'new-password',
      required: true,
      validation: authValidationRules.confirmPassword
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 py-12 px-4">
      <div className="w-full max-w-md">
        {/* Email Verification Prompt */}
        {showEmailVerificationPrompt && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
          >
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-blue-900">Verify Your Email</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Please verify your email address to secure your account and enable all features.
                </p>
                <button
                  onClick={handleSendVerification}
                  disabled={sendingVerification}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {sendingVerification ? 'Sending...' : 'Send Verification Email'}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        <AuthForm
          title="Create Account"
          subtitle="Join us today and start your journey"
          fields={formFields}
          submitText="Create Account"
          isLoading={isLoading}
          errors={errors}
          onSubmit={handleSubmit}
        >
          <div className="mt-6 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Already have an account?</span>
              </div>
            </div>
            
            <div className="text-center">
              <Link
                to={`/login${getRedirectParam() !== '/dashboard' ? `?redirect=${getRedirectParam()}` : ''}`}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Sign in to existing account
              </Link>
            </div>
          </div>
        </AuthForm>

        {/* Password Requirements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6 p-4 bg-gray-50 rounded-lg"
        >
          <h4 className="text-sm font-medium text-gray-900 mb-2">Password Requirements:</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li className="flex items-center space-x-2">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>At least 8 characters long</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>Include uppercase and lowercase letters</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>Include at least one number</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>Include at least one special character</span>
            </li>
          </ul>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center text-xs text-gray-500"
        >
          By creating an account, you agree to our{' '}
          <Link to="/terms" className="text-blue-600 hover:text-blue-700">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="text-blue-600 hover:text-blue-700">
            Privacy Policy
          </Link>
        </motion.div>
      </div>
    </div>
  );
};