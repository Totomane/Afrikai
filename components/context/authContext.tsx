// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  AuthUser, 
  login as apiLogin, 
  logout as apiLogout, 
  register as apiRegister, 
  fetchCurrentUser,
  fetchCSRFToken,
  requestPasswordReset,
  confirmPasswordReset,
  startOAuthFlow,
  fetchConnectedAccounts,
  disconnectAccount,
  sendEmailVerification as apiSendEmailVerification
} from '../../services/authService';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  csrfToken: string | null;
  connectedProviders: string[];
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; message?: string }>;
  confirmResetPassword: (token: string, password: string) => Promise<{ success: boolean; message?: string }>;
  sendEmailVerification: () => Promise<{ success: boolean; message?: string }>;
  connectOAuthProvider: (provider: string) => Promise<boolean>;
  disconnectOAuthProvider: (provider: string) => Promise<boolean>;
  refreshConnectedProviders: () => Promise<void>;
  refreshCSRFToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [csrfToken, setCSRFToken] = useState<string | null>(null);
  const [connectedProviders, setConnectedProviders] = useState<string[]>([]);

  // Initialize CSRF token and load current user on mount
  useEffect(() => {
    const init = async () => {
      try {
        // Fetch CSRF token first
        const token = await fetchCSRFToken();
        setCSRFToken(token);

        // Load current user
        const data = await fetchCurrentUser();
        if (data.authenticated && data.user) {
          setUser(data.user);
          // Load connected providers if user is authenticated
          await loadConnectedProviders();
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Failed to initialize auth context', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const loadConnectedProviders = useCallback(async () => {
    try {
      const providers = await fetchConnectedAccounts();
      setConnectedProviders(providers);
    } catch (err) {
      console.error('Failed to load connected providers', err);
    }
  }, []);

  const refreshCSRFToken = useCallback(async () => {
    const token = await fetchCSRFToken();
    setCSRFToken(token);
  }, []);

  const refreshConnectedProviders = useCallback(async () => {
    await loadConnectedProviders();
  }, []);

  const handleLogin = async (username: string, password: string) => {
    if (!csrfToken) {
      await refreshCSRFToken();
    }
    
    if (!csrfToken) {
      return { success: false, message: 'Unable to get security token. Please try again.' };
    }

    const res = await apiLogin(username, password, csrfToken);
    if (res.success && res.user) {
      setUser(res.user);
      await loadConnectedProviders();
      return { success: true };
    } else {
      return { success: false, message: res.message || 'Login failed' };
    }
  };

  const handleRegister = async (username: string, email: string, password: string) => {
    if (!csrfToken) {
      await refreshCSRFToken();
    }
    
    if (!csrfToken) {
      return { success: false, message: 'Unable to get security token. Please try again.' };
    }

    const res = await apiRegister(username, email, password, csrfToken);
    if (res.success && res.user) {
      setUser(res.user);
      await loadConnectedProviders();
      return { success: true };
    } else {
      return { success: false, message: res.message || 'Registration failed' };
    }
  };

  const handleLogout = async () => {
    if (!csrfToken) {
      await refreshCSRFToken();
    }
    
    if (csrfToken) {
      await apiLogout(csrfToken);
    }
    
    setUser(null);
    setConnectedProviders([]);
    // Refresh CSRF token for next session
    await refreshCSRFToken();
  };

  const resetPassword = async (email: string) => {
    if (!csrfToken) {
      await refreshCSRFToken();
    }
    
    if (!csrfToken) {
      return { success: false, message: 'Unable to get security token. Please try again.' };
    }

    const res = await requestPasswordReset(email, csrfToken);
    return { success: res.success, message: res.message };
  };

  const confirmResetPassword = async (token: string, password: string) => {
    if (!csrfToken) {
      await refreshCSRFToken();
    }
    
    if (!csrfToken) {
      return { success: false, message: 'Unable to get security token. Please try again.' };
    }

    const res = await confirmPasswordReset(token, password, csrfToken);
    return { success: res.success, message: res.message };
  };

  const connectOAuthProvider = async (provider: string): Promise<boolean> => {
    try {
      const success = await startOAuthFlow(provider);
      if (success) {
        await loadConnectedProviders();
      }
      return success;
    } catch (error) {
      console.error(`Failed to connect ${provider}:`, error);
      return false;
    }
  };

  const disconnectOAuthProvider = async (provider: string): Promise<boolean> => {
    if (!csrfToken) {
      await refreshCSRFToken();
    }
    
    if (!csrfToken) {
      return false;
    }

    try {
      const success = await disconnectAccount(provider, csrfToken);
      if (success) {
        await loadConnectedProviders();
      }
      return success;
    } catch (error) {
      console.error(`Failed to disconnect ${provider}:`, error);
      return false;
    }
  };

  const sendEmailVerification = async () => {
    if (!csrfToken) {
      await refreshCSRFToken();
    }
    
    if (!csrfToken) {
      return { success: false, message: 'Unable to get security token. Please try again.' };
    }

    const res = await apiSendEmailVerification(csrfToken);
    return { success: res.success, message: res.message };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        csrfToken,
        connectedProviders,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        resetPassword,
        confirmResetPassword,
        sendEmailVerification,
        connectOAuthProvider,
        disconnectOAuthProvider,
        refreshConnectedProviders,
        refreshCSRFToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};
