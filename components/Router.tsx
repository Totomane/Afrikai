// src/components/Router.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from './context/authContext';
import { LoginPage } from '../pages/auth/LoginPage';
import { SignupPage } from '../pages/auth/SignupPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';
import { EmailVerificationPage } from '../pages/auth/EmailVerificationPage';
import { LandingPage } from './LandingPage';
import { MainApp } from './MainApp';
import { Loader2 } from 'lucide-react';

type Route = 'login' | 'signup' | 'forgot-password' | 'reset-password' | 'verify-email' | 'landing' | 'app' | 'home';

interface RouterProps {
  initialRoute?: Route;
}

export const Router: React.FC<RouterProps> = ({ initialRoute }) => {
  const { user, loading } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<Route>(initialRoute || 'home');
  const [routeParams, setRouteParams] = useState<Record<string, string>>({});
  const [showLandingPage, setShowLandingPage] = useState(true);

  useEffect(() => {
    // Parse URL and set initial route
    const path = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    
    if (path.includes('/login')) {
      setCurrentRoute('login');
    } else if (path.includes('/signup') || path.includes('/register')) {
      setCurrentRoute('signup');
    } else if (path.includes('/forgot-password')) {
      setCurrentRoute('forgot-password');
    } else if (path.includes('/reset-password/')) {
      setCurrentRoute('reset-password');
      const token = path.split('/reset-password/')[1];
      setRouteParams({ token });
    } else if (path.includes('/verify-email/') || path.includes('/email-verification/')) {
      setCurrentRoute('verify-email');
      const token = path.split('/verify-email/')[1] || path.split('/email-verification/')[1];
      setRouteParams({ token });
    } else if (path.includes('/app')) {
      setCurrentRoute('app');
    } else if (path.includes('/landing')) {
      setCurrentRoute('landing');
    }

    // Listen for browser navigation
    const handlePopState = () => {
      window.location.reload(); // Simple approach - reload on back/forward
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (route: Route, params?: Record<string, string>) => {
    setCurrentRoute(route);
    setRouteParams(params || {});
    
    // Update URL
    let path = '/';
    switch (route) {
      case 'login':
        path = '/login';
        break;
      case 'signup':
        path = '/signup';
        break;
      case 'forgot-password':
        path = '/forgot-password';
        break;
      case 'reset-password':
        path = `/reset-password/${params?.token || ''}`;
        break;
      case 'verify-email':
        path = `/verify-email/${params?.token || ''}`;
        break;
      case 'app':
        path = '/app';
        break;
      case 'landing':
        path = '/landing';
        break;
    }
    
    window.history.pushState({}, '', path);
  };

  // Add navigate function to window for components to use
  useEffect(() => {
    (window as any).navigate = navigate;
  }, []);

  // Show loading screen while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleGetStarted = () => {
    if (user) {
      navigate('app');
    } else {
      navigate('app'); // Changed: go to app even if not authenticated
    }
  };

  // Auto-redirect logic - only redirect auth pages when already logged in
  if (user && ['login', 'signup', 'forgot-password'].includes(currentRoute)) {
    navigate('app');
    return null;
  }

  // Removed: Don't redirect to landing when not authenticated

  // Render current route
  switch (currentRoute) {
    case 'login':
      return <LoginPage />;
    case 'signup':
      return <SignupPage />;
    case 'forgot-password':
      return <ForgotPasswordPage />;
    case 'reset-password':
      return <ResetPasswordPage token={routeParams.token} />;
    case 'verify-email':
      return <EmailVerificationPage token={routeParams.token} />;
    case 'landing':
      return <LandingPage onGetStarted={handleGetStarted} />;
    case 'app':
      return <MainApp />;
    default:
      // Default home - always go to app
      navigate('app');
      return null;
  }
};