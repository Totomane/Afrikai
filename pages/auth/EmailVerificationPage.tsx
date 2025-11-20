// src/pages/auth/EmailVerificationPage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../components/context/authContext';
import { useToast } from '../../components/ui/Toast';
import { verifyEmail } from '../../services/authService';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Mail, ArrowLeft, Loader2 } from 'lucide-react';

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

export const EmailVerificationPage: React.FC = () => {
  const { user, sendEmailVerification } = useAuth();
  const { showError, showSuccess, showInfo } = useToast();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | 'already-verified'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [isResending, setIsResending] = useState(false);

  // Get token from URL path
  const getTokenFromUrl = () => {
    const path = window.location.pathname;
    const segments = path.split('/');
    return segments[segments.length - 1]; // Assuming token is the last segment
  };

  const token = getTokenFromUrl();

  useEffect(() => {
    const performVerification = async () => {
      if (!token) {
        setVerificationStatus('error');
        setErrorMessage('Invalid verification link. The token is missing.');
        return;
      }

      try {
        const result = await verifyEmail(token);
        
        if (result.success) {
          setVerificationStatus('success');
          showSuccess('Email Verified!', 'Your email address has been successfully verified.');
          
          // Redirect to dashboard after a delay if user is logged in
          if (user) {
            setTimeout(() => {
              navigate('/dashboard');
            }, 3000);
          }
        } else {
          if (result.message?.includes('already verified') || result.message?.includes('already confirmed')) {
            setVerificationStatus('already-verified');
          } else if (result.message?.includes('expired') || result.message?.includes('invalid')) {
            setVerificationStatus('error');
            setErrorMessage('This verification link has expired or is invalid. Please request a new one.');
          } else {
            setVerificationStatus('error');
            setErrorMessage(result.message || 'Email verification failed. Please try again.');
          }
        }
      } catch (error) {
        setVerificationStatus('error');
        setErrorMessage('An unexpected error occurred during verification.');
        showError('Verification Error', 'Failed to verify email address.');
      }
    };

    performVerification();
  }, [token, user, showSuccess, showError]);

  const handleResendVerification = async () => {
    if (!user) {
      showInfo('Sign In Required', 'Please sign in to resend the verification email.');
      navigate('/login');
      return;
    }

    setIsResending(true);
    try {
      const result = await sendEmailVerification();
      if (result.success) {
        showSuccess('Verification Email Sent!', 'Please check your inbox for the new verification link.');
      } else {
        showError('Failed to Send Email', result.message || 'Please try again later.');
      }
    } catch (error) {
      showError('Error', 'Failed to send verification email.');
    } finally {
      setIsResending(false);
    }
  };

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'loading':
        return <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />;
      case 'success':
      case 'already-verified':
        return <CheckCircle className="w-8 h-8 text-green-600" />;
      case 'error':
        return <XCircle className="w-8 h-8 text-red-600" />;
    }
  };

  const getStatusColor = () => {
    switch (verificationStatus) {
      case 'loading':
        return 'from-blue-50 via-white to-indigo-50';
      case 'success':
      case 'already-verified':
        return 'from-green-50 via-white to-emerald-50';
      case 'error':
        return 'from-red-50 via-white to-pink-50';
    }
  };

  const getTitle = () => {
    switch (verificationStatus) {
      case 'loading':
        return 'Verifying Your Email...';
      case 'success':
        return 'Email Verified Successfully!';
      case 'already-verified':
        return 'Email Already Verified';
      case 'error':
        return 'Verification Failed';
    }
  };

  const getMessage = () => {
    switch (verificationStatus) {
      case 'loading':
        return 'Please wait while we verify your email address.';
      case 'success':
        return 'Your email address has been successfully verified. You now have access to all account features.';
      case 'already-verified':
        return 'Your email address was already verified. You have access to all account features.';
      case 'error':
        return errorMessage || 'We couldn\'t verify your email address. The link may be expired or invalid.';
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${getStatusColor()} py-12 px-4`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-current">
            {getStatusIcon()}
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{getTitle()}</h1>
          
          <div className="space-y-4 text-left">
            <div className={`border rounded-lg p-4 ${
              verificationStatus === 'success' || verificationStatus === 'already-verified'
                ? 'bg-green-50 border-green-200'
                : verificationStatus === 'error'
                ? 'bg-red-50 border-red-200'
                : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-start space-x-3">
                <Mail className={`w-5 h-5 mt-0.5 ${
                  verificationStatus === 'success' || verificationStatus === 'already-verified'
                    ? 'text-green-600'
                    : verificationStatus === 'error'
                    ? 'text-red-600'
                    : 'text-blue-600'
                }`} />
                <p className={`text-sm ${
                  verificationStatus === 'success' || verificationStatus === 'already-verified'
                    ? 'text-green-800'
                    : verificationStatus === 'error'
                    ? 'text-red-800'
                    : 'text-blue-800'
                }`}>
                  {getMessage()}
                </p>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="mt-8 space-y-3">
            {verificationStatus === 'success' || verificationStatus === 'already-verified' ? (
              <>
                {user && (
                  <Link
                    to="/dashboard"
                    className="w-full inline-flex justify-center py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Go to Dashboard
                  </Link>
                )}
                
                {!user && (
                  <Link
                    to="/login"
                    className="w-full inline-flex justify-center py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Sign In to Your Account
                  </Link>
                )}
              </>
            ) : verificationStatus === 'error' ? (
              <>
                {user && (
                  <button
                    onClick={handleResendVerification}
                    disabled={isResending}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
                  >
                    {isResending ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending...</span>
                      </div>
                    ) : (
                      'Send New Verification Email'
                    )}
                  </button>
                )}
                
                {!user && (
                  <Link
                    to="/login"
                    className="w-full inline-flex justify-center py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Sign In to Resend Email
                  </Link>
                )}
              </>
            ) : (
              <div className="w-full py-3 px-4 bg-gray-100 text-gray-500 font-medium rounded-lg">
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </div>
              </div>
            )}
            
            {/* Back to Home Link */}
            <Link
              to="/"
              className="w-full flex items-center justify-center space-x-2 py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>

        {/* Additional Information */}
        {verificationStatus === 'error' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 p-4 bg-gray-50 rounded-lg"
          >
            <h4 className="text-sm font-medium text-gray-900 mb-2">Need Help?</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Verification links expire after 24 hours</li>
              <li>• Make sure you're using the latest email we sent</li>
              <li>• Check your spam folder for verification emails</li>
              <li>• Contact support if you continue having issues</li>
            </ul>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-gray-600">
            Having trouble?{' '}
            <Link to="/contact" className="text-blue-600 hover:text-blue-700 font-medium">
              Contact Support
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};