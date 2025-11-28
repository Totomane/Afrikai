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
        // Fetch CSRF token
        console.log('[AuthContext:Init] CSRF_TOKEN: Fetching from backend');
        const token = await fetchCSRFToken();
        setCSRFToken(token);

        // Load current user
        console.log('[AuthContext:Init] USER_DATA: Fetching current user');
        const data = await fetchCurrentUser();
        if (data.authenticated && data.user) {
          console.log('[AuthContext:Init] USER_AUTHENTICATED:', {
            userId: data.user.id,
            username: data.user.username
          });
          setUser(data.user);
          // Load connected providers if user is authenticated
          console.log('[AuthContext:Init] PROVIDERS: Loading connected accounts');
          await loadConnectedProviders();
        } else {
          console.log('[AuthContext:Init] USER_NOT_AUTHENTICATED');
          setUser(null);
        }
      } catch (err) {
        console.error('[AuthContext:Init] INITIALIZATION_ERROR:', err);
        setUser(null);
      } finally {
        console.log('[AuthContext:Init] COMPLETE: Initialization finished');
        setLoading(false);
      }
    };
    init();
  }, []);

  const loadConnectedProviders = useCallback(async () => {
    console.log(`[AuthContext] LOADING_PROVIDERS: Starting connected accounts refresh`);
    console.log(`[AuthContext] CURRENT_STATE:`, {
      userLoggedIn: !!user,
      userId: user?.id,
      currentProviders: connectedProviders
    });
    
    try {
      const providers = await fetchConnectedAccounts();
      
      console.log(`[AuthContext] PROVIDERS_LOADED: Backend response received`);
      console.log(`[AuthContext] PROVIDER_COMPARISON:`, {
        before: connectedProviders,
        after: providers,
        changed: JSON.stringify(connectedProviders.sort()) !== JSON.stringify(providers.sort())
      });
      
      setConnectedProviders(providers);
      console.log(`[AuthContext] STATE_UPDATED: Connected providers state synchronized`);
    } catch (err) {
      console.error('[AuthContext] LOAD_ERROR: Failed to fetch connected accounts');
      console.error('[AuthContext] ERROR_DETAILS:', err);
    }
  }, [user, connectedProviders]);

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
    console.log(`[AuthContext:Connect:${provider}] STARTING: New tab OAuth connection flow`);
    console.log(`[AuthContext:Connect:${provider}] PRE_STATE:`, {
      userAuthenticated: !!user,
      currentProviders: connectedProviders,
      alreadyConnected: connectedProviders.includes(provider.toLowerCase()),
      csrfTokenAvailable: !!csrfToken
    });
    
    if (connectedProviders.includes(provider.toLowerCase())) {
      console.log(`[AuthContext:Connect:${provider}] ALREADY_CONNECTED: Provider already in connected list`);
      return false;
    }
    
    try {
      console.log(`[AuthContext:Connect:${provider}] FLOW_START: Initiating OAuth new tab flow`);
      console.log(`[AuthContext:Connect:${provider}] TAB_NOTICE: OAuth will open in new tab`);
      
      // Note: startOAuthFlow now opens a new tab and waits for postMessage
      const success = await startOAuthFlow(provider);
      
      if (success) {
        console.log(`[AuthContext:Connect:${provider}] FLOW_SUCCESS: OAuth new tab flow completed successfully`);
        console.log(`[AuthContext:Connect:${provider}] SYNC_START: Refreshing connected accounts from backend`);
        
        // Refresh connected accounts from backend
        await fetchConnectedAccounts().then(providers => {
          console.log(`[AuthContext:Connect:${provider}] SYNC_COMPLETE: Accounts synchronized`);
          console.log(`[AuthContext:Connect:${provider}] UPDATED_PROVIDERS:`, providers);
          console.log(`[AuthContext:Connect:${provider}] CONNECTION_VERIFIED:`, providers.includes(provider.toLowerCase()));
          setConnectedProviders(providers);
        });
      } else {
        console.log(`[AuthContext:Connect:${provider}] FLOW_FAILED: OAuth new tab flow did not complete successfully`);
        console.log(`[AuthContext:Connect:${provider}] POSSIBLE_CAUSES: User cancelled, tab blocked, network error, or backend issues`);
        console.error(`[AuthContext:Connect:${provider}] CONNECTION_FAILED`);
      }
      return success;
    } catch (error) {
      console.error(`[AuthContext:Connect:${provider}] FLOW_ERROR: Exception during OAuth connection`);
      console.error(`[AuthContext:Connect:${provider}] ERROR_DETAILS:`, error);
      console.error(`[AuthContext:Connect:${provider}] CONNECTION_FAILED: Unexpected error`);
      return false;
    }
  };

  const disconnectOAuthProvider = async (provider: string): Promise<boolean> => {
    console.log(`[AuthContext:Disconnect:${provider}] STARTING: OAuth disconnection flow`);
    console.log(`[AuthContext:Disconnect:${provider}] PRE_STATE:`, {
      userAuthenticated: !!user,
      currentProviders: connectedProviders,
      isCurrentlyConnected: connectedProviders.includes(provider.toLowerCase()),
      csrfTokenAvailable: !!csrfToken
    });
    
    if (!connectedProviders.includes(provider.toLowerCase())) {
      console.log(`[AuthContext:Disconnect:${provider}] NOT_CONNECTED: Provider not in connected list`);
      return false;
    }
    
    if (!csrfToken) {
      console.log(`[AuthContext:Disconnect:${provider}] TOKEN_MISSING: Refreshing CSRF token`);
      await refreshCSRFToken();
    }
    
    if (!csrfToken) {
      console.error(`[AuthContext:Disconnect:${provider}] TOKEN_ERROR: Failed to obtain CSRF token`);
      console.error(`[AuthContext:Disconnect:${provider}] REQUIRED: CSRF token needed for disconnect request`);
      return false;
    }

    console.log(`[AuthContext:Disconnect:${provider}] TOKEN_READY: CSRF token available for request`);

    try {
      console.log(`[AuthContext:Disconnect:${provider}] REQUEST_START: Sending disconnect request to backend`);
      const success = await disconnectAccount(provider, csrfToken);
      
      if (success) {
        console.log(`[AuthContext:Disconnect:${provider}] REQUEST_SUCCESS: Backend confirmed disconnection`);
        console.log(`[AuthContext:Disconnect:${provider}] SYNC_START: Refreshing connected accounts list`);
        await loadConnectedProviders();
        console.log(`[AuthContext:Disconnect:${provider}] SYNC_COMPLETE: Account list synchronized`);
      } else {
        console.log(`[AuthContext:Disconnect:${provider}] REQUEST_FAILED: Backend returned failure`);
        console.log(`[AuthContext:Disconnect:${provider}] POSSIBLE_CAUSES: Account not found, permission error, or backend issues`);
      }
      return success;
    } catch (error) {
      console.error(`[AuthContext:Disconnect:${provider}] REQUEST_ERROR: Exception during disconnect request`);
      console.error(`[AuthContext:Disconnect:${provider}] ERROR_DETAILS:`, error);
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
