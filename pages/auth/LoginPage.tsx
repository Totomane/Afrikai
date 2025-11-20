// src/pages/auth/LoginPage.tsx
import React, { useState, useEffect } from 'react';
import { AuthForm } from '../../components/auth/AuthForm';
import { useAuth } from '../../components/context/authContext';
import { useToast } from '../../components/ui/Toast';
import { authValidationRules } from '../../utils/validation';
import { formatBackendErrors, sanitizeRedirectUrl } from '../../utils/auth';
import { motion } from 'framer-motion';

interface LoginPageProps {
  onSuccess?: () => void; // Callback for successful login
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

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const { login, user, loading } = useAuth();
  const { showError, showSuccess } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate('dashboard');
    }
  }, [user, loading]);

  const handleSubmit = async (formData: Record<string, string>) => {
    setIsLoading(true);
    setErrors({});

    try {
      const result = await login(formData.username, formData.password);
      
      if (result.success) {
        showSuccess('Welcome back!', 'You have been successfully logged in.');
        
        // Call success callback if provided (for modal usage)
        if (onSuccess) {
          onSuccess();
        } else {
          // Redirect to dashboard only if not used as modal
          navigate('dashboard');
        }
      } else {
        // Handle specific error cases
        if (result.message?.includes('credentials')) {
          setErrors({ general: 'Invalid username or password. Please try again.' });
        } else if (result.message?.includes('email')) {
          setErrors({ general: 'Please verify your email address before logging in.' });
        } else {
          setErrors({ general: result.message || 'Login failed. Please try again.' });
        }
        showError('Login Failed', result.message || 'Please check your credentials and try again.');
      }
    } catch (error) {
      const errorMessage = 'An unexpected error occurred. Please try again.';
      setErrors({ general: errorMessage });
      showError('Login Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formFields = [
    {
      name: 'username',
      type: 'text' as const,
      label: 'Username or Email',
      placeholder: 'Enter your username or email',
      autoComplete: 'username',
      required: true,
      validation: { required: true, message: 'Please enter your username or email' }
    },
    {
      name: 'password',
      type: 'password' as const,
      label: 'Password',
      placeholder: 'Enter your password',
      autoComplete: 'current-password',
      required: true,
      validation: { required: true, message: 'Please enter your password' }
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-12 px-4">
      <div className="w-full max-w-md">
        <AuthForm
          title="Welcome Back"
          subtitle="Sign in to your account to continue"
          fields={formFields}
          submitText="Sign In"
          isLoading={isLoading}
          errors={errors}
          onSubmit={handleSubmit}
        >
          <div className="mt-6 space-y-4">
            <div className="text-center">
              <Link
                to="forgot-password"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Forgot your password?
              </Link>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Don't have an account?</span>
              </div>
            </div>
            
            <div className="text-center">
              <Link
                to="signup"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Create new account
              </Link>
            </div>
          </div>
        </AuthForm>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center text-xs text-gray-500"
        >
          By signing in, you agree to our{' '}
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