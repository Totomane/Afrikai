/// <reference types="vite/client" />

// src/services/authService.ts
import { 
  generateOAuthUrl, 
  storeOAuthState, 
  getOAuthReturnData, 
  getOAuthState, 
  clearOAuthState, 
  clearOAuthParams 
} from '../utils/oauth';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface AuthUser {
  id: number;
  username: string;
  email?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: AuthUser;
}

export interface ConnectedAccount {
  provider: string;
  username?: string;
  email?: string;
  connectedAt: string;
  isActive: boolean;
}

/**
 * Fetch CSRF token from the backend
 */
export const fetchCSRFToken = async (): Promise<string | null> => {
  console.log('[CSRF] Fetching token from:', `${API_BASE}/api/auth/csrf/`);
  
  try {
    const res = await fetch(`${API_BASE}/api/auth/csrf/`, {
      method: 'GET',
      credentials: 'include',
    });
    
    if (!res.ok) {
      console.error('[CSRF] Failed with status:', res.status);
      throw new Error(`Failed to fetch CSRF token: ${res.status}`);
    }
    
    const data = await res.json();
    console.log('[CSRF] Token received:', !!data.csrfToken);
    
    return data.csrfToken;
  } catch (error) {
    console.error('[CSRF] Error:', error);
    return null;
  }
};

/**
 * Make a POST request with CSRF token
 */
const makeAuthenticatedRequest = async (
  url: string,
  body: any,
  csrfToken: string
): Promise<Response> => {
  console.log('[REQUEST] POST to:', url);
  console.log('[REQUEST] Body:', {
    ...body,
    password: body.password ? '[HIDDEN]' : undefined
  });
  
  return fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken,
    },
    body: JSON.stringify(body),
  });
};

export const register = async (
  username: string,
  email: string,
  password: string,
  csrfToken: string
): Promise<AuthResponse> => {
  console.log('[REGISTER] Starting registration for:', username, email);
  
  try {
    const requestBody = { username, email, password };
    
    const res = await makeAuthenticatedRequest(
      `${API_BASE}/api/auth/register/`,
      requestBody,
      csrfToken
    );
    
    console.log('[REGISTER] Response status:', res.status);
    
    const responseData = await res.json();
    console.log('[REGISTER] Response:', responseData);
    
    return responseData;
  } catch (error) {
    console.error('[REGISTER] Error:', error);
    if (error instanceof TypeError) {
      console.error('[REGISTER] Network error - check if backend is running');
    }
    return { success: false, message: 'Registration failed. Please try again.' };
  }
};

export const login = async (
  username: string,
  password: string,
  csrfToken: string
): Promise<AuthResponse> => {
  console.log('[LOGIN] Attempting login for:', username);
  
  try {
    const requestBody = { username, password };
    
    const res = await makeAuthenticatedRequest(
      `${API_BASE}/api/auth/login/`,
      requestBody,
      csrfToken
    );
    
    console.log('[LOGIN] Response status:', res.status);
    
    const responseData = await res.json();
    console.log('[LOGIN] Response:', responseData);
    
    return responseData;
  } catch (error) {
    console.error('[LOGIN] Error:', error);
    if (error instanceof TypeError) {
      console.error('[LOGIN] Network error - check if backend is running');
    }
    return { success: false, message: 'Login failed. Please try again.' };
  }
};

export const logout = async (csrfToken: string): Promise<AuthResponse> => {
  try {
    const res = await fetch(`${API_BASE}/api/auth/logout/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'X-CSRFToken': csrfToken,
      },
    });
    return res.json();
  } catch (error) {
    console.error('Logout failed:', error);
    return { success: false, message: 'Logout failed. Please try again.' };
  }
};

export const fetchCurrentUser = async (): Promise<{ authenticated: boolean; user: AuthUser | null }> => {
  try {
    const res = await fetch(`${API_BASE}/api/auth/me/`, {
      method: 'GET',
      credentials: 'include',
    });
    
    if (!res.ok) {
      console.log('Auth API not responding or error:', res.status);
      return { authenticated: false, user: null };
    }
    
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch current user:', error);
    return { authenticated: false, user: null };
  }
};

/**
 * Request password reset
 */
export const requestPasswordReset = async (
  email: string,
  csrfToken: string
): Promise<AuthResponse> => {
  try {
    const res = await makeAuthenticatedRequest(
      `${API_BASE}/api/auth/password/reset/`,
      { email },
      csrfToken
    );
    return res.json();
  } catch (error) {
    console.error('Password reset request failed:', error);
    return { success: false, message: 'Password reset request failed. Please try again.' };
  }
};

/**
 * Confirm password reset
 */
export const confirmPasswordReset = async (
  token: string,
  password: string,
  csrfToken: string
): Promise<AuthResponse> => {
  try {
    const res = await makeAuthenticatedRequest(
      `${API_BASE}/api/auth/password/reset/confirm/${token}/`,
      { password },
      csrfToken
    );
    return res.json();
  } catch (error) {
    console.error('Password reset confirmation failed:', error);
    return { success: false, message: 'Password reset failed. Please try again.' };
  }
};

/**
 * Start OAuth flow using new tab
 */
export const startOAuthFlow = (provider: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const BACKEND_ORIGIN = "http://localhost:8000";
    const normalizedProvider = provider.toLowerCase();
    const currentUrl = window.location.href;
    const authUrl = generateOAuthUrl(provider, API_BASE, currentUrl);
    
    console.log(`[OAuth:${provider}] STARTING: New tab OAuth flow`);
    console.log(`[OAuth:${provider}] REQUEST_DETAILS:`, {
      provider: provider,
      normalizedProvider: normalizedProvider,
      authUrl: authUrl,
      currentUrl: currentUrl,
      backendOrigin: BACKEND_ORIGIN
    });

    // Store OAuth state for tracking
    console.log(`[OAuth:${provider}] STATE_STORED: Saving OAuth state to sessionStorage`);
    storeOAuthState(provider, currentUrl);
    
    console.log(`[OAuth:${provider}] NEW_TAB: Opening OAuth in new tab`);
    console.log(`[OAuth:${provider}] TAB_URL:`, authUrl);
    
    // Open OAuth in new tab within same window
    let oauthTab: Window | null = null;
    
    console.log(`[OAuth:${provider}] NEW_TAB: Opening OAuth in new browser tab`);
    
    // Use _blank target to open in new tab (not popup window)
    oauthTab = window.open(authUrl, '_blank');
    
    if (!oauthTab) {
      // Fallback: try with noopener=no to ensure it opens as tab
      console.log(`[OAuth:${provider}] FALLBACK: Trying with noopener settings`);
      oauthTab = window.open(authUrl, '_blank', 'noopener=no,noreferrer=no');
    }
    
    if (!oauthTab) {
      console.error(`[OAuth:${provider}] TAB_BLOCKED: Failed to open new tab`);
      console.error(`[OAuth:${provider}] REQUIRED: User must allow new tabs for OAuth to work`);
      console.error(`[OAuth:${provider}] TROUBLESHOOT: Check browser settings or try Ctrl+Click`);
      clearOAuthState();
      resolve(false);
      return;
    }
    
    console.log(`[OAuth:${provider}] TAB_OPENED: New tab created successfully`);
    
    // Additional check to ensure tab actually opened
    setTimeout(() => {
      if (oauthTab.closed) {
        console.error(`[OAuth:${provider}] TAB_CLOSED_IMMEDIATELY: Tab was closed right after opening`);
        console.error(`[OAuth:${provider}] POSSIBLE_CAUSE: Browser blocked new tab or user closed it`);
        clearOAuthState();
        if (!resolved) {
          resolved = true;
          resolve(false);
        }
        return;
      }
      console.log(`[OAuth:${provider}] TAB_CONFIRMED: New tab is active and ready`);
    }, 100);
    
    console.log(`[OAuth:${provider}] WAITING: Monitoring new tab for OAuth completion`);
    console.log(`[OAuth:${provider}] LISTENING_FOR: Messages from ${BACKEND_ORIGIN}`);
    console.log(`[OAuth:${provider}] USER_ACTION: Complete OAuth in the new tab, then return here`);
    
    let messageReceived = false;
    let resolved = false;
    const originalUrl = window.location.href;
    
    // Check if current window redirected (which means new tab failed)
    const redirectCheck = setInterval(() => {
      if (window.location.href !== originalUrl) {
        console.error(`[OAuth:${provider}] SAME_TAB_REDIRECT: OAuth opened in same tab instead of new tab`);
        console.error(`[OAuth:${provider}] URL_CHANGED: From ${originalUrl} to ${window.location.href}`);
        clearInterval(redirectCheck);
        clearOAuthState();
        if (!resolved) {
          resolved = true;
          resolve(false);
        }
      }
    }, 500);
    
    const messageHandler = (event: MessageEvent) => {
      // Validate origin
      if (event.origin !== BACKEND_ORIGIN) {
        console.log(`[OAuth:${provider}] ORIGIN_MISMATCH: Ignoring message from ${event.origin} (expected: ${BACKEND_ORIGIN})`);
        return;
      }
      
      console.log(`[OAuth:${provider}] MESSAGE_RECEIVED:`, {
        messageType: event.data?.type || 'legacy_format',
        messageProvider: event.data?.provider || 'not_specified',
        messageOrigin: event.origin,
        fullMessageData: event.data,
        timestamp: new Date().toISOString()
      });
      
      // Only process messages for this specific provider
      if (event.data?.provider && event.data.provider !== normalizedProvider) {
        console.log(`[OAuth:${provider}] PROVIDER_MISMATCH: Ignoring message for ${event.data.provider} (expected: ${normalizedProvider})`);
        return;
      }
      
      messageReceived = true;
      console.log(`[OAuth:${provider}] MESSAGE_ACCEPTED: Processing ${event.data?.type || 'legacy'} message`);
      
      // Handle structured messages
      if (event.data?.type === "oauth-success") {
        if (!resolved) {
          console.log(`[OAuth:${provider}] SUCCESS: OAuth completed successfully`);
          console.log(`[OAuth:${provider}] RESPONSE_DATA:`, event.data?.data || 'no_additional_data');
          resolved = true;
          cleanup();
          oauthTab?.close();
          resolve(true);
        } else {
          console.log(`[OAuth:${provider}] DUPLICATE_SUCCESS: Already resolved, ignoring`);
        }
      } else if (event.data?.type === "oauth-error" || event.data?.type === "oauth-cancel") {
        if (!resolved) {
          console.log(`[OAuth:${provider}] FAILURE: ${event.data.type}`);
          console.log(`[OAuth:${provider}] ERROR_DETAILS:`, event.data?.error || 'no_error_details');
          console.error(`[OAuth:${provider}] CONNECTION_FAILED: ${event.data.type}`);
          resolved = true;
          cleanup();
          oauthTab?.close();
          resolve(false);
        } else {
          console.log(`[OAuth:${provider}] DUPLICATE_ERROR: Already resolved, ignoring`);
        }
      }
      // Legacy support for non-structured messages
      else if (event.data === "oauth-success") {
        if (!resolved) {
          console.log(`[OAuth:${provider}] SUCCESS: OAuth completed (legacy message format)`);
          console.log(`[OAuth:${provider}] LEGACY_FORMAT: Backend using old postMessage format`);
          resolved = true;
          cleanup();
          oauthTab?.close();
          resolve(true);
        } else {
          console.log(`[OAuth:${provider}] DUPLICATE_LEGACY_SUCCESS: Already resolved, ignoring`);
        }
      } else if (event.data === "oauth-error" || event.data === "oauth-cancel") {
        if (!resolved) {
          console.log(`[OAuth:${provider}] FAILURE: ${event.data} (legacy message format)`);
          console.log(`[OAuth:${provider}] LEGACY_FORMAT: Backend using old postMessage format`);
          console.error(`[OAuth:${provider}] CONNECTION_FAILED: ${event.data}`);
          resolved = true;
          cleanup();
          oauthTab?.close();
          resolve(false);
        } else {
          console.log(`[OAuth:${provider}] DUPLICATE_LEGACY_ERROR: Already resolved, ignoring`);
        }
      } else {
        console.log(`[OAuth:${provider}] UNKNOWN_MESSAGE: Unrecognized message format`);
        console.log(`[OAuth:${provider}] RECEIVED_DATA:`, event.data);
        console.log(`[OAuth:${provider}] EXPECTED_FORMATS: oauth-success, oauth-error, oauth-cancel, or structured {type, provider, data}`);
      }
    };
    
    // Add message listener
    console.log(`[OAuth:${provider}] EVENT_LISTENER: Attached message handler`);
    window.addEventListener('message', messageHandler);
    
    // Monitor tab closure every 500ms
    console.log(`[OAuth:${provider}] TAB_MONITOR: Starting closure detection (500ms intervals)`);
    const tabCheck = setInterval(() => {
      if (oauthTab?.closed) {
        if (!messageReceived && !resolved) {
          console.log(`[OAuth:${provider}] TAB_CLOSED: User closed OAuth tab without completing authentication`);
          console.log(`[OAuth:${provider}] NO_MESSAGE: OAuth callback was not reached`);
          console.log(`[OAuth:${provider}] POSSIBLE_CAUSES: User cancelled, network error, or backend not responding`);
          console.error(`[OAuth:${provider}] CONNECTION_FAILED: OAuth tab closed without success message`);
          resolved = true;
          cleanup();
          resolve(false);
        } else if (resolved) {
          console.log(`[OAuth:${provider}] TAB_CLOSED: Normal closure after OAuth completion`);
        }
      }
    }, 500);
    
    // Timeout after 15 seconds
    console.log(`[OAuth:${provider}] TIMEOUT_SET: 15 seconds maximum wait time`);
    const timeout = setTimeout(() => {
      if (!resolved) {
        console.log(`[OAuth:${provider}] TIMEOUT: 15 second limit exceeded`);
        console.log(`[OAuth:${provider}] NO_RESPONSE: Backend did not send success/error message`);
        console.log(`[OAuth:${provider}] POSSIBLE_CAUSES: Network issues, backend down, or OAuth provider problems`);
        console.error(`[OAuth:${provider}] CONNECTION_FAILED: Timeout waiting for response`);
        resolved = true;
        cleanup();
        oauthTab?.close();
        resolve(false);
      } else {
        console.log(`[OAuth:${provider}] TIMEOUT_CLEARED: Already resolved before timeout`);
      }
    }, 15000);
    
    const cleanup = () => {
      console.log(`[OAuth:${provider}] CLEANUP: Removing event listeners and timers`);
      clearInterval(tabCheck);
      clearInterval(redirectCheck);
      clearTimeout(timeout);
      window.removeEventListener('message', messageHandler);
      clearOAuthState();
      console.log(`[OAuth:${provider}] CLEANUP_COMPLETE`);
    };
  });
};





/**
 * Expected backend integration for new tab OAuth flow:
 * 
 * The backend should:
 * 1. Accept return_url parameter in the OAuth start URL
 * 2. After OAuth completion, render a page that sends postMessage to opener window
 * 
 * SUCCESS postMessage:
 * window.opener.postMessage({
 *   type: 'oauth-success',
 *   provider: 'linkedin',
 *   data: { connected: true }
 * }, '*');
 * window.close();
 * 
 * ERROR postMessage:
 * window.opener.postMessage({
 *   type: 'oauth-error', 
 *   provider: 'linkedin',
 *   error: 'token_exchange_failed'
 * }, '*');
 * window.close();
 * 
 * LEGACY (still supported):
 * window.opener.postMessage('oauth-success', '*');
 * window.close();
 */

/**
 * Fetch connected OAuth providers
 */
export const fetchConnectedAccounts = async (): Promise<string[]> => {
  console.log('[OAuth:FetchAccounts] STARTING: Fetching connected accounts from backend');
  console.log('[OAuth:FetchAccounts] REQUEST_URL:', `${API_BASE}/api/oauth/connected-accounts/`);
  console.log('[OAuth:FetchAccounts] REQUEST_METHOD: GET with credentials');
  
  try {
    const response = await fetch(`${API_BASE}/api/oauth/connected-accounts/`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('[OAuth:FetchAccounts] RESPONSE_STATUS:', response.status);
    console.log('[OAuth:FetchAccounts] RESPONSE_OK:', response.ok);

    if (!response.ok) {
      console.error('[OAuth:FetchAccounts] HTTP_ERROR:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      });
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('[OAuth:FetchAccounts] RESPONSE_DATA:', data);
    
    if (data.success && data.accounts) {
      const activeAccounts = data.accounts.filter((account: ConnectedAccount) => account.isActive);
      const providers = activeAccounts.map((account: ConnectedAccount) => account.provider.toLowerCase());
      
      console.log('[OAuth:FetchAccounts] SUCCESS: Found accounts');
      console.log('[OAuth:FetchAccounts] TOTAL_ACCOUNTS:', data.accounts.length);
      console.log('[OAuth:FetchAccounts] ACTIVE_ACCOUNTS:', activeAccounts.length);
      console.log('[OAuth:FetchAccounts] ACTIVE_PROVIDERS:', providers);
      console.log('[OAuth:FetchAccounts] ACCOUNT_DETAILS:', activeAccounts.map(acc => ({
        provider: acc.provider,
        connectedAt: acc.connectedAt,
        username: acc.username,
        isActive: acc.isActive
      })));
      
      return providers;
    } else {
      console.log('[OAuth:FetchAccounts] NO_ACCOUNTS: Backend returned no accounts or success=false');
      console.log('[OAuth:FetchAccounts] RESPONSE_SUCCESS:', data.success);
      console.log('[OAuth:FetchAccounts] RESPONSE_ACCOUNTS:', data.accounts);
    }
    
    return [];
  } catch (error) {
    console.error('[OAuth:FetchAccounts] ERROR: Failed to fetch connected accounts');
    console.error('[OAuth:FetchAccounts] ERROR_DETAILS:', error);
    console.error('[OAuth:FetchAccounts] ERROR_TYPE:', error instanceof TypeError ? 'Network/CORS' : 'Other');
    return [];
  }
};

/**
 * Disconnect OAuth provider
 */
export const disconnectAccount = async (
  provider: string,
  csrfToken: string
): Promise<boolean> => {
  const normalizedProvider = provider.toLowerCase();
  const disconnectUrl = `${API_BASE}/api/oauth/disconnect/${normalizedProvider}/`;
  
  console.log(`[OAuth:Disconnect:${provider}] STARTING: Disconnect request`);
  console.log(`[OAuth:Disconnect:${provider}] REQUEST_URL:`, disconnectUrl);
  console.log(`[OAuth:Disconnect:${provider}] CSRF_TOKEN:`, csrfToken ? 'present' : 'missing');
  console.log(`[OAuth:Disconnect:${provider}] PROVIDER_NORMALIZED:`, normalizedProvider);
  
  try {
    const response = await fetch(disconnectUrl, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      },
    });

    console.log(`[OAuth:Disconnect:${provider}] RESPONSE_STATUS:`, response.status);
    console.log(`[OAuth:Disconnect:${provider}] RESPONSE_OK:`, response.ok);

    if (!response.ok) {
      console.error(`[OAuth:Disconnect:${provider}] HTTP_ERROR:`, {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      });
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[OAuth:Disconnect:${provider}] RESPONSE_DATA:`, data);
    
    if (data.success) {
      console.log(`[OAuth:Disconnect:${provider}] SUCCESS: Account disconnected`);
    } else {
      console.log(`[OAuth:Disconnect:${provider}] FAILED: Backend returned success=false`);
      console.log(`[OAuth:Disconnect:${provider}] FAILURE_MESSAGE:`, data.message || 'no_message_provided');
    }
    
    return data.success;
  } catch (error) {
    console.error(`[OAuth:Disconnect:${provider}] ERROR: Disconnect request failed`);
    console.error(`[OAuth:Disconnect:${provider}] ERROR_DETAILS:`, error);
    console.error(`[OAuth:Disconnect:${provider}] ERROR_TYPE:`, error instanceof TypeError ? 'Network/CORS' : 'Other');
    return false;
  }
};

/**
 * Send email verification
 */
export const sendEmailVerification = async (csrfToken: string): Promise<AuthResponse> => {
  try {
    const res = await fetch(`${API_BASE}/api/auth/email/send/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'X-CSRFToken': csrfToken,
      },
    });
    return res.json();
  } catch (error) {
    console.error('Email verification send failed:', error);
    return { success: false, message: 'Failed to send verification email. Please try again.' };
  }
};

/**
 * Verify email with token
 */
export const verifyEmail = async (token: string): Promise<AuthResponse> => {
  try {
    const res = await fetch(`${API_BASE}/api/auth/email/verify/${token}/`, {
      method: 'GET',
      credentials: 'include',
    });
    return res.json();
  } catch (error) {
    console.error('Email verification failed:', error);
    return { success: false, message: 'Email verification failed. Please try again.' };
  }
};
