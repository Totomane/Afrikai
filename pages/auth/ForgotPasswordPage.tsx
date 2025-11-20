// src/pages/auth/ForgotPasswordPage.tsx
import React, { useState } from 'react';
import { AuthForm } from '../../components/auth/AuthForm';
import { useAuth } from '../../components/context/authContext';
import { useToast } from '../../components/ui/Toast';
import { authValidationRules } from '../../utils/validation';
import { formatBackendErrors } from '../../utils/auth';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

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

export const ForgotPasswordPage: React.FC = () => {
  const { resetPassword } = useAuth();
  const { showError, showSuccess } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [emailSent, setEmailSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const handleSubmit = async (formData: Record<string, string>) => {
    setIsLoading(true);
    setErrors({});

    try {
      const result = await resetPassword(formData.email);
      
      if (result.success) {
        setSubmittedEmail(formData.email);
        setEmailSent(true);
        showSuccess('Reset Email Sent!', 'Please check your inbox for password reset instructions.');
      } else {
        if (result.message?.includes('not found') || result.message?.includes('does not exist')) {
          setErrors({ email: 'No account found with this email address.' });
        } else {
          setErrors({ general: result.message || 'Failed to send reset email. Please try again.' });
        }
        showError('Reset Failed', result.message || 'Please check your email and try again.');
      }
    } catch (error) {
      const errorMessage = 'An unexpected error occurred. Please try again.';
      setErrors({ general: errorMessage });
      showError('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  const handleResendEmail = async () => {
    if (submittedEmail) {
      await handleSubmit({ email: submittedEmail });
    }
  };

  const formFields = [
    {
      name: 'email',
      type: 'email' as const,
      label: 'Email Address',
      placeholder: 'Enter your email address',
      autoComplete: 'email',
      required: true,
      validation: authValidationRules.email
    }
  ];

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50 py-12 px-4">
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
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Check Your Email</h1>
            
            <div className="space-y-4 text-left">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-800">
                      We've sent password reset instructions to:
                    </p>
                    <p className="text-sm font-medium text-blue-900 mt-1">
                      {submittedEmail}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-gray-600 space-y-2">
                <p>Please check your inbox and click the reset link to continue.</p>
                <p>If you don't see the email, check your spam folder.</p>
              </div>
            </div>
            
            <div className="mt-8 space-y-3">
              <button
                onClick={handleResendEmail}
                disabled={isLoading}
                className="w-full py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Sending...' : 'Resend Email'}
              </button>
              
              <button
                onClick={handleBackToLogin}
                className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Sign In</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50 py-12 px-4">
      <div className="w-full max-w-md">
        <AuthForm
          title="Reset Password"
          subtitle="Enter your email address and we'll send you a link to reset your password"
          fields={formFields}
          submitText="Send Reset Link"
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

        {/* Help Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6 p-4 bg-gray-50 rounded-lg"
        >
          <h4 className="text-sm font-medium text-gray-900 mb-2">What happens next?</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• We'll send a reset link to your email address</li>
            <li>• Click the link to create a new password</li>
            <li>• The link expires in 24 hours for security</li>
            <li>• Check your spam folder if you don't see the email</li>
          </ul>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-gray-600">
            Remember your password?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in here
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};