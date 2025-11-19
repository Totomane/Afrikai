/**
 * OAuth Service for Social Media Authentication
 * 
 * This service handles OAuth authentication flows for social media platforms
 * including LinkedIn, YouTube, Spotify, and X (Twitter). It provides functions
 * to connect, disconnect, and manage social media account integrations.
 * 
 * Features:
 * - Secure OAuth popup flow management
 * - Account connection state persistence
 * - Token refresh capabilities
 * - Error handling and user feedback
 * 
 * @author Your Name
 * @version 1.0.0
 */

/**
 * Interface representing a connected social media account
 */
export interface ConnectedAccount {
  provider: string;      // The social media provider (linkedin, youtube, spotify, x)
  username?: string;     // Username on the platform (optional)
  email?: string;        // Email associated with the account (optional)
  connectedAt: string;   // ISO timestamp when the account was connected
  isActive: boolean;     // Whether the connection is currently active
}

/**
 * Standard response interface for OAuth API calls
 */
export interface OAuthResponse {
  success: boolean;               // Whether the operation was successful
  message: string;                // Human-readable message about the operation
  accounts?: ConnectedAccount[];  // Array of connected accounts (when applicable)
}

// Base API URL from environment variables, fallback to empty string for relative URLs
const API_BASE = import.meta.env.VITE_API_URL || '';

/**
 * Fetch all connected social accounts from the backend
 */
export const fetchConnectedAccounts = async (): Promise<string[]> => {
  console.log('[OAuth Service] Fetching connected accounts from backend...');
  console.log('[OAuth Service] API URL:', `${API_BASE}/api/oauth/connected-accounts/`);
  
  try {
    const response = await fetch(`${API_BASE}/api/oauth/connected-accounts/`, {
      method: 'GET',
      credentials: 'include', // Include cookies for authentication
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('[OAuth Service] Response status:', response.status);
    console.log('[OAuth Service] Response ok:', response.ok);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: OAuthResponse = await response.json();
    console.log('[OAuth Service] Raw response data:', data);
    
    if (data.success && data.accounts) {
      // Return array of provider names that are connected and active
      const activeAccounts = data.accounts.filter(account => account.isActive);
      console.log('[OAuth Service] Active accounts:', activeAccounts);
      
      const providerNames = activeAccounts.map(account => account.provider.toLowerCase());
      console.log('[OAuth Service] Returning provider names:', providerNames);
      
      return providerNames;
    }
    
    console.log('[OAuth Service] No success or accounts in response, returning empty array');
    return [];
  } catch (error) {
    console.error('[OAuth Service] Failed to fetch connected accounts:', error);
    return [];
  }
};

/**
 * Disconnect a social media account
 */
export const disconnectAccount = async (provider: string): Promise<boolean> => {
  const normalizedProvider = provider.toLowerCase();
  const disconnectUrl = `${API_BASE}/api/oauth/disconnect/${normalizedProvider}/`;
  
  console.log(`[OAuth Service] Disconnecting ${provider}`);
  console.log(`[OAuth Service] Disconnect URL:`, disconnectUrl);
  
  try {
    const response = await fetch(disconnectUrl, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(`[OAuth Service] Disconnect response status:`, response.status);
    console.log(`[OAuth Service] Disconnect response ok:`, response.ok);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: OAuthResponse = await response.json();
    console.log(`[OAuth Service] Disconnect response data:`, data);
    
    console.log(`[OAuth Service] Disconnect success for ${provider}:`, data.success);
    return data.success;
  } catch (error) {
    console.error(`[OAuth Service] Failed to disconnect ${provider}:`, error);
    return false;
  }
};

/**
 * Start OAuth flow for a provider
 */
export const startOAuthFlow = (platform: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const provider = platform.toLowerCase();
    const backendUrl = "http://localhost:8000"; // your Django backend
    const authUrl = `${backendUrl}/oauth/${provider}/start/`;
    
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
      
      if (event.origin !== window.location.origin) {
        console.log(`[OAuth Service] Message from different origin, ignoring`);
        return;
      }
      
      if (event.data?.type === "oauth-success" && event.data?.provider === provider) {
        console.log(`[OAuth Service] OAuth success message received for ${provider}`);
        window.removeEventListener("message", handler);
        popup?.close();
        resolve(true);
      }
    };
    window.addEventListener("message", handler);

    // fallback timeout
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        console.log(`[OAuth Service] Popup closed for ${provider}`);
        clearInterval(checkClosed);
        window.removeEventListener("message", handler);
        resolve(false);
      }
    }, 500);
    
    // Add a longer timeout to prevent hanging
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
 * Get account details for a specific provider
 */
export const getAccountDetails = async (provider: string): Promise<ConnectedAccount | null> => {
  try {
    const response = await fetch(`${API_BASE}/api/oauth/account/${provider.toLowerCase()}/`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null; // Account not connected
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.account || null;
  } catch (error) {
    console.error(`Failed to get account details for ${provider}:`, error);
    return null;
  }
};

/**
 * Refresh OAuth tokens for a provider (if needed)
 */
export const refreshTokens = async (provider: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/api/oauth/refresh/${provider.toLowerCase()}/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data: OAuthResponse = await response.json();
    return data.success;
  } catch (error) {
    console.error(`Failed to refresh tokens for ${provider}:`, error);
    return false;
  }
};