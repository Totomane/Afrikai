/// <reference types="vite/client" />

// src/services/authService.ts
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
 * Start OAuth flow using popup
 */
export const startOAuthFlow = (provider: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const authUrl = `${API_BASE}/oauth/${provider}/start/`;
    
    console.log(`[OAuth Service] Starting OAuth flow for ${provider}`);
    console.log(`[OAuth Service] Auth URL:`, authUrl);

    const popup = window.open(
      authUrl,
      `${provider}-auth`,
      "width=520,height=720"
    );

    if (!popup) {
      console.error('[OAuth Service] Failed to open popup window');
      resolve(false);
      return;
    }
    
    console.log(`[OAuth Service] Popup opened for ${provider}`);

    const handler = (event: MessageEvent) => {
      console.log(`[OAuth Service] Received message:`, event.data, 'from origin:', event.origin);
      
      if (event.data === "oauth-success") {
        console.log(`[OAuth Service] OAuth success message received for ${provider}`);
        window.removeEventListener("message", handler);
        popup?.close();
        resolve(true);
      }
    };
    window.addEventListener("message", handler);

    // Check if popup is closed
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        console.log(`[OAuth Service] Popup closed for ${provider}`);
        clearInterval(checkClosed);
        window.removeEventListener("message", handler);
        resolve(false);
      }
    }, 500);
    
    // Add timeout to prevent hanging
    setTimeout(() => {
      console.log(`[OAuth Service] OAuth timeout reached for ${provider}`);
      clearInterval(checkClosed);
      window.removeEventListener("message", handler);
      popup?.close();
      resolve(false);
    }, 300000); // 5 minutes
  });
};

/**
 * Fetch connected OAuth providers
 */
export const fetchConnectedAccounts = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${API_BASE}/api/oauth/connected-accounts/`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success && data.accounts) {
      const activeAccounts = data.accounts.filter((account: ConnectedAccount) => account.isActive);
      return activeAccounts.map((account: ConnectedAccount) => account.provider.toLowerCase());
    }
    
    return [];
  } catch (error) {
    console.error('[OAuth Service] Failed to fetch connected accounts:', error);
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
  try {
    const response = await fetch(`${API_BASE}/api/oauth/disconnect/${provider.toLowerCase()}/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error(`[OAuth Service] Failed to disconnect ${provider}:`, error);
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
