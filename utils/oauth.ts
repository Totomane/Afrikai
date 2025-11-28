// src/utils/oauth.ts

/**
 * OAuth utilities for tab-based OAuth flow
 */

/**
 * Check if current URL contains OAuth return parameters
 */
export const isOAuthReturn = (): boolean => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.has('oauth_success') || urlParams.has('oauth_error');
};

/**
 * Get OAuth return data from URL parameters
 */
export interface OAuthReturnData {
  success: boolean;
  provider?: string;
  error?: string;
}

export const getOAuthReturnData = (): OAuthReturnData | null => {
  const urlParams = new URLSearchParams(window.location.search);
  const oauthSuccess = urlParams.get('oauth_success');
  const oauthError = urlParams.get('oauth_error');
  const oauthProvider = urlParams.get('oauth_provider');
  
  if (oauthSuccess || oauthError) {
    return {
      success: oauthSuccess === 'true',
      provider: oauthProvider || undefined,
      error: oauthError || undefined
    };
  }
  
  return null;
};

/**
 * Clear OAuth parameters from URL
 */
export const clearOAuthParams = (): void => {
  const url = new URL(window.location.href);
  const paramsToRemove = ['oauth_success', 'oauth_error', 'oauth_provider'];
  
  let hasChanges = false;
  paramsToRemove.forEach(param => {
    if (url.searchParams.has(param)) {
      url.searchParams.delete(param);
      hasChanges = true;
    }
  });
  
  if (hasChanges) {
    window.history.replaceState({}, document.title, url.toString());
  }
};

/**
 * Store OAuth state for tracking purposes
 */
export interface OAuthState {
  provider: string;
  startTime: string;
  returnUrl: string;
}

export const storeOAuthState = (provider: string, returnUrl: string): void => {
  const oauthState: OAuthState = {
    provider: provider.toLowerCase(),
    startTime: new Date().toISOString(),
    returnUrl: returnUrl
  };
  
  sessionStorage.setItem('oauth_state', JSON.stringify(oauthState));
};

export const getOAuthState = (): OAuthState | null => {
  const storedState = sessionStorage.getItem('oauth_state');
  if (storedState) {
    try {
      return JSON.parse(storedState);
    } catch (e) {
      console.error('[OAuth:Utils] Failed to parse stored OAuth state:', e);
    }
  }
  return null;
};

export const clearOAuthState = (): void => {
  sessionStorage.removeItem('oauth_state');
};

/**
 * Generate OAuth redirect URL with return parameters
 */
export const generateOAuthUrl = (provider: string, baseUrl: string, returnUrl?: string): string => {
  const normalizedProvider = provider.toLowerCase();
  const currentUrl = returnUrl || window.location.href;
  const encodedReturnUrl = encodeURIComponent(currentUrl);
  
  return `${baseUrl}/oauth/${normalizedProvider}/start/?return_url=${encodedReturnUrl}`;
};